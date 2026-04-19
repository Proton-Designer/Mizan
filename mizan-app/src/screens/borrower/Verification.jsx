import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Info, CheckCircle2, Search, Phone, Loader2 } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'
import { computeFeasibility, assignTier } from '../../utils/algorithms'
import Card from '../../components/ui/Card'
import TransitionWrapper from '../../components/shared/TransitionWrapper'

// ---------------------------------------------------------------------------
// Hardcoded mosque list for autocomplete
// ---------------------------------------------------------------------------
const MOSQUES = [
  'Islamic Center of Irving, TX',
  'Dar Al-Hijrah Islamic Center, Falls Church, VA',
  'Islamic Society of Boston Cultural Center, MA',
  'Muslim Community Association, Santa Clara, CA',
  'Islamic Center of Southern California, Los Angeles, CA',
  'ADAMS Center, Sterling, VA',
  'Islamic Foundation of Greater St. Louis, MO',
  'Masjid Al-Rahman, Orlando, FL',
  'Islamic Center of Detroit, MI',
  'East Plano Islamic Center, Plano, TX',
  'Islamic Society of North America (ISNA), Plainfield, IN',
  'Masjid Muhammad, Washington, D.C.',
  'Islamic Center of Tucson, AZ',
  'Masjid Al-Farooq, Atlanta, GA',
  'Islamic Center of Greater Cincinnati, OH',
  'Masjid Al-Huda, Brooklyn, NY',
  'Islamic Center of Naperville, IL',
  'Nueces Mosque, Austin, TX',
  'Islamic Center of San Diego, CA',
  'Valley Ranch Islamic Center, Irving, TX',
]

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
const inputStyle = {
  width: '100%',
  height: 44,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  padding: '0 14px',
  outline: 'none',
  transition: 'var(--transition-fast)',
}

const inputFocusStyle = {
  borderColor: 'var(--teal-mid)',
  boxShadow: '0 0 0 3px var(--teal-glow)',
}

const labelStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  display: 'block',
}

const chipBase = {
  height: 38,
  borderRadius: 'var(--radius-pill)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-secondary)',
  padding: '0 18px',
  transition: 'var(--transition-fast)',
}

const chipActive = {
  background: 'var(--teal-glow)',
  borderColor: 'var(--teal-mid)',
  color: 'var(--teal-light)',
}

// ---------------------------------------------------------------------------
// Input component with focus handling
// ---------------------------------------------------------------------------
function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(focused ? inputFocusStyle : {}),
        ...style,
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

// ---------------------------------------------------------------------------
// Section header with step indicator
// ---------------------------------------------------------------------------
function SectionHeader({ letter, title, complete, locked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        background: complete ? 'var(--teal-mid)' : locked ? 'var(--bg-overlay)' : 'var(--teal-glow)',
        color: complete ? '#fff' : locked ? 'var(--text-tertiary)' : 'var(--teal-light)',
        border: complete ? 'none' : `1px solid ${locked ? 'var(--border-subtle)' : 'var(--teal-deep)'}`,
      }}>
        {complete ? <CheckCircle2 size={18} /> : letter}
      </div>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 22, fontWeight: 600,
        color: locked ? 'var(--text-tertiary)' : 'var(--text-primary)',
      }}>
        {title}
      </span>
      {locked && <Lock size={14} style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Verification Screen
// ---------------------------------------------------------------------------
export default function Verification() {
  const navigate = useNavigate()
  const { setApplicationStage, setSubmittedApplication, submittedApplication } = useBorrower()

  // Section A — Identity
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [govId, setGovId] = useState('')
  const [address, setAddress] = useState('')
  const [showWhyId, setShowWhyId] = useState(false)

  // Section B — Community Vouch
  const [mosqueSearch, setMosqueSearch] = useState('')
  const [selectedMosque, setSelectedMosque] = useState('')
  const [showMosqueDropdown, setShowMosqueDropdown] = useState(false)
  const [imamName, setImamName] = useState('')
  const [imamPhone, setImamPhone] = useState('')
  const [tenure, setTenure] = useState('')
  const [useCircle, setUseCircle] = useState(false)

  // Section C — Repayment
  const [frequency, setFrequency] = useState('')
  const [startTiming, setStartTiming] = useState('')
  const [monthlyPayment, setMonthlyPayment] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)

  // --- Derived states ---
  const sectionAComplete = firstName.trim() && lastName.trim() && dob && phone && phoneVerified && govId.trim() && address.trim()

  const filteredMosques = MOSQUES.filter(m =>
    m.toLowerCase().includes(mosqueSearch.toLowerCase())
  ).slice(0, 6)

  const sectionBComplete = useCircle || (selectedMosque && imamName.trim() && imamPhone.trim())

  const app = submittedApplication || {}
  const loanAmount = app.loanAmount || 500
  const tier = assignTier(loanAmount)
  const paymentNum = parseFloat(monthlyPayment) || 0

  const feasibility = useMemo(() => {
    if (!paymentNum) return null
    const months = paymentNum > 0 ? Math.ceil(loanAmount / paymentNum) : 0
    return computeFeasibility(
      (app.grossMonthlyIncome || 2000) * 12,
      app.monthlyDebts || 1200,
      loanAmount,
      { ...tier, expectedMonths: months || tier.expectedMonths },
      app.householdSize || 3
    )
  }, [paymentNum, app, tier])

  const paymentWarning = feasibility && !feasibility.feasible
  const sectionCComplete = frequency && startTiming && paymentNum > 0

  const allComplete = sectionAComplete && sectionBComplete && sectionCComplete

  // --- Handlers ---
  const handleSendCode = () => {
    if (phone.trim()) setCodeSent(true)
  }

  const handleVerifyCode = (val) => {
    setVerifyCode(val)
    if (val.length === 6) setPhoneVerified(true)
  }

  const handleSelectMosque = (mosque) => {
    setSelectedMosque(mosque)
    setMosqueSearch(mosque)
    setShowMosqueDropdown(false)
  }

  const handleSubmit = async () => {
    if (!allComplete || submitting) return
    setSubmitting(true)

    setSubmittedApplication(prev => ({
      ...prev,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: dob,
      phone,
      phoneVerified: true,
      address,
      mosqueName: selectedMosque || 'UT Austin MSA Circle',
      imamName: imamName || prev?.imamName,
      imamPhone: imamPhone || prev?.imamPhone,
      mosqueTenure: tenure,
      repaymentFrequency: frequency,
      proposedMonthlyPayment: paymentNum,
      submittedAt: new Date().toISOString(),
    }))

    await new Promise(r => setTimeout(r, 1500))
    setApplicationStage('review')
    navigate('/borrower/review')
  }

  return (
    <TransitionWrapper>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 100px' }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36, fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Verify your identity
        </h1>
        <p className="text-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>
          Three quick steps before we can process your request.
        </p>

        {/* ================================================================ */}
        {/* SECTION A — Identity                                             */}
        {/* ================================================================ */}
        <Card style={{ marginBottom: 24 }}>
          <SectionHeader letter="A" title="Identity" complete={!!sectionAComplete} locked={false} />

          {/* Name row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First name</label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ayman" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last name</label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mohammed" />
            </div>
          </div>

          {/* DOB */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Date of birth</label>
            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>

          {/* Phone + verify */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone number</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (512) 555-0199"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSendCode}
                disabled={!phone.trim() || codeSent}
                style={{
                  ...chipBase,
                  ...(codeSent ? chipActive : {}),
                  whiteSpace: 'nowrap',
                  opacity: (!phone.trim() && !codeSent) ? 0.5 : 1,
                }}
              >
                {codeSent ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Code sent <CheckCircle2 size={14} style={{ color: 'var(--status-green)' }} />
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> Send code
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 6-digit verification */}
          <AnimatePresence>
            {codeSent && !phoneVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginBottom: 16, overflow: 'hidden' }}
              >
                <label style={labelStyle}>Enter 6-digit code</label>
                <Input
                  value={verifyCode}
                  onChange={e => handleVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ letterSpacing: 8, textAlign: 'center', fontWeight: 600 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {phoneVerified && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: 'var(--status-green)', fontSize: 13, fontWeight: 500, marginBottom: 16,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <CheckCircle2 size={16} /> Phone verified
            </div>
          )}

          {/* Government ID */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
              Government ID
              <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span
                onMouseEnter={() => setShowWhyId(true)}
                onMouseLeave={() => setShowWhyId(false)}
                style={{ position: 'relative', cursor: 'help' }}
              >
                <Info size={12} style={{ color: 'var(--teal-mid)' }} />
                <AnimatePresence>
                  {showWhyId && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', top: 20, left: -80,
                        width: 240, padding: '10px 14px',
                        background: 'var(--bg-overlay)', border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)', fontSize: 12,
                        color: 'var(--text-secondary)', zIndex: 50,
                        boxShadow: 'var(--shadow-elevated)',
                      }}
                    >
                      We verify your identity to protect the community fund from fraud. Your data is encrypted and never shared.
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            </label>
            <Input
              value={govId}
              onChange={e => setGovId(e.target.value)}
              placeholder="SSN or State ID number"
            />
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>Address</label>
            <Input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main St, Austin, TX 78701"
            />
          </div>
        </Card>

        {/* ================================================================ */}
        {/* SECTION B — Community Vouch                                      */}
        {/* ================================================================ */}
        <AnimatePresence>
          <motion.div
            initial={!sectionAComplete ? { opacity: 0.4, y: 8 } : false}
            animate={{ opacity: sectionAComplete ? 1 : 0.4, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card style={{
              marginBottom: 24,
              pointerEvents: sectionAComplete ? 'auto' : 'none',
              filter: sectionAComplete ? 'none' : 'grayscale(0.4)',
            }}>
              <SectionHeader letter="B" title="Community Vouch" complete={!!sectionBComplete} locked={!sectionAComplete} />

              {/* Mosque autocomplete */}
              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label style={labelStyle}>Mosque or Islamic Center</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute', left: 12, top: 14,
                    color: 'var(--text-tertiary)', pointerEvents: 'none',
                  }} />
                  <Input
                    value={mosqueSearch}
                    onChange={e => {
                      setMosqueSearch(e.target.value)
                      setShowMosqueDropdown(true)
                      if (!e.target.value) setSelectedMosque('')
                    }}
                    onFocus={() => setShowMosqueDropdown(true)}
                    placeholder="Search mosques..."
                    style={{ paddingLeft: 36 }}
                  />
                </div>
                <AnimatePresence>
                  {showMosqueDropdown && mosqueSearch && filteredMosques.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)', zIndex: 20,
                        maxHeight: 200, overflowY: 'auto',
                        boxShadow: 'var(--shadow-elevated)',
                      }}
                    >
                      {filteredMosques.map((m, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectMosque(m)}
                          style={{
                            padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                            color: 'var(--text-primary)',
                            borderBottom: i < filteredMosques.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            transition: 'var(--transition-fast)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-overlay)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {m}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Imam fields */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Imam / community leader name</label>
                  <Input value={imamName} onChange={e => setImamName(e.target.value)} placeholder="Sheikh Abdullah" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Their phone number</label>
                  <Input value={imamPhone} onChange={e => setImamPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              {/* Tenure chips */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>How long at this mosque?</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['< 6 months', '6 months \u2013 2 years', '2+ years'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setTenure(opt)}
                      style={{ ...chipBase, ...(tenure === opt ? chipActive : {}) }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vouch preview card */}
              {selectedMosque && imamName && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 18px',
                    marginBottom: 20,
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 8 }}>
                    Message {imamName} will receive
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    "Assalamu alaikum, {imamName}. {firstName || 'A member'} {lastName} from {selectedMosque} has applied
                    for an interest-free loan through Mizan. Could you confirm they are a known member of your community?
                    Reply YES or NO to this message."
                  </p>
                </motion.div>
              )}

              {/* Circle alternative */}
              <div
                onClick={() => setUseCircle(!useCircle)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: useCircle ? 'var(--teal-glow)' : 'var(--bg-deep)',
                  border: `1px solid ${useCircle ? 'var(--teal-mid)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${useCircle ? 'var(--teal-mid)' : 'var(--border-strong)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {useCircle && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal-mid)' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>UT Austin MSA Circle</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Use your existing circle membership as a vouch</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ================================================================ */}
        {/* SECTION C — Repayment Proposal                                   */}
        {/* ================================================================ */}
        <AnimatePresence>
          <motion.div
            initial={!sectionAComplete ? { opacity: 0.4, y: 8 } : false}
            animate={{ opacity: sectionAComplete ? 1 : 0.4, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card style={{
              marginBottom: 32,
              pointerEvents: sectionAComplete ? 'auto' : 'none',
              filter: sectionAComplete ? 'none' : 'grayscale(0.4)',
            }}>
              <SectionHeader letter="C" title="Repayment Proposal" complete={!!sectionCComplete} locked={!sectionAComplete} />

              {/* Frequency */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Payment frequency</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Weekly', 'Bi-weekly', 'Monthly'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFrequency(opt)}
                      style={{ ...chipBase, ...(frequency === opt ? chipActive : {}), flex: 1 }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start timing */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>When to start</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['As soon as funded', 'In 2 weeks', 'Next month'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setStartTiming(opt)}
                      style={{ ...chipBase, ...(startTiming === opt ? chipActive : {}), flex: 1, minWidth: 120 }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly payment */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Proposed monthly payment ($)</label>
                <Input
                  type="number"
                  value={monthlyPayment}
                  onChange={e => setMonthlyPayment(e.target.value)}
                  placeholder="240"
                  min={0}
                />
              </div>

              {/* Live computation */}
              {paymentNum > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: 'var(--bg-deep)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Loan amount</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${loanAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Monthly payment</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${paymentNum.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Estimated duration</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {Math.ceil(loanAmount / paymentNum)} months
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Interest charged</span>
                    <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>$0.00</span>
                  </div>
                  {feasibility && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>Income utilization</span>
                      <span style={{
                        fontWeight: 500,
                        color: feasibility.utilizationPercent > 60 ? 'var(--status-red)' : feasibility.utilizationPercent > 40 ? 'var(--status-yellow)' : 'var(--status-green)',
                      }}>
                        {feasibility.utilizationPercent}%
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Warning */}
              <AnimatePresence>
                {paymentWarning && paymentNum > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: 12, padding: '12px 14px',
                      background: 'rgba(248, 113, 113, 0.08)',
                      border: '1px solid rgba(248, 113, 113, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13, color: 'var(--status-red)', lineHeight: 1.5,
                    }}
                  >
                    This payment may be unrealistic given your income and obligations. Consider a lower amount or longer repayment period.
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ================================================================ */}
        {/* SUBMIT BUTTON                                                    */}
        {/* ================================================================ */}
        <motion.button
          whileHover={allComplete ? { scale: 1.01 } : {}}
          whileTap={allComplete ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={!allComplete || submitting}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: allComplete ? 'var(--teal-mid)' : 'var(--bg-overlay)',
            color: allComplete ? '#fff' : 'var(--text-tertiary)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            cursor: allComplete ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'var(--transition-base)',
            boxShadow: allComplete ? '0 0 24px var(--teal-glow)' : 'none',
          }}
        >
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={20} />
              </motion.div>
              Submitting...
            </>
          ) : (
            'Submit my application'
          )}
        </motion.button>
      </div>
    </TransitionWrapper>
  )
}
