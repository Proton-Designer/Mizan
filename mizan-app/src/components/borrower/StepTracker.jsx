/**
 * StepTracker — 21st.dev-inspired vertical stepper
 * Reusable across borrower flows (review, verification, hardship)
 *
 * Inspired by 21st.dev vertical-stepper components:
 * - Animated connector lines that fill as steps complete
 * - Pulsing ring on active/pending step
 * - Glassmorphism card backdrop
 * - Staggered entrance animations
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react'

const STEP_STATES = {
  complete: {
    bg: 'var(--teal-mid)',
    border: 'transparent',
    icon: Check,
    iconColor: '#fff',
    textColor: 'var(--text-primary)',
    detailColor: 'var(--status-green)',
  },
  pending: {
    bg: 'transparent',
    border: 'var(--teal-mid)',
    icon: null, // uses pulse ring
    iconColor: 'var(--teal-light)',
    textColor: 'var(--text-primary)',
    detailColor: 'var(--teal-light)',
  },
  waiting: {
    bg: 'transparent',
    border: 'var(--border-default)',
    icon: null,
    iconColor: 'var(--text-tertiary)',
    textColor: 'var(--text-tertiary)',
    detailColor: 'var(--text-tertiary)',
  },
  error: {
    bg: 'rgba(248, 113, 113, 0.15)',
    border: 'var(--status-red)',
    icon: AlertCircle,
    iconColor: 'var(--status-red)',
    textColor: 'var(--status-red)',
    detailColor: 'var(--status-red)',
  },
}

function StepIcon({ state, size = 36 }) {
  const config = STEP_STATES[state] || STEP_STATES.waiting

  if (state === 'complete') {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: config.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(74, 173, 164, 0.35)',
        }}
      >
        <Check size={size * 0.44} color={config.iconColor} strokeWidth={3} />
      </motion.div>
    )
  }

  if (state === 'pending') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {/* Outer pulse ring */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0px rgba(74, 173, 164, 0.5)',
              '0 0 0 10px rgba(74, 173, 164, 0)',
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `2.5px solid ${config.border}`,
          }}
        />
        {/* Inner spinner dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: 2,
          }}
        >
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--teal-mid)',
          }} />
        </motion.div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: config.bg,
          border: `2px solid ${config.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertCircle size={size * 0.5} color={config.iconColor} />
      </motion.div>
    )
  }

  // waiting
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${config.border}`,
      background: config.bg,
      opacity: 0.5,
      flexShrink: 0,
    }} />
  )
}

function ConnectorLine({ fromState, toState, height = 36 }) {
  const isActive = fromState === 'complete' && (toState === 'pending' || toState === 'complete')
  const isComplete = fromState === 'complete' && toState === 'complete'

  return (
    <div style={{
      width: 36, height, display: 'flex', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ position: 'relative', width: 2, height: '100%' }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--border-subtle)',
          borderRadius: 1,
        }} />
        {/* Animated fill */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isActive || isComplete ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--teal-mid)',
            borderRadius: 1,
            transformOrigin: 'top',
          }}
        />
      </div>
    </div>
  )
}

/**
 * @param {Object} props
 * @param {Array<{label: string, detail: string, state: string}>} props.steps
 * @param {boolean} [props.compact] - Smaller spacing
 * @param {Function} [props.onStepClick] - Optional click handler
 */
export default function StepTracker({ steps, compact = false, onStepClick }) {
  const iconSize = compact ? 28 : 36
  const lineHeight = compact ? 24 : 36

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: compact ? 16 : 24,
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-card), inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Step row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: compact ? 12 : 16,
              cursor: onStepClick ? 'pointer' : 'default',
            }}
            onClick={() => onStepClick?.(i, step)}
          >
            <StepIcon state={step.state} size={iconSize} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: compact ? 13 : 15,
                fontWeight: 500,
                color: STEP_STATES[step.state]?.textColor || 'var(--text-tertiary)',
                fontFamily: "'DM Sans', sans-serif",
                opacity: step.state === 'waiting' ? 0.6 : 1,
                transition: 'color 0.3s ease',
              }}>
                {step.label}
              </p>
              {step.detail && (
                <p style={{
                  fontSize: compact ? 11 : 12,
                  color: STEP_STATES[step.state]?.detailColor || 'var(--text-tertiary)',
                  marginTop: 2,
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: step.state === 'waiting' ? 0.5 : 0.85,
                }}>
                  {step.detail}
                </p>
              )}
            </div>
            {step.state === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Check size={14} style={{ color: 'var(--status-green)', opacity: 0.7 }} />
              </motion.div>
            )}
            {step.state === 'pending' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={14} style={{ color: 'var(--teal-mid)', opacity: 0.6 }} />
              </motion.div>
            )}
          </div>

          {/* Connector */}
          {i < steps.length - 1 && (
            <ConnectorLine
              fromState={step.state}
              toState={steps[i + 1].state}
              height={lineHeight}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
