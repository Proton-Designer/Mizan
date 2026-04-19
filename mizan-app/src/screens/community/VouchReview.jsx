import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { useCommunity } from '../../context/CommunityContext'
import Card from '../../components/ui/Card'

// ---------------------------------------------------------------------------
// Applicant data (keyed by route param)
// ---------------------------------------------------------------------------

const APPLICANT_DATA = {
  'vouch-bilal': {
    name: 'Bilal Mansour',
    daysAgo: 2,
    expiresIn: '48h',
    narrative:
      'Assalamu alaikum. I am a graduate student at UT Austin and my tuition payment is due next month. I have been working part-time but my hours were cut this semester. I am asking the community for a qard hassan of $1,200 to cover my remaining tuition balance. I will repay within 5 months insha\'Allah once my summer internship begins. My family is supportive but cannot help financially right now. JazakAllah khair for considering my request.',
    request: '$1,200',
    purpose: 'Tuition (Spring semester balance)',
    income: '$1,800/mo (part-time research assistant)',
    household: 'Single, no dependents',
    needScore: 68,
    monthlyPayment: '$240',
    dti: '47%',
    dtiLabel: 'Manageable',
    communityYears: 4,
    listed: true,
    priorLoans: 0,
    inCircle: false,
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommunityVouchReview() {
  const { applicantId } = useParams()
  const navigate = useNavigate()
  const { community, updateCommunity } = useCommunity()

  const applicant = APPLICANT_DATA[applicantId]

  // Decision state
  const [selectedDecision, setSelectedDecision] = useState(null)
  const [partialNote, setPartialNote] = useState('')
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // castVouch — update community state, navigate back
  function castVouch(type) {
    // Remove this applicant from pendingActions
    const updated = (community.pendingActions || []).filter(
      (a) => !(a.type === 'vouch' && a.label === applicant?.name)
    )
    updateCommunity({ pendingActions: updated })
    setSubmitted(true)
    setTimeout(() => navigate('/community/vouching'), 600)
  }

  if (!applicant) {
    return (
      <div style={{ padding: '48px 24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        <p>Applicant not found.</p>
        <button
          onClick={() => navigate('/community/vouching')}
          style={{ ...styles.backLink, marginTop: 16 }}
        >
          &larr; Back to vouch queue
        </button>
      </div>
    )
  }

  // Success flash
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.successWrap}
      >
        <CheckCircle size={48} color="var(--status-green)" />
        <p style={styles.successText}>Vouch recorded. Returning to queue...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={styles.container}
    >
      {/* Back link */}
      <button onClick={() => navigate('/community/vouching')} style={styles.backLink}>
        <ArrowLeft size={16} /> Back to vouch queue
      </button>

      {/* Header */}
      <div style={styles.headerRow}>
        <h1 style={styles.header}>Vouch Request &mdash; {applicant.name}</h1>
        <span style={styles.timer}>
          &#9201; {applicant.daysAgo} days ago, expires in {applicant.expiresIn}
        </span>
      </div>

      {/* ── Two-column layout ── */}
      <div style={styles.twoCol}>
        {/* Left column */}
        <div style={styles.colLeft}>
          {/* Narrative */}
          <div style={styles.sectionLabel}>WHAT THEY SAID:</div>
          <div style={styles.narrativeBox}>
            <p style={styles.narrativeText}>{applicant.narrative}</p>
          </div>

          {/* Extracted details */}
          <div style={{ ...styles.sectionLabel, marginTop: 24 }}>EXTRACTED DETAILS:</div>
          <table style={styles.kvTable}>
            <tbody>
              <KVRow label="Request" value={applicant.request} />
              <KVRow label="Purpose" value={applicant.purpose} />
              <KVRow label="Income" value={applicant.income} />
              <KVRow label="Household" value={applicant.household} />
              <tr style={styles.kvRow}>
                <td style={styles.kvLabel}>Need Score</td>
                <td style={styles.kvValue}>
                  <div style={styles.scoreWrap}>
                    <span>{applicant.needScore}/100</span>
                    <div style={styles.scoreBarTrack}>
                      <div
                        style={{
                          ...styles.scoreBarFill,
                          width: `${applicant.needScore}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <KVRow label="Monthly Payment" value={applicant.monthlyPayment} />
              <tr style={styles.kvRow}>
                <td style={styles.kvLabel}>DTI</td>
                <td style={styles.kvValue}>
                  {applicant.dti}{' '}
                  <span style={styles.dtiTag}>{applicant.dtiLabel}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={styles.colRight}>
          <div style={styles.sectionLabel}>COMMUNITY STANDING:</div>
          <Card style={styles.standingCard}>
            <StandingRow
              label="Member for"
              value={`${applicant.communityYears} years`}
              check
            />
            <StandingRow
              label="Listed in directory"
              value={applicant.listed ? 'Yes' : 'No'}
              check={applicant.listed}
            />
            <StandingRow
              label="Prior loans"
              value={String(applicant.priorLoans)}
              check={false}
              neutral
            />
            <StandingRow
              label="In a circle"
              value={applicant.inCircle ? 'Yes' : 'No'}
              check={false}
              neutral
            />
          </Card>

          <div style={styles.encourageBox}>
            <p style={styles.encourageText}>
              First-time borrowers have as much opportunity to demonstrate
              trustworthiness as anyone. Your vouch helps them build a track
              record within the community.
            </p>
          </div>
        </div>
      </div>

      {/* ── Vouch Decision (full width, 2x2 grid) ── */}
      <div style={{ ...styles.sectionLabel, marginTop: 32 }}>VOUCH DECISION:</div>
      <div style={styles.decisionGrid}>
        {/* 1. Full Vouch */}
        <Card
          style={{
            ...styles.decisionCard,
            borderColor: selectedDecision === 'full' ? 'var(--teal-mid)' : 'var(--border-subtle)',
            background: selectedDecision === 'full' ? 'rgba(74,173,164,0.08)' : 'var(--bg-surface)',
          }}
          onClick={() => setSelectedDecision('full')}
        >
          <div style={styles.decisionHeader}>
            <CheckCircle size={22} color="var(--teal-mid)" />
            <span style={{ ...styles.decisionTitle, color: 'var(--teal-mid)' }}>
              Full Vouch
            </span>
          </div>
          <p style={styles.decisionDesc}>I know this person and trust them</p>
          {selectedDecision === 'full' && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => { e.stopPropagation(); castVouch('full') }}
              style={styles.submitTeal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Submit vouch &rarr;
            </motion.button>
          )}
        </Card>

        {/* 2. Partial Vouch */}
        <Card
          style={{
            ...styles.decisionCard,
            borderColor: selectedDecision === 'partial' ? 'var(--status-yellow)' : 'var(--border-subtle)',
            background: selectedDecision === 'partial' ? 'rgba(251,191,36,0.08)' : 'var(--bg-surface)',
          }}
          onClick={() => setSelectedDecision('partial')}
        >
          <div style={styles.decisionHeader}>
            <AlertCircle size={22} color="var(--status-yellow)" />
            <span style={{ ...styles.decisionTitle, color: 'var(--status-yellow)' }}>
              Partial Vouch
            </span>
          </div>
          <p style={styles.decisionDesc}>I have some knowledge but reservations</p>
          <AnimatePresence>
            {selectedDecision === 'partial' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <textarea
                  value={partialNote}
                  onChange={(e) => setPartialNote(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add a confidential note (optional)..."
                  style={styles.textarea}
                  rows={3}
                />
                <motion.button
                  onClick={(e) => { e.stopPropagation(); castVouch('partial') }}
                  style={styles.submitYellow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Submit partial vouch &rarr;
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* 3. Decline */}
        <Card
          style={{
            ...styles.decisionCard,
            borderColor: selectedDecision === 'decline' ? 'var(--status-red)' : 'var(--border-subtle)',
            background: selectedDecision === 'decline' ? 'rgba(248,113,113,0.08)' : 'var(--bg-surface)',
          }}
          onClick={() => { setSelectedDecision('decline'); setShowDeclineConfirm(false) }}
        >
          <div style={styles.decisionHeader}>
            <XCircle size={22} color="var(--status-red)" />
            <span style={{ ...styles.decisionTitle, color: 'var(--status-red)' }}>
              Decline
            </span>
          </div>
          <p style={styles.decisionDesc}>I cannot vouch for this person</p>
          {selectedDecision === 'decline' && !showDeclineConfirm && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => { e.stopPropagation(); setShowDeclineConfirm(true) }}
              style={styles.submitRed}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Decline vouch
            </motion.button>
          )}
          {selectedDecision === 'decline' && showDeclineConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.confirmBox}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={styles.confirmText}>
                Are you sure? This cannot be undone.
              </p>
              <motion.button
                onClick={() => castVouch('decline')}
                style={styles.submitRedSolid}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Confirm decline
              </motion.button>
            </motion.div>
          )}
        </Card>

        {/* 4. Need More Time */}
        <Card
          style={{
            ...styles.decisionCard,
            borderColor: selectedDecision === 'hold' ? 'var(--text-tertiary)' : 'var(--border-subtle)',
            background: selectedDecision === 'hold' ? 'rgba(107,103,96,0.08)' : 'var(--bg-surface)',
          }}
          onClick={() => setSelectedDecision('hold')}
        >
          <div style={styles.decisionHeader}>
            <Clock size={22} color="var(--text-tertiary)" />
            <span style={{ ...styles.decisionTitle, color: 'var(--text-secondary)' }}>
              Need More Time
            </span>
          </div>
          <p style={styles.decisionDesc}>I need additional time to decide</p>
          {selectedDecision === 'hold' && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => { e.stopPropagation(); castVouch('hold') }}
              style={styles.submitGray}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Request 48-hour hold &rarr;
            </motion.button>
          )}
        </Card>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KVRow({ label, value }) {
  return (
    <tr style={styles.kvRow}>
      <td style={styles.kvLabel}>{label}</td>
      <td style={styles.kvValue}>{value}</td>
    </tr>
  )
}

function StandingRow({ label, value, check, neutral }) {
  return (
    <div style={styles.standingRow}>
      <span style={styles.standingLabel}>{label}</span>
      <span style={styles.standingValue}>
        {value}
        {check && <span style={{ color: 'var(--status-green)', marginLeft: 6 }}>&#10003;</span>}
        {neutral && !check && <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>&mdash;</span>}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '32px 24px 64px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: 'var(--teal-light)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 16,
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 28,
  },
  header: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 26,
    color: 'var(--text-primary)',
    margin: 0,
  },
  timer: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--status-yellow)',
  },

  /* Two-column */
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  colLeft: {},
  colRight: {},

  /* Section labels */
  sectionLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  },

  /* Narrative */
  narrativeBox: {
    border: '1px solid var(--border-default)',
    borderRadius: 12,
    padding: 16,
    background: 'rgba(22, 22, 31, 0.6)',
    backdropFilter: 'blur(8px)',
  },
  narrativeText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    margin: 0,
  },

  /* KV table */
  kvTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  kvRow: {
    borderBottom: '1px solid var(--border-subtle)',
  },
  kvLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: 'var(--text-tertiary)',
    padding: '8px 8px 8px 0',
    verticalAlign: 'top',
    width: '40%',
  },
  kvValue: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-primary)',
    padding: '8px 0',
    verticalAlign: 'top',
  },

  /* Need score bar */
  scoreWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'var(--bg-overlay)',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
    background: 'var(--teal-mid)',
  },
  dtiTag: {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 999,
    background: 'var(--teal-glow)',
    color: 'var(--teal-light)',
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 6,
  },

  /* Community standing */
  standingCard: {
    padding: 0,
  },
  standingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  standingLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  standingValue: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  encourageBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
  },
  encourageText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--text-tertiary)',
    margin: 0,
  },

  /* Decision grid */
  decisionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  decisionCard: {
    cursor: 'pointer',
    background: 'rgba(22, 22, 31, 0.55)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(240, 237, 232, 0.06)',
    transition: 'all 200ms ease',
  },
  decisionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  decisionTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    fontWeight: 700,
  },
  decisionDesc: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--text-tertiary)',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },

  /* Buttons */
  submitTeal: {
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--teal-mid)',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  submitYellow: {
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--status-yellow)',
    color: 'var(--text-inverse)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  submitRed: {
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: '1.5px solid var(--status-red)',
    background: 'transparent',
    color: 'var(--status-red)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  submitRedSolid: {
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--status-red)',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  submitGray: {
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: '1.5px solid var(--border-strong)',
    background: 'var(--bg-overlay)',
    color: 'var(--text-secondary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },

  /* Textarea */
  textarea: {
    width: '100%',
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-deep)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
  },

  /* Confirm */
  confirmBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 6,
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
  },
  confirmText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: 'var(--status-red)',
    margin: 0,
  },

  /* Success */
  successWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '120px 24px',
    textAlign: 'center',
  },
  successText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    color: 'var(--text-primary)',
    margin: 0,
  },
}
