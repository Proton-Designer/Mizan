import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Stethoscope, Users, HelpCircle, CalendarPlus, TrendingDown, ArrowRight } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const REASON_CARDS = [
  { key: 'job_loss', icon: Briefcase, label: 'Job loss' },
  { key: 'medical', icon: Stethoscope, label: 'Medical' },
  { key: 'family_crisis', icon: Users, label: 'Family crisis' },
  { key: 'other', icon: HelpCircle, label: 'Other' },
]

const OPTION_CARDS = [
  { key: 'extend', icon: CalendarPlus, label: 'Extend window', description: 'Spread remaining payments over a longer period' },
  { key: 'reduce', icon: TrendingDown, label: 'Reduce payments', description: 'Lower each monthly payment amount' },
]

export default function HardshipRestructure() {
  const navigate = useNavigate()
  const { activeLoan, requestRestructure } = useBorrower()
  const [selectedReason, setSelectedReason] = useState(null)
  const [otherText, setOtherText] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)

  const remaining = activeLoan?.remaining || 400
  const months = 8
  const computedMonthly = useMemo(() => Math.ceil(remaining / months), [remaining])

  const canSubmit = selectedReason && selectedOption && (selectedReason !== 'other' || otherText.trim().length > 0)

  const handleSubmit = () => {
    const reason = selectedReason === 'other' ? otherText.trim() : selectedReason
    const newSchedule = Array.from({ length: months }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: computedMonthly,
      status: i === 0 ? 'due' : 'upcoming',
    }))
    requestRestructure(reason, { monthlyPayment: computedMonthly, schedule: newSchedule })
    navigate('/borrower/hardship/success?path=restructure')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '48px 24px 80px',
      }}
    >
      {/* Heading */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 34,
        fontWeight: 600,
        lineHeight: 1.15,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}>
        Let's figure this out together.
      </h1>

      {/* Teal divider */}
      <div style={{
        width: 50,
        height: 2,
        background: 'var(--teal-mid)',
        marginTop: 24,
        marginBottom: 32,
        borderRadius: 1,
      }} />

      {/* Reason section */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        What's happening?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {REASON_CARDS.map((card) => {
          const Icon = card.icon
          const isSelected = selectedReason === card.key
          return (
            <motion.button
              key={card.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedReason(card.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 18px',
                background: isSelected ? 'var(--teal-glow)' : 'var(--bg-elevated)',
                border: isSelected ? '1px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                textAlign: 'left',
              }}
            >
              <Icon size={18} style={{ color: isSelected ? 'var(--teal-mid)' : 'var(--text-tertiary)', flexShrink: 0 }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: isSelected ? 'var(--teal-light)' : 'var(--text-primary)',
              }}>
                {card.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Other textarea */}
      {selectedReason === 'other' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          style={{ marginBottom: 20 }}
        >
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Tell us what's going on..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: 16,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </motion.div>
      )}

      {/* Option section */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        color: 'var(--text-secondary)',
        marginBottom: 14,
        marginTop: 12,
      }}>
        What would help?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {OPTION_CARDS.map((card) => {
          const Icon = card.icon
          const isSelected = selectedOption === card.key
          return (
            <motion.button
              key={card.key}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption(card.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 22px',
                background: isSelected ? 'var(--teal-glow)' : 'var(--bg-elevated)',
                border: isSelected ? '1px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'rgba(74, 173, 164, 0.2)' : 'var(--bg-overlay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} style={{ color: isSelected ? 'var(--teal-mid)' : 'var(--text-tertiary)' }} />
              </div>
              <div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: isSelected ? 'var(--teal-light)' : 'var(--text-primary)',
                  marginBottom: 2,
                }}>
                  {card.label}
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                }}>
                  {card.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Computed preview */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--teal-deep)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
            Proposed new plan
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--teal-light)',
          }}>
            ${remaining} &divide; {months} months = ${computedMonthly}/month
          </p>
        </motion.div>
      )}

      {/* Submit button */}
      <motion.button
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: canSubmit ? 'var(--teal-mid)' : 'var(--bg-overlay)',
          color: canSubmit ? 'var(--text-inverse)' : 'var(--text-tertiary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all var(--transition-base)',
        }}
      >
        Submit restructuring request
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  )
}
