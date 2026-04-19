import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommunity } from '../../context/CommunityContext'
import {
  Building2, ShieldCheck, User, Key,
  CheckCircle, Copy, Loader2, Upload,
  Search, ArrowRight, ArrowLeft, Check
} from 'lucide-react'

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

const STEPS = [
  { num: 1, label: 'Organization', icon: Building2 },
  { num: 2, label: 'Verification', icon: ShieldCheck },
  { num: 3, label: 'Admin Profile', icon: User },
  { num: 4, label: 'Launch', icon: Key },
]

const ROLES = ['Imam', 'Board Chair', 'Treasurer', 'Secretary', 'Youth Director', 'Admin']

/* ---------------------------------------------------------------------------
   Style helpers
   --------------------------------------------------------------------------- */

const dm = (size = 13) => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: size,
})

const serif = (size = 24) => ({
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: size,
  fontWeight: 600,
})

const card = {
  background: 'var(--bg-surface, #111)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle, #222)',
  padding: 24,
}

const inputStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  width: '100%',
  background: 'var(--bg-elevated, #1a1a2e)',
  border: '1px solid var(--border-subtle, #222)',
  borderRadius: 'var(--radius-md, 10px)',
  color: 'var(--text-primary, #fff)',
  padding: '12px 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  ...dm(12),
  color: 'var(--text-tertiary, #666)',
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
}

/* ---------------------------------------------------------------------------
   STEP 1 — Organization Info
   --------------------------------------------------------------------------- */

function Step1({ orgData, setOrgData }) {
  const fields = [
    { key: 'name', label: 'Organization Name', placeholder: 'Islamic Center of Austin' },
    { key: 'address', label: 'Address', placeholder: '1906 Nueces St, Austin, TX 78705' },
    { key: 'contactName', label: 'Contact Name', placeholder: 'Imam Abdullah Rashid' },
    { key: 'contactEmail', label: 'Contact Email', placeholder: 'imam@icaustin.org', type: 'email' },
    { key: 'contactPhone', label: 'Contact Phone', placeholder: '(512) 476-2563', type: 'tel' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <h2 style={{ ...serif(22), color: 'var(--text-primary)', marginBottom: 4 }}>Organization Details</h2>
      <p style={{ ...dm(13), color: 'var(--text-tertiary)', marginBottom: 24 }}>Tell us about your mosque or Islamic center</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}</label>
            <input
              type={f.type || 'text'}
              value={orgData[f.key]}
              onChange={e => setOrgData(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   STEP 2 — Verification
   --------------------------------------------------------------------------- */

function Step2({ ein, setEin, einVerified, setEinVerified }) {
  const [verifying, setVerifying] = useState(false)
  const [isnaSearching, setIsnaSearching] = useState(false)
  const [isnaFound, setIsnaFound] = useState(false)

  function handleVerifyEin() {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setEinVerified(true)
    }, 1000)
  }

  function handleIsnaSearch() {
    setIsnaSearching(true)
    setTimeout(() => {
      setIsnaSearching(false)
      setIsnaFound(true)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <h2 style={{ ...serif(22), color: 'var(--text-primary)', marginBottom: 4 }}>Verification</h2>
      <p style={{ ...dm(13), color: 'var(--text-tertiary)', marginBottom: 24 }}>Verify your non-profit status</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* EIN verification card */}
        <div style={{
          ...card,
          borderColor: einVerified ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle, #222)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={18} color={einVerified ? '#10B981' : 'var(--text-tertiary)'} />
            <span style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)' }}>EIN Verification</span>
            {einVerified && (
              <span style={{ ...dm(11), color: '#10B981', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>EIN Number</label>
              <input
                value={ein}
                onChange={e => { setEin(e.target.value); setEinVerified(false) }}
                placeholder="XX-XXXXXXX"
                style={inputStyle}
                disabled={einVerified}
              />
            </div>
            {!einVerified && (
              <button
                onClick={handleVerifyEin}
                disabled={verifying || !ein}
                style={{
                  ...dm(13),
                  fontWeight: 600,
                  background: verifying ? 'var(--bg-elevated, #1a1a2e)' : 'var(--gold-mid, #D4A843)',
                  color: verifying ? 'var(--text-tertiary)' : '#000',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 10px)',
                  padding: '12px 20px',
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {verifying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</> : 'Verify \u2192'}
              </button>
            )}
          </div>
        </div>

        {/* ISNA search card */}
        <div style={{
          ...card,
          borderColor: isnaFound ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle, #222)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Search size={18} color={isnaFound ? '#10B981' : 'var(--text-tertiary)'} />
            <span style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)' }}>ISNA Directory</span>
            {isnaFound && (
              <span style={{ ...dm(11), color: '#10B981', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={14} /> Found
              </span>
            )}
          </div>
          <p style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 12 }}>
            Search the ISNA mosque directory to auto-verify your organization
          </p>
          <button
            onClick={handleIsnaSearch}
            disabled={isnaSearching || isnaFound}
            style={{
              ...dm(13),
              fontWeight: 500,
              background: 'none',
              border: '1px solid var(--border-subtle, #222)',
              borderRadius: 'var(--radius-md, 10px)',
              color: isnaFound ? '#10B981' : 'var(--text-secondary)',
              padding: '10px 16px',
              cursor: isnaSearching || isnaFound ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {isnaSearching
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
              : isnaFound
                ? <><CheckCircle size={14} /> Islamic Center of Austin found in directory</>
                : <><Search size={14} /> Search ISNA Directory</>
            }
          </button>
        </div>

        {/* Manual upload card */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Upload size={18} color="var(--text-tertiary)" />
            <span style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)' }}>Manual Upload</span>
          </div>
          <p style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 12 }}>
            Upload your 501(c)(3) determination letter or tax-exempt certificate
          </p>
          <div style={{
            border: '2px dashed var(--border-subtle, #333)',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            ...dm(12),
            cursor: 'pointer',
          }}>
            <Upload size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>Drop file here or click to browse</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>PDF, PNG, or JPG up to 10MB</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   STEP 3 — Admin Profile
   --------------------------------------------------------------------------- */

function Step3({ adminData, setAdminData }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <h2 style={{ ...serif(22), color: 'var(--text-primary)', marginBottom: 4 }}>Admin Profile</h2>
      <p style={{ ...dm(13), color: 'var(--text-tertiary)', marginBottom: 24 }}>Set up your administrator profile</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Role selector */}
        <div>
          <label style={labelStyle}>Role</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setAdminData(p => ({ ...p, role: r }))}
                style={{
                  ...dm(13),
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: adminData.role === r
                    ? '1px solid var(--gold-mid, #D4A843)'
                    : '1px solid var(--border-subtle, #222)',
                  background: adminData.role === r
                    ? 'rgba(212,168,67,0.12)'
                    : 'transparent',
                  color: adminData.role === r
                    ? 'var(--gold-mid, #D4A843)'
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: adminData.role === r ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bio textarea */}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={adminData.bio}
            onChange={e => setAdminData(p => ({ ...p, bio: e.target.value }))}
            placeholder="Brief description of your role and responsibilities..."
            rows={4}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 100,
            }}
          />
        </div>

        {/* Sub-admin toggle */}
        <div style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 500 }}>Enable Sub-Admins</div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 2 }}>
              Allow other staff to manage community settings
            </div>
          </div>
          <button
            onClick={() => setAdminData(p => ({ ...p, subAdmin: !p.subAdmin }))}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              border: 'none',
              background: adminData.subAdmin ? '#10B981' : 'var(--bg-elevated, #1a1a2e)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 3,
              left: adminData.subAdmin ? 23 : 3,
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   STEP 4 — Launch
   --------------------------------------------------------------------------- */

function Step4() {
  const [copied, setCopied] = useState(false)
  const mosqueCode = 'ICA-AUSTIN-2847'

  function handleCopy() {
    navigator.clipboard.writeText(mosqueCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle size={32} color="#10B981" />
        </div>
        <h2 style={{ ...serif(26), color: 'var(--text-primary)', marginBottom: 4 }}>You're All Set!</h2>
        <p style={{ ...dm(13), color: 'var(--text-tertiary)' }}>
          Share this code with your community members
        </p>
      </div>

      {/* Mosque code */}
      <div style={{
        ...card,
        textAlign: 'center',
        padding: 32,
        borderColor: 'rgba(212,168,67,0.3)',
        background: 'linear-gradient(135deg, rgba(212,168,67,0.06) 0%, var(--bg-surface, #111) 100%)',
        marginBottom: 20,
      }}>
        <div style={{ ...dm(11), color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
          Mosque Code
        </div>
        <div style={{
          ...serif(36),
          color: 'var(--gold-mid, #D4A843)',
          letterSpacing: '0.04em',
          marginBottom: 16,
        }}>
          {mosqueCode}
        </div>
        <button
          onClick={handleCopy}
          style={{
            ...dm(13),
            fontWeight: 600,
            background: copied ? 'rgba(16,185,129,0.12)' : 'var(--bg-elevated, #1a1a2e)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle, #222)'}`,
            borderRadius: 'var(--radius-md, 10px)',
            color: copied ? '#10B981' : 'var(--text-secondary)',
            padding: '10px 20px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
        </button>
      </div>

      {/* Members linked */}
      <div style={{
        ...card,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#3B82F6',
        }}>
          <User size={20} />
        </div>
        <div>
          <div style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 600 }}>47 members linked</div>
          <div style={{ ...dm(12), color: 'var(--text-tertiary)' }}>Members can join using your mosque code</div>
        </div>
      </div>

      {/* Enter dashboard button */}
      <button
        onClick={() => window.location.href = '/community'}
        style={{
          ...dm(15),
          fontWeight: 600,
          width: '100%',
          padding: '16px 24px',
          background: 'var(--gold-mid, #D4A843)',
          color: '#000',
          border: 'none',
          borderRadius: 'var(--radius-md, 10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        Enter my dashboard <ArrowRight size={16} />
      </button>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   MAIN EXPORT — Setup Flow
   --------------------------------------------------------------------------- */

export default function CommunitySetup() {
  const { community } = useCommunity()
  const [step, setStep] = useState(1)

  const [orgData, setOrgData] = useState({
    name: 'Islamic Center of Austin',
    address: '1906 Nueces St, Austin, TX 78705',
    contactName: 'Imam Abdullah Rashid',
    contactEmail: 'imam@icaustin.org',
    contactPhone: '(512) 476-2563',
  })

  const [ein, setEin] = useState('74-2567891')
  const [einVerified, setEinVerified] = useState(false)

  const [adminData, setAdminData] = useState({
    role: 'Imam',
    bio: '',
    subAdmin: false,
  })

  const canAdvance = () => {
    if (step === 1) return orgData.name && orgData.contactEmail
    if (step === 2) return true
    if (step === 3) return adminData.role
    return true
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      {/* Spin keyframe for loader */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        Community Setup
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginBottom: 32,
      }}>
        Set up your mosque on Mizan in a few steps
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          {STEPS.map(s => {
            const Icon = s.icon
            const isActive = s.num === step
            const isComplete = s.num < step
            return (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  flex: 1,
                  cursor: isComplete ? 'pointer' : 'default',
                }}
                onClick={() => isComplete && setStep(s.num)}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isComplete
                    ? '#10B981'
                    : isActive
                      ? 'rgba(212,168,67,0.15)'
                      : 'var(--bg-elevated, #1a1a2e)',
                  border: isActive
                    ? '2px solid var(--gold-mid, #D4A843)'
                    : isComplete
                      ? '2px solid #10B981'
                      : '2px solid var(--border-subtle, #222)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isComplete
                    ? '#fff'
                    : isActive
                      ? 'var(--gold-mid, #D4A843)'
                      : 'var(--text-tertiary)',
                  transition: 'all 0.2s',
                }}>
                  {isComplete ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span style={{
                  ...dm(11),
                  color: isActive ? 'var(--gold-mid, #D4A843)' : isComplete ? '#10B981' : 'var(--text-tertiary)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
        {/* Progress track */}
        <div style={{
          height: 4,
          background: 'var(--bg-elevated, #1a1a2e)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
            background: 'var(--gold-mid, #D4A843)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && <Step1 key="s1" orgData={orgData} setOrgData={setOrgData} />}
        {step === 2 && <Step2 key="s2" ein={ein} setEin={setEin} einVerified={einVerified} setEinVerified={setEinVerified} />}
        {step === 3 && <Step3 key="s3" adminData={adminData} setAdminData={setAdminData} />}
        {step === 4 && <Step4 key="s4" />}
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            style={{
              ...dm(13),
              fontWeight: 500,
              background: 'none',
              border: '1px solid var(--border-subtle, #222)',
              borderRadius: 'var(--radius-md, 10px)',
              color: step === 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              padding: '12px 20px',
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: step === 1 ? 0.4 : 1,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={() => canAdvance() && setStep(s => Math.min(4, s + 1))}
            disabled={!canAdvance()}
            style={{
              ...dm(13),
              fontWeight: 600,
              background: canAdvance() ? 'var(--gold-mid, #D4A843)' : 'var(--bg-elevated, #1a1a2e)',
              color: canAdvance() ? '#000' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: 'var(--radius-md, 10px)',
              padding: '12px 24px',
              cursor: canAdvance() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {step === 3 ? 'Complete Setup' : 'Continue'} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </motion.div>
  )
}
