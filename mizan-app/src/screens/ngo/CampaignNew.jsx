import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Upload, X, Play, Image, Check,
  Eye, Sparkles, ChevronDown, ChevronUp, Rocket,
} from 'lucide-react'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

const CATEGORIES_PRIMARY = [
  'Water & Sanitation', 'Food Security', 'Medical Aid', 'Education',
  'Orphan Care', 'Emergency Relief', 'Refugees', 'Community Development',
]

const CATEGORIES_SECONDARY = [
  'Women & Girls', 'Disability Support', 'Climate Resilience',
  'Infrastructure', 'Vocational Training', 'Mental Health',
]

const INSPIRATION_METRICS = [
  { org: 'Islamic Relief', metric: '$1 = 4 meals provided' },
  { org: 'Penny Appeal', metric: '$1 = 1 day of clean water' },
  { org: 'UNHCR', metric: '$1 = 2 school supplies' },
  { org: 'Doctors Without Borders', metric: '$1 = 1 vaccination dose' },
]

const LOAN_TIERS = [
  { id: 'micro', label: 'Micro loans ($50-$500)', desc: 'Quick compound cycles, higher volume' },
  { id: 'standard', label: 'Standard loans ($500-$2,000)', desc: 'Balanced compound returns' },
  { id: 'large', label: 'Large loans ($2,000+)', desc: 'Slower cycles, larger compound payoff' },
  { id: 'any', label: 'Any tier', desc: 'Let the algorithm decide' },
]

const STEP_LABELS = ['Basics', 'Description', 'Media', 'Compound', 'Review']

/* ---------------------------------------------------------------------------
   Step Progress Bar (gold variant)
   --------------------------------------------------------------------------- */

function StepProgress({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i <= current ? 'var(--gold-mid)' : 'rgba(255,255,255,0.08)',
          transition: 'background 0.3s ease',
        }} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Step 1: Basics
   --------------------------------------------------------------------------- */

function Step1({ data, onChange }) {
  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
      <h2 style={styles.stepTitle}>Campaign Basics</h2>
      <p style={styles.stepSubtitle}>Name your campaign and set its parameters.</p>

      <label style={styles.label}>Campaign Name</label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g. Gaza Emergency Water Fund"
        style={styles.input}
      />

      <label style={styles.label}>Primary Category</label>
      <select
        value={data.primaryCategory}
        onChange={(e) => onChange({ primaryCategory: e.target.value })}
        style={{ ...styles.input, appearance: 'auto', cursor: 'pointer' }}
      >
        <option value="">Select a category...</option>
        {CATEGORIES_PRIMARY.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <label style={styles.label}>Secondary Category (optional)</label>
      <select
        value={data.secondaryCategory}
        onChange={(e) => onChange({ secondaryCategory: e.target.value })}
        style={{ ...styles.input, appearance: 'auto', cursor: 'pointer' }}
      >
        <option value="">Select a category...</option>
        {CATEGORIES_SECONDARY.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <label style={styles.label}>Countries</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {data.countries.map((c, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", color: 'var(--gold-light)',
            background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.25)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {c}
            <button
              onClick={() => onChange({ countries: data.countries.filter((_, j) => j !== i) })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--gold-light)', display: 'flex' }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a country and press Enter"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            onChange({ countries: [...data.countries, e.target.value.trim()] })
            e.target.value = ''
          }
        }}
        style={styles.input}
      />

      {/* Funding goal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Funding Goal ($)</label>
          <input
            type="number"
            value={data.noGoal ? '' : data.fundingGoal}
            onChange={(e) => onChange({ fundingGoal: parseInt(e.target.value) || 0 })}
            placeholder="e.g. 15000"
            disabled={data.noGoal}
            style={{ ...styles.input, marginBottom: 0, opacity: data.noGoal ? 0.4 : 1 }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
          <div
            onClick={() => onChange({ noGoal: !data.noGoal })}
            style={{
              width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
              background: data.noGoal ? 'var(--gold-mid)' : 'rgba(255,255,255,0.12)',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: data.noGoal ? 21 : 3, transition: 'left 0.2s',
            }} />
          </div>
          No goal
        </label>
      </div>

      {/* Duration */}
      <label style={styles.label}>Duration</label>
      <div style={{ display: 'flex', gap: 12 }}>
        {['Open-ended', 'Set end date'].map((opt) => {
          const selected = data.duration === opt
          return (
            <button
              key={opt}
              onClick={() => onChange({ duration: opt })}
              style={{
                flex: 1, padding: '12px', textAlign: 'center',
                background: selected ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface)',
                border: selected ? '2px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                color: selected ? 'var(--gold-light)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {data.duration === 'Set end date' && (
        <input
          type="date"
          value={data.endDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
          style={{ ...styles.input, marginTop: 12, width: 220, cursor: 'pointer' }}
        />
      )}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 2: Description & Impact Metric
   --------------------------------------------------------------------------- */

function Step2({ data, onChange }) {
  const [showInspiration, setShowInspiration] = useState(false)

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
      <h2 style={styles.stepTitle}>Description & Impact</h2>
      <p style={styles.stepSubtitle}>Tell donors what their contribution achieves.</p>

      <label style={styles.label}>
        Short Description
        <span style={{ float: 'right', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: data.shortDesc.length > 120 ? 'var(--status-red)' : 'var(--text-tertiary)' }}>
          {data.shortDesc.length}/120
        </span>
      </label>
      <input
        type="text"
        value={data.shortDesc}
        onChange={(e) => onChange({ shortDesc: e.target.value.slice(0, 120) })}
        placeholder="A concise summary shown in Discover cards"
        style={styles.input}
        maxLength={120}
      />

      <label style={styles.label}>Full Description</label>
      <textarea
        value={data.fullDesc}
        onChange={(e) => onChange({ fullDesc: e.target.value })}
        placeholder="Detailed campaign description. Explain the need, your approach, and expected outcomes..."
        rows={5}
        style={{ ...styles.input, height: 'auto', resize: 'vertical', minHeight: 120 }}
      />

      {/* Impact Metric Builder */}
      <label style={styles.label}>Impact Metric</label>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--gold-light)' }}>$1 =</span>
          <input
            type="number"
            value={data.impactAmount}
            onChange={(e) => onChange({ impactAmount: e.target.value })}
            placeholder="4"
            style={{ ...styles.input, width: 80, marginBottom: 0, textAlign: 'center' }}
          />
          <input
            type="text"
            value={data.impactUnit}
            onChange={(e) => onChange({ impactUnit: e.target.value })}
            placeholder="meals provided"
            style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          />
        </div>
        {data.impactAmount && data.impactUnit && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)',
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
              Preview: <strong style={{ color: 'var(--gold-light)' }}>$1 = {data.impactAmount} {data.impactUnit}</strong>
            </span>
            <br />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4, display: 'inline-block' }}>
              A $50 donation = {data.impactAmount * 50} {data.impactUnit}
            </span>
          </div>
        )}
      </div>

      {/* Inspiration expandable */}
      <button
        onClick={() => setShowInspiration(!showInspiration)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          color: 'var(--gold-mid)', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <Sparkles size={14} /> Need inspiration?
        {showInspiration ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {showInspiration && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 12, padding: 16, background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
            }}>
              {INSPIRATION_METRICS.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < INSPIRATION_METRICS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>{item.org}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--gold-light)' }}>{item.metric}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 3: Media
   --------------------------------------------------------------------------- */

function Step3({ data, onChange }) {
  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
      <h2 style={styles.stepTitle}>Media & Visuals</h2>
      <p style={styles.stepSubtitle}>Add photos and video to bring your campaign to life.</p>

      {/* Cover Photo Upload */}
      <label style={styles.label}>Cover Photo</label>
      <div
        style={{
          border: '2px dashed var(--gold-mid)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 24,
          background: data.coverPhoto ? 'rgba(212,168,67,0.05)' : 'transparent',
          transition: 'all 0.2s',
        }}
        onClick={() => {
          // Simulate photo selection
          onChange({ coverPhoto: 'cover-photo-selected.jpg' })
        }}
      >
        {data.coverPhoto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Check size={32} style={{ color: 'var(--status-green)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--status-green)', fontWeight: 600 }}>
              Photo selected
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange({ coverPhoto: null }) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Upload size={32} style={{ color: 'var(--gold-mid)' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--gold-light)', fontWeight: 600 }}>
              Click to upload cover photo
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
              Recommended: 1200 x 630px, JPG or PNG
            </span>
          </div>
        )}
      </div>

      {/* Additional Photos Grid */}
      <label style={styles.label}>Additional Photos (up to 6)</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {Array.from({ length: 6 }, (_, i) => {
          const hasPhoto = i < data.additionalPhotos.length
          return (
            <div
              key={i}
              style={{
                aspectRatio: '4/3',
                border: hasPhoto ? '1px solid var(--border-default)' : '1px dashed var(--border-default)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: hasPhoto ? 'rgba(212,168,67,0.05)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                if (!hasPhoto) {
                  onChange({ additionalPhotos: [...data.additionalPhotos, `photo-${i + 1}.jpg`] })
                }
              }}
            >
              {hasPhoto ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Image size={20} style={{ color: 'var(--gold-mid)' }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)' }}>Photo {i + 1}</span>
                </div>
              ) : (
                <Plus size={20} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Video URL */}
      <label style={styles.label}>Video URL (optional)</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Play size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          type="url"
          value={data.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          style={{ ...styles.input, marginBottom: 0 }}
        />
      </div>
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 4: Compound Settings
   --------------------------------------------------------------------------- */

function Step4({ data, onChange }) {
  return (
    <motion.div key="step4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
      <h2 style={styles.stepTitle}>Compound & Loan Preferences</h2>
      <p style={styles.stepSubtitle}>Configure how donations compound through the Mizan lending system.</p>

      {/* Compound Toggle */}
      <label style={styles.label}>Enable Compounding?</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {/* Yes option */}
        <button
          onClick={() => onChange({ compoundEnabled: true })}
          style={{
            padding: 20, textAlign: 'left',
            background: data.compoundEnabled ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface)',
            border: data.compoundEnabled ? '2px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: data.compoundEnabled ? 'var(--gold-light)' : 'var(--text-primary)' }}>
              Yes
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", color: 'var(--gold-mid)',
              background: 'rgba(212,168,67,0.15)',
            }}>
              3.2x
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Donations are lent interest-free to borrowers, repaid, and re-donated. Average multiplier: 3.2x over the campaign lifetime.
          </p>
        </button>

        {/* No option */}
        <button
          onClick={() => onChange({ compoundEnabled: false })}
          style={{
            padding: 20, textAlign: 'left',
            background: !data.compoundEnabled ? 'rgba(212,168,67,0.1)' : 'var(--bg-surface)',
            border: !data.compoundEnabled ? '2px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: !data.compoundEnabled ? 'var(--gold-light)' : 'var(--text-primary)' }}>
              No
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Direct donations only. Funds go straight to your programs without compounding.
          </p>
          {!data.compoundEnabled && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
            }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--status-yellow)' }}>
                Advisory: Campaigns with compounding enabled raise 2.4x more on average.
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Loan Tier Preference */}
      {data.compoundEnabled && (
        <>
          <label style={styles.label}>Loan Tier Preference</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOAN_TIERS.map((tier) => {
              const selected = data.loanTier === tier.id
              return (
                <label
                  key={tier.id}
                  onClick={() => onChange({ loanTier: tier.id })}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    background: selected ? 'rgba(212,168,67,0.08)' : 'transparent',
                    border: selected ? '1px solid rgba(212,168,67,0.3)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: selected ? '2px solid var(--gold-mid)' : '2px solid var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-mid)' }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: selected ? 'var(--gold-light)' : 'var(--text-primary)', marginBottom: 2 }}>
                      {tier.label}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {tier.desc}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------------
   Step 5: Review & Launch
   --------------------------------------------------------------------------- */

function Step5({ data }) {
  const ALGO_TAGS = ['water', 'emergency', 'compound-enabled', data.primaryCategory?.toLowerCase().replace(/\s/g, '-')].filter(Boolean)

  return (
    <motion.div key="step5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
      <h2 style={styles.stepTitle}>Review & Launch</h2>
      <p style={styles.stepSubtitle}>Confirm your campaign details before going live.</p>

      {/* Summary card */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
          {data.name || 'Untitled Campaign'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          <ReviewRow label="Category" value={data.primaryCategory || 'Not set'} />
          <ReviewRow label="Secondary" value={data.secondaryCategory || 'None'} />
          <ReviewRow label="Countries" value={data.countries.length > 0 ? data.countries.join(', ') : 'Not set'} />
          <ReviewRow label="Goal" value={data.noGoal ? 'No goal' : `$${(data.fundingGoal || 0).toLocaleString()}`} />
          <ReviewRow label="Duration" value={data.duration === 'Set end date' ? `Until ${data.endDate || 'TBD'}` : 'Open-ended'} />
          <ReviewRow label="Compounding" value={data.compoundEnabled ? `Enabled (${data.loanTier} tier)` : 'Disabled'} />
          <ReviewRow label="Impact" value={data.impactAmount && data.impactUnit ? `$1 = ${data.impactAmount} ${data.impactUnit}` : 'Not set'} />
          <ReviewRow label="Media" value={`${data.coverPhoto ? '1 cover' : '0 cover'}, ${data.additionalPhotos.length} extra${data.videoUrl ? ', 1 video' : ''}`} />
        </div>
      </div>

      {/* Preview in Discover button */}
      <button style={{
        width: '100%', padding: '14px 24px', marginBottom: 20,
        background: 'transparent', border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-md)', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        color: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 0.2s',
      }}>
        <Eye size={16} /> Preview in Discover
      </button>

      {/* Algorithm tags */}
      <label style={styles.label}>Algorithm Tags</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {ALGO_TAGS.map((tag, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", color: 'var(--teal-light)',
            background: 'rgba(74,173,164,0.12)', border: '1px solid rgba(74,173,164,0.25)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Estimated reach */}
      <div style={{
        padding: '16px 20px', borderRadius: 'var(--radius-md)',
        background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estimated Reach
          </span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: 'var(--gold-light)', marginTop: 2 }}>
            340 - 500
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)' }}>
            potential donors in first 30 days
          </span>
        </div>
        <Sparkles size={28} style={{ color: 'var(--gold-mid)', opacity: 0.6 }} />
      </div>
    </motion.div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-primary)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Main Wizard
   --------------------------------------------------------------------------- */

const INITIAL_DATA = {
  name: '',
  primaryCategory: '',
  secondaryCategory: '',
  countries: [],
  fundingGoal: 15000,
  noGoal: false,
  duration: 'Open-ended',
  endDate: '',
  shortDesc: '',
  fullDesc: '',
  impactAmount: '',
  impactUnit: '',
  coverPhoto: null,
  additionalPhotos: [],
  videoUrl: '',
  compoundEnabled: true,
  loanTier: 'standard',
}

export default function CampaignNew() {
  const navigate = useNavigate()
  const { createCampaign } = useNGOPartner()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(INITIAL_DATA)
  const [launching, setLaunching] = useState(false)

  const onChange = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleLaunch = () => {
    setLaunching(true)
    try {
      const result = createCampaign(data)
      navigate(`/ngo/campaigns/${result.id}`)
    } catch (e) {
      console.error('Launch failed:', e)
      setLaunching(false)
    }
  }

  const stepComponents = [
    <Step1 key={0} data={data} onChange={onChange} />,
    <Step2 key={1} data={data} onChange={onChange} />,
    <Step3 key={2} data={data} onChange={onChange} />,
    <Step4 key={3} data={data} onChange={onChange} />,
    <Step5 key={4} data={data} />,
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ padding: '48px 24px 80px', maxWidth: 720, margin: '0 auto' }}
    >
      {/* Back link */}
      <button
        onClick={() => navigate('/ngo/campaigns')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--gold-mid)',
          display: 'flex', alignItems: 'center', gap: 6, padding: 0, marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} /> Back to campaigns
      </button>

      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
        Create a New Campaign
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Step {step + 1} of 5: {STEP_LABELS[step]}
      </p>

      <StepProgress current={step} total={5} />

      {/* Step Content */}
      <div style={{
        background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)', padding: 32, marginBottom: 28, minHeight: 380,
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
            padding: '12px 24px', background: 'transparent',
            color: step === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0.4 : 1, transition: 'all 0.2s',
          }}
        >
          Previous
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            style={{
              padding: '12px 28px', background: 'var(--gold-mid)', color: 'var(--text-inverse)',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all var(--transition-base)',
            }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={launching}
            style={{
              padding: '14px 32px',
              background: launching ? 'var(--text-tertiary)' : 'var(--gradient-gold)',
              color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              cursor: launching ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: launching ? 'none' : 'var(--shadow-gold)',
              transition: 'all var(--transition-base)',
            }}
          >
            <Rocket size={16} /> {launching ? 'Launching...' : 'Launch Campaign \u2192'}
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
    fontSize: 24, fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 6px 0',
  },
  stepSubtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, color: 'var(--text-secondary)',
    margin: '0 0 24px 0',
  },
  label: {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8, marginTop: 0,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, color: 'var(--text-primary)',
    outline: 'none', marginBottom: 20,
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
}
