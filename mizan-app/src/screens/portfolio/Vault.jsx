import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, Heart, TrendingUp } from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'

/* ── Helpers ── */

const RELATIONSHIPS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Friend', 'Self/Legacy', 'Other']

function initialColor(name) {
  const colors = ['#E57373', '#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#4DD0E1', '#F06292', '#AED581']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

/* ── Add Person Modal ── */

function AddPersonModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('Parent')
  const [type, setType] = useState('memorial')
  const [note, setNote] = useState('')

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      id: `vault-${Date.now()}`,
      name: name.trim(),
      relationship,
      type,
      note: note.trim() || null,
      photo: null,
      createdAt: new Date().toISOString(),
      impactEntries: [],
    })
    setName('')
    setRelationship('Parent')
    setType('memorial')
    setNote('')
    onClose()
  }

  const inputStyle = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    outline: 'none',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: 32,
              width: '100%',
              maxWidth: 440,
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>
                Open an Account
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter their name"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Relationship */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Type Toggle */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Type
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['memorial', 'living'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        flex: 1,
                        height: 44,
                        borderRadius: 'var(--radius-sm)',
                        border: type === t ? '1.5px solid var(--gold-mid)' : '1px solid var(--border-default)',
                        background: type === t ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                        color: type === t ? 'var(--gold-light)' : 'var(--text-secondary)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      {t === 'memorial' ? 'Memorial' : 'Living Tribute'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A memory, a dua, or why this matters..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '12px 16px',
                    resize: 'vertical',
                    minHeight: 80,
                  }}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: 8,
                  height: 52,
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--gradient-gold)',
                  color: 'var(--text-inverse)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-gold)',
                }}
              >
                Create Account
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root')
  )
}

/* ── Person Card ── */

function PersonCard({ person, positions }) {
  const navigate = useNavigate()

  const activePositionCount = positions.filter(
    (p) => p.vaultPersonId === person.id && p.status === 'active'
  ).length

  const latestEntry = person.impactEntries?.[0]

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'rgba(22, 22, 31, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        cursor: 'pointer',
        transition: 'transform 200ms, box-shadow 200ms',
      }}
      onClick={() => navigate(`/portfolio/vault/${person.id}`)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: initialColor(person.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: 18,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {person.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>
            {person.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
              {person.relationship}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: person.type === 'memorial' ? 'rgba(139,92,246,0.15)' : 'rgba(74,173,164,0.15)',
                color: person.type === 'memorial' ? '#A78BFA' : 'var(--teal-light)',
              }}
            >
              {person.type === 'memorial' ? 'Memorial' : 'Living Tribute'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
            {person.impactEntries?.length || 0} impact {(person.impactEntries?.length || 0) === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
            {activePositionCount} active {activePositionCount === 1 ? 'position' : 'positions'}
          </span>
        </div>
      </div>

      {/* Latest impact entry */}
      {latestEntry && (
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 14,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {latestEntry.text}
        </p>
      )}

      {/* Link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--gold-mid)',
        }}
      >
        View their journey <ChevronRight size={14} />
      </div>
    </motion.div>
  )
}

/* ── Main Vault Page ── */

export default function Vault() {
  const { vaultPersons, positions, addVaultPerson } = usePortfolio()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px 16px 80px', maxWidth: 720, margin: '0 auto' }}
    >
      {/* Title */}
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Jariyah Vault
      </h1>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 8,
          maxWidth: 540,
        }}
      >
        Their good deeds continue. Sadaqah jariyah is charity that flows on behalf of someone you
        love -- whether they have passed or are still with you. Every position tagged here becomes
        part of their ongoing legacy of good.
      </p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--gold-mid)', marginTop: 8, marginBottom: 32 }}>{'\u0635\u062F\u0642\u0629 \u062C\u0627\u0631\u064A\u0629'} — Ongoing charity that continues after you</p>

      {/* Open an Account card */}
      <motion.div
        whileHover={{
          boxShadow: '0 0 30px rgba(212, 168, 67, 0.15)',
          borderColor: 'rgba(212, 168, 67, 0.4)',
        }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setModalOpen(true)}
        style={{
          border: '2px dashed var(--border-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: 'pointer',
          marginBottom: 24,
          transition: 'all 200ms ease',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--gold-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={24} style={{ color: 'var(--gold-mid)' }} />
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--gold-mid)',
          }}
        >
          + Open an Account
        </span>
      </motion.div>

      {/* Person Grid */}
      {vaultPersons.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {vaultPersons.map((person) => (
            <PersonCard key={person.id} person={person} positions={positions} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddPersonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addVaultPerson}
      />
    </motion.div>
  )
}
