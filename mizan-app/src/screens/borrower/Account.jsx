import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function SettingsRow({ label, detail, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 8px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        transition: 'background 150ms ease',
        borderRadius: 4,
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(240, 237, 232, 0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: danger ? 'var(--status-red)' : 'var(--text-primary)',
        fontWeight: danger ? 500 : 400,
      }}>
        {label}
      </span>
      {detail && (
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {detail}
          {onClick && <ChevronRight size={14} />}
        </span>
      )}
      {!detail && onClick && (
        <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
      )}
    </button>
  )
}

function TypeBadge({ type }) {
  const map = {
    loan_disbursement: { label: 'Disbursement', bg: 'rgba(74, 222, 128, 0.12)', color: 'var(--status-green)' },
    loan_repayment: { label: 'Repayment', bg: 'var(--teal-glow)', color: 'var(--teal-light)' },
    loan_converted: { label: 'Converted', bg: 'var(--gold-glow)', color: 'var(--gold-light)' },
    loan_restructured: { label: 'Restructured', bg: 'rgba(96,165,250,0.12)', color: 'var(--status-blue)' },
    deposit: { label: 'Deposit', bg: 'rgba(74, 222, 128, 0.12)', color: 'var(--status-green)' },
  }
  const m = map[type] || { label: type, bg: 'var(--bg-overlay)', color: 'var(--text-secondary)' }
  return (
    <span style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 11,
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: m.bg,
      color: m.color,
      whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Dialogs                                                           */
/* ------------------------------------------------------------------ */

function Dialog({ open, onClose, children }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 24,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: 28,
            maxWidth: 420,
            width: '100%',
            boxShadow: 'var(--shadow-elevated)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Account Screen                                                    */
/* ------------------------------------------------------------------ */

export default function Account() {
  const navigate = useNavigate()
  const {
    submittedApplication,
    activeLoan,
    communityTrustLevel,
    borrowerTransactions,
    applicationStage,
  } = useBorrower()

  const [txOpen, setTxOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState(null) // null | 'confirm' | 'done'

  const app = submittedApplication || {}
  const initials = (app.fullName || 'O A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 24px',
    marginBottom: 20,
  }

  const sectionLabel = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-tertiary)',
    marginBottom: 4,
    marginTop: 8,
  }

  const pill = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 999,
    background: 'rgba(74, 173, 164, 0.12)',
    color: 'var(--teal-mid)',
    border: '1px solid rgba(74, 173, 164, 0.2)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}
    >
      {/* ============ Profile Card ============ */}
      <div style={{
        ...card,
        background: 'radial-gradient(ellipse at 20% 30%, rgba(74, 173, 164, 0.08) 0%, transparent 60%), rgba(22, 22, 31, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(74, 173, 164, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--teal-mid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-inverse)',
          flexShrink: 0,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24,
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
          }}>
            {app.fullName || 'Omar Al-Rashid'}
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginTop: 2,
          }}>
            Borrower Account
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-tertiary)',
            marginTop: 4,
          }}>
            {app.mosqueName || 'UT Austin MSA'} &middot; Member 2+ years
          </p>

          {/* Verification pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {app.phoneVerified && <span style={pill}>Phone verified</span>}
            <span style={pill}>Mosque vouched</span>
          </div>
        </div>

        {/* Switch account */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--teal-mid)',
            cursor: 'pointer',
            padding: '6px 0',
            alignSelf: 'flex-start',
          }}
        >
          Switch account
        </button>
      </div>

      {/* ============ Settings Sections ============ */}
      <div style={card}>
        {/* Loan & Status */}
        <p style={sectionLabel}>Loan & Status</p>
        <SettingsRow
          label="Community Trust Level"
          detail={`${communityTrustLevel} / 5`}
          onClick={() => navigate('/borrower/history')}
        />
        <SettingsRow
          label="Loan History"
          onClick={() => navigate('/borrower/history')}
        />
        <SettingsRow
          label="Active Application"
          detail={activeLoan ? 'Active loan' : applicationStage === 'review' ? 'Under review' : null}
          onClick={() => navigate(activeLoan ? '/borrower/loan' : '/borrower/review')}
        />

        {/* Verification */}
        <p style={{ ...sectionLabel, marginTop: 24 }}>Verification</p>
        <SettingsRow label="Identity" detail={'\u2713 Verified'} />
        <SettingsRow
          label="Phone"
          detail={`\u2713 ****${(app.phone || '').slice(-4) || '8847'}`}
        />
        <SettingsRow
          label="Community Vouch"
          detail={`\u2713 ${app.mosqueName || 'UT Austin MSA'} \u00b7 ${app.imamName || 'Sheikh Abdullah'}`}
        />

        {/* Mosque */}
        <p style={{ ...sectionLabel, marginTop: 24 }}>Mosque</p>
        <SettingsRow label="Your Mosque" detail={app.mosqueName || 'UT Austin MSA'} />
        <SettingsRow label="Qard Hassan Circles" detail="1 active circle" />

        {/* Privacy & Support */}
        <p style={{ ...sectionLabel, marginTop: 24 }}>Privacy & Support</p>
        <SettingsRow label="Privacy Policy" onClick={() => {}} />
        <SettingsRow label="Data & Security" onClick={() => {}} />
        <SettingsRow
          label="Delete my account"
          danger
          onClick={() => setDeleteStep('confirm')}
        />
      </div>

      {/* ============ Support Card ============ */}
      <div style={{
        ...card,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: 'var(--text-primary)',
        }}>
          Need help?
        </p>
        <button
          onClick={() => setContactOpen(true)}
          style={{
            padding: '8px 18px',
            background: 'none',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
        >
          Contact us
        </button>
      </div>

      {/* ============ Transaction History (Collapsible) ============ */}
      <div style={{
        ...card,
        background: 'rgba(22, 22, 31, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(240, 237, 232, 0.06)',
      }}>
        <button
          onClick={() => setTxOpen(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}>
            Transaction History
          </h2>
          {txOpen
            ? <ChevronUp size={18} style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />}
        </button>

        <AnimatePresence>
          {txOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              {borrowerTransactions.length === 0 ? (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  marginTop: 16,
                }}>
                  No transactions yet.
                </p>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: 16,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                      {['Date', 'Type', 'Amount', 'Description', 'Balance'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left',
                          padding: '8px 6px',
                          fontWeight: 500,
                          color: 'var(--text-tertiary)',
                          fontSize: 11,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {borrowerTransactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 6px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <TypeBadge type={tx.type} />
                        </td>
                        <td style={{
                          padding: '10px 6px',
                          fontWeight: 600,
                          color: tx.amount >= 0 ? 'var(--status-green)' : 'var(--text-primary)',
                        }}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-secondary)', maxWidth: 180 }}>
                          {tx.description}
                        </td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          ${(tx.balanceAfter ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ Reapply Section ============ */}
      {!activeLoan && (
        <div style={{
          ...card,
          background: 'var(--teal-glow)',
          border: '1px solid rgba(74,173,164,0.2)',
          textAlign: 'center',
          padding: '28px 24px',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            Ready to apply for another loan?
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 16,
          }}>
            Your community trust level is {communityTrustLevel}/5 — you're in good standing.
          </p>
          <button
            onClick={() => navigate('/borrower/intake')}
            style={{
              padding: '12px 28px',
              background: 'var(--teal-mid)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'opacity var(--transition-fast)',
            }}
          >
            Apply <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ============ Contact Dialog ============ */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 12,
        }}>
          Contact Support
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          Email us at <span style={{ color: 'var(--teal-light)' }}>support@mizan.app</span> or reach out through your mosque coordinator.
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-tertiary)',
          lineHeight: 1.5,
        }}>
          We typically respond within 24 hours. JazakAllahu Khayran for your patience.
        </p>
      </Dialog>

      {/* ============ Delete Account Dialog ============ */}
      <Dialog open={deleteStep === 'confirm'} onClose={() => setDeleteStep(null)}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--status-red)',
          marginBottom: 12,
        }}>
          Delete your account?
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 20,
        }}>
          This action is permanent. All your data, loan history, and trust score will be erased. Any active loan obligations remain.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setDeleteStep(null)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => setDeleteStep('done')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--status-red)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Delete permanently
          </button>
        </div>
      </Dialog>

      {/* Delete success */}
      <Dialog open={deleteStep === 'done'} onClose={() => { setDeleteStep(null); navigate('/') }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 12,
        }}>
          Account deleted
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 16,
        }}>
          Your account and all associated data have been scheduled for deletion. You will be redirected to the home screen.
        </p>
        <button
          onClick={() => { setDeleteStep(null); navigate('/') }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--teal-mid)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-inverse)',
            cursor: 'pointer',
          }}
        >
          Return home
        </button>
      </Dialog>
    </motion.div>
  )
}
