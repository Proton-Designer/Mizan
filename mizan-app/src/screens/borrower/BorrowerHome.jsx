import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw, Heart, Sparkles, ChevronRight, Star, CheckCircle } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const serif = "'Cormorant Garamond', serif"
const sans = "'DM Sans', sans-serif"
const TEAL = '#4AADA4'

export default function BorrowerHome() {
  const navigate = useNavigate()
  const { activeLoan, loanHistory, communityTrustLevel, startNewApplication } = useBorrower()

  // If there's an active loan, redirect to loan dashboard
  if (activeLoan) {
    navigate('/borrower/loan', { replace: true })
    return null
  }

  const handleApply = () => {
    startNewApplication()
    navigate('/borrower/apply')
  }

  const pastLoans = loanHistory || []
  const trustStars = communityTrustLevel || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', position: 'relative' }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 300,
        background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(74, 173, 164, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <h1 style={{ fontFamily: serif, fontSize: 42, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center' }}>
        Your Qard Hassan Account
      </h1>
      <p style={{ fontFamily: sans, fontSize: 16, fontStyle: 'italic', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
        Interest-free loans from your community, for your community.
      </p>

      {/* Teal divider */}
      <div style={{ width: 50, height: 2, background: TEAL, margin: '0 auto 32px', borderRadius: 2 }} />

      {/* Explainer card */}
      <div style={{
        background: 'rgba(22, 22, 31, 0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(74, 173, 164, 0.1)',
        borderRadius: 'var(--radius-xl)', padding: '28px 24px', marginBottom: 24,
      }}>
        {[
          {
            icon: <Sparkles size={20} color={TEAL} />,
            title: 'No interest. Ever.',
            desc: 'This is a loan, not a product. You repay exactly what you borrow.',
          },
          {
            icon: <RefreshCw size={20} color={TEAL} />,
            title: 'Your repayment helps the next person.',
            desc: 'When you repay, your money is redeployed to help another community member.',
          },
          {
            icon: <Heart size={20} color={TEAL} />,
            title: 'If hardship strikes, the community has your back.',
            desc: 'Genuine inability to repay can be forgiven as sadaqah by your circle.',
          },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, alignItems: 'flex-start',
            padding: '16px 0',
            borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>{row.icon}</div>
            <div>
              <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {row.title}
              </div>
              <div style={{ fontFamily: sans, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {row.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Past loan history strip */}
      {pastLoans.length > 0 && (
        <div style={{
          background: 'rgba(22, 22, 31, 0.4)', borderRadius: 12, padding: '12px 20px',
          border: '1px solid rgba(240, 237, 232, 0.06)', marginBottom: 24,
        }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap',
          fontFamily: sans, fontSize: 13, color: 'var(--text-secondary)',
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Past loans:</span>
          {pastLoans.map((loan, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={12} color="#4ADE80" />
              ${loan.amount}
              <span style={{ color: 'var(--text-tertiary)' }}>
                ({new Date(loan.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
              </span>
              {i < pastLoans.length - 1 && <span style={{ color: 'var(--text-tertiary)', margin: '0 2px' }}>·</span>}
            </span>
          ))}
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            Community trust:
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={12} fill={n <= trustStars ? '#D4A843' : 'none'} color={n <= trustStars ? '#D4A843' : 'var(--text-tertiary)'} />
            ))}
          </span>
        </div>
        </div>
      )}

      {/* Current Balance Display */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Current Balance Owed
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, color: 'var(--teal-light, #7ECDC4)' }}>
          $0
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-tertiary)' }}>
          You have no outstanding loans
        </div>
      </div>

      {/* Primary CTA */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleApply}
        style={{
          width: '100%', height: 64,
          background: `linear-gradient(135deg, #2D7A73, ${TEAL})`,
          color: '#fff', border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontFamily: serif, fontSize: 20, fontWeight: 500,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(74,173,164,0.3), 0 0 60px rgba(74,173,164,0.1)',
        }}
      >
        Request a Qard Hassan Loan <ChevronRight size={20} />
      </motion.button>
    </motion.div>
  )
}
