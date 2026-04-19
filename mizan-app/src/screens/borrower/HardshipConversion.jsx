import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Info } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

export default function HardshipConversion() {
  const navigate = useNavigate()
  const { activeLoan, initiateConversion } = useBorrower()

  const remaining = activeLoan?.remaining || 400
  const cause = activeLoan?.destinationCause || 'Yemen Orphan Fund'

  const handleConvert = () => {
    initiateConversion()
    navigate('/borrower/hardship/success?path=conversion')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '56px 24px 96px',
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
        The Quran has provided for this moment.
      </h1>

      {/* GOLD divider */}
      <div style={{
        width: 60,
        height: 2,
        background: 'var(--gold-mid)',
        marginTop: 28,
        marginBottom: 32,
        borderRadius: 1,
      }} />

      {/* Quran 2:280 */}
      <div style={{
        background: 'rgba(212, 168, 67, 0.03)',
        borderRadius: 16,
        padding: '24px 20px',
        marginTop: 32,
        marginBottom: 32,
      }}>
        <blockquote style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 24,
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.8,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: 8,
        }}>
          "If the debtor is in difficulty, grant him time until it is easy for him; and if you remit it as charity, that is better for you, if you only knew."
        </blockquote>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-tertiary)',
          marginBottom: 0,
        }}>
          — Quran 2:280
        </p>
      </div>

      {/* What happens card — GOLD border */}
      <div style={{
        padding: '24px 28px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 32,
        boxShadow: 'inset 0 0 24px var(--gold-glow)',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--gold-light)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          What happens when you convert
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-primary)',
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
          ${remaining} remaining on your loan is converted to sadaqah for <strong style={{ color: 'var(--gold-light)' }}>{cause}</strong>.
        </p>

        {/* Conversion detail */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '16px 0 0',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)' }}>
              Outstanding
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              ${remaining}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)' }}>
              Converts to
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--gold-light)' }}>
              Sadaqah
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)' }}>
              Destination
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--gold-light)' }}>
              {cause}
            </span>
          </div>
        </div>
      </div>

      {/* Affirmation statements */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        You are not in debt.
      </p>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        fontStyle: 'italic',
        color: 'var(--text-secondary)',
        marginBottom: 32,
        lineHeight: 1.6,
      }}>
        This is between you and Allah.
      </p>

      {/* Circle vote notice */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 18px',
        background: 'var(--gold-glow)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(212, 168, 67, 0.15)',
        marginBottom: 36,
      }}>
        <Info size={16} style={{ color: 'var(--gold-mid)', marginTop: 2, flexShrink: 0 }} />
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--gold-light)',
          lineHeight: 1.5,
        }}>
          Circle members will vote on this conversion request. Most conversions are approved within 24 hours. The lender's original contribution becomes sadaqah in their name.
        </p>
      </div>

      {/* GOLD conversion button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConvert}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'var(--gradient-gold)',
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
          boxShadow: '0 4px 24px rgba(212, 168, 67, 0.3), 0 0 60px rgba(212, 168, 67, 0.08)',
          transition: 'all var(--transition-base)',
          marginBottom: 12,
        }}
      >
        Request conversion
        <ArrowRight size={18} />
      </motion.button>

      {/* Ghost teal button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/borrower/hardship')}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: 'transparent',
          color: 'var(--teal-mid)',
          border: '1px solid var(--teal-deep)',
          borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
        }}
      >
        I'm not ready yet
      </motion.button>
    </motion.div>
  )
}
