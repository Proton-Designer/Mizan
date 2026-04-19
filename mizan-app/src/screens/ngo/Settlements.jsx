import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGOPartner } from '../../context/NGOContext_Partner'
import {
  Send, ChevronDown, ChevronUp, Copy, Check, MessageSquare,
} from 'lucide-react'

/* ──────────────────────────────────────────────
   Style helpers
   ────────────────────────────────────────────── */

const dm = (size = 13) => ({ fontFamily: "'DM Sans', sans-serif", fontSize: size })
const serif = (size = 24) => ({ fontFamily: "'Cormorant Garamond', serif", fontSize: size, fontWeight: 600 })

const card = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle)',
  padding: 24,
  marginBottom: 20,
}

const goldBtn = {
  ...dm(14),
  fontWeight: 600,
  padding: '12px 28px',
  borderRadius: 'var(--radius-pill, 100px)',
  background: 'var(--gradient-gold)',
  color: 'var(--text-inverse)',
  border: 'none',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-gold)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

/* ──────────────────────────────────────────────
   Pipeline seed data
   ────────────────────────────────────────────── */

const YEMEN_POSITIONS = [
  { donor: 'Ahmad K.', city: 'Houston', commitment: 500, mode: 'Jariyah', cycles: '3/\u221E', estSettlement: 'May 2026', status: 'active' },
  { donor: 'Fatima M.', city: 'Dearborn', commitment: 300, mode: 'Standard', cycles: '1/2', estSettlement: 'Jun 2026', status: 'active' },
  { donor: '[Anonymous]', city: 'Houston', commitment: 2000, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Jul 2026', status: 'active' },
  { donor: 'Omar B.', city: 'Chicago', commitment: 150, mode: 'Standard', cycles: '2/3', estSettlement: 'May 2026', status: 'maturing' },
  { donor: 'Maryam S.', city: 'Dallas', commitment: 250, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Aug 2026', status: 'active' },
  { donor: 'Hassan R.', city: 'Minneapolis', commitment: 400, mode: 'Standard', cycles: '1/2', estSettlement: 'Jun 2026', status: 'active' },
  { donor: 'Zahra L.', city: 'Atlanta', commitment: 100, mode: 'Standard', cycles: '3/3', estSettlement: 'May 2026', status: 'maturing' },
  { donor: '[Anonymous]', city: 'New York', commitment: 750, mode: 'Jariyah', cycles: '2/\u221E', estSettlement: 'Sep 2026', status: 'active' },
  { donor: 'Ibrahim T.', city: 'Philadelphia', commitment: 200, mode: 'Standard', cycles: '1/1', estSettlement: 'May 2026', status: 'maturing' },
  { donor: 'Khadijah W.', city: 'Los Angeles', commitment: 350, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Oct 2026', status: 'active' },
  { donor: 'Ali N.', city: 'Detroit', commitment: 180, mode: 'Standard', cycles: '2/4', estSettlement: 'Jul 2026', status: 'active' },
  { donor: 'Nour H.', city: 'San Francisco', commitment: 600, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Nov 2026', status: 'active' },
  { donor: 'Tariq J.', city: 'Seattle', commitment: 120, mode: 'Standard', cycles: '1/2', estSettlement: 'Jun 2026', status: 'active' },
  { donor: 'Salma D.', city: 'Washington DC', commitment: 275, mode: 'Standard', cycles: '2/3', estSettlement: 'Aug 2026', status: 'active' },
]

const GAZA_POSITIONS = [
  { donor: 'Amina K.', city: 'Houston', commitment: 1000, mode: 'Jariyah', cycles: '2/\u221E', estSettlement: 'May 2026', status: 'maturing' },
  { donor: '[Anonymous]', city: 'Dallas', commitment: 500, mode: 'Standard', cycles: '1/1', estSettlement: 'May 2026', status: 'maturing' },
  { donor: 'Hamza G.', city: 'Chicago', commitment: 300, mode: 'Standard', cycles: '1/2', estSettlement: 'Jun 2026', status: 'active' },
  { donor: 'Layla F.', city: 'Dearborn', commitment: 450, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Jul 2026', status: 'active' },
  { donor: 'Idris P.', city: 'Boston', commitment: 200, mode: 'Standard', cycles: '2/3', estSettlement: 'Jun 2026', status: 'active' },
  { donor: 'Rania C.', city: 'Denver', commitment: 350, mode: 'Standard', cycles: '1/2', estSettlement: 'Aug 2026', status: 'active' },
]

const SOMALIA_POSITIONS = [
  { donor: 'Jamal E.', city: 'Minneapolis', commitment: 800, mode: 'Standard', cycles: '1/2', estSettlement: 'Jul 2026', status: 'active' },
  { donor: '[Anonymous]', city: 'Phoenix', commitment: 250, mode: 'Standard', cycles: '2/2', estSettlement: 'May 2026', status: 'maturing' },
  { donor: 'Sami V.', city: 'Orlando', commitment: 400, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Sep 2026', status: 'active' },
]

const ROHINGYA_POSITIONS = [
  { donor: 'Walid Q.', city: 'Tampa', commitment: 350, mode: 'Standard', cycles: '1/3', estSettlement: 'Oct 2026', status: 'active' },
  { donor: 'Huda Z.', city: 'Charlotte', commitment: 200, mode: 'Jariyah', cycles: '1/\u221E', estSettlement: 'Nov 2026', status: 'active' },
]

const SADAQAH_CONVERSIONS = [
  { donor: 'Bilal M.', amount: 350, date: 'Apr 18, 2026', campaign: 'Yemen Orphan Fund' },
  { donor: 'Khalid R.', amount: 180, date: 'Mar 5, 2026', campaign: 'Gaza Emergency Relief' },
]

const CAMPAIGNS = [
  { name: 'Yemen Orphan Fund', positions: YEMEN_POSITIONS },
  { name: 'Gaza Emergency Relief', positions: GAZA_POSITIONS },
  { name: 'Somalia Clean Water Initiative', positions: SOMALIA_POSITIONS },
  { name: 'Rohingya Medical Aid', positions: ROHINGYA_POSITIONS },
]

/* ──────────────────────────────────────────────
   Status badge
   ────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    active: { label: 'Active', bg: 'rgba(74,173,164,0.12)', color: 'var(--teal-light)' },
    maturing: { label: 'Maturing', bg: 'rgba(212,175,55,0.12)', color: 'var(--gold-light)' },
    settled: { label: 'Settled', bg: 'rgba(74,222,128,0.12)', color: 'var(--status-green)' },
    converted: { label: 'Converted', bg: 'rgba(96,165,250,0.12)', color: 'var(--status-blue)' },
  }
  const m = map[status] || map.active
  return (
    <span style={{
      ...dm(11), fontWeight: 500, padding: '3px 10px',
      borderRadius: 'var(--radius-pill)',
      background: m.bg, color: m.color, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  )
}

/* ──────────────────────────────────────────────
   Campaign Pipeline Table
   ────────────────────────────────────────────── */

function CampaignPipeline({ name, positions }) {
  const [expanded, setExpanded] = useState(true)
  const total = positions.reduce((s, p) => s + p.commitment, 0)

  return (
    <div style={{ ...card, background: 'rgba(22, 22, 31, 0.5)', borderRadius: 16, border: '1px solid rgba(240, 237, 232, 0.06)', overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ ...serif(18), color: 'var(--text-primary)', margin: 0 }}>{name}</h3>
          <span style={{
            ...dm(11), fontWeight: 500, padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
          }}>
            {positions.length} positions
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...serif(16), color: 'var(--gold-light)' }}>${total.toLocaleString()}</span>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
                <thead>
                  <tr>
                    {['Donor', 'Commitment', 'Mode', 'Cycles', 'Est. Settlement', 'Status'].map(h => (
                      <th key={h} style={{
                        ...dm(11), fontWeight: 600, color: 'var(--text-tertiary)',
                        textAlign: h === 'Commitment' ? 'right' : 'left',
                        padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ ...dm(13), color: p.donor.startsWith('[') ? 'var(--text-tertiary)' : 'var(--text-primary)', fontWeight: 500 }}>
                          {p.donor}
                        </div>
                        <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>{p.city}</div>
                      </td>
                      <td style={{ ...dm(13), color: 'var(--text-primary)', fontWeight: 600, padding: '10px', textAlign: 'right' }}>
                        ${p.commitment.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          ...dm(11), fontWeight: 500, padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: p.mode === 'Jariyah' ? 'rgba(212,175,55,0.12)' : 'var(--bg-overlay)',
                          color: p.mode === 'Jariyah' ? 'var(--gold-light)' : 'var(--text-secondary)',
                        }}>
                          {p.mode}
                        </span>
                      </td>
                      <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                        {p.cycles}
                      </td>
                      <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                        {p.estSettlement}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Sadaqah Conversions Section
   ────────────────────────────────────────────── */

function SadaqahConversions() {
  return (
    <div style={card}>
      <h3 style={{ ...serif(18), color: 'var(--text-primary)', margin: '0 0 14px' }}>
        Sadaqah Conversions
      </h3>
      <p style={{ ...dm(13), color: 'var(--text-tertiary)', marginBottom: 14, lineHeight: 1.5 }}>
        Donors who converted their compound positions to direct sadaqah (gift).
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Donor', 'Amount', 'Date', 'Campaign'].map(h => (
                <th key={h} style={{
                  ...dm(11), fontWeight: 600, color: 'var(--text-tertiary)',
                  textAlign: h === 'Amount' ? 'right' : 'left',
                  padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SADAQAH_CONVERSIONS.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ ...dm(13), color: 'var(--text-primary)', padding: '10px', fontWeight: 500 }}>
                  {c.donor}
                </td>
                <td style={{ ...dm(13), color: 'var(--status-green)', fontWeight: 600, padding: '10px', textAlign: 'right' }}>
                  +${c.amount.toLocaleString()}
                </td>
                <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                  {c.date}
                </td>
                <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                  {c.campaign}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
        <div style={{ ...dm(12), color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Total sadaqah conversions: <strong style={{ color: 'var(--status-green)' }}>$530</strong> from 2 donors. These funds are immediately available in your balance.
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Message Compound Donors Card
   ────────────────────────────────────────────── */

function MessageDonorsCard() {
  const [message, setMessage] = useState(
    `Assalamu Alaikum,\n\nThank you for choosing compound giving through Mizan. Your contribution is currently cycling through our Qard Hasan program, providing interest-free loans to families in need. Each time your funds are repaid, they are re-deployed to help another family — multiplying your impact without any additional cost to you.\n\nWe are deeply grateful for your trust and continued support. May Allah reward you abundantly for this ongoing sadaqah jariyah.\n\nWith gratitude,\nIslamic Relief USA`
  )
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSend() {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  function handleCopy() {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <MessageSquare size={20} style={{ color: 'var(--gold-mid)' }} />
        <h3 style={{ ...serif(18), color: 'var(--text-primary)', margin: 0 }}>
          Message Compound Donors
        </h3>
      </div>

      <p style={{ ...dm(13), color: 'var(--text-tertiary)', marginBottom: 14, lineHeight: 1.5 }}>
        Send a message to all donors with active compound positions. Keep them engaged with updates on how their cycling money is making an impact.
      </p>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={8}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          width: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md, 10px)',
          color: 'var(--text-primary)',
          padding: '14px',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          lineHeight: 1.6,
        }}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={goldBtn}
          onClick={handleSend}
        >
          {sent ? (
            <><Check size={16} /> Sent to 25 donors</>
          ) : (
            <><Send size={16} /> Send to compound donors</>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleCopy}
          style={{
            ...dm(13), fontWeight: 500,
            padding: '10px 18px',
            borderRadius: 'var(--radius-pill, 100px)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </motion.button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   NGO Settlements Page
   ════════════════════════════════════════ */

export default function NGOSettlements() {
  const { financial } = useNGOPartner()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const pipelineTotal = CAMPAIGNS.reduce(
    (sum, c) => sum + c.positions.reduce((s, p) => s + p.commitment, 0),
    0
  )

  const fadeIn = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  }

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 900, margin: '0 auto', ...fadeIn }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ ...serif(28), color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Compound Pipeline &mdash; All Positions
          </h1>
          <p style={{ ...dm(13), color: 'var(--text-tertiary)', margin: 0 }}>
            {CAMPAIGNS.reduce((s, c) => s + c.positions.length, 0)} active compound positions across {CAMPAIGNS.length} campaigns
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...serif(32), color: 'var(--gold-mid)', textShadow: '0 0 40px rgba(212, 168, 67, 0.2)' }}>
            ${pipelineTotal.toLocaleString()}
          </div>
          <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>
            total pipeline value
          </div>
        </div>
      </div>

      {/* Pipeline summary bar */}
      <div style={{
        ...card,
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '18px 24px',
      }}>
        {CAMPAIGNS.map(c => {
          const total = c.positions.reduce((s, p) => s + p.commitment, 0)
          const pct = ((total / pipelineTotal) * 100).toFixed(0)
          return (
            <div key={c.name} style={{ flex: '1 1 120px', textAlign: 'center' }}>
              <div style={{ ...serif(18), color: 'var(--gold-light)' }}>${total.toLocaleString()}</div>
              <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginTop: 2 }}>{c.name.split(' ')[0]}</div>
              <div style={{
                marginTop: 6, height: 4, borderRadius: 2,
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--gold-mid), var(--gold-light))',
                }} />
              </div>
              <div style={{ ...dm(10), color: 'var(--text-tertiary)', marginTop: 2 }}>{pct}%</div>
            </div>
          )
        })}
      </div>

      {/* Per-campaign tables */}
      {CAMPAIGNS.map(c => (
        <CampaignPipeline key={c.name} name={c.name} positions={c.positions} />
      ))}

      {/* Sadaqah conversions */}
      <SadaqahConversions />

      {/* Message card */}
      <MessageDonorsCard />
    </div>
  )
}
