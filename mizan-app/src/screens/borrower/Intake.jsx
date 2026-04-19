import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, MessageSquare } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const PLACEHOLDER_EXAMPLES = [
  "I lost my job two months ago and I'm behind on rent. I have three kids and my wife is expecting. We need about $1,200 to cover this month and next...",
  "My car broke down and I need it to get to work. The repair costs around $800. I make about $2,500 a month and my expenses are around $2,000..."
]

const KEYWORD_MAP = {
  purpose: {
    rent: 'rent', housing: 'rent', eviction: 'rent', landlord: 'rent',
    car: 'car_repair', vehicle: 'car_repair', repair: 'car_repair', mechanic: 'car_repair',
    medical: 'medical', hospital: 'medical', doctor: 'medical', surgery: 'medical', health: 'medical',
    tuition: 'tuition', school: 'tuition', college: 'tuition', university: 'tuition', education: 'tuition',
    utility: 'utility', electric: 'utility', gas: 'utility', water: 'utility', bill: 'utility',
    food: 'food', groceries: 'food', hungry: 'food',
    funeral: 'funeral', burial: 'funeral', janazah: 'funeral',
  },
  urgency: {
    emergency: 'emergency', urgent: 'emergency', asap: 'emergency', immediately: 'emergency', desperate: 'emergency',
    soon: 'within_a_week', 'this week': 'within_a_week',
    month: 'within_a_month', 'next month': 'within_a_month',
  }
}

function extractFromText(text) {
  const lower = text.toLowerCase()
  const numbers = text.match(/\$?\d[\d,]*\.?\d*/g) || []
  const amounts = numbers.map(n => parseFloat(n.replace(/[$,]/g, ''))).filter(n => n > 0)

  // Find purpose
  let purpose = 'other'
  for (const [keyword, cat] of Object.entries(KEYWORD_MAP.purpose)) {
    if (lower.includes(keyword)) { purpose = cat; break }
  }

  // Find urgency
  let urgency = 'within_a_month'
  for (const [keyword, urg] of Object.entries(KEYWORD_MAP.urgency)) {
    if (lower.includes(keyword)) { urgency = urg; break }
  }

  // Guess loan amount (largest number under 10000, or first number)
  const loanCandidates = amounts.filter(a => a >= 50 && a <= 10000)
  const loanAmount = loanCandidates.length > 0 ? Math.max(...loanCandidates) : 500

  // Guess income (look for numbers near income-related words)
  const incomeMatch = lower.match(/(?:make|earn|income|salary|paid).*?\$?\d[\d,]*/)
  let monthlyIncome = 0
  if (incomeMatch) {
    const incNums = incomeMatch[0].match(/\d[\d,]*/g)
    if (incNums) monthlyIncome = parseFloat(incNums[incNums.length - 1].replace(/,/g, ''))
  }

  // Guess expenses
  const expenseMatch = lower.match(/(?:expense|spend|cost|pay|bills?).*?\$?\d[\d,]*/)
  let monthlyExpenses = 0
  if (expenseMatch) {
    const expNums = expenseMatch[0].match(/\d[\d,]*/g)
    if (expNums) monthlyExpenses = parseFloat(expNums[expNums.length - 1].replace(/,/g, ''))
  }

  // Guess household
  const householdMatch = lower.match(/(\d+)\s*(?:kids?|children|family|people|members?)/)
  const householdSize = householdMatch ? Math.min(10, parseInt(householdMatch[1]) + 1) : 1

  return {
    loanAmount,
    purpose,
    monthlyIncome,
    monthlyExpenses,
    householdSize,
    urgency,
    dependents: Math.max(0, householdSize - 1),
  }
}

export default function Intake() {
  const navigate = useNavigate()
  const { setExtractedData } = useBorrower()
  const [story, setStory] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  // Rotate placeholders
  useEffect(() => {
    if (story.length > 0) return
    const interval = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDER_EXAMPLES.length)
        setPlaceholderVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [story])

  const canSubmit = story.trim().length >= 50

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)


    try {
      // Attempt Claude API call (expected to fail in client-side app)
      const response = await fetch('/api/analyze-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story }),
      })
      if (!response.ok) throw new Error('API unavailable')
      const data = await response.json()
      setExtractedData(data)
      navigate('/borrower/intake/confirm')
    } catch {
      // Fallback: local keyword extraction
      const extracted = extractFromText(story)
      setExtractedData(extracted)
      navigate('/borrower/intake/confirm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px 80px',
      }}
    >
      {/* Header */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 40,
        fontWeight: 600,
        lineHeight: 1.15,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}>
        Tell us what's going on.
      </h1>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 18,
        fontStyle: 'italic',
        color: 'var(--text-secondary)',
        marginTop: 12,
        lineHeight: 1.6,
      }}>
        We're here to help, not to judge.
      </p>

      {/* Teal divider */}
      <div style={{
        width: 50,
        height: 2,
        background: 'var(--teal-mid)',
        marginTop: 24,
        marginBottom: 32,
        borderRadius: 1,
      }} />

      {/* Textarea container */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <textarea
          ref={textareaRef}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          style={{
            width: '100%',
            minHeight: 200,
            padding: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            lineHeight: 1.7,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color var(--transition-base)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--teal-mid)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
        />

        {/* Animated placeholder overlay */}
        {story.length === 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={placeholderIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: placeholderVisible ? 0.45 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                pointerEvents: 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }}
              onClick={() => textareaRef.current?.focus()}
            >
              {PLACEHOLDER_EXAMPLES[placeholderIndex]}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Language note */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: 'var(--text-tertiary)',
        marginBottom: 24,
      }}>
        <MessageSquare size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px', color: 'var(--teal-mid)' }} />
        You can write in Arabic, Urdu, Somali, or any language.
      </p>

      {/* Privacy box */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 18px',
        background: 'var(--teal-glow)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 32,
        border: '1px solid rgba(74, 173, 164, 0.15)',
      }}>
        <Lock size={16} style={{ color: 'var(--teal-mid)', marginTop: 2, flexShrink: 0 }} />
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--teal-light)',
          lineHeight: 1.5,
        }}>
          Your story is private and encrypted. It is only used to understand your needs and will never be shared with lenders or anyone outside of Mizan.
        </p>
      </div>

      {/* Quick questions link */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/borrower/intake/quick')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--teal-mid)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            cursor: 'pointer',
            padding: '8px 0',
            textDecoration: 'none',
          }}
        >
          Answer a few quick questions instead <ArrowRight size={14} style={{ display: 'inline', verticalAlign: '-2px', marginLeft: 4 }} />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--status-red)',
            lineHeight: 1.5,
          }}
        >
          {error}{' '}
          <button
            onClick={() => navigate('/borrower/intake/quick')}
            style={{ background: 'none', border: 'none', color: 'var(--teal-mid)', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
          >
            Try the quick questions instead.
          </button>
        </motion.div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
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
          transition: 'all var(--transition-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Analyzing...' : (
          <>
            Analyze my situation
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {!canSubmit && story.length > 0 && (
        <p style={{
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: 'var(--text-tertiary)',
          marginTop: 8,
        }}>
          {50 - story.trim().length} more characters needed
        </p>
      )}
    </motion.div>
  )
}
