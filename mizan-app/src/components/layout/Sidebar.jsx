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

  const demoUser = appCtx?.demoUser

  return (
    <aside style={styles.sidebar}>
      {/* ── Branding ── */}
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

              <motion.button
                onClick={() => portfolio.addFunds(500)}
                style={styles.addFundsButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Add Funds
              </motion.button>
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

      {/* ── Navigation ── */}
      <nav style={styles.nav}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.path && location.pathname === tab.path

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
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : styles.tabInactive),
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* ── Bottom section ── */}
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
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {isPortfolio ? (
            <>
              <ArrowRightLeft size={16} style={{ flexShrink: 0 }} />
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
  },
  branding: {
    padding: '24px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
    marginTop: 16,
  },

  /* Balance section */
  balanceSection: {
    padding: '12px 20px 0',
    display: 'flex',
    flexDirection: 'column',
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

  /* Navigation */
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 8,
    overflowY: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    margin: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    textAlign: 'left',
    width: 'calc(100% - 16px)',
    boxSizing: 'border-box',
  },
  tabActive: {
    background: 'var(--gold-glow)',
    color: 'var(--gold-mid)',
    borderLeft: '3px solid var(--gold-mid)',
    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
    paddingLeft: 17,
  },
  tabInactive: {
    color: 'var(--text-secondary)',
  },

  /* Bottom section */
  bottomSection: {
    padding: '16px 8px',
    borderTop: '1px solid var(--border-subtle)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 12px 12px',
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
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-tertiary)',
    width: '100%',
    borderRadius: 'var(--radius-sm)',
  },
}
