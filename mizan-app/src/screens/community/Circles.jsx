import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ArrowRight, Users, DollarSign, Activity, RefreshCw } from 'lucide-react'
import { useCommunity } from '../../context/CommunityContext'

/* ---------------------------------------------------------------------------
   Seed Data — Three Qard Hassan Circles
   --------------------------------------------------------------------------- */

const CIRCLES_DATA = [
  {
    id: 'msa-graduate',
    name: 'MSA Graduate Fund',
    members: 12,
    poolAmount: 4800,
    activeLoans: 2,
    repaymentRate: 94,
    healthPct: 82,
    healthLabel: 'Strong',
    healthColor: 'var(--teal-mid)',
    pendingVote: '1 pending vote',
  },
  {
    id: 'sisters',
    name: 'Sisters Circle',
    members: 8,
    poolAmount: 3200,
    activeLoans: 1,
    repaymentRate: 100,
    healthPct: 96,
    healthLabel: 'Excellent',
    healthColor: '#10B981',
    pendingVote: null,
  },
  {
    id: 'ramadan-emergency',
    name: 'Ramadan Emergency',
    members: 15,
    poolAmount: 6100,
    activeLoans: 0,
    repaymentRate: null,
    healthPct: null,
    healthLabel: 'Awaiting first loan',
    healthColor: 'var(--text-tertiary)',
    pendingVote: null,
  },
]

/* ---------------------------------------------------------------------------
   Circle Card Component
   --------------------------------------------------------------------------- */

function CircleCard({ circle, index }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px 28px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        border: '1px solid var(--border-subtle)',
      }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      onClick={() => navigate(`/community/circles/${circle.id}`)}
    >
      {/* Teal left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: 'var(--teal-mid)',
        borderRadius: '3px 0 0 3px',
      }} />

      {/* LEFT: Name + stats */}
      <div style={{ flex: '1 1 40%', minWidth: 0 }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px 0',
          lineHeight: 1.2,
        }}>
          {circle.name}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
          <StatItem icon={<Users size={13} />} value={`${circle.members} members`} />
          <StatItem icon={<DollarSign size={13} />} value={`$${circle.poolAmount.toLocaleString()} pooled`} />
          <StatItem icon={<Activity size={13} />} value={`${circle.activeLoans} active loan${circle.activeLoans !== 1 ? 's' : ''}`} />
          {circle.repaymentRate !== null && (
            <StatItem icon={<RefreshCw size={13} />} value={`${circle.repaymentRate}% repaid`} />
          )}
        </div>
      </div>

      {/* CENTER: Pool health bar */}
      <div style={{ flex: '1 1 30%', minWidth: 0 }}>
        {circle.healthPct !== null ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Pool Health
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: circle.healthColor,
              }}>
                {circle.healthPct}% — {circle.healthLabel}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${circle.healthPct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  height: '100%',
                  background: circle.healthColor,
                  borderRadius: 'var(--radius-pill)',
                }}
              />
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--text-tertiary)',
            padding: '8px 0',
          }}>
            {circle.healthLabel}
          </div>
        )}
      </div>

      {/* RIGHT: Manage link + pending vote badge */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/community/circles/${circle.id}`)
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--teal-mid)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          Manage <ArrowRight size={14} />
        </button>
        {circle.pendingVote && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.04em',
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}>
            {circle.pendingVote}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Stat Item — small icon + label
   --------------------------------------------------------------------------- */

function StatItem({ icon, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      color: 'var(--text-secondary)',
    }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      {value}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Main Circles Screen
   --------------------------------------------------------------------------- */

export default function Circles() {
  const navigate = useNavigate()
  const { community } = useCommunity()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        padding: '48px 24px 80px',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Qard Hassan Circles
        </h1>
        <button
          onClick={() => navigate('/community/circles/new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: 'var(--teal-mid)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
          }}
        >
          <Plus size={16} />
          Create new Circle
        </button>
      </div>

      {/* Circle Cards */}
      {CIRCLES_DATA.map((circle, i) => (
        <CircleCard key={circle.id} circle={circle} index={i} />
      ))}
    </motion.div>
  )
}
