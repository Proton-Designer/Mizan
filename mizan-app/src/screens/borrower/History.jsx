import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

/* ------------------------------------------------------------------ */
/*  Donut Chart — SVG repayment rate ring                             */
/* ------------------------------------------------------------------ */

function RepaymentDonut({ rate }) {
  const r = 28
  const stroke = 6
  const circ = 2 * Math.PI * r
  const filled = circ * rate
  return (
    <svg width={76} height={76} viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth={stroke} />
      <circle
        cx="38" cy="38" r={r} fill="none"
        stroke="var(--teal-mid)"
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="38" y="42" textAnchor="middle" fill="var(--text-primary)"
        fontFamily="'DM Sans', sans-serif" fontSize="14" fontWeight="600">
        {Math.round(rate * 100)}%
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Trust Stars                                                       */
/* ------------------------------------------------------------------ */

function TrustStars({ level, max = 5 }) {
  return (
    <span style={{ fontSize: 28, letterSpacing: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < level ? 'var(--gold-mid)' : 'var(--text-tertiary)' }}>
          {i < level ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  History Screen                                                    */
/* ------------------------------------------------------------------ */

export default function History() {
  const navigate = useNavigate()
  const { activeLoan, loanHistory, communityTrustLevel } = useBorrower()

  // Computed stats
  const stats = useMemo(() => {
    const pastTotal = loanHistory.reduce((s, l) => s + l.amount, 0)
    const activeAmount = activeLoan ? activeLoan.amount : 0
    const totalBorrowed = pastTotal + activeAmount
    const totalRepaid = pastTotal + (activeLoan ? activeLoan.amount - activeLoan.remaining : 0)
    const avgRepayment = loanHistory.length > 0
      ? (loanHistory.reduce((s, l) => s + l.monthsTaken, 0) / loanHistory.length).toFixed(1)
      : '0'
    const paidOnTime = loanHistory.filter(l => l.status === 'paid_full').length
    const totalLoans = loanHistory.length + (activeLoan ? 1 : 0)
    const repaymentRate = totalLoans > 0 ? paidOnTime / (paidOnTime + (activeLoan ? 0 : 0)) : 0
    return { totalBorrowed, totalRepaid, avgRepayment, paidOnTime, totalLoans, repaymentRate: paidOnTime > 0 ? 1 : 0 }
  }, [activeLoan, loanHistory])

  const paidCount = stats.paidOnTime
  const totalPastLoans = loanHistory.length

  // Card base style
  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 24px',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}
    >
      {/* ============ Trust Level Card (full-width) ============ */}
      <div style={{
        ...card,
        marginBottom: 28,
        padding: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px 16px',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {/* Left: stars */}
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 8,
            }}>
              Community Trust Level
            </p>
            <TrustStars level={communityTrustLevel} />
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--gold-mid)',
              marginTop: 6,
            }}>
              Strong
            </p>
          </div>

          {/* Right: donut */}
          <div style={{ textAlign: 'center' }}>
            <RepaymentDonut rate={stats.repaymentRate} />
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 4,
            }}>
              Repayment rate
            </p>
          </div>
        </div>

        {/* Below: summary */}
        <div style={{
          padding: '12px 28px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}>
            {paidCount} of {totalPastLoans} loans repaid on time
          </p>
        </div>

        {/* Hadith */}
        <div style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--text-tertiary)',
            lineHeight: 1.6,
          }}>
            "The best of you are those who are best in repaying debts." <span style={{ fontStyle: 'normal' }}>— Bukhari</span>
          </p>
        </div>
      </div>

      {/* ============ Two-panel layout ============ */}
      <div style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        {/* ---------- Main column (65%) ---------- */}
        <div style={{ flex: '0 0 65%', minWidth: 0 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24,
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}>
            Loan History
          </h2>

          {/* Active loan */}
          {activeLoan && (
            <div style={{
              ...card,
              marginBottom: 12,
              borderLeft: '4px solid var(--teal-mid)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--bg-deep)',
                    background: 'var(--teal-mid)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    In progress
                  </span>
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}>
                  ${activeLoan.amount} &middot; {activeLoan.tier} &middot; ${activeLoan.remaining} remaining &middot; {activeLoan.paymentsCompleted} of {activeLoan.schedule.length} payments
                </p>
              </div>
            </div>
          )}

          {/* Past loans — reverse chronological */}
          {[...loanHistory].reverse().map((loan, idx) => {
            const dateLabel = new Date(loan.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return (
              <div key={loan.id} style={{
                ...card,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <CheckCircle size={22} style={{ color: 'var(--status-green)', flexShrink: 0 }} />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}>
                  {dateLabel} &middot; ${loan.amount} &middot; {loan.tier} &middot; Paid in full &middot; {loan.monthsTaken} months
                </p>
              </div>
            )
          })}
        </div>

        {/* ---------- Sidebar (35%) ---------- */}
        <div style={{ flex: '0 0 calc(35% - 24px)', minWidth: 0 }}>
          {/* Loan Stats */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--text-secondary)',
              marginBottom: 16,
            }}>
              Loan Stats
            </h3>

            {[
              { label: 'Total borrowed', value: `$${stats.totalBorrowed.toLocaleString()}` },
              { label: 'Total repaid', value: `$${stats.totalRepaid.toLocaleString()}` },
              { label: 'Total sadaqah', value: '$0' },
              { label: 'Avg repayment', value: `${stats.avgRepayment} months` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Apply button */}
          {activeLoan ? (
            <div style={{
              ...card,
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
              }}>
                You have an active loan. Repay it first before applying for another.
              </p>
            </div>
          ) : (
            <button
              onClick={() => navigate('/borrower/intake')}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'var(--teal-mid)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity var(--transition-fast)',
              }}
            >
              Apply for another loan <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
