import { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolio } from '../../context/PortfolioContext'
import {
  REFLECTION_FALLBACKS,
  WEEKLY_REFLECTION_FALLBACK,
} from '../../utils/reflectionFallbacks'

/* ── Islamic geometric pattern (reused from Welcome) ── */

function IslamicPattern() {
  const size = 60
  const half = size / 2
  const quarter = size / 4

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.03,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern
          id="khatam-reflection"
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="var(--gold-mid)" strokeWidth="0.5">
            <polygon
              points={`${half},0 ${half + quarter},${quarter} ${size},${half} ${half + quarter},${half + quarter} ${half},${size} ${quarter},${half + quarter} 0,${half} ${quarter},${quarter}`}
            />
            <rect
              x={quarter}
              y={quarter}
              width={half}
              height={half}
              transform={`rotate(45, ${half}, ${half})`}
            />
            <line x1={half} y1="0" x2={half} y2={size} />
            <line x1="0" y1={half} x2={size} y2={half} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam-reflection)" />
    </svg>
  )
}

/* ── Prompt builder for Claude API ── */

function buildPrompt(commitData) {
  const { ngoName, amount, category, mode } = commitData || {}
  return `You are a spiritually grounded Islamic reflection writer. A Muslim user just committed $${amount || 'some amount'} to ${ngoName || 'a charitable cause'} (category: ${category || 'general'}, mode: ${mode || 'direct'}).

Write a short, beautiful spiritual reflection. Return ONLY valid JSON with these keys:
- "verse_or_hadith": A relevant Quranic verse or authentic hadith in quotes
- "source": The source attribution (e.g. "Sahih al-Bukhari, from Abu Hurairah (RA)")
- "reflection": A 2-3 sentence personalized reflection connecting their specific act of giving to Islamic principles (40-60 words)
- "closing_line": A short closing du'a or reflection (under 15 words)

Be warm, sincere, and grounded in authentic Islamic scholarship. Do not be generic.`
}

/* ── Fetch reflection from Claude API (with timeout + fallback) ── */

async function fetchReflection(commitData) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildPrompt(commitData) }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) throw new Error('API response not ok')

    const data = await response.json()
    const text = data?.content?.[0]?.text
    if (!text) throw new Error('No content in response')

    const parsed = JSON.parse(text)
    if (
      parsed.verse_or_hadith &&
      parsed.source &&
      parsed.reflection &&
      parsed.closing_line
    ) {
      return parsed
    }
    throw new Error('Incomplete response')
  } catch {
    clearTimeout(timeout)
    return null
  }
}

/* ── Fallback resolver ── */

function getFallback(commitData, type) {
  if (type === 'weekly') {
    return WEEKLY_REFLECTION_FALLBACK
  }
  const category = commitData?.category || 'general'
  return REFLECTION_FALLBACKS[category] || REFLECTION_FALLBACKS.general
}

/* ── Pulsing gold orb (loading state) ── */

function PulsingOrb() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <motion.div
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, var(--gold-mid) 0%, var(--gold-dark, #8B6914) 100%)',
        }}
      />
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}
      >
        Reflecting...
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SPIRITUAL REFLECTION OVERLAY
   ══════════════════════════════════════════════ */

export default function SpiritualReflection({ type = 'post_commit', onClose }) {
  const { reflectionData, setReflectionData } = usePortfolio()

  const [reflection, setReflection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContinue, setShowContinue] = useState(false)

  /* ── Fetch or fallback ── */
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      // Try API first
      const apiResult = await fetchReflection(reflectionData)

      if (cancelled) return

      if (apiResult) {
        setReflection(apiResult)
      } else {
        // Use fallback
        setReflection(getFallback(reflectionData, type))
      }

      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [reflectionData, type])

  /* ── Delayed continue button ── */
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => setShowContinue(true), 2000)
    return () => clearTimeout(timer)
  }, [loading])

  /* ── Close handler ── */
  const handleClose = useCallback(() => {
    setReflectionData(null)
    onClose?.()
  }, [onClose, setReflectionData])

  /* ── Summary line ── */
  const summaryLine =
    reflectionData?.ngoName && reflectionData?.amount
      ? `$${reflectionData.amount} committed to ${reflectionData.ngoName}`
      : type === 'weekly'
        ? 'Your week in reflection'
        : 'Your commitment has been recorded'

  /* ── Portal render ── */
  const modalRoot = document.getElementById('modal-root')

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="spiritual-reflection-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-modal)',
          background: 'var(--bg-void)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}
      >
        {/* Radial gold glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '60%',
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212, 168, 67, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Islamic geometric pattern at 3% opacity */}
        <IslamicPattern />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 600,
            width: '100%',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {loading ? (
            <PulsingOrb />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
              }}
            >
              {/* Label */}
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-tertiary)',
                  marginBottom: 12,
                }}
              >
                YOUR REFLECTION
              </span>

              {/* Summary line */}
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  margin: '0 0 32px 0',
                }}
              >
                {summaryLine}
              </p>

              {/* Decorative opening quotation mark */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 120,
                    lineHeight: 1,
                    color: 'var(--gold-mid)',
                    opacity: 0.2,
                    position: 'absolute',
                    top: -60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {'\u201C'}
                </span>
              </div>

              {/* Verse / Hadith */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 22,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  margin: '24px 0 8px 0',
                  maxWidth: 520,
                }}
              >
                {reflection?.verse_or_hadith}
              </p>

              {/* Citation */}
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  marginBottom: 24,
                }}
              >
                {reflection?.source}
              </span>

              {/* Gold divider */}
              <div
                style={{
                  width: 48,
                  height: 1,
                  background: 'var(--gold-mid)',
                  margin: '8px 0 24px 0',
                }}
              />

              {/* Personalized reflection */}
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  maxWidth: 480,
                  margin: '0 0 24px 0',
                }}
              >
                {reflection?.reflection}
              </p>

              {/* Closing line */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'var(--gold-light)',
                  margin: '0 0 40px 0',
                }}
              >
                {reflection?.closing_line}
              </p>

              {/* Continue button (appears after 2s delay) */}
              <AnimatePresence>
                {showContinue && (
                  <motion.button
                    key="continue-btn"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={handleClose}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--bg-void)',
                      background:
                        'linear-gradient(135deg, var(--gold-light) 0%, var(--gold-mid) 100%)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '14px 40px',
                      cursor: 'pointer',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Continue &rarr;
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    modalRoot
  )
}
