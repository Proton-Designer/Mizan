import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Compass,
  Map,
  Search,
  CreditCard,
  Heart,
  User,
  BarChart3,
  Users,
  ShieldCheck,
  Megaphone,
  UserCog,
  ChevronLeft,
  ArrowRightLeft,
  Zap,
} from 'lucide-react'
import PortfolioContext from '../../context/PortfolioContext'
import { useApp } from '../../context/AppContext'

/* ──────────────────────────────────────────────
   SAFE PORTFOLIO HOOK
   Returns null when outside PortfolioProvider
   ────────────────────────────────────────────── */

function usePortfolioSafe() {
  const ctx = useContext(PortfolioContext)
  return ctx // null when no provider wraps us
}

/* ──────────────────────────────────────────────
   ACCENT COLORS PER ACCOUNT TYPE
   ────────────────────────────────────────────── */

const ACCENT_COLORS = {
  portfolio: { color: 'var(--gold-mid)', glow: 'rgba(212, 168, 67, 0.04)', glowActive: 'rgba(212, 168, 67, 0.10)' },
  borrower:  { color: 'var(--teal-mid, #4AADA4)', glow: 'rgba(74, 173, 164, 0.04)', glowActive: 'rgba(74, 173, 164, 0.10)' },
  community: { color: 'var(--teal-light, #7ECDC4)', glow: 'rgba(126, 205, 196, 0.04)', glowActive: 'rgba(126, 205, 196, 0.10)' },
  ngo:       { color: 'var(--gold-light, #F5D485)', glow: 'rgba(245, 212, 133, 0.04)', glowActive: 'rgba(245, 212, 133, 0.10)' },
}

/* ──────────────────────────────────────────────
   NAV CONFIG
   ────────────────────────────────────────────── */

const NAV_CONFIG = {
  portfolio: [
    { label: 'Portfolio', icon: Home, path: '/portfolio' },
    { label: 'Invest', icon: Compass, action: 'openInvest' },
    { label: 'Journey', icon: Map, path: '/portfolio/journey' },
    { label: 'Discover', icon: Search, path: '/portfolio/discover' },
    { label: 'Transactions', icon: CreditCard, path: '/portfolio/transactions' },
    { label: 'Jariyah Vault', icon: Heart, path: '/portfolio/vault' },
  ],
  borrower: [
    { label: 'My Loan', icon: Home, path: '/borrower' },
    { label: 'Payments', icon: CreditCard, path: '/borrower/payment' },
    { label: 'History', icon: User, path: '/borrower/history' },
    { label: 'Account', icon: User, path: '/borrower/account' },
  ],
  community: [
    { label: 'Dashboard', icon: Home, path: '/community' },
    { label: 'Welfare Cases', icon: Heart, path: '/community/welfare' },
    { label: 'Events', icon: BarChart3, path: '/community/events' },
    { label: 'Vouching', icon: ShieldCheck, path: '/community/vouching' },
    { label: 'Reports', icon: Users, path: '/community/reports' },
  ],
  ngo: [
    { label: 'Dashboard', icon: Home, path: '/ngo' },
    { label: 'Campaigns', icon: Megaphone, path: '/ngo/campaigns' },
    { label: 'Donors', icon: Users, path: '/ngo/donors' },
    { label: 'Insights', icon: BarChart3, path: '/ngo/insights' },
    { label: 'Automations', icon: Zap, path: '/ngo/automations' },
    { label: 'Account', icon: UserCog, path: '/ngo/account' },
  ],
}

/* ──────────────────────────────────────────────
   ISLAMIC GEOMETRIC SVG PATTERN
   8-pointed star tessellation
   ────────────────────────────────────────────── */

function IslamicPattern() {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.025,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern id="islamic-star" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          {/* 8-pointed star tessellation */}
          <g fill="none" stroke="currentColor" strokeWidth="0.8">
            {/* Central octagon */}
            <polygon points="24,6 34,10 38,20 38,28 34,38 24,42 14,38 10,28 10,20 14,10" />
            {/* Inner star arms */}
            <line x1="24" y1="0" x2="24" y2="6" />
            <line x1="24" y1="42" x2="24" y2="48" />
            <line x1="0" y1="24" x2="10" y2="24" />
            <line x1="38" y1="24" x2="48" y2="24" />
            {/* Diagonal connectors */}
            <line x1="0" y1="0" x2="14" y2="10" />
            <line x1="48" y1="0" x2="34" y2="10" />
            <line x1="0" y1="48" x2="14" y2="38" />
            <line x1="48" y1="48" x2="34" y2="38" />
            {/* Inner star shape */}
            <polygon points="24,14 28,20 24,26 20,20" />
            <line x1="24" y1="6" x2="20" y2="20" />
            <line x1="24" y1="6" x2="28" y2="20" />
            <line x1="24" y1="42" x2="20" y2="28" />
            <line x1="24" y1="42" x2="28" y2="28" />
            <line x1="10" y1="24" x2="20" y2="20" />
            <line x1="10" y1="24" x2="20" y2="28" />
            <line x1="38" y1="24" x2="28" y2="20" />
            <line x1="38" y1="24" x2="28" y2="28" />
            {/* Kite shapes between stars */}
            <polygon points="20,20 24,14 28,20 24,26" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-star)" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   ACCOUNT SUMMARY CARD
   Compact glass-style card per account type
   ────────────────────────────────────────────── */

function AccountSummaryCard({ accountType, portfolio }) {
  const accent = ACCENT_COLORS[accountType] || ACCENT_COLORS.portfolio

  const cardStyle = {
    margin: '8px 12px',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid rgba(255, 255, 255, 0.06)`,
    borderRadius: 'var(--radius-sm, 6px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }

  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 2,
  }

  const valueStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  }

  const accentSpan = (text) => (
    <span style={{ color: accent.color, fontWeight: 600 }}>{text}</span>
  )

  if (accountType === 'portfolio') {
    const available = portfolio?.bankConnected ? `$${(portfolio.bankBalance || 0).toLocaleString()}` : '--'
    const committed = portfolio?.bankConnected ? `$${(portfolio.committedCapital || 0).toLocaleString()}` : '--'
    return (
      <div style={cardStyle}>
        <span style={labelStyle}>Summary</span>
        <span style={valueStyle}>
          {accentSpan(available)} available {' \u00B7 '} {accentSpan(committed)} committed
        </span>
      </div>
    )
  }

  if (accountType === 'borrower') {
    return (
      <div style={cardStyle}>
        <span style={labelStyle}>Loan Status</span>
        <span style={valueStyle}>
          {accentSpan('No active loan')}
        </span>
      </div>
    )
  }

  if (accountType === 'community') {
    return (
      <div style={cardStyle}>
        <span style={labelStyle}>Congregation</span>
        <span style={valueStyle}>
          Zakat pool: {accentSpan('$3,600')} remaining
        </span>
      </div>
    )
  }

  if (accountType === 'ngo') {
    return (
      <div style={cardStyle}>
        <span style={labelStyle}>Organization</span>
        <span style={valueStyle}>
          {accentSpan('$4,200')} available {' \u00B7 '} {accentSpan('$16,500')} pipeline
        </span>
      </div>
    )
  }

  return null
}

/* ──────────────────────────────────────────────
   STREAK PANEL (portfolio only)
   ────────────────────────────────────────────── */

function StreakBadge({ streakCount, streakHistory, incrementStreak, addFunds }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ padding: '0 16px 8px' }}>
      {/* Badge button */}
      <motion.button
        onClick={() => setExpanded((v) => !v)}
        style={styles.streakBadge}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <span role="img" aria-label="fire">&#128293;</span>
        <span style={styles.streakText}>{streakCount} days</span>
      </motion.button>

      {/* Expandable panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={styles.streakPanel}>
              <p style={styles.streakPanelTitle}>
                Current streak: <span style={{ color: 'var(--gold-mid)' }}>{streakCount} days</span>
              </p>
              <p style={styles.hadithText}>
                "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
                <span style={styles.hadithSource}> — Bukhari</span>
              </p>

              {/* 28-day calendar grid */}
              <div style={styles.calendarGrid}>
                {(streakHistory || []).map((gave, i) => (
                  <div
                    key={i}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: gave ? 'var(--teal, #14B8A6)' : 'transparent',
                      border: gave ? 'none' : '1.5px solid var(--border-subtle)',
                    }}
                  >
                    {gave && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#fff',
                          opacity: 0.9,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Keep streak button */}
              <motion.button
                onClick={() => {
                  if (addFunds) addFunds(1)
                  if (incrementStreak) incrementStreak()
                }}
                style={styles.keepStreakButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Give $1 to keep it going
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────
   SIDEBAR COMPONENT
   ────────────────────────────────────────────── */

export default function Sidebar({ accountType }) {
  const navigate = useNavigate()
  const location = useLocation()
  const appCtx = useApp()
  const portfolio = usePortfolioSafe()

  const isPortfolio = accountType === 'portfolio'
  const tabs = NAV_CONFIG[accountType] || []
  const accent = ACCENT_COLORS[accountType] || ACCENT_COLORS.portfolio

  const demoUser = appCtx?.demoUser

  // Hover state tracking for nav items
  const [hoveredTab, setHoveredTab] = useState(null)
  // Add funds modal
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [addFundsAmount, setAddFundsAmount] = useState('')

  return (
    <aside style={styles.sidebar}>
      {/* ── Islamic geometric pattern background ── */}
      <IslamicPattern />

      {/* ── Logo zone (64px) ── */}
      <div style={styles.branding}>
        <span style={styles.arabicText}>{'\u0645\u064A\u0632\u0627\u0646'}</span>
        <span style={styles.brandName}>Mizan</span>
        <div style={styles.divider} />
      </div>

      {/* ── Portfolio balance section ── */}
      {isPortfolio && portfolio && (
        <div style={styles.balanceSection}>
          {portfolio.bankConnected ? (
            <>
              <span style={styles.balanceLabel}>Available</span>
              <span style={styles.balanceAmount}>
                ${portfolio.bankBalance.toLocaleString()}
              </span>

              <span style={styles.committedLabel}>Committed</span>
              <span style={styles.committedAmount}>
                ${portfolio.committedCapital.toLocaleString()}
              </span>

              {!showAddFunds ? (
                <motion.button
                  onClick={() => { setShowAddFunds(true); setAddFundsAmount('') }}
                  style={styles.addFundsButton}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Add Funds
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: 8, overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && addFundsAmount && parseFloat(addFundsAmount) > 0) {
                          portfolio.addFunds(parseFloat(addFundsAmount))
                          setShowAddFunds(false)
                          setAddFundsAmount('')
                        }
                        if (e.key === 'Escape') { setShowAddFunds(false) }
                      }}
                      style={{
                        flex: 1, height: 34, padding: '0 10px',
                        background: 'var(--bg-deep)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)', fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif", outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (addFundsAmount && parseFloat(addFundsAmount) > 0) {
                          portfolio.addFunds(parseFloat(addFundsAmount))
                          setShowAddFunds(false)
                          setAddFundsAmount('')
                        }
                      }}
                      style={{
                        height: 34, padding: '0 12px',
                        background: 'var(--gold-mid)', color: 'var(--text-inverse)',
                        border: 'none', borderRadius: 'var(--radius-sm)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {[100, 500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          portfolio.addFunds(amt)
                          setShowAddFunds(false)
                          setAddFundsAmount('')
                        }}
                        style={{
                          padding: '4px 10px', fontSize: 11, fontWeight: 500,
                          background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ${amt.toLocaleString()}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAddFunds(false)}
                      style={{
                        padding: '4px 10px', fontSize: 11,
                        background: 'none', color: 'var(--text-tertiary)',
                        border: 'none', cursor: 'pointer', marginLeft: 'auto',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <motion.button
              onClick={() => portfolio.connectBank('Demo Bank', '000012345678')}
              style={styles.connectBankButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Connect Bank
            </motion.button>
          )}

          <div style={{ ...styles.divider, marginTop: 12 }} />
        </div>
      )}

      {/* ── Streak badge (portfolio only) ── */}
      {isPortfolio && portfolio && portfolio.bankConnected && (
        <StreakBadge
          streakCount={portfolio.streakCount}
          streakHistory={portfolio.streakHistory}
          incrementStreak={portfolio.incrementStreak}
          addFunds={portfolio.addFunds}
        />
      )}

      {/* ── Navigation zone ── */}
      <nav style={styles.nav}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.path && location.pathname === tab.path
          const isHovered = hoveredTab === tab.label

          const handleClick = () => {
            if (tab.action === 'openInvest' && portfolio) {
              portfolio.openInvest()
            } else if (tab.path) {
              navigate(tab.path)
            }
          }

          return (
            <motion.button
              key={tab.label}
              onClick={handleClick}
              onMouseEnter={() => setHoveredTab(tab.label)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                ...styles.tab,
                height: 44,
                paddingLeft: 14,
                borderLeft: isActive ? `3px solid ${accent.color}` : '3px solid transparent',
                borderRadius: isActive ? '0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0' : 'var(--radius-sm, 6px)',
                background: isActive
                  ? accent.glowActive
                  : isHovered
                    ? accent.glow
                    : 'transparent',
                color: isActive ? accent.color : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
              }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* ── Account summary card ── */}
      <AccountSummaryCard accountType={accountType} portfolio={portfolio} />

      {/* ── Utility zone (bottom) ── */}
      <div style={styles.bottomSection}>
        {isPortfolio && demoUser && (
          <div style={styles.userInfo}>
            <span style={styles.userName}>{demoUser.name}</span>
            <span style={styles.userMosque}>{demoUser.mosque}</span>
          </div>
        )}

        <motion.button
          onClick={() => navigate('/')}
          style={styles.backButton}
          whileHover={{
            scale: 1.02,
            backgroundColor: accent.glow,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {isPortfolio ? (
            <>
              <ArrowRightLeft size={16} style={{ flexShrink: 0, color: accent.color }} />
              <span>Switch Account</span>
            </>
          ) : (
            <>
              <ChevronLeft size={16} style={{ flexShrink: 0 }} />
              <span>Back to Home</span>
            </>
          )}
        </motion.button>
      </div>
    </aside>
  )
}

/* ──────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────── */

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 240,
    height: '100vh',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  /* Logo zone - 64px */
  branding: {
    padding: '16px 20px 0',
    height: 64,
    minHeight: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box',
  },
  arabicText: {
    fontFamily: "'Amiri', serif",
    fontSize: 12,
    color: 'var(--text-tertiary)',
    lineHeight: 1.2,
  },
  brandName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    color: 'var(--gold-mid)',
    lineHeight: 1.2,
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    background: 'var(--gold-mid)',
    opacity: 0.25,
    marginTop: 12,
  },

  /* Balance section */
  balanceSection: {
    padding: '12px 20px 0',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  balanceLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  balanceAmount: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    color: 'var(--gold-mid)',
    lineHeight: 1.2,
    marginTop: 2,
  },
  committedLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: 8,
  },
  committedAmount: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    color: 'var(--teal, #14B8A6)',
    lineHeight: 1.2,
    marginTop: 2,
  },
  addFundsButton: {
    marginTop: 12,
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--gold-mid)',
    borderRadius: 'var(--radius-sm, 6px)',
    color: 'var(--gold-mid)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'center',
  },
  connectBankButton: {
    marginTop: 4,
    padding: '10px 16px',
    background: 'transparent',
    border: '1px solid var(--gold-mid)',
    borderRadius: 'var(--radius-sm, 6px)',
    color: 'var(--gold-mid)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'center',
  },

  /* Streak badge */
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm, 6px)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
  },
  streakText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--gold-mid)',
    fontWeight: 600,
  },
  streakPanel: {
    padding: '8px 4px 12px',
  },
  streakPanelTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: '0 0 8px',
  },
  hadithText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    color: 'var(--text-tertiary)',
    lineHeight: 1.5,
    fontStyle: 'italic',
    margin: '0 0 12px',
  },
  hadithSource: {
    fontStyle: 'normal',
    opacity: 0.7,
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
    marginBottom: 12,
    justifyItems: 'center',
  },
  keepStreakButton: {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--teal, #14B8A6)',
    border: 'none',
    borderRadius: 'var(--radius-sm, 6px)',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
  },

  /* Navigation zone */
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingTop: 12,
    overflowY: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 14px',
    margin: '2px 8px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    textAlign: 'left',
    width: 'calc(100% - 16px)',
    boxSizing: 'border-box',
  },

  /* Utility zone (bottom) */
  bottomSection: {
    padding: '12px 8px',
    borderTop: '1px solid var(--border-subtle)',
    position: 'relative',
    zIndex: 1,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 12px 10px',
  },
  userName: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  userMosque: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: 'var(--text-tertiary)',
    marginTop: 2,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    background: 'transparent',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-tertiary)',
    width: '100%',
    borderRadius: 'var(--radius-sm, 6px)',
    boxSizing: 'border-box',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
}
