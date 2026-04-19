import { motion } from 'framer-motion'

const variants = {
  primary: {
    background: 'var(--gradient-gold)',
    color: 'var(--text-inverse)',
    border: 'none',
    boxShadow: 'var(--shadow-gold)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-gold)',
    border: '1px solid var(--border-gold)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'var(--bg-overlay)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'none',
  }
}

export default function Button({ variant = 'primary', children, style, ...props }) {
  const variantStyle = variants[variant]

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        ...variantStyle,
        height: '52px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 24px',
        transition: 'var(--transition-spring)',
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
