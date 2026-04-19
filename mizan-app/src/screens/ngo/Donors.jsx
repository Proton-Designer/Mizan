import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & SEED DATA
   ═══════════════════════════════════════════════════════════════ */

const SUB_NAV = ['Top Donors', 'Segments', 'Message', 'Export']

const CAMPAIGNS = ['All Campaigns', 'Yemen Emergency Relief', 'Gaza Reconstruction Fund', 'Somalia Drought Response', 'Rohingya Refugee Aid']
const DATE_RANGES = ['All Time', 'Last 30 days', 'Last 90 days', 'This Year', 'Last Year']
const GIVING_MODES = ['All Modes', 'Direct (Sadaqah)', 'Compound (Jariyah)']

const SEED_DONORS = [
  { id: 1, name: 'Ahmad K.', city: 'Dearborn, MI', lifetime: 14200, gifts: 38, lastGift: '2 days ago', lastGiftDays: 2, mode: 'Compound', jariyah: true, campaigns: { 'Yemen Emergency Relief': 5400, 'Gaza Reconstruction Fund': 6100, 'Somalia Drought Response': 2700 }, history: [{ date: 'Apr 16', amount: 350, campaign: 'Yemen Emergency Relief' }, { date: 'Apr 2', amount: 500, campaign: 'Gaza Reconstruction Fund' }, { date: 'Mar 18', amount: 200, campaign: 'Somalia Drought Response' }] },
  { id: 2, name: 'Fatima S.', city: 'Houston, TX', lifetime: 11800, gifts: 27, lastGift: '5 days ago', lastGiftDays: 5, mode: 'Compound', jariyah: true, campaigns: { 'Gaza Reconstruction Fund': 7200, 'Yemen Emergency Relief': 4600 }, history: [{ date: 'Apr 13', amount: 600, campaign: 'Gaza Reconstruction Fund' }, { date: 'Mar 28', amount: 400, campaign: 'Yemen Emergency Relief' }] },
  { id: 3, name: 'Anonymous', city: 'Chicago, IL', lifetime: 9500, gifts: 12, lastGift: '1 week ago', lastGiftDays: 7, mode: 'Direct', jariyah: false, campaigns: { 'Yemen Emergency Relief': 9500 }, history: [{ date: 'Apr 11', amount: 1000, campaign: 'Yemen Emergency Relief' }] },
  { id: 4, name: 'Omar J.', city: 'Dallas, TX', lifetime: 8300, gifts: 45, lastGift: '3 days ago', lastGiftDays: 3, mode: 'Compound', jariyah: true, campaigns: { 'Somalia Drought Response': 4100, 'Rohingya Refugee Aid': 2800, 'Gaza Reconstruction Fund': 1400 }, history: [{ date: 'Apr 15', amount: 250, campaign: 'Somalia Drought Response' }, { date: 'Apr 8', amount: 300, campaign: 'Rohingya Refugee Aid' }] },
  { id: 5, name: 'Mariam R.', city: 'Falls Church, VA', lifetime: 7100, gifts: 19, lastGift: '12 days ago', lastGiftDays: 12, mode: 'Direct', jariyah: false, campaigns: { 'Gaza Reconstruction Fund': 4500, 'Yemen Emergency Relief': 2600 }, history: [{ date: 'Apr 6', amount: 500, campaign: 'Gaza Reconstruction Fund' }] },
]

function generateDonors(count) {
  const firstNames = ['Yusuf', 'Khadija', 'Ibrahim', 'Aisha', 'Hassan', 'Zainab', 'Bilal', 'Noor', 'Khalid', 'Sumaya', 'Tariq', 'Layla', 'Idris', 'Hana', 'Rami', 'Sara', 'Dawud', 'Maryam', 'Salman', 'Amina']
  const lastInits = 'ABCDEFGHJKLMNPQRSTVWXYZ'
  const cities = ['New York, NY', 'Los Angeles, CA', 'Detroit, MI', 'Minneapolis, MN', 'Atlanta, GA', 'Philadelphia, PA', 'San Diego, CA', 'Tampa, FL', 'Phoenix, AZ', 'Seattle, WA', 'Denver, CO', 'Portland, OR', 'Nashville, TN', 'Charlotte, NC', 'Raleigh, NC']
  const modes = ['Direct', 'Compound']
  const campaignNames = ['Yemen Emergency Relief', 'Gaza Reconstruction Fund', 'Somalia Drought Response', 'Rohingya Refugee Aid']
  const donors = []
  for (let i = 0; i < count; i++) {
    const isAnon = Math.random() < 0.1
    const m = modes[Math.floor(Math.random() * 2)]
    const days = Math.floor(Math.random() * 180) + 1
    const ltv = Math.floor(Math.random() * 5000) + 200
    const camp = campaignNames[Math.floor(Math.random() * campaignNames.length)]
    donors.push({
      id: 100 + i,
      name: isAnon ? 'Anonymous' : `${firstNames[i % firstNames.length]} ${lastInits[i % lastInits.length]}.`,
      city: cities[i % cities.length],
      lifetime: ltv,
      gifts: Math.floor(Math.random() * 30) + 1,
      lastGift: days <= 7 ? `${days} days ago` : days <= 30 ? `${Math.floor(days / 7)} weeks ago` : `${Math.floor(days / 30)} months ago`,
      lastGiftDays: days,
      mode: m,
      jariyah: m === 'Compound' && Math.random() > 0.3,
      campaigns: { [camp]: ltv },
      history: [{ date: 'Mar 15', amount: Math.floor(ltv * 0.1), campaign: camp }],
    })
  }
  return donors
}

const ALL_DONORS = [...SEED_DONORS, ...generateDonors(55)]

/* ═══════════════════════════════════════════════════════════════
   STYLE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const card = {
  background: 'var(--bg-surface, #111)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle, #222)',
  padding: 20,
}

const serif = (size = 24) => ({
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: size,
  fontWeight: 600,
})

const dm = (size = 13) => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: size,
})

const sectionTitle = {
  ...dm(11),
  fontWeight: 600,
  color: 'var(--text-tertiary, #666)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 12,
}

const selectStyle = {
  ...dm(12),
  background: 'var(--bg-elevated, #1a1a2e)',
  border: '1px solid var(--border-subtle, #222)',
  borderRadius: 'var(--radius-sm, 8px)',
  color: 'var(--text-primary, #fff)',
  padding: '6px 10px',
  outline: 'none',
  cursor: 'pointer',
}

const goldBtn = {
  ...dm(13),
  fontWeight: 600,
  background: 'linear-gradient(135deg, #F5D485 0%, #D4A843 50%, #A07830 100%)',
  color: '#0A0A0F',
  border: 'none',
  borderRadius: 'var(--radius-sm, 8px)',
  padding: '10px 22px',
  cursor: 'pointer',
}

const outlineBtn = {
  ...dm(12),
  fontWeight: 500,
  background: 'transparent',
  border: '1px solid var(--border-default, #333)',
  borderRadius: 'var(--radius-sm, 8px)',
  color: 'var(--text-primary, #eee)',
  padding: '7px 14px',
  cursor: 'pointer',
}

/* ═══════════════════════════════════════════════════════════════
   SUB-VIEWS
   ═══════════════════════════════════════════════════════════════ */

/* ── Top Donors ── */
function TopDonors() {
  const [campaign, setCampaign] = useState('All Campaigns')
  const [dateRange, setDateRange] = useState('All Time')
  const [givingMode, setGivingMode] = useState('All Modes')
  const [sortKey, setSortKey] = useState('lifetime')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const perPage = 20

  const filtered = useMemo(() => {
    let list = [...ALL_DONORS]
    if (campaign !== 'All Campaigns') list = list.filter(d => d.campaigns[campaign])
    if (givingMode === 'Direct (Sadaqah)') list = list.filter(d => d.mode === 'Direct')
    if (givingMode === 'Compound (Jariyah)') list = list.filter(d => d.mode === 'Compound')
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return list
  }, [campaign, givingMode, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ''

  const lastGiftColor = (days) => {
    if (days <= 7) return 'var(--status-green, #4ade80)'
    if (days <= 30) return 'var(--status-blue, #60a5fa)'
    if (days <= 90) return 'var(--status-yellow, #fbbf24)'
    return 'var(--status-red, #f87171)'
  }

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <select value={campaign} onChange={e => { setCampaign(e.target.value); setPage(0) }} style={selectStyle}>
          {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
          {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={givingMode} onChange={e => { setGivingMode(e.target.value); setPage(0) }} style={selectStyle}>
          {GIVING_MODES.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...dm(13) }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default, #333)' }}>
              {[
                { key: null, label: 'Rank', w: 50 },
                { key: 'name', label: 'Donor' },
                { key: 'city', label: 'City' },
                { key: 'lifetime', label: 'Lifetime Value', w: 120 },
                { key: 'gifts', label: 'Gifts', w: 60 },
                { key: 'lastGiftDays', label: 'Last Gift', w: 110 },
                { key: 'mode', label: 'Mode', w: 90 },
                { key: 'jariyah', label: 'Jariyah', w: 90 },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={col.key ? () => toggleSort(col.key) : undefined}
                  style={{
                    textAlign: col.key === 'lifetime' || col.key === 'gifts' ? 'right' : 'left',
                    padding: '10px 8px',
                    color: 'var(--text-tertiary, #888)',
                    fontWeight: 500,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: col.key ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    width: col.w || 'auto',
                    userSelect: 'none',
                  }}
                >
                  {col.label}{col.key ? arrow(col.key) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((d, i) => {
              const rank = page * perPage + i + 1
              const isAnon = d.name === 'Anonymous'
              return (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDonor(d)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle, #1a1a2e)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,168,67,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 8px', color: 'var(--text-tertiary)', fontSize: 12 }}>{rank}</td>
                  <td style={{ padding: '10px 8px', fontStyle: isAnon ? 'italic' : 'normal', color: isAnon ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{d.name}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{d.city}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--gold-light, #F5D485)' }}>${d.lifetime.toLocaleString()}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>{d.gifts}</td>
                  <td style={{ padding: '10px 8px', color: lastGiftColor(d.lastGiftDays), fontSize: 12 }}>{d.lastGift}</td>
                  <td style={{ padding: '10px 8px', color: d.mode === 'Compound' ? 'var(--gold-light)' : 'var(--text-secondary)', fontSize: 12 }}>{d.mode}</td>
                  <td style={{ padding: '10px 8px' }}>
                    {d.jariyah
                      ? <span style={{ color: 'var(--status-green, #4ade80)', fontSize: 12, fontWeight: 600 }}>&#10003; Active</span>
                      : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>&mdash;</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, ...dm(12) }}>
        <span style={{ color: 'var(--text-tertiary)' }}>
          Showing {page * perPage + 1}&ndash;{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ ...outlineBtn, opacity: page === 0 ? 0.4 : 1 }}>Prev</button>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ ...outlineBtn, opacity: page >= totalPages - 1 ? 0.4 : 1 }}>Next</button>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedDonor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDonor(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 'var(--z-overlay, 100)' }}
            />
            <motion.div
              initial={{ x: 340 }}
              animate={{ x: 0 }}
              exit={{ x: 340 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 340,
                height: '100vh',
                background: 'var(--bg-surface, #111)',
                borderLeft: '1px solid var(--border-subtle, #222)',
                zIndex: 'var(--z-modal, 200)',
                overflowY: 'auto',
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ ...serif(22), color: selectedDonor.name === 'Anonymous' ? 'var(--text-tertiary)' : 'var(--text-primary)', fontStyle: selectedDonor.name === 'Anonymous' ? 'italic' : 'normal' }}>
                  {selectedDonor.name}
                </span>
                <button onClick={() => setSelectedDonor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
              </div>

              <div style={{ color: 'var(--text-secondary)', ...dm(12), marginBottom: 20 }}>{selectedDonor.city}</div>

              {/* Giving Summary */}
              <div style={sectionTitle}>GIVING SUMMARY</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Lifetime</div>
                  <div style={{ ...serif(20), color: 'var(--gold-light, #F5D485)' }}>${selectedDonor.lifetime.toLocaleString()}</div>
                </div>
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Total Gifts</div>
                  <div style={{ ...serif(20), color: 'var(--text-primary)' }}>{selectedDonor.gifts}</div>
                </div>
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Mode</div>
                  <div style={{ ...dm(14), fontWeight: 600, color: selectedDonor.mode === 'Compound' ? 'var(--gold-light)' : 'var(--text-primary)' }}>{selectedDonor.mode}</div>
                </div>
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Jariyah</div>
                  <div style={{ ...dm(14), fontWeight: 600, color: selectedDonor.jariyah ? 'var(--status-green)' : 'var(--text-tertiary)' }}>
                    {selectedDonor.jariyah ? '\u2713 Active' : 'None'}
                  </div>
                </div>
              </div>

              {/* By-Campaign Breakdown */}
              <div style={sectionTitle}>BY CAMPAIGN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {Object.entries(selectedDonor.campaigns).map(([camp, amt]) => (
                  <div key={camp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...dm(13) }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{camp}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gold-light)' }}>${amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* History */}
              <div style={sectionTitle}>RECENT HISTORY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                {selectedDonor.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', ...dm(12), padding: '6px 0', borderBottom: '1px solid var(--border-subtle, #222)' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>{h.date}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{h.campaign}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${h.amount}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={goldBtn}>Send Thank-You</button>
                <button style={outlineBtn}>View Full Profile</button>
                <button style={outlineBtn}>Export Giving History</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Segments ── */
const SEGMENTS = [
  { id: 'jariyah', label: 'Jariyah Donors', count: 18, color: 'var(--status-green, #4ade80)', bg: 'rgba(74,222,128,0.08)', avgGift: '$620', retention: '100%', suggestion: 'These donors never lapse. Highlight their compound growth in updates to reinforce commitment.' },
  { id: 'repeat', label: 'Repeat Donors', count: 94, color: 'var(--status-blue, #60a5fa)', bg: 'rgba(96,165,250,0.08)', avgGift: '$180', retention: '67%', suggestion: 'Invite top repeat donors to convert to Jariyah (compound) giving for sustained impact.' },
  { id: 'lapsed', label: 'Lapsed Donors', count: 47, color: 'var(--status-yellow, #fbbf24)', bg: 'rgba(251,191,36,0.08)', avgGift: '$95', retention: '0%', suggestion: 'Send a personalized re-engagement email with their past impact story and a small ask.' },
  { id: 'compound', label: 'Compound Donors', count: 93, color: '#D4A843', bg: 'rgba(212,168,67,0.08)', avgGift: '$340', retention: '82%', suggestion: 'Compound donors have the highest LTV. Share settlement timelines and projected impact growth.' },
  { id: 'firsttime', label: 'First-Time Donors', count: 170, color: 'var(--text-tertiary, #888)', bg: 'rgba(255,255,255,0.04)', avgGift: '$45', retention: '23%', suggestion: 'Send an immediate impact report within 48 hours to convert first-time donors into repeat givers.' },
]

function Segments() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {SEGMENTS.map(seg => (
        <div key={seg.id} style={{ ...card, borderLeft: `4px solid ${seg.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ ...serif(18), color: 'var(--text-primary)' }}>{seg.label}</span>
            <span style={{ ...serif(28), color: seg.color }}>{seg.count}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 14, ...dm(12) }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Avg Gift: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{seg.avgGift}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Retention: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{seg.retention}</span>
            </div>
          </div>
          <div style={{
            background: seg.bg,
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '10px 12px',
            ...dm(12),
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 14,
          }}>
            {seg.suggestion}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={outlineBtn}>View list</button>
            <button style={{ ...outlineBtn, borderColor: seg.color, color: seg.color }}>Message segment</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Message ── */
const TAG_CHIPS = ['{{donor_name}}', '{{last_gift_amount}}', '{{campaign_name}}', '{{their_specific_impact}}']
const DELIVERY_OPTIONS = ['Push', 'Email', 'Both']

function MessageView() {
  const [segment, setSegment] = useState('Repeat Donors')
  const [delivery, setDelivery] = useState('Both')
  const [message, setMessage] = useState('Dear {{donor_name}}, your last gift of {{last_gift_amount}} to {{campaign_name}} made a real difference. {{their_specific_impact}}')
  const [sent, setSent] = useState(false)

  const insertTag = (tag) => {
    setMessage(prev => prev + ' ' + tag)
  }

  const previewText = message
    .replace(/\{\{donor_name\}\}/g, 'Ahmad K.')
    .replace(/\{\{last_gift_amount\}\}/g, '$350')
    .replace(/\{\{campaign_name\}\}/g, 'Yemen Emergency Relief')
    .replace(/\{\{their_specific_impact\}\}/g, 'Your contribution provided clean water for 12 families in Taiz for one month.')

  const hasImpactTag = message.includes('{{their_specific_impact}}')

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Segment picker */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>SEGMENT</div>
        <select value={segment} onChange={e => setSegment(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
          {SEGMENTS.map(s => <option key={s.id} value={s.label}>{s.label} ({s.count})</option>)}
        </select>
      </div>

      {/* Delivery */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>DELIVERY</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DELIVERY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setDelivery(opt)}
              style={{
                ...dm(12),
                fontWeight: 500,
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill, 100px)',
                border: delivery === opt ? '1px solid var(--gold-mid, #D4A843)' : '1px solid var(--border-default, #333)',
                background: delivery === opt ? 'rgba(212,168,67,0.12)' : 'transparent',
                color: delivery === opt ? 'var(--gold-light, #F5D485)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Tag chips */}
      <div style={{ marginBottom: 10 }}>
        <div style={sectionTitle}>INSERT TAG</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TAG_CHIPS.map(tag => (
            <button
              key={tag}
              onClick={() => insertTag(tag)}
              style={{
                ...dm(11),
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill, 100px)',
                border: '1px solid var(--border-default, #333)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--gold-light, #F5D485)',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Message textarea */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>MESSAGE</div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          style={{
            ...dm(13),
            width: '100%',
            background: 'var(--bg-elevated, #1a1a2e)',
            border: '1px solid var(--border-subtle, #222)',
            borderRadius: 'var(--radius-md, 10px)',
            color: 'var(--text-primary)',
            padding: 12,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Live Preview */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>LIVE PREVIEW (Ahmad K.)</div>
        <div style={{
          ...card,
          ...dm(13),
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          borderLeft: '3px solid var(--gold-mid, #D4A843)',
          whiteSpace: 'pre-wrap',
        }}>
          {previewText}
        </div>
      </div>

      {/* Claude advisory */}
      <div style={{
        ...card,
        borderLeft: `3px solid ${hasImpactTag ? 'var(--status-green, #4ade80)' : 'var(--status-yellow, #fbbf24)'}`,
        marginBottom: 20,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18 }}>{hasImpactTag ? '\u2713' : '\u26A0'}</span>
        <div style={{ ...dm(12), color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {hasImpactTag
            ? <><strong style={{ color: 'var(--status-green)' }}>Strong message.</strong> Including a specific impact tag personalizes the ask and increases response rates by up to 40%.</>
            : <><strong style={{ color: 'var(--status-yellow)' }}>Missing impact personalization.</strong> Adding <code style={{ color: 'var(--gold-light)' }}>{'{{their_specific_impact}}'}</code> can increase engagement by 40%. Donors want to see what their money did.</>
          }
        </div>
      </div>

      {/* Send button */}
      <button
        onClick={() => setSent(true)}
        style={{ ...goldBtn, width: '100%', padding: '12px 22px', fontSize: 15 }}
      >
        {sent ? 'Sent \u2713' : `Send to all ${SEGMENTS.find(s => s.label === segment)?.count || ''} \u2192`}
      </button>
    </div>
  )
}

/* ── Export ── */
const EXPORT_FORMATS = [
  {
    id: 'csv',
    label: 'CSV',
    desc: 'Standard comma-separated file. Compatible with Excel, Google Sheets, and any data tool.',
    ext: '.csv',
    fields: ['Name', 'City', 'Lifetime Value', 'Gifts', 'Last Gift', 'Mode', 'Jariyah'],
  },
  {
    id: 'salesforce',
    label: 'Salesforce',
    desc: 'Includes Salesforce-compatible __c custom field headers (Lifetime_Value__c, Giving_Mode__c, Jariyah_Status__c).',
    ext: '_salesforce.csv',
    fields: ['Name', 'City', 'Lifetime_Value__c', 'Total_Gifts__c', 'Last_Gift_Date__c', 'Giving_Mode__c', 'Jariyah_Status__c'],
  },
  {
    id: 'mailchimp',
    label: 'Mailchimp',
    desc: 'Formatted for Mailchimp audience import with EMAIL, FNAME, LNAME, and MERGE tags.',
    ext: '_mailchimp.csv',
    fields: ['Email', 'FNAME', 'LNAME', 'MERGE_CITY', 'MERGE_LTV', 'MERGE_MODE', 'TAGS'],
  },
  {
    id: 'hubspot',
    label: 'HubSpot',
    desc: 'HubSpot CRM contact import format with lifecycle stage and custom properties.',
    ext: '_hubspot.csv',
    fields: ['First Name', 'Last Name', 'City', 'Lifecycle Stage', 'Lifetime Giving', 'Giving Mode', 'Jariyah Active'],
  },
]

function ExportView() {
  const [downloaded, setDownloaded] = useState({})

  const handleDownload = useCallback((fmt) => {
    const header = fmt.fields.join(',')
    const rows = ALL_DONORS.map(d => {
      const first = d.name.split(' ')[0]
      const last = d.name.split(' ')[1] || ''
      if (fmt.id === 'csv') return [d.name, d.city, d.lifetime, d.gifts, d.lastGift, d.mode, d.jariyah ? 'Active' : ''].join(',')
      if (fmt.id === 'salesforce') return [d.name, d.city, d.lifetime, d.gifts, d.lastGift, d.mode, d.jariyah ? 'Active' : 'Inactive'].join(',')
      if (fmt.id === 'mailchimp') return [`${first.toLowerCase()}@example.com`, first, last, d.city, d.lifetime, d.mode, d.jariyah ? 'jariyah' : 'standard'].join(',')
      if (fmt.id === 'hubspot') return [first, last, d.city, 'customer', d.lifetime, d.mode, d.jariyah ? 'Yes' : 'No'].join(',')
      return ''
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mizan_donors${fmt.ext}`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDownloaded(prev => ({ ...prev, [fmt.id]: true }))
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {EXPORT_FORMATS.map(fmt => (
        <div key={fmt.id} style={card}>
          <div style={{ ...serif(20), color: 'var(--text-primary)', marginBottom: 6 }}>{fmt.label}</div>
          <div style={{ ...dm(12), color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{fmt.desc}</div>
          <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 14 }}>
            Fields: {fmt.fields.join(', ')}
          </div>
          <button
            onClick={() => handleDownload(fmt)}
            style={{
              ...outlineBtn,
              borderColor: downloaded[fmt.id] ? 'var(--status-green)' : 'var(--border-default)',
              color: downloaded[fmt.id] ? 'var(--status-green)' : 'var(--text-primary)',
            }}
          >
            {downloaded[fmt.id] ? 'Downloaded \u2713' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NGODonors() {
  const ngo = useNGOPartner()
  const [activeTab, setActiveTab] = useState('Top Donors')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Left Sub-Nav ── */}
      <nav style={{
        width: 200,
        flexShrink: 0,
        background: 'var(--bg-surface, #111)',
        borderRight: '1px solid var(--border-subtle, #222)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <div style={{ ...serif(18), color: 'var(--gold-light, #F5D485)', padding: '0 16px', marginBottom: 16 }}>
          Donors
        </div>
        {SUB_NAV.map(item => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            style={{
              ...dm(13),
              fontWeight: activeTab === item ? 600 : 400,
              textAlign: 'left',
              padding: '10px 16px',
              background: activeTab === item ? 'rgba(212,168,67,0.10)' : 'transparent',
              borderLeft: activeTab === item ? '3px solid var(--gold-mid, #D4A843)' : '3px solid transparent',
              color: activeTab === item ? 'var(--gold-light, #F5D485)' : 'var(--text-secondary, #999)',
              border: 'none',
              borderLeftWidth: 3,
              borderLeftStyle: 'solid',
              borderLeftColor: activeTab === item ? 'var(--gold-mid, #D4A843)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '24px 28px 40px', overflowY: 'auto' }}>
        <h1 style={{ ...serif(28), color: 'var(--text-primary)', marginBottom: 20 }}>{activeTab}</h1>

        {activeTab === 'Top Donors' && <TopDonors />}
        {activeTab === 'Segments' && <Segments />}
        {activeTab === 'Message' && <MessageView />}
        {activeTab === 'Export' && <ExportView />}
      </main>
    </div>
  )
}
