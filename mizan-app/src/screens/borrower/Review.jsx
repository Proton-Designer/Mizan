import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle, XCircle, ChevronDown, Clock, FileText, Play } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'
import Card from '../../components/ui/Card'
import TransitionWrapper from '../../components/shared/TransitionWrapper'

// ---------------------------------------------------------------------------
// Step tracker data
// ---------------------------------------------------------------------------
const INITIAL_STEPS = [
  { label: 'Application received', detail: 'Your application is in our hands.', state: 'complete' },
  { label: 'Community verification', detail: 'Confirming your mosque connection.', state: 'pending' },
  { label: 'Need assessment', detail: 'Reviewing your situation and household needs.', state: 'waiting' },
  { label: 'Pool availability', detail: 'Checking available funds in your tier.', state: 'waiting' },
  { label: 'Decision ready', detail: 'Your outcome is being prepared.', state: 'waiting' },
]

// ---------------------------------------------------------------------------
// Step circle component
// ---------------------------------------------------------------------------
function StepCircle({ state }) {
  if (state === 'complete') {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--teal-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={16} color="#fff" strokeWidth={3} />
      </motion.div>
    )
  }
  if (state === 'pending') {
    return (
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0px rgba(74,173,164,0.4)',
            '0 0 0 8px rgba(74,173,164,0)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2.5px solid var(--teal-mid)',
          background: 'transparent',
          flexShrink: 0,
        }}
      />
    )
  }
  // waiting
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      border: '2px solid var(--border-default)',
      background: 'transparent',
      opacity: 0.6,
      flexShrink: 0,
    }} />
  )
}

// ---------------------------------------------------------------------------
// Connector line
// ---------------------------------------------------------------------------
function ConnectorLine({ fromState, toState }) {
  const isSolid = fromState === 'complete' && (toState === 'pending' || toState === 'complete')
  return (
    <div style={{
      width: 2, height: 32, marginLeft: 15,
      borderLeft: isSolid
        ? '2px solid var(--teal-mid)'
        : '2px dashed var(--border-default)',
      opacity: isSolid ? 1 : 0.5,
    }} />
  )
}

// ---------------------------------------------------------------------------
// Main Review Screen
// ---------------------------------------------------------------------------
export default function Review() {
  const navigate = useNavigate()
  const { submittedApplication, pendingDecision, setDecisionOutcome, setComputedDecision, setOfferedAmount, setApplicationStage, switchDemoState } = useBorrower()

  const app = submittedApplication || {}

  const [steps, setSteps] = useState(INITIAL_STEPS.map(s => ({ ...s })))
  const [simulating, setSimulating] = useState(false)
  const [transparencyOpen, setTransparencyOpen] = useState(false)

  // Auto-start simulation on mount (using ref to prevent double-run)
  const hasStarted = { current: false }

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const run = async () => {
      setSimulating(true)

      // Step 1 already complete. Step 2 → complete, step 3 → pending
      await new Promise(r => setTimeout(r, 800))
      setSteps(prev => prev.map((s, i) => {
        if (i === 1) return { ...s, state: 'complete', detail: 'Mosque connection confirmed.' }
        if (i === 2) return { ...s, state: 'pending', detail: 'Assessing your household needs...' }
        return s
      }))

      await new Promise(r => setTimeout(r, 1200))
      setSteps(prev => prev.map((s, i) => {
        if (i === 2) return { ...s, state: 'complete', detail: `Need score: ${pendingDecision?.needScore || '—'}/100` }
        if (i === 3) return { ...s, state: 'pending', detail: 'Checking funds in your tier...' }
        return s
      }))

      await new Promise(r => setTimeout(r, 1000))
      setSteps(prev => prev.map((s, i) => {
        if (i === 3) return { ...s, state: 'complete', detail: 'Funds available in pool.' }
        if (i === 4) return { ...s, state: 'pending', detail: 'Preparing your outcome...' }
        return s
      }))

      await new Promise(r => setTimeout(r, 1000))
      setSteps(prev => prev.map(s => ({ ...s, state: 'complete' })))

      await new Promise(r => setTimeout(r, 600))

      // Apply the pending decision
      if (pendingDecision) {
        setDecisionOutcome(pendingDecision.outcome)
        setComputedDecision(pendingDecision)
        if (pendingDecision.offeredAmount) setOfferedAmount(pendingDecision.offeredAmount)
      } else {
        switchDemoState('approved')
      }
      setApplicationStage('decided')
      navigate('/borrower/decision')
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // no-op placeholder
  const runSimulation = null

  // --- Demo state handlers ---
  const handleDemoNav = (state, route) => {
    switchDemoState(state)
    navigate(route)
  }

  // --- Score breakdown for transparency ---
  const scores = {
    income: { value: 20, max: 30 },
    urgency: { value: 20, max: 25 },
    dependents: { value: 15, max: 20 },
    community: { value: 17, max: 25 },
  }
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s.value, 0)
  const totalMax = Object.values(scores).reduce((sum, s) => sum + s.max, 0)

  return (
    <TransitionWrapper>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 120px' }}>

        {/* ================================================================ */}
        {/* Header                                                          */}
        {/* ================================================================ */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 40, fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
          lineHeight: 1.15,
        }}>
          Your application is in.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: 'var(--text-tertiary)',
          marginBottom: 36,
        }}>
          Application #{app.applicationId || 'QH-2847'} &middot; Submitted April 18, 2026
        </p>

        {/* ================================================================ */}
        {/* Step Tracker                                                     */}
        {/* ================================================================ */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ padding: '4px 0' }}>
            {steps.map((step, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <StepCircle state={step.state} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 15, fontWeight: 500,
                      color: step.state === 'waiting' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: step.state === 'waiting' ? 0.6 : 1,
                    }}>
                      {step.label}
                    </p>
                    <p style={{
                      fontSize: 12, color: 'var(--text-tertiary)',
                      marginTop: 2,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {step.detail}
                    </p>
                  </div>
                  {step.state === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Check size={16} style={{ color: 'var(--status-green)' }} />
                    </motion.div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <ConnectorLine fromState={steps[i].state} toState={steps[i + 1].state} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Processing indicator */}
        {simulating && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--teal-glow)',
            border: '1px solid var(--teal-deep)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ flexShrink: 0 }}
            >
              <Clock size={18} color="var(--teal-light)" />
            </motion.div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--teal-light)', margin: 0 }}>
                Processing your application...
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Your outcome is being determined by the algorithm
              </p>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Estimated Timeline                                              */}
        {/* ================================================================ */}
        <Card style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Estimated Timeline
          </p>
          {[
            { label: 'Community verification', time: '24-48 hours' },
            { label: 'Need assessment', time: 'Automatic (minutes)' },
            { label: 'Decision ready', time: 'Within 48 hours of verification' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0',
              borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                width: 3, height: 28, borderRadius: 2,
                background: 'var(--teal-mid)',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                  {item.label}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif" }}>
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </Card>

        {/* ================================================================ */}
        {/* Request Summary                                                 */}
        {/* ================================================================ */}
        <Card style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Request Summary
          </p>
          {[
            { label: 'Tier', value: app.tier?.name || 'Standard' },
            { label: 'Amount requested', value: `$${(app.loanAmount || 500).toLocaleString()}` },
            { label: 'Purpose', value: app.purpose || 'Car repair' },
            { label: 'Proposed payment', value: `$${app.proposedMonthlyPayment || 100}/mo` },
            { label: 'Interest', value: '$0.00', highlight: true },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
                {row.label}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                color: row.highlight ? 'var(--status-green)' : 'var(--text-primary)',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </Card>

        {/* ================================================================ */}
        {/* Algorithm Transparency (Collapsible)                            */}
        {/* ================================================================ */}
        <Card style={{ marginBottom: 24 }}>
          <button
            onClick={() => setTransparencyOpen(!transparencyOpen)}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} style={{ color: 'var(--teal-mid)' }} />
              <span style={{
                fontSize: 15, fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                How does the review work?
              </span>
            </div>
            <motion.div
              animate={{ rotate: transparencyOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />
            </motion.div>
          </button>

          <AnimatePresence>
            {transparencyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: 20 }}>
                  <p style={{
                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
                    marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Mizan uses a transparent scoring model to evaluate need. Your score is based on
                    four factors: income level relative to household size, urgency of the purpose,
                    number of dependents, and community trust established through your mosque vouch.
                    There is no credit check — your community standing matters more than your credit history.
                  </p>

                  <p style={{
                    fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-tertiary)',
                    marginBottom: 14, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Your Computed Scores
                  </p>

                  {Object.entries(scores).map(([key, { value, max }]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: 6,
                      }}>
                        <span style={{
                          fontSize: 13, color: 'var(--text-secondary)',
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: 'capitalize',
                        }}>
                          {key === 'community' ? 'Community trust' : key}
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: 'var(--teal-light)',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {value}/{max}
                        </span>
                      </div>
                      <div style={{
                        height: 6, borderRadius: 3,
                        background: 'var(--bg-overlay)',
                        overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / max) * 100}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          style={{
                            height: '100%', borderRadius: 3,
                            background: 'var(--teal-mid)',
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0 4px',
                    borderTop: '1px solid var(--border-default)',
                    marginTop: 8,
                  }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Total Need Score
                    </span>
                    <span style={{
                      fontSize: 20, fontWeight: 700,
                      color: 'var(--teal-light)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {totalScore}/{totalMax}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* ================================================================ */}
        {/* Demo Navigation Switcher                                        */}
        {/* ================================================================ */}
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-tertiary)',
            marginBottom: 12, textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Demo Navigation
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Approved', state: 'approved', route: '/borrower/decision' },
              { label: 'Reduced amount', state: 'reduced', route: '/borrower/decision' },
              { label: 'Denied', state: 'denied', route: '/borrower/decision' },
              { label: 'Active loan', state: 'active_loan', route: '/borrower/active' },
            ].map(item => (
              <motion.button
                key={item.state}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDemoNav(item.state, item.route)}
                style={{
                  height: 44,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </TransitionWrapper>
  )
}
