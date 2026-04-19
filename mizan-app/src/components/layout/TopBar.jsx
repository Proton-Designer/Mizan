import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { ACCOUNT_CONFIG } from '../../utils/constants'

export default function TopBar({ accountType }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isIndex = location.pathname === `/${accountType}`
  const config = ACCOUNT_CONFIG[accountType]

  const titles = {
    portfolio: 'Portfolio',
    borrower: 'Loan Account',
    community: 'Community Hub',
    ngo: 'NGO Dashboard'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '240px',
      right: 0,
      height: '64px',
      background: 'rgba(15, 15, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 'var(--z-nav)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isIndex && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '22px',
          fontWeight: 500,
          color: 'var(--text-primary)',
        }}>
          {titles[accountType]}
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        background: `${config.accentColor}15`,
        border: `1px solid ${config.accentColor}30`,
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          color: config.accentColor,
          letterSpacing: '0.02em',
        }}>
          {config.label}
        </span>
      </div>
    </div>
  )
}
