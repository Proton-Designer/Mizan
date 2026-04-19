import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, FileText, Heart, ArrowRight, X } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const PATH_CARDS = [
  {
    key: 'extension',
    icon: Clock,
    iconColor: 'var(--teal-mid)',
    label: 'I need more time this month',
    route: '/borrower/hardship/extension',
  },
  {
    key: 'restructure',
    icon: FileText,
    iconColor: 'var(--teal-mid)',
    label: 'My situation has changed',
    route: '/borrower/hardship/restructure',
  },
  {
    key: 'conversion',
    icon: Heart,
    iconColor: 'var(--status-green)',
    label: 'Convert to sadaqah',
    route: '/borrower/hardship/conversion',
  },
]

export default function Hardship() {
  const navigate = useNavigate()
  const { setHardshipPath } = useBorrower()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [otherMessage, setOtherMessage] = useState('')

  const handlePathClick = (card) => {
    setHardshipPath(card.key)
    navigate(card.route)
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
        fontSize: 36,
        fontWeight: 600,
        lineHeight: 1.15,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}>
        We're here to help, not to collect.
      </h1>

      {/* Subtitle */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 17,
        fontStyle: 'italic',
        color: 'var(--text-secondary)',
        marginTop: 12,
        lineHeight: 1.6,
      }}>
        Whatever you're going through, Mizan was built for exactly this moment.
      </p>

      {/* Teal divider */}
      <div style={{
        width: 50,
        height: 2,
        background: 'var(--teal-mid)',
        marginTop: 24,
        marginBottom: 20,
        borderRadius: 1,
      }} />

      {/* Islamic note */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontStyle: 'italic',
        color: 'var(--text-tertiary)',
        lineHeight: 1.6,
        marginBottom: 36,
      }}>
        Islam forbids adding hardship to hardship. There are no late fees, no penalties, and no credit impact. Choose the path that fits your situation.
      </p>

      {/* Path cards */}
      <div style={{
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {PATH_CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.button
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              whileHover={{ scale: 1.015, borderColor: 'var(--teal-mid)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePathClick(card)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                padding: '20px 24px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: card.key === 'conversion'
                  ? 'rgba(74, 222, 128, 0.1)'
                  : 'var(--teal-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} style={{ color: card.iconColor }} />
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--text-primary)',
                flex: 1,
              }}>
                {card.label}
              </span>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </motion.button>
          )
        })}
      </div>

      {/* Something else link */}
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          onClick={() => setDialogOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--teal-mid)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          Something else <ArrowRight size={14} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: 4 }} />
        </button>
      </div>

      {/* Dialog overlay */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 'var(--z-modal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                position: 'relative',
              }}
            >
              <button
                onClick={() => setDialogOpen(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}>
                Tell us what you need.
              </h3>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: 'var(--text-secondary)',
                marginBottom: 20,
                lineHeight: 1.5,
              }}>
                Describe your situation and we'll work with you to find a solution.
              </p>

              <textarea
                value={otherMessage}
                onChange={(e) => setOtherMessage(e.target.value)}
                placeholder="What's going on?"
                style={{
                  width: '100%',
                  minHeight: 120,
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

              <button
                onClick={() => setDialogOpen(false)}
                disabled={!otherMessage.trim()}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '14px 24px',
                  background: otherMessage.trim() ? 'var(--teal-mid)' : 'var(--bg-overlay)',
                  color: otherMessage.trim() ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: otherMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-base)',
                }}
              >
                Send message
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
