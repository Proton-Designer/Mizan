import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { useNGO } from '../../context/NGOContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Droplets, Utensils, RefreshCw, MapPin, ArrowRight,
  ChevronDown, Users, Globe, Repeat, Activity
} from 'lucide-react'

/* ── Mapbox imports (may fail if not installed) ── */
let MapGL, MarkerGL, PopupGL, SourceGL, LayerGL
let greatCircle
let mapboxCssLoaded = false

try {
  const mapModule = await import('react-map-gl/mapbox')
  MapGL = mapModule.default || mapModule.Map
  MarkerGL = mapModule.Marker
  PopupGL = mapModule.Popup
  SourceGL = mapModule.Source
  LayerGL = mapModule.Layer
  await import('mapbox-gl/dist/mapbox-gl.css')
  mapboxCssLoaded = true
} catch (e) {
  // mapbox not available
}

try {
  const turfModule = await import('@turf/great-circle')
  greatCircle = turfModule.default || turfModule.greatCircle
} catch (e) {
  // turf not available
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
const HAS_MAPBOX = !!(MAPBOX_TOKEN && MapGL)

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const CATEGORY_COLORS = {
  emergency: '#F87171',
  water: '#60A5FA',
  food: '#4ADE80',
  orphan: '#A78BFA',
  medical: '#EAB308',
  refugees: '#F97316',
  community: '#6366F1',
  education: '#FBBF24',
}

const COUNTRY_COORDS = {
  Yemen: [48.5, 15.5], Somalia: [46.2, 5.2], Palestine: [34.5, 31.5],
  Gaza: [34.5, 31.5], Pakistan: [69.3, 30.4], Bangladesh: [90.4, 23.7],
  Syria: [38.8, 34.8], Sudan: [30.2, 12.8], Morocco: [-5.0, 31.8],
  USA: [-97.7, 30.3],
}

const CITY_COORDS = {
  Dallas: [-96.8, 32.8], Houston: [-95.4, 29.8], Chicago: [-87.6, 41.9],
  Atlanta: [-84.4, 33.7], Detroit: [-83.0, 42.3], Minneapolis: [-93.3, 44.9],
  Austin: [-97.7, 30.3],
}

const AUSTIN = [-97.7, 30.3]

const ENTRY_TYPE_CONFIG = {
  investment: { color: 'var(--gold-mid, #D4A843)', icon: ArrowRight, label: 'Investment' },
  cycle: { color: '#14B8A6', icon: Repeat, label: 'Cycle' },
  borrower: { color: '#22C55E', icon: Users, label: 'Borrower' },
  ngo_update: { color: '#3B82F6', icon: Globe, label: 'NGO Update' },
}

/* ── SVG fallback continent paths moved below ── */

// (Donor density data removed — NGO-only feature)

/* ── SVG fallback paths ── */
const CONTINENT_PATHS = [
  'M 80 60 L 180 40 L 230 60 L 260 90 L 280 130 L 260 160 L 230 170 L 200 200 L 170 210 L 150 200 L 130 180 L 100 160 L 80 130 L 70 100 Z',
  'M 190 230 L 220 220 L 250 240 L 260 280 L 250 320 L 240 360 L 220 400 L 200 420 L 190 400 L 180 360 L 175 320 L 170 280 L 175 250 Z',
  'M 440 50 L 480 40 L 520 50 L 540 70 L 530 90 L 510 100 L 490 110 L 470 120 L 450 110 L 440 90 L 430 70 Z',
  'M 440 130 L 480 120 L 520 130 L 550 160 L 560 200 L 560 250 L 550 300 L 530 340 L 510 360 L 490 370 L 470 360 L 450 330 L 440 290 L 430 250 L 420 200 L 430 160 Z',
  'M 540 40 L 600 30 L 680 40 L 750 50 L 810 60 L 830 80 L 820 110 L 790 130 L 750 140 L 700 150 L 660 160 L 620 160 L 580 150 L 550 130 L 540 100 L 530 70 Z',
  'M 560 120 L 600 110 L 640 120 L 670 140 L 680 170 L 660 190 L 630 190 L 600 180 L 570 170 L 555 150 Z',
  'M 720 160 L 760 150 L 790 160 L 810 180 L 800 200 L 780 210 L 750 220 L 730 210 L 720 190 Z',
  'M 770 300 L 830 290 L 870 300 L 890 330 L 880 360 L 850 380 L 810 380 L 780 370 L 760 340 L 760 320 Z',
]

function lonLatToSvg(lon, lat) {
  const x = (lon + 180) * (1000 / 360)
  const y = (90 - lat) * (500 / 180)
  return [x, y]
}

/* ──────────────────────────────────────────────
   CSS / KEYFRAMES
   ────────────────────────────────────────────── */

const globalStyles = `
@keyframes pulse-ring-mapbox {
  0%   { transform: scale(1);   opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
@keyframes pulse-ring-svg {
  0%   { r: 6;  opacity: 0.6; }
  100% { r: 14; opacity: 0; }
}
@keyframes dash-flow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}
.mapboxgl-ctrl-logo,
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
  display: none !important;
}
`

/* ──────────────────────────────────────────────
   HOOKS
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
   HELPERS
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

function buildArcGeoJSON(from, to) {
  if (!greatCircle) return null
  try {
    const arc = greatCircle(from, to, { npoints: 64 })
    return arc
  } catch {
    return null
  }
}

/* ──────────────────────────────────────────────
   CAUSE PIN (Mapbox marker)
   ────────────────────────────────────────────── */

function CauseMarkerContent({ color }) {
  return (
    <div style={{ position: 'relative', width: 24, height: 24 }}>
      {/* pulsing ring */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: 24, height: 24,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        animation: 'pulse-ring-mapbox 2s ease-out infinite',
        transformOrigin: 'center',
      }} />
      {/* filled circle */}
      <div style={{
        position: 'absolute',
        top: 6, left: 6,
        width: 12, height: 12,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}88`,
      }} />
    </div>
  )
}

function BorrowerMarkerContent() {
  return (
    <div style={{
      width: 10, height: 10,
      borderRadius: '50%',
      background: '#D4A843',
      border: '2px solid #fff',
      boxShadow: '0 0 6px rgba(212,168,67,0.6)',
    }} />
  )
}

/* ──────────────────────────────────────────────
   WORLD IMPACT MAP VIEW (Mapbox)
   ────────────────────────────────────────────── */

function WorldImpactView({ causePins, borrowerPins }) {
  const [popup, setPopup] = useState(null)
  const [dashOffset, setDashOffset] = useState(0)
  const rafRef = useRef()

  // Animate dash offset
  useEffect(() => {
    let offset = 0
    function animate() {
      offset = (offset + 0.15) % 20
      setDashOffset(offset)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Build arc GeoJSON
  const arcGeoJSON = useMemo(() => {
    const features = []

    // Austin -> borrower cities -> destination countries
    borrowerPins.forEach(bp => {
      const arc = buildArcGeoJSON(AUSTIN, [bp.lon, bp.lat])
      if (arc) features.push(arc)
    })

    causePins.forEach(cp => {
      const arc = buildArcGeoJSON(AUSTIN, [cp.lon, cp.lat])
      if (arc) features.push(arc)
    })

    return { type: 'FeatureCollection', features }
  }, [causePins, borrowerPins])

  const lineLayer = {
    id: 'flight-paths',
    type: 'line',
    paint: {
      'line-color': 'rgba(212,168,67,0.5)',
      'line-width': 1.5,
      'line-dasharray': [4, 4],
    },
  }

  return (
    <MapGL
      initialViewState={{ longitude: 20, latitude: 15, zoom: 2 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      dragRotate={false}
      attributionControl={false}
    >
      {/* Arc lines */}
      {arcGeoJSON.features.length > 0 && (
        <SourceGL id="arcs" type="geojson" data={arcGeoJSON}>
          <LayerGL {...lineLayer} />
        </SourceGL>
      )}

      {/* Cause pins */}
      {causePins.map(pin => (
        <MarkerGL
          key={pin.id}
          longitude={pin.lon}
          latitude={pin.lat}
          anchor="center"
        >
          <div
            onMouseEnter={() => setPopup(pin)}
            onMouseLeave={() => setPopup(null)}
            style={{ cursor: 'pointer' }}
          >
            <CauseMarkerContent color={pin.color} />
          </div>
        </MarkerGL>
      ))}

      {/* Borrower pins */}
      {borrowerPins.map(pin => (
        <MarkerGL
          key={pin.id}
          longitude={pin.lon}
          latitude={pin.lat}
          anchor="center"
        >
          <div
            onMouseEnter={() => setPopup({ ...pin, isBorrower: true })}
            onMouseLeave={() => setPopup(null)}
            style={{ cursor: 'pointer' }}
          >
            <BorrowerMarkerContent />
          </div>
        </MarkerGL>
      ))}

      {/* Austin origin */}
      <MarkerGL longitude={AUSTIN[0]} latitude={AUSTIN[1]} anchor="center">
        <div style={{ position: 'relative', width: 20, height: 20 }}>
          <div style={{
            position: 'absolute', top: 4, left: 4,
            width: 12, height: 12, borderRadius: '50%',
            background: '#D4A843',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 20, height: 20, borderRadius: '50%',
            border: '2px solid #D4A843',
            animation: 'pulse-ring-mapbox 2s ease-out infinite',
            transformOrigin: 'center',
          }} />
        </div>
      </MarkerGL>

      {/* Popup */}
      {popup && (
        <PopupGL
          longitude={popup.lon}
          latitude={popup.lat}
          anchor="bottom"
          closeButton={false}
          closeOnClick={false}
          offset={16}
        >
          <div style={{
            background: 'var(--bg-elevated, #1a1a2e)',
            border: '1px solid #D4A843',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            color: '#fff',
            minWidth: 120,
          }}>
            {popup.isBorrower ? (
              <>
                <div style={{ fontWeight: 600 }}>{popup.firstName}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                  {popup.city}, {popup.state} &middot; {popup.purpose}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600 }}>{popup.ngoName}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                  {popup.country} &middot; ${popup.amount}
                </div>
                <div style={{ fontSize: 11, color: '#aaa' }}>
                  {popup.familiesHelped} families helped
                </div>
              </>
            )}
          </div>
        </PopupGL>
      )}
    </MapGL>
  )
}

/* ──────────────────────────────────────────────

/* ──────────────────────────────────────────────
   SVG FALLBACK MAP (no Mapbox token)
   ────────────────────────────────────────────── */

function SvgFallbackMap({ causePins, borrowerPins }) {
  const [hoveredPin, setHoveredPin] = useState(null)

  const svgCausePins = useMemo(() =>
    causePins.map(pin => {
      const [x, y] = lonLatToSvg(pin.lon, pin.lat)
      return { ...pin, x, y }
    }), [causePins])

  const svgBorrowerPins = useMemo(() =>
    borrowerPins.map(pin => {
      const [x, y] = lonLatToSvg(pin.lon, pin.lat)
      return { ...pin, x, y }
    }), [borrowerPins])

  const austinSvg = lonLatToSvg(AUSTIN[0], AUSTIN[1])

  return (
    <svg viewBox="0 0 1000 500" width="100%" height="100%" style={{ display: 'block' }}>
      {CONTINENT_PATHS.map((d, i) => (
        <path key={i} d={d} fill="var(--bg-elevated, #1a1a2e)" stroke="var(--border-subtle, #333)" strokeWidth={0.5} />
      ))}

      {/* Lines */}
      {svgCausePins.map(pin => (
        <line key={`l-${pin.id}`}
          x1={austinSvg[0]} y1={austinSvg[1]} x2={pin.x} y2={pin.y}
          stroke="#D4A843" strokeOpacity={0.25} strokeWidth={1}
          strokeDasharray="6 4" style={{ animation: 'dash-flow 2s linear infinite' }}
        />
      ))}
      {svgBorrowerPins.map(pin => (
        <line key={`l-${pin.id}`}
          x1={austinSvg[0]} y1={austinSvg[1]} x2={pin.x} y2={pin.y}
          stroke="#D4A843" strokeOpacity={0.25} strokeWidth={1}
          strokeDasharray="6 4" style={{ animation: 'dash-flow 2s linear infinite' }}
        />
      ))}

      {/* Austin */}
      <circle cx={austinSvg[0]} cy={austinSvg[1]} r={4} fill="#D4A843" />
      <circle cx={austinSvg[0]} cy={austinSvg[1]} r={4} fill="none" stroke="#D4A843" strokeWidth={1} opacity={0.5}>
        <animate attributeName="r" from="4" to="10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Cause pins */}
      {svgCausePins.map(pin => (
        <g key={pin.id}
          onMouseEnter={() => setHoveredPin(pin.id)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={pin.x} cy={pin.y} r={6} fill="none" stroke={pin.color} strokeWidth={1.5} opacity={0.6}>
            <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={pin.x} cy={pin.y} r={6} fill={pin.color} />
        </g>
      ))}

      {/* Borrower pins */}
      {svgBorrowerPins.map(pin => (
        <g key={pin.id}
          onMouseEnter={() => setHoveredPin(`bor-${pin.id}`)}
          onMouseLeave={() => setHoveredPin(null)}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={pin.x} cy={pin.y} r={4} fill="#D4A843" />
        </g>
      ))}

      {/* Tooltips */}
      {svgCausePins.map(pin => hoveredPin === pin.id && (
        <foreignObject key={`tt-${pin.id}`} x={Math.min(Math.max(pin.x, 80), 920) - 75} y={pin.y - 90} width={150} height={60} style={{ pointerEvents: 'none', overflow: 'visible' }}>
          <div style={{
            background: 'var(--bg-elevated, #1a1a2e)', border: '1px solid #D4A843',
            borderRadius: 8, padding: '6px 10px', fontSize: 11,
            fontFamily: "'DM Sans', sans-serif", color: '#fff',
            whiteSpace: 'nowrap', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontWeight: 600 }}>{pin.ngoName}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>{pin.country} &middot; {pin.familiesHelped} families &middot; ${pin.amount}</div>
          </div>
        </foreignObject>
      ))}
      {svgBorrowerPins.map(pin => hoveredPin === `bor-${pin.id}` && (
        <foreignObject key={`tt-bor-${pin.id}`} x={Math.min(Math.max(pin.x, 80), 920) - 75} y={pin.y - 90} width={150} height={60} style={{ pointerEvents: 'none', overflow: 'visible' }}>
          <div style={{
            background: 'var(--bg-elevated, #1a1a2e)', border: '1px solid #D4A843',
            borderRadius: 8, padding: '6px 10px', fontSize: 11,
            fontFamily: "'DM Sans', sans-serif", color: '#fff',
            whiteSpace: 'nowrap', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontWeight: 600 }}>{pin.firstName}</div>
            <div style={{ fontSize: 10, color: '#aaa' }}>{pin.city}, {pin.state} &middot; {pin.purpose}</div>
          </div>
        </foreignObject>
      ))}
    </svg>
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
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          color: 'var(--text-tertiary, #666)', textTransform: 'uppercase',
          letterSpacing: '0.04em', fontWeight: 500,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28, fontWeight: 600,
        color: 'var(--text-primary, #fff)', lineHeight: 1,
      }}>
        {value.toLocaleString()}
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */

export default function Journey() {
  const navigate = useNavigate()
  const { positions, journeyLog } = usePortfolio()
  const { getNgoById } = useNGO()

  const activeView = 'world'
  const [visibleEntries, setVisibleEntries] = useState(10)

  /* ── Derive cause pins ── */
  const causePins = useMemo(() => {
    const pins = []
    const seen = new Set()
    positions.forEach(pos => {
      const ngo = getNgoById(pos.ngoId)
      if (!ngo) return
      const countries = ngo.countriesOfOperation || []
      countries.forEach(country => {
        const coords = COUNTRY_COORDS[country]
        if (!coords) return
        const key = `${pos.ngoId}-${country}`
        if (seen.has(key)) return
        seen.add(key)
        pins.push({
          id: key,
          lon: coords[0], lat: coords[1],
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
        const coords = CITY_COORDS[bor.city]
        if (!coords) return
        const key = `${bor.firstName}-${bor.city}`
        if (seen.has(key)) return
        seen.add(key)
        pins.push({
          id: key,
          lon: coords[0], lat: coords[1],
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
      if (cat === 'food') mealsFunded += Math.round(pos.amount * ipd)
      if (cat === 'water') waterDays += Math.round(pos.amount * ipd)
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
  const getNgoLogo = useCallback((ngoId) => {
    if (!ngoId) return null
    const ngo = getNgoById(ngoId)
    return ngo?.logo || null
  }, [getNgoById])

  /* ── RENDER ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <style>{globalStyles}</style>

      {/* Header */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32, fontWeight: 500,
        color: 'var(--text-primary)', marginBottom: 4,
      }}>
        Your Journey
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24,
      }}>
        Track your impact across the world
      </p>

      {/* Two-panel grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '55fr 45fr',
        gap: 24,
      }}>
        {/* ── LEFT PANEL ── */}
        <div>
          {/* Toggle pill selector */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 12,
            alignItems: 'center',
          }}>
            {[
              { key: 'world', label: '\uD83C\uDF0D World Impact' },
            ].map(tab => (
              <span
                key={tab.key}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {tab.label}
              </span>
            ))}
          </div>

          {/* Map container */}
          <div style={{
            height: 420,
            width: '100%',
            background: 'var(--bg-void, #0a0a1a)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-subtle, #222)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Vignette overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 40%, var(--bg-deep, #0a0a1a) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
              borderRadius: 'var(--radius-lg, 16px)',
            }} />

            {/* Map content */}
            <div style={{ width: '100%', height: '100%' }}>
              {HAS_MAPBOX ? (
                <WorldImpactView causePins={causePins} borrowerPins={borrowerPins} />
              ) : (
                <SvgFallbackMap causePins={causePins} borrowerPins={borrowerPins} />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Impact Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
              fontSize: 18, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Activity size={16} style={{ color: 'var(--gold-mid, #D4A843)' }} />
              Journey Log
            </h3>

            {Object.entries(groupedLog).map(([group, entries]) => {
              if (entries.length === 0) return null
              return (
                <div key={group} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                    color: 'var(--text-tertiary, #666)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', marginBottom: 8,
                  }}>
                    {group}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entries.map((entry, idx) => {
                      const config = ENTRY_TYPE_CONFIG[entry.type] || ENTRY_TYPE_CONFIG.investment
                      const Icon = config.icon
                      const logo = getNgoLogo(entry.ngoId)

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                          onClick={() => entry.positionId && navigate(`/portfolio/journey/${entry.positionId}`)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '10px 12px',
                            background: 'var(--bg-elevated, #1a1a2e)',
                            borderRadius: 'var(--radius-md, 10px)',
                            borderLeft: `3px solid ${entry.accentColor || config.color}`,
                            cursor: entry.positionId ? 'pointer' : 'default',
                            transition: 'background 0.15s',
                          }}
                          whileHover={entry.positionId ? { backgroundColor: 'rgba(255,255,255,0.04)' } : undefined}
                        >
                          {/* Icon / logo */}
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: `${entry.accentColor || config.color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, overflow: 'hidden', marginTop: 1,
                          }}>
                            {entry.type === 'investment' && logo ? (
                              <img
                                src={logo} alt="" width={18} height={18}
                                style={{ borderRadius: '50%', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                              />
                            ) : null}
                            <div style={{
                              display: (entry.type === 'investment' && logo) ? 'none' : 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              width: '100%', height: '100%',
                            }}>
                              {entry.ngoName && !logo ? (
                                <span style={{
                                  fontSize: 12, fontWeight: 700,
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
                              fontSize: 13, color: 'var(--text-primary, #fff)', lineHeight: 1.4,
                            }}>
                              {entry.text}
                            </div>
                            <div style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 11, color: 'var(--text-tertiary, #666)',
                              marginTop: 3, display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                              <span style={{
                                display: 'inline-block', width: 6, height: 6,
                                borderRadius: '50%',
                                background: entry.accentColor || config.color, flexShrink: 0,
                              }} />
                              {config.label}
                              <span style={{ opacity: 0.5 }}>&middot;</span>
                              {relativeTime(entry.timestamp)}
                            </div>
                          </div>

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
                  width: '100%', padding: '10px 0', background: 'none',
                  border: '1px solid var(--border-subtle, #222)',
                  borderRadius: 'var(--radius-md, 10px)',
                  color: 'var(--text-secondary, #aaa)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6, marginTop: 8,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A843'; e.currentTarget.style.color = 'var(--text-primary, #fff)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle, #222)'; e.currentTarget.style.color = 'var(--text-secondary, #aaa)' }}
              >
                <ChevronDown size={14} />
                Load more ({journeyLog.length - visibleEntries} remaining)
              </button>
            )}

            {journeyLog.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '32px 0',
                color: 'var(--text-tertiary, #666)',
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
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
