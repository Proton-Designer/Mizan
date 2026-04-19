import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ExternalLink, MessageSquare } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

/* ─── Teal palette (from CSS vars + direct) ─── */
const TEAL = '#4AADA4'
const TEAL_LIGHT = '#7ECDC4'
const TEAL_DEEP = '#2D7A73'
const TEAL_GLOW = 'rgba(74, 173, 164, 0.15)'
const GREEN = '#34D399'

/* ─── Shared styles ─── */
const serif = "'Cormorant Garamond', 'Cormorant', Georgia, serif"
const sans = "'DM Sans', sans-serif"

const pageWrap = {
  maxWidth: 680,
  margin: '0 auto',
  padding: '48px 24px 96px',
}

const tealButton = {
  background: `linear-gradient(135deg, ${TEAL_DEEP}, ${TEAL})`,
  color: '#fff',
  border: 'none',
  height: 52,
  borderRadius: 100,
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 28px',
  width: '100%',
}

const ghostButton = {
  background: 'var(--bg-overlay)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-subtle)',
  height: 48,
  borderRadius: 100,
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 24px',
  width: '100%',
}

const card = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 16,
  padding: 24,
}

/* ─── Animated SVG Checkmark ─── */
function AnimatedCheckmark({ onComplete }) {
  const [phase, setPhase] = useState('circle') // circle → check → pulse

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('check'), 600)
    const t2 = setTimeout(() => setPhase('pulse'), 1200)
    const t3 = setTimeout(() => onComplete?.(), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <motion.div
      animate={phase === 'pulse' ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
    >
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
        {/* Circle */}
        <motion.circle
          cx="48" cy="48" r="42"
          stroke={TEAL}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Glow fill */}
        <motion.circle
          cx="48" cy="48" r="42"
          fill={TEAL_GLOW}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase !== 'circle' ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {/* Checkmark */}
        <motion.path
          d="M30 50 L43 63 L66 36"
          stroke={TEAL_LIGHT}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: phase !== 'circle' ? 1 : 0,
            opacity: phase !== 'circle' ? 1 : 0,
          }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

/* ─── Repayment helpers ─── */
function buildSchedule(amount, months) {
  const monthly = amount / months
  const today = new Date()
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() + i + 1)
    return {
      month: i + 1,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: monthly,
      status: 'Upcoming',
    }
  })
}

/* ─── OUTCOME A: Approved ─── */
function ApprovedOutcome({ amount = 500, navigate, setApplicationStage }) {
  const [animDone, setAnimDone] = useState(false)
  const [bankState, setBankState] = useState('idle') // idle → connecting → connected → deposited
  const months = 5
  const monthly = amount / months
  const schedule = buildSchedule(amount, months)

  const handleLinkBank = () => {
    setBankState('connecting')
    setTimeout(() => {
      setBankState('connected')
      setTimeout(() => {
        setBankState('deposited')
      }, 500)
    }, 700)
  }

  const handleEnterDashboard = () => {
    setApplicationStage('active_loan')
    navigate('/borrower/loan')
  }

  return (
    <div style={pageWrap}>
      {/* Hero card with teal radial glow */}
      <div style={{
        background: `radial-gradient(ellipse at center, ${TEAL_GLOW} 0%, transparent 70%)`,
        borderRadius: 24,
        padding: '48px 24px 40px',
        textAlign: 'center',
        marginBottom: 32,
      }}>
        <AnimatedCheckmark onComplete={() => setAnimDone(true)} />

        <AnimatePresence>
          {animDone && (
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: 38,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Alhamdulillah — you've been approved.
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Loan details card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animDone ? 1 : 0, y: animDone ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{
          ...card,
          borderLeft: `4px solid ${TEAL}`,
          marginBottom: 24,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px 32px',
          }}>
            <DetailItem label="Loan amount" value={`$${amount}`} />
            <DetailItem label="Tier" value="Standard" />
            <DetailItem label="Term" value={`${months} months`} />
            <DetailItem label="Monthly payment" value={`$${monthly}/month`} />
            <DetailItem label="Interest" value="$0.00" valueColor={GREEN} />
            <DetailItem label="Pool status" value="Funds available ✓" valueColor={TEAL} />
          </div>
        </div>

        {/* Repayment schedule */}
        <div style={{ ...card, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              Repayment schedule
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: sans, fontSize: 14 }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                <th style={{ textAlign: 'left', padding: '10px 24px', fontWeight: 500 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontWeight: 500 }}>Amount</th>
                <th style={{ textAlign: 'right', padding: '10px 24px', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 24px', color: 'var(--text-tertiary)' }}>{row.month}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{row.date}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)' }}>
                    ${row.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
          fontFamily: sans,
          fontSize: 15,
          color: 'var(--text-secondary)',
        }}>
          Total: ${amount} | No interest | No fees.{' '}
          <span style={{ color: GREEN, fontWeight: 700 }}>Ever.</span>
        </div>

        {/* Hadith */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
          maxWidth: 520,
          margin: '0 auto 40px',
          padding: '0 16px',
        }}>
          "Whoever relieves a Muslim of a hardship in this world, Allah will relieve them of a hardship on the Day of Judgment."
        </div>

        {/* Bank connection flow */}
        <AnimatePresence mode="wait">
          {bankState === 'idle' && (
            <motion.div key="link" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLinkBank}
                style={tealButton}
              >
                Link bank account to receive funds →
              </motion.button>
            </motion.div>
          )}

          {bankState === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: 16 }}
            >
              <div style={{
                fontFamily: sans,
                fontSize: 15,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 18, height: 18, border: `2px solid ${TEAL}`, borderTopColor: 'transparent', borderRadius: '50%' }}
                />
                Connecting...
              </div>
            </motion.div>
          )}

          {(bankState === 'connected' || bankState === 'deposited') && (
            <motion.div key="connected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Connected state */}
              <div style={{
                ...card,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
                border: `1px solid ${TEAL}40`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${TEAL}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: TEAL, fontSize: 18,
                }}>✓</div>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                    University Credit Union ****9273 connected
                  </div>
                </div>
              </div>

              {/* Deposited success */}
              <AnimatePresence>
                {bankState === 'deposited' && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ marginBottom: 24 }}
                  >
                    <div style={{
                      ...card,
                      background: `linear-gradient(135deg, ${TEAL_DEEP}30, var(--bg-surface))`,
                      border: `1px solid ${TEAL}40`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: TEAL_LIGHT, marginBottom: 4 }}>
                        ${amount} deposited
                      </div>
                      <div style={{ fontFamily: sans, fontSize: 14, color: 'var(--text-secondary)' }}>
                        New balance: $1,347
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {bankState === 'deposited' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnterDashboard}
                  style={tealButton}
                >
                  Enter my loan dashboard →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ─── OUTCOME B: Reduced ─── */
function ReducedOutcome({ requestedAmount = 500, offeredAmount = 350, navigate, setApplicationStage }) {
  const [showDialog, setShowDialog] = useState(false)
  const [bankState, setBankState] = useState('idle')
  const [accepted, setAccepted] = useState(false)
  const months = Math.round(offeredAmount / 70) || 5
  const monthly = offeredAmount / months

  const handleAccept = () => {
    setAccepted(true)
    // Trigger same bank flow as approved but with reduced amount
    setTimeout(() => setBankState('connecting'), 100)
    setTimeout(() => setBankState('connected'), 800)
    setTimeout(() => setBankState('deposited'), 1300)
  }

  const handleEnterDashboard = () => {
    setApplicationStage('active_loan')
    navigate('/borrower/loan')
  }

  return (
    <div style={pageWrap}>
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 24 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: TEAL_GLOW,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Heart size={32} color={TEAL} />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 36,
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: '0 0 32px',
          lineHeight: 1.2,
        }}
      >
        We can help — with a small adjustment.
      </motion.h1>

      {/* Comparison card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <div style={{
          ...card,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '32px 24px',
        }}>
          {/* Requested */}
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <div style={{ fontFamily: sans, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              You requested
            </div>
            <div style={{
              fontFamily: serif,
              fontSize: 28,
              color: 'var(--text-tertiary)',
              textDecoration: 'line-through',
            }}>
              ${requestedAmount}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ color: 'var(--text-tertiary)', fontSize: 24 }}>→</div>

          {/* Offered */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: sans, fontSize: 13, color: TEAL, marginBottom: 6 }}>
              We can offer
            </div>
            <div style={{
              fontFamily: serif,
              fontSize: 40,
              fontWeight: 600,
              color: TEAL_LIGHT,
            }}>
              ${offeredAmount}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div style={{
          ...card,
          marginBottom: 32,
          borderLeft: `3px solid ${TEAL}40`,
        }}>
          <p style={{
            fontFamily: sans,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Based on our feasibility review, we determined that a ${offeredAmount} loan with{' '}
            {months} monthly payments of ${monthly.toFixed(0)} would be more manageable given your
            current financial situation. This helps ensure you can repay comfortably without
            additional hardship — which is central to how Mizan works.
          </p>
        </div>

        {!accepted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAccept}
              style={tealButton}
            >
              Accept ${offeredAmount} →
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDialog(true)}
              style={ghostButton}
            >
              <MessageSquare size={16} />
              I'd like to discuss this
            </motion.button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {bankState === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: 16 }}
              >
                <div style={{
                  fontFamily: sans, fontSize: 15, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', width: 18, height: 18, border: `2px solid ${TEAL}`, borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                  Connecting...
                </div>
              </motion.div>
            )}

            {(bankState === 'connected' || bankState === 'deposited') && (
              <motion.div key="connected" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{
                  ...card, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                  border: `1px solid ${TEAL}40`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${TEAL}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: TEAL, fontSize: 18,
                  }}>✓</div>
                  <div style={{ fontFamily: sans, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                    University Credit Union ****9273 connected
                  </div>
                </div>

                <AnimatePresence>
                  {bankState === 'deposited' && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ marginBottom: 24 }}
                    >
                      <div style={{
                        ...card,
                        background: `linear-gradient(135deg, ${TEAL_DEEP}30, var(--bg-surface))`,
                        border: `1px solid ${TEAL}40`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: TEAL_LIGHT, marginBottom: 4 }}>
                          ${offeredAmount} deposited
                        </div>
                        <div style={{ fontFamily: sans, fontSize: 14, color: 'var(--text-secondary)' }}>
                          New balance: $1,197
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {bankState === 'deposited' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnterDashboard}
                    style={tealButton}
                  >
                    Enter my loan dashboard →
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Discussion dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...card,
                maxWidth: 480,
                width: '100%',
                background: 'var(--bg-elevated)',
              }}
            >
              <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Let us know your thoughts
              </h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                If you have additional context or would like to discuss the adjusted amount, send us a message.
              </p>
              <textarea
                placeholder="Share any additional details..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: 16,
                  fontFamily: sans,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDialog(false)}
                  style={{ ...ghostButton, flex: 1 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDialog(false)}
                  style={{ ...tealButton, flex: 1 }}
                >
                  Send message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── OUTCOME C: Denied ─── */
function DeniedOutcome() {
  const resources = [
    {
      name: 'Islamic Relief USA Emergency Fund',
      description: 'Emergency financial assistance for individuals and families in crisis.',
      url: 'https://irusa.org',
    },
    {
      name: 'East Austin Masjid Zakat Committee',
      description: 'Your local mosque community may be able to assist with zakat-eligible needs.',
      url: null,
    },
    {
      name: 'Muslim Community Support Services Austin',
      description: 'Comprehensive social services including emergency aid, food pantry, and counseling.',
      url: null,
    },
  ]

  return (
    <div style={{ ...pageWrap, maxWidth: 600 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 36,
          color: 'var(--text-primary)',
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          We weren't able to approve this request.
        </h1>

        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 18,
          color: 'var(--text-secondary)',
          margin: '0 0 32px',
        }}>
          This isn't a judgment of your character.
        </p>

        {/* Teal divider */}
        <div style={{
          width: 60,
          height: 2,
          background: TEAL,
          margin: '0 auto 32px',
          borderRadius: 1,
        }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p style={{
          fontFamily: sans,
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          textAlign: 'center',
          margin: '0 0 40px',
        }}>
          After careful review, we were unable to structure a loan that we believe you could
          repay comfortably. Mizan's commitment is to never place a borrower in a position of
          greater hardship. We would rather say no than cause harm — and we hope you understand
          this comes from a place of care, not rejection.
        </p>

        {/* Alternative resources */}
        <div style={{
          fontFamily: sans,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          Alternative resources
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {resources.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              style={{
                ...card,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px 24px',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: TEAL_GLOW,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: TEAL, fontSize: 16,
                marginTop: 2,
              }}>
                {i === 0 ? '🕌' : i === 1 ? '🤝' : '🏠'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: sans, fontSize: 15, fontWeight: 600,
                  color: 'var(--text-primary)', marginBottom: 4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {r.name}
                  {r.url && <ExternalLink size={13} color="var(--text-tertiary)" />}
                </div>
                <div style={{
                  fontFamily: sans, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                }}>
                  {r.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reapply notice */}
        <div style={{
          textAlign: 'center',
          fontFamily: sans,
          fontSize: 14,
          color: 'var(--text-tertiary)',
          marginBottom: 32,
        }}>
          You can reapply in 90 days.
        </div>

        {/* Closing dua */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{
            textAlign: 'center',
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          May Allah make it easy for you. 🤍
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── Detail item helper ─── */
function DetailItem({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ fontFamily: sans, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontFamily: sans, fontSize: 16, fontWeight: 600,
        color: valueColor || 'var(--text-primary)',
      }}>
        {value}
      </div>
    </div>
  )
}

/* ─── Main Decision Screen ─── */
export default function Decision() {
  const { demoState, setApplicationStage } = useBorrower()
  const navigate = useNavigate()

  const decisionOutcome = demoState // maps context state to spec terminology

  if (decisionOutcome === 'approved') {
    return <ApprovedOutcome
      amount={500}
      navigate={navigate}
      setApplicationStage={setApplicationStage}
    />
  }

  if (decisionOutcome === 'reduced') {
    return <ReducedOutcome
      requestedAmount={500}
      offeredAmount={350}
      navigate={navigate}
      setApplicationStage={setApplicationStage}
    />
  }

  // Default: denied
  return <DeniedOutcome />
}
