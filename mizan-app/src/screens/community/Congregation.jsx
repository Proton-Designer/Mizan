import { useMemo } from 'react'
import { useCommunity } from '../../context/CommunityContext'
import { motion } from 'framer-motion'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CAUSE_COLORS = {
  'Gaza Emergency': '#e74c3c',
  'Yemen Relief': '#8e44ad',
  'Somalia Aid': '#3498db',
  'Local Community': '#0d9488',
  Other: '#94a3b8',
}

const CAUSE_DISPLAY = {
  'Gaza Emergency': 'Gaza Emergency',
  'Yemen Relief': 'Yemen Orphan Fund',
  'Somalia Aid': 'Somalia Water',
  'Local Community': 'Local mosque',
  Other: 'Other',
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function interpretScore(score) {
  if (score >= 75) return 'Strong'
  if (score >= 50) return 'Moderate'
  return 'Needs attention'
}

function scoreColor(score) {
  if (score >= 75) return '#0d9488'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

function lowestSuggestion(lowest) {
  switch (lowest) {
    case 'recency':
      return 'Many members haven\u2019t given recently. A personal check-in could re-engage them.'
    case 'frequency':
      return 'Giving frequency is low. Consider a weekly micro-giving campaign.'
    case 'monetary':
      return 'Average gift size is below target. Highlight impact-per-dollar in communications.'
    default:
      return ''
  }
}

/* ------------------------------------------------------------------ */
/*  RFM Health Bar                                                     */
/* ------------------------------------------------------------------ */
function RFMBar({ label, value, isLowest }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLowest && <span title="Lowest component">⚠️</span>}
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-overlay, rgba(255,255,255,0.06))' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: isLowest ? '#eab308' : '#0d9488',
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Frequency Bar                                                      */
/* ------------------------------------------------------------------ */
function FrequencyBar({ label, count, total, pct, highlight }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {count} ({pct}%)
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-overlay, rgba(255,255,255,0.06))' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: highlight ? '#eab308' : '#0d9488',
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cause Bar                                                          */
/* ------------------------------------------------------------------ */
function CauseBar({ rank, name, pct, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {rank}. {name}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-overlay, rgba(255,255,255,0.06))' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Heat Map (SVG)                                                     */
/* ------------------------------------------------------------------ */
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function CommunityHeatMap({ congregation }) {
  const dots = useMemo(() => {
    const rng = seededRandom(42)
    const weekly = congregation.filter((m) => m.givingPattern === 'weekly')
    const monthly = congregation.filter((m) => m.givingPattern === 'monthly')
    const sporadic = congregation.filter((m) => m.givingPattern === 'sporadic')

    const result = []
    const cx = 150
    const cy = 150

    // Inner ring: weekly (green, r 30-55)
    weekly.forEach((m) => {
      const angle = rng() * Math.PI * 2
      const r = 30 + rng() * 25
      result.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color: '#22c55e',
        id: m.memberId,
      })
    })

    // Middle ring: monthly (yellow, r 60-95)
    monthly.forEach((m) => {
      const angle = rng() * Math.PI * 2
      const r = 60 + rng() * 35
      result.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color: '#eab308',
        id: m.memberId,
      })
    })

    // Outer ring: sporadic (gray, r 100-135)
    sporadic.forEach((m) => {
      const angle = rng() * Math.PI * 2
      const r = 100 + rng() * 35
      result.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color: '#94a3b8',
        id: m.memberId,
      })
    })

    return { dots: result, counts: { green: weekly.length, yellow: monthly.length, gray: sporadic.length } }
  }, [congregation])

  return (
    <div>
      <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
        {/* Concentric guide rings */}
        {[55, 95, 135].map((r) => (
          <circle
            key={r}
            cx={150}
            cy={150}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Mosque center */}
        <circle cx={150} cy={150} r={8} fill="#0d9488" />
        <text x={150} y={154} textAnchor="middle" fontSize={7} fill="#fff" fontWeight={700}>
          M
        </text>

        {/* Member dots */}
        {dots.dots.map((d, i) => (
          <motion.circle
            key={d.id}
            cx={d.x}
            cy={d.y}
            r={4}
            fill={d.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.015, duration: 0.35 }}
          />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14 }}>
        {[
          { color: '#22c55e', label: 'Highly engaged', count: dots.counts.green },
          { color: '#eab308', label: 'Moderate', count: dots.counts.yellow },
          { color: '#94a3b8', label: 'Sporadic', count: dots.counts.gray },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            {item.label} ({item.count})
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function Congregation() {
  const {
    congregation,
    congregationHealthScore,
    aggregateStats,
    events,
  } = useCommunity()

  const { givingFreq = 0, welfareSpeed = 0, zakatProgress = 0, engagement = 0, score = 0, interpretation = 'Moderate' } = congregationHealthScore || {}
  const recency = givingFreq
  const frequency = welfareSpeed
  const monetary = zakatProgress
  const lowest = givingFreq <= welfareSpeed && givingFreq <= zakatProgress ? 'recency' : welfareSpeed <= zakatProgress ? 'frequency' : 'monetary'

  /* Frequency counts */
  const weeklyCount = congregation.filter((m) => m.givingPattern === 'weekly').length
  const monthlyCount = congregation.filter((m) => m.givingPattern === 'monthly').length
  const sporadicCount = congregation.filter((m) => m.givingPattern === 'sporadic').length
  const total = congregation.length

  const weeklyPct = Math.round((weeklyCount / total) * 100)
  const monthlyPct = Math.round((monthlyCount / total) * 100)
  const sporadicPct = 100 - weeklyPct - monthlyPct

  /* Cause preferences */
  const causeData = (aggregateStats.causeDistribution || []).slice(0, 5)

  /* Event performance: sorted by per-attendee rate */
  const eventRanking = useMemo(() => {
    return [...events]
      .map((e) => ({
        ...e,
        perAttendee: e.attendees > 0 ? e.totalRaised / e.attendees : 0,
      }))
      .sort((a, b) => b.perAttendee - a.perAttendee)
      .slice(0, 4)
  }, [events])

  return (
    <div style={styles.page}>
      <div style={styles.twoPanel}>
        {/* ───────────── LEFT PANEL ───────────── */}
        <div style={styles.leftPanel}>

          {/* Hero — Congregation Health Score */}
          <motion.section
            style={styles.card}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div style={styles.tealAccent} />
            <h2 style={styles.cardTitle}>Congregation Health Score</h2>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 56,
                  fontWeight: 700,
                  color: scoreColor(score),
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span style={{ fontSize: 18, color: scoreColor(score), fontWeight: 600 }}>
                / 100
              </span>
            </div>
            <p style={{ fontSize: 15, color: scoreColor(score), fontWeight: 600, marginBottom: 20 }}>
              {interpretation}
            </p>

            <RFMBar label="Recency" value={recency} isLowest={lowest === 'recency'} />
            <RFMBar label="Frequency" value={frequency} isLowest={lowest === 'frequency'} />
            <RFMBar label="Monetary" value={monetary} isLowest={lowest === 'monetary'} />

            {/* Suggestion for lowest component */}
            <div style={styles.suggestionBox}>
              <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                <strong style={{ color: '#eab308' }}>⚠️ {lowest.charAt(0).toUpperCase() + lowest.slice(1)}</strong>
                {' — '}
                {lowestSuggestion(lowest)}
              </span>
            </div>
          </motion.section>

          {/* Giving Frequency Breakdown */}
          <motion.section
            style={styles.card}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <h2 style={styles.cardTitle}>Giving Frequency Breakdown</h2>

            <FrequencyBar label="Weekly" count={weeklyCount} total={total} pct={weeklyPct} />
            <FrequencyBar label="Monthly" count={monthlyCount} total={total} pct={monthlyPct} />
            <FrequencyBar label="Sporadic" count={sporadicCount} total={total} pct={sporadicPct} highlight />

            <div style={{ ...styles.suggestionBox, borderLeft: '3px solid #eab308' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Consider a <strong style={{ color: 'var(--text-primary)' }}>giving streak campaign</strong> to activate this group.
              </span>
            </div>
          </motion.section>

          {/* Cause Preferences */}
          <motion.section
            style={styles.card}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <h2 style={styles.cardTitle}>Cause Preferences</h2>

            {causeData.map((cause, i) => (
              <CauseBar
                key={cause.name}
                rank={i + 1}
                name={CAUSE_DISPLAY[cause.name] || cause.name}
                pct={cause.percent}
                color={CAUSE_COLORS[cause.name] || '#94a3b8'}
              />
            ))}
          </motion.section>

          {/* Event Performance Ranking */}
          <motion.section
            style={styles.card}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <h2 style={styles.cardTitle}>Event Performance Ranking</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Sorted by per-attendee giving rate
            </p>

            {eventRanking.map((evt, i) => {
              const isTop = i === 0
              return (
                <div
                  key={evt.id}
                  style={{
                    padding: '12px 14px',
                    marginBottom: 10,
                    borderRadius: 10,
                    background: isTop
                      ? 'rgba(13,148,136,0.10)'
                      : 'var(--bg-overlay, rgba(255,255,255,0.04))',
                    border: isTop ? '1px solid rgba(13,148,136,0.3)' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {evt.name}
                    </span>
                    {isTop && (
                      <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>
                        Highest per-attendee return ★
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    <span style={styles.metricSmall}>
                      <strong>${evt.perAttendee.toFixed(2)}</strong> / attendee
                    </span>
                    <span style={styles.metricSmall}>
                      Total: <strong>${evt.totalRaised.toLocaleString()}</strong>
                    </span>
                    <span style={styles.metricSmall}>
                      Multiplier: <strong>{evt.correlationMultiplier}x</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </motion.section>
        </div>

        {/* ───────────── RIGHT PANEL ───────────── */}
        <div style={styles.rightPanel}>

          {/* Community Heat Map */}
          <motion.section
            style={styles.card}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <h2 style={styles.cardTitle}>Community Engagement Map</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Engagement rings — green core = highly engaged, gray outer = sporadic
            </p>

            <CommunityHeatMap congregation={congregation} />

            <p style={{ fontSize: 12, color: 'var(--text-tertiary, #64748b)', textAlign: 'center', marginTop: 14 }}>
              {total} congregation members &middot; stylized engagement visualization
            </p>
          </motion.section>

          {/* Aggregate Loan Impact */}
          <motion.section
            style={{ ...styles.card, background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.18)' }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <h2 style={styles.cardTitle}>Community Loan Impact</h2>

            <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 12 }}>
              <strong>12</strong> community members have received interest-free loans through Mizan.
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 12 }}>
              Repayment rate: <strong style={{ color: '#0d9488' }}>94%</strong>
            </p>
            <p style={{ fontSize: 15, color: '#eab308', letterSpacing: 2, marginBottom: 0 }}>
              Mosque trust rating: ★★★★★
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px 16px 48px',
  },
  twoPanel: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  rightPanel: {
    flex: '0 0 calc(45% - 24px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'sticky',
    top: 24,
  },
  card: {
    position: 'relative',
    background: 'var(--card-bg, rgba(255,255,255,0.04))',
    borderRadius: 16,
    padding: '22px 24px',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
  },
  tealAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: '16px 16px 0 0',
    background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 16,
    letterSpacing: '-0.01em',
  },
  suggestionBox: {
    marginTop: 14,
    padding: '10px 14px',
    borderRadius: 8,
    background: 'rgba(234,179,8,0.08)',
    borderLeft: '3px solid #eab308',
    color: 'var(--text-secondary)',
  },
  metricSmall: {
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
}
