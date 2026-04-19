import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { useNGO } from '../../context/NGOContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Droplets, Utensils, RefreshCw, MapPin, ArrowRight,
  ChevronDown, Users, Globe, Repeat, Activity
} from 'lucide-react'

/* ──────────────────────────────────────────────
   COORDINATE HELPERS
   ────────────────────────────────────────────── */

function lonLatToSvg(lon, lat) {
  const x = (lon + 180) * (1000 / 360)
  const y = (90 - lat) * (500 / 180)
  return [x, y]
}

const CATEGORY_COLORS = {
  emergency: '#EF4444',
  water: '#3B82F6',
  food: '#22C55E',
  orphan: '#A855F7',
  medical: '#EAB308',
  refugees: '#F97316',
  community: '#6366F1',
  education: '#14B8A6',
}

const NGO_COUNTRY_COORDS = {
  Yemen: [48.5, 15.5],
  Somalia: [46.2, 5.2],
  Palestine: [34.5, 31.5],
  Pakistan: [69.3, 30.4],
  Bangladesh: [90.4, 23.7],
  Syria: [38.8, 34.8],
  Sudan: [30.2, 15.5],
  Morocco: [-7.1, 31.8],
  Lebanon: [35.5, 33.9],
  USA: [-98.6, 39.8],
}

const BORROWER_CITY_COORDS = {
  Dallas: [-96.8, 32.8],
  Houston: [-95.4, 29.8],
  Chicago: [-87.6, 41.9],
  Detroit: [-83.0, 42.3],
  Minneapolis: [-93.3, 44.9],
  Atlanta: [-84.4, 33.7],
  'New York': [-74.0, 40.7],
  Philadelphia: [-75.2, 40.0],
}

const AUSTIN = [-97.7, 30.3]

const ENTRY_TYPE_CONFIG = {
  investment: { color: 'var(--gold-mid, #D4A843)', icon: ArrowRight, label: 'Investment' },
  cycle: { color: '#14B8A6', icon: Repeat, label: 'Cycle' },
  borrower: { color: '#22C55E', icon: Users, label: 'Borrower' },
  ngo_update: { color: '#3B82F6', icon: Globe, label: 'NGO Update' },
}

/* ──────────────────────────────────────────────
   SIMPLIFIED CONTINENT PATHS
   ────────────────────────────────────────────── */

const CONTINENT_PATHS = [
  // North America
  'M 80 60 L 180 40 L 230 60 L 260 90 L 280 130 L 260 160 L 230 170 L 200 200 L 170 210 L 150 200 L 130 180 L 100 160 L 80 130 L 70 100 Z',
  // South America
  'M 190 230 L 220 220 L 250 240 L 260 280 L 250 320 L 240 360 L 220 400 L 200 420 L 190 400 L 180 360 L 175 320 L 170 280 L 175 250 Z',
  // Europe
  'M 440 50 L 480 40 L 520 50 L 540 70 L 530 90 L 510 100 L 490 110 L 470 120 L 450 110 L 440 90 L 430 70 Z',
  // Africa
  'M 440 130 L 480 120 L 520 130 L 550 160 L 560 200 L 560 250 L 550 300 L 530 340 L 510 360 L 490 370 L 470 360 L 450 330 L 440 290 L 430 250 L 420 200 L 430 160 Z',
  // Asia
  'M 540 40 L 600 30 L 680 40 L 750 50 L 810 60 L 830 80 L 820 110 L 790 130 L 750 140 L 700 150 L 660 160 L 620 160 L 580 150 L 550 130 L 540 100 L 530 70 Z',
  // Middle East / South Asia
  'M 560 120 L 600 110 L 640 120 L 670 140 L 680 170 L 660 190 L 630 190 L 600 180 L 570 170 L 555 150 Z',
  // Southeast Asia
  'M 720 160 L 760 150 L 790 160 L 810 180 L 800 200 L 780 210 L 750 220 L 730 210 L 720 190 Z',
  // Australia
  'M 770 300 L 830 290 L 870 300 L 890 330 L 880 360 L 850 380 L 810 380 L 780 370 L 760 340 L 760 320 Z',
]

/* ──────────────────────────────────────────────
   KEYFRAMES STYLE
   ────────────────────────────────────────────── */

const keyframesStyle = `
@keyframes pulse-ring {
  0% { r: 6; opacity: 0.6; }
  100% { r: 14; opacity: 0; }
}
@keyframes dash-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}
`

/* ──────────────────────────────────────────────
   ANIMATED COUNTER HOOK
   ────────────────────────────────────────────── */

function useAnimatedCounter(target, delay = 0, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const timeout = setTimeout(() => {
      const start = performance.now()
      function tick(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // ease out quad
        const eased = 1 - (1 - progress) * (1 - progress)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, delay, duration])
  return value
}

/* ──────────────────────────────────────────────
   RELATIVE TIME
   ────────────────────────────────────────────── */

function relativeTime(timestamp) {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function dateGroup(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffDays = Math.floor((now - then) / 86400000)
  if (diffDays < 1) return 'Today'
  if (diffDays < 7) return 'This Week'
  return 'Earlier'
}

/* ──────────────────────────────────────────────
   TOOLTIP COMPONENT
   ────────────────────────────────────────────── */

function PinTooltip({ x, y, children, visible }) {
  if (!visible) return null
  // Clamp tooltip position within SVG viewport
  const tooltipX = Math.min(Math.max(x, 80), 920)
  const tooltipY = y - 40
  return (
    <foreignObject x={tooltipX - 75} y={tooltipY - 50} width={150} height={60} style={{ pointerEvents: 'none', overflow: 'visible' }}>
      <div style={{
        background: 'var(--bg-elevated, #1a1a2e)',
        border: '1px solid var(--border-subtle, #333)',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 11,
        fontFamily: "'DM Sans', sans-serif",
        color: 'var(--text-primary, #fff)',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}>
        {children}
      </div>
    </foreignObject>
  )
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export default function Journey() {
  const navigate = useNavigate()
  const { positions, journeyLog } = usePortfolio()
  const { getNgoById } = useNGO()

  const [hoveredPin, setHoveredPin] = useState(null)
  const [visibleEntries, setVisibleEntries] = useState(10)

  /* ── Derive cause pins from positions ── */
  const causePins = useMemo(() => {
    const pins = []
    const seen = new Set()
    positions.forEach(pos => {
      const ngo = getNgoById(pos.ngoId)
      if (!ngo) return
      const countries = ngo.countriesOfOperation || []
      countries.forEach(country => {
        const coords = NGO_COUNTRY_COORDS[country]
        if (!coords) return
        const key = `${pos.ngoId}-${country}`
        if (seen.has(key)) return
        seen.add(key)
        const [x, y] = lonLatToSvg(coords[0], coords[1])
        pins.push({
          id: key,
          x, y,
          color: CATEGORY_COLORS[pos.category] || CATEGORY_COLORS[ngo.category] || '#6366F1',
          ngoName: ngo.name,
          country,
          familiesHelped: pos.familiesHelped || 0,
          amount: pos.amount,
          category: pos.category || ngo.category,
        })
      })
    })
    return pins
  }, [positions, getNgoById])

  /* ── Derive borrower pins ── */
  const borrowerPins = useMemo(() => {
    const pins = []
    const seen = new Set()
    positions.forEach(pos => {
      if (!pos.currentBorrowers) return
      pos.currentBorrowers.forEach(bor => {
        const coords = BORROWER_CITY_COORDS[bor.city]
        if (!coords) return
        const key = `${bor.firstName}-${bor.city}`
        if (seen.has(key)) return
        seen.add(key)
        const [x, y] = lonLatToSvg(coords[0], coords[1])
        pins.push({
          id: key,
          x, y,
          firstName: bor.firstName,
          city: bor.city,
          state: bor.state,
          purpose: bor.purpose,
          loanAmount: bor.loanAmount,
        })
      })
    })
    return pins
  }, [positions])

  /* ── Connection lines: Austin -> borrower cities -> cause countries ── */
  const connectionLines = useMemo(() => {
    const lines = []
    const austinSvg = lonLatToSvg(AUSTIN[0], AUSTIN[1])

    // Austin to borrower cities
    borrowerPins.forEach(bp => {
      lines.push({ id: `aus-${bp.id}`, x1: austinSvg[0], y1: austinSvg[1], x2: bp.x, y2: bp.y })
    })

    // Austin to cause countries (direct)
    causePins.forEach(cp => {
      lines.push({ id: `aus-${cp.id}`, x1: austinSvg[0], y1: austinSvg[1], x2: cp.x, y2: cp.y })
    })

    return lines
  }, [borrowerPins, causePins])

  /* ── Impact counters ── */
  const stats = useMemo(() => {
    let familiesHelped = 0
    let mealsFunded = 0
    let loansCycled = 0
    let waterDays = 0

    positions.forEach(pos => {
      familiesHelped += pos.familiesHelped || 0
      if (pos.cyclesCurrent > 0) loansCycled++

      const ngo = getNgoById(pos.ngoId)
      const cat = pos.category || ngo?.category
      const ipd = ngo?.impactPerDollar || 2

      if (cat === 'food') {
        mealsFunded += Math.round(pos.amount * ipd)
      }
      if (cat === 'water') {
        waterDays += Math.round(pos.amount * ipd)
      }
    })

    return { familiesHelped, mealsFunded, loansCycled, waterDays }
  }, [positions, getNgoById])

  const animFamilies = useAnimatedCounter(stats.familiesHelped, 0)
  const animMeals = useAnimatedCounter(stats.mealsFunded, 150)
  const animLoans = useAnimatedCounter(stats.loansCycled, 300)
  const animWater = useAnimatedCounter(stats.waterDays, 450)

  /* ── Journey log grouping ── */
  const groupedLog = useMemo(() => {
    const groups = { 'Today': [], 'This Week': [], 'Earlier': [] }
    const entries = journeyLog.slice(0, visibleEntries)
    entries.forEach(entry => {
      const group = dateGroup(entry.timestamp)
      groups[group].push(entry)
    })
    return groups
  }, [journeyLog, visibleEntries])

  const hasMore = journeyLog.length > visibleEntries

  /* ── NGO logo helper ── */
  const getNgoLogo = useCallback((ngoId, ngoName) => {
    if (!ngoId) return null
    const ngo = getNgoById(ngoId)
    return ngo?.logo || null
  }, [getNgoById])

  /* ── Render ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{keyframesStyle}</style>

      {/* Header */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        Your Journey
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginBottom: 24,
      }}>
        Track your impact across the world
      </p>

      {/* Two-panel grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '55fr 45fr',
        gap: 24,
      }}>
        {/* ── LEFT PANEL: World Map ── */}
        <div style={{
          aspectRatio: '2 / 1',
          background: 'var(--bg-void, #0a0a1a)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-subtle, #222)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <svg
            viewBox="0 0 1000 500"
            width="100%"
            height="100%"
            style={{ display: 'block' }}
          >
            {/* Continent shapes */}
            {CONTINENT_PATHS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="var(--bg-elevated, #1a1a2e)"
                stroke="var(--border-subtle, #333)"
                strokeWidth={0.5}
              />
            ))}

            {/* Connection lines */}
            {connectionLines.map(line => (
              <line
                key={line.id}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="var(--gold-mid, #D4A843)"
                strokeOpacity={0.25}
                strokeWidth={1}
                strokeDasharray="6 4"
                style={{ animation: 'dash-flow 2s linear infinite' }}
              />
            ))}

            {/* Austin origin marker */}
            {(() => {
              const [ax, ay] = lonLatToSvg(AUSTIN[0], AUSTIN[1])
              return (
                <g>
                  <circle cx={ax} cy={ay} r={4} fill="var(--gold-mid, #D4A843)" />
                  <circle cx={ax} cy={ay} r={4} fill="none" stroke="var(--gold-mid, #D4A843)" strokeWidth={1} opacity={0.5}>
                    <animate attributeName="r" from="4" to="10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              )
            })()}

            {/* Cause Pins */}
            {causePins.map(pin => (
              <g
                key={pin.id}
                onMouseEnter={() => setHoveredPin(pin.id)}
                onMouseLeave={() => setHoveredPin(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulsing outer ring */}
                <circle
                  cx={pin.x} cy={pin.y} r={6}
                  fill="none" stroke={pin.color} strokeWidth={1.5}
                  opacity={0.6}
                  style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                >
                  <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Main pin */}
                <circle cx={pin.x} cy={pin.y} r={6} fill={pin.color} />
              </g>
            ))}

            {/* Borrower Pins */}
            {borrowerPins.map(pin => (
              <g
                key={pin.id}
                onMouseEnter={() => setHoveredPin(`bor-${pin.id}`)}
                onMouseLeave={() => setHoveredPin(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pin.x} cy={pin.y} r={4} fill="var(--gold-mid, #D4A843)" />
              </g>
            ))}

            {/* Tooltips */}
            {causePins.map(pin => (
              <PinTooltip key={`tt-${pin.id}`} x={pin.x} y={pin.y} visible={hoveredPin === pin.id}>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{pin.ngoName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary, #aaa)' }}>
                  {pin.country} &middot; {pin.familiesHelped} families &middot; ${pin.amount}
                </div>
              </PinTooltip>
            ))}
            {borrowerPins.map(pin => (
              <PinTooltip key={`tt-bor-${pin.id}`} x={pin.x} y={pin.y} visible={hoveredPin === `bor-${pin.id}`}>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{pin.firstName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary, #aaa)' }}>
                  {pin.city}, {pin.state} &middot; {pin.purpose}
                </div>
              </PinTooltip>
            ))}
          </svg>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Impact Counters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            <StatCard icon={<Heart size={18} />} label="Families Helped" value={animFamilies} color="#EF4444" />
            <StatCard icon={<Utensils size={18} />} label="Meals Funded" value={animMeals} color="#22C55E" />
            <StatCard icon={<RefreshCw size={18} />} label="Loans Cycled" value={animLoans} color="#14B8A6" />
            <StatCard icon={<Droplets size={18} />} label="Water Days" value={animWater} color="#3B82F6" />
          </div>

          {/* Journey Log */}
          <div style={{
            background: 'var(--bg-surface, #111)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-subtle, #222)',
            padding: 16,
            maxHeight: 'calc(100vh - 400px)',
            overflowY: 'auto',
            minHeight: 200,
          }}>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Activity size={16} style={{ color: 'var(--gold-mid, #D4A843)' }} />
              Journey Log
            </h3>

            {Object.entries(groupedLog).map(([group, entries]) => {
              if (entries.length === 0) return null
              return (
                <div key={group} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-tertiary, #666)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}>
                    {group}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entries.map((entry, idx) => {
                      const config = ENTRY_TYPE_CONFIG[entry.type] || ENTRY_TYPE_CONFIG.investment
                      const Icon = config.icon
                      const logo = getNgoLogo(entry.ngoId, entry.ngoName)

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                          onClick={() => entry.positionId && navigate(`/portfolio/journey/${entry.positionId}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '10px 12px',
                            background: 'var(--bg-elevated, #1a1a2e)',
                            borderRadius: 'var(--radius-md, 10px)',
                            borderLeft: `3px solid ${entry.accentColor || config.color}`,
                            cursor: entry.positionId ? 'pointer' : 'default',
                            transition: 'background 0.15s',
                          }}
                          whileHover={entry.positionId ? { backgroundColor: 'rgba(255,255,255,0.04)' } : undefined}
                        >
                          {/* Icon or NGO logo */}
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: `${entry.accentColor || config.color}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                            marginTop: 1,
                          }}>
                            {entry.type === 'investment' && logo ? (
                              <img
                                src={logo}
                                alt=""
                                width={18}
                                height={18}
                                style={{ borderRadius: '50%', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                              />
                            ) : null}
                            <div style={{
                              display: (entry.type === 'investment' && logo) ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                            }}>
                              {entry.ngoName && !logo ? (
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: entry.accentColor || config.color,
                                  fontFamily: "'DM Sans', sans-serif",
                                }}>
                                  {entry.ngoName.charAt(0)}
                                </span>
                              ) : (
                                <Icon size={14} color={entry.accentColor || config.color} />
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 13,
                              color: 'var(--text-primary, #fff)',
                              lineHeight: 1.4,
                            }}>
                              {entry.text}
                            </div>
                            <div style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 11,
                              color: 'var(--text-tertiary, #666)',
                              marginTop: 3,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: entry.accentColor || config.color,
                                flexShrink: 0,
                              }} />
                              {config.label}
                              <span style={{ opacity: 0.5 }}>&middot;</span>
                              {relativeTime(entry.timestamp)}
                            </div>
                          </div>

                          {/* Arrow for navigable entries */}
                          {entry.positionId && (
                            <ArrowRight size={14} color="var(--text-tertiary, #666)" style={{ flexShrink: 0, marginTop: 4 }} />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => setVisibleEntries(prev => prev + 10)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: 'none',
                  border: '1px solid var(--border-subtle, #222)',
                  borderRadius: 'var(--radius-md, 10px)',
                  color: 'var(--text-secondary, #aaa)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 8,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-mid, #D4A843)'; e.currentTarget.style.color = 'var(--text-primary, #fff)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle, #222)'; e.currentTarget.style.color = 'var(--text-secondary, #aaa)' }}
              >
                <ChevronDown size={14} />
                Load more ({journeyLog.length - visibleEntries} remaining)
              </button>
            )}

            {journeyLog.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--text-tertiary, #666)',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Your journey begins when you make your first investment.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────
   STAT CARD
   ────────────────────────────────────────────── */

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'var(--bg-surface, #111)',
        borderRadius: 'var(--radius-md, 10px)',
        border: '1px solid var(--border-subtle, #222)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'var(--text-tertiary, #666)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text-primary, #fff)',
        lineHeight: 1,
      }}>
        {value.toLocaleString()}
      </div>
    </motion.div>
  )
}
