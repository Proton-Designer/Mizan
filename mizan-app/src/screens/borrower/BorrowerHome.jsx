/**
 * BorrowerHome — Adaptive dashboard screen
 * 21st.dev-inspired layout that changes based on applicationStage:
 *
 *   pre_application → Welcome + Apply CTA
 *   intake/verification → Progress card + continue CTA
 *   review → Live step tracker + application summary
 *   decided → Decision summary with next steps
 *   active_loan → Full loan dashboard with status card
 *
 * Design references:
 * - 21st.dev dashboard cards with glassmorphism
 * - Vertical stepper pattern from 21st.dev/s/vertical-stepper
 * - Stat badges from 21st.dev card components
 * - Mizan teal accent, dark theme, Cormorant headings
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, FileText, Shield, Clock, Banknote,
  CreditCard, AlertTriangle, History, Heart, Sparkles,
} from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'
import Card from '../../components/ui/Card'
import StepTracker from '../../components/borrower/StepTracker'
import LoanStatusCard from '../../components/borrower/LoanStatusCard'
import { QuickStatBadge, TrustMeter, ProgressRing } from '../../components/borrower/QuickStatBadge'

// ---------------------------------------------------------------------------
// Welcome / Pre-Application View
// ---------------------------------------------------------------------------
function WelcomeView({ onApply, onQuickApply }) {
  return (
    <>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          textAlign: 'center',
          marginBottom: 48,
          paddingTop: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            width: 72, height: 72,
            borderRadius: 20,
            background: 'var(--teal-glow)',
            border: '1px solid rgba(74, 173, 164, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Heart size={32} style={{ color: 'var(--teal-mid)' }} />
        </motion.div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 44,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          marginBottom: 12,
        }}>
          Interest-free help,{'\n'}when you need it.
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 480,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Apply for a qard hassan — a beautiful loan with zero interest,
          funded by your community. No credit checks. No hidden fees.
        </p>
      </motion.div>

      {/* Feature cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16,
        marginBottom: 40,
      }}>
        {[
          {
            icon: Banknote, label: '0% Interest',
            desc: 'Qard hassan means beautiful loan. You pay back exactly what you borrow.',
            color: 'var(--status-green)',
          },
          {
            icon: Shield, label: 'No Credit Check',
            desc: 'We use community trust and need-based scoring, not FICO.',
            color: 'var(--teal-mid)',
          },
          {
            icon: Heart, label: 'Hardship Protection',
            desc: 'If life gets hard, we restructure or convert to charity. No penalties.',
            color: '#C084FC',
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${feature.color}12`,
              border: `1px solid ${feature.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <feature.icon size={20} style={{ color: feature.color }} />
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}>
              {feature.label}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <motion.button
          onClick={onApply}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 52,
            padding: '0 32px',
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(135deg, var(--teal-light) 0%, var(--teal-mid) 50%, var(--teal-deep) 100%)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 0 20px rgba(74, 173, 164, 0.25), 0 0 60px rgba(74, 173, 164, 0.08)',
          }}
        >
          <Sparkles size={18} />
          Tell Your Story
          <ArrowRight size={16} />
        </motion.button>

        <motion.button
          onClick={onQuickApply}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 52,
            padding: '0 24px',
            borderRadius: 'var(--radius-pill)',
            background: 'transparent',
            color: 'var(--teal-light)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500,
            border: '1px solid var(--teal-deep)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <FileText size={16} />
          Quick Questions
        </motion.button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// In-Progress Application View (intake / verification)
// ---------------------------------------------------------------------------
function InProgressView({ stage, onContinue }) {
  const stageMap = {
    intake: { step: 1, label: 'Tell Your Story', desc: 'Describe your situation in your own words' },
    verification: { step: 2, label: 'Verify Identity', desc: 'Confirm your details and community connection' },
  }
  const current = stageMap[stage] || stageMap.intake
  const progress = stage === 'intake' ? 33 : 66

  return (
    <>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 36, fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        Your application is in progress.
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15, color: 'var(--text-secondary)',
        marginBottom: 32,
      }}>
        Pick up where you left off.
      </p>

      {/* Progress card */}
      <Card style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        {/* Progress bar */}
        <div style={{
          height: 4, background: 'var(--bg-overlay)',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--teal-deep), var(--teal-mid), var(--teal-light))',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProgressRing progress={progress} size={60} strokeWidth={5}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 600,
                color: 'var(--teal-light)',
              }}>
                {current.step}/3
              </span>
            </ProgressRing>

            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--teal-mid)',
                marginBottom: 4,
              }}>
                Step {current.step} of 3
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}>
                {current.label}
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: 'var(--text-secondary)',
              }}>
                {current.desc}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Continue button */}
      <motion.button
        onClick={onContinue}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', height: 52,
          borderRadius: 'var(--radius-pill)',
          background: 'linear-gradient(135deg, var(--teal-light) 0%, var(--teal-mid) 50%, var(--teal-deep) 100%)',
          color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 0 20px rgba(74, 173, 164, 0.25)',
        }}
      >
        Continue Application
        <ArrowRight size={16} />
      </motion.button>

      {/* Steps overview */}
      <div style={{ marginTop: 32 }}>
        <StepTracker
          compact
          steps={[
            {
              label: 'Tell your story',
              detail: stage === 'intake' ? 'In progress...' : 'Completed',
              state: stage === 'intake' ? 'pending' : 'complete',
            },
            {
              label: 'Verify identity & community',
              detail: stage === 'verification' ? 'In progress...' : 'Not started',
              state: stage === 'verification' ? 'pending' : stage === 'intake' ? 'waiting' : 'complete',
            },
            {
              label: 'Review & decision',
              detail: 'Waiting for previous steps',
              state: 'waiting',
            },
          ]}
        />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Active Loan Dashboard View
// ---------------------------------------------------------------------------
function ActiveLoanView({ navigate }) {
  const {
    activeLoan, checkingBalance, communityTrustLevel,
    loanHistory, bankName, bankLast4,
  } = useBorrower()

  return (
    <>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            Your Loan
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, color: 'var(--text-secondary)',
          }}>
            {bankName} ····{bankLast4}
          </p>
        </div>
        <TrustMeter level={communityTrustLevel} />
      </div>

      {/* Main loan status card */}
      <LoanStatusCard
        activeLoan={activeLoan}
        checkingBalance={checkingBalance}
        communityTrustLevel={communityTrustLevel}
      />

      {/* Action buttons */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginTop: 24,
      }}>
        <motion.button
          onClick={() => navigate('/borrower/payment')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 52,
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(135deg, var(--teal-light) 0%, var(--teal-mid) 50%, var(--teal-deep) 100%)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 0 20px rgba(74, 173, 164, 0.25)',
          }}
        >
          <CreditCard size={18} />
          Make a Payment
        </motion.button>

        <motion.button
          onClick={() => navigate('/borrower/history')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 52,
            borderRadius: 'var(--radius-pill)',
            background: 'transparent',
            color: 'var(--teal-light)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 500,
            border: '1px solid var(--teal-deep)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <History size={16} />
          Loan History
        </motion.button>
      </div>

      {/* Hardship link */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => navigate('/borrower/hardship')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: 'var(--text-tertiary)',
            padding: '8px 0',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <AlertTriangle size={13} />
          Having trouble with payments?
        </button>
      </div>

      {/* Past loans summary */}
      {loanHistory && loanHistory.length > 0 && (
        <Card style={{ marginTop: 32 }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
            marginBottom: 16,
          }}>
            Past Loans
          </p>
          {loanHistory.map((loan, i) => (
            <div key={loan.id || i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < loanHistory.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 500,
                  color: 'var(--text-primary)',
                }}>
                  ${loan.amount} — {loan.purpose}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: 'var(--text-tertiary)',
                  display: 'block', marginTop: 2,
                }}>
                  {loan.tier} tier · Paid in {loan.monthsTaken || loan.months_taken} months
                </span>
              </div>
              <div style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 600,
                color: 'var(--status-green)',
              }}>
                Paid in full
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main BorrowerHome Component
// ---------------------------------------------------------------------------
export default function BorrowerHome() {
  const navigate = useNavigate()
  const { applicationStage, activeLoan } = useBorrower()

  const renderContent = () => {
    switch (applicationStage) {
      case 'pre_application':
        return (
          <WelcomeView
            onApply={() => navigate('/borrower/intake')}
            onQuickApply={() => navigate('/borrower/intake/quick')}
          />
        )

      case 'intake':
      case 'verification':
        return (
          <InProgressView
            stage={applicationStage}
            onContinue={() => {
              const routes = {
                intake: '/borrower/intake',
                verification: '/borrower/verification',
              }
              navigate(routes[applicationStage])
            }}
          />
        )

      case 'review':
        // Redirect to review screen which has its own step tracker
        navigate('/borrower/review', { replace: true })
        return null

      case 'decided':
        navigate('/borrower/decision', { replace: true })
        return null

      case 'active_loan':
        return <ActiveLoanView navigate={navigate} />

      default:
        return (
          <WelcomeView
            onApply={() => navigate('/borrower/intake')}
            onQuickApply={() => navigate('/borrower/intake/quick')}
          />
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '40px 24px 96px',
      }}
    >
      {renderContent()}
    </motion.div>
  )
}
