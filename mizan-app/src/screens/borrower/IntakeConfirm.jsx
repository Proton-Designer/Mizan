import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pencil, Check, ArrowRight, ArrowLeft, Shield, AlertTriangle } from 'lucide-react'
import { useBorrower } from '../../context/BorrowerContext'
import { assignTier, computeFeasibility } from '../../utils/algorithms'

const FIELD_CONFIG = [
  { key: 'loanAmount', label: 'Loan Amount', prefix: '$', type: 'number' },
  { key: 'purpose', label: 'Purpose', type: 'select', options: [
    { value: 'medical', label: 'Medical' },
    { value: 'car_repair', label: 'Car Repair' },
    { value: 'rent', label: 'Rent' },
    { value: 'utility', label: 'Utilities' },
    { value: 'tuition', label: 'Tuition' },
    { value: 'food', label: 'Food' },
    { value: 'funeral', label: 'Funeral' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'monthlyIncome', label: 'Monthly Income', prefix: '$', type: 'number' },
  { key: 'monthlyExpenses', label: 'Monthly Expenses', prefix: '$', type: 'number' },
  { key: 'householdSize', label: 'Household Size', type: 'number', suffix: ' people' },
  { key: 'urgency', label: 'Urgency', type: 'select', options: [
    { value: 'emergency', label: 'Emergency' },
    { value: 'within_a_week', label: 'Within a week' },
    { value: 'within_a_month', label: 'Within a month' },
    { value: 'planning_ahead', label: 'Planning ahead' },
  ]},
]

const PURPOSE_LABELS = {
  medical: 'Medical', car_repair: 'Car Repair', rent: 'Rent',
  utility: 'Utilities', tuition: 'Tuition', food: 'Food',
  funeral: 'Funeral', other: 'Other', small_business: 'Small Business',
}

const URGENCY_LABELS = {
  emergency: 'Emergency', within_a_week: 'Within a week',
  within_a_month: 'Within a month', planning_ahead: 'Planning ahead',
}

function formatValue(field, value) {
  if (field.key === 'purpose') return PURPOSE_LABELS[value] || value
  if (field.key === 'urgency') return URGENCY_LABELS[value] || value
  if (field.prefix) return `${field.prefix}${Number(value).toLocaleString()}`
  if (field.suffix) return `${value}${field.suffix}`
  return String(value)
}

export default function IntakeConfirm() {
  const navigate = useNavigate()
  const { extractedData, setExtractedData, setDraftApplication } = useBorrower()
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Guard: redirect if no data
  if (!extractedData) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
          No intake data found.
        </p>
        <button
          onClick={() => navigate('/borrower/intake')}
          style={{
            background: 'var(--teal-mid)', color: 'var(--text-inverse)', border: 'none',
            borderRadius: 'var(--radius-md)', padding: '12px 24px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
          }}
        >
          Start intake
        </button>
      </div>
    )
  }

  const tier = assignTier(extractedData.loanAmount || 0)
  const annualIncome = (extractedData.monthlyIncome || 0) * 12
  const feasibility = computeFeasibility(
    annualIncome,
    extractedData.monthlyExpenses || 0,
    extractedData.loanAmount || 0,
    tier,
    extractedData.householdSize || 1
  )

  const startEdit = (field) => {
    setEditingField(field.key)
    setEditValue(extractedData[field.key] ?? '')
  }

  const saveEdit = (field) => {
    const val = field.type === 'number' ? parseFloat(editValue) || 0 : editValue
    setExtractedData(prev => ({ ...prev, [field.key]: val }))
    setEditingField(null)
  }

  const handleContinue = () => {
    setDraftApplication(prev => ({ ...prev, ...extractedData }))
    navigate('/borrower/verification')
  }

  const tierColors = {
    Micro: { bg: 'rgba(74, 222, 128, 0.12)', text: 'var(--status-green)', border: 'rgba(74, 222, 128, 0.25)' },
    Standard: { bg: 'var(--teal-glow)', text: 'var(--teal-light)', border: 'rgba(74, 173, 164, 0.25)' },
    Major: { bg: 'rgba(251, 191, 36, 0.12)', text: 'var(--status-yellow)', border: 'rgba(251, 191, 36, 0.25)' },
  }
  const tierStyle = tierColors[tier.name] || tierColors.Standard

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}
    >
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 32,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        Here's what we understood.
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16,
        color: 'var(--text-secondary)',
        marginBottom: 32,
      }}>
        Tap the pencil to correct anything that doesn't look right.
      </p>

      {/* Field cards - 2 column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        {FIELD_CONFIG.map((field, i) => {
          const isEditing = editingField === field.key
          const value = extractedData[field.key]

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                border: isEditing ? '1px solid var(--teal-mid)' : '1px solid var(--border-subtle)',
                transition: 'border-color var(--transition-base)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--teal-mid)',
                }}>
                  {field.label}
                </span>

                {!isEditing ? (
                  <button
                    onClick={() => startEdit(field)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', padding: 2,
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => saveEdit(field)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--teal-mid)', padding: 2,
                    }}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>

              {isEditing ? (
                field.type === 'select' ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 16,
                      padding: '8px 10px',
                      outline: 'none',
                    }}
                  >
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(field)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 22,
                      fontWeight: 600,
                      padding: '6px 10px',
                      outline: 'none',
                    }}
                  />
                )
              ) : (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}>
                  {formatValue(field, value)}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Tier Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          background: tierStyle.bg,
          border: `1px solid ${tierStyle.border}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
        }}
      >
        <Shield size={20} style={{ color: tierStyle.text }} />
        <div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}>
            Assigned Tier
          </span>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: tierStyle.text,
          }}>
            {tier.name} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}>
              &mdash; up to ${tier.maxAmount.toLocaleString()}, ~{tier.expectedMonths} months
            </span>
          </p>
        </div>
      </motion.div>

      {/* Feasibility Check */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          background: feasibility.feasible ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)',
          border: `1px solid ${feasibility.feasible ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: 40,
        }}
      >
        {feasibility.feasible ? (
          <Check size={20} style={{ color: 'var(--status-green)' }} />
        ) : (
          <AlertTriangle size={20} style={{ color: 'var(--status-red)' }} />
        )}
        <div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}>
            Feasibility Check
          </span>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: feasibility.feasible ? 'var(--status-green)' : 'var(--status-red)',
            lineHeight: 1.5,
          }}>
            {feasibility.feasible
              ? `Estimated repayment of $${Math.round(feasibility.monthlyPayment)}/mo looks manageable (${feasibility.utilizationPercent}% of discretionary income).`
              : `Repayment of $${Math.round(feasibility.monthlyPayment)}/mo may be challenging. We'll work with you to find the right amount.`
            }
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={() => navigate('/borrower/intake')}
          style={{
            flex: '0 0 auto',
            padding: '14px 20px',
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all var(--transition-base)',
          }}
        >
          <ArrowLeft size={16} />
          Start over
        </button>

        <button
          onClick={handleContinue}
          style={{
            flex: 1,
            padding: '14px 24px',
            background: 'var(--teal-mid)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all var(--transition-base)',
          }}
        >
          This looks right — continue
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  )
}
