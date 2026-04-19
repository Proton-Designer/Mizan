import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Heart, TrendingUp, DollarSign } from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'

/* ── Helpers ── */

function initialColor(name) {
  const colors = ['#E57373', '#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#4DD0E1', '#F06292', '#AED581']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function relativeTime(timestamp) {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`
  if (weeks > 0) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'Just now'
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── Impact Entry Card ── */

function ImpactEntryCard({ entry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      {/* Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
          {relativeTime(entry.timestamp)}
        </span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>|</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
          {formatDate(entry.timestamp)}
        </span>
      </div>

      {/* Impact text */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          marginBottom: 10,
        }}
      >
        {entry.text}
      </p>

      {/* NGO + campaign */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
          {entry.ngoName}{entry.campaign ? ` \u00B7 ${entry.campaign}` : ''}
        </span>

        {/* Share button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => console.log('share', entry.id)}
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Share2 size={13} /> Share
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Main VaultPerson Page ── */

export default function VaultPerson() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const { vaultPersons, positions } = usePortfolio()

  const person = vaultPersons.find((p) => p.id === personId)

  if (!person) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'var(--text-secondary)' }}>
          Person not found.
        </p>
        <button
          onClick={() => navigate('/portfolio/vault')}
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: 'var(--gold-mid)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Back to Vault
        </button>
      </div>
    )
  }

  const taggedPositions = positions.filter((p) => p.vaultPersonId === person.id)
  const activeCommitments = taggedPositions.filter((p) => p.status === 'active').length
  const totalDeployed = taggedPositions.reduce((sum, p) => sum + p.amount, 0)
  const entries = [...(person.impactEntries || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '24px 16px 80px', maxWidth: 640, margin: '0 auto' }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/portfolio/vault')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          cursor: 'pointer',
          marginBottom: 24,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Vault
      </button>

      {/* Avatar + Name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: initialColor(person.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: 32,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            {person.name.charAt(0).toUpperCase()}
          </div>
        )}

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {person.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-secondary)' }}>
            {person.relationship}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              background: person.type === 'memorial' ? 'rgba(139,92,246,0.15)' : 'rgba(74,173,164,0.15)',
              color: person.type === 'memorial' ? '#A78BFA' : 'var(--teal-light)',
            }}
          >
            {person.type === 'memorial' ? 'Memorial' : 'Living Tribute'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginBottom: 40,
          padding: '20px 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <TrendingUp size={14} style={{ color: 'var(--gold-mid)' }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeCommitments}
            </span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
            Active
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <Heart size={14} style={{ color: 'var(--gold-mid)' }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              {entries.length}
            </span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
            Impact Entries
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <DollarSign size={14} style={{ color: 'var(--gold-mid)' }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              ${totalDeployed.toLocaleString()}
            </span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
            Deployed
          </span>
        </div>
      </div>

      {/* Impact Feed */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 16,
        }}
      >
        Impact Journey
      </h2>

      {entries.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            No impact entries yet. Tag an investment to {person.name} to start their journey.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((entry) => (
            <ImpactEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
