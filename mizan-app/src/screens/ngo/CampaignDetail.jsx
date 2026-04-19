import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, DollarSign, Users, TrendingUp, Eye,
  Clock, BarChart3, Copy, Edit3, Layers, XCircle, Upload,
  Bell, Briefcase, CreditCard, BookOpen, Mail, Send, X,
  Image, ChevronDown, ChevronUp, CheckCircle, MessageSquare,
  Heart, Share2, Award,
} from 'lucide-react'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ---------------------------------------------------------------------------
   Seed Data
   --------------------------------------------------------------------------- */

const CAMPAIGN_DATA = {
  'gaza-water': {
    name: 'Gaza Emergency Water Fund',
    status: 'Active',
    raised: 8400,
    goal: 12000,
    donors: 247,
    jariyah: 38,
    directAmount: 5200,
    directPct: 62,
    compoundAmount: 3200,
    compoundPct: 38,
    fundingPct: 70,
    compoundInTransit: 1840,
    compoundCycles: 3,
    avgCycleTime: '42 days',
    compoundMultiplier: '2.8x',
    discoverRank: 'Top 12%',
    discoverColor: 'var(--teal-mid)',
    views: 1820,
    shares: 94,
    avgDonation: 34,
    repeatDonors: 28,
    nextSettlement: 'Apr 22, 2026',
    settlementAmount: 2400,
    settlementMethod: 'Wire transfer',
    created: 'Mar 1, 2026',
    lastUpdate: '3 days ago',
    updates: [
      {
        id: 'u1',
        type: 'Milestone',
        text: 'We have completed the first water well installation in northern Gaza, providing clean water to over 500 families.',
        date: 'Apr 15, 2026',
        openRate: 68,
        reactions: 42,
      },
      {
        id: 'u2',
        type: 'Photo Update',
        text: 'Construction underway on the second purification station. On track for completion by end of month.',
        date: 'Apr 8, 2026',
        openRate: 54,
        reactions: 31,
      },
    ],
  },
}

// Fallback for any campaign ID
function getCampaignData(id) {
  return CAMPAIGN_DATA[id] || {
    ...CAMPAIGN_DATA['gaza-water'],
    name: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }
}

/* ---------------------------------------------------------------------------
   Impact Update Modal (via createPortal)
   --------------------------------------------------------------------------- */

const UPDATE_TYPES = [
  { id: 'milestone', label: 'Milestone', icon: Award },
  { id: 'photo', label: 'Photo Update', icon: Image },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'story', label: 'Beneficiary Story', icon: Heart },
  { id: 'financial', label: 'Financial Report', icon: DollarSign },
]

const CHANNELS = [
  { id: 'push', label: 'Push Notification', icon: Bell, desc: 'Mobile app alert' },
  { id: 'vault', label: 'Vault Feed', icon: Briefcase, desc: 'Appears in donor vault' },
  { id: 'portfolio', label: 'Portfolio Card', icon: CreditCard, desc: 'Embedded in position' },
  { id: 'journey', label: 'Journey Log', icon: BookOpen, desc: 'Added to journey timeline' },
  { id: 'email', label: 'Email Digest', icon: Mail, desc: 'Weekly donor email' },
]

function ImpactUpdateModal({ campaign, onClose }) {
  const [updateType, setUpdateType] = useState('milestone')
  const [updateText, setUpdateText] = useState('')
  const [photo, setPhoto] = useState(null)

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-modal)', padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 32, width: '100%', maxWidth: 600,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Post Impact Update
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {campaign.name}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Update Type Chips */}
        <label style={labelStyle}>Update Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {UPDATE_TYPES.map((t) => {
            const selected = updateType === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setUpdateType(t.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: selected ? 'rgba(212,168,67,0.12)' : 'var(--bg-surface)',
                  border: selected ? '1px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
                  color: selected ? 'var(--gold-light)' : 'var(--text-secondary)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Message */}
        <label style={labelStyle}>Message</label>
        <textarea
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="Share what your campaign has accomplished..."
          rows={4}
          style={{ ...inputStyle, height: 'auto', resize: 'vertical', minHeight: 100 }}
        />

        {/* Photo Upload */}
        <label style={labelStyle}>Photo (optional)</label>
        <div
          onClick={() => setPhoto(photo ? null : 'update-photo.jpg')}
          style={{
            border: photo ? '1px solid var(--status-green)' : '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
            cursor: 'pointer', marginBottom: 24,
            background: photo ? 'rgba(74,222,128,0.05)' : 'transparent',
          }}
        >
          {photo ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={16} style={{ color: 'var(--status-green)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--status-green)', fontWeight: 600 }}>Photo selected</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)' }}>Click to add photo</span>
            </div>
          )}
        </div>

        {/* Cross-Account Preview */}
        <label style={labelStyle}>Cross-Account Preview</label>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 12px 0' }}>
            This update will appear across 5 channels:
          </p>
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon
            return (
              <div key={ch.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: i < CHANNELS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: 'rgba(212,168,67,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} style={{ color: 'var(--gold-mid)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ch.label}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {ch.desc}
                  </div>
                </div>
                <CheckCircle size={14} style={{ color: 'var(--status-green)' }} />
              </div>
            )
          })}
        </div>

        {/* Post button */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px 24px',
            background: 'var(--gradient-gold)', color: 'var(--text-inverse)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: 'var(--shadow-gold)',
          }}
        >
          <Send size={16} /> Post to 247 donors \u2192
        </button>
      </motion.div>
    </div>
  )

  return createPortal(modal, document.body)
}

/* ---------------------------------------------------------------------------
   Stat Chip
   --------------------------------------------------------------------------- */

function StatChip({ icon, value, label, color = 'var(--text-primary)' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 'var(--radius-pill)',
      background: 'rgba(22, 22, 31, 0.5)', border: '1px solid rgba(240, 237, 232, 0.06)',
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Main Campaign Detail Screen
   --------------------------------------------------------------------------- */

export default function CampaignDetail() {
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const partner = useNGOPartner()
  const campaign = getCampaignData(campaignId)

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCompoundBreakdown, setShowCompoundBreakdown] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ padding: '48px 24px 80px', maxWidth: 1100, margin: '0 auto' }}
    >
      {/* Back link */}
      <button
        onClick={() => navigate('/ngo/campaigns')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--gold-mid)',
          display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} /> Back to campaigns
      </button>

      {/* Campaign Title + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {campaign.name}
        </h1>
        <span style={{
          padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", color: 'var(--status-green)',
          background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
        }}>
          {campaign.status}
        </span>
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 28 }}>
        Created {campaign.created} &middot; Last updated {campaign.lastUpdate}
      </p>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* ============== MAIN COLUMN (65%) ============== */}
        <div style={{ flex: '0 0 65%', minWidth: 0 }}>

          {/* Large Funding Bar */}
          <div style={{
            background: 'rgba(22, 22, 31, 0.55)', borderRadius: 20,
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)', padding: 28, marginBottom: 20,
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Funding Progress
              </span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>
                ${campaign.raised.toLocaleString()} <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}>of ${campaign.goal.toLocaleString()}</span>
              </span>
            </div>

            {/* 20px bar */}
            <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: 14 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${campaign.fundingPct}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                style={{ height: '100%', background: 'var(--gold-mid)', borderRadius: 'var(--radius-pill)' }}
              />
            </div>

            {/* Direct vs Compound split */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-green)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--status-green)' }}>${campaign.directAmount.toLocaleString()} Direct</strong> ({campaign.directPct}%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold-mid)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--gold-mid)' }}>${campaign.compoundAmount.toLocaleString()} Compound</strong> ({campaign.compoundPct}%)
                </span>
              </div>
            </div>

            {/* Collapsible compound breakdown */}
            <button
              onClick={() => setShowCompoundBreakdown(!showCompoundBreakdown)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                color: 'var(--gold-mid)', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Compound Breakdown {showCompoundBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showCompoundBreakdown && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: 12, padding: 16, background: 'rgba(212,168,67,0.05)',
                    borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,168,67,0.15)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
                  }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        In Transit
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-light)' }}>
                        ${campaign.compoundInTransit.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Cycles Completed
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {campaign.compoundCycles}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Avg Cycle Time
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {campaign.avgCycleTime}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Engagement Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            <StatChip icon={<Eye size={13} />} value={campaign.views.toLocaleString()} label="views" />
            <StatChip icon={<Share2 size={13} />} value={campaign.shares} label="shares" />
            <StatChip icon={<DollarSign size={13} />} value={`$${campaign.avgDonation}`} label="avg donation" />
            <StatChip icon={<Users size={13} />} value={`${campaign.repeatDonors}%`} label="repeat donors" />
          </div>

          {/* Impact Updates Section */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)', padding: 24,
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Impact Updates
              </h2>
              <button
                onClick={() => setShowUpdateModal(true)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--gradient-gold)', color: 'var(--text-inverse)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: 'var(--shadow-gold)',
                }}
              >
                Post Impact Update <ArrowRight size={14} />
              </button>
            </div>

            {/* Update entries */}
            {campaign.updates.map((update, i) => (
              <div
                key={update.id}
                style={{
                  padding: '16px 0',
                  borderBottom: i < campaign.updates.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", color: 'var(--gold-light)',
                    background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)',
                  }}>
                    {update.type}
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {update.date}
                  </span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                  {update.text}
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Mail size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {update.openRate}% open rate
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Heart size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {update.reactions} reactions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============== SIDEBAR (35%) ============== */}
        <div style={{ flex: '0 0 35%', minWidth: 0 }}>

          {/* Campaign Stats Card */}
          <div style={{
            background: 'rgba(22, 22, 31, 0.55)', borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)', padding: 24, marginBottom: 16,
            border: '1px solid rgba(240, 237, 232, 0.06)',
          }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px 0' }}>
              Campaign Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SidebarStat label="Total Raised" value={`$${campaign.raised.toLocaleString()}`} color="var(--gold-light)" />
              <SidebarStat label="Total Donors" value={campaign.donors} />
              <SidebarStat label="Jariyah Donors" value={campaign.jariyah} color="var(--teal-light)" />
              <SidebarStat label="Compound Multiplier" value={campaign.compoundMultiplier} color="var(--gold-light)" />
              <SidebarStat label="Funding Progress" value={`${campaign.fundingPct}%`} />
            </div>
          </div>

          {/* Discover Ranking */}
          <div style={{
            background: 'rgba(22, 22, 31, 0.55)', borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)', padding: 20, marginBottom: 16,
            border: '1px solid rgba(240, 237, 232, 0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `${campaign.discoverColor}15`,
              border: `2px solid ${campaign.discoverColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={20} style={{ color: campaign.discoverColor }} />
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Discover Ranking
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, color: campaign.discoverColor }}>
                {campaign.discoverRank}
              </div>
            </div>
          </div>

          {/* Settlement Tracking */}
          <div style={{
            background: 'rgba(22, 22, 31, 0.55)', borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)', padding: 20, marginBottom: 16,
            border: '1px solid rgba(240, 237, 232, 0.06)',
          }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>
              Next Settlement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>Date</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.nextSettlement}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>Amount</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--status-green)' }}>${campaign.settlementAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>Method</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.settlementMethod}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(22, 22, 31, 0.55)', borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)', padding: 20,
            border: '1px solid rgba(240, 237, 232, 0.06)',
          }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <QuickActionBtn icon={<Edit3 size={14} />} label="Edit Campaign" onClick={() => navigate('/ngo/campaigns/new')} />
              <QuickActionBtn icon={<Layers size={14} />} label="Duplicate Campaign" onClick={() => {}} />
              <QuickActionBtn icon={<XCircle size={14} />} label="Close Campaign" onClick={() => navigate('/ngo/campaigns')} danger />
            </div>
          </div>
        </div>
      </div>

      {/* Impact Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <ImpactUpdateModal
            campaign={campaign}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Sidebar Sub-components
   --------------------------------------------------------------------------- */

function SidebarStat({ label, value, color = 'var(--text-primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function QuickActionBtn({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px 14px', textAlign: 'left',
        background: 'transparent',
        border: 'none', borderRadius: 'var(--radius-md)',
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
        color: danger ? 'var(--status-red)' : 'var(--text-secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {icon} {label}
    </button>
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
  fontSize: 14, color: 'var(--text-primary)',
  outline: 'none', marginBottom: 20,
  boxSizing: 'border-box',
}
