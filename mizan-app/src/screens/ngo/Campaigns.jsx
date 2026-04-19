import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ArrowRight, DollarSign, Users, TrendingUp, Clock,
  Eye, BarChart3, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ---------------------------------------------------------------------------
   Seed Data
   --------------------------------------------------------------------------- */

const CAMPAIGNS_ACTIVE = [
  {
    id: 'gaza-water',
    name: 'Gaza Emergency Water Fund',
    status: 'Active',
    statusColor: 'var(--status-green)',
    raised: 12400,
    goal: 12400,
    donors: 247,
    jariyah: 38,
    compoundInTransit: 1840,
    directPct: 62,
    compoundPct: 38,
    fundingPct: 100,
    fundingBarColor: 'var(--status-green)',
    goalMet: true,
    discoverRank: 'Top 5%',
    discoverColor: 'var(--status-green)',
    lastUpdate: '3 days ago',
    lastUpdateDays: 3,
    note: null,
    extendClose: true,
  },
  {
    id: 'rohingya-edu',
    name: 'Rohingya Education Initiative',
    status: 'Active',
    statusColor: 'var(--status-green)',
    raised: 5200,
    goal: 15000,
    donors: 89,
    jariyah: 12,
    compoundInTransit: 620,
    directPct: 71,
    compoundPct: 29,
    fundingPct: 35,
    fundingBarColor: 'var(--gold-mid)',
    goalMet: false,
    discoverRank: 'Top 28%',
    discoverColor: 'var(--status-yellow)',
    lastUpdate: '12 days ago',
    lastUpdateDays: 12,
    note: 'Low momentum',
    extendClose: false,
  },
  {
    id: 'syria-medical',
    name: 'Syria Medical Relief',
    status: 'Active',
    statusColor: 'var(--status-green)',
    raised: 8900,
    goal: 20000,
    donors: 156,
    jariyah: 24,
    compoundInTransit: 1120,
    directPct: 65,
    compoundPct: 35,
    fundingPct: 45,
    fundingBarColor: 'var(--gold-mid)',
    goalMet: false,
    discoverRank: 'Top 12%',
    discoverColor: 'var(--teal-mid)',
    lastUpdate: '1 day ago',
    lastUpdateDays: 1,
    note: null,
    extendClose: false,
  },
  {
    id: 'yemen-food',
    name: 'Yemen Food Security Program',
    status: 'Active',
    statusColor: 'var(--status-green)',
    raised: 3100,
    goal: 10000,
    donors: 64,
    jariyah: 8,
    compoundInTransit: 380,
    directPct: 68,
    compoundPct: 32,
    fundingPct: 31,
    fundingBarColor: 'var(--gold-mid)',
    goalMet: false,
    discoverRank: 'Top 40%',
    discoverColor: 'var(--text-tertiary)',
    lastUpdate: '45 days ago',
    lastUpdateDays: 45,
    note: null,
    extendClose: false,
  },
]

const CAMPAIGNS_DRAFTS = [
  {
    id: 'orphan-sponsorship',
    name: 'Orphan Sponsorship Network',
    stepsComplete: 2,
    stepsTotal: 5,
    lastEdited: 'Apr 14, 2026',
  },
]

const CAMPAIGNS_CLOSED = [
  { id: 'c1', name: 'Ramadan Food Drive 2025', created: 'Feb 2025', closed: 'Apr 2025', raised: 18200, donors: 312, outcome: 'Goal met' },
  { id: 'c2', name: 'Winter Shelter Campaign', created: 'Oct 2024', closed: 'Jan 2025', raised: 9800, donors: 178, outcome: 'Goal met' },
  { id: 'c3', name: 'Eid Gift Fund', created: 'May 2025', closed: 'Jun 2025', raised: 4200, donors: 94, outcome: 'Goal met' },
  { id: 'c4', name: 'Flood Relief Pakistan', created: 'Aug 2024', closed: 'Nov 2024', raised: 22400, donors: 421, outcome: 'Goal met' },
  { id: 'c5', name: 'Masjid Renovation Fund', created: 'Mar 2025', closed: 'Jul 2025', raised: 7600, donors: 145, outcome: 'Closed early' },
  { id: 'c6', name: 'Back to School Initiative', created: 'Jul 2025', closed: 'Sep 2025', raised: 3400, donors: 67, outcome: 'Partial' },
  { id: 'c7', name: 'Qurbani Distribution 2025', created: 'May 2025', closed: 'Jun 2025', raised: 11200, donors: 203, outcome: 'Goal met' },
]

/* ---------------------------------------------------------------------------
   Tab Pill
   --------------------------------------------------------------------------- */

function TabPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--gold-mid)' : 'var(--bg-surface)',
        color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
        border: active ? 'none' : '1px solid var(--border-subtle)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label}
      <span style={{
        background: active ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
        padding: '1px 7px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
      }}>
        {count}
      </span>
    </button>
  )
}

/* ---------------------------------------------------------------------------
   Stat Item
   --------------------------------------------------------------------------- */

function StatItem({ icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
      {label && <span>{label}</span>}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Update Recency Color
   --------------------------------------------------------------------------- */

function recencyColor(days) {
  if (days < 7) return 'var(--status-green)'
  if (days <= 30) return 'var(--status-yellow)'
  return 'var(--status-red)'
}

/* ---------------------------------------------------------------------------
   Impact Update Modal
   --------------------------------------------------------------------------- */

function ImpactUpdateModal({ campaign, onClose }) {
  const [updateText, setUpdateText] = useState('')

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 32,
          width: '100%',
          maxWidth: 520,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Post Impact Update
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          for {campaign.name}
        </p>

        <label style={labelStyle}>Update Message</label>
        <textarea
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="Share what your campaign has accomplished..."
          rows={4}
          style={{ ...inputStyle, height: 'auto', resize: 'vertical', minHeight: 100 }}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: 'var(--gradient-gold)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Post Update
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Active Campaign Card
   --------------------------------------------------------------------------- */

function ActiveCampaignCard({ campaign, index, onPostUpdate }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(22, 22, 31, 0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px 28px',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(240, 237, 232, 0.06)',
      }}
    >
      {/* Gold left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: 'var(--gold-mid)', borderRadius: '4px 0 0 4px',
      }} />

      {/* Top row: name + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600,
          color: 'var(--text-primary)', margin: 0, lineHeight: 1.2,
        }}>
          {campaign.name}
        </h3>
        <span style={{
          padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em',
          color: campaign.statusColor, background: `${campaign.statusColor}15`,
          border: `1px solid ${campaign.statusColor}30`,
        }}>
          {campaign.status}
        </span>
        {campaign.goalMet && (
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", color: 'var(--status-green)',
            background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
            boxShadow: '0 0 12px rgba(74, 222, 128, 0.2)',
          }}>
            Goal met
          </span>
        )}
        {campaign.extendClose && (
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", color: 'var(--status-yellow)',
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
          }}>
            Extend or close
          </span>
        )}
        {campaign.note && (
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", color: 'var(--status-yellow)',
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <AlertTriangle size={10} /> {campaign.note}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginBottom: 14 }}>
        <StatItem icon={<DollarSign size={13} />} value={`$${campaign.raised.toLocaleString()}`} label="raised" />
        <StatItem icon={<Users size={13} />} value={campaign.donors} label="donors" />
        <StatItem icon={<TrendingUp size={13} />} value={campaign.jariyah} label="jariyah" />
      </div>

      {/* Compound in-transit line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
        fontFamily: "'DM Sans', sans-serif", fontSize: 12,
      }}>
        <span style={{ color: 'var(--gold-mid)', fontWeight: 600 }}>
          ${campaign.compoundInTransit.toLocaleString()} compound in transit
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>
          ({campaign.directPct}% direct / {campaign.compoundPct}% compound)
        </span>
      </div>

      {/* Funding bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Funding Progress
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: campaign.fundingBarColor }}>
            {campaign.fundingPct}%{campaign.goalMet ? ' - Goal met \u2713' : ''}
          </span>
        </div>
        <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${campaign.fundingPct}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: '100%', background: campaign.fundingBarColor, borderRadius: 5, boxShadow: '0 0 12px rgba(212, 168, 67, 0.2)' }}
          />
        </div>
      </div>

      {/* Bottom row: discover rank + last update + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Discover ranking badge */}
          <span style={{
            padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", color: campaign.discoverColor,
            background: `${campaign.discoverColor}15`, border: `1px solid ${campaign.discoverColor}30`,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <BarChart3 size={10} /> {campaign.discoverRank}
          </span>

          {/* Last impact update */}
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: recencyColor(campaign.lastUpdateDays),
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Clock size={11} /> Updated {campaign.lastUpdate}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/ngo/campaigns/${campaign.id}`)}
            style={{ ...actionBtn, color: 'var(--gold-mid)' }}
          >
            Manage <ArrowRight size={12} />
          </button>
          <button
            onClick={() => onPostUpdate(campaign)}
            style={{ ...actionBtn, color: 'var(--teal-mid)' }}
          >
            Post Impact Update
          </button>
          <button
            onClick={() => navigate('/portfolio/discover')}
            style={{ ...actionBtn, color: 'var(--text-secondary)' }}
          >
            View on Discover <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Draft Card
   --------------------------------------------------------------------------- */

function DraftCard({ draft }) {
  const navigate = useNavigate()
  const pct = Math.round((draft.stepsComplete / draft.stepsTotal) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px 28px',
        marginBottom: 16,
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {draft.name}
        </h3>
        <span style={{
          padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", color: 'var(--text-tertiary)',
          background: 'rgba(255,255,255,0.06)',
        }}>
          Draft
        </span>
      </div>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        {draft.stepsComplete} of {draft.stepsTotal} steps complete &middot; Last edited {draft.lastEdited}
      </p>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold-mid)', borderRadius: 'var(--radius-pill)', transition: 'width 0.5s ease' }} />
      </div>

      <button
        onClick={() => navigate('/ngo/campaigns/new')}
        style={{ ...actionBtn, color: 'var(--gold-mid)' }}
      >
        Continue Editing <ArrowRight size={12} />
      </button>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Closed Campaigns Table
   --------------------------------------------------------------------------- */

function ClosedTable({ campaigns }) {
  const [sortKey, setSortKey] = useState('closed')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sorted = [...campaigns].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortAsc ? -1 : 1
    if (av > bv) return sortAsc ? 1 : -1
    return 0
  })

  const SortIcon = sortAsc ? ChevronUp : ChevronDown

  const cols = [
    { key: 'name', label: 'Campaign', flex: 3 },
    { key: 'created', label: 'Created', flex: 1.2 },
    { key: 'closed', label: 'Closed', flex: 1.2 },
    { key: 'raised', label: 'Raised', flex: 1.2 },
    { key: 'donors', label: 'Donors', flex: 1 },
    { key: 'outcome', label: 'Outcome', flex: 1.2 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        {cols.map((col) => (
          <button
            key={col.key}
            onClick={() => handleSort(col.key)}
            style={{
              flex: col.flex,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
              color: sortKey === col.key ? 'var(--gold-mid)' : 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: 4,
              textAlign: 'left',
            }}
          >
            {col.label}
            {sortKey === col.key && <SortIcon size={12} />}
          </button>
        ))}
      </div>

      {/* Data rows */}
      {sorted.map((c, i) => (
        <div
          key={c.id}
          style={{
            display: 'flex', padding: '14px 24px', alignItems: 'center',
            borderBottom: i < sorted.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)',
          }}
        >
          <div style={{ flex: 3, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
          <div style={{ flex: 1.2 }}>{c.created}</div>
          <div style={{ flex: 1.2 }}>{c.closed}</div>
          <div style={{ flex: 1.2, fontWeight: 600, color: 'var(--text-primary)' }}>${c.raised.toLocaleString()}</div>
          <div style={{ flex: 1 }}>{c.donors}</div>
          <div style={{ flex: 1.2 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
              color: c.outcome === 'Goal met' ? 'var(--status-green)' : c.outcome === 'Partial' ? 'var(--status-yellow)' : 'var(--text-tertiary)',
              background: c.outcome === 'Goal met' ? 'rgba(74,222,128,0.12)' : c.outcome === 'Partial' ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)',
            }}>
              {c.outcome}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Main Campaigns Screen
   --------------------------------------------------------------------------- */

const TABS = [
  { key: 'active', label: 'Active', count: 4 },
  { key: 'drafts', label: 'Drafts', count: 1 },
  { key: 'closed', label: 'Closed', count: 7 },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const partner = useNGOPartner()
  const [activeTab, setActiveTab] = useState('active')
  const [updateModal, setUpdateModal] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ padding: '48px 24px 80px', maxWidth: 1040, margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Your Campaigns
        </h1>
        <button
          onClick={() => navigate('/ngo/campaigns/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            background: 'var(--gradient-gold)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-gold)',
            transition: 'all var(--transition-base)',
          }}
        >
          <Plus size={16} />
          + New Campaign
        </button>
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TABS.map((tab) => (
          <TabPill
            key={tab.key}
            label={tab.label}
            count={tab.count}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {CAMPAIGNS_ACTIVE.map((c, i) => (
              <ActiveCampaignCard
                key={c.id}
                campaign={c}
                index={i}
                onPostUpdate={(campaign) => setUpdateModal(campaign)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'drafts' && (
          <motion.div key="drafts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {CAMPAIGNS_DRAFTS.map((d) => (
              <DraftCard key={d.id} draft={d} />
            ))}
          </motion.div>
        )}

        {activeTab === 'closed' && (
          <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ClosedTable campaigns={CAMPAIGNS_CLOSED} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact Update Modal */}
      <AnimatePresence>
        {updateModal && (
          <ImpactUpdateModal
            campaign={updateModal}
            onClose={() => setUpdateModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Shared Styles
   --------------------------------------------------------------------------- */

const labelStyle = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13, fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  marginBottom: 20,
  boxSizing: 'border-box',
}

const actionBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 0',
}

const btnSecondary = {
  padding: '12px 24px',
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14, fontWeight: 500,
  cursor: 'pointer',
}
