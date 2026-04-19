import { useParams, useNavigate } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { useNGO } from '../../context/NGOContext'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, Circle, DollarSign, Users, Building2 } from 'lucide-react'

/* ── Helpers ── */

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function addDays(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function addMonths(iso, months) {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

/* ── Marker components ── */

const pulseKeyframes = `
@keyframes journeyPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
}
`

function CompletedMarker() {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      background: 'var(--status-green)',
      flexShrink: 0,
    }} />
  )
}

function InProgressMarker() {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      background: 'var(--gold-mid)',
      flexShrink: 0,
      animation: 'journeyPulse 2s ease-in-out infinite',
    }} />
  )
}

function FutureMarker() {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      background: 'transparent',
      border: '2px dashed var(--text-tertiary)',
      flexShrink: 0,
      boxSizing: 'border-box',
    }} />
  )
}

/* ── Single timeline event ── */

function TimelineEvent({ marker, title, description, date, isCompleted, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 64, position: 'relative' }}>
      {/* Vertical line segment */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 24, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24 }}>
          {marker}
        </div>
        {!isLast && (
          <div style={{
            flex: 1, width: 2,
            background: 'var(--border-default)',
          }} />
        )}
      </div>

      {/* Content card */}
      <div style={{
        flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 16,
      }}>
        <div style={{
          padding: 16,
          background: isCompleted ? 'var(--bg-surface)' : 'transparent',
          borderRadius: 'var(--radius-md, 8px)',
          border: isCompleted ? '1px solid var(--border-subtle)' : 'none',
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 4,
          }}>
            {title}
          </div>
          {description && (
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'var(--text-secondary)', marginBottom: 4,
              lineHeight: 1.5,
            }}>
              {description}
            </div>
          )}
          {date && (
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: 'var(--text-tertiary)',
            }}>
              {date}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Build timeline events for a position ── */

function buildTimeline(position) {
  const events = []
  const createdAt = position.createdAt
  const isDirect = position.type === 'direct'
  const isJariyah = position.mode === 'jariyah'
  const isComplete = position.status === 'complete'
  const cyclesTotal = position.cyclesTotal || 0
  const cyclesCurrent = position.cyclesCurrent || 0
  const cycleProgress = position.cycleProgress || 0

  // 1. Committed
  events.push({
    marker: <CompletedMarker />,
    title: 'Committed',
    description: `Committed $${position.amount.toLocaleString()} to ${position.ngoName}`,
    date: fmtDate(createdAt),
    isCompleted: true,
  })

  if (isDirect) {
    // Direct: committed -> settled (complete)
    events.push({
      marker: isComplete ? <CompletedMarker /> : <FutureMarker />,
      title: 'Sadaqah Settled',
      description: `Sadaqah settles at ${position.ngoName}`,
      date: fmtDate(createdAt),
      isCompleted: isComplete,
    })
    return events
  }

  // 2. Deployed to Pool
  const deployDate = addDays(createdAt, 1)
  events.push({
    marker: <CompletedMarker />,
    title: 'Deployed to Pool',
    description: 'Capital deployed to qard hassan pool',
    date: fmtDate(deployDate),
    isCompleted: true,
  })

  // Cycles
  const totalCycles = isJariyah ? Math.max(cyclesCurrent + 2, 3) : cyclesTotal

  for (let c = 1; c <= totalCycles; c++) {
    const isPastCycle = c < cyclesCurrent
    const isCurrentCycle = c === cyclesCurrent
    const isFutureCycle = c > cyclesCurrent

    const cycleStartIso = c === 1
      ? createdAt
      : addMonths(createdAt, (c - 1) * 5)

    if (isPastCycle) {
      // Past completed cycle
      events.push({
        marker: <CompletedMarker />,
        title: `Borrower Assigned — Cycle ${c}`,
        description: 'Borrower received qard hassan loan',
        date: fmtDate(cycleStartIso),
        isCompleted: true,
      })
      events.push({
        marker: <CompletedMarker />,
        title: 'Repayment Received',
        description: `Repayment received — $${position.amount.toLocaleString()} returned to pool`,
        date: fmtDate(addMonths(cycleStartIso, 4)),
        isCompleted: true,
      })
      events.push({
        marker: <CompletedMarker />,
        title: `Cycle ${c} Complete`,
        description: `Cycle ${c} complete. ${position.familiesHelped} families helped.`,
        date: fmtDate(addMonths(cycleStartIso, 5)),
        isCompleted: true,
      })
    } else if (isCurrentCycle) {
      // Current active cycle — borrower assigned
      const borrowers = position.currentBorrowers || []
      if (borrowers.length > 0) {
        borrowers.forEach((bor) => {
          events.push({
            marker: cycleProgress >= 0.9 ? <CompletedMarker /> : <InProgressMarker />,
            title: `Borrower Assigned — Cycle ${c}`,
            description: `${bor.firstName} in ${bor.city} received $${bor.loanAmount.toLocaleString()} for ${bor.purpose}`,
            date: fmtDate(cycleStartIso),
            isCompleted: false,
          })
        })
      } else {
        events.push({
          marker: <InProgressMarker />,
          title: `Borrower Assigned — Cycle ${c}`,
          description: 'Borrower matched to qard hassan loan',
          date: fmtDate(cycleStartIso),
          isCompleted: false,
        })
      }

      // In progress marker
      const pct = Math.round(cycleProgress * 100)
      events.push({
        marker: <InProgressMarker />,
        title: 'In Progress',
        description: `In progress — ~${pct}% complete`,
        date: null,
        isCompleted: false,
      })

      // Future repayment for current cycle
      events.push({
        marker: <FutureMarker />,
        title: 'Repayment',
        description: `Repayment received — $${position.amount.toLocaleString()} returned to pool`,
        date: `Est. ${fmtDate(position.estimatedCycleEndDate)}`,
        isCompleted: false,
      })

      // Future cycle complete
      events.push({
        marker: <FutureMarker />,
        title: `Cycle ${c} Complete`,
        description: `Cycle ${c} complete. ${position.familiesHelped} families helped.`,
        date: `Est. ${fmtDate(position.estimatedCycleEndDate)}`,
        isCompleted: false,
      })
    } else {
      // Future cycle
      const estDate = addMonths(createdAt, (c - 1) * 5)
      events.push({
        marker: <FutureMarker />,
        title: `Cycle ${c}`,
        description: `Cycle ${c} — estimated ${fmtDate(estDate)}`,
        date: null,
        isCompleted: false,
      })
    }
  }

  // Final settlement
  if (isJariyah) {
    events.push({
      marker: <FutureMarker />,
      title: 'Final Settlement',
      description: 'Perpetual — continues indefinitely',
      date: null,
      isCompleted: false,
    })
  } else {
    const settlementDate = addMonths(createdAt, cyclesTotal * 5)
    events.push({
      marker: isComplete ? <CompletedMarker /> : <FutureMarker />,
      title: 'Final Settlement',
      description: `Sadaqah settles at ${position.ngoName}`,
      date: isComplete ? fmtDate(settlementDate) : `Est. ${fmtDate(settlementDate)}`,
      isCompleted: isComplete,
    })
  }

  return events
}

/* ── Type / Status badge ── */

function Badge({ label, variant }) {
  const colors = {
    compound: { bg: 'rgba(99,102,241,0.12)', text: '#818CF8' },
    direct:   { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
    jariyah:  { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
    active:   { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
    complete: { bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' },
  }
  const c = colors[variant] || colors.active
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
      background: c.bg, color: c.text, marginRight: 6,
    }}>
      {label}
    </span>
  )
}

/* ── Main component ── */

export default function JourneyPosition() {
  const { positionId } = useParams()
  const navigate = useNavigate()
  const { positions } = usePortfolio()
  const { getNgoById } = useNGO()

  const position = positions.find(p => p.id === positionId)

  if (!position) {
    return (
      <div style={{ padding: 24, color: 'var(--text-secondary)' }}>
        Position not found.
      </div>
    )
  }

  const ngo = getNgoById(position.ngoId)
  const logoUrl = ngo?.logo || null
  const events = buildTimeline(position)

  const typeLabel = position.mode === 'jariyah' ? 'Jariyah' : position.type === 'direct' ? 'Direct' : 'Compound'
  const typeBadgeVariant = position.mode === 'jariyah' ? 'jariyah' : position.type === 'direct' ? 'direct' : 'compound'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: 640 }}
    >
      {/* Inject pulse animation */}
      <style>{pulseKeyframes}</style>

      {/* Back link */}
      <button
        onClick={() => navigate('/portfolio/journey')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          color: 'var(--text-secondary)', padding: 0, marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} />
        Back to Journey
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        {/* NGO logo */}
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md, 8px)',
          overflow: 'hidden', flexShrink: 0,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={position.ngoName}
              style={{ width: 48, height: 48, objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          <div style={{
            display: logoUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%',
          }}>
            <Building2 size={22} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 28,
            color: 'var(--text-primary)', margin: 0, lineHeight: 1.2,
          }}>
            {position.ngoName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600,
              color: 'var(--text-primary)', marginRight: 8,
            }}>
              ${position.amount.toLocaleString()}
            </span>
            <Badge label={typeLabel} variant={typeBadgeVariant} />
            <Badge label={position.status === 'active' ? 'Active' : 'Complete'} variant={position.status} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 8 }}>
        {events.map((evt, i) => (
          <TimelineEvent
            key={i}
            marker={evt.marker}
            title={evt.title}
            description={evt.description}
            date={evt.date}
            isCompleted={evt.isCompleted}
            isLast={i === events.length - 1}
          />
        ))}
      </div>
    </motion.div>
  )
}
