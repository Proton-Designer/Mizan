import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

// Animated SVG checkmark component
function AnimatedCheckmark({ color = 'var(--teal-mid)', size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ display: 'block', margin: '0 auto' }}>
      {/* Circle */}
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke={color}
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M24 40 L35 51 L56 30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

const CONTENT = {
  extension: {
    color: 'var(--teal-mid)',
    heading: 'Your payment has been extended.',
    headingColor: 'var(--text-primary)',
    body: (newDate) => (
      <>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          Your new due date is <strong style={{ color: 'var(--teal-light)' }}>{newDate}</strong>.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          No penalties. No fees. No credit impact.
        </p>
      </>
    ),
    hadith: '"Whoever grants respite to one who is in difficulty, Allah will shade him on the Day when there will be no shade except His shade."',
    hadithSource: '— Sahih al-Bukhari',
  },
  restructure: {
    color: 'var(--teal-mid)',
    heading: 'Your request has been submitted.',
    headingColor: 'var(--text-primary)',
    body: () => (
      <>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          Your restructuring request is under review. Circle members will respond within <strong style={{ color: 'var(--teal-light)' }}>48 hours</strong>.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          You'll be notified as soon as a decision is made.
        </p>
      </>
    ),
    hadith: '"Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship of the Day of Resurrection."',
    hadithSource: '— Sahih al-Bukhari',
  },
  conversion: {
    color: 'var(--gold-mid)',
    heading: 'Your conversion has been submitted.',
    headingColor: 'var(--text-gold)',
    body: (_, remaining, cause) => (
      <>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          <strong style={{ color: 'var(--gold-light)' }}>${remaining}</strong> has been submitted for conversion to sadaqah for <strong style={{ color: 'var(--gold-light)' }}>{cause}</strong>.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          You leave this account free of debt and, through this act, a giver.
        </p>
      </>
    ),
    hadith: '"If the debtor is in difficulty, grant him time until it is easy for him; and if you remit it as charity, that is better for you, if you only knew."',
    hadithSource: '— Quran 2:280',
  },
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function HardshipSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { activeLoan } = useBorrower()

  const path = searchParams.get('path') || 'extension'
  const content = CONTENT[path] || CONTENT.extension

  // Compute new date for extension display
  const extendedItem = activeLoan?.schedule?.find(s => s.status === 'extended')
  const newDateDisplay = extendedItem ? formatDate(extendedItem.date) : 'your extended date'

  const remaining = activeLoan?.remaining || 400
  const cause = activeLoan?.destinationCause || 'Yemen Orphan Fund'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '64px 24px 96px',
        textAlign: 'center',
      }}
    >
      {/* Animated checkmark */}
      <div style={{ marginBottom: 36 }}>
        <AnimatedCheckmark color={content.color} />
      </div>

      {/* Heading */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 600,
        lineHeight: 1.2,
        color: content.headingColor,
        letterSpacing: '-0.01em',
        marginBottom: 20,
      }}>
        {content.heading}
      </h1>

      {/* Path-specific body */}
      {content.body(newDateDisplay, remaining, cause)}

      {/* Hadith / Quran quote */}
      <div style={{
        padding: '24px 28px',
        background: path === 'conversion' ? 'var(--gold-glow)' : 'var(--teal-glow)',
        border: `1px solid ${path === 'conversion' ? 'rgba(212, 168, 67, 0.15)' : 'rgba(74, 173, 164, 0.15)'}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 40,
      }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          fontStyle: 'italic',
          lineHeight: 1.7,
          color: path === 'conversion' ? 'var(--gold-light)' : 'var(--teal-light)',
          marginBottom: 8,
        }}>
          {content.hadith}
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: 'var(--text-tertiary)',
        }}>
          {content.hadithSource}
        </p>
      </div>

      {/* Return button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/borrower/loan')}
        style={{
          width: '100%',
          maxWidth: 360,
          margin: '0 auto',
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
        Return to my loan
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  )
}
