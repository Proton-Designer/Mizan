import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCommunity } from '../../context/CommunityContext'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  AlertCircle, TrendingUp, Users, DollarSign,
  Handshake, CalendarCheck, UserPlus, Bell,
  ArrowRight, Activity, Heart, Clock,
  CheckCircle2, ShieldAlert, AlertTriangle,
  Info, ChevronRight, Scale, Wallet
} from 'lucide-react'

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
      const eased = 1 - (1 - progress) * (1 - progress)
      setValue(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  return value
}

/* ------------------------------------------------------------------ */
/*  Urgent Action Card (compact, horizontal scroll)                   */
/* ------------------------------------------------------------------ */
function UrgentCard({ accentColor, icon: Icon, description, actionLabel, linkTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        minWidth: 220, maxWidth: 220, height: 80,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(22, 22, 31, 0.55)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(240, 237, 232, 0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 4, alignSelf: 'stretch', background: accentColor, flexShrink: 0,
      }} />
      <div style={{ color: accentColor, flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
        <div style={{
          fontSize: 12, color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, lineHeight: 1.3, marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {description}
        </div>
        {linkTo ? (
          <Link to={linkTo} style={{
            fontSize: 11, fontWeight: 700, color: accentColor,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {actionLabel || 'Review'} <ChevronRight size={12} />
          </Link>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}>
            {actionLabel || 'Info'}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Activity Timeline Entry                                           */
/* ------------------------------------------------------------------ */
function TimelineEntry({ icon: Icon, timestamp, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{ display: 'flex', gap: 14, position: 'relative' }}
    >
      {/* Vertical teal line + marker */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: 'var(--teal-mid)',
          border: '2px solid var(--bg-surface)', zIndex: 1, flexShrink: 0,
        }} />
        <div style={{ width: 2, flex: 1, background: 'var(--teal-deep)', minHeight: 24 }} />
      </div>
      {/* Content */}
      <div style={{ paddingBottom: 18, flex: 1 }}>
        <div style={{
          fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
          marginBottom: 2,
        }}>
          {timestamp}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.4,
        }}>
          <Icon size={14} style={{ color: 'var(--teal-light)', flexShrink: 0 }} />
          {description}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */
export default function CommunityDashboard() {
  const {
    community,
    vouchQueue,
    givingAlerts,
    congregationHealthScore,
    events,
    aggregateStats,
    circles,
    congregation,
  } = useCommunity()

  /* ---------------------------------------------------------------- */
  /*  BAND 1 — Urgent Actions                                         */
  /* ---------------------------------------------------------------- */
  const urgentItems = useMemo(() => {
    const items = []

    // Red: vouch pending >24h
    if (vouchQueue.length > 0) {
      const oldest = vouchQueue[0]
      const hoursAgo = Math.round((Date.now() - new Date(oldest.submittedAt).getTime()) / 3600000)
      if (hoursAgo > 24) {
        items.push({
          accentColor: '#EF4444', icon: ShieldAlert,
          description: `Vouch pending ${hoursAgo}h: ${oldest.applicantName}`,
          actionLabel: 'Review', linkTo: '/community/vouching',
        })
      }
    }

    // Red: zakat undistributed <30 days left (simulated)
    items.push({
      accentColor: '#EF4444', icon: Scale,
      description: 'Zakat pool undistributed — 47 days until lunar year end',
      actionLabel: 'Distribute', linkTo: '/community/welfare',
    })

    // Red: welfare case open >7 days (simulated)
    items.push({
      accentColor: '#EF4444', icon: Heart,
      description: 'Welfare case open 9 days — medical assistance',
      actionLabel: 'Review', linkTo: '/community/welfare',
    })

    // Amber: event follow-up needed
    const unfollowed = events.find(e => e.followupSent === false)
    if (unfollowed) {
      items.push({
        accentColor: '#F59E0B', icon: CalendarCheck,
        description: `Follow up needed: ${unfollowed.name}`,
        actionLabel: 'Follow up', linkTo: '/community/events',
      })
    }

    // Amber: lapsed members
    const lapsedCount = congregation.filter(m => !m.activeThisMonth).length
    if (lapsedCount > 0) {
      items.push({
        accentColor: '#F59E0B', icon: Users,
        description: `${lapsedCount} lapsed members this month`,
        actionLabel: 'View', linkTo: '/community/congregation',
      })
    }

    // Teal: informational
    items.push({
      accentColor: '#14B8A6', icon: DollarSign,
      description: 'Loan repaid: Omar Osman — $600 installment',
      actionLabel: 'Noted',
    })
    items.push({
      accentColor: '#14B8A6', icon: UserPlus,
      description: 'New member linked to congregation',
      actionLabel: 'Welcome',
    })

    return items
  }, [vouchQueue, events, congregation])

  /* ---------------------------------------------------------------- */
  /*  BAND 2 — Radial Gauges                                          */
  /* ---------------------------------------------------------------- */
  const healthScore = congregationHealthScore.score
  const healthInterpretation = healthScore >= 70
    ? 'Strong — your congregation is thriving'
    : healthScore >= 45
      ? 'Moderate — room for growth'
      : 'Needs attention — reach out to your community'

  const zakatReceived = 6800
  const zakatDistributed = 3200
  const zakatPct = Math.round((zakatDistributed / zakatReceived) * 100)
  const zakatColor = zakatPct > 95 ? '#EF4444' : zakatPct > 80 ? '#F59E0B' : '#14B8A6'

  // Welfare resolution rate (simulated — 8 of 11 resolved within 7 days)
  const welfareResolutionPct = 73

  const healthAnimated = useCountUp(healthScore)
  const zakatAnimated = useCountUp(zakatPct)
  const welfareAnimated = useCountUp(welfareResolutionPct)

  /* ---------------------------------------------------------------- */
  /*  BAND 3 — Activity Timeline (last 14 days, pre-seeded)           */
  /* ---------------------------------------------------------------- */
  const timelineEntries = [
    { icon: CalendarCheck, timestamp: 'Apr 17, 2026 — 7:42 PM', description: 'Eid Al-Fitr Celebration logged — 350 attendees, $3,200 raised' },
    { icon: Heart, timestamp: 'Apr 16, 2026 — 2:15 PM', description: 'Welfare case resolved — emergency rent assistance ($900)' },
    { icon: ShieldAlert, timestamp: 'Apr 16, 2026 — 9:14 AM', description: 'Vouch request submitted: Bilal Mansour — $1,200 for tuition' },
    { icon: DollarSign, timestamp: 'Apr 14, 2026 — 11:30 AM', description: 'Loan repayment received: Omar Osman — $600 installment' },
    { icon: UserPlus, timestamp: 'Apr 13, 2026 — 4:08 PM', description: 'New member auto-linked: Hakeem Rizvi joined congregation' },
    { icon: Handshake, timestamp: 'Apr 12, 2026 — 10:20 AM', description: 'Vouch approved: Amira Saleh — $840 for rent' },
    { icon: Heart, timestamp: 'Apr 10, 2026 — 3:45 PM', description: 'Zakat distributed: $450 for groceries assistance' },
    { icon: CalendarCheck, timestamp: 'Apr 8, 2026 — 6:00 PM', description: 'Jummah Fundraiser follow-up sent — 85 attendees reached' },
    { icon: DollarSign, timestamp: 'Apr 7, 2026 — 9:00 AM', description: 'Monthly circle contributions collected — $2,400 (MSA Graduate)' },
    { icon: CheckCircle2, timestamp: 'Apr 5, 2026 — 1:30 PM', description: 'Welfare case resolved — childcare support ($320)' },
  ]

  /* ---------------------------------------------------------------- */
  /*  BAND 3 — Zakat Intelligence                                     */
  /* ---------------------------------------------------------------- */
  const zakatBalance = zakatReceived - zakatDistributed
  const zakatBarPct = Math.round((zakatDistributed / zakatReceived) * 100)
  const daysRemaining = 47

  const eligibleCases = [
    { id: 'wc-1', name: 'Case #1041', purpose: 'Medical bills', amount: 1200 },
    { id: 'wc-2', name: 'Case #1038', purpose: 'Rent shortfall', amount: 800 },
    { id: 'wc-3', name: 'Case #1045', purpose: 'Groceries', amount: 350 },
  ]

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div style={{ ...styles.page, position: 'relative' }}>

      {/* Green gradient mesh */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 350,
        background: 'radial-gradient(ellipse 55% 45% at 40% 0%, rgba(74, 222, 128, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ============================================================ */}
      {/*  BAND 1 — Urgent Actions Strip                               */}
      {/* ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.card}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={styles.redPulse} />
          <h2 style={styles.sectionTitle}>What needs your attention</h2>
        </div>

        {urgentItems.length === 0 ? (
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', margin: '12px 0 4px',
          }}>
            Nothing urgent today. JazakAllahu Khayran for your stewardship.
          </p>
        ) : (
          <div style={{
            display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
            scrollbarWidth: 'thin',
          }}>
            {urgentItems.map((item, i) => (
              <UrgentCard key={i} {...item} />
            ))}
          </div>
        )}
      </motion.section>

      {/* ============================================================ */}
      {/*  BAND 2 — Three Radial Gauges                                */}
      {/* ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ ...styles.card, padding: '28px 20px' }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24,
        }}>
          {/* Gauge 1: Congregation Health */}
          <div style={{ textAlign: 'center', width: 180, background: 'rgba(22, 22, 31, 0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(74, 173, 164, 0.08)', borderRadius: 20, padding: '24px 20px' }}>
            <div style={{ width: 180, height: 180, margin: '0 auto' }}>
              <CircularProgressbar
                value={healthAnimated}
                text={`${healthAnimated}`}
                styles={buildStyles({
                  textSize: '28px',
                  textColor: 'var(--text-primary)',
                  pathColor: '#14B8A6',
                  trailColor: 'var(--bg-overlay)',
                  pathTransitionDuration: 1.2,
                })}
              />
            </div>
            <div style={{
              marginTop: 10, fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              Congregation Health
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}>
              {healthInterpretation}
            </div>
          </div>

          {/* Gauge 2: Zakat Distribution */}
          <div style={{ textAlign: 'center', width: 180, background: 'rgba(22, 22, 31, 0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(74, 173, 164, 0.08)', borderRadius: 20, padding: '24px 20px' }}>
            <div style={{ width: 180, height: 180, margin: '0 auto' }}>
              <CircularProgressbar
                value={zakatAnimated}
                text={`${zakatAnimated}%`}
                styles={buildStyles({
                  textSize: '28px',
                  textColor: 'var(--text-primary)',
                  pathColor: zakatColor,
                  trailColor: 'var(--bg-overlay)',
                  pathTransitionDuration: 1.2,
                })}
              />
            </div>
            <div style={{
              marginTop: 10, fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              Zakat Distribution
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}>
              ${zakatDistributed.toLocaleString()} of ${zakatReceived.toLocaleString()} distributed
            </div>
          </div>

          {/* Gauge 3: Welfare Resolution Rate */}
          <div style={{ textAlign: 'center', width: 180, background: 'rgba(22, 22, 31, 0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(74, 173, 164, 0.08)', borderRadius: 20, padding: '24px 20px' }}>
            <div style={{ width: 180, height: 180, margin: '0 auto' }}>
              <CircularProgressbar
                value={welfareAnimated}
                text={`${welfareAnimated}%`}
                styles={buildStyles({
                  textSize: '28px',
                  textColor: 'var(--text-primary)',
                  pathColor: '#22C55E',
                  trailColor: 'var(--bg-overlay)',
                  pathTransitionDuration: 1.2,
                })}
              />
            </div>
            <div style={{
              marginTop: 10, fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              Welfare Resolution
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}>
              Resolved within 7 days
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/*  BAND 3 — Two Columns: Timeline + Zakat Intelligence         */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}
      >
        {/* LEFT — Activity Timeline (55%) */}
        <div style={{ ...styles.card, flex: '1 1 55%', minWidth: 340, background: 'rgba(22, 22, 31, 0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(240, 237, 232, 0.06)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Activity size={18} style={{ color: 'var(--teal-light)' }} />
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Activity Timeline</h2>
            <span style={{
              fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              marginLeft: 'auto',
            }}>
              Last 14 days
            </span>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {timelineEntries.map((entry, i) => (
              <TimelineEntry key={i} {...entry} delay={i * 0.06} />
            ))}
          </div>
        </div>

        {/* RIGHT — Zakat Intelligence Panel (45%) */}
        <div style={{ ...styles.card, flex: '1 1 40%', minWidth: 300, background: 'rgba(22, 22, 31, 0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212, 168, 67, 0.1)', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Scale size={18} style={{ color: 'var(--gold-mid)' }} />
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Zakat Intelligence</h2>
          </div>

          {/* Pool balance summary */}
          <div style={{
            fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif", marginBottom: 12,
          }}>
            ${zakatReceived.toLocaleString()} received &middot; ${zakatDistributed.toLocaleString()} distributed
          </div>

          {/* Stacked horizontal bar */}
          <div style={{
            height: 14, borderRadius: 7, background: 'var(--bg-overlay)',
            overflow: 'hidden', marginBottom: 16,
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${zakatBarPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 7,
                background: 'linear-gradient(90deg, #14B8A6, #0D9488)',
              }}
            />
          </div>

          {/* Pool balance + countdown */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 18,
          }}>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
                fontSize: 26, color: 'var(--teal-light)',
              }}>
                ${zakatBalance.toLocaleString()}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              }}>
                remaining to distribute
              </div>
            </div>
            <div style={{
              textAlign: 'right', padding: '8px 14px',
              background: 'rgba(245,158,11,0.08)', borderRadius: 10,
              border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
                fontSize: 22, color: '#F59E0B',
              }}>
                {daysRemaining}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
              }}>
                days remaining
              </div>
            </div>
          </div>

          {/* Eligible welfare cases */}
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
          }}>
            Eligible welfare cases
          </div>

          {eligibleCases.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {c.name}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
                }}>
                  {c.purpose} — ${c.amount.toLocaleString()}
                </div>
              </div>
              <Link to="/community/welfare" style={{
                fontSize: 12, fontWeight: 700, color: '#F59E0B',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2,
                whiteSpace: 'nowrap',
              }}>
                Assign zakat <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes redPulseAnim {
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
    gap: 20,
    maxWidth: 960,
    margin: '0 auto',
  },

  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 16,
    padding: '24px 20px',
    boxShadow: 'var(--shadow-card)',
  },

  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 20,
    color: 'var(--text-primary)',
    margin: '0 0 0 0',
  },

  redPulse: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--status-red)',
    animation: 'redPulseAnim 1.5s infinite',
    flexShrink: 0,
  },
}
