import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ACCOUNT_CONFIG } from '../utils/constants'
import AccountTypeCard from '../components/shared/AccountTypeCard'

function IslamicPattern() {
  const size = 60
  const half = size / 2
  const quarter = size / 4

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.04,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id="khatam" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="var(--gold-mid)" strokeWidth="0.5">
            <polygon points={`${half},0 ${half+quarter},${quarter} ${size},${half} ${half+quarter},${half+quarter} ${half},${size} ${quarter},${half+quarter} 0,${half} ${quarter},${quarter}`} />
            <rect x={quarter} y={quarter} width={half} height={half} transform={`rotate(45, ${half}, ${half})`} />
            <line x1={half} y1="0" x2={half} y2={size} />
            <line x1="0" y1={half} x2={size} y2={half} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam)" />
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { setCurrentAccount } = useApp()

  const handleAccountSelect = (accountType) => {
    setCurrentAccount(accountType)
    navigate(ACCOUNT_CONFIG[accountType].route)
  }

  const accountOrder = ['portfolio', 'borrower', 'community', 'ngo']

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Radial gold glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '60%',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212, 168, 67, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Islamic geometric pattern */}
      <IslamicPattern />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1100px',
        padding: '0 40px',
      }}>
        {/* Brand section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <p style={{
            fontFamily: "'Amiri', serif",
            fontSize: '16px',
            color: 'var(--text-tertiary)',
            direction: 'rtl',
          }}>
            ميزان
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '56px',
            fontWeight: 600,
            color: 'var(--gold-light)',
            marginTop: '4px',
          }}>
            Mizan
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '10px',
            }}
          >
            The Akhirah Portfolio
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              width: '48px',
              height: '1px',
              background: 'var(--border-gold)',
              marginTop: '20px',
              boxShadow: '0 0 8px rgba(212, 168, 67, 0.3)',
            }}
          />
        </motion.div>

        {/* Context copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Choose your account to begin
        </motion.p>

        {/* Card grid — 4 columns on wide, 2 columns on narrower */}
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
            maxWidth: '1060px',
          }}
        >
          {accountOrder.map((type, index) => (
            <AccountTypeCard
              key={type}
              config={ACCOUNT_CONFIG[type]}
              onClick={() => handleAccountSelect(type)}
              index={index}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginTop: '48px',
          }}
        >
          © 2026 Mizan · Built at hack.msa
        </motion.p>
      </div>
    </div>
  )
}
