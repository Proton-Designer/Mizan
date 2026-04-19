import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Info } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const EXTENSION_OPTIONS = [
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 3 weeks', days: 21 },
  { label: 'In 30 days', days: 30 },
]

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function HardshipExtension() {
  const navigate = useNavigate()
  const { activeLoan, requestExtension } = useBorrower()
  const [selectedDays, setSelectedDays] = useState(30)

  // Find the current due date from the schedule
  const currentDueItem = activeLoan?.schedule?.find(s => s.status === 'due' || s.status === 'extended')
  const currentDueDate = currentDueItem?.date || activeLoan?.schedule?.[1]?.date || '2026-05-18'

  const newDate = useMemo(() => addDays(currentDueDate, selectedDays), [currentDueDate, selectedDays])

  const handleExtend = () => {
    requestExtension(newDate)
    navigate('/borrower/hardship/success?path=extension')
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
        Take the time you need.
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

      {/* Current due date */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 28,
        border: '1px solid var(--border-subtle)',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}>
          Current due date
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          {formatDate(currentDueDate)}
        </p>
      </div>

      {/* Extension chips */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        color: 'var(--text-secondary)',
        marginBottom: 14,
      }}>
        How much more time do you need?
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {EXTENSION_OPTIONS.map((opt) => {
          const isSelected = selectedDays === opt.days
          return (
            <motion.button
              key={opt.days}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDays(opt.days)}
              style={{
                padding: '10px 20px',
                background: isSelected ? 'var(--teal-mid)' : 'var(--bg-elevated)',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: isSelected ? '1px solid var(--teal-mid)' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-pill)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
            >
              {opt.label}
            </motion.button>
          )
        })}
      </div>

      {/* New date preview */}
      <motion.div
        key={selectedDays}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          padding: '20px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--teal-deep)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 28,
        }}
      >
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--teal-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 4,
        }}>
          New due date
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26,
          fontWeight: 600,
          color: 'var(--teal-light)',
        }}>
          {formatDate(newDate)}
        </p>
      </motion.div>

      {/* Info card */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 18px',
        background: 'var(--teal-glow)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(74, 173, 164, 0.15)',
        marginBottom: 36,
      }}>
        <Info size={16} style={{ color: 'var(--teal-mid)', marginTop: 2, flexShrink: 0 }} />
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--teal-light)',
          lineHeight: 1.5,
        }}>
          The circle members who funded your loan will be notified of the extension. No penalties, no fees, no credit impact. This is how qard hassan works.
        </p>
      </div>

      {/* Extend button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExtend}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'var(--teal-mid)',
          color: 'var(--text-inverse)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all var(--transition-base)',
        }}
      >
        Extend to {formatDate(newDate)}
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  )
}
