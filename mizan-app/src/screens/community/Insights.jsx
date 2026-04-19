import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunity } from '../../context/CommunityContext'
import {
  TrendingUp, Users, Globe, Calendar, Star,
  ArrowUpRight, CheckCircle, X, Download,
  ChevronDown, ChevronUp, Zap, Heart, Shield
} from 'lucide-react'

/* ---------------------------------------------------------------------------
   Constants & Helpers
   --------------------------------------------------------------------------- */

const TABS = ['Giving', 'Loans', 'Events', 'Impact']

const CAUSE_COLORS = ['#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

const COUNTRY_COORDS = {
  Yemen: [48.5, 15.5],
  Gaza: [34.4, 31.4],
  Somalia: [46.2, 5.2],
  Pakistan: [69.3, 30.4],
  USA: [-98.6, 39.8],
}

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

/* ---------------------------------------------------------------------------
   Shared Style Helpers
   --------------------------------------------------------------------------- */

const card = {
  background: 'var(--bg-surface, #111)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle, #222)',
  padding: 20,
}

const sectionTitle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-tertiary, #666)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 12,
}

const dm = (size = 13) => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: size,
})

const serif = (size = 24) => ({
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: size,
  fontWeight: 600,
})

const inputStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  width: '100%',
  background: 'var(--bg-elevated, #1a1a2e)',
  border: '1px solid var(--border-subtle, #222)',
  borderRadius: 'var(--radius-md, 10px)',
  color: 'var(--text-primary, #fff)',
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box',
}

/* ---------------------------------------------------------------------------
   GIVING SUB-TAB
   --------------------------------------------------------------------------- */

function GivingTab() {
  const { community } = useCommunity()
  const causes = community.giving.causes

  // Donut chart segment calculations
  const radius = 70
  const cx = 100
  const cy = 100
  let cumulative = 0
  const segments = causes.map((c, i) => {
    const startAngle = (cumulative / 100) * 360
    cumulative += c.pct
    const endAngle = (cumulative / 100) * 360
    const largeArc = c.pct > 50 ? 1 : 0
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180
    return {
      ...c,
      color: CAUSE_COLORS[i],
      d: `M ${cx + radius * Math.cos(startRad)} ${cy + radius * Math.sin(startRad)} A ${radius} ${radius} 0 ${largeArc} 1 ${cx + radius * Math.cos(endRad)} ${cy + radius * Math.sin(endRad)}`,
    }
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 24 }}>
      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* This month vs last */}
        <div style={card}>
          <div style={sectionTitle}>This Month vs Last</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ ...serif(36), color: 'var(--text-primary)' }}>$1,240</span>
            <span style={{
              ...dm(13),
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
            }}>
              <ArrowUpRight size={14} />
              +18%
            </span>
          </div>
          <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 4 }}>
            vs $1,051 last month
          </div>
        </div>

        {/* Mode bars */}
        <div style={card}>
          <div style={sectionTitle}>Giving Modes</div>
          {[
            { label: 'Direct', pct: 62, color: '#14B8A6' },
            { label: 'Compound', pct: 38, color: '#3B82F6' },
            { label: 'Jariyah', pct: 17, color: '#F59E0B' },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', ...dm(12), color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>{m.label}</span>
                <span style={{ fontWeight: 600 }}>{m.pct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-elevated, #1a1a2e)', borderRadius: 4 }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Engagement segments — stacked bar */}
        <div style={card}>
          <div style={sectionTitle}>Engagement Segments</div>
          <div style={{ display: 'flex', gap: 0, height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${(8 / 47) * 100}%`, background: '#10B981', transition: 'width 0.6s' }} />
            <div style={{ width: `${(19 / 47) * 100}%`, background: '#3B82F6', transition: 'width 0.6s' }} />
            <div style={{ width: `${(20 / 47) * 100}%`, background: '#6B7280', transition: 'width 0.6s' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, ...dm(11), color: 'var(--text-secondary)' }}>
            <span>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981', marginRight: 4, verticalAlign: 'middle' }} />
              8 highly active
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', marginRight: 4, verticalAlign: 'middle' }} />
              19 moderate
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#6B7280', marginRight: 4, verticalAlign: 'middle' }} />
              20 sporadic
            </span>
          </div>
        </div>

        {/* AI insight */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, rgba(20,184,166,0.06) 100%)',
          borderColor: 'rgba(212,168,67,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={14} color="var(--gold-mid, #D4A843)" />
            <span style={{ ...dm(11), fontWeight: 600, color: 'var(--gold-mid, #D4A843)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insight</span>
          </div>
          <p style={{ ...dm(13), color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            Compound giving grew 24% this month. Members who start with Direct tend to switch to Compound after 3 months. Consider highlighting the compound option during onboarding.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Donut chart */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={sectionTitle}>Cause Distribution</div>
          <svg width={200} height={200} viewBox="0 0 200 200">
            {segments.map((s, i) => (
              <path
                key={i}
                d={s.d}
                fill="none"
                stroke={s.color}
                strokeWidth={20}
                strokeLinecap="round"
              />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" style={serif(22)}>47</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-tertiary)" style={dm(11)}>members</text>
          </svg>
        </div>

        {/* Top 5 causes table */}
        <div style={card}>
          <div style={sectionTitle}>Top 5 Causes</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...dm(11), color: 'var(--text-tertiary)', fontWeight: 500, textAlign: 'left', paddingBottom: 8 }}>Cause</th>
                <th style={{ ...dm(11), color: 'var(--text-tertiary)', fontWeight: 500, textAlign: 'right', paddingBottom: 8 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {causes.map((c, i) => (
                <tr key={c.name} style={{ borderTop: '1px solid var(--border-subtle, #222)' }}>
                  <td style={{ ...dm(13), color: 'var(--text-primary)', padding: '10px 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: CAUSE_COLORS[i], display: 'inline-block', flexShrink: 0 }} />
                      {c.name}
                    </span>
                  </td>
                  <td style={{ ...dm(13), color: 'var(--text-secondary)', textAlign: 'right', padding: '10px 0', fontWeight: 600 }}>{c.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   LOANS SUB-TAB
   --------------------------------------------------------------------------- */

function LoansTab() {
  const tiers = [
    { tier: 'Tier 1 (< $500)', count: 6, repaid: '$2,400', rate: '100%' },
    { tier: 'Tier 2 ($500-$1k)', count: 3, repaid: '$2,100', rate: '95%' },
    { tier: 'Tier 3 ($1k-$2k)', count: 2, repaid: '$3,900', rate: '85%' },
  ]

  const healthComponents = [
    { label: 'Repayment', score: 96 },
    { label: 'Participation', score: 91 },
    { label: 'Diversity', score: 94 },
    { label: 'Growth', score: 95 },
  ]

  const circles = [
    { name: 'MSA Graduate', pct: 94, color: '#14B8A6', badge: null },
    { name: 'Sisters Circle', pct: 100, color: '#10B981', badge: 'Perfect' },
    { name: 'Ramadan Emergency', pct: null, color: 'var(--text-tertiary)', badge: 'No loans yet' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 24 }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Lifetime stats */}
        <div style={card}>
          <div style={sectionTitle}>Lifetime Loan Stats</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div style={{ ...serif(32), color: 'var(--text-primary)' }}>$8,400</div>
              <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 2 }}>Total Disbursed</div>
            </div>
            <div>
              <div style={{ ...serif(32), color: '#10B981' }}>92.8%</div>
              <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 2 }}>Repaid</div>
            </div>
          </div>
        </div>

        {/* Tier breakdown */}
        <div style={card}>
          <div style={sectionTitle}>Tier Breakdown</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tier', 'Loans', 'Repaid', 'Rate'].map(h => (
                  <th key={h} style={{ ...dm(11), color: 'var(--text-tertiary)', fontWeight: 500, textAlign: 'left', paddingBottom: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map(t => (
                <tr key={t.tier} style={{ borderTop: '1px solid var(--border-subtle, #222)' }}>
                  <td style={{ ...dm(12), color: 'var(--text-primary)', padding: '8px 0' }}>{t.tier}</td>
                  <td style={{ ...dm(12), color: 'var(--text-secondary)', padding: '8px 0' }}>{t.count}</td>
                  <td style={{ ...dm(12), color: 'var(--text-secondary)', padding: '8px 0' }}>{t.repaid}</td>
                  <td style={{ ...dm(12), color: '#10B981', fontWeight: 600, padding: '8px 0' }}>{t.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Repayment speed comparison */}
        <div style={card}>
          <div style={sectionTitle}>Repayment Speed</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Early', pct: 34, color: '#10B981' },
              { label: 'On Time', pct: 52, color: '#3B82F6' },
              { label: 'Late', pct: 14, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', ...dm(11), color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 600 }}>{s.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated, #1a1a2e)', borderRadius: 3 }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pool health score */}
        <div style={card}>
          <div style={sectionTitle}>Pool Health Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ ...serif(56), color: '#10B981', lineHeight: 1 }}>
              94<span style={{ ...dm(18), color: 'var(--text-tertiary)', fontWeight: 400 }}>/100</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {healthComponents.map(h => (
                <div key={h.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', ...dm(11), color: 'var(--text-secondary)', marginBottom: 2 }}>
                    <span>{h.label}</span>
                    <span>{h.score}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-elevated, #1a1a2e)', borderRadius: 2 }}>
                    <div style={{ width: `${h.score}%`, height: '100%', background: '#10B981', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Circle performance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={sectionTitle}>Circle Performance</div>
        {circles.map(c => (
          <div key={c.name} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</span>
              {c.badge && (
                <span style={{
                  ...dm(11),
                  color: c.pct === 100 ? '#10B981' : 'var(--text-tertiary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  {c.pct === 100 && <CheckCircle size={12} />}
                  {c.badge} {c.pct === 100 ? '\u2713' : ''}
                </span>
              )}
            </div>
            {/* Circular progress bar */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={50} fill="none" stroke="var(--bg-elevated, #1a1a2e)" strokeWidth={8} />
                {c.pct !== null && (
                  <circle
                    cx={60} cy={60} r={50}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={`${(c.pct / 100) * 314} 314`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                )}
                <text x={60} y={c.pct !== null ? 56 : 60} textAnchor="middle" fill="var(--text-primary)" style={serif(24)}>
                  {c.pct !== null ? `${c.pct}%` : '--'}
                </text>
                {c.pct !== null && (
                  <text x={60} y={74} textAnchor="middle" fill="var(--text-tertiary)" style={dm(10)}>repayment</text>
                )}
                {c.pct === null && (
                  <text x={60} y={76} textAnchor="middle" fill="var(--text-tertiary)" style={dm(9)}>No loans yet</text>
                )}
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   EVENTS SUB-TAB
   --------------------------------------------------------------------------- */

function EventsTab() {
  const [formData, setFormData] = useState({ name: '', type: 'Jummah', date: '', attendance: '' })
  const [sortAsc, setSortAsc] = useState(false)

  const eventCards = [
    {
      name: 'Eid al-Fitr',
      multiplier: 12.4,
      gold: true,
      spike: '$4,340 in 48hrs',
      modes: { Direct: 72, Compound: 18, Jariyah: 10 },
      topCause: 'Emergency Relief',
    },
    {
      name: 'Ramadan Night 27',
      multiplier: 7.6,
      gold: false,
      spike: '$2,680 in 48hrs',
      modes: { Direct: 58, Compound: 28, Jariyah: 14 },
      topCause: 'Education',
    },
    {
      name: 'Jummah Khutbah',
      multiplier: 3.2,
      gold: false,
      spike: '$1,120 in 48hrs',
      modes: { Direct: 81, Compound: 12, Jariyah: 7 },
      topCause: 'Housing',
    },
    {
      name: 'Community Workshop',
      multiplier: 2.2,
      gold: false,
      spike: '$770 in 48hrs',
      modes: { Direct: 45, Compound: 40, Jariyah: 15 },
      topCause: 'Small Business',
    },
  ]

  const tableEvents = [...eventCards].sort((a, b) =>
    sortAsc ? a.multiplier - b.multiplier : b.multiplier - a.multiplier
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Compact event log form */}
      <div style={card}>
        <div style={sectionTitle}>Log New Event</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ ...dm(11), color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Name</label>
            <input
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Event name"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 130px' }}>
            <label style={{ ...dm(11), color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
              style={inputStyle}
            >
              {['Jummah', 'Eid', 'Ramadan Night', 'Workshop', 'Fundraiser', 'Other'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 0 140px' }}>
            <label style={{ ...dm(11), color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 90px' }}>
            <label style={{ ...dm(11), color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Attendance</label>
            <input
              type="number"
              value={formData.attendance}
              onChange={e => setFormData(p => ({ ...p, attendance: e.target.value }))}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <button
            onClick={() => setFormData({ name: '', type: 'Jummah', date: '', attendance: '' })}
            style={{
              ...dm(13),
              fontWeight: 600,
              background: 'var(--gold-mid, #D4A843)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '10px 20px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Event cards — ordered by multiplier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {eventCards.map(ev => (
          <div key={ev.name} style={{
            ...card,
            borderColor: ev.gold ? 'rgba(212,168,67,0.4)' : 'var(--border-subtle, #222)',
            background: ev.gold
              ? 'linear-gradient(135deg, rgba(212,168,67,0.1) 0%, var(--bg-surface, #111) 100%)'
              : card.background,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)' }}>
                {ev.gold && <Star size={14} style={{ color: 'var(--gold-mid, #D4A843)', marginRight: 4, verticalAlign: -2 }} />}
                {ev.name}
              </span>
              <span style={{
                ...dm(16),
                fontWeight: 700,
                color: ev.gold ? 'var(--gold-mid, #D4A843)' : '#14B8A6',
              }}>
                {ev.multiplier}x
              </span>
            </div>
            <div style={{ ...dm(12), color: 'var(--text-secondary)', marginBottom: 8 }}>
              <Zap size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{ev.spike}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {Object.entries(ev.modes).map(([mode, pct]) => (
                <span key={mode} style={{
                  ...dm(10),
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-elevated, #1a1a2e)',
                  borderRadius: 4,
                  padding: '2px 6px',
                }}>
                  {mode} {pct}%
                </span>
              ))}
            </div>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>
              Top cause: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{ev.topCause}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sortable events table */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ ...sectionTitle, marginBottom: 0 }}>All Events</div>
          <button
            onClick={() => setSortAsc(p => !p)}
            style={{
              ...dm(11),
              background: 'none',
              border: '1px solid var(--border-subtle, #222)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Multiplier {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Event', '48hr Spike', 'Top Mode', 'Top Cause', 'Multiplier'].map(h => (
                <th key={h} style={{ ...dm(11), color: 'var(--text-tertiary)', fontWeight: 500, textAlign: 'left', paddingBottom: 8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableEvents.map(ev => (
              <tr key={ev.name} style={{ borderTop: '1px solid var(--border-subtle, #222)' }}>
                <td style={{ ...dm(13), color: 'var(--text-primary)', padding: '10px 0' }}>{ev.name}</td>
                <td style={{ ...dm(12), color: 'var(--text-secondary)', padding: '10px 0' }}>{ev.spike}</td>
                <td style={{ ...dm(12), color: 'var(--text-secondary)', padding: '10px 0' }}>Direct {ev.modes.Direct}%</td>
                <td style={{ ...dm(12), color: 'var(--text-secondary)', padding: '10px 0' }}>{ev.topCause}</td>
                <td style={{ ...dm(13), color: ev.gold ? 'var(--gold-mid, #D4A843)' : '#14B8A6', fontWeight: 600, padding: '10px 0' }}>{ev.multiplier}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   IMPACT SUB-TAB
   --------------------------------------------------------------------------- */

function ImpactTab() {
  const [showReport, setShowReport] = useState(false)
  const [toast, setToast] = useState(false)

  const countries = [
    { name: 'Yemen', amount: 3200, cause: 'Emergency Relief' },
    { name: 'Gaza', amount: 2800, cause: 'Medical' },
    { name: 'Somalia', amount: 2400, cause: 'Food Security' },
    { name: 'Pakistan', amount: 2200, cause: 'Education' },
    { name: 'USA', amount: 1800, cause: 'Housing' },
  ]

  const maxAmount = Math.max(...countries.map(c => c.amount))

  const pins = countries.map((c, idx) => {
    const coords = COUNTRY_COORDS[c.name]
    const [x, y] = lonLatToSvg(coords[0], coords[1])
    return { ...c, x, y, r: 4 + (c.amount / maxAmount) * 8, color: CAUSE_COLORS[idx] }
  })

  function handleDownload() {
    setShowReport(false)
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 24 }}>
        {/* LEFT — Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            ...card,
            padding: 0,
            overflow: 'hidden',
            aspectRatio: '2 / 1',
            position: 'relative',
          }}>
            <svg viewBox="0 0 1000 500" width="100%" height="100%" style={{ display: 'block', background: 'var(--bg-void, #0a0a1a)' }}>
              {CONTINENT_PATHS.map((d, i) => (
                <path key={i} d={d} fill="var(--bg-elevated, #1a1a2e)" stroke="var(--border-subtle, #333)" strokeWidth={0.5} />
              ))}
              {pins.map(p => (
                <g key={p.name}>
                  <circle cx={p.x} cy={p.y} r={p.r + 4} fill={p.color} opacity={0.15}>
                    <animate attributeName="r" from={p.r + 2} to={p.r + 10} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.2" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} />
                  <text x={p.x} y={p.y - p.r - 6} textAnchor="middle" fill="var(--text-secondary)" style={dm(10)}>{p.name}</text>
                </g>
              ))}
            </svg>
          </div>

          <button
            onClick={() => setShowReport(true)}
            style={{
              ...dm(14),
              fontWeight: 600,
              background: 'var(--gold-mid, #D4A843)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '14px 24px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Generate Impact Report &rarr;
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 4 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Families Helped', value: '89', icon: <Heart size={16} />, color: '#EF4444' },
              { label: 'Countries', value: '7', icon: <Globe size={16} />, color: '#3B82F6' },
              { label: 'Total Impact', value: '$12,400', icon: <TrendingUp size={16} />, color: '#10B981' },
              { label: 'Loans Funded', value: '11', icon: <Shield size={16} />, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${s.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color, marginBottom: 8,
                }}>
                  {s.icon}
                </div>
                <div style={{ ...serif(24), color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Country ranked list */}
          <div style={card}>
            <div style={sectionTitle}>Impact by Country</div>
            {countries.map((c, i) => (
              <div key={c.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderTop: i > 0 ? '1px solid var(--border-subtle, #222)' : 'none',
              }}>
                <span style={{ ...dm(14), color: 'var(--text-tertiary)', width: 20, fontWeight: 600 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ ...dm(13), color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
                  <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>{c.cause}</div>
                </div>
                <span style={{ ...dm(14), color: '#14B8A6', fontWeight: 600 }}>${c.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-surface, #111)',
                border: '1px solid var(--border-subtle, #222)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: 32,
                maxWidth: 520,
                width: '90%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ ...serif(24), color: 'var(--text-primary)', margin: 0 }}>Impact Report Preview</h2>
                <button onClick={() => setShowReport(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ ...card, marginBottom: 20, background: 'var(--bg-elevated, #1a1a2e)' }}>
                <div style={{ ...serif(18), color: 'var(--gold-mid, #D4A843)', marginBottom: 12 }}>Islamic Center of Austin</div>
                <div style={{ ...dm(13), color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Community Impact Summary: 89 families helped across 7 countries.
                  $12,400 total giving with 11 interest-free loans funded.
                  Top causes: Emergency Relief, Education, Housing.
                  Pool health: 94/100. Repayment rate: 92.8%.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleDownload}
                  style={{
                    ...dm(13), fontWeight: 600,
                    background: 'var(--gold-mid, #D4A843)', color: '#000',
                    border: 'none', borderRadius: 'var(--radius-md, 10px)',
                    padding: '12px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
                  }}
                >
                  <Download size={14} /> Download as PNG
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  style={{
                    ...dm(13), fontWeight: 600,
                    background: 'none', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle, #222)',
                    borderRadius: 'var(--radius-md, 10px)',
                    padding: '12px 20px', cursor: 'pointer', flex: 1,
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              background: '#10B981', color: '#fff', borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 24px', ...dm(13), fontWeight: 600, zIndex: 1001,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <CheckCircle size={16} /> Report downloaded
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------------------------------------------------------------------
   MAIN EXPORT — Insights Tab
   --------------------------------------------------------------------------- */

export default function CommunityInsights() {
  const [activeTab, setActiveTab] = useState('Giving')

  const tabComponents = {
    Giving: GivingTab,
    Loans: LoansTab,
    Events: EventsTab,
    Impact: ImpactTab,
  }

  const ActiveComponent = tabComponents[activeTab]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        Insights
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginBottom: 24,
      }}>
        Community analytics and impact tracking
      </p>

      {/* Horizontal pill selector */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 28,
        flexWrap: 'wrap',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              padding: '8px 20px',
              borderRadius: 999,
              border: activeTab === tab
                ? '1px solid var(--gold-mid, #D4A843)'
                : '1px solid var(--border-subtle, #222)',
              background: activeTab === tab
                ? 'rgba(212,168,67,0.12)'
                : 'transparent',
              color: activeTab === tab
                ? 'var(--gold-mid, #D4A843)'
                : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active sub-tab content */}
      <ActiveComponent />
    </motion.div>
  )
}
