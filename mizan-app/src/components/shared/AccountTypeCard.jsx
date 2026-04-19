import { motion } from 'framer-motion'
import { TrendingUp, Heart, Users, Globe, ChevronRight } from 'lucide-react'

const ICONS = {
  TrendingUp,
  HandHeart: Heart,
  Users,
  Globe,
}

export default function AccountTypeCard({ config, onClick, index }) {
  const Icon = ICONS[config.icon] || Globe

  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 }
      }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        position: 'relative',
        transition: 'border-color 250ms, box-shadow 250ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${config.accentColor}66`
        e.currentTarget.style.boxShadow = `var(--shadow-card), inset 0 0 20px ${config.accentColor}15`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0px)'
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={22} color={config.accentColor} />
      </div>

      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginTop: '14px',
        display: 'block',
      }}>
        {config.label}
      </span>

      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        fontWeight: 400,
        color: 'var(--text-secondary)',
        marginTop: '4px',
        display: 'block',
        lineHeight: 1.4,
      }}>
        {config.subtitle}
      </span>

      <ChevronRight
        size={14}
        color="var(--text-tertiary)"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
        }}
      />
    </motion.button>
  )
}
