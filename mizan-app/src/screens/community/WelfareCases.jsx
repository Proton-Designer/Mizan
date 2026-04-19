import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunity } from '../../context/CommunityContext'
import {
  Heart, Scale, Handshake, Gift, ArrowRight,
  X, MoreVertical, ChevronRight, Clock, Shield,
  CheckCircle2, AlertTriangle, Info, FileText,
  MessageSquare, Search
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Pre-seeded welfare case data                                      */
/* ------------------------------------------------------------------ */
const INITIAL_CASES = [
  {
    id: 'wc-1041',
    anonymizedName: 'Member #1041',
    tenure: '3 years',
    submittedDate: '2026-04-09',
    status: 'incoming',
    purpose: 'Medical bills — surgery recovery',
    amount: 1200,
    urgency: 'high',
    type: 'zakat',
    algorithmConfidence: 92,
    recommendation: 'Zakat distribution recommended',
    eligibilityChecks: ['Income below nisab threshold', 'Active congregation member (3 yrs)', 'No prior zakat received this year'],
  },
  {
    id: 'wc-1038',
    anonymizedName: 'Member #1038',
    tenure: '1.5 years',
    submittedDate: '2026-04-12',
    status: 'incoming',
    purpose: 'Rent shortfall — job loss',
    amount: 800,
    urgency: 'high',
    type: 'zakat',
    algorithmConfidence: 87,
    recommendation: 'Zakat distribution recommended',
    eligibilityChecks: ['Income below nisab threshold', 'Active congregation member (1.5 yrs)', 'Temporary hardship verified'],
  },
  {
    id: 'wc-1045',
    anonymizedName: 'Member #1045',
    tenure: '6 months',
    submittedDate: '2026-04-15',
    status: 'incoming',
    purpose: 'Groceries — family of 5',
    amount: 350,
    urgency: 'medium',
    type: 'sadaqah',
    algorithmConfidence: 78,
    recommendation: 'Sadaqah provision recommended',
    eligibilityChecks: ['Household size verified', 'Active congregation member (6 mo)', 'Short-term need identified'],
  },
  {
    id: 'wc-1032',
    anonymizedName: 'Member #1032',
    tenure: '4 years',
    submittedDate: '2026-04-08',
    status: 'in_review',
    purpose: 'Tuition — final semester',
    amount: 1800,
    urgency: 'medium',
    type: 'qard_hassan',
    algorithmConfidence: 84,
    recommendation: 'Qard hassan with 12-month repayment',
    eligibilityChecks: ['Student status verified', 'Repayment capacity assessed', 'Circle membership active'],
  },
  {
    id: 'wc-1029',
    anonymizedName: 'Member #1029',
    tenure: '2 years',
    submittedDate: '2026-04-06',
    status: 'in_review',
    purpose: 'Car repair — commute to work',
    amount: 650,
    urgency: 'low',
    type: 'qard_hassan',
    algorithmConfidence: 71,
    recommendation: 'Qard hassan with 6-month repayment',
    eligibilityChecks: ['Employment verified', 'Repayment capacity moderate', 'No prior loans outstanding'],
  },
  {
    id: 'wc-1020',
    anonymizedName: 'Member #1020',
    tenure: '5 years',
    submittedDate: '2026-03-28',
    status: 'resolved',
    purpose: 'Emergency rent assistance',
    amount: 900,
    urgency: 'high',
    type: 'zakat',
    algorithmConfidence: 95,
    recommendation: 'Zakat distribution approved',
    eligibilityChecks: ['Income below nisab threshold', 'Active congregation member (5 yrs)', 'Immediate need verified'],
    resolvedDate: '2026-04-02',
    fundingSource: 'Zakat pool',
    outcome: 'Rent paid — tenant retained housing',
    daysToResolve: 5,
  },
  {
    id: 'wc-1015',
    anonymizedName: 'Member #1015',
    tenure: '3 years',
    submittedDate: '2026-03-20',
    status: 'resolved',
    purpose: 'Childcare support',
    amount: 320,
    urgency: 'medium',
    type: 'sadaqah',
    algorithmConfidence: 80,
    recommendation: 'Sadaqah provision approved',
    eligibilityChecks: ['Single parent status', 'Active congregation member', 'Short-term need'],
    resolvedDate: '2026-03-25',
    fundingSource: 'Sadaqah fund',
    outcome: 'Childcare secured for 2 months',
    daysToResolve: 5,
  },
  {
    id: 'wc-1010',
    anonymizedName: 'Member #1010',
    tenure: '2 years',
    submittedDate: '2026-03-12',
    status: 'resolved',
    purpose: 'Medical bills — prescription',
    amount: 180,
    urgency: 'low',
    type: 'sadaqah',
    algorithmConfidence: 75,
    recommendation: 'Sadaqah provision approved',
    eligibilityChecks: ['Medical need verified', 'Congregation member'],
    resolvedDate: '2026-03-15',
    fundingSource: 'Sadaqah fund',
    outcome: 'Prescription costs covered',
    daysToResolve: 3,
  },
  {
    id: 'wc-1005',
    anonymizedName: 'Member #1005',
    tenure: '4 years',
    submittedDate: '2026-03-01',
    status: 'resolved',
    purpose: 'Tuition installment',
    amount: 1400,
    urgency: 'medium',
    type: 'qard_hassan',
    algorithmConfidence: 88,
    recommendation: 'Qard hassan disbursed',
    eligibilityChecks: ['Student status verified', 'Repayment plan agreed', 'Circle-backed'],
    resolvedDate: '2026-03-08',
    fundingSource: 'MSA Graduate Circle',
    outcome: 'Loan disbursed — repayment in progress',
    daysToResolve: 7,
  },
  {
    id: 'wc-1001',
    anonymizedName: 'Member #1001',
    tenure: '1 year',
    submittedDate: '2026-02-20',
    status: 'resolved',
    purpose: 'Utilities — winter heating',
    amount: 240,
    urgency: 'high',
    type: 'zakat',
    algorithmConfidence: 90,
    recommendation: 'Zakat distribution approved',
    eligibilityChecks: ['Income below nisab', 'Immediate need', 'Winter hardship'],
    resolvedDate: '2026-02-23',
    fundingSource: 'Zakat pool',
    outcome: 'Heating bill paid — family safe',
    daysToResolve: 3,
  },
]

/* ------------------------------------------------------------------ */
/*  Type color mapping                                                */
/* ------------------------------------------------------------------ */
const TYPE_COLORS = {
  zakat: '#F59E0B',
  qard_hassan: '#14B8A6',
  sadaqah: '#22C55E',
}

const TYPE_LABELS = {
  zakat: 'Zakat',
  qard_hassan: 'Qard Hassan',
  sadaqah: 'Sadaqah',
}

const URGENCY_STYLES = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Urgent' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Medium' },
  low: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Low' },
}

const COLUMN_CONFIG = {
  incoming: { title: 'INCOMING', borderColor: '#F59E0B' },
  in_review: { title: 'IN REVIEW', borderColor: '#EAB308' },
  resolved: { title: 'RESOLVED', borderColor: '#14B8A6' },
}

/* ------------------------------------------------------------------ */
/*  Case Card                                                         */
/* ------------------------------------------------------------------ */
function CaseCard({ caseData, onClick }) {
  const typeColor = TYPE_COLORS[caseData.type] || '#14B8A6'
  const urgency = URGENCY_STYLES[caseData.urgency] || URGENCY_STYLES.low

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      onClick={() => onClick(caseData)}
      style={{
        background: 'rgba(22, 22, 31, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(240, 237, 232, 0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'box-shadow 0.2s',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
    >
      <div style={{ display: 'flex' }}>
        {/* Left accent bar */}
        <div style={{
          width: 4, alignSelf: 'stretch', background: typeColor, flexShrink: 0,
        }} />

        <div style={{ flex: 1, padding: '14px 14px 12px' }}>
          {/* Purpose + amount */}
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif", marginBottom: 6, lineHeight: 1.3,
          }}>
            {caseData.purpose}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
              fontSize: 18, color: typeColor,
            }}>
              ${caseData.amount.toLocaleString()}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: urgency.bg, color: urgency.color,
              fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {urgency.label}
            </span>
          </div>

          {/* Algorithm confidence bar */}
          <div style={{
            height: 3, borderRadius: 2, background: 'var(--bg-overlay)',
            marginBottom: 10, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${caseData.algorithmConfidence}%`,
              background: caseData.algorithmConfidence >= 85 ? '#22C55E'
                : caseData.algorithmConfidence >= 70 ? '#F59E0B' : '#EF4444',
              transition: 'width 0.6s ease',
            }} />
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontSize: 11, color: typeColor, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Review case <ChevronRight size={12} />
            </span>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: 2,
              }}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Kanban Column                                                     */
/* ------------------------------------------------------------------ */
function KanbanColumn({ status, cases, onCardClick }) {
  const config = COLUMN_CONFIG[status]
  return (
    <div style={{
      flex: '1 1 280px', minWidth: 260,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(22, 22, 31, 0.4)', borderRadius: 16, padding: '16px 12px',
    }}>
      {/* Column header */}
      <div style={{
        borderTop: `3px solid ${config.borderColor}`,
        borderRadius: '3px 3px 0 0',
        padding: '14px 0 10px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 1,
          color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
        }}>
          {config.title}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
          background: 'var(--bg-overlay)', color: 'var(--text-tertiary)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {cases.length}
        </span>
      </div>

      {/* Scrollable card list */}
      <div style={{
        flex: 1, maxHeight: 440, overflowY: 'auto', scrollbarWidth: 'thin',
        paddingRight: 4,
      }}>
        <AnimatePresence>
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c} onClick={onCardClick} />
          ))}
        </AnimatePresence>
        {cases.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            fontSize: 13, color: 'var(--text-tertiary)',
            fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic',
          }}>
            No cases
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Case Detail Drawer                                                */
/* ------------------------------------------------------------------ */
function CaseDetailDrawer({ caseData, onClose, onAction }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const [amount, setAmount] = useState(caseData?.amount || 0)
  const [notes, setNotes] = useState('')

  if (!caseData) return null

  const typeColor = TYPE_COLORS[caseData.type] || '#14B8A6'

  const handleSubmit = () => {
    if (!selectedAction) return
    onAction(caseData.id, selectedAction, amount, notes)
    setSelectedAction(null)
    setNotes('')
  }

  const actions = [
    { key: 'approve_zakat', label: 'Approve zakat distribution', color: '#F59E0B', icon: Scale },
    { key: 'refer_qard', label: 'Refer to qard hassan', color: '#14B8A6', icon: Handshake },
    { key: 'provide_sadaqah', label: 'Provide sadaqah', color: '#22C55E', icon: Gift },
    { key: 'request_info', label: 'Request more info', color: 'transparent', icon: MessageSquare, ghost: true },
  ]

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: 'rgba(22, 22, 31, 0.85)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(240, 237, 232, 0.08)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        zIndex: 1000, overflowY: 'auto', padding: '24px 20px',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-tertiary)', padding: 4,
      }}>
        <X size={20} />
      </button>

      {/* Case info header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: typeColor,
          fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase',
          letterSpacing: 0.8, marginBottom: 6,
        }}>
          {TYPE_LABELS[caseData.type]}
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: 24, color: 'var(--text-primary)', margin: 0,
        }}>
          {caseData.anonymizedName}
        </h2>
      </div>

      {/* Case details */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px',
        marginBottom: 20,
      }}>
        {[
          { label: 'Tenure', value: caseData.tenure },
          { label: 'Submitted', value: new Date(caseData.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { label: 'Purpose', value: caseData.purpose },
          { label: 'Amount', value: `$${caseData.amount.toLocaleString()}` },
        ].map((item, i) => (
          <div key={i}>
            <div style={{
              fontSize: 11, color: 'var(--text-tertiary)',
              fontFamily: "'DM Sans', sans-serif", marginBottom: 2,
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm recommendation card */}
      <div style={{
        border: '1px solid rgba(212, 168, 67, 0.15)',
        borderRadius: 12, padding: '16px 14px', marginBottom: 20,
        background: 'rgba(234,179,8,0.04)',
        boxShadow: '0 0 30px rgba(212, 168, 67, 0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <Shield size={16} style={{ color: '#EAB308' }} />
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#EAB308',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Algorithm Recommendation
          </span>
        </div>

        <div style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
          fontFamily: "'DM Sans', sans-serif", marginBottom: 8,
        }}>
          {caseData.recommendation}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <span style={{
            fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
          }}>
            Confidence
          </span>
          <div style={{
            flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-overlay)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${caseData.algorithmConfidence}%`,
              background: caseData.algorithmConfidence >= 85 ? '#22C55E' : '#F59E0B',
            }} />
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {caseData.algorithmConfidence}%
          </span>
        </div>

        {/* Eligibility checks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {caseData.eligibilityChecks.map((check, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--text-secondary)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <CheckCircle2 size={13} style={{ color: '#22C55E', flexShrink: 0 }} />
              {check}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16,
      }}>
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => setSelectedAction(action.key === selectedAction ? null : action.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              border: action.ghost
                ? '1px solid var(--border-default)'
                : selectedAction === action.key
                  ? `2px solid ${action.color}`
                  : '1px solid transparent',
              background: action.ghost
                ? 'transparent'
                : selectedAction === action.key
                  ? `${action.color}20`
                  : `${action.color}12`,
              color: action.ghost
                ? 'var(--text-secondary)'
                : action.color,
              transition: 'all 0.2s',
            }}
          >
            <action.icon size={16} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Amount + notes on action selection */}
      <AnimatePresence>
        {selectedAction && selectedAction !== 'request_info' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginBottom: 12 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: "'DM Sans', sans-serif", display: 'block', marginBottom: 4,
              }}>
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: "'DM Sans', sans-serif", display: 'block', marginBottom: 4,
              }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes for this decision..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)', color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      {selectedAction && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 10,
            border: 'none', cursor: 'pointer',
            background: 'var(--teal-mid)', color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.2s',
          }}
        >
          Submit Decision
        </motion.button>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Welfare Ledger Table                                               */
/* ------------------------------------------------------------------ */
function WelfareLedger({ resolvedCases }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{
        ...styles.card,
        background: 'rgba(22, 22, 31, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(240, 237, 232, 0.06)',
        borderRadius: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FileText size={18} style={{ color: 'var(--teal-light)' }} />
        <h2 style={styles.sectionTitle}>Welfare Ledger</h2>
        <span style={{
          fontSize: 12, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
          marginLeft: 'auto', fontStyle: 'italic',
        }}>
          All entries anonymized
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <thead>
            <tr>
              {['Date', 'Type', 'Amount', 'Funding Source', 'Outcome', 'Days'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 12px',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
                  borderBottom: '1px solid var(--border-default)',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resolvedCases.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(c.resolvedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: `${TYPE_COLORS[c.type]}15`,
                    color: TYPE_COLORS[c.type],
                  }}>
                    {TYPE_LABELS[c.type]}
                  </span>
                </td>
                <td style={{
                  padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)',
                }}>
                  ${c.amount.toLocaleString()}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {c.fundingSource}
                </td>
                <td style={{
                  padding: '10px 12px', color: 'var(--text-secondary)',
                  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {c.outcome}
                </td>
                <td style={{
                  padding: '10px 12px', fontWeight: 600,
                  color: c.daysToResolve <= 3 ? '#22C55E' : c.daysToResolve <= 7 ? '#F59E0B' : '#EF4444',
                }}>
                  {c.daysToResolve}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Welfare Cases Screen                                         */
/* ------------------------------------------------------------------ */
export default function WelfareCases() {
  const [cases, setCases] = useState(INITIAL_CASES)
  const [selectedCase, setSelectedCase] = useState(null)

  const incoming = useMemo(() => cases.filter(c => c.status === 'incoming'), [cases])
  const inReview = useMemo(() => cases.filter(c => c.status === 'in_review'), [cases])
  const resolved = useMemo(() => cases.filter(c => c.status === 'resolved'), [cases])

  const handleCardClick = useCallback((caseData) => {
    setSelectedCase(caseData)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setSelectedCase(null)
  }, [])

  const handleAction = useCallback((caseId, action, amount, notes) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c

      if (action === 'request_info') {
        return { ...c, status: 'in_review' }
      }

      const fundingSource = action === 'approve_zakat' ? 'Zakat pool'
        : action === 'refer_qard' ? 'Qard Hassan Circle'
        : 'Sadaqah fund'

      return {
        ...c,
        status: 'resolved',
        amount,
        resolvedDate: new Date().toISOString().split('T')[0],
        fundingSource,
        outcome: `${action.replace(/_/g, ' ')} — $${amount} processed`,
        daysToResolve: Math.ceil(
          (Date.now() - new Date(c.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    }))
    setSelectedCase(null)
  }, [])

  return (
    <div style={styles.page}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 8 }}
      >
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: 28, color: 'var(--text-primary)', margin: '0 0 4px',
        }}>
          Community Welfare
        </h1>
        <p style={{
          fontSize: 14, color: 'var(--text-tertiary)', fontFamily: "'DM Sans', sans-serif",
          fontStyle: 'italic', margin: 0,
        }}>
          Every need that reaches this desk is an amanah.
        </p>
      </motion.div>

      {/* Kanban Board */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'flex', gap: 16, flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <KanbanColumn status="incoming" cases={incoming} onCardClick={handleCardClick} />
        <KanbanColumn status="in_review" cases={inReview} onCardClick={handleCardClick} />
        <KanbanColumn status="resolved" cases={resolved} onCardClick={handleCardClick} />
      </motion.section>

      {/* Welfare Ledger */}
      <WelfareLedger resolvedCases={resolved} />

      {/* Case Detail Drawer */}
      <AnimatePresence>
        {selectedCase && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.3)', zIndex: 999,
              }}
            />
            <CaseDetailDrawer
              caseData={selectedCase}
              onClose={handleCloseDrawer}
              onAction={handleAction}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    padding: '24px 16px',
    maxWidth: 960,
    margin: '0 auto',
  },

  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 16,
    padding: '24px 20px',
    boxShadow: 'var(--shadow-card)',
  },

  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 20,
    color: 'var(--text-primary)',
    margin: 0,
  },
}
