/**
 * NotificationToast — 21st.dev-inspired notification system
 * Animated toasts for loan events (disbursement, payment, vouch, etc.)
 *
 * Features:
 * - Slide-in from top-right with spring physics
 * - Auto-dismiss with shrinking progress bar
 * - Teal/green/gold accent based on event type
 * - Glassmorphism backdrop
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertCircle, Banknote, ShieldCheck, Heart, X, Info,
} from 'lucide-react'

const TOAST_CONFIG = {
  disbursement: {
    icon: Banknote,
    accentColor: 'var(--status-green)',
    bgTint: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  payment: {
    icon: CheckCircle2,
    accentColor: 'var(--teal-mid)',
    bgTint: 'var(--teal-glow)',
    borderColor: 'rgba(74, 173, 164, 0.2)',
  },
  vouch: {
    icon: ShieldCheck,
    accentColor: 'var(--gold-mid)',
    bgTint: 'var(--gold-glow)',
    borderColor: 'rgba(212, 168, 67, 0.2)',
  },
  sadaqah: {
    icon: Heart,
    accentColor: '#C084FC',
    bgTint: 'rgba(192, 132, 252, 0.08)',
    borderColor: 'rgba(192, 132, 252, 0.2)',
  },
  info: {
    icon: Info,
    accentColor: 'var(--status-blue)',
    bgTint: 'rgba(96, 165, 250, 0.08)',
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  error: {
    icon: AlertCircle,
    accentColor: 'var(--status-red)',
    bgTint: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
}

function Toast({ id, type, title, message, duration = 5000, onDismiss }) {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${config.borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        minWidth: 300,
        maxWidth: 400,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent line */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: config.accentColor,
        borderRadius: '3px 0 0 3px',
      }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: config.bgTint,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} style={{ color: config.accentColor }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 2,
        }}>
          {title}
        </p>
        {message && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}>
            {message}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, display: 'flex', alignItems: 'flex-start',
          color: 'var(--text-tertiary)',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 2,
            background: config.accentColor,
            transformOrigin: 'left',
            opacity: 0.5,
          }}
        />
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Toast Context + Provider
// ---------------------------------------------------------------------------

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Return a no-op when outside provider (safe fallback)
    return { toast: () => {}, dismiss: () => {} }
  }
  return ctx
}

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = `toast-${++toastCounter}`
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }])
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <Toast {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default Toast
