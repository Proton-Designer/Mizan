import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Copy, Send, Shield, Mail } from 'lucide-react'
import { useCommunity } from '../../context/CommunityContext'

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

const CIRCLE_TYPES = [
  { id: 'general', label: 'General', desc: 'Open to all community members' },
  { id: 'sisters', label: 'Sisters-only', desc: 'Women-only lending circle' },
  { id: 'youth', label: 'Youth', desc: 'For members under 30' },
  { id: 'custom', label: 'Custom', desc: 'Define your own eligibility' },
]

const PLEDGE_OPTIONS = [20, 50, 100, 200]

const APPROVAL_TIERS = [
  { id: 'micro', label: 'Micro (up to $200)', options: ['Auto-approve', 'Circle vote'], lockedOption: null },
  { id: 'standard', label: 'Standard ($200-$800)', options: ['Majority (>50%)', 'Supermajority (>66%)'], lockedOption: null },
  { id: 'major', label: 'Major ($800+)', options: ['Supermajority (>66%)'], lockedOption: 'Supermajority (>66%)' },
]

const VOTING_WINDOWS = ['24 hours', '48 hours', '72 hours', '1 week']

const DEMO_INVITEES = [
  { name: 'Omar Bashir', email: 'omar.bashir@email.com' },
  { name: 'Fatima Al-Hassan', email: 'fatima.alhassan@email.com' },
  { name: 'Ibrahim Torres', email: 'ibrahim.torres@email.com' },
]

/* ---------------------------------------------------------------------------
   Step Progress Bar
   --------------------------------------------------------------------------- */

function StepProgress({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: i <= current ? 'var(--teal-mid)' : 'rgba(255,255,255,0.08)',
          transition: 'background 0.3s ease',
        }} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Step 1: Name, Purpose, Type
   --------------------------------------------------------------------------- */

function Step1({ data, onChange }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={styles.stepTitle}>Circle Identity</h2>
      <p style={styles.stepSubtitle}>Give your circle a name and define its purpose.</p>

      <label style={styles.label}>Circle Name</label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g. MSA Graduate Fund"
        style={styles.input}
      />

      <label style={styles.label}>Purpose / Description</label>
      <textarea
        value={data.purpose}
        onChange={(e) => onChange({ purpose: e.target.value })}
        placeholder="Describe the mission and goals of this circle..."
        rows={3}
        style={{ ...styles.input, height: 'auto', resize: 'vertical', minHeight: 80 }}
      />

      <label style={styles.label}>Circle Type</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CIRCLE_TYPES.map((t) => {
          const selected = data.type === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange({ type: t.id })}
              style={{
                padding: '16px',
                background: selected ? 'rgba(74, 173, 164, 0.1)' : 'var(--bg-surface)',
                border: selected ? '2px solid var(--teal-mid)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: selected ? 'var(--teal-light)' : 'var(--text-primary)',
                marginBottom: 4,
              }}>
                {t.label}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: 'var(--text-tertiary)',
              }}>
                {t.desc}
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 2: Financial Rules
   --------------------------------------------------------------------------- */

function Step2({ data, onChange }) {
  const [customPledge, setCustomPledge] = useState('')

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={styles.stepTitle}>Financial Structure</h2>
      <p style={styles.stepSubtitle}>Set the rules for pledging and pool management.</p>

      {/* Member Cap Slider */}
      <label style={styles.label}>
        Member Cap: <strong style={{ color: 'var(--teal-light)' }}>{data.memberCap}</strong>
      </label>
      <input
        type="range"
        min={5}
        max={20}
        value={data.memberCap}
        onChange={(e) => onChange({ memberCap: parseInt(e.target.value) })}
        style={{ width: '100%', accentColor: 'var(--teal-mid)', marginBottom: 8 }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: 'var(--text-tertiary)',
        marginBottom: 24,
      }}>
        <span>5</span>
        <span>20</span>
      </div>

      {/* Monthly Pledge */}
      <label style={styles.label}>Monthly Pledge</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {PLEDGE_OPTIONS.map((amt) => {
          const selected = data.monthlyPledge === amt
          return (
            <button
              key={amt}
              onClick={() => onChange({ monthlyPledge: amt })}
              style={{
                padding: '10px 20px',
                background: selected ? 'var(--teal-mid)' : 'var(--bg-surface)',
                color: selected ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: selected ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ${amt}
            </button>
          )
        })}
        <input
          type="number"
          placeholder="Custom"
          value={customPledge}
          onChange={(e) => {
            setCustomPledge(e.target.value)
            if (e.target.value) onChange({ monthlyPledge: parseInt(e.target.value) || 0 })
          }}
          style={{ ...styles.input, width: 90, marginBottom: 0, textAlign: 'center' }}
        />
      </div>

      {/* Min Pool */}
      <label style={styles.label}>Minimum Pool Before Lending ($)</label>
      <input
        type="number"
        value={data.minPool}
        onChange={(e) => onChange({ minPool: parseInt(e.target.value) || 0 })}
        placeholder="e.g. 500"
        style={{ ...styles.input, width: 180 }}
      />

      {/* Max Loan */}
      <label style={styles.label}>Maximum Single Loan</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {['25% of pool', '50% of pool', '75% of pool', 'No limit'].map((opt) => {
          const selected = data.maxLoan === opt
          return (
            <label
              key={opt}
              onClick={() => onChange({ maxLoan: opt })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: selected ? '2px solid var(--teal-mid)' : '2px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}>
                {selected && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal-mid)' }} />
                )}
              </div>
              {opt}
            </label>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 3: Approval Rules
   --------------------------------------------------------------------------- */

function Step3({ data, onChange }) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={styles.stepTitle}>Approval & Governance</h2>
      <p style={styles.stepSubtitle}>Define how loan requests are evaluated at each tier.</p>

      {APPROVAL_TIERS.map((tier) => {
        const currentValue = data.approvalRules[tier.id]
        const isLocked = tier.lockedOption !== null

        return (
          <div key={tier.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Shield size={16} style={{ color: 'var(--teal-mid)' }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {tier.label}
              </span>
              {isLocked && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'var(--text-tertiary)',
                  background: 'rgba(255,255,255,0.06)',
                  marginLeft: 'auto',
                }}>
                  LOCKED
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {tier.options.map((opt) => {
                const selected = currentValue === opt
                return (
                  <button
                    key={opt}
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        onChange({ approvalRules: { ...data.approvalRules, [tier.id]: opt } })
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: selected ? 'rgba(74, 173, 164, 0.12)' : 'transparent',
                      border: selected ? '1px solid var(--teal-mid)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: selected ? 'var(--teal-light)' : 'var(--text-secondary)',
                      cursor: isLocked ? 'default' : 'pointer',
                      opacity: isLocked && !selected ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Voting Window */}
      <label style={styles.label}>Voting Window</label>
      <select
        value={data.votingWindow}
        onChange={(e) => onChange({ votingWindow: e.target.value })}
        style={{ ...styles.input, appearance: 'auto', cursor: 'pointer', width: 200 }}
      >
        {VOTING_WINDOWS.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>

      {/* Default Conversion */}
      <label style={{ ...styles.label, marginTop: 20 }}>Default Sadaqah Conversion</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {['Allow automatic conversion', 'Require circle vote for conversion'].map((opt) => {
          const selected = data.defaultConversion === opt
          return (
            <label
              key={opt}
              onClick={() => onChange({ defaultConversion: opt })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: selected ? '2px solid var(--teal-mid)' : '2px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selected && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal-mid)' }} />
                )}
              </div>
              {opt}
            </label>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 4: Invite Members
   --------------------------------------------------------------------------- */

function Step4({ data, onChange }) {
  const [copied, setCopied] = useState(false)
  const shareLink = 'https://mizan.app/join/msa-graduate-2026'

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareLink])

  const updateInvitee = (index, field, value) => {
    const updated = [...data.invitees]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ invitees: updated })
  }

  const addInvitee = () => {
    onChange({ invitees: [...data.invitees, { name: '', email: '' }] })
  }

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 style={styles.stepTitle}>Invite Members</h2>
      <p style={styles.stepSubtitle}>Add founding members to your circle.</p>

      {data.invitees.map((inv, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            {i === 0 && <label style={{ ...styles.label, fontSize: 11 }}>Name</label>}
            <input
              type="text"
              value={inv.name}
              onChange={(e) => updateInvitee(i, 'name', e.target.value)}
              placeholder="Full name"
              style={{ ...styles.input, marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            {i === 0 && <label style={{ ...styles.label, fontSize: 11 }}>Email</label>}
            <input
              type="email"
              value={inv.email}
              onChange={(e) => updateInvitee(i, 'email', e.target.value)}
              placeholder="email@example.com"
              style={{ ...styles.input, marginBottom: 0 }}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addInvitee}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--teal-mid)',
          padding: '8px 0',
          marginBottom: 28,
        }}
      >
        + Add another member
      </button>

      {/* Share Link */}
      <label style={styles.label}>Or share an invite link</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <div style={{
          flex: 1,
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {shareLink}
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: '12px 20px',
            background: copied ? '#10B981' : 'var(--teal-mid)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>

      {/* Invitation Preview */}
      <label style={styles.label}>Invitation Preview</label>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Mail size={16} style={{ color: 'var(--teal-mid)' }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Email Preview
          </span>
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'var(--text-primary)',
          fontWeight: 600,
          marginBottom: 8,
        }}>
          You have been invited to join "{data.name || 'Unnamed Circle'}"
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          Assalamu alaikum! You have been invited to join a Qard Hassan lending circle
          on Mizan. This circle pools monthly contributions from members to provide
          interest-free loans to those in need. Click the link below to accept your
          invitation and begin contributing.
        </p>
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Main Wizard
   --------------------------------------------------------------------------- */

const INITIAL_DATA = {
  name: '',
  purpose: '',
  type: 'general',
  memberCap: 12,
  monthlyPledge: 50,
  minPool: 500,
  maxLoan: '50% of pool',
  approvalRules: {
    micro: 'Auto-approve',
    standard: 'Majority (>50%)',
    major: 'Supermajority (>66%)',
  },
  votingWindow: '48 hours',
  defaultConversion: 'Require circle vote for conversion',
  invitees: [...DEMO_INVITEES],
}

export default function CommunityCircleNew() {
  const navigate = useNavigate()
  const { community, updateCommunity } = useCommunity()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(INITIAL_DATA)

  const onChange = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleLaunch = () => {
    updateCommunity({ circles: (community.circles || 3) + 1 })
    navigate('/community/circles')
  }

  const stepComponents = [
    <Step1 key={0} data={data} onChange={onChange} />,
    <Step2 key={1} data={data} onChange={onChange} />,
    <Step3 key={2} data={data} onChange={onChange} />,
    <Step4 key={3} data={data} onChange={onChange} />,
  ]

  const stepLabels = ['Identity', 'Finance', 'Governance', 'Invite']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ padding: '48px 24px 80px', maxWidth: 720, margin: '0 auto' }}
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

      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: '0 0 8px 0',
      }}>
        Create a New Circle
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginBottom: 12,
      }}>
        Step {step + 1} of 4: {stepLabels[step]}
      </p>

      <StepProgress current={step} total={4} />

      {/* Step Content */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '32px',
        marginBottom: 28,
        minHeight: 380,
      }}>
        <AnimatePresence mode="wait">
          {stepComponents[step]}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: step === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0.4 : 1,
            transition: 'all 0.2s',
          }}
        >
          Previous
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            style={{
              padding: '12px 28px',
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
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            style={{
              padding: '14px 32px',
              background: 'var(--teal-mid)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(74, 173, 164, 0.3)',
              transition: 'all var(--transition-base)',
            }}
          >
            <Send size={16} /> Launch Circle
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Shared Styles
   --------------------------------------------------------------------------- */

const styles = {
  stepTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
  },
  stepSubtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: 'var(--text-secondary)',
    margin: '0 0 24px 0',
  },
  label: {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    marginTop: 0,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    marginBottom: 20,
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
}
