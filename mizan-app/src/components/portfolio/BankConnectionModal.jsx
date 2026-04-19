import { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolio } from '../../context/PortfolioContext'

/* ── Bank options ── */
const BANKS = [
  { id: 'chase', name: 'Chase', icon: '\u{1F3E6}' },
  { id: 'boa', name: 'Bank of America', icon: '\u{1F3DB}' },
  { id: 'wells', name: 'Wells Fargo', icon: '\u{1F3E6}' },
  { id: 'capital-one', name: 'Capital One', icon: '\u{1F4B3}' },
  { id: 'ucu', name: 'University Credit Union', icon: '\u{1F393}' },
]

/* ── Step transition variants ── */
const stepVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
}

/* ── Checkmark animation ── */
function CheckmarkCircle() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(74, 222, 128, 0.15)',
        border: '2px solid var(--status-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <motion.svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.path
          d="M10 20L17 27L30 13"
          stroke="var(--status-green)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
      </motion.svg>
    </motion.div>
  )
}

/* ── Main Modal Component ── */
export default function BankConnectionModal() {
  const { connectBank } = usePortfolio()

  const [step, setStep] = useState(1)
  const [selectedBank, setSelectedBank] = useState(null)
  const [accountNumber, setAccountNumber] = useState('')

  const handleBankSelect = useCallback((bank) => {
    setSelectedBank(bank)
  }, [])

  const handleContinueToStep2 = useCallback(() => {
    if (selectedBank) setStep(2)
  }, [selectedBank])

  const handleConnect = useCallback(() => {
    if (accountNumber.length === 10) setStep(3)
  }, [accountNumber])

  const handleFinish = useCallback(() => {
    connectBank(selectedBank.name, accountNumber)
  }, [connectBank, selectedBank, accountNumber])

  const handleAccountInput = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setAccountNumber(val)
  }, [])

  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          width: 480,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 'var(--space-2xl)',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Bank Selection ─── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  margin: 0,
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Connect Your Bank
              </h2>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  margin: 0,
                  marginBottom: 'var(--space-xl)',
                }}
              >
                Select your bank to simulate your giving account
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-xl)',
                }}
              >
                {BANKS.map((bank) => {
                  const isSelected = selectedBank?.id === bank.id
                  return (
                    <motion.button
                      key={bank.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleBankSelect(bank)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: isSelected ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                        border: isSelected
                          ? '1.5px solid var(--gold-mid)'
                          : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '22px',
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-overlay)',
                          borderRadius: 'var(--radius-sm)',
                          flexShrink: 0,
                        }}
                      >
                        {bank.icon}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          fontWeight: 500,
                          color: isSelected ? 'var(--text-gold)' : 'var(--text-primary)',
                        }}
                      >
                        {bank.name}
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            marginLeft: 'auto',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--gold-mid)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: 'var(--text-inverse)',
                          }}
                        >
                          &#10003;
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinueToStep2}
                disabled={!selectedBank}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 'var(--radius-pill)',
                  background: selectedBank ? 'var(--gradient-gold)' : 'var(--bg-overlay)',
                  color: selectedBank ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                  border: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: selectedBank ? 'pointer' : 'not-allowed',
                  boxShadow: selectedBank ? 'var(--shadow-gold)' : 'none',
                  transition: 'var(--transition-base)',
                }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* ─── Step 2: Account Number ─── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  margin: 0,
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Enter Account Number
              </h2>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  margin: 0,
                  marginBottom: 'var(--space-2xl)',
                }}
              >
                Enter a 10-digit account number for {selectedBank?.name}
              </p>

              <div
                style={{
                  marginBottom: 'var(--space-2xl)',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={handleAccountInput}
                  placeholder="0000000000"
                  autoFocus
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    padding: 'var(--space-md) var(--space-lg)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '28px',
                    fontWeight: 500,
                    letterSpacing: '4px',
                    textAlign: 'center',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-deep)',
                    border: 'none',
                    borderBottom: '2px solid var(--gold-mid)',
                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    outline: 'none',
                    caretColor: 'var(--gold-mid)',
                  }}
                />
              </div>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  textAlign: 'center',
                  margin: 0,
                  marginBottom: 'var(--space-lg)',
                }}
              >
                {accountNumber.length}/10 digits
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                disabled={accountNumber.length !== 10}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 'var(--radius-pill)',
                  background:
                    accountNumber.length === 10
                      ? 'var(--gradient-gold)'
                      : 'var(--bg-overlay)',
                  color:
                    accountNumber.length === 10
                      ? 'var(--text-inverse)'
                      : 'var(--text-tertiary)',
                  border: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: accountNumber.length === 10 ? 'pointer' : 'not-allowed',
                  boxShadow:
                    accountNumber.length === 10 ? 'var(--shadow-gold)' : 'none',
                  transition: 'var(--transition-base)',
                }}
              >
                Connect
              </motion.button>
            </motion.div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ textAlign: 'center' }}
            >
              <CheckmarkCircle />

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '26px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginTop: 'var(--space-lg)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                Successfully connected
              </h2>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  marginBottom: 'var(--space-lg)',
                }}
              >
                {selectedBank?.name} ****{accountNumber.slice(-4)}
              </p>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                    marginBottom: 'var(--space-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Your simulated balance
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '36px',
                    fontWeight: 600,
                    color: 'var(--text-gold)',
                    margin: 0,
                  }}
                >
                  $5,000
                </p>
              </div>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  margin: 0,
                  marginBottom: 'var(--space-xl)',
                  lineHeight: 1.6,
                  padding: '0 var(--space-sm)',
                }}
              >
                This balance is simulated — no real money moves. When you invest,
                your balance goes down. When cycles complete and return funds, your
                balance goes up.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--gradient-gold)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-gold)',
                  transition: 'var(--transition-base)',
                }}
              >
                Continue to Dashboard
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    modalRoot
  )
}
