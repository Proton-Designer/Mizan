import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Compass, Map, Search, CreditCard, User, BarChart3, Users, ShieldCheck, Megaphone, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_CONFIG = {
  portfolio: [
    { label: 'Home', icon: Home, path: '/portfolio' },
    { label: 'Invest', icon: Compass, path: '/portfolio/invest' },
    { label: 'Journey', icon: Map, path: '/portfolio/journey' },
    { label: 'Discover', icon: Search, path: '/portfolio/discover' },
  ],
  borrower: [
    { label: 'Home', icon: Home, path: '/borrower' },
    { label: 'Payments', icon: CreditCard, path: '/borrower/payments' },
    { label: 'Account', icon: User, path: '/borrower/account' },
  ],
  community: [
    { label: 'Dashboard', icon: Home, path: '/community' },
    { label: 'Circles', icon: Users, path: '/community/circles' },
    { label: 'Vouching', icon: ShieldCheck, path: '/community/vouching' },
    { label: 'Insights', icon: BarChart3, path: '/community/insights' },
  ],
  ngo: [
    { label: 'Dashboard', icon: Home, path: '/ngo' },
    { label: 'Campaigns', icon: Megaphone, path: '/ngo/campaigns' },
    { label: 'Donors', icon: Users, path: '/ngo/donors' },
    { label: 'Insights', icon: BarChart3, path: '/ngo/insights' },
    { label: 'Account', icon: UserCog, path: '/ngo/account' },
  ],
}

export default function BottomNav({ accountType }) {
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = NAV_CONFIG[accountType] || []

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      height: '64px',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'rgba(15, 15, 26, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 'var(--z-nav)',
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '8px 12px',
              position: 'relative',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: 'absolute',
                  top: '0px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--gold-mid)',
                }}
              />
            )}
            <motion.div
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                size={20}
                color={isActive ? 'var(--gold-mid)' : 'var(--text-tertiary)'}
              />
            </motion.div>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: isActive ? 'var(--gold-mid)' : 'var(--text-tertiary)',
              transition: 'color 200ms',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
