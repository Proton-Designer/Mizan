import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Plus, Minus, ChevronRight } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const PURPOSES = [
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'car_repair', label: 'Car', emoji: '🚗' },
  { value: 'rent', label: 'Rent', emoji: '🏠' },
  { value: 'utility', label: 'Utilities', emoji: '💡' },
  { value: 'tuition', label: 'Tuition', emoji: '🎓' },
  { value: 'food', label: 'Food', emoji: '🛒' },
  { value: 'funeral', label: 'Funeral', emoji: '🕊️' },
  { value: 'other', label: 'Other', emoji: '📋' },
]

const AMOUNT_CHIPS = [100, 250, 500, 1000, 2000]

const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency', desc: 'I need help right now' },
  { value: 'within_a_week', label: 'Within a week', desc: 'Fairly urgent' },
  { value: 'within_a_month', label: 'Within a month', desc: 'Some time to plan' },
  { value: 'planning_ahead', label: 'Planning ahead', desc: 'Not urgent yet' },
]

const QUESTIONS = [
  { key: 'purpose', title: 'What do you need help with?' },
  { key: 'amount', title: 'How much do you need?' },
  { key: 'urgency', title: 'How urgent is this?' },
  { key: 'income', title: 'What\'s your monthly income?' },
  { key: 'expenses', title: 'What are your monthly expenses?' },
  { key: 'household', title: 'Tell us about your household.' },
  { key: 'mosque', title: 'Are you connected to a mosque?' },
]

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
}

export default function IntakeQuick() {
  const navigate = useNavigate()
  const { setExtractedData } = useBorrower()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [direction, setDirection] = useState(1)

  // Answers state
  const [purpose, setPurpose] = useState('')
  const [amount, setAmount] = useState('')
  const [urgency, setUrgency] = useState('')
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [householdSize, setHouseholdSize] = useState(1)
  const [dependents, setDependents] = useState(0)
  const [hasMosque, setHasMosque] = useState(null)
  const [mosqueName, setMosqueName] = useState('')
  const [mosqueTenure, setMosqueTenure] = useState('')

  const canGoNext = () => {
    switch (currentQuestion) {
      case 0: return !!purpose
      case 1: return !!amount && parseFloat(amount) > 0
      case 2: return !!urgency
      case 3: return true // skippable
      case 4: return true // skippable
      case 5: return true // always valid
      case 6: return true // always valid
      default: return false
    }
  }

  const goNext = () => {
    if (currentQuestion === 6) {
      // Assemble and navigate
      const data = {
        loanAmount: parseFloat(amount) || 500,
        purpose: purpose || 'other',
        monthlyIncome: parseFloat(income) || 0,
        monthlyExpenses: parseFloat(expenses) || 0,
        householdSize,
        dependents,
        urgency: urgency || 'within_a_month',
        mosque: hasMosque ? { name: mosqueName, tenure: mosqueTenure } : null,
      }
      setExtractedData(data)
      navigate('/borrower/intake/confirm')
      return
    }
    setDirection(1)
    setCurrentQuestion(prev => prev + 1)
  }

  const goBack = () => {
    if (currentQuestion === 0) {
      navigate('/borrower/intake')
      return
    }
    setDirection(-1)
    setCurrentQuestion(prev => prev - 1)
  }

  const chipStyle = (selected) => ({
    padding: '10px 18px',
    background: selected ? 'var(--teal-glow)' : 'var(--bg-elevated)',
    border: `1px solid ${selected ? 'var(--teal-mid)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-pill)',
    color: selected ? 'var(--teal-light)' : 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
  })

  const numberInputStyle = {
    width: '100%',
    maxWidth: 280,
    padding: '14px 18px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    outline: 'none',
  }

  const renderQuestion = () => {
    switch (currentQuestion) {
      // Q0: Purpose
      case 0:
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {PURPOSES.map(p => (
              <button
                key={p.value}
                onClick={() => setPurpose(p.value)}
                style={{
                  ...chipStyle(purpose === p.value),
                  padding: '14px 22px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{p.emoji}</span> {p.label}
              </button>
            ))}
          </div>
        )

      // Q1: Amount
      case 1:
        return (
          <div>
            <div style={{ position: 'relative', maxWidth: 280, marginBottom: 20 }}>
              <span style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                fontSize: 28, fontWeight: 600, color: 'var(--teal-mid)',
              }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                style={{ ...numberInputStyle, paddingLeft: 40 }}
                onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMOUNT_CHIPS.map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  style={chipStyle(amount === String(a))}
                >
                  ${a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )

      // Q2: Urgency
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
            {URGENCY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setUrgency(opt.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  background: urgency === opt.value ? 'var(--teal-glow)' : 'var(--bg-elevated)',
                  border: `1px solid ${urgency === opt.value ? 'var(--teal-mid)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: urgency === opt.value ? 'var(--teal-light)' : 'var(--text-primary)',
                }}>
                  {opt.label}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  marginTop: 2,
                }}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        )

      // Q3: Income
      case 3:
        return (
          <div>
            <div style={{ position: 'relative', maxWidth: 280, marginBottom: 12 }}>
              <span style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                fontSize: 28, fontWeight: 600, color: 'var(--teal-mid)',
              }}>$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="0"
                autoFocus
                style={{ ...numberInputStyle, paddingLeft: 40 }}
                onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'var(--text-tertiary)',
              marginBottom: 12,
            }}>
              Approximate monthly take-home pay
            </p>
            <button
              onClick={goNext}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--teal-mid)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, padding: 0,
              }}
            >
              Skip this question <ChevronRight size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </button>
          </div>
        )

      // Q4: Expenses
      case 4:
        return (
          <div>
            <div style={{ position: 'relative', maxWidth: 280, marginBottom: 12 }}>
              <span style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                fontSize: 28, fontWeight: 600, color: 'var(--teal-mid)',
              }}>$</span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="0"
                autoFocus
                style={{ ...numberInputStyle, paddingLeft: 40 }}
                onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'var(--text-tertiary)',
              marginBottom: 12,
            }}>
              Rent, food, bills, debt payments, etc.
            </p>
            <button
              onClick={goNext}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--teal-mid)', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, padding: 0,
              }}
            >
              Skip this question <ChevronRight size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </button>
          </div>
        )

      // Q5: Household
      case 5:
        return (
          <div>
            {/* Household size stepper */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 10,
              }}>
                People in household
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => setHouseholdSize(prev => Math.max(1, prev - 1))}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 32, fontWeight: 600, color: 'var(--text-primary)',
                  minWidth: 48, textAlign: 'center',
                }}>
                  {householdSize}
                </span>
                <button
                  onClick={() => setHouseholdSize(prev => Math.min(10, prev + 1))}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Dependents stepper */}
            <div>
              <label style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 10,
              }}>
                Dependents (children, elderly, etc.)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => setDependents(prev => Math.max(0, prev - 1))}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 32, fontWeight: 600, color: 'var(--text-primary)',
                  minWidth: 48, textAlign: 'center',
                }}>
                  {dependents}
                </span>
                <button
                  onClick={() => setDependents(prev => Math.min(8, prev + 1))}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        )

      // Q6: Mosque
      case 6:
        return (
          <div>
            {/* Yes / No toggle */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setHasMosque(val)}
                  style={{
                    padding: '14px 32px',
                    background: hasMosque === val ? 'var(--teal-glow)' : 'var(--bg-elevated)',
                    border: `1px solid ${hasMosque === val ? 'var(--teal-mid)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: hasMosque === val ? 'var(--teal-light)' : 'var(--text-secondary)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>

            {/* Mosque details (shown when Yes) */}
            {hasMosque && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
                <input
                  type="text"
                  value={mosqueName}
                  onChange={(e) => setMosqueName(e.target.value)}
                  placeholder="Mosque or community name"
                  style={{
                    width: '100%',
                    maxWidth: 360,
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    outline: 'none',
                    marginBottom: 16,
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                }}>
                  How long have you been a member?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Less than 1 year', '1-3 years', '3-5 years', '5+ years'].map(t => (
                    <button
                      key={t}
                      onClick={() => setMosqueTenure(t)}
                      style={chipStyle(mosqueTenure === t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}
    >
      {/* Progress bar */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 40,
      }}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= currentQuestion ? 'var(--teal-mid)' : 'var(--bg-overlay)',
              transition: 'background var(--transition-base)',
            }}
          />
        ))}
      </div>

      {/* Step indicator */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: 'var(--teal-mid)',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        Question {currentQuestion + 1} of {QUESTIONS.length}
      </p>

      {/* Question title */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestion}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 32,
            lineHeight: 1.2,
          }}>
            {QUESTIONS[currentQuestion].title}
          </h2>

          {renderQuestion()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 48,
        gap: 16,
      }}>
        <button
          onClick={goBack}
          style={{
            padding: '12px 20px',
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={goNext}
          disabled={!canGoNext()}
          style={{
            padding: '12px 28px',
            background: canGoNext() ? 'var(--teal-mid)' : 'var(--bg-overlay)',
            color: canGoNext() ? 'var(--text-inverse)' : 'var(--text-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            cursor: canGoNext() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all var(--transition-base)',
          }}
        >
          {currentQuestion === 6 ? 'Review my answers' : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  )
}
