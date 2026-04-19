import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCommunity } from '../../context/CommunityContext'

/* ------------------------------------------------------------------ */
/*  Animated count-up hook                                            */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setValue(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  return value
}

function AnimatedStat({ value, label, prefix = '', suffix = '' }) {
  const display = useCountUp(value)
  return (
    <div style={styles.statCard}>
      <span style={styles.statValue}>{prefix}{display.toLocaleString()}{suffix}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Bar component                                                     */
/* ------------------------------------------------------------------ */
function PercentBar({ label, pct, color = 'var(--teal-mid)', suffix }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
          {pct}%{suffix ? ` ${suffix}` : ''}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-overlay)' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: '3px',
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                    */
/* ------------------------------------------------------------------ */
export default function CommunityDashboard() {
  const { community } = useCommunity()
  const { monthly, giving, loans, pendingActions } = community
  const activePct = Math.round((monthly.active / monthly.total) * 100)

  return (
    <div style={styles.page}>
      {/* ── Hero Card ── */}
      <section style={styles.heroCard}>
        <div style={styles.heroGlow} />
        <h1 style={styles.heroTitle}>{community.name}</h1>
        <p style={styles.heroSub}>Community Hub &middot; &#10003; IRS Verified</p>

        <div style={styles.statsGrid}>
          <AnimatedStat value={community.members} label="Members" />
          <AnimatedStat value={community.committed} label="Committed" prefix="$" />
          <AnimatedStat value={community.familiesHelped} label="Families Helped" />
          <AnimatedStat value={community.circles} label="Circles" />
        </div>

        <p style={styles.monthlySummary}>
          ${monthly.committed.toLocaleString()} committed &middot; {monthly.families} families &middot; {monthly.active} of {monthly.total} active ({activePct}%)
        </p>
      </section>

      {/* ── Two-column row ── */}
      <div style={styles.twoCol}>
        {/* ── Congregation Giving Breakdown ── */}
        <section style={{ ...styles.card, flex: '3 1 0' }}>
          <h2 style={styles.cardTitle}>Congregation Giving Breakdown</h2>

          <h3 style={styles.subHead}>Mode</h3>
          <PercentBar label="Direct" pct={giving.direct} />
          <PercentBar label="Compound" pct={giving.compound} color="var(--gold-mid)" />
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            {giving.jariyah} Jariyah commitments
          </p>

          <h3 style={styles.subHead}>Top 5 Causes</h3>
          {giving.causes.map((c) => (
            <PercentBar key={c.name} label={c.name} pct={c.pct} color="var(--teal-light)" />
          ))}

          <h3 style={{ ...styles.subHead, marginTop: '16px' }}>Frequency</h3>
          <PercentBar label="Weekly" pct={giving.frequency.weekly} color="var(--status-green)" />
          <PercentBar label="Monthly" pct={giving.frequency.monthly} color="var(--teal-mid)" />
          <PercentBar label="Sporadic" pct={giving.frequency.sporadic} color="var(--status-yellow)" />

          {/* AI Insight */}
          <div style={styles.insightBox}>
            <span style={styles.insightTitle}>&#128161; Monthly Insight</span>
            <p style={styles.insightText}>
              Compound giving grew 14% this month. Consider highlighting Jariyah options during
              Friday khutbah to convert sporadic givers to recurring commitments.
            </p>
          </div>
        </section>

        {/* ── Active Loans Summary ── */}
        <section style={{ ...styles.card, flex: '2 1 0' }}>
          <h2 style={styles.cardTitle}>Active Loans Summary</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {loans.active} active loans &middot; ${loans.outstanding.toLocaleString()} outstanding
          </p>

          <div style={styles.statusRow}>
            <span style={{ ...styles.statusDot, background: 'var(--status-green)' }} />
            <span style={styles.statusText}>{loans.onSchedule} on schedule</span>
          </div>
          <div style={styles.statusRow}>
            <span style={{ ...styles.statusDot, background: 'var(--status-yellow)', animation: 'pulse 1.5s infinite' }} />
            <span style={styles.statusText}>{loans.dueSoon} due in 3 days</span>
          </div>
          <div style={styles.statusRow}>
            <span style={{ ...styles.statusDot, background: 'var(--status-blue)' }} />
            <span style={styles.statusText}>{loans.pendingVote} pending vote</span>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pool Health</span>
              <span style={{ fontSize: '13px', color: 'var(--status-green)', fontWeight: 600 }}>
                Strong &middot; {loans.repaymentRate}% repayment
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-overlay)' }}>
              <div style={{
                width: `${loans.repaymentRate}%`, height: '100%', borderRadius: '4px',
                background: 'var(--status-green)', transition: 'width 1s ease',
              }} />
            </div>
          </div>

          <Link to="/community/circles" style={styles.manageLink}>Manage loans &rarr;</Link>
        </section>
      </div>

      {/* ── Pending Actions ── */}
      <section style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={styles.redPulse} />
          <h2 style={{ ...styles.cardTitle, margin: 0 }}>Pending Actions</h2>
        </div>

        {/* Vouch request */}
        <div style={styles.actionRow}>
          <span style={{ fontSize: '16px' }}>&#128308;</span>
          <span style={styles.actionText}>1 vouch request ({pendingActions[0].label})</span>
          <Link to="/community/vouching" style={styles.actionLink}>Review &rarr;</Link>
        </div>

        {/* Circle vote */}
        <div style={styles.actionRow}>
          <span style={{ fontSize: '16px' }}>&#128993;</span>
          <span style={styles.actionText}>1 Circle vote needs quorum</span>
          <Link to="/community/circles" style={styles.actionLink}>Vote &rarr;</Link>
        </div>

        {/* Informational */}
        <div style={styles.actionRow}>
          <span style={{ fontSize: '16px' }}>&#9898;</span>
          <span style={styles.actionText}>1 new member linked</span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Informational</span>
        </div>
      </section>

      {/* Keyframe for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes redPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.6); }
          50% { box-shadow: 0 0 0 6px rgba(248,113,113,0); }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '960px',
    margin: '0 auto',
  },

  /* Hero */
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
    padding: '32px 28px 24px',
    boxShadow: 'var(--shadow-card)',
    textAlign: 'center',
  },
  heroGlow: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 50% 20%, rgba(74,173,164,0.18) 0%, transparent 65%)',
  },
  heroTitle: {
    position: 'relative',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: '32px',
    color: 'var(--text-primary)',
    margin: '0 0 4px',
  },
  heroSub: {
    position: 'relative',
    fontSize: '14px',
    color: 'var(--teal-light)',
    margin: '0 0 24px',
  },
  statsGrid: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '12px',
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid var(--border-subtle)',
  },
  statValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    fontSize: '26px',
    color: 'var(--teal-light)',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginTop: '2px',
  },
  monthlySummary: {
    position: 'relative',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-elevated)',
    borderRadius: '8px',
    padding: '10px 14px',
    border: '1px solid var(--border-subtle)',
  },

  /* Cards */
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
    padding: '24px 20px',
    boxShadow: 'var(--shadow-card)',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: '20px',
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  subHead: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px',
  },
  twoCol: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },

  /* Loans */
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  manageLink: {
    display: 'inline-block',
    marginTop: '20px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--teal-light)',
    textDecoration: 'none',
  },

  /* Insight */
  insightBox: {
    marginTop: '16px',
    border: '1px solid var(--teal-deep)',
    borderRadius: '12px',
    padding: '14px 16px',
    background: 'rgba(74,173,164,0.06)',
  },
  insightTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--teal-light)',
  },
  insightText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.5',
  },

  /* Pending Actions */
  redPulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--status-red)',
    animation: 'redPulse 1.5s infinite',
    flexShrink: 0,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  actionText: {
    flex: 1,
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  actionLink: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--teal-light)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
}
