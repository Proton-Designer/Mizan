import { motion } from 'framer-motion'

export default function GlassCard({ variant = 'default', children, style, className = '', animate = true, ...props }) {
  const variantClass = {
    default: 'glass-card',
    gold: 'glass-card-gold',
    teal: 'glass-card-teal',
  }[variant] || 'glass-card'

  const Component = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  } : {}

  return (
    <Component
      className={`${variantClass} ${className}`}
      style={{ padding: 'var(--space-xl)', ...style }}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}
