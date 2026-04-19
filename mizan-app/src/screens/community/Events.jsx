import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunity } from '../../context/CommunityContext'
import {
  Plus, X, Calendar, Users, DollarSign, TrendingUp,
  Send, CheckCircle, ChevronDown, Sparkles, Tag, Zap
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const EVENT_TYPES = [
  'Jummah',
  'Iftar',
  'Eid',
  'Fundraiser',
  'Workshop',
  'Community Dinner',
  'Other',
]

const TYPE_BADGE_COLORS = {
  celebration: { bg: 'rgba(212,168,67,0.15)', text: '#D4A843' },
  spiritual:   { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  fundraiser:  { bg: 'rgba(74,173,164,0.15)', text: '#4AADA4' },
  education:   { bg: 'rgba(96,165,250,0.15)', text: '#60A5FA' },
  default:     { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' },
}

function getTypeBadge(type) {
  return TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.default
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

/* ------------------------------------------------------------------ */
/*  Log Event Modal                                                    */
/* ------------------------------------------------------------------ */
function LogEventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    type: 'Jummah',
    date: todayStr(),
    attendees: '',
    totalRaised: '',
    notes: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const canSubmit = form.name.trim() && form.date && form.attendees

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      name: form.name.trim(),
      type: form.type.toLowerCase().replace(/\s+/g, '-'),
      date: form.date,
      attendees: parseInt(form.attendees, 10) || 0,
      totalRaised: form.totalRaised ? parseInt(form.totalRaised, 10) : 0,
      givers: 0,
      correlationMultiplier: 1.0,
      notes: form.notes.trim(),
      followupSent: false,
      followupStatus: 'pending',
    })
    onClose()
  }

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.backdrop}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          style={styles.modal}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={styles.modalTitle}>Log Event</h2>
            <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
          </div>

          {/* Form fields */}
          <label style={styles.label}>Event Name</label>
          <input
            style={styles.input}
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. Ramadan Iftar Night 3"
          />

          <label style={styles.label}>Type</label>
          <div style={{ position: 'relative' }}>
            <select
              style={{ ...styles.input, appearance: 'none', paddingRight: 36 }}
              value={form.type}
              onChange={e => update('type', e.target.value)}
            >
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Attendance</label>
              <input
                type="number"
                style={styles.input}
                value={form.attendees}
                onChange={e => update('attendees', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <label style={styles.label}>Amount Raised (optional)</label>
          <input
            type="number"
            style={styles.input}
            value={form.totalRaised}
            onChange={e => update('totalRaised', e.target.value)}
            placeholder="$0"
          />

          <label style={styles.label}>Notes (optional)</label>
          <textarea
            style={{ ...styles.input, minHeight: 72, resize: 'vertical' }}
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Any notes about this event..."
          />

          <button
            style={{ ...styles.tealBtn, marginTop: 8, width: '100%', opacity: canSubmit ? 1 : 0.5 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Log Event
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    modalRoot,
  )
}

/* ------------------------------------------------------------------ */
/*  Follow-up Compose Card                                             */
/* ------------------------------------------------------------------ */
function FollowUpCompose({ event, onSend }) {
  const defaultMsg = `Assalamu alaikum! Thank you for attending ${event.name} on ${formatDate(event.date)}. ${
    event.totalRaised ? `Together we raised $${event.totalRaised.toLocaleString()}. ` : ''
  }Your presence and generosity make our community stronger. May Allah reward you.`

  const [message, setMessage] = useState(defaultMsg)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        marginTop: 12,
        padding: '14px 16px',
        background: 'var(--bg-elevated)',
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
      }}
    >
      <label style={{ ...styles.label, marginBottom: 6 }}>Follow-up Message</label>
      <textarea
        style={{ ...styles.input, minHeight: 80, resize: 'vertical', fontSize: 13 }}
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button
        style={{ ...styles.tealBtn, marginTop: 8, fontSize: 13, padding: '8px 18px' }}
        onClick={() => onSend()}
      >
        <Send size={14} style={{ marginRight: 6 }} />
        Send to {event.attendees} attendees
      </button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Event Card                                                         */
/* ------------------------------------------------------------------ */
function EventCard({ event, isHighest, onMarkFollowup }) {
  const [showCompose, setShowCompose] = useState(false)
  const badge = getTypeBadge(event.type)

  const baseline = event.correlationMultiplier > 0
    ? Math.round(event.givers / event.correlationMultiplier)
    : 0

  const multiplierColor = event.correlationMultiplier > 5
    ? '#D4A843'
    : event.correlationMultiplier >= 2
      ? 'var(--teal-mid)'
      : 'var(--text-tertiary)'

  // Bar width: 12.4x = 100%, scale proportionally
  const barPercent = Math.min(100, (event.correlationMultiplier / 12.4) * 100)

  // Jariyah rate (simulated)
  const jariyahRate = Math.round(17 + (event.correlationMultiplier * 1.2))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.eventCard}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={styles.eventName}>{event.name}</h3>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 20,
              background: badge.bg,
              color: badge.text,
              textTransform: 'capitalize',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {event.type}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={styles.eventMeta}>
              <Calendar size={13} style={{ marginRight: 4, opacity: 0.6 }} />
              {formatDate(event.date)}
            </span>
            <span style={styles.eventMeta}>
              <Users size={13} style={{ marginRight: 4, opacity: 0.6 }} />
              {event.attendees} attended
            </span>
          </div>
        </div>
      </div>

      {/* Giving Multiplier Bar */}
      <div style={{
        padding: '14px 16px',
        background: 'rgba(74,173,164,0.04)',
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <TrendingUp size={16} style={{ color: 'var(--teal-light)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
            Giving Multiplier
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 28,
              color: multiplierColor,
              lineHeight: 1,
            }}>
              {event.correlationMultiplier}x
            </span>
            {isHighest && (
              <Zap size={18} style={{ color: '#D4A843', fill: '#D4A843' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              height: 10,
              borderRadius: 5,
              background: 'var(--bg-overlay)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: 5,
                  background: event.correlationMultiplier > 5
                    ? 'linear-gradient(90deg, #D4A843, #E8C96A)'
                    : event.correlationMultiplier >= 2
                      ? 'linear-gradient(90deg, var(--teal-mid), var(--teal-light))'
                      : 'var(--text-tertiary)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        {event.totalRaised > 0 && (
          <span style={styles.eventMeta}>
            <DollarSign size={13} style={{ marginRight: 4, opacity: 0.6 }} />
            ${event.totalRaised.toLocaleString()} raised
          </span>
        )}
        <span style={styles.eventMeta}>
          <Users size={13} style={{ marginRight: 4, opacity: 0.6 }} />
          {event.givers} members gave
        </span>
        <span style={styles.eventMeta}>
          <Tag size={13} style={{ marginRight: 4, opacity: 0.6 }} />
          {jariyahRate}% Jariyah rate
        </span>
      </div>

      {/* Follow-up status */}
      <div>
        {event.followupSent || event.followupStatus === 'sent' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} style={{ color: 'var(--status-green)' }} />
            <span style={{ fontSize: 13, color: 'var(--status-green)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              Sent
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowCompose(!showCompose)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--teal-light)',
                fontFamily: "'DM Sans', sans-serif", padding: 0,
              }}
            >
              <Send size={14} />
              Send follow-up &rarr;
            </button>

            <AnimatePresence>
              {showCompose && (
                <FollowUpCompose
                  event={event}
                  onSend={() => {
                    onMarkFollowup(event.id)
                    setShowCompose(false)
                  }}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Event ROI Chart (SVG horizontal bars)                              */
/* ------------------------------------------------------------------ */
function EventROIChart({ events }) {
  if (events.length === 0) return null

  const sorted = [...events].sort((a, b) => (b.correlationMultiplier || 0) - (a.correlationMultiplier || 0))
  const maxMultiplier = sorted[0]?.correlationMultiplier || 1

  const barHeight = 36
  const gap = 10
  const labelWidth = 200
  const chartWidth = 700
  const barAreaWidth = chartWidth - labelWidth - 60
  const svgHeight = sorted.length * (barHeight + gap) + 20

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 16,
      padding: '22px 20px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        fontSize: 20,
        color: 'var(--text-primary)',
        margin: '0 0 16px',
      }}>
        Event ROI Comparison
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={chartWidth}
          height={svgHeight}
          viewBox={`0 0 ${chartWidth} ${svgHeight}`}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          <defs>
            <linearGradient id="goldBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#E8C96A" />
            </linearGradient>
          </defs>
          {sorted.map((evt, i) => {
            const y = i * (barHeight + gap) + 10
            const barW = Math.max(4, (evt.correlationMultiplier / maxMultiplier) * barAreaWidth)
            return (
              <g key={evt.id}>
                <text
                  x={labelWidth - 8}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="var(--text-secondary)"
                  fontSize={13}
                  fontFamily="'DM Sans', sans-serif"
                >
                  {evt.name.length > 26 ? evt.name.slice(0, 24) + '...' : evt.name}
                </text>
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={barW}
                  height={barHeight - 8}
                  rx={6}
                  fill="url(#goldBar)"
                  opacity={0.9}
                />
                <text
                  x={labelWidth + barW + 8}
                  y={y + barHeight / 2 + 1}
                  dominantBaseline="middle"
                  fill="#D4A843"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="'Cormorant Garamond', serif"
                >
                  {evt.correlationMultiplier}x
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Events Page                                                   */
/* ------------------------------------------------------------------ */
export default function CommunityEvents() {
  const { events, logEvent, markFollowupSent } = useCommunity()
  const [showModal, setShowModal] = useState(false)

  // Sort by correlation multiplier descending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => (b.correlationMultiplier || 0) - (a.correlationMultiplier || 0))
  }, [events])

  // Find all-time highest multiplier
  const highestMultiplier = useMemo(() => {
    if (sortedEvents.length === 0) return 0
    return sortedEvents[0].correlationMultiplier
  }, [sortedEvents])

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Community Events</h1>
        <button style={styles.tealBtn} onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Log Event
        </button>
      </div>

      {/* Event cards — 2-column grid, sorted by multiplier */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        {sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isHighest={event.correlationMultiplier === highestMultiplier}
            onMarkFollowup={markFollowupSent}
          />
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', marginBottom: 24 }}>
          <Sparkles size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
            No events logged yet. Click "+ Log Event" to get started.
          </p>
        </div>
      )}

      {/* Event ROI Chart — full width below cards */}
      <EventROIChart events={events} />

      {/* Log Event Modal */}
      {showModal && (
        <LogEventModal
          onClose={() => setShowModal(false)}
          onSubmit={logEvent}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    padding: '24px 16px',
    maxWidth: 960,
    margin: '0 auto',
  },

  pageTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 28,
    color: 'var(--text-primary)',
    margin: 0,
  },

  /* Event card */
  eventCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 16,
    padding: '22px 20px',
    boxShadow: 'var(--shadow-card)',
  },
  eventName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 20,
    color: 'var(--text-primary)',
    margin: 0,
  },
  eventMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Teal button */
  tealBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--teal-mid)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  /* Modal */
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'var(--bg-surface)',
    borderRadius: 16,
    padding: '24px 24px 28px',
    border: '1px solid var(--border-default)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 22,
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 8,
    display: 'flex',
  },

  /* Form */
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: 'var(--text-primary)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
}
