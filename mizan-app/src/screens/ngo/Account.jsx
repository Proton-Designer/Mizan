import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGOPartner } from '../../context/NGOContext_Partner'
import {
  ExternalLink, ChevronDown, ChevronUp, Copy, Check,
  Download, UserPlus, X, Settings, Shield, Star,
  Building2, Mail, Phone, Globe, Edit3,
} from 'lucide-react'

/* ──────────────────────────────────────────────
   Style helpers
   ────────────────────────────────────────────── */

const dm = (size = 13) => ({ fontFamily: "'DM Sans', sans-serif", fontSize: size })
const serif = (size = 24) => ({ fontFamily: "'Cormorant Garamond', serif", fontSize: size, fontWeight: 600 })

const card = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle)',
  padding: 24,
  marginBottom: 20,
}

const goldBtn = {
  ...dm(14),
  fontWeight: 600,
  padding: '12px 28px',
  borderRadius: 'var(--radius-pill, 100px)',
  background: 'var(--gradient-gold)',
  color: 'var(--text-inverse)',
  border: 'none',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-gold)',
}

const ghostBtn = {
  ...dm(13),
  fontWeight: 500,
  padding: '10px 22px',
  borderRadius: 'var(--radius-pill, 100px)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-default)',
  cursor: 'pointer',
}

const sectionTitle = {
  ...serif(22),
  color: 'var(--text-primary)',
  margin: '0 0 16px',
}

const inputStyle = {
  ...dm(13),
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md, 10px)',
  color: 'var(--text-primary)',
  padding: '10px 14px',
  outline: 'none',
  boxSizing: 'border-box',
}

/* ──────────────────────────────────────────────
   Tag component
   ────────────────────────────────────────────── */

function Tag({ label, onRemove, color = 'var(--gold-mid)' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 'var(--radius-pill)',
      fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
      color, background: `${color}15`, border: `1px solid ${color}30`,
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 0, display: 'flex' }}>
          <X size={12} />
        </button>
      )}
    </span>
  )
}

/* ──────────────────────────────────────────────
   Toggle component
   ────────────────────────────────────────────── */

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', cursor: 'pointer' }}>
      <span style={{ ...dm(13), color: 'var(--text-primary)' }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, position: 'relative',
          background: checked ? 'var(--gold-mid)' : 'var(--bg-overlay)',
          transition: 'background 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', position: 'absolute', top: 2,
          left: checked ? 20 : 2, transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </label>
  )
}

/* ──────────────────────────────────────────────
   Org Profile Card
   ────────────────────────────────────────────── */

function OrgProfileCard({ org }) {
  const [missionExpanded, setMissionExpanded] = useState(false)

  return (
    <div style={card}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left column */}
        <div style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--bg-overlay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {org.logo ? (
                <img src={org.logo} alt={org.orgName} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
              ) : null}
              <div style={{ display: org.logo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <Building2 size={24} style={{ color: 'var(--gold-mid)' }} />
              </div>
            </div>
            <div>
              <h2 style={{ ...serif(28), color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
                {org.orgName}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer"
              style={{ ...dm(13), color: 'var(--gold-mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} /> {org.website} <ExternalLink size={11} />
            </a>
            <span style={{ ...dm(13), color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> {org.contactEmail}
            </span>
            <span style={{ ...dm(13), color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} /> {org.contactPhone}
            </span>
          </div>

          {/* Mission (collapsible) */}
          <div>
            <button
              onClick={() => setMissionExpanded(!missionExpanded)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', ...dm(12), display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 6 }}
            >
              Mission {missionExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {missionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ ...dm(13), color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {org.mission}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-mid)', ...dm(13), padding: 0, marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Edit3 size={14} /> Edit &rarr;
          </button>
        </div>

        {/* Right column */}
        <div style={{ flex: '0 1 260px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          {/* Tier badge */}
          <div style={{
            background: 'rgba(212,175,55,0.12)',
            border: '2px solid var(--gold-mid)',
            borderRadius: 16,
            padding: '16px 24px',
            textAlign: 'center',
          }}>
            <Shield size={28} style={{ color: 'var(--gold-light)', marginBottom: 6 }} />
            <div style={{ ...serif(20), color: 'var(--gold-light)' }}>
              Tier {org.verificationTier} Verified
            </div>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginTop: 2 }}>
              Since {org.verificationDate}
            </div>
          </div>

          {/* EIN */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ ...dm(12), color: 'var(--text-tertiary)' }}>EIN: </span>
            <a
              href={`https://apps.irs.gov/app/eos/detailsPage?ein=${org.ein.replace('-', '')}&name=&city=&state=&countryAbbr=US`}
              target="_blank" rel="noopener noreferrer"
              style={{ ...dm(13), color: 'var(--gold-mid)', textDecoration: 'none' }}
            >
              {org.ein} <ExternalLink size={11} />
            </a>
          </div>

          {/* Charity Navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ ...dm(12), color: 'var(--text-tertiary)' }}>Charity Navigator</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4].map(i => (
                <Star key={i} size={14} fill={i <= 4 ? 'var(--gold-mid)' : 'none'} style={{ color: 'var(--gold-mid)' }} />
              ))}
            </div>
            <span style={{ ...dm(12), color: 'var(--gold-light)', fontWeight: 600 }}>90/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Financial Settings
   ────────────────────────────────────────────── */

function FinancialSettings({ org, financial, initiateWithdrawal }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(null) // null = full, number = partial
  const [withdrawing, setWithdrawing] = useState(false)
  const [successTxn, setSuccessTxn] = useState(null)
  const [showPartial, setShowPartial] = useState(false)
  const [partialInput, setPartialInput] = useState('')

  const balance = financial.availableBalance

  function handleWithdraw(amount) {
    setWithdrawAmount(amount)
    setShowConfirm(true)
    setShowPartial(false)
  }

  function handleConfirm() {
    setWithdrawing(true)
    const amt = withdrawAmount || balance
    const result = initiateWithdrawal(amt)
    // The context returns synchronously with txn info
    setTimeout(() => {
      setWithdrawing(false)
      setSuccessTxn(result.transaction)
      setShowConfirm(false)
    }, 1200)
  }

  function handleCancel() {
    setShowConfirm(false)
    setWithdrawAmount(null)
    setSuccessTxn(null)
  }

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Financial Settings</h3>

      {/* Connected bank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Building2 size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div>
          <div style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 500 }}>
            {org.bankName} ****{org.bankLast4}
          </div>
          <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>
            Routing: 021000021
          </div>
        </div>
        <span style={{
          ...dm(11), fontWeight: 500,
          padding: '3px 10px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(74,222,128,0.12)', color: 'var(--status-green)',
          marginLeft: 'auto',
        }}>
          Connected
        </span>
      </div>

      {/* Available balance */}
      <div style={{ margin: '24px 0' }}>
        <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 4 }}>Available for withdrawal</div>
        <div style={{
          ...serif(36),
          color: balance > 0 ? 'var(--status-green)' : 'var(--text-tertiary)',
        }}>
          ${balance.toLocaleString()}
        </div>
      </div>

      {/* Buttons */}
      {balance > 0 && !successTxn && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={goldBtn}
            onClick={() => handleWithdraw(null)}
          >
            Withdraw all (${balance.toLocaleString()})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={ghostBtn}
            onClick={() => setShowPartial(!showPartial)}
          >
            Withdraw partial
          </motion.button>
        </div>
      )}

      {/* Partial input */}
      <AnimatePresence>
        {showPartial && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
              <span style={{ ...dm(14), color: 'var(--text-primary)' }}>$</span>
              <input
                type="number"
                value={partialInput}
                onChange={e => setPartialInput(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={balance}
                style={{ ...inputStyle, width: 160 }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                style={{ ...goldBtn, padding: '10px 20px', fontSize: 13 }}
                onClick={() => {
                  const amt = parseFloat(partialInput)
                  if (amt > 0 && amt <= balance) handleWithdraw(amt)
                }}
              >
                Withdraw
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation slide-down */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 16, padding: 20, borderRadius: 12,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-gold)',
            }}>
              <div style={{ ...dm(14), color: 'var(--text-primary)', marginBottom: 8 }}>
                Confirm withdrawal of <strong>${(withdrawAmount || balance).toLocaleString()}</strong> to {org.bankName} ****{org.bankLast4}?
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={goldBtn}
                  onClick={handleConfirm}
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Processing...' : 'Confirm withdrawal'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  style={ghostBtn}
                  onClick={handleCancel}
                  disabled={withdrawing}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {successTxn && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: 20, borderRadius: 12,
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.25)',
            }}
          >
            <div style={{ ...dm(14), color: 'var(--status-green)', fontWeight: 600, marginBottom: 4 }}>
              Withdrawal successful
            </div>
            <div style={{ ...dm(12), color: 'var(--text-secondary)' }}>
              TXN ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{successTxn.id}</span>
            </div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 4 }}>
              ${Math.abs(successTxn.amount).toLocaleString()} sent to {org.bankName} ****{org.bankLast4}. Arrives in 1-2 business days.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Transaction History
   ────────────────────────────────────────────── */

function TransactionHistory({ transactions }) {
  const handleExportCSV = () => {
    const headers = 'Date,Description,Amount,Balance\n'
    const rows = transactions.map(t =>
      `${t.date},"${t.description}",${t.amount},${t.balance}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mizan-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ ...sectionTitle, margin: 0 }}>Transaction History</h3>
        <button onClick={handleExportCSV} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-mid)', ...dm(13), display: 'flex', alignItems: 'center', gap: 4 }}>
          <Download size={14} /> Export as CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Description', 'Amount', 'Balance'].map(h => (
                <th key={h} style={{
                  ...dm(11), fontWeight: 600, color: 'var(--text-tertiary)',
                  textAlign: h === 'Amount' || h === 'Balance' ? 'right' : 'left',
                  padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                  {txn.date}
                </td>
                <td style={{ ...dm(13), color: 'var(--text-primary)', padding: '10px' }}>
                  {txn.description}
                </td>
                <td style={{
                  ...dm(13), fontWeight: 600, padding: '10px', textAlign: 'right',
                  color: txn.amount >= 0 ? 'var(--status-green)' : 'var(--status-red)',
                }}>
                  {txn.amount >= 0 ? '+' : ''}{txn.amount < 0 ? '-' : ''}${Math.abs(txn.amount).toLocaleString()}
                </td>
                <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px', textAlign: 'right' }}>
                  ${txn.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Team Management
   ────────────────────────────────────────────── */

function TeamManagement() {
  const { org } = useNGOPartner()
  const [showPerms, setShowPerms] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Staff')

  const TEAM = [
    { name: 'Aisha Rahman', email: 'aisha@irusa.org', role: 'Admin', permissions: { campaigns: true, donors: true, finances: true, settings: true, team: true } },
    { name: 'Omar Hassan', email: 'omar@irusa.org', role: 'Manager', permissions: { campaigns: true, donors: true, finances: true, settings: false, team: false } },
    { name: 'Fatima Al-Sayed', email: 'fatima@irusa.org', role: 'Staff', permissions: { campaigns: true, donors: false, finances: false, settings: false, team: false } },
  ]

  const permLabels = { campaigns: 'Campaigns', donors: 'Donors', finances: 'Finances', settings: 'Settings', team: 'Team Mgmt' }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ ...sectionTitle, margin: 0 }}>Team Management</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          style={{ ...ghostBtn, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowInvite(true)}
        >
          <UserPlus size={14} /> Invite team member
        </motion.button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Role'].map(h => (
                <th key={h} style={{
                  ...dm(11), fontWeight: 600, color: 'var(--text-tertiary)',
                  textAlign: 'left', padding: '8px 10px',
                  borderBottom: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ ...dm(13), color: 'var(--text-primary)', padding: '10px', fontWeight: 500 }}>
                  {m.name}
                </td>
                <td style={{ ...dm(13), color: 'var(--text-secondary)', padding: '10px' }}>
                  {m.email}
                </td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    ...dm(11), fontWeight: 500, padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: m.role === 'Admin' ? 'rgba(212,175,55,0.12)' : m.role === 'Manager' ? 'rgba(74,173,164,0.12)' : 'var(--bg-overlay)',
                    color: m.role === 'Admin' ? 'var(--gold-light)' : m.role === 'Manager' ? 'var(--teal-light)' : 'var(--text-secondary)',
                  }}>
                    {m.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions matrix (collapsible) */}
      <button
        onClick={() => setShowPerms(!showPerms)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', ...dm(12), display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginTop: 14 }}
      >
        Permissions matrix {showPerms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {showPerms && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...dm(11), color: 'var(--text-tertiary)', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' }}>Role</th>
                    {Object.values(permLabels).map(l => (
                      <th key={l} style={{ ...dm(11), color: 'var(--text-tertiary)', textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEAM.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ ...dm(12), color: 'var(--text-primary)', padding: '8px 10px', fontWeight: 500 }}>{m.role}</td>
                      {Object.keys(permLabels).map(k => (
                        <td key={k} style={{ textAlign: 'center', padding: '8px' }}>
                          {m.permissions[k] ? (
                            <Check size={14} style={{ color: 'var(--status-green)' }} />
                          ) : (
                            <X size={14} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200,
            }}
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16, padding: 28,
                width: '90%', maxWidth: 420,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ ...serif(20), color: 'var(--text-primary)', margin: 0 }}>Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ ...dm(12), color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Enter name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...dm(12), color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="team@irusa.org" type="email" style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...dm(12), color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ ...goldBtn, width: '100%', marginTop: 20 }}
                onClick={() => {
                  // In real app, would send invite
                  setShowInvite(false)
                  setInviteName('')
                  setInviteEmail('')
                  setInviteRole('Staff')
                }}
              >
                Send Invite
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Org Settings
   ────────────────────────────────────────────── */

function OrgSettings({ org }) {
  const [categories, setCategories] = useState(org.causeCategories || [])
  const [countries, setCountries] = useState(org.countriesOfOperation || [])
  const [newCat, setNewCat] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [notifs, setNotifs] = useState({
    newDonation: true,
    compoundSettlement: true,
    weeklyReport: true,
    campaignMilestone: true,
    teamActivity: false,
  })

  return (
    <div style={card}>
      <h3 style={sectionTitle}>Organization Settings</h3>

      {/* Cause categories */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500 }}>Cause Categories</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {categories.map(c => (
            <Tag key={c} label={c} onRemove={() => setCategories(prev => prev.filter(x => x !== c))} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="Add category"
            style={{ ...inputStyle, width: 180 }}
            onKeyDown={e => {
              if (e.key === 'Enter' && newCat.trim()) {
                setCategories(prev => [...prev, newCat.trim()])
                setNewCat('')
              }
            }}
          />
        </div>
      </div>

      {/* Countries */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500 }}>Countries of Operation</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {countries.map(c => (
            <Tag key={c} label={c} color="var(--teal-light)" onRemove={() => setCountries(prev => prev.filter(x => x !== c))} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newCountry}
            onChange={e => setNewCountry(e.target.value)}
            placeholder="Add country"
            style={{ ...inputStyle, width: 180 }}
            onKeyDown={e => {
              if (e.key === 'Enter' && newCountry.trim()) {
                setCountries(prev => [...prev, newCountry.trim()])
                setNewCountry('')
              }
            }}
          />
        </div>
      </div>

      {/* Notification toggles */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notifications</div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Toggle label="New donation alerts" checked={notifs.newDonation} onChange={v => setNotifs(p => ({ ...p, newDonation: v }))} />
          <Toggle label="Compound settlement notifications" checked={notifs.compoundSettlement} onChange={v => setNotifs(p => ({ ...p, compoundSettlement: v }))} />
          <Toggle label="Weekly performance report" checked={notifs.weeklyReport} onChange={v => setNotifs(p => ({ ...p, weeklyReport: v }))} />
          <Toggle label="Campaign milestone alerts" checked={notifs.campaignMilestone} onChange={v => setNotifs(p => ({ ...p, campaignMilestone: v }))} />
          <Toggle label="Team activity notifications" checked={notifs.teamActivity} onChange={v => setNotifs(p => ({ ...p, teamActivity: v }))} />
        </div>
      </div>

      {/* Integrations */}
      <div>
        <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Integrations</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { name: 'Salesforce', desc: 'Sync donor data with your CRM' },
            { name: 'Mailchimp', desc: 'Auto-add donors to email lists' },
          ].map(int => (
            <div key={int.name} style={{
              flex: '1 1 200px', padding: 16, borderRadius: 12,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              opacity: 0.6,
            }}>
              <div style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>{int.name}</div>
              <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginBottom: 10 }}>{int.desc}</div>
              <span style={{
                ...dm(11), fontWeight: 500, padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-overlay)', color: 'var(--text-tertiary)',
              }}>
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   NGO Account Page
   ════════════════════════════════════════ */

export default function NGOAccount() {
  const { org, financial, initiateWithdrawal } = useNGOPartner()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const fadeIn = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  }

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 900, margin: '0 auto', ...fadeIn }}>
      <h1 style={{ ...serif(32), color: 'var(--text-primary)', margin: '0 0 24px' }}>
        Account
      </h1>

      <OrgProfileCard org={org} />
      <FinancialSettings org={org} financial={financial} initiateWithdrawal={initiateWithdrawal} />
      <TransactionHistory transactions={financial.transactions} />
      <TeamManagement />
      <OrgSettings org={org} />
    </div>
  )
}
