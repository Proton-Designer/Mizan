import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  UserPlus,
  BarChart3,
  Settings,
  Archive,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Play,
} from 'lucide-react'
import { useCommunity } from '../../context/CommunityContext'

/* ---------------------------------------------------------------------------
   Seed Data
   --------------------------------------------------------------------------- */

const CIRCLE_DATA = {
  'msa-graduate': {
    name: 'MSA Graduate Fund',
    members: 12,
    pooled: 4800,
    activeLoans: 2,
    healthPct: 82,
    healthLabel: 'Strong',
    healthColor: 'var(--teal-mid)',
    availableCapital: 3400,
    totalLoaned: 1400,
    avgLoanSize: 400,
    utilization: 29,
    repaymentRate: 94,
  },
  'sisters': {
    name: 'Sisters Circle',
    members: 8,
    pooled: 3200,
    activeLoans: 1,
    healthPct: 96,
    healthLabel: 'Excellent',
    healthColor: '#10B981',
    availableCapital: 2800,
    totalLoaned: 400,
    avgLoanSize: 200,
    utilization: 13,
    repaymentRate: 100,
  },
  'ramadan-emergency': {
    name: 'Ramadan Emergency',
    members: 15,
    pooled: 6100,
    activeLoans: 0,
    healthPct: null,
    healthLabel: 'Awaiting first loan',
    healthColor: 'var(--text-tertiary)',
    availableCapital: 6100,
    totalLoaned: 0,
    avgLoanSize: 0,
    utilization: 0,
    repaymentRate: null,
  },
}

const MEMBERS = [
  { name: 'Aisha Rahman', pledge: '$50/mo', role: 'Admin', status: 'Active', statusColor: '#10B981' },
  { name: 'Omar Bashir', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Fatima Al-Hassan', pledge: '$100/mo', role: 'Treasurer', status: 'Active', statusColor: '#10B981' },
  { name: 'Ibrahim T.', pledge: '$50/mo', role: 'Member', status: 'Missed May', statusColor: '#F59E0B' },
  { name: 'Hana Khalil', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Yusuf Ahmed', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Maryam Syed', pledge: '$100/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Khalid Noor', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Sara Mansour', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Ahmad Farooq', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Nadia Rizvi', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
  { name: 'Bilal Mansour', pledge: '$50/mo', role: 'Member', status: 'Active', statusColor: '#10B981' },
]

const ACTIVE_LOANS = [
  {
    borrower: 'Omar B.',
    amount: 600,
    repaid: 240,
    repaidPct: 40,
    schedule: [
      { month: 'Jan 2026', amount: 120, status: 'paid' },
      { month: 'Feb 2026', amount: 120, status: 'paid' },
      { month: 'Mar 2026', amount: 120, status: 'due' },
      { month: 'Apr 2026', amount: 120, status: 'upcoming' },
      { month: 'May 2026', amount: 120, status: 'upcoming' },
    ],
  },
  {
    borrower: 'Hana K.',
    amount: 200,
    repaid: 100,
    repaidPct: 50,
    schedule: [
      { month: 'Mar 2026', amount: 100, status: 'paid' },
      { month: 'Apr 2026', amount: 100, status: 'due' },
    ],
  },
]

const POOL_HISTORY = [
  { date: 'Apr 1, 2026', event: 'Monthly pledges collected', amount: '+$600', balance: '$4,800', positive: true },
  { date: 'Mar 28, 2026', event: 'Hana K. repayment received', amount: '+$100', balance: '$4,200', positive: true },
  { date: 'Mar 15, 2026', event: 'Loan disbursed to Hana K.', amount: '-$200', balance: '$4,100', positive: false },
  { date: 'Mar 1, 2026', event: 'Monthly pledges collected', amount: '+$600', balance: '$4,300', positive: true },
  { date: 'Feb 28, 2026', event: 'Omar B. repayment received', amount: '+$120', balance: '$3,700', positive: true },
  { date: 'Feb 1, 2026', event: 'Monthly pledges collected', amount: '+$600', balance: '$3,580', positive: true },
  { date: 'Jan 15, 2026', event: 'Loan disbursed to Omar B.', amount: '-$600', balance: '$2,980', positive: false },
  { date: 'Jan 1, 2026', event: 'Monthly pledges collected', amount: '+$600', balance: '$3,580', positive: true },
]

/* ---------------------------------------------------------------------------
   Members Table
   --------------------------------------------------------------------------- */

function MembersTable() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? MEMBERS : MEMBERS.slice(0, 5)

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '24px 28px',
      marginBottom: 24,
    }}>
      <h3 style={sectionTitle}>Members</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Status', 'Name', 'Pledge', 'Role', 'Status'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((m, i) => {
            const isMissed = m.status === 'Missed May'
            return (
              <tr key={i} style={{
                background: isMissed ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
              }}>
                <td style={tdStyle}>
                  {isMissed
                    ? <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                    : <CheckCircle size={16} style={{ color: m.statusColor }} />
                  }
                </td>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                <td style={tdStyle}>{m.pledge}</td>
                <td style={tdStyle}>
                  {m.role === 'Admin' || m.role === 'Treasurer' ? (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--teal-mid)',
                      background: 'rgba(74, 173, 164, 0.1)',
                    }}>
                      {m.role}
                    </span>
                  ) : m.role}
                </td>
                <td style={tdStyle}>
                  {isMissed ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#F59E0B',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                    }}>
                      Missed May
                    </span>
                  ) : (
                    <span style={{ color: m.statusColor, fontSize: 13 }}>{m.status}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {MEMBERS.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--teal-mid)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '12px 0 0',
          }}
        >
          {showAll ? <>Show less <ChevronUp size={14} /></> : <>Show all {MEMBERS.length} members <ChevronDown size={14} /></>}
        </button>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Active Loans Section
   --------------------------------------------------------------------------- */

function ActiveLoansSection() {
  const [expandedIdx, setExpandedIdx] = useState(null)

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '24px 28px',
      marginBottom: 24,
    }}>
      <h3 style={sectionTitle}>Active Loans</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ACTIVE_LOANS.map((loan, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {loan.borrower}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  marginLeft: 12,
                }}>
                  ${loan.amount} loan
                </span>
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--teal-mid)',
              }}>
                {loan.repaidPct}% repaid
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: 6,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loan.repaidPct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  height: '100%',
                  background: 'var(--teal-mid)',
                  borderRadius: 'var(--radius-pill)',
                }}
              />
            </div>

            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: 'var(--text-tertiary)',
              marginBottom: 8,
            }}>
              ${loan.repaid} of ${loan.amount} repaid
            </div>

            {/* Expand schedule */}
            <button
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--teal-mid)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
              }}
            >
              {expandedIdx === i ? <>Hide schedule <ChevronUp size={12} /></> : <>View schedule <ChevronDown size={12} /></>}
            </button>

            <AnimatePresence>
              {expandedIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                    <tbody>
                      {loan.schedule.map((s, si) => (
                        <tr key={si}>
                          <td style={{ ...tdStyle, fontSize: 12, padding: '6px 8px' }}>
                            {s.status === 'paid' && <CheckCircle size={12} style={{ color: '#10B981' }} />}
                            {s.status === 'due' && <Clock size={12} style={{ color: '#F59E0B' }} />}
                            {s.status === 'upcoming' && <Clock size={12} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />}
                          </td>
                          <td style={{ ...tdStyle, fontSize: 12, padding: '6px 8px' }}>{s.month}</td>
                          <td style={{ ...tdStyle, fontSize: 12, padding: '6px 8px' }}>${s.amount}</td>
                          <td style={{
                            ...tdStyle,
                            fontSize: 12,
                            padding: '6px 8px',
                            color: s.status === 'paid' ? '#10B981' : s.status === 'due' ? '#F59E0B' : 'var(--text-tertiary)',
                          }}>
                            {s.status === 'paid' ? 'Paid' : s.status === 'due' ? 'Due' : 'Upcoming'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Pending Vote Section (Most Prominent)
   --------------------------------------------------------------------------- */

function PendingVoteSection() {
  const [yesVotes, setYesVotes] = useState(5)
  const [noVotes] = useState(1)
  const [abstainVotes] = useState(1)
  const [cosigned, setCosigned] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const totalVotes = 12
  const currentVoted = yesVotes + noVotes + abstainVotes
  const yesPct = Math.round((yesVotes / currentVoted) * 100)
  const thresholdMet = yesPct >= 66

  const simulateVotes = () => {
    if (simulating) return
    setSimulating(true)
    let current = yesVotes
    const target = 9
    const interval = setInterval(() => {
      current += 1
      setYesVotes(current)
      if (current >= target) {
        clearInterval(interval)
        setSimulating(false)
      }
    }, 500)
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-elevated)',
      border: '2px solid rgba(74, 173, 164, 0.3)',
      padding: '28px',
      marginBottom: 24,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#F59E0B',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <h3 style={{
          ...sectionTitle,
          marginBottom: 0,
          color: 'var(--teal-light)',
        }}>
          Pending Vote
        </h3>
      </div>

      {/* Applicant Info */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <div>
            <h4 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
            }}>
              Bilal Mansour
            </h4>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              Standard Tier Request
            </p>
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--teal-light)',
          }}>
            $400
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}>
          <DetailItem label="Purpose" value="Car repair (employment)" />
          <DetailItem label="Vouch Status" value="2 vouches received" valueColor="#10B981" />
          <DetailItem label="Need Score" value="7.2 / 10" />
        </div>

        {/* Narrative excerpt */}
        <div style={{
          borderLeft: '3px solid var(--teal-mid)',
          paddingLeft: 16,
          marginBottom: 16,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            "My car broke down last week and I need it to get to work. Without reliable
            transportation I risk losing my job. I am asking the circle for help with the
            repair costs, which I can repay over 4 months from my salary..."
          </p>
        </div>

        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--teal-mid)',
          padding: 0,
        }}>
          View full application
        </button>
      </div>

      {/* Vote Count Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Votes Cast
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {currentVoted} / {totalVotes}
          </span>
        </div>

        {/* Stacked vote bar */}
        <div style={{
          width: '100%',
          height: 12,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: 8,
        }}>
          <motion.div
            animate={{ width: `${(yesVotes / totalVotes) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: '#10B981' }}
          />
          <motion.div
            animate={{ width: `${(noVotes / totalVotes) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: '#EF4444' }}
          />
          <motion.div
            animate={{ width: `${(abstainVotes / totalVotes) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: '#6B7280' }}
          />
        </div>

        {/* Vote breakdown */}
        <div style={{
          display: 'flex',
          gap: 20,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          marginBottom: 8,
        }}>
          <span style={{ color: '#10B981' }}>Yes: {yesVotes}</span>
          <span style={{ color: '#EF4444' }}>No: {noVotes}</span>
          <span style={{ color: '#6B7280' }}>Abstain: {abstainVotes}</span>
        </div>

        {/* Threshold */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: thresholdMet ? '#10B981' : '#F59E0B',
        }}>
          {yesPct}% approval {thresholdMet ? 'THRESHOLD MET \u2713' : '(needs 66%)'}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {!cosigned ? (
          <>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  padding: '12px 24px',
                  background: 'var(--teal-mid)',
                  color: 'var(--text-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all var(--transition-base)',
                }}
              >
                <Shield size={16} /> Co-sign as Imam
              </button>
            ) : (
              <div style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}>
                  Confirm co-sign?
                </span>
                <button
                  onClick={() => { setCosigned(true); setShowConfirm(false) }}
                  style={{
                    padding: '8px 20px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Yes, co-sign
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '8px 20px',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
          }}>
            <CheckCircle size={16} /> Co-signed
          </span>
        )}

        <button
          onClick={simulateVotes}
          disabled={simulating}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: simulating ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: simulating ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all var(--transition-base)',
          }}
        >
          <Play size={14} /> {simulating ? 'Simulating...' : 'Demo: Simulate vote completion'}
        </button>
      </div>

      {/* Keyframe for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Pool History
   --------------------------------------------------------------------------- */

function PoolHistory() {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '24px 28px',
      marginBottom: 24,
    }}>
      <h3 style={sectionTitle}>Pool History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Date', 'Event', 'Amount', 'Balance'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POOL_HISTORY.map((row, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{row.date}</td>
              <td style={{ ...tdStyle, color: 'var(--text-primary)' }}>{row.event}</td>
              <td style={{
                ...tdStyle,
                fontWeight: 600,
                color: row.positive ? '#10B981' : '#EF4444',
              }}>
                {row.amount}
              </td>
              <td style={tdStyle}>{row.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Sidebar
   --------------------------------------------------------------------------- */

function Sidebar({ circle }) {
  return (
    <div>
      {/* Circle Stats */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        marginBottom: 20,
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          Circle Stats
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Available Capital', value: `$${circle.availableCapital.toLocaleString()}` },
            { label: 'Total Loaned', value: `$${circle.totalLoaned.toLocaleString()}` },
            { label: 'Avg Loan Size', value: circle.avgLoanSize > 0 ? `$${circle.avgLoanSize}` : 'N/A' },
            { label: 'Utilization', value: `${circle.utilization}%` },
            { label: 'Repayment Rate', value: circle.repaymentRate !== null ? `${circle.repaymentRate}%` : 'N/A' },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: 'var(--text-tertiary)',
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        marginBottom: 20,
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: <UserPlus size={16} />, label: 'Invite member', primary: true },
            { icon: <BarChart3 size={16} />, label: 'View insights', primary: false },
            { icon: <Settings size={16} />, label: 'Edit rules', primary: false },
            { icon: <Archive size={16} />, label: 'Archive circle', primary: false },
          ].map((action) => (
            <button
              key={action.label}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: action.primary ? 'var(--teal-mid)' : 'transparent',
                color: action.primary ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: action.primary ? 'none' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: action.primary ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all var(--transition-base)',
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Summary */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}>
          Rules Summary
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Monthly Pledge', value: '$50/member' },
            { label: 'Member Cap', value: '15' },
            { label: 'Max Loan', value: '50% of pool' },
            { label: 'Micro Approval', value: 'Auto-approve' },
            { label: 'Standard Approval', value: 'Majority vote' },
            { label: 'Major Approval', value: 'Supermajority' },
            { label: 'Voting Window', value: '48 hours' },
            { label: 'Conversion', value: 'Circle vote required' },
          ].map((rule) => (
            <div key={rule.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: 'var(--text-tertiary)',
              }}>
                {rule.label}
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                {rule.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Detail Item Helper
   --------------------------------------------------------------------------- */

function DetailItem({ label, value, valueColor }) {
  return (
    <div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: valueColor || 'var(--text-primary)',
      }}>
        {value}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Main CircleDetail Screen
   --------------------------------------------------------------------------- */

export default function CommunityCircleDetail() {
  const { circleId } = useParams()
  const navigate = useNavigate()
  const { community } = useCommunity()

  const circle = CIRCLE_DATA[circleId] || CIRCLE_DATA['msa-graduate']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        padding: '48px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Back link */}
      <button
        onClick={() => navigate('/community/circles')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--teal-mid)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} /> Back to circles
      </button>

      {/* Header Card */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '28px 32px',
        marginBottom: 28,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {circle.name}
          </h1>
        </div>

        <div style={{
          display: 'flex',
          gap: 32,
          marginBottom: 20,
        }}>
          <StatChip icon={<Users size={14} />} label="Members" value={circle.members} />
          <StatChip icon={<DollarSign size={14} />} label="Pooled" value={`$${circle.pooled.toLocaleString()}`} />
          <StatChip icon={<Activity size={14} />} label="Active Loans" value={circle.activeLoans} />
        </div>

        {/* Pool health bar */}
        {circle.healthPct !== null && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Pool Health
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: circle.healthColor,
              }}>
                {circle.healthPct}% &mdash; {circle.healthLabel}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${circle.healthPct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  height: '100%',
                  background: circle.healthColor,
                  borderRadius: 'var(--radius-pill)',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Two-panel layout */}
      <div style={{
        display: 'flex',
        gap: 28,
      }}>
        {/* Main (70%) */}
        <div style={{ flex: '0 0 70%', minWidth: 0 }}>
          <MembersTable />
          <ActiveLoansSection />
          <PendingVoteSection />
          <PoolHistory />
        </div>

        {/* Sidebar (30%) */}
        <div style={{ flex: '0 0 30%', minWidth: 0 }}>
          <Sidebar circle={circle} />
        </div>
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Stat Chip (header)
   --------------------------------------------------------------------------- */

function StatChip({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: 'var(--text-tertiary)',
      }}>
        {label}:
      </span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--text-primary)',
      }}>
        {value}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Shared Styles
   --------------------------------------------------------------------------- */

const sectionTitle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 22,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 16,
}

const thStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textAlign: 'left',
  padding: '0 12px 12px',
  borderBottom: '1px solid var(--border-default)',
}

const tdStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  color: 'var(--text-secondary)',
  padding: '12px',
  borderBottom: '1px solid var(--border-subtle)',
}
