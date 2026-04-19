import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react'
import { useCommunity } from '../../context/CommunityContext'
import Card from '../../components/ui/Card'

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const PENDING_REQUESTS = [
  {
    id: 'vouch-bilal',
    name: 'Bilal Mansour',
    mosqueMember: true,
    amount: 1200,
    tier: 'Standard',
    purpose: 'Tuition',
    needScore: 68,
    vouchScore: 0,
    daysOld: 2,
    urgent: true,
  },
]

const REVIEWED_HISTORY = [
  { date: '2026-03-12', applicant: 'Yusuf Kareem', amount: 800, decision: 'vouched', outcome: 'repaid' },
  { date: '2026-02-28', applicant: 'Amina Haddad', amount: 1500, decision: 'vouched', outcome: 'active' },
  { date: '2026-02-14', applicant: 'Omar Farouk', amount: 600, decision: 'vouched', outcome: 'repaid' },
  { date: '2026-01-30', applicant: 'Khadija Noor', amount: 2000, decision: 'vouched', outcome: 'repaid' },
  { date: '2026-01-15', applicant: '[Anonymous]', amount: 900, decision: 'declined', outcome: null },
  { date: '2025-12-20', applicant: 'Hassan Ali', amount: 1100, decision: 'vouched', outcome: 'repaid' },
  { date: '2025-12-05', applicant: 'Fatima Zahra', amount: 750, decision: 'vouched', outcome: 'repaid' },
  { date: '2025-11-18', applicant: 'Ibrahim Saleh', amount: 1800, decision: 'vouched', outcome: 'active' },
  { date: '2025-11-02', applicant: 'Mariam Jaber', amount: 500, decision: 'vouched', outcome: 'repaid' },
  { date: '2025-10-15', applicant: 'Tariq Ramadan', amount: 1300, decision: 'vouched', outcome: 'repaid' },
  { date: '2025-09-28', applicant: 'Nadia Bakr', amount: 950, decision: 'vouched', outcome: 'repaid' },
  { date: '2025-09-10', applicant: 'Zayd Mahmoud', amount: 1600, decision: 'vouched', outcome: 'repaid' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommunityVouching() {
  const navigate = useNavigate()
  const { community } = useCommunity()
  const [activeTab, setActiveTab] = useState('pending')

  const pendingCount = PENDING_REQUESTS.length
  const reviewedCount = REVIEWED_HISTORY.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={styles.container}
    >
      {/* Header */}
      <h1 style={styles.header}>Vouch Requests</h1>

      {/* Tab pills */}
      <div style={styles.tabRow}>
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'reviewed', label: `Reviewed (${reviewedCount})` },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabPill,
              ...(activeTab === tab.key ? styles.tabPillActive : styles.tabPillInactive),
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── Pending tab ── */}
      {activeTab === 'pending' && (
        <div style={{ marginTop: 24 }}>
          {PENDING_REQUESTS.map((req) => (
            <Card key={req.id} style={styles.pendingCard}>
              {/* Red left accent */}
              <div style={styles.redAccent} />

              <div style={styles.pendingContent}>
                {/* Top row: urgency + age */}
                <div style={styles.urgencyRow}>
                  <span style={styles.redDot}>New &middot; {req.daysOld} days old</span>
                  {req.urgent && (
                    <span style={styles.urgentBadge}>
                      <AlertTriangle size={12} />
                      Urgent
                    </span>
                  )}
                </div>

                {/* Name + details */}
                <h3 style={styles.applicantName}>{req.name}</h3>
                <div style={styles.detailRow}>
                  {req.mosqueMember && (
                    <span style={styles.memberBadge}>
                      <ShieldCheck size={12} /> Mosque member
                    </span>
                  )}
                  <span style={styles.detailChip}>${req.amount.toLocaleString()}</span>
                  <span style={styles.detailChip}>{req.tier}</span>
                  <span style={styles.detailChip}>{req.purpose}</span>
                </div>

                {/* Scores */}
                <div style={styles.scoreRow}>
                  <div style={styles.scoreBlock}>
                    <span style={styles.scoreLabel}>Need Score</span>
                    <span style={styles.scoreValue}>{req.needScore}/100</span>
                  </div>
                  <div style={styles.scoreBlock}>
                    <span style={styles.scoreLabel}>Vouch Score</span>
                    <span style={{ ...styles.scoreValue, color: 'var(--text-tertiary)' }}>
                      {req.vouchScore}{' '}
                      <span style={{ fontSize: 11, fontWeight: 400 }}>(pending)</span>
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  onClick={() => navigate(`/community/vouching/${req.id}`)}
                  style={styles.reviewButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Review full request <ChevronRight size={16} />
                </motion.button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Reviewed tab ── */}
      {activeTab === 'reviewed' && (
        <div style={{ marginTop: 24 }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Date', 'Applicant', 'Amount', 'Decision', 'Outcome'].map((col) => (
                    <th key={col} style={styles.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REVIEWED_HISTORY.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{formatDate(row.date)}</td>
                    <td style={{
                      ...styles.td,
                      color: row.applicant === '[Anonymous]'
                        ? 'var(--text-tertiary)'
                        : 'var(--text-primary)',
                      fontStyle: row.applicant === '[Anonymous]' ? 'italic' : 'normal',
                    }}>
                      {row.applicant}
                    </td>
                    <td style={styles.td}>${row.amount.toLocaleString()}</td>
                    <td style={styles.td}>
                      {row.decision === 'vouched' ? (
                        <span style={styles.decisionVouched}>&#10003; Vouched</span>
                      ) : (
                        <span style={styles.decisionDeclined}>&#10007; Declined</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {row.outcome === 'active' && (
                        <span style={styles.outcomeActive}>Loan active</span>
                      )}
                      {row.outcome === 'repaid' && (
                        <span style={styles.outcomeRepaid}>Repaid &#10003;</span>
                      )}
                      {row.outcome === null && (
                        <span style={{ color: 'var(--text-tertiary)' }}>&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mosque Trust Badge */}
          <Card variant="gold" style={styles.trustBadge}>
            <div style={styles.trustTop}>
              <span style={styles.trustStat}>
                10 of 11 vouched loans repaid &mdash; 90.9%
              </span>
            </div>
            <div style={styles.trustBottom}>
              <span style={styles.trustMedal} role="img" aria-label="medal">&#127941;</span>
              <span style={styles.trustedLabel}>
                Trusted Voucher &mdash; enhanced weight (1.15&times;)
              </span>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px',
  },
  header: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 28,
    color: 'var(--text-primary)',
    margin: 0,
  },

  /* Tab pills */
  tabRow: {
    display: 'flex',
    gap: 8,
    marginTop: 20,
  },
  tabPill: {
    padding: '8px 20px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
  },
  tabPillActive: {
    background: 'var(--teal-mid)',
    color: '#fff',
  },
  tabPillInactive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-subtle)',
  },

  /* Pending card */
  pendingCard: {
    position: 'relative',
    paddingLeft: 20,
    overflow: 'hidden',
    background: 'rgba(22, 22, 31, 0.55)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(240, 237, 232, 0.06)',
  },
  redAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: 'var(--status-red)',
    borderRadius: '8px 0 0 8px',
  },
  pendingContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  urgencyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  redDot: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--status-red)',
  },
  urgentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 10px',
    borderRadius: 999,
    background: 'rgba(248,113,113,0.15)',
    color: 'var(--status-red)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  applicantName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 22,
    color: 'var(--text-primary)',
    margin: 0,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  memberBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 999,
    background: 'var(--teal-glow)',
    color: 'var(--teal-light)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
  },
  detailChip: {
    padding: '3px 10px',
    borderRadius: 999,
    background: 'var(--bg-overlay)',
    color: 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
  },
  scoreRow: {
    display: 'flex',
    gap: 32,
    marginTop: 4,
  },
  scoreBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  scoreLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  scoreValue: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  reviewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--teal-mid)',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },

  /* Table */
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-tertiary)',
    borderBottom: '1px solid var(--border-default)',
    background: 'var(--bg-elevated)',
  },
  td: {
    padding: '10px 16px',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  trEven: {
    background: 'var(--bg-surface)',
  },
  trOdd: {
    background: 'var(--bg-deep)',
  },
  decisionVouched: {
    color: 'var(--status-green)',
    fontWeight: 600,
  },
  decisionDeclined: {
    color: 'var(--status-red)',
    fontWeight: 600,
  },
  outcomeActive: {
    color: 'var(--teal-light)',
    fontWeight: 500,
  },
  outcomeRepaid: {
    color: 'var(--status-green)',
    fontWeight: 500,
  },

  /* Trust badge */
  trustBadge: {
    marginTop: 20,
    textAlign: 'center',
    background: 'rgba(22, 22, 31, 0.55)',
    border: '1px solid rgba(212, 168, 67, 0.12)',
    boxShadow: '0 0 30px rgba(212, 168, 67, 0.04)',
  },
  trustTop: {
    marginBottom: 10,
  },
  trustStat: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  trustBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 999,
    background: 'var(--gold-glow)',
    border: '1px solid var(--border-gold)',
    width: 'fit-content',
    margin: '0 auto',
  },
  trustMedal: {
    fontSize: 18,
  },
  trustedLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--gold-mid)',
  },
}
