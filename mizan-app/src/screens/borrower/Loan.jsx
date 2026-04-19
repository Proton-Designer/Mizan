import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Circle, ArrowRight, Star, CreditCard, Heart } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const DEFAULT_REDEPLOYMENT_STORIES = [
  { title: 'Your repayment has already been redeployed to help Amira, a single mother in Dearborn, cover her utility bills this month.' },
  { title: 'Your repayment helped fund a $300 emergency loan for a student facing eviction in Minneapolis.' },
  { title: 'Your repayment was pooled with others to help a family in Houston pay for urgent car repairs.' },
]

export default function Loan() {
  const navigate = useNavigate()
  const borrower = useBorrower()
  const loan = borrower?.activeLoan
  const [currentRedeploymentIndex, setCurrentRedeploymentIndex] = useState(0)

  // No active loan — redirect to home
  if (!loan) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          No active loan
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
          You don't have an active loan. Request one from your dashboard.
        </p>
        <button onClick={() => navigate('/borrower')} style={{ padding: '12px 24px', background: 'var(--teal-mid)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Back to dashboard
        </button>
      </div>
    )
  }

  const activeLoan = loan
  const loanSchedule = loan.schedule || []
  const paidAmount = activeLoan.amount - activeLoan.remaining
  const paidPercent = activeLoan.amount > 0 ? (paidAmount / activeLoan.amount) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'flex',
        gap: 32,
        padding: '48px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ===== MAIN COLUMN (65%) ===== */}
      <div style={{ flex: '0 0 65%', minWidth: 0 }}>

        {/* --- Loan Hero Card --- */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 32,
        }}>
          {/* Teal radial glow top */}
          <div style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(74, 173, 164, 0.18) 0%, transparent 70%)',
            padding: '40px 32px 32px',
          }}>
            {/* Label */}
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--teal-mid)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Active Qard Hassan
            </span>

            {/* Amount */}
            <div style={{ marginTop: 12, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>
                $500
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 18,
                color: 'var(--text-secondary)',
                marginLeft: 12,
              }}>
                active loan
              </span>
            </div>

            {/* Remaining */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: 'var(--text-secondary)',
              marginBottom: 16,
            }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${activeLoan.remaining} remaining</span>
            </p>

            {/* Progress bar — inverted: remaining = red-tinted, paid = teal */}
            <div style={{
              width: '100%',
              height: 10,
              background: 'rgba(248, 113, 113, 0.25)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              marginBottom: 20,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${paidPercent}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  height: '100%',
                  background: 'var(--teal-mid)',
                  borderRadius: 'var(--radius-pill)',
                }}
              />
            </div>

            {/* Next payment info */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 24,
            }}>
              Next payment: <strong style={{ color: 'var(--text-primary)' }}>${activeLoan.monthlyPayment} due {activeLoan.nextDueDate}</strong> · {activeLoan.daysUntilDue} days away
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => navigate('/borrower/payment')}
                style={{
                  padding: '14px 28px',
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
                  gap: 8,
                  transition: 'all var(--transition-base)',
                }}
              >
                Pay Now <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('repayment-schedule')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: 'var(--teal-mid)',
                  border: '1px solid rgba(74, 173, 164, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                See full schedule
              </button>
            </div>
          </div>
        </div>

        {/* --- Repayment Schedule --- */}
        <div id="repayment-schedule" style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px 28px 20px',
          marginBottom: 32,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 20,
          }}>
            Repayment Schedule
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Status', 'Month', 'Amount', 'Details'].map((h) => (
                  <th key={h} style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textAlign: 'left',
                    padding: '0 12px 12px',
                    borderBottom: '1px solid var(--border-default)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loanSchedule.map((row, i) => {
                const isPaid = row.status === 'paid'
                const isDue = row.status === 'due'
                const isUpcoming = row.status === 'upcoming'

                return (
                  <tr key={i} style={{
                    background: isDue ? 'rgba(251, 191, 36, 0.06)' : 'transparent',
                  }}>
                    <td style={{ padding: '14px 12px' }}>
                      {isPaid && <CheckCircle size={18} style={{ color: 'var(--status-green)' }} />}
                      {isDue && (
                        <motion.div
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Clock size={18} style={{ color: 'var(--status-yellow)' }} />
                        </motion.div>
                      )}
                      {isUpcoming && <Circle size={18} style={{ color: 'var(--text-tertiary)', opacity: 0.6 }} />}
                    </td>
                    <td style={{
                      padding: '14px 12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 500,
                      color: isUpcoming ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      opacity: isUpcoming ? 0.6 : 1,
                    }}>
                      {row.month}
                    </td>
                    <td style={{
                      padding: '14px 12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: isUpcoming ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      opacity: isUpcoming ? 0.6 : 1,
                    }}>
                      ${row.amount}
                    </td>
                    <td style={{
                      padding: '14px 12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: isPaid ? 'var(--status-green)' : isDue ? 'var(--status-yellow)' : 'var(--text-tertiary)',
                      opacity: isUpcoming ? 0.6 : 1,
                    }}>
                      {isPaid && 'Paid on time'}
                      {isDue && `Due in ${activeLoan.daysUntilDue} days`}
                      {isUpcoming && 'Upcoming'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid var(--border-default)',
            marginTop: 8,
            paddingTop: 16,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'var(--teal-mid)',
              fontWeight: 500,
            }}>
              No interest | No fees. Ever.
            </p>
          </div>
        </div>

        {/* (Journey section removed — lender-facing content) */}
      </div>

      {/* ===== RIGHT SIDEBAR (35%) ===== */}
      <div style={{ flex: '0 0 35%', minWidth: 0 }}>

        {/* Quick Actions */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
          marginBottom: 20,
        }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 16,
          }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => navigate('/borrower/payment')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--teal-mid)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all var(--transition-base)',
              }}
            >
              <CreditCard size={16} />
              Make a payment
            </button>

            <button
              onClick={() => navigate('/borrower/hardship')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
            >
              Having trouble?
            </button>

            <button
              onClick={() => navigate('/borrower/history')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
            >
              View loan history
            </button>
          </div>
        </div>

        {/* Account Summary */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
          marginBottom: 20,
        }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 16,
          }}>
            Account Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Loan amount', value: `$${activeLoan.amount}` },
              { label: 'Remaining', value: `$${activeLoan.remaining}` },
              { label: 'Monthly payment', value: `$${activeLoan.monthlyPayment}` },
              { label: 'Payments', value: `${activeLoan.paymentsCompleted} of ${activeLoan.totalPayments}` },
              { label: 'Tier', value: activeLoan.tier },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Level */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px',
        }}>
          <h3 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 16,
          }}>
            Trust Level
          </h3>

          {/* Stars: 4 filled + 1 empty */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 12,
          }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={20}
                fill={n <= 4 ? 'var(--teal-mid)' : 'transparent'}
                style={{
                  color: n <= 4 ? 'var(--teal-mid)' : 'var(--text-tertiary)',
                }}
              />
            ))}
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--teal-light)',
            marginBottom: 4,
          }}>
            Strong
          </p>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
          }}>
            Two previous loans repaid
          </p>
        </div>
      </div>
    </motion.div>
  )
}
