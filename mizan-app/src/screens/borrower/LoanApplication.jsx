import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp,
  Lock, Phone, Search, Shield, Users, Star, AlertTriangle,
  Clock, DollarSign, Home, Heart, BookOpen, Zap, Utensils,
  Briefcase, X,
} from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'
import {
  assignTier, computeNeedScore, computeVouchScore,
  computeFeasibility, computeDecision,
} from '../../utils/algorithms'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_LABELS = ['Request', 'Amount', 'Financial', 'Identity', 'Community', 'Review']

const PURPOSE_OPTIONS = [
  { key: 'car_repair', label: 'Transportation', emoji: '\uD83D\uDE97', example: 'Car repair, bus pass, etc.' },
  { key: 'medical', label: 'Medical', emoji: '\uD83C\uDFE5', example: 'Copays, prescriptions, ER bills' },
  { key: 'rent', label: 'Rent / Housing', emoji: '\uD83C\uDFE0', example: 'Behind on rent, deposit' },
  { key: 'tuition', label: 'Education / Tuition', emoji: '\uD83C\uDF93', example: 'Tuition, books, supplies' },
  { key: 'utility', label: 'Utilities', emoji: '\u26A1', example: 'Electric, gas, water bills' },
  { key: 'food', label: 'Food & Groceries', emoji: '\uD83C\uDF4E', example: 'Weekly groceries, baby food' },
  { key: 'funeral', label: 'Funeral expenses', emoji: '\uD83D\uDD4C', example: 'Janazah, burial costs' },
  { key: 'other', label: 'Other', emoji: '\uD83D\uDCCB', example: 'Something not listed above' },
]

const PURPOSE_PLACEHOLDERS = {
  car_repair: 'e.g. My car needs a new transmission to get to work...',
  medical: 'e.g. I have an upcoming surgery and need to cover the copay...',
  rent: 'e.g. I fell behind on rent after losing hours at work...',
  tuition: 'e.g. I need to cover this semester\'s tuition balance...',
  utility: 'e.g. My electricity is about to be shut off...',
  food: 'e.g. I need help covering groceries for my family this month...',
  funeral: 'e.g. A family member passed and we need help with burial costs...',
  other: 'Describe what you need help with...',
}

const URGENCY_OPTIONS = [
  { key: 'emergency', label: 'Emergency', color: '#f87171', desc: 'Need funds within 24-48 hours' },
  { key: 'high', label: 'High', color: '#fbbf24', desc: 'Need funds this week' },
  { key: 'medium', label: 'Medium', color: 'var(--text-secondary)', desc: 'Need funds within 2 weeks' },
  { key: 'planning', label: 'Planning ahead', color: '#9ca3af', desc: 'Need funds within a month' },
]

const AMOUNT_CHIPS = [100, 250, 500, 1000, 2000]

const FREQUENCY_OPTIONS = ['Weekly', 'Bi-weekly', 'Monthly']
const START_OPTIONS = [
  { key: 'as_soon', label: 'As soon as funded' },
  { key: 'two_weeks', label: 'In 2 weeks' },
  { key: 'next_month', label: 'Next month' },
]

const EMPLOYMENT_OPTIONS = [
  'Employed full-time', 'Part-time', 'Self-employed',
  'Student', 'Between jobs', 'Retired', 'Prefer not to say',
]

const MOSQUES = [
  'Islamic Center of America, Dearborn, MI',
  'Dar al-Hijrah Islamic Center, Falls Church, VA',
  'Islamic Society of North America (ISNA), Plainfield, IN',
  'Masjid Al-Rahmah, Baltimore, MD',
  'Islamic Center of Southern California, Los Angeles, CA',
  'Masjid Muhammad, Washington, DC',
  'Islamic Community Center of Phoenix, AZ',
  'UT Austin MSA, Austin, TX',
  'Islamic Center of Cleveland, OH',
  'Masjid Al-Farooq, Atlanta, GA',
  'Islamic Foundation of Villa Park, IL',
  'Muslim Community Association, Santa Clara, CA',
  'Masjid Omar ibn Al-Khattab, Los Angeles, CA',
  'Islamic Society of Greater Houston, TX',
  'Masjid Al-Huda, Brooklyn, NY',
]

const TENURE_OPTIONS = [
  { key: 'short', label: '< 6 months' },
  { key: 'medium', label: '6 months \u2013 2 years' },
  { key: 'long', label: '2+ years' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActiveLoanBlock({ activeLoan, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}
    >
      <AlertTriangle size={48} style={{ color: 'var(--status-amber)', marginBottom: 24 }} />
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12,
      }}>
        You already have an active loan
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'var(--text-secondary)',
        lineHeight: 1.6, marginBottom: 32,
      }}>
        Your current ${activeLoan.amount} {activeLoan.purpose} loan has ${activeLoan.remaining} remaining.
        You can apply for a new loan once your current one is repaid.
      </p>
      <button
        onClick={() => navigate('/borrower/home')}
        style={{
          padding: '14px 32px', background: 'var(--teal-mid)', color: 'var(--text-inverse)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Back to dashboard
      </button>
    </motion.div>
  )
}

function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '24px 16px 8px',
    }}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const completed = step < currentStep
        const current = step === currentStep
        const lineCompleted = step < currentStep
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 56 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: completed ? 'var(--teal-mid)' : current ? 'transparent' : 'var(--bg-elevated)',
                border: current ? '2px solid var(--teal-mid)' : completed ? 'none' : '1px solid var(--border-default)',
                color: completed ? 'var(--text-inverse)' : current ? 'var(--teal-mid)' : 'var(--text-tertiary)',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                animation: current ? 'pulse 2s ease-in-out infinite' : 'none',
                boxShadow: current ? '0 0 0 4px rgba(74, 173, 164, 0.15)' : 'none',
              }}>
                {completed ? <Check size={16} /> : step}
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: current ? 600 : 400,
                color: current ? 'var(--teal-mid)' : completed ? 'var(--text-secondary)' : 'var(--text-tertiary)',
              }}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div style={{
                flex: 1, height: 2, alignSelf: 'flex-start', marginTop: 16,
                background: lineCompleted ? 'var(--teal-mid)' : 'var(--border-subtle)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        )
      })}
      <style>{`@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 4px rgba(74,173,164,0.15); } 50% { box-shadow: 0 0 0 8px rgba(74,173,164,0.08); } }`}</style>
    </div>
  )
}

function StepNav({ onBack, onNext, nextLabel, nextDisabled, showBack }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
      {showBack && (
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: '14px 24px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          flex: showBack ? 2 : 1, padding: '14px 24px',
          background: nextDisabled ? 'var(--bg-overlay)' : 'var(--teal-mid)',
          color: nextDisabled ? 'var(--text-tertiary)' : 'var(--text-inverse)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          opacity: nextDisabled ? 0.6 : 1,
          transition: 'all var(--transition-base)',
        }}
      >
        {nextLabel || 'Continue'} <ArrowRight size={16} />
      </button>
    </div>
  )
}

function NumberInput({ value, onChange, placeholder, fontSize, prefix, style: extraStyle }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...extraStyle }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: 16,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: fontSize || 20, color: 'var(--text-tertiary)', pointerEvents: 'none',
        }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
        style={{
          width: '100%', padding: prefix ? '12px 16px 12px 36px' : '12px 16px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: fontSize || 20, fontWeight: 500,
          outline: 'none', transition: 'border-color var(--transition-base)',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
      />
    </div>
  )
}

function Stepper({ label, value, onChange, min, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14,
        color: 'var(--text-secondary)', minWidth: 100,
      }}>{label}</span>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          color: value <= min ? 'var(--text-tertiary)' : 'var(--text-primary)',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}
      >
        -
      </button>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 600,
        color: 'var(--text-primary)', minWidth: 32, textAlign: 'center',
      }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          color: value >= max ? 'var(--text-tertiary)' : 'var(--text-primary)',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}
      >
        +
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LoanApplication() {
  const navigate = useNavigate()
  const {
    loanDraft, updateDraft, clearDraft, activeLoan,
    setApplicationStage, setSubmittedApplication, setPendingDecision,
    draftMonthlyExpenses, applicationStage,
  } = useBorrower()

  const [currentStep, setCurrentStep] = useState(loanDraft?.currentStep || 1)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [direction, setDirection] = useState(1)
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)
  const [mosqueSearch, setMosqueSearch] = useState('')

  // Persist step to draft
  useEffect(() => {
    if (loanDraft) updateDraft({ currentStep })
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no draft (but NOT if we just submitted — applicationStage would be 'review')
  useEffect(() => {
    if (!loanDraft && applicationStage !== 'review' && applicationStage !== 'decided') {
      navigate('/borrower/home', { replace: true })
    }
  }, [loanDraft, applicationStage, navigate])

  // Derived algorithm values
  const tier = useMemo(
    () => assignTier(loanDraft?.loanAmount || 0),
    [loanDraft?.loanAmount]
  )

  const vouchScore = useMemo(
    () => computeVouchScore(
      !!(loanDraft?.imamName && loanDraft?.imamPhone),
      loanDraft?.mosqueTenure || 'none',
      loanDraft?.circleMember || false,
    ),
    [loanDraft?.imamName, loanDraft?.imamPhone, loanDraft?.mosqueTenure, loanDraft?.circleMember]
  )

  const needResult = useMemo(() => {
    if (!loanDraft?.grossMonthlyIncome) return null
    return computeNeedScore(
      (loanDraft.grossMonthlyIncome || 0) * 12,
      loanDraft.householdSize || 1,
      loanDraft.purposeCategory || 'other',
      loanDraft.dependents || 0,
      vouchScore / 25,
    )
  }, [loanDraft?.grossMonthlyIncome, loanDraft?.householdSize, loanDraft?.purposeCategory, loanDraft?.dependents, vouchScore])

  const feasibility = useMemo(() => {
    if (!loanDraft?.grossMonthlyIncome || !loanDraft?.loanAmount) return null
    return computeFeasibility(
      (loanDraft.grossMonthlyIncome || 0) * 12,
      draftMonthlyExpenses,
      loanDraft.loanAmount,
      tier,
      loanDraft.householdSize || 1,
    )
  }, [loanDraft?.grossMonthlyIncome, loanDraft?.loanAmount, draftMonthlyExpenses, tier, loanDraft?.householdSize])

  const filteredMosques = useMemo(
    () => mosqueSearch.length > 0
      ? MOSQUES.filter(m => m.toLowerCase().includes(mosqueSearch.toLowerCase()))
      : MOSQUES,
    [mosqueSearch]
  )

  const monthlyPaymentEstimate = useMemo(() => {
    if (!loanDraft?.loanAmount) return null
    if (loanDraft?.proposedMonthlyPayment) return loanDraft.proposedMonthlyPayment
    return Math.ceil(loanDraft.loanAmount / tier.expectedMonths)
  }, [loanDraft?.loanAmount, loanDraft?.proposedMonthlyPayment, tier])

  const repayMonths = useMemo(() => {
    if (!loanDraft?.loanAmount || !monthlyPaymentEstimate) return null
    return Math.ceil(loanDraft.loanAmount / monthlyPaymentEstimate)
  }, [loanDraft?.loanAmount, monthlyPaymentEstimate])

  // Navigation helpers
  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentStep(s => Math.min(6, s + 1))
  }, [])

  const goBack = useCallback(() => {
    setDirection(-1)
    setCurrentStep(s => Math.max(1, s - 1))
  }, [])

  const goToStep = useCallback((step) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }, [currentStep])

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!loanDraft) return

    const application = {
      applicationId: `QH-${Math.floor(1000 + Math.random() * 9000)}`,
      loanAmount: loanDraft.loanAmount,
      purpose: loanDraft.purposeDetail || PURPOSE_OPTIONS.find(p => p.key === loanDraft.purposeCategory)?.label || 'Other',
      purposeCategory: loanDraft.purposeCategory,
      urgency: loanDraft.urgency,
      grossMonthlyIncome: loanDraft.grossMonthlyIncome,
      monthlyDebts: draftMonthlyExpenses,
      householdSize: loanDraft.householdSize || 1,
      dependents: loanDraft.dependents || 0,
      employmentStatus: loanDraft.employmentStatus,
      mosqueName: loanDraft.mosqueName,
      mosqueTenure: loanDraft.mosqueTenure,
      imamName: loanDraft.imamName,
      imamPhone: loanDraft.imamPhone,
      imamVouched: !!(loanDraft.imamName && loanDraft.imamPhone),
      circleMember: loanDraft.circleMember || false,
      repaymentFrequency: loanDraft.repaymentFrequency,
      proposedMonthlyPayment: monthlyPaymentEstimate,
      fullName: loanDraft.fullName,
      dateOfBirth: loanDraft.dateOfBirth,
      phone: '+1 (512) 555-8847',
      phoneVerified: loanDraft.phoneVerified,
      address: loanDraft.address,
      submittedAt: new Date().toISOString(),
      needScore: needResult ? Math.round(needResult.score) : 0,
      needBreakdown: needResult?.breakdown || {},
      vouchScore,
      tier,
      feasibility,
    }

    const decision = computeDecision(application)

    setSubmittedApplication(application)
    setPendingDecision(decision)
    setApplicationStage('review')
    clearDraft()
    navigate('/borrower/review')
  }, [loanDraft, draftMonthlyExpenses, monthlyPaymentEstimate, needResult, vouchScore, tier, feasibility, setSubmittedApplication, setPendingDecision, setApplicationStage, clearDraft, navigate])

  // Step validation
  const canContinue = useMemo(() => {
    if (!loanDraft) return false
    switch (currentStep) {
      case 1: return !!loanDraft.purposeCategory
      case 2: return (loanDraft.loanAmount || 0) >= 50
      case 3: return !!loanDraft.grossMonthlyIncome
      case 4: return !!(loanDraft.fullName && loanDraft.dateOfBirth && loanDraft.address && loanDraft.phoneVerified)
      case 5: return !!(loanDraft.mosqueName && ((loanDraft.imamName && loanDraft.imamPhone) || loanDraft.circleMember))
      case 6: return true
      default: return false
    }
  }, [currentStep, loanDraft])

  // Early returns AFTER all hooks
  if (activeLoan) {
    return <ActiveLoanBlock activeLoan={activeLoan} navigate={navigate} />
  }

  if (!loanDraft) return null

  // -------------------------------------------------------------------------
  // Step Renderers
  // -------------------------------------------------------------------------

  const renderStep1 = () => (
    <div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        What do you need help with?
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5,
      }}>
        Select the category that best describes your situation.
      </p>

      {/* Purpose grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {PURPOSE_OPTIONS.map(opt => {
          const selected = loanDraft.purposeCategory === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => updateDraft({ purposeCategory: opt.key })}
              style={{
                padding: '16px 14px', minHeight: 120, background: selected ? 'rgba(74,173,164,0.08)' : 'var(--bg-elevated)',
                border: selected ? '2px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                textAlign: 'left', transition: 'all var(--transition-base)',
                boxShadow: selected
                  ? '0 0 20px rgba(74, 173, 164, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>{opt.emoji}</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                color: 'var(--text-primary)', display: 'block', marginBottom: 2,
              }}>{opt.label}</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)',
              }}>{opt.example}</span>
            </button>
          )
        })}
      </div>

      {/* Follow-up detail */}
      <AnimatePresence>
        {loanDraft.purposeCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 28 }}
          >
            <label style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
            }}>Tell us more (optional)</label>
            <textarea
              value={loanDraft.purposeDetail || ''}
              onChange={(e) => updateDraft({ purposeDetail: e.target.value })}
              placeholder={PURPOSE_PLACEHOLDERS[loanDraft.purposeCategory]}
              style={{
                width: '100%', minHeight: 80, padding: 14,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6,
                resize: 'vertical', outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgency */}
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 12,
      }}>How urgent is this?</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {URGENCY_OPTIONS.map(opt => {
          const selected = loanDraft.urgency === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => updateDraft({ urgency: opt.key })}
              style={{
                padding: '12px 16px', background: selected ? 'rgba(74,173,164,0.08)' : 'var(--bg-elevated)',
                border: selected ? '2px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all var(--transition-base)',
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0,
              }} />
              <div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)', display: 'block',
                }}>{opt.label}</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)',
                }}>{opt.desc}</span>
              </div>
            </button>
          )
        })}
      </div>

      <StepNav onNext={goNext} nextDisabled={!canContinue} showBack={false} />
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        How much do you need?
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.5,
      }}>
        Enter an amount between $50 and $10,000.
      </p>

      {/* Large amount input */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            fontFamily: "'Cormorant Garamond', serif", fontSize: 56,
            color: 'var(--teal-mid)', pointerEvents: 'none',
            textShadow: '0 0 40px rgba(74, 173, 164, 0.2)',
          }}>$</span>
          <input
            type="number"
            value={loanDraft.loanAmount ?? ''}
            onChange={(e) => updateDraft({ loanAmount: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder="0"
            style={{
              width: 280, padding: '8px 16px 8px 52px', background: 'transparent',
              border: 'none', borderBottom: '2px solid var(--teal-mid)',
              color: 'var(--teal-mid)', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 56, fontWeight: 600, textAlign: 'center', outline: 'none',
              textShadow: '0 0 40px rgba(74, 173, 164, 0.2)',
            }}
          />
        </div>
      </div>

      {/* Quick-select chips */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        {AMOUNT_CHIPS.map(a => (
          <button
            key={a}
            onClick={() => updateDraft({ loanAmount: a })}
            style={{
              padding: '8px 18px',
              background: loanDraft.loanAmount === a ? 'rgba(74, 173, 164, 0.15)' : 'rgba(22, 22, 31, 0.6)',
              color: loanDraft.loanAmount === a ? 'var(--teal-mid)' : 'var(--text-secondary)',
              border: loanDraft.loanAmount === a ? '1px solid var(--teal-mid)' : '1px solid rgba(240, 237, 232, 0.08)',
              borderRadius: 20,
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: 'pointer',
              boxShadow: loanDraft.loanAmount === a ? '0 0 12px rgba(74, 173, 164, 0.2)' : 'none',
            }}
          >
            ${a.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Tier badge */}
      {loanDraft.loanAmount >= 50 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', background: 'rgba(74,173,164,0.06)',
            border: '1px solid rgba(74,173,164,0.15)', borderRadius: 'var(--radius-md)',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={16} style={{ color: 'var(--teal-mid)' }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              color: 'var(--teal-mid)',
            }}>
              {tier.name} Tier
            </span>
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            Repayment window: ~{tier.expectedMonths} months &middot; Est. ${Math.ceil(loanDraft.loanAmount / tier.expectedMonths)}/month
          </div>
        </motion.div>
      )}

      {/* Repayment frequency */}
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 12,
      }}>Repayment frequency</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {FREQUENCY_OPTIONS.map(f => {
          const key = f.toLowerCase().replace('-', '_')
          const selected = loanDraft.repaymentFrequency === key
          return (
            <button
              key={f}
              onClick={() => updateDraft({ repaymentFrequency: key })}
              style={{
                flex: 1, padding: '10px 12px',
                background: selected ? 'var(--teal-mid)' : 'var(--bg-elevated)',
                color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Repayment start */}
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 12,
      }}>When can you start repaying?</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {START_OPTIONS.map(opt => {
          const selected = loanDraft.repaymentStart === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => updateDraft({ repaymentStart: opt.key })}
              style={{
                padding: '10px 14px', background: selected ? 'rgba(74,173,164,0.08)' : 'var(--bg-elevated)',
                border: selected ? '2px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-primary)',
                textAlign: 'left',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Monthly payment input */}
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 12,
      }}>How much can you pay monthly?</h3>
      <NumberInput
        value={loanDraft.proposedMonthlyPayment}
        onChange={(v) => updateDraft({ proposedMonthlyPayment: v })}
        placeholder={`${Math.ceil((loanDraft.loanAmount || 0) / tier.expectedMonths)}`}
        prefix="$"
        style={{ width: '100%', marginBottom: 8 }}
      />
      {loanDraft.loanAmount >= 50 && monthlyPaymentEstimate > 0 && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--teal-mid)',
          marginBottom: 8,
        }}>
          At ${monthlyPaymentEstimate}/month, you'd repay in {repayMonths} month{repayMonths !== 1 ? 's' : ''}.
        </p>
      )}

      <StepNav onBack={goBack} onNext={goNext} nextDisabled={!canContinue} showBack />
    </div>
  )

  const renderStep3 = () => (
    <div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        Help us understand your situation.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.5,
      }}>
        This is how we evaluate need — not creditworthiness.
      </p>

      {/* Monthly income */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Monthly income (before taxes)</label>
      <NumberInput
        value={loanDraft.grossMonthlyIncome}
        onChange={(v) => updateDraft({ grossMonthlyIncome: v })}
        placeholder="2000"
        prefix="$"
        fontSize={32}
        style={{ width: '100%', marginBottom: 28 }}
      />

      {/* Monthly expenses */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 12,
      }}>Monthly expenses</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
        {[
          { key: 'rentAmount', label: 'Rent', placeholder: '800' },
          { key: 'utilitiesAmount', label: 'Utilities', placeholder: '150' },
          { key: 'otherExpenses', label: 'Other', placeholder: '300' },
        ].map(field => (
          <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'var(--text-secondary)', minWidth: 64,
            }}>{field.label}</span>
            <NumberInput
              value={loanDraft[field.key]}
              onChange={(v) => updateDraft({ [field.key]: v })}
              placeholder={field.placeholder}
              prefix="$"
              style={{ flex: 1 }}
            />
          </div>
        ))}
      </div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)',
        marginBottom: 28,
      }}>
        Total: ${draftMonthlyExpenses.toLocaleString()}/month
      </p>

      {/* Household / Dependents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        <Stepper
          label="Household size"
          value={loanDraft.householdSize || 1}
          onChange={(v) => updateDraft({ householdSize: v })}
          min={1} max={10}
        />
        <Stepper
          label="Dependents"
          value={loanDraft.dependents || 0}
          onChange={(v) => updateDraft({ dependents: v })}
          min={0} max={8}
        />
      </div>

      {/* Employment status */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 12,
      }}>Employment status</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {EMPLOYMENT_OPTIONS.map(opt => {
          const selected = loanDraft.employmentStatus === opt
          return (
            <button
              key={opt}
              onClick={() => updateDraft({ employmentStatus: opt })}
              style={{
                padding: '8px 14px',
                background: selected ? 'var(--teal-mid)' : 'var(--bg-elevated)',
                color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)', borderRadius: 20,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Live algorithm output */}
      {needResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', background: 'rgba(74,173,164,0.06)',
            border: '1px solid rgba(74,173,164,0.15)', borderRadius: 'var(--radius-md)',
            marginBottom: 8,
          }}
        >
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'var(--text-secondary)', marginBottom: 12,
          }}>Need Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{
              flex: 1, height: 12, background: 'var(--bg-overlay)', borderRadius: 6, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(needResult.score)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 6,
                  background: needResult.score >= 65 ? 'var(--teal-mid)' : needResult.score >= 40 ? '#fbbf24' : '#f87171',
                  boxShadow: '0 0 16px rgba(74, 173, 164, 0.3)',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>{Math.round(needResult.score)}</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)',
              }}>/ 100</span>
            </div>
          </div>

          {feasibility && (
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: feasibility.feasible ? '#34d399' : '#f87171',
              }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: feasibility.feasible ? '#34d399' : '#f87171',
              }}>
                {feasibility.feasible ? 'Repayment looks feasible' : 'Repayment may be difficult'}
              </span>
            </div>
          )}
        </motion.div>
      )}

      <StepNav onBack={goBack} onNext={goNext} nextDisabled={!canContinue} showBack />
    </div>
  )

  const renderStep4 = () => (
    <div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        Confirm who you are.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.5,
      }}>
        <Lock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
        Your information is encrypted and never shared with lenders.
      </p>

      {/* Full name */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Full name</label>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          value={(loanDraft.fullName || '').split(' ')[0] || ''}
          onChange={(e) => {
            const last = (loanDraft.fullName || '').split(' ').slice(1).join(' ')
            updateDraft({ fullName: `${e.target.value} ${last}`.trim() })
          }}
          placeholder="First name"
          style={{
            flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />
        <input
          type="text"
          value={(loanDraft.fullName || '').split(' ').slice(1).join(' ') || ''}
          onChange={(e) => {
            const first = (loanDraft.fullName || '').split(' ')[0] || ''
            updateDraft({ fullName: `${first} ${e.target.value}`.trim() })
          }}
          placeholder="Last name"
          style={{
            flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />
      </div>

      {/* DOB */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Date of birth</label>
      <input
        type="text"
        value={loanDraft.dateOfBirth || ''}
        onChange={(e) => updateDraft({ dateOfBirth: e.target.value })}
        placeholder="MM/DD/YYYY"
        style={{
          width: '100%', padding: '12px 14px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, outline: 'none', marginBottom: 20,
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
      />

      {/* Address */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Address</label>
      <input
        type="text"
        value={loanDraft.address || ''}
        onChange={(e) => updateDraft({ address: e.target.value })}
        placeholder="Street address, city, state, ZIP"
        style={{
          width: '100%', padding: '12px 14px', background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, outline: 'none', marginBottom: 24,
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
      />

      {/* Phone verification */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Phone verification</label>
      {loanDraft.phoneVerified ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 'var(--radius-md)', marginBottom: 24,
        }}>
          <Check size={18} style={{ color: '#34d399' }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#34d399',
          }}>Verified</span>
        </div>
      ) : !phoneSent ? (
        <button
          onClick={() => setPhoneSent(true)}
          style={{
            padding: '12px 20px', background: 'var(--bg-elevated)',
            border: '1px solid var(--teal-mid)', borderRadius: 'var(--radius-md)',
            color: 'var(--teal-mid)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Phone size={16} /> Send verification code
        </button>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)',
            marginBottom: 8,
          }}>Enter the 6-digit code sent to your phone</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                setPhoneCode(val)
                if (val.length === 6) updateDraft({ phoneVerified: true })
              }}
              placeholder="000000"
              maxLength={6}
              style={{
                width: 160, padding: '12px 14px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 20, fontWeight: 600, letterSpacing: 8, textAlign: 'center',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>
        </div>
      )}

      {/* Government ID advisory */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px',
        background: 'var(--teal-glow)', borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(74,173,164,0.15)', marginBottom: 8,
      }}>
        <Lock size={16} style={{ color: 'var(--teal-mid)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)', display: 'block', marginBottom: 4,
          }}>Government ID</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5,
          }}>
            A valid government ID may be requested after approval. Your data is encrypted end-to-end and never shared with third parties.
          </span>
        </div>
      </div>

      <StepNav onBack={goBack} onNext={goNext} nextDisabled={!canContinue} showBack />
    </div>
  )

  const renderStep5 = () => (
    <div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
        color: 'var(--text-primary)', marginBottom: 8,
      }}>
        Your community standing.
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 15,
        color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.5,
      }}>
        This replaces the credit check.
      </p>

      {/* Mosque search */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Your mosque or Islamic center</label>
      <div style={{ position: 'relative', marginBottom: 4 }}>
        <Search size={16} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)',
        }} />
        <input
          type="text"
          value={loanDraft.mosqueName || mosqueSearch}
          onChange={(e) => {
            setMosqueSearch(e.target.value)
            if (loanDraft.mosqueName) updateDraft({ mosqueName: '' })
          }}
          placeholder="Search mosques..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />
      </div>
      {!loanDraft.mosqueName && (
        <div style={{
          maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', marginBottom: 20,
        }}>
          {filteredMosques.map(m => (
            <button
              key={m}
              onClick={() => { updateDraft({ mosqueName: m }); setMosqueSearch('') }}
              style={{
                width: '100%', padding: '10px 14px', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--border-default)',
                color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, textAlign: 'left', cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
          {filteredMosques.length === 0 && (
            <p style={{
              padding: '12px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'var(--text-tertiary)',
            }}>No mosques found. Try a different search.</p>
          )}
        </div>
      )}
      {loanDraft.mosqueName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          background: 'rgba(74,173,164,0.06)', borderRadius: 'var(--radius-sm)',
          marginBottom: 20,
        }}>
          <Check size={14} style={{ color: 'var(--teal-mid)' }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--teal-mid)',
          }}>{loanDraft.mosqueName}</span>
          <button
            onClick={() => updateDraft({ mosqueName: '' })}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--text-tertiary)', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tenure */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>How long have you attended?</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TENURE_OPTIONS.map(opt => {
          const selected = loanDraft.mosqueTenure === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => updateDraft({ mosqueTenure: opt.key })}
              style={{
                flex: 1, padding: '10px 8px',
                background: selected ? 'var(--teal-mid)' : 'var(--bg-elevated)',
                color: selected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Imam info */}
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--text-primary)', display: 'block', marginBottom: 8,
      }}>Imam or community leader (for vouch)</label>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          value={loanDraft.imamName || ''}
          onChange={(e) => updateDraft({ imamName: e.target.value })}
          placeholder="Imam name"
          style={{
            flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />
        <input
          type="tel"
          value={loanDraft.imamPhone || ''}
          onChange={(e) => updateDraft({ imamPhone: e.target.value })}
          placeholder="Phone number"
          style={{
            flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />
      </div>

      {/* Vouch message preview */}
      {loanDraft.imamName && loanDraft.imamPhone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            padding: '12px 16px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
            marginBottom: 20, overflow: 'hidden',
          }}
        >
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6,
          }}>Preview of vouch request:</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)',
            lineHeight: 1.6, fontStyle: 'italic',
          }}>
            "Assalamu alaykum {loanDraft.imamName}, a member of your community has applied for a
            qard hassan (interest-free loan) through Mizan and listed you as a reference.
            Could you confirm their community standing? This is not a financial guarantee."
          </p>
        </motion.div>
      )}

      {/* Circle membership */}
      <div style={{
        padding: '16px 20px', background: 'var(--bg-elevated)',
        border: loanDraft.circleMember ? '2px solid var(--teal-mid)' : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', marginBottom: 24, cursor: 'pointer',
      }} onClick={() => updateDraft({ circleMember: !loanDraft.circleMember })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Users size={20} style={{ color: 'var(--teal-mid)' }} />
          <div style={{ flex: 1 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              color: 'var(--text-primary)', display: 'block',
            }}>UT Austin MSA Circle</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)',
            }}>Qard hassan lending circle member</span>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: 4,
            border: loanDraft.circleMember ? 'none' : '1px solid var(--border-default)',
            background: loanDraft.circleMember ? 'var(--teal-mid)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {loanDraft.circleMember && <Check size={14} style={{ color: 'var(--text-inverse)' }} />}
          </div>
        </div>
      </div>

      {/* Live trust score */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '14px 18px', background: 'rgba(74,173,164,0.06)',
          border: '1px solid rgba(74,173,164,0.15)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
        }}
      >
        <Star size={18} style={{ color: 'var(--teal-mid)' }} />
        <div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)',
          }}>Trust score: </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700,
            color: 'var(--teal-mid)',
          }}>{vouchScore}</span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)',
          }}> / 30</span>
        </div>
      </motion.div>

      <StepNav onBack={goBack} onNext={goNext} nextDisabled={!canContinue} showBack />
    </div>
  )

  const renderStep6 = () => {
    const purposeLabel = PURPOSE_OPTIONS.find(p => p.key === loanDraft.purposeCategory)?.label || 'Other'
    const urgencyLabel = URGENCY_OPTIONS.find(u => u.key === loanDraft.urgency)?.label || 'Not specified'

    const sections = [
      {
        title: 'Request',
        step: 1,
        items: [
          { label: 'Purpose', value: purposeLabel },
          loanDraft.purposeDetail && { label: 'Details', value: loanDraft.purposeDetail },
          { label: 'Urgency', value: urgencyLabel },
        ].filter(Boolean),
      },
      {
        title: 'Financial',
        step: 2,
        items: [
          { label: 'Loan amount', value: `$${(loanDraft.loanAmount || 0).toLocaleString()}` },
          { label: 'Monthly income', value: `$${(loanDraft.grossMonthlyIncome || 0).toLocaleString()}` },
          { label: 'Monthly expenses', value: `$${draftMonthlyExpenses.toLocaleString()}` },
          { label: 'Household', value: `${loanDraft.householdSize || 1} people, ${loanDraft.dependents || 0} dependents` },
          loanDraft.employmentStatus && { label: 'Employment', value: loanDraft.employmentStatus },
        ].filter(Boolean),
      },
      {
        title: 'Identity',
        step: 4,
        items: [
          { label: 'Name', value: loanDraft.fullName || 'Not provided' },
          { label: 'Date of birth', value: loanDraft.dateOfBirth || 'Not provided' },
          { label: 'Address', value: loanDraft.address || 'Not provided' },
          { label: 'Phone', value: loanDraft.phoneVerified ? 'Verified' : 'Not verified' },
        ],
      },
      {
        title: 'Community',
        step: 5,
        items: [
          { label: 'Mosque', value: loanDraft.mosqueName || 'None' },
          loanDraft.mosqueTenure && { label: 'Tenure', value: TENURE_OPTIONS.find(t => t.key === loanDraft.mosqueTenure)?.label },
          loanDraft.imamName && { label: 'Imam', value: loanDraft.imamName },
          loanDraft.circleMember && { label: 'Circle', value: 'UT Austin MSA Circle' },
        ].filter(Boolean),
      },
    ]

    return (
      <div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600,
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          Review your application.
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.5,
        }}>
          Make sure everything looks right before submitting.
        </p>

        {/* Summary sections */}
        {sections.map(section => (
          <div
            key={section.title}
            style={{
              padding: '16px 20px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              marginBottom: 12,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
            }}>
              <h3 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                color: 'var(--text-primary)', margin: 0,
              }}>{section.title}</h3>
              <button
                onClick={() => goToStep(section.step)}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                style={{
                  background: 'none', border: 'none', color: 'var(--teal-mid)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer',
                  textDecoration: 'none', transition: 'text-decoration 0.2s ease',
                }}
              >
                Edit &rarr;
              </button>
            </div>
            {section.items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '6px 0', borderTop: i > 0 ? '1px solid var(--border-default)' : 'none',
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)',
                }}>{item.label}</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%',
                }}>{item.value}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Algorithm preview */}
        <div style={{
          padding: '20px', background: 'rgba(22, 22, 31, 0.55)',
          border: '1px solid rgba(212, 168, 67, 0.15)', borderRadius: 'var(--radius-md)',
          marginBottom: 24,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
            color: 'var(--teal-mid)', marginBottom: 12, margin: 0,
          }}>Algorithm Preview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)',
                display: 'block',
              }}>Need Score</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700,
                color: 'var(--text-primary)',
              }}>{needResult ? Math.round(needResult.score) : '--'}</span>
            </div>
            <div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)',
                display: 'block',
              }}>Tier</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700,
                color: 'var(--text-primary)',
              }}>{tier.name}</span>
            </div>
            <div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)',
                display: 'block',
              }}>Approval Path</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>{vouchScore >= 18 && needResult && needResult.score >= 65 ? 'Direct' : 'Circle Vote'}</span>
            </div>
            <div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)',
                display: 'block',
              }}>Est. Monthly</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>${monthlyPaymentEstimate || '--'}/mo</span>
            </div>
          </div>
        </div>

        {/* Hadith */}
        <div style={{
          padding: '16px 20px', background: 'var(--bg-elevated)',
          borderLeft: '3px solid var(--teal-mid)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: 32,
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 16,
            color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', margin: 0,
          }}>
            "Whoever relieves a Muslim of a hardship in this world, Allah will relieve him of a hardship on the Day of Judgment."
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: 'var(--text-tertiary)', marginTop: 8, marginBottom: 0,
          }}>
            — Sahih Muslim
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', height: 56, padding: '0 24px',
            background: 'linear-gradient(135deg, #2D7A73, #4AADA4)',
            color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 600,
            letterSpacing: '0.02em',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            transition: 'all var(--transition-base)',
            boxShadow: '0 4px 24px rgba(74, 173, 164, 0.3), 0 0 60px rgba(74, 173, 164, 0.08)',
          }}
        >
          Submit my application <ArrowRight size={18} />
        </button>

        <StepNav onBack={goBack} onNext={handleSubmit} nextLabel="Submit my application" showBack nextDisabled={false} />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 80px', position: 'relative' }}>
      {/* Cancel button */}
      <div style={{ padding: '16px 0' }}>
        <button
          onClick={() => setShowCancelConfirm(true)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Cancel
        </button>
      </div>

      {/* Cancel confirmation dialog */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 24,
            }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)',
                padding: 28, maxWidth: 380, width: '100%',
                border: '1px solid var(--border-default)',
              }}
            >
              <h3 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: 8,
              }}>Leave application?</h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5,
              }}>
                Your progress will be saved as a draft.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    flex: 1, padding: '12px 16px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Keep editing
                </button>
                <button
                  onClick={() => navigate('/borrower/home')}
                  style={{
                    flex: 1, padding: '12px 16px', background: 'var(--teal-mid)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-inverse)', fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Save & exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <ProgressBar currentStep={currentStep} totalSteps={6} />

      {/* Step content */}
      <div style={{
        marginTop: 32, position: 'relative', overflow: 'hidden',
        background: 'rgba(22, 22, 31, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(74, 173, 164, 0.08)',
        borderRadius: 20,
        padding: '32px 28px',
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {stepRenderers[currentStep - 1]()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
