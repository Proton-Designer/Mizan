import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, CreditCard, Sparkles, MessageCircle } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'

const SCHEDULED_AMOUNT = 100
const DUE_DATE = 'May 18, 2026'
const LOAN_REMAINING = 400
const CHIP_VALUES = [50, 75, 100, 150]

export default function Payment() {
  const navigate = useNavigate()
  const borrower = useBorrower()

  const [selectedChip, setSelectedChip] = useState(100)
  const [customMode, setCustomMode] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [paymentState, setPaymentState] = useState('idle') // idle | processing | success
  const [remaining, setRemaining] = useState(LOAN_REMAINING)

  const activeAmount = customMode && customValue ? parseFloat(customValue) : selectedChip
  const isValidAmount = activeAmount > 0 && activeAmount <= remaining
  const isExtra = activeAmount > SCHEDULED_AMOUNT

  const handleChipSelect = (val) => {
    setCustomMode(false)
    setCustomValue('')
    setSelectedChip(val)
  }

  const handleCustomToggle = () => {
    setCustomMode(true)
    setSelectedChip(null)
  }

  const handleConfirm = async () => {
    if (!isValidAmount || paymentState !== 'idle') return

    setPaymentState('processing')

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 600))

    // Call context makePayment if available
    if (borrower?.makePayment) {
      borrower.makePayment(activeAmount)
    }

    // Update remaining balance
    setRemaining((prev) => Math.max(0, prev - activeAmount))

    setPaymentState('success')
  }

  // Auto-redirect after success
  useEffect(() => {
    if (paymentState === 'success') {
      const timer = setTimeout(() => {
        // User can click "Return to my loan" before timer
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [paymentState])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '48px 24px 80px',
      }}
    >
      {/* ===== Scheduled Payment Card ===== */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '32px',
        marginBottom: 28,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          Scheduled payment:
        </p>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 52,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          ${SCHEDULED_AMOUNT}
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: 'var(--text-secondary)',
          marginBottom: 24,
        }}>
          due {DUE_DATE}
        </p>

        <button
          onClick={() => {
            handleChipSelect(SCHEDULED_AMOUNT)
            handleConfirm()
          }}
          disabled={paymentState !== 'idle'}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'var(--teal-mid)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            cursor: paymentState !== 'idle' ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-base)',
            opacity: paymentState !== 'idle' ? 0.6 : 1,
          }}
        >
          Pay exactly ${SCHEDULED_AMOUNT}
        </button>
      </div>

      {/* ===== Custom Amount ===== */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '28px 28px 24px',
        marginBottom: 28,
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
          Or choose an amount
        </h3>

        {/* Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 20,
        }}>
          {CHIP_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => handleChipSelect(val)}
              style={{
                padding: '10px 20px',
                background: selectedChip === val && !customMode
                  ? 'var(--teal-mid)'
                  : 'var(--bg-overlay)',
                color: selectedChip === val && !customMode
                  ? 'var(--text-inverse)'
                  : 'var(--text-primary)',
                border: selectedChip === val && !customMode
                  ? '1px solid var(--teal-mid)'
                  : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-pill)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
            >
              ${val}
            </button>
          ))}

          <button
            onClick={handleCustomToggle}
            style={{
              padding: '10px 20px',
              background: customMode ? 'var(--teal-mid)' : 'var(--bg-overlay)',
              color: customMode ? 'var(--text-inverse)' : 'var(--text-primary)',
              border: customMode ? '1px solid var(--teal-mid)' : '1px solid var(--border-default)',
              borderRadius: 'var(--radius-pill)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            Custom
          </button>
        </div>

        {/* Custom input */}
        <AnimatePresence>
          {customMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  color: 'var(--text-tertiary)',
                }}>
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border-color var(--transition-base)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--teal-mid)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barakah card — slides in when paying extra */}
        <AnimatePresence>
          {isExtra && isValidAmount && paymentState === 'idle' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '16px 20px',
                background: 'var(--teal-glow)',
                border: '1px solid rgba(74, 173, 164, 0.2)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <Sparkles size={18} style={{ color: 'var(--teal-mid)', flexShrink: 0 }} />
                <div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--teal-light)',
                    marginBottom: 4,
                  }}>
                    Paying early or extra? Barakah!
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}>
                    New remaining balance: <strong style={{ color: 'var(--text-primary)' }}>${remaining - activeAmount}</strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Payment Method ===== */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 44,
          height: 30,
          background: 'var(--bg-overlay)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-default)',
        }}>
          <CreditCard size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            University Credit Union
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: 'var(--text-tertiary)',
          }}>
            ****9273
          </p>
        </div>
      </div>

      {/* ===== Confirm Button ===== */}
      <AnimatePresence mode="wait">
        {paymentState === 'idle' && (
          <motion.button
            key="confirm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleConfirm}
            disabled={!isValidAmount}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: isValidAmount ? 'var(--teal-mid)' : 'var(--bg-overlay)',
              color: isValidAmount ? 'var(--text-inverse)' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              cursor: isValidAmount ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            Confirm ${activeAmount || 0} payment <ArrowRight size={16} />
          </motion.button>
        )}

        {paymentState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: 'var(--bg-overlay)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 32,
            }}
          >
            Processing...
          </motion.div>
        )}

        {paymentState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32 }}
          >
            {/* Green success button */}
            <div style={{
              width: '100%',
              padding: '18px 24px',
              background: 'var(--status-green)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}>
              <Check size={18} /> Payment received
            </div>

            {/* Success card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                padding: '32px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28,
                fontWeight: 600,
                color: 'var(--teal-light)',
                marginBottom: 12,
              }}>
                JazakAllahu Khayran
              </p>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                Your ${activeAmount} payment has been received. This money will be redeployed to help another family in need — the cycle of good continues.
              </p>

              <button
                onClick={() => navigate('/borrower/loan')}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: 'var(--teal-mid)',
                  border: '1px solid rgba(74, 173, 164, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--transition-base)',
                }}
              >
                Return to my loan <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Having Trouble Section ===== */}
      {paymentState === 'idle' && (
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px 28px',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            Having trouble making this payment?
          </p>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--teal-mid)',
            marginBottom: 16,
          }}>
            No penalties. No judgment.
          </p>

          <button
            onClick={() => navigate('/borrower/hardship')}
            style={{
              padding: '12px 24px',
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
              gap: 8,
              transition: 'all var(--transition-base)',
            }}
          >
            <MessageCircle size={15} />
            Talk to us <ArrowRight size={14} />
          </button>
        </div>
      )}
    </motion.div>
  )
}
