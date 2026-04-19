/**
 * LoanStatusCard — 21st.dev-inspired dashboard card
 * Glassmorphism card with animated progress ring, balance display,
 * repayment timeline, and redeployment story.
 *
 * Used on the BorrowerHome when the borrower has an active loan.
 */

import { motion } from 'framer-motion'
import { Calendar, ArrowRight, RefreshCw, Banknote } from 'lucide-react'
import { ProgressRing, QuickStatBadge, TrustMeter } from './QuickStatBadge'

function TimelineItem({ item, index, isLast }) {
  const statusStyles = {
    paid: {
      dotBg: 'var(--status-green)',
      dotShadow: '0 0 8px rgba(74, 222, 128, 0.4)',
      textColor: 'var(--text-secondary)',
      amountColor: 'var(--status-green)',
      label: 'Paid',
    },
    due: {
      dotBg: 'var(--teal-mid)',
      dotShadow: '0 0 8px rgba(74, 173, 164, 0.4)',
      textColor: 'var(--text-primary)',
      amountColor: 'var(--teal-light)',
      label: 'Due',
    },
    upcoming: {
      dotBg: 'var(--border-default)',
      dotShadow: 'none',
      textColor: 'var(--text-tertiary)',
      amountColor: 'var(--text-tertiary)',
      label: '',
    },
  }
  const s = statusStyles[item.status] || statusStyles.upcoming

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Dot + connector */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 20,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: s.dotBg,
            boxShadow: s.dotShadow,
            flexShrink: 0,
          }} />
          {!isLast && (
            <div style={{
              width: 1.5, height: 28,
              background: item.status === 'paid' ? 'var(--status-green)' : 'var(--border-subtle)',
              opacity: item.status === 'paid' ? 0.4 : 0.3,
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flex: 1, paddingBottom: isLast ? 0 : 16,
        }}>
          <div>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: s.textColor,
            }}>
              {formatDate(item.date)}
            </span>
            {s.label && (
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: s.amountColor,
                marginLeft: 8,
                padding: '2px 6px',
                borderRadius: 4,
                background: item.status === 'due' ? 'var(--teal-glow)' : 'transparent',
              }}>
                {s.label}
              </span>
            )}
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500,
            color: s.amountColor,
            textDecoration: item.status === 'paid' ? 'line-through' : 'none',
            opacity: item.status === 'paid' ? 0.6 : 1,
          }}>
            ${item.amount}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function LoanStatusCard({ activeLoan, checkingBalance, communityTrustLevel }) {
  if (!activeLoan) return null

  const paid = activeLoan.amount - activeLoan.remaining
  const progress = (paid / activeLoan.amount) * 100
  const paidCount = activeLoan.schedule?.filter(s => s.status === 'paid').length || 0
  const totalPayments = activeLoan.schedule?.length || 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* ── Top section: progress + stats ── */}
      <div style={{
        padding: '28px 24px 20px',
        background: 'linear-gradient(180deg, rgba(74,173,164,0.06) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          marginBottom: 24,
        }}>
          {/* Progress ring */}
          <ProgressRing
            progress={progress}
            size={90}
            strokeWidth={7}
            accentColor="var(--teal-mid)"
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, fontWeight: 700,
                color: 'var(--teal-light)',
                display: 'block', lineHeight: 1,
              }}>
                {Math.round(progress)}%
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                repaid
              </span>
            </div>
          </ProgressRing>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px',
            flex: 1,
          }}>
            <QuickStatBadge
              label="Loan"
              value={activeLoan.amount}
              prefix="$"
              accentColor="var(--text-primary)"
              size="sm"
            />
            <QuickStatBadge
              label="Remaining"
              value={activeLoan.remaining}
              prefix="$"
              accentColor="var(--teal-light)"
              size="sm"
            />
            <QuickStatBadge
              label="Monthly"
              value={activeLoan.monthlyPayment || activeLoan.monthly_payment}
              prefix="$"
              accentColor="var(--text-secondary)"
              size="sm"
            />
            <QuickStatBadge
              label="Payments"
              value={`${paidCount}/${totalPayments}`}
              accentColor="var(--text-secondary)"
              size="sm"
            />
          </div>
        </div>

        {/* Interest-free badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px',
          borderRadius: 'var(--radius-pill)',
          background: 'rgba(74, 222, 128, 0.08)',
          border: '1px solid rgba(74, 222, 128, 0.15)',
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 600,
            color: 'var(--status-green)',
            letterSpacing: '0.03em',
          }}>
            0% INTEREST — QARD HASSAN
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

      {/* ── Payment schedule timeline ── */}
      <div style={{ padding: '20px 24px' }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--text-tertiary)',
          marginBottom: 16,
        }}>
          Repayment Schedule
        </p>

        {(activeLoan.schedule || []).map((item, i) => (
          <TimelineItem
            key={i}
            item={item}
            index={i}
            isLast={i === activeLoan.schedule.length - 1}
          />
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

      {/* ── Redeployment story ── */}
      {activeLoan.redeploymentStories?.length > 0 && (
        <div style={{ padding: '16px 24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 10,
          }}>
            <RefreshCw size={13} style={{ color: 'var(--teal-mid)' }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
            }}>
              Your Impact
            </span>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            Your repayment helped fund {activeLoan.redeploymentStories[0]}
          </p>
        </div>
      )}

      {/* ── Bottom: trust + checking ── */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <TrustMeter level={communityTrustLevel || 4} />
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            display: 'block',
          }}>
            Checking
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20, fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            ${(checkingBalance || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
