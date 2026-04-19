/**
 * QuickStatBadge + TrustMeter — Micro-components
 * 21st.dev-inspired stat badges and trust level display
 *
 * QuickStatBadge: Animated counter with label, used in dashboard cards
 * TrustMeter: Star rating with glow effect for community trust level
 * ProgressRing: SVG circular progress indicator
 */

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'


// ---------------------------------------------------------------------------
// QuickStatBadge — animated number with label
// ---------------------------------------------------------------------------

export function QuickStatBadge({
  label,
  value,
  prefix = '',
  suffix = '',
  accentColor = 'var(--teal-mid)',
  trend,       // 'up' | 'down' | null
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const animatedRef = useRef(false)

  const sizes = {
    sm: { value: 20, label: 10, gap: 2 },
    md: { value: 28, label: 11, gap: 4 },
    lg: { value: 36, label: 12, gap: 6 },
  }
  const s = sizes[size] || sizes.md

  // Animate counter on mount
  useEffect(() => {
    if (animatedRef.current) return
    animatedRef.current = true

    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
    const duration = 1200
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(numValue * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex', flexDirection: 'column', gap: s.gap,
      }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: s.label,
        fontWeight: 500,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: s.value,
          fontWeight: 600,
          color: accentColor,
          lineHeight: 1.1,
        }}>
          {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : value}{suffix}
        </span>
        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 11, fontWeight: 600,
            color: trend === 'up' ? 'var(--status-green)' : 'var(--status-red)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {trend === 'up'
              ? <TrendingUp size={12} style={{ marginRight: 2 }} />
              : <TrendingDown size={12} style={{ marginRight: 2 }} />}
          </span>
        )}
      </div>
    </motion.div>
  )
}


// ---------------------------------------------------------------------------
// TrustMeter — star rating with glow
// ---------------------------------------------------------------------------

export function TrustMeter({ level = 1, maxLevel = 5, showLabel = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {showLabel && (
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Community Trust
        </span>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {Array.from({ length: maxLevel }).map((_, i) => {
          const filled = i < level
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Star
                size={18}
                fill={filled ? 'var(--gold-mid)' : 'transparent'}
                color={filled ? 'var(--gold-mid)' : 'var(--border-default)'}
                style={{
                  filter: filled ? 'drop-shadow(0 0 4px rgba(212, 168, 67, 0.4))' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            </motion.div>
          )
        })}
        {showLabel && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginLeft: 6,
          }}>
            {level}/{maxLevel}
          </span>
        )}
      </div>
    </div>
  )
}


// ---------------------------------------------------------------------------
// ProgressRing — SVG circular progress
// ---------------------------------------------------------------------------

export function ProgressRing({
  progress = 0,    // 0-100
  size = 80,
  strokeWidth = 6,
  accentColor = 'var(--teal-mid)',
  trackColor = 'var(--border-subtle)',
  children,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* Center content */}
      {children && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
