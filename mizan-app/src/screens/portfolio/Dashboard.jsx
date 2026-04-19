import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Heart,
  TrendingUp,
  Infinity,
  Activity,
  ChevronRight,
  X,
  BookOpen,
} from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'
import { useNGO } from '../../context/NGOContext'
import Card from '../../components/ui/Card'

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

const CATEGORY_COLORS = {
  emergency: '#EF4444',
  water: '#3B82F6',
  food: '#10B981',
  orphan: '#8B5CF6',
  medical: '#F59E0B',
  community: '#6B7280',
  refugees: '#F97316',
  education: '#06B6D4',
  mosque: '#6B7280',
  advocacy: '#A78BFA',
  youth: '#34D399',
  women: '#EC4899',
  media: '#8B5CF6',
  finance: '#F59E0B',
}

const CATEGORY_LABELS = {
  emergency: 'Crisis Response',
  water: 'Clean Water & Sanitation',
  food: 'Food Security',
  orphan: 'Orphan Care',
  medical: 'Healthcare Access',
  community: 'Community & Masjid',
  refugees: 'Displacement & Refuge',
  education: 'Education & Literacy',
  mosque: 'Community & Masjid',
  advocacy: 'Advocacy',
  youth: 'Youth',
  women: "Women's Programs",
  media: 'Media & Dawah',
  finance: 'Islamic Finance',
}

// Region colors for the geography view
const REGION_COLORS = {
  Yemen: '#EF4444',
  'Gaza': '#F97316',
  Somalia: '#3B82F6',
  Pakistan: '#10B981',
  Bangladesh: '#06B6D4',
  Syria: '#F59E0B',
  Sudan: '#8B5CF6',
  USA: '#6B7280',
  Morocco: '#EC4899',
  Other: '#A78BFA',
}

// Mode colors
const MODE_COLORS = {
  jariyah: '#10B981',
  compound: '#D4A843',
  direct: '#3B82F6',
}

const MODE_LABELS = {
  jariyah: 'Jariyah (perpetual)',
  compound: 'Compound (cycling)',
  direct: 'Direct (settled)',
}

const MODE_ICONS = {
  jariyah: '✦',
  compound: '⟳',
  direct: '✓',
}

function generateRisingData(count, seed) {
  const points = []
  let value = 2 + seed * 3
  for (let i = 0; i < count; i++) {
    value += 0.5 + Math.random() * 2.5
    points.push({ x: i, y: value })
  }
  return points
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Skeleton placeholder ── */
function Skeleton({ width = '100%', height = 16, radius = 4, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--bg-overlay, rgba(255,255,255,0.06))',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   SECTION: Hero Stat Cards
   ───────────────────────────────────────────── */

function HeroStatCards({ totalDeployed, totalFamiliesHelped, positions }) {
  const activeCount = positions.filter((p) => p.status === 'active').length
  const jariyahCount = positions.filter((p) => p.mode === 'jariyah').length
  const impactRate = Math.round(totalFamiliesHelped / 3)

  const cards = [
    {
      label: 'Akhirah Portfolio',
      value: `$${totalDeployed.toLocaleString()}`,
      icon: <Wallet size={18} />,
      isGold: true,
    },
    {
      label: 'Families Helped',
      value: totalFamiliesHelped,
      icon: <Heart size={18} />,
      animate: true,
    },
    {
      label: 'Active Positions',
      value: activeCount,
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Jariyah Active',
      value: jariyahCount,
      icon: <Infinity size={18} />,
      greenDot: true,
    },
    {
      label: 'Impact Rate',
      value: `${impactRate}/month`,
      icon: <Activity size={18} />,
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card, i) => (
        <HeroCard key={i} card={card} index={i} />
      ))}
    </div>
  )
}

function HeroCard({ card, index }) {
  const [displayVal, setDisplayVal] = useState(card.animate ? 0 : null)

  useEffect(() => {
    if (!card.animate) return
    const target = typeof card.value === 'number' ? card.value : 0
    if (target === 0) return
    let current = 0
    const step = Math.max(1, Math.floor(target / 30))
    const interval = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(interval)
      }
      setDisplayVal(current)
    }, 40)
    return () => clearInterval(interval)
  }, [card.animate, card.value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{
        background: 'rgba(22, 22, 31, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: card.isGold
          ? '1px solid rgba(212, 168, 67, 0.12)'
          : '1px solid rgba(240, 237, 232, 0.06)',
        boxShadow: card.isGold
          ? '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 168, 67, 0.04)'
          : '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '12px',
          color: 'var(--text-muted)',
        }}
      >
        {card.icon}
        {card.greenDot && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--status-green, #10B981)',
              display: 'inline-block',
              marginLeft: 'auto',
            }}
          />
        )}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px',
          fontWeight: 600,
          color: card.isGold ? 'var(--gold-mid)' : 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: '6px',
        }}
      >
        {card.animate ? displayVal : card.value}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-muted)',
        }}
      >
        {card.label}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   SECTION: Charts Row
   ───────────────────────────────────────────── */

const TIME_FILTERS = ['1M', '3M', '6M', '1Y', 'All']
const METRIC_TOGGLES = ['Families', 'Meals', 'Loans', 'Committed']

function ChartsRow({ positions }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '65fr 35fr',
        gap: '20px',
        marginBottom: '24px',
      }}
    >
      <PerformanceChart />
      <DonutChart positions={positions} />
    </div>
  )
}

function PerformanceChart() {
  const [timeFilter, setTimeFilter] = useState('1Y')
  const [metric, setMetric] = useState('Families')
  const pathRef = useRef(null)

  const dataPoints = useMemo(() => {
    const seed =
      TIME_FILTERS.indexOf(timeFilter) * 0.3 +
      METRIC_TOGGLES.indexOf(metric) * 0.5
    return generateRisingData(20, seed)
  }, [timeFilter, metric])

  const svgW = 520
  const svgH = 400
  const padX = 40
  const padY = 30
  const chartW = svgW - padX * 2
  const chartH = svgH - padY * 2

  const maxY = Math.max(...dataPoints.map((p) => p.y))
  const minY = Math.min(...dataPoints.map((p) => p.y))
  const rangeY = maxY - minY || 1

  const pointCoords = dataPoints.map((p, i) => ({
    x: padX + (i / (dataPoints.length - 1)) * chartW,
    y: padY + chartH - ((p.y - minY) / rangeY) * chartH,
  }))

  const linePath = pointCoords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pointCoords[pointCoords.length - 1].x},${padY + chartH} L${pointCoords[0].x},${padY + chartH} Z`

  // Animate path drawing on mount / data change
  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const length = el.getTotalLength()
    el.style.strokeDasharray = `${length}`
    el.style.strokeDashoffset = `${length}`
    el.getBoundingClientRect() // force reflow
    el.style.transition = 'stroke-dashoffset 1.2s ease-out'
    el.style.strokeDashoffset = '0'
  }, [dataPoints])

  return (
    <Card variant="glass" style={{ border: '1px solid rgba(240, 237, 232, 0.08)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Impact Over Time
        </h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: 'none',
                background:
                  timeFilter === tf ? 'var(--gold-mid)' : 'var(--bg-overlay, rgba(255,255,255,0.06))',
                color:
                  timeFilter === tf ? 'var(--bg-primary, #000)' : 'var(--text-muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: '100%', height: '400px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold-mid)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--gold-mid)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line
            key={i}
            x1={padX}
            y1={padY + chartH * frac}
            x2={padX + chartW}
            y2={padY + chartH * frac}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />
        {/* Line */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="var(--gold-mid)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots */}
        {pointCoords.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="var(--gold-mid)"
            opacity={i === pointCoords.length - 1 ? 1 : 0}
          />
        ))}
      </svg>

      {/* Metric toggle pills */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
        {METRIC_TOGGLES.map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              padding: '5px 14px',
              borderRadius: '14px',
              border:
                metric === m
                  ? '1px solid var(--gold-mid)'
                  : '1px solid var(--border-subtle)',
              background: metric === m ? 'var(--gold-glow, rgba(191,155,48,0.1))' : 'transparent',
              color: metric === m ? 'var(--gold-mid)' : 'var(--text-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </Card>
  )
}

function DonutChart({ positions }) {
  const [view, setView] = useState('cause') // 'cause' | 'region' | 'mode'

  // Compute segments for all three views
  const causeSegments = useMemo(() => {
    const totals = {}
    positions.forEach((p) => {
      const cat = p.category || 'community'
      totals[cat] = (totals[cat] || 0) + p.amount
    })
    const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return Object.entries(totals)
      .map(([key, amt]) => ({
        key, label: CATEGORY_LABELS[key] || key, amount: amt,
        percent: Math.round((amt / total) * 100),
        color: CATEGORY_COLORS[key] || '#6B7280',
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [positions])

  const regionSegments = useMemo(() => {
    const totals = {}
    positions.forEach((p) => {
      // Derive region from NGO data or category
      const regions = {
        'islamic-relief-usa': 'Yemen', 'zakat-foundation': 'Somalia',
        'penny-appeal-usa': 'Gaza', 'human-appeal-usa': 'Yemen',
        'hhrd': 'Pakistan', 'icna-relief': 'USA', 'imana': 'Syria',
        'muslim-aid-usa': 'Somalia',
      }
      const region = regions[p.ngoId] || (p.ngoId === 'jariyah-pool' ? 'USA' : 'Other')
      totals[region] = (totals[region] || 0) + p.amount
    })
    const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return Object.entries(totals)
      .map(([key, amt]) => ({
        key, label: key === 'Gaza' ? 'Gaza / Palestine' : key, amount: amt,
        percent: Math.round((amt / total) * 100),
        color: REGION_COLORS[key] || '#A78BFA',
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [positions])

  const modeSegments = useMemo(() => {
    const totals = { jariyah: 0, compound: 0, direct: 0 }
    positions.forEach((p) => {
      const mode = p.mode || (p.type === 'direct' ? 'direct' : 'compound')
      totals[mode] = (totals[mode] || 0) + p.amount
    })
    const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return Object.entries(totals)
      .filter(([, amt]) => amt > 0)
      .map(([key, amt]) => ({
        key, label: MODE_LABELS[key] || key, amount: amt,
        percent: Math.round((amt / total) * 100),
        color: MODE_COLORS[key] || '#6B7280',
        icon: MODE_ICONS[key] || '',
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [positions])

  const segments = view === 'cause' ? causeSegments : view === 'region' ? regionSegments : modeSegments

  // Concentration warning (cause view only)
  const concentrationWarning = useMemo(() => {
    if (view !== 'cause') return null
    const top = causeSegments[0]
    if (top && top.percent > 50) return top
    return null
  }, [view, causeSegments])

  const size = 200
  const strokeW = 30
  const radius = (size - strokeW) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let cumulativePercent = 0

  const VIEWS = [
    { key: 'cause', label: 'By Cause' },
    { key: 'region', label: 'By Region' },
    { key: 'mode', label: 'By Mode' },
  ]

  return (
    <Card variant="glass" style={{ border: '1px solid rgba(240, 237, 232, 0.08)' }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600,
        color: 'var(--text-primary)', margin: '0 0 12px 0',
      }}>
        Portfolio Composition
      </h3>

      {/* Toggle */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
        background: 'var(--bg-deep)', borderRadius: 'var(--radius-pill)', padding: '3px',
      }}>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => { cumulativePercent = 0; setView(v.key) }}
            style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 'var(--radius-pill)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 200ms',
              background: view === v.key ? 'var(--gold-glow-strong)' : 'transparent',
              color: view === v.key ? 'var(--text-gold)' : 'var(--text-tertiary)',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {(() => { cumulativePercent = 0; return null })()}
          {segments.map((seg, i) => {
            const offset = cumulativePercent
            cumulativePercent += seg.percent
            const dashLength = (seg.percent / 100) * circumference
            const dashGap = circumference - dashLength
            const rotation = (offset / 100) * 360 - 90

            return (
              <motion.circle
                key={`${view}-${seg.key}`}
                cx={cx} cy={cy} r={radius} fill="none"
                stroke={seg.color} strokeWidth={strokeW} strokeLinecap="butt"
                transform={`rotate(${rotation} ${cx} ${cy})`}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dashLength} ${dashGap}` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              />
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segments.map((seg) => (
          <div key={seg.key} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
              {seg.icon ? `${seg.icon} ` : ''}{seg.label}
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '11px' }}>
              ${seg.amount.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, width: 32, textAlign: 'right' }}>
              {seg.percent}%
            </span>
          </div>
        ))}
      </div>

      {/* Concentration warning */}
      {concentrationWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '12px', padding: '10px 12px',
            background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--status-yellow)', margin: 0, lineHeight: 1.5 }}>
            {concentrationWarning.percent}% concentrated in {concentrationWarning.label}. Consider broadening to other causes for a more resilient impact portfolio.
          </p>
        </motion.div>
      )}
    </Card>
  )
}

/* ─────────────────────────────────────────────
   SECTION: Holdings Grid
   ───────────────────────────────────────────── */

function HoldingsGrid({ positions, getNgoById, ngoLoading }) {
  const navigate = useNavigate()

  if (positions.length === 0) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '24px',
            color: 'var(--text-primary)',
            margin: '0 0 16px 0',
          }}
        >
          Your Holdings
        </h2>
        <Card>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: '24px 0',
              margin: 0,
            }}
          >
            No positions yet. Start your first investment to see holdings here.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '24px',
          color: 'var(--text-primary)',
          margin: '0 0 16px 0',
        }}
      >
        Your Holdings
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {positions.map((pos) => (
          <HoldingCard
            key={pos.id}
            position={pos}
            getNgoById={getNgoById}
            ngoLoading={ngoLoading}
            onClick={() => navigate(`/portfolio/journey/${pos.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function HoldingCard({ position, getNgoById, ngoLoading, onClick }) {
  const ngo = getNgoById(position.ngoId)
  const [logoError, setLogoError] = useState(false)

  const statusBadge = useMemo(() => {
    if (position.mode === 'jariyah') {
      return {
        text: 'Jariyah',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: 'var(--status-green, #10B981)',
      }
    }
    if (position.status === 'complete') {
      return {
        text: 'Complete',
        bg: 'rgba(59, 130, 246, 0.12)',
        color: 'var(--status-blue, #3B82F6)',
      }
    }
    // active standard
    const cycleText = position.cyclesTotal
      ? `Active \u2014 Cycle ${position.cyclesCurrent}/${position.cyclesTotal}`
      : 'Active'
    return {
      text: cycleText,
      bg: 'rgba(245, 158, 11, 0.12)',
      color: 'var(--status-yellow, #F59E0B)',
    }
  }, [position])

  const initial = position.ngoName ? position.ngoName.charAt(0) : '?'
  const initialColor = CATEGORY_COLORS[position.category] || 'var(--gold-mid)'

  const settlementDate = position.mode === 'jariyah'
    ? 'Perpetual'
    : position.estimatedCycleEndDate
      ? `Est. ${formatDate(position.estimatedCycleEndDate)}`
      : 'N/A'

  const borrower = position.currentBorrowers?.[0]

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      {/* Top: NGO + Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {ngoLoading ? (
            <Skeleton width={32} height={32} radius={16} />
          ) : ngo?.logo && !logoError ? (
            <img
              src={ngo.logo}
              alt={position.ngoName}
              onError={() => setLogoError(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: initialColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--bg-primary, #000)',
              }}
            >
              {initial}
            </div>
          )}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {position.ngoName}
          </span>
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '12px',
            background: statusBadge.bg,
            color: statusBadge.color,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Amount + Families */}
      <div style={{ marginBottom: '10px' }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--gold-mid)',
          }}
        >
          ${position.amount.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginLeft: '6px',
          }}
        >
          committed
        </span>
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '10px',
        }}
      >
        {position.familiesHelped} families helped
      </div>

      {/* Cycle progress bar (compound only) */}
      {position.type === 'compound' && position.status === 'active' && (
        <div style={{ marginBottom: '10px' }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'var(--bg-overlay, rgba(255,255,255,0.06))',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((position.cycleProgress || 0) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'var(--gold-mid)',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      )}

      {/* Borrower info (compound only) */}
      {borrower && position.type === 'compound' && (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}
        >
          {borrower.firstName}, {borrower.city} &mdash; {borrower.purpose}
        </div>
      )}

      {/* Settlement */}
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{settlementDate}</span>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   SECTION: Diversification Nudge
   ───────────────────────────────────────────── */

function DiversificationNudge({ positions, totalDeployed, ngoDatabase, dismissed, onDismiss }) {
  const analysis = useMemo(() => {
    if (totalDeployed === 0) return null
    const catTotals = {}
    positions.forEach((p) => {
      const cat = p.category || 'community'
      catTotals[cat] = (catTotals[cat] || 0) + p.amount
    })
    let maxCat = null
    let maxAmt = 0
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt
        maxCat = cat
      }
    })
    const maxPercent = (maxAmt / totalDeployed) * 100
    if (maxPercent <= 60) return null
    return { dominantCategory: maxCat, percent: Math.round(maxPercent), catTotals }
  }, [positions, totalDeployed])

  const suggestedNgos = useMemo(() => {
    if (!analysis) return []
    return ngoDatabase
      .filter((n) => n.category !== analysis.dominantCategory)
      .slice(0, 2)
  }, [analysis, ngoDatabase])

  if (!analysis || dismissed) return null

  const cats = Object.entries(analysis.catTotals)

  return (
    <div style={{ marginBottom: '24px' }}>
      <Card
        style={{
          border: '1px solid var(--border-gold, var(--gold-mid))',
          position: 'relative',
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 14px 0',
          }}
        >
          Diversification Insight
        </h3>

        {/* Stacked bar */}
        <div
          style={{
            display: 'flex',
            height: 12,
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          {cats.map(([cat, amt]) => (
            <div
              key={cat}
              style={{
                width: `${(amt / totalDeployed) * 100}%`,
                background: CATEGORY_COLORS[cat] || 'var(--text-muted)',
                transition: 'width 0.4s ease',
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: 1.5,
          }}
        >
          Your portfolio is heavily weighted toward{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {CATEGORY_LABELS[analysis.dominantCategory] || analysis.dominantCategory}
          </strong>
          . Consider diversifying to maximize your impact across different causes.
        </p>

        {/* Suggested NGOs */}
        {suggestedNgos.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {suggestedNgos.map((ngo) => (
              <div
                key={ngo.id}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-elevated, var(--bg-primary))',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {ngo.name}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    color: CATEGORY_COLORS[ngo.category] || 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {CATEGORY_LABELS[ngo.category] || ngo.category}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION: Jariyah Vault Preview
   ───────────────────────────────────────────── */

function JariyahVaultPreview({ vaultPersons }) {
  const navigate = useNavigate()
  const person = vaultPersons[0] // Ahmed Al-Farsi
  const latestEntry = person?.impactEntries?.[0]

  return (
    <div style={{ marginBottom: '24px' }}>
      <Card
        style={{
          borderLeft: '3px solid var(--gold-mid)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Jariyah Vault
          </h3>
          <button
            onClick={() => navigate('/portfolio/vault')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--gold-mid)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Manage Vault <ChevronRight size={14} />
          </button>
        </div>

        {person ? (
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {person.name}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '10px',
              }}
            >
              {person.relationship}
            </div>
            {latestEntry && (
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.6,
                  borderLeft: '2px solid var(--border-subtle)',
                  paddingLeft: '12px',
                }}
              >
                {latestEntry.text}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/portfolio/vault')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--gold-mid)',
              padding: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Open your first Jariyah account <ChevronRight size={16} />
          </button>
        )}
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION: AI Reflection Card
   ───────────────────────────────────────────── */

function AIReflectionCard() {
  return (
    <Card>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--text-muted)',
          marginBottom: '14px',
        }}
      >
        WEEKLY REFLECTION
      </div>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 500,
          fontStyle: 'italic',
          color: 'var(--gold-mid)',
          margin: '0 0 6px 0',
          lineHeight: 1.4,
        }}
      >
        &ldquo;Charity does not decrease wealth.&rdquo;
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--text-muted)',
          margin: '0 0 16px 0',
        }}
      >
        &mdash; Sahih Muslim
      </p>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: '0 0 18px 0',
          lineHeight: 1.7,
        }}
      >
        Your portfolio tells a story of consistency. 43 families helped, 23 days of unbroken
        giving. This is not merely generosity &mdash; it is the building of an akhirah that
        will outlast everything.
      </p>

      <button
        style={{
          background: 'none',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 18px',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold-mid)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
      >
        <BookOpen size={14} />
        View this week&apos;s reflection
        <ChevronRight size={14} />
      </button>
    </Card>
  )
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
   ───────────────────────────────────────────── */

export default function PortfolioDashboard() {
  const {
    positions,
    totalDeployed,
    totalFamiliesHelped,
    vaultPersons,
    streakCount,
  } = usePortfolio()

  const { ngoDatabase, ngoLoading, getNgoById } = useNGO()

  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  return (
    <div
      style={{
        padding: '24px 20px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Gold gradient mesh */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 400,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212, 168, 67, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Pulse keyframe (injected once) ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Section 1: Hero Stat Cards */}
      <HeroStatCards
        totalDeployed={totalDeployed}
        totalFamiliesHelped={totalFamiliesHelped}
        positions={positions}
      />

      {/* Section 2: Charts Row */}
      <ChartsRow positions={positions} />

      {/* Section 3: Holdings Grid */}
      <HoldingsGrid
        positions={positions}
        getNgoById={getNgoById}
        ngoLoading={ngoLoading}
      />

      {/* Section 4: Diversification Nudge */}
      <DiversificationNudge
        positions={positions}
        totalDeployed={totalDeployed}
        ngoDatabase={ngoDatabase}
        dismissed={nudgeDismissed}
        onDismiss={() => setNudgeDismissed(true)}
      />

      {/* Section 5: Jariyah Vault Preview */}
      <JariyahVaultPreview vaultPersons={vaultPersons} />

      {/* Section 6: AI Reflection Card */}
      <AIReflectionCard />

      {/* Bottom stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1,
        background: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', marginTop: 24,
      }}>
        {[
          { label: 'JARIYAH ACTIVE', value: positions.filter(p => p.mode === 'jariyah').length },
          { label: 'FAMILIES HELPED', value: totalFamiliesHelped },
          { label: 'MEALS FUNDED', value: Math.round(totalFamiliesHelped * 2.3) },
          { label: 'ACTIVE POSITIONS', value: positions.filter(p => p.status === 'active').length },
          { label: 'COMPOUND CYCLING', value: positions.filter(p => p.type === 'compound' && p.status === 'active').length },
          { label: 'DAYS STREAK', value: streakCount || 23 },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)', padding: '16px 12px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: i === 0 ? 'var(--status-green)' : 'var(--text-primary)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
