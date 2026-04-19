import { useReducer, useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGOPartner } from '../../context/NGOContext_Partner'
import {
  Search, Check, Loader2, ExternalLink, ArrowRight, ArrowLeft, X,
  Upload, FileText, Shield, Globe, Tag, DollarSign, Landmark, Rocket,
  Users, Zap, ChevronRight, Star, Link2, AlertCircle,
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════
   Style helpers
   ══════════════════════════════════════════════════════════════ */

const dm = (size = 13) => ({ fontFamily: "'DM Sans', sans-serif", fontSize: size })
const serif = (size = 24) => ({ fontFamily: "'Cormorant Garamond', serif", fontSize: size, fontWeight: 600 })

const card = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle)',
  padding: 24,
}

const inputStyle = {
  ...dm(13),
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md, 10px)',
  color: 'var(--text-primary)',
  padding: '12px 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  ...dm(12),
  color: 'var(--text-tertiary)',
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}

/* ══════════════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════════════ */

const STEP_LABELS = [
  { num: 1, label: 'IRS Search' },
  { num: 2, label: 'Confirm Details' },
  { num: 3, label: 'Documents' },
  { num: 4, label: 'Cause Profile' },
  { num: 5, label: 'Platforms' },
  { num: 5.5, label: 'Bank' },
  { num: 6, label: 'Launch' },
]

const CAUSE_OPTIONS = [
  'Emergency relief', 'Orphan care', 'Clean water', 'Education',
  'Healthcare', 'Refugee support', 'Mosque & community', 'Debt relief',
  'Zakat distribution', 'Food security', 'Disaster response', "Women's programs",
]

const COUNTRY_SUGGESTIONS = [
  'Afghanistan', 'Bangladesh', 'Bosnia', 'Chad', 'Egypt', 'Ethiopia',
  'Gaza', 'India', 'Indonesia', 'Iraq', 'Jordan', 'Kenya', 'Lebanon',
  'Libya', 'Mali', 'Morocco', 'Myanmar', 'Niger', 'Nigeria', 'Pakistan',
  'Philippines', 'Somalia', 'South Sudan', 'Sudan', 'Syria', 'Tunisia',
  'Turkey', 'Uganda', 'Yemen',
]

const PLATFORMS = [
  { id: 'stripe', name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', category: 'Payment processing', color: '#635BFF', popular: true, connectLabel: 'Stripe publishable key', placeholder: 'pk_live_...' },
  { id: 'salesforce', name: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com', category: 'Donor CRM', color: '#00A1E0', popular: true, connectLabel: 'Salesforce instance URL', placeholder: 'https://yourorg.my.salesforce.com' },
  { id: 'quickbooks', name: 'QuickBooks', logo: 'https://logo.clearbit.com/quickbooks.intuit.com', category: 'Accounting', color: '#2CA01C', popular: false, connectLabel: 'QuickBooks company ID', placeholder: '1234567890' },
  { id: 'bloomerang', name: 'Bloomerang', logo: 'https://logo.clearbit.com/bloomerang.co', category: 'Donor CRM', color: '#F47920', popular: false, connectLabel: 'Bloomerang API key', placeholder: 'bl_live_...' },
  { id: 'donorbox', name: 'Donorbox', logo: 'https://logo.clearbit.com/donorbox.org', category: 'Fundraising', color: '#F5594F', popular: false, connectLabel: 'Donorbox organization slug', placeholder: 'your-org-name' },
  { id: 'paypal', name: 'PayPal', logo: 'https://logo.clearbit.com/paypal.com', category: 'Payment processing', color: '#003087', popular: true, connectLabel: 'PayPal client ID', placeholder: 'AXxx...' },
  { id: 'zeffy', name: 'Zeffy', logo: 'https://logo.clearbit.com/zeffy.com', category: 'Fundraising', color: '#7C3AED', popular: false, connectLabel: 'Zeffy organization email', placeholder: 'admin@yourorg.org' },
  { id: 'launchgood', name: 'LaunchGood', logo: 'https://logo.clearbit.com/launchgood.com', category: 'Muslim fundraising', color: '#1A6B4A', popular: true, connectLabel: 'LaunchGood campaign URL', placeholder: 'launchgood.com/yourorg' },
  { id: 'googlesheets', name: 'Google Sheets', logo: 'https://logo.clearbit.com/sheets.google.com', category: 'Spreadsheets', color: '#0F9D58', popular: false, connectLabel: 'Google Sheets share link', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
  { id: 'mailchimp', name: 'Mailchimp', logo: 'https://logo.clearbit.com/mailchimp.com', category: 'Email marketing', color: '#FFE01B', popular: false, connectLabel: 'Mailchimp API key', placeholder: 'xxx-us21' },
  { id: 'networkforgood', name: 'Network for Good', logo: 'https://logo.clearbit.com/networkforgood.com', category: 'Donor management', color: '#E8453C', popular: false, connectLabel: 'Account email', placeholder: 'admin@yourorg.org' },
]

const IRS_FALLBACK_RESULTS = [
  { ein: '953253008', name: 'ISLAMIC RELIEF USA', city: 'ALEXANDRIA', state: 'VA', subsection_code: '03', ruling_date: '199611', sort_name: 'ISLAMIC RELIEF USA' },
  { ein: '954484907', name: 'ISLAMIC RELIEF FUND', city: 'LOS ANGELES', state: 'CA', subsection_code: '03', ruling_date: '200305', sort_name: 'ISLAMIC RELIEF FUND' },
  { ein: '271715457', name: 'ISLAMIC RELIEF WORLDWIDE USA', city: 'BUENA PARK', state: 'CA', subsection_code: '03', ruling_date: '201008', sort_name: 'ISLAMIC RELIEF WORLDWIDE USA' },
  { ein: '832104631', name: 'ISLAMIC RELIEF SERVICES', city: 'HOUSTON', state: 'TX', subsection_code: '03', ruling_date: '201912', sort_name: 'ISLAMIC RELIEF SERVICES' },
]

/* ══════════════════════════════════════════════════════════════
   Reducer
   ══════════════════════════════════════════════════════════════ */

const initialState = {
  step: 1,
  // Step 1
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
  selectedOrg: null,
  // Step 2
  website: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  logo: null,
  logoLoading: false,
  // Step 3
  documents: [
    { id: 'det-letter', label: 'IRS 501(c)(3) Determination Letter', fileName: 'islamic-relief-determination-letter.pdf', size: '847 KB' },
    { id: 'form-990', label: 'Form 990 (Most Recent Filing)', fileName: 'islamic-relief-990-2024.pdf', size: '2.3 MB' },
  ],
  verifyProgress: -1, // -1=idle, 0/1/2=step, 3=done
  verifyDone: false,
  // Step 4
  causeCategories: ['Emergency relief', 'Orphan care', 'Clean water', 'Education'],
  countries: ['Yemen', 'Gaza', 'Somalia', 'Sudan', 'Pakistan', 'Bangladesh', 'Syria'],
  mission: '',
  impactAmount: '2',
  impactUnit: 'meals',
  // Step 5A
  connectedPlatforms: { stripe: true },
  platformInsights: { stripe: 'Processing $12.4k/mo' },
  showSheetsPreview: false,
  // Step 5B
  bankConnected: true,
  // Step 6
  launching: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_FIELD': return { ...state, [action.field]: action.value }
    case 'SET_FIELDS': return { ...state, ...action.fields }
    case 'TOGGLE_CAUSE': {
      const cats = state.causeCategories.includes(action.cause)
        ? state.causeCategories.filter(c => c !== action.cause)
        : [...state.causeCategories, action.cause]
      return { ...state, causeCategories: cats }
    }
    case 'ADD_COUNTRY': {
      if (!action.country || state.countries.includes(action.country)) return state
      return { ...state, countries: [...state.countries, action.country] }
    }
    case 'REMOVE_COUNTRY':
      return { ...state, countries: state.countries.filter(c => c !== action.country) }
    case 'CONNECT_PLATFORM':
      return {
        ...state,
        connectedPlatforms: { ...state.connectedPlatforms, [action.id]: true },
        platformInsights: { ...state.platformInsights, [action.id]: action.insight || 'Connected' },
      }
    case 'REPLACE_DOCUMENT': {
      const docs = state.documents.map(d =>
        d.id === action.id ? { ...d, fileName: action.fileName, size: action.size } : d
      )
      return { ...state, documents: docs }
    }
    default: return state
  }
}

/* ══════════════════════════════════════════════════════════════
   Utility functions
   ══════════════════════════════════════════════════════════════ */

function formatEIN(ein) {
  const s = String(ein).replace(/\D/g, '')
  return s.length >= 9 ? `${s.slice(0, 2)}-${s.slice(2)}` : ein
}

function formatRulingDate(yyyymm) {
  if (!yyyymm || yyyymm.length < 6) return ''
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const m = parseInt(yyyymm.slice(4, 6), 10)
  const y = yyyymm.slice(0, 4)
  return `${months[m - 1] || ''} ${y}`
}

/* ══════════════════════════════════════════════════════════════
   Step transition animation wrapper
   ══════════════════════════════════════════════════════════════ */

const stepVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

function StepWrap({ children, stepKey }) {
  return (
    <motion.div
      key={stepKey}
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step Indicator
   ══════════════════════════════════════════════════════════════ */

function StepIndicator({ current }) {
  const displaySteps = [
    { num: 1, label: 'IRS Search' },
    { num: 2, label: 'Confirm Details' },
    { num: 3, label: 'Documents' },
    { num: 4, label: 'Cause Profile' },
    { num: 5, label: 'Platforms' },
    { num: 5.5, label: 'Bank' },
    { num: 6, label: 'Launch' },
  ]

  // Map step number to sequential index for comparison
  const stepIndex = (n) => displaySteps.findIndex(s => s.num === n)
  const currentIdx = stepIndex(current)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
      {displaySteps.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < displaySteps.length - 1 ? 1 : 'none', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
              <div style={{ position: 'relative' }}>
                {/* Pulsing ring for active */}
                {active && (
                  <div style={{
                    position: 'absolute', inset: -4,
                    borderRadius: '50%',
                    border: '2px solid var(--gold-mid)',
                    animation: 'pulseRing 1.5s ease-in-out infinite',
                  }} />
                )}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'var(--gold-mid)' : active ? 'var(--gold-mid)' : 'transparent',
                  border: done || active ? '2px solid var(--gold-mid)' : '2px solid var(--border-subtle)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {done ? (
                    <Check size={16} style={{ color: 'var(--text-inverse)' }} />
                  ) : (
                    <span style={{
                      ...dm(13), fontWeight: 600,
                      color: active ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                    }}>
                      {step.num === 5.5 ? '5B' : step.num}
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                ...dm(10), fontWeight: 500, textAlign: 'center', lineHeight: 1.2,
                color: active ? 'var(--gold-mid)' : done ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < displaySteps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 12, margin: '0 4px',
                background: done ? 'var(--gold-mid)' : 'var(--border-subtle)',
                transition: 'background 0.3s',
                alignSelf: 'center',
                marginTop: -18,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 1 — IRS Nonprofit Search
   ══════════════════════════════════════════════════════════════ */

function Step1IRS({ state, dispatch }) {
  const { searchQuery, searchResults, searchLoading, searchError } = state

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 3) return
    dispatch({ type: 'SET_FIELDS', fields: { searchLoading: true, searchError: null, searchResults: [] } })

    try {
      const encoded = encodeURIComponent(searchQuery.trim())
      const res = await fetch(`/api/irs/search-index?q=${encoded}&limit=10`)
      if (!res.ok) throw new Error('IRS API error')
      const data = await res.json()
      const orgs = data.results || data.organizations || data || []
      if (Array.isArray(orgs) && orgs.length > 0) {
        dispatch({ type: 'SET_FIELDS', fields: { searchResults: orgs, searchLoading: false } })
      } else {
        dispatch({ type: 'SET_FIELDS', fields: { searchResults: [], searchLoading: false } })
      }
    } catch {
      // CORS fallback: show hardcoded results for demo
      const q = searchQuery.toLowerCase()
      const fallback = IRS_FALLBACK_RESULTS.filter(
        r => r.name.toLowerCase().includes(q) || r.ein.includes(q.replace('-', ''))
      )
      if (fallback.length > 0) {
        dispatch({ type: 'SET_FIELDS', fields: { searchResults: fallback, searchLoading: false } })
      } else {
        dispatch({ type: 'SET_FIELDS', fields: { searchResults: [], searchLoading: false, searchError: true } })
      }
    }
  }, [searchQuery, dispatch])

  const selectOrg = (org) => {
    // Auto-fill contact fields with demo data based on org name
    const orgName = (org.name || org.sort_name || '').toLowerCase()
    let website = ''
    let contactName = 'Admin User'
    let contactTitle = 'Director of Digital Fundraising'
    let contactEmail = 'admin@organization.org'

    // Try to guess website from org name
    if (orgName.includes('islamic relief')) {
      website = 'irusa.org'
      contactName = 'Aisha Rahman'
      contactEmail = 'aisha@irusa.org'
    } else if (orgName.includes('penny appeal')) {
      website = 'pennyappealusa.org'
      contactName = 'Sarah Ahmed'
      contactEmail = 'sarah@pennyappealusa.org'
    } else if (orgName.includes('zakat foundation')) {
      website = 'zakat.org'
      contactName = 'Omar Hassan'
      contactEmail = 'omar@zakat.org'
    } else if (orgName.includes('helping hand') || orgName.includes('hhrd')) {
      website = 'hhrd.org'
      contactName = 'Ali Khan'
      contactEmail = 'ali@hhrd.org'
    } else if (orgName.includes('icna')) {
      website = 'icnarelief.org'
      contactName = 'Fatima Syed'
      contactEmail = 'fatima@icnarelief.org'
    } else {
      // Generic: derive domain from org name
      const slug = orgName.replace(/[^a-z0-9]+/g, '').slice(0, 20)
      website = slug ? `${slug}.org` : ''
      contactEmail = slug ? `admin@${slug}.org` : ''
    }

    dispatch({
      type: 'SET_FIELDS',
      fields: {
        selectedOrg: org,
        step: 2,
        website,
        contactName,
        contactTitle,
        contactEmail,
        contactPhone: '(512) 555-0192',
      }
    })
  }

  return (
    <StepWrap stepKey="step1">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Find your organization.
      </h2>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 24 }}>
        We'll search IRS records to verify your nonprofit status.
      </p>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'searchQuery', value: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
          placeholder="Enter your organization name or EIN..."
          style={{ ...inputStyle, fontSize: 15, padding: '14px 14px 14px 42px' }}
        />
      </div>
      <p style={{ ...dm(12), color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
        Example: "Islamic Relief" or "95-3253008"
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          ...goldBtn,
          opacity: searchQuery.trim().length < 3 ? 0.5 : 1,
          pointerEvents: searchQuery.trim().length < 3 ? 'none' : 'auto',
          marginBottom: 24,
        }}
        onClick={handleSearch}
        disabled={searchQuery.trim().length < 3 || searchLoading}
      >
        {searchLoading ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Searching IRS records...
          </>
        ) : (
          <>Search IRS Records <ArrowRight size={16} /></>
        )}
      </motion.button>

      {/* Error state */}
      {searchError && !searchLoading && searchResults.length === 0 && (
        <div style={{ ...card, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span style={{ ...dm(14), fontWeight: 600, color: '#ef4444' }}>We couldn't reach IRS records</span>
          </div>
          <p style={{ ...dm(13), color: 'var(--text-secondary)', margin: '0 0 12px' }}>
            The IRS search service may be temporarily unavailable. Please try again.
          </p>
          <button onClick={handleSearch} style={{ ...ghostBtn, borderColor: '#ef4444', color: '#ef4444' }}>
            Retry search
          </button>
        </div>
      )}

      {/* No results */}
      {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.length >= 3 && (
        <div style={{ ...card, textAlign: 'center', padding: 32 }}>
          <Search size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <p style={{ ...dm(14), color: 'var(--text-secondary)', margin: 0 }}>No IRS records found</p>
          <p style={{ ...dm(12), color: 'var(--text-tertiary)', margin: '8px 0 0' }}>
            Try the full legal name or EIN. Make sure spelling is correct.
          </p>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && !searchLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {searchResults.map((org, i) => {
            const is503 = org.subsection_code === '03'
            return (
              <motion.div
                key={org.ein || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectOrg(org)}
                style={{
                  ...card,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold-mid)'
                  e.currentTarget.style.boxShadow = '0 0 0 1px var(--gold-mid)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...dm(15), fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {org.name || org.sort_name}
                    </div>
                    <div style={{ ...dm(13), color: 'var(--text-secondary)', marginBottom: 6 }}>
                      EIN: {formatEIN(org.ein)}
                      {org.city && ` · ${org.city}, ${org.state}`}
                    </div>
                    {org.ruling_date && (
                      <div style={{ ...dm(12), color: 'var(--text-tertiary)' }}>
                        Ruling date: {formatRulingDate(org.ruling_date)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {is503 && (
                      <span style={{
                        ...dm(11), fontWeight: 600,
                        padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                        background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                        border: '1px solid rgba(74,222,128,0.25)',
                      }}>
                        501(c)(3)
                      </span>
                    )}
                    <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseRing { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.1; transform: scale(1.15); } }
      `}</style>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 2 — Confirm Organization Details
   ══════════════════════════════════════════════════════════════ */

function Step2Confirm({ state, dispatch }) {
  const { selectedOrg, website, contactName, contactTitle, contactEmail, contactPhone, logo, logoLoading } = state

  const fetchLogo = useCallback(async () => {
    if (!website) return
    const domain = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!domain) return
    dispatch({ type: 'SET_FIELD', field: 'logoLoading', value: true })
    const url = `https://logo.clearbit.com/${domain}`
    // Test if image loads
    const img = new Image()
    img.onload = () => {
      dispatch({ type: 'SET_FIELDS', fields: { logo: url, logoLoading: false } })
    }
    img.onerror = () => {
      dispatch({ type: 'SET_FIELDS', fields: { logo: null, logoLoading: false } })
    }
    img.src = url
  }, [website, dispatch])

  if (!selectedOrg) return null

  const is503 = selectedOrg.subsection_code === '03'
  const canContinue = contactName && contactEmail && website

  return (
    <StepWrap stepKey="step2">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Is this your organization?
      </h2>

      {/* Selected org card */}
      <div style={{
        ...card,
        border: '2px solid var(--gold-mid)',
        marginBottom: 24,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 4,
          ...dm(11), fontWeight: 600,
          padding: '3px 10px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(74,222,128,0.12)', color: '#4ade80',
          border: '1px solid rgba(74,222,128,0.25)',
        }}>
          <Check size={12} /> IRS Verified
        </div>
        <div style={{ ...dm(16), fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          {selectedOrg.name || selectedOrg.sort_name}
        </div>
        <div style={{ ...dm(13), color: 'var(--text-secondary)' }}>
          EIN: {formatEIN(selectedOrg.ein)}
          {selectedOrg.city && ` · ${selectedOrg.city}, ${selectedOrg.state}`}
        </div>
        {is503 && (
          <span style={{
            display: 'inline-block', marginTop: 8,
            ...dm(11), fontWeight: 600,
            padding: '3px 10px', borderRadius: 'var(--radius-pill)',
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
          }}>
            501(c)(3)
          </span>
        )}
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_FIELDS', fields: { step: 1, selectedOrg: null } })}
        style={{ ...dm(13), color: 'var(--gold-mid)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
      >
        <ArrowLeft size={14} /> Search again
      </button>

      {/* Contact form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Website + logo fetch */}
        <div>
          <label style={labelStyle}>Website</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={website}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'website', value: e.target.value })}
              placeholder="irusa.org"
              style={{ ...inputStyle, flex: 1 }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchLogo}
              style={{ ...ghostBtn, whiteSpace: 'nowrap', flexShrink: 0 }}
              disabled={!website || logoLoading}
            >
              {logoLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              Fetch logo <ArrowRight size={14} />
            </motion.button>
          </div>
          {/* Logo preview */}
          {logo && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={logo}
                alt="Org logo"
                style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <span style={{ ...dm(12), color: 'var(--text-tertiary)' }}>Logo loaded from Clearbit</span>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Contact Name *</label>
          <input
            value={contactName}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'contactName', value: e.target.value })}
            placeholder="Aisha Rahman"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Title</label>
          <input
            value={contactTitle}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'contactTitle', value: e.target.value })}
            placeholder="Director of Digital Fundraising"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            value={contactEmail}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'contactEmail', value: e.target.value })}
            placeholder="aisha@irusa.org"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'contactPhone', value: e.target.value })}
            placeholder="(703) 555-0192"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            ...goldBtn,
            opacity: canContinue ? 1 : 0.5,
            pointerEvents: canContinue ? 'auto' : 'none',
          }}
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 3 — Document Verification
   ══════════════════════════════════════════════════════════════ */

function Step3Docs({ state, dispatch }) {
  const { documents, verifyProgress, verifyDone, selectedOrg } = state
  const fileInputRefs = useRef({})

  const ein = selectedOrg ? formatEIN(selectedOrg.ein) : '95-3253008'

  const verifySteps = [
    `Checking EIN ${ein}...`,
    'Reviewing 501(c)(3) status...',
    'Confirming document validity...',
  ]

  const handleVerify = () => {
    dispatch({ type: 'SET_FIELD', field: 'verifyProgress', value: 0 })
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= 3) {
        clearInterval(interval)
        dispatch({ type: 'SET_FIELDS', fields: { verifyProgress: 3, verifyDone: true } })
        // Auto-advance after 800ms
        setTimeout(() => {
          dispatch({ type: 'SET_STEP', step: 4 })
        }, 800)
      } else {
        dispatch({ type: 'SET_FIELD', field: 'verifyProgress', value: step })
      }
    }, 400)
  }

  const handleReplace = (docId) => {
    const input = fileInputRefs.current[docId]
    if (input) input.click()
  }

  const handleFileChange = (docId, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const sizeKB = file.size / 1024
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`
      dispatch({ type: 'REPLACE_DOCUMENT', id: docId, fileName: file.name, size: sizeStr })
    }
  }

  return (
    <StepWrap stepKey="step3">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Upload verification documents.
      </h2>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 24 }}>
        We've pre-loaded your documents. Replace them if needed, then verify.
      </p>

      {/* Document cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {documents.map(doc => (
          <div key={doc.id} style={{
            ...card,
            borderLeft: '4px solid #4ade80',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <FileText size={28} style={{ color: '#4ade80', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)' }}>{doc.label}</div>
              <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 2 }}>
                {doc.fileName} · {doc.size}
              </div>
            </div>
            <button
              onClick={() => handleReplace(doc.id)}
              style={{ ...dm(12), color: 'var(--gold-mid)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Replace file
            </button>
            <input
              ref={el => { fileInputRefs.current[doc.id] = el }}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              style={{ display: 'none' }}
              onChange={e => handleFileChange(doc.id, e)}
            />
          </div>
        ))}
      </div>

      {/* Verification progress */}
      {verifyProgress >= 0 && (
        <div style={{ ...card, marginBottom: 20, background: verifyDone ? 'rgba(74,222,128,0.04)' : undefined, border: verifyDone ? '1px solid rgba(74,222,128,0.25)' : undefined }}>
          {verifySteps.map((label, i) => {
            const done = verifyProgress > i || verifyDone
            const active = verifyProgress === i && !verifyDone
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}
              >
                {done ? (
                  <Check size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                ) : active ? (
                  <Loader2 size={18} style={{ color: 'var(--gold-mid)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-subtle)', flexShrink: 0 }} />
                )}
                <span style={{
                  ...dm(13),
                  color: done ? '#4ade80' : active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: done || active ? 500 : 400,
                }}>
                  {done ? label.replace('...', '') : label}
                  {done && ' ✓'}
                </span>
              </motion.div>
            )
          })}
          {verifyDone && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 8, ...dm(14), fontWeight: 600, color: '#4ade80' }}
            >
              Verification complete — advancing...
            </motion.div>
          )}
        </div>
      )}

      {verifyProgress < 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
            style={{ ...ghostBtn }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={goldBtn}
            onClick={handleVerify}
          >
            Verify my organization <ArrowRight size={16} />
          </motion.button>
        </div>
      )}
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 4 — Cause Profile
   ══════════════════════════════════════════════════════════════ */

function Step4Cause({ state, dispatch }) {
  const { causeCategories, countries, mission, impactAmount, impactUnit } = state
  const [countryInput, setCountryInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = countryInput.trim()
    ? COUNTRY_SUGGESTIONS.filter(c =>
        c.toLowerCase().includes(countryInput.toLowerCase()) && !countries.includes(c)
      )
    : []

  const canContinue = causeCategories.length >= 1 && countries.length >= 1 && mission.trim().length > 0

  return (
    <StepWrap stepKey="step4">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Tell donors what you stand for.
      </h2>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 24 }}>
        This information helps donors discover and connect with your mission.
      </p>

      {/* Cause categories */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Cause Categories</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CAUSE_OPTIONS.map(cause => {
            const selected = causeCategories.includes(cause)
            return (
              <button
                key={cause}
                onClick={() => dispatch({ type: 'TOGGLE_CAUSE', cause })}
                style={{
                  ...dm(12), fontWeight: 500,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: selected ? 'rgba(212,175,55,0.15)' : 'var(--bg-overlay)',
                  color: selected ? 'var(--gold-light)' : 'var(--text-tertiary)',
                  border: selected ? '1px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {selected && <Check size={12} />}
                {cause}
              </button>
            )
          })}
        </div>
      </div>

      {/* Countries */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Countries of Operation</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {countries.map(c => (
            <span key={c} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              ...dm(11), fontWeight: 500,
              color: 'var(--teal-light)', background: 'rgba(74,173,164,0.12)',
              border: '1px solid rgba(74,173,164,0.3)',
            }}>
              {c}
              <button
                onClick={() => dispatch({ type: 'REMOVE_COUNTRY', country: c })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-light)', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={countryInput}
              onChange={e => { setCountryInput(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Add country"
              style={{ ...inputStyle, width: 200 }}
              onKeyDown={e => {
                if (e.key === 'Enter' && countryInput.trim()) {
                  dispatch({ type: 'ADD_COUNTRY', country: countryInput.trim() })
                  setCountryInput('')
                }
              }}
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              width: 200, maxHeight: 180, overflowY: 'auto',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md, 10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 10,
            }}>
              {filteredSuggestions.map(c => (
                <button
                  key={c}
                  onMouseDown={() => {
                    dispatch({ type: 'ADD_COUNTRY', country: c })
                    setCountryInput('')
                    setShowSuggestions(false)
                  }}
                  style={{
                    ...dm(13), width: '100%', padding: '8px 12px',
                    background: 'none', border: 'none', textAlign: 'left',
                    color: 'var(--text-primary)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mission */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Mission Statement</label>
        <textarea
          value={mission}
          onChange={e => {
            if (e.target.value.length <= 300) {
              dispatch({ type: 'SET_FIELD', field: 'mission', value: e.target.value })
            }
          }}
          rows={4}
          placeholder="Describe your organization's mission..."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
        <div style={{ ...dm(11), color: mission.length >= 280 ? '#ef4444' : 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>
          {mission.length}/300
        </div>
      </div>

      {/* Impact metric */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Impact Metric</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...dm(14), color: 'var(--text-primary)', fontWeight: 600 }}>$1 =</span>
          <input
            type="number"
            value={impactAmount}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'impactAmount', value: e.target.value })}
            style={{ ...inputStyle, width: 60, textAlign: 'center' }}
            min="1"
          />
          <input
            value={impactUnit}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'impactUnit', value: e.target.value })}
            placeholder="meals"
            style={{ ...inputStyle, width: 140 }}
          />
        </div>
        {impactAmount && impactUnit && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <span style={{ ...dm(13), color: 'var(--gold-light)' }}>
              Preview: "$1 = {impactAmount} {impactUnit}"
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 3 })} style={ghostBtn}>
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            ...goldBtn,
            opacity: canContinue ? 1 : 0.5,
            pointerEvents: canContinue ? 'auto' : 'none',
          }}
          onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Platform Connection Modal
   ══════════════════════════════════════════════════════════════ */

function PlatformModal({ platform, onClose, onConnect }) {
  const [inputVal, setInputVal] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [progress, setProgress] = useState(-1)
  const [done, setDone] = useState(false)
  const [sheetsPreview, setSheetsPreview] = useState(false)

  if (!platform) return null

  const connectSteps = [
    `Authenticating with ${platform.name}...`,
    `Verifying credentials...`,
    `Syncing data...`,
  ]

  const handleConnect = () => {
    if (!inputVal.trim()) return
    setConnecting(true)
    setProgress(0)
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= 3) {
        clearInterval(interval)
        setProgress(3)
        setDone(true)
        if (platform.id === 'googlesheets') {
          setSheetsPreview(true)
        } else {
          setTimeout(() => {
            const insights = {
              stripe: 'Processing $12.4k/mo',
              salesforce: '1,247 contacts synced',
              quickbooks: 'FY2026 ledger connected',
              bloomerang: '412 donor records found',
              donorbox: '3 active campaigns found',
              paypal: '$8.2k in recent transactions',
              zeffy: '2 active fundraisers',
              launchgood: '$42k lifetime raised',
              mailchimp: '3,200 subscribers synced',
              networkforgood: '890 donor records',
            }
            onConnect(platform.id, insights[platform.id] || 'Connected')
            onClose()
          }, 600)
        }
      } else {
        setProgress(step)
      }
    }, 300)
  }

  const handleImportRows = () => {
    onConnect(platform.id, '47 rows imported from Google Sheets')
    onClose()
  }

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          ...card,
          width: 440, maxWidth: '90vw',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img
            src={platform.logo}
            alt={platform.name}
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain', background: '#fff' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div>
            <div style={{ ...dm(16), fontWeight: 600, color: 'var(--text-primary)' }}>{platform.name}</div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)' }}>{platform.category}</div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {!connecting && !done && (
          <>
            <label style={labelStyle}>{platform.connectLabel}</label>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={platform.placeholder}
              style={{ ...inputStyle, marginBottom: 16 }}
              onKeyDown={e => { if (e.key === 'Enter') handleConnect() }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...goldBtn, width: '100%', justifyContent: 'center',
                opacity: inputVal.trim() ? 1 : 0.5,
                pointerEvents: inputVal.trim() ? 'auto' : 'none',
              }}
              onClick={handleConnect}
            >
              Connect <ArrowRight size={16} />
            </motion.button>
          </>
        )}

        {connecting && (
          <div style={{ padding: '8px 0' }}>
            {connectSteps.map((label, i) => {
              const stepDone = progress > i || done
              const active = progress === i && !done
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  {stepDone ? (
                    <Check size={16} style={{ color: '#4ade80' }} />
                  ) : active ? (
                    <Loader2 size={16} style={{ color: 'var(--gold-mid)', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <div style={{ width: 16, height: 16 }} />
                  )}
                  <span style={{ ...dm(13), color: stepDone ? '#4ade80' : active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {stepDone ? label.replace('...', '') + ' ✓' : label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Google Sheets preview */}
        {sheetsPreview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
            <div style={{ ...dm(13), fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Data Preview</div>
            <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', ...dm(12) }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>MOSQUE NAME</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>LAST VISIT</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-tertiary)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>AMOUNT RAISED</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dar Al-Hijrah', '2026-03-12', '$4,200'],
                    ['ICNA Houston', '2026-03-08', '$3,150'],
                    ['Masjid Al-Iman', '2026-02-28', '$1,870'],
                  ].map(([name, date, amt], i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{name}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>{date}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 500, borderBottom: '1px solid var(--border-subtle)' }}>{amt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{ ...goldBtn, width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={handleImportRows}
            >
              Import 47 rows <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

/* ══════════════════════════════════════════════════════════════
   Step 5A — Platform Integrations
   ══════════════════════════════════════════════════════════════ */

function Step5Platforms({ state, dispatch }) {
  const { connectedPlatforms, platformInsights } = state
  const [search, setSearch] = useState('')
  const [connectingPlatform, setConnectingPlatform] = useState(null)

  const filtered = search.trim()
    ? PLATFORMS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : PLATFORMS

  const handleConnect = (platformId, insight) => {
    dispatch({ type: 'CONNECT_PLATFORM', id: platformId, insight })
  }

  return (
    <StepWrap stepKey="step5a">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Connect your existing tools.
      </h2>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 20 }}>
        Integrate the platforms you already use to sync data automatically.
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search platforms..."
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Platform grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {filtered.map(platform => {
          const connected = connectedPlatforms[platform.id]
          return (
            <motion.div
              key={platform.id}
              whileHover={{ scale: 1.02 }}
              style={{
                ...card,
                padding: 16,
                cursor: connected ? 'default' : 'pointer',
                border: connected ? '2px solid #4ade80' : '1px solid var(--border-subtle)',
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
              onClick={() => { if (!connected) setConnectingPlatform(platform) }}
            >
              {/* Popular badge */}
              {platform.popular && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  ...dm(9), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '2px 6px', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(212,175,55,0.15)', color: 'var(--gold-mid)',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}>
                  Popular
                </div>
              )}
              {/* Connected badge */}
              {connected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  ...dm(10), fontWeight: 600,
                  padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                  display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  <Check size={10} /> Live
                </div>
              )}

              <img
                src={platform.logo}
                alt={platform.name}
                style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain', background: '#fff', marginBottom: 8 }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div style={{ ...dm(13), fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{platform.name}</div>
              <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>{platform.category}</div>

              {connected && platformInsights[platform.id] && (
                <div style={{ ...dm(11), color: '#4ade80', marginTop: 6, fontWeight: 500 }}>
                  {platformInsights[platform.id]}
                </div>
              )}

              {!connected && (
                <div style={{ ...dm(11), color: 'var(--gold-mid)', marginTop: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                  Connect <ArrowRight size={11} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 4 })} style={ghostBtn}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 5.5 })}
            style={{ ...dm(13), color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip for now →
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={goldBtn}
            onClick={() => dispatch({ type: 'SET_STEP', step: 5.5 })}
          >
            Continue to bank account <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* Connection modal */}
      <AnimatePresence>
        {connectingPlatform && (
          <PlatformModal
            platform={connectingPlatform}
            onClose={() => setConnectingPlatform(null)}
            onConnect={handleConnect}
          />
        )}
      </AnimatePresence>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 5B — Bank Account
   ══════════════════════════════════════════════════════════════ */

function Step5Bank({ state, dispatch }) {
  const [showToast, setShowToast] = useState(false)

  const handleChangeAccount = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <StepWrap stepKey="step5b">
      <h2 style={{ ...serif(36), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Where should we send your funds?
      </h2>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 24 }}>
        Your bank account for receiving donation settlements.
      </p>

      <div style={{
        ...card,
        border: '1px solid rgba(74,222,128,0.25)',
        background: 'rgba(74,222,128,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'rgba(74,222,128,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Landmark size={22} style={{ color: '#4ade80' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...dm(15), color: 'var(--text-primary)', fontWeight: 600 }}>
              Chase Bank ****8821 · Connected
            </div>
            <div style={{ ...dm(12), color: '#4ade80' }}>Verified</div>
          </div>
          <Check size={22} style={{ color: '#4ade80' }} />
        </div>

        <button
          onClick={handleChangeAccount}
          style={{ ...dm(12), color: 'var(--gold-mid)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, padding: 0 }}
        >
          Change account
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              marginTop: 12,
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              ...dm(13), color: '#fbbf24',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertCircle size={16} />
            Bank changes require re-verification.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button onClick={() => dispatch({ type: 'SET_STEP', step: 5 })} style={ghostBtn}>
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={goldBtn}
          onClick={() => dispatch({ type: 'SET_STEP', step: 6 })}
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Step 6 — Launch
   ══════════════════════════════════════════════════════════════ */

function Step6Launch({ state, dispatch, onLaunch }) {
  const { selectedOrg, contactName, contactEmail, causeCategories, countries, connectedPlatforms } = state

  const orgName = selectedOrg?.name || selectedOrg?.sort_name || 'Your Organization'
  const ein = selectedOrg ? formatEIN(selectedOrg.ein) : ''
  const connectedList = PLATFORMS.filter(p => connectedPlatforms[p.id]).map(p => p.name)

  const nextCards = [
    { icon: Rocket, title: 'Launch campaign', desc: 'Create your first fundraising campaign on Mizan.' },
    { icon: Users, title: 'Invite team', desc: 'Add team members to manage campaigns and donors.' },
    { icon: Zap, title: 'Connect Stripe', desc: 'Accept payments directly through your dashboard.' },
  ]

  return (
    <StepWrap stepKey="step6">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        {/* Gold radial pulse */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--gradient-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <Check size={36} style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div style={{
            position: 'absolute', inset: -16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0) 70%)',
            animation: 'launchPulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <h2 style={{ ...serif(40), color: 'var(--text-primary)', margin: '0 0 8px' }}>
          You're ready.
        </h2>
        <p style={{ ...dm(14), color: 'var(--text-tertiary)' }}>
          Your organization is verified and ready to receive donations on Mizan.
        </p>
      </div>

      {/* Summary card */}
      <div style={{
        ...card,
        border: '2px solid var(--gold-mid)',
        marginBottom: 24,
      }}>
        <div style={{ ...dm(11), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-mid)', marginBottom: 16 }}>
          Organization Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Organization', orgName],
            ['EIN', ein],
            ['Contact', `${contactName} · ${contactEmail}`],
            ['Verification', 'Tier 1 — IRS Verified'],
            ['Bank', 'Chase Bank ****8821'],
            ['Causes', causeCategories.join(', ')],
            ['Countries', countries.join(', ')],
            ['Connected platforms', connectedList.length > 0 ? connectedList.join(', ') : 'None yet'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ ...dm(13), color: 'var(--text-tertiary)', flexShrink: 0 }}>{label}</span>
              <span style={{ ...dm(13), color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's next cards */}
      <div style={{ ...dm(12), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
        What's next
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {nextCards.map(({ icon: Icon, title, desc }) => (
          <div key={title} style={{ ...card, padding: 16 }}>
            <Icon size={24} style={{ color: 'var(--gold-mid)', marginBottom: 8 }} />
            <div style={{ ...dm(14), fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Launch button */}
      <div style={{ textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            ...goldBtn,
            height: 56,
            fontSize: 16,
            padding: '0 40px',
          }}
          onClick={onLaunch}
        >
          Enter my dashboard <ArrowRight size={18} />
        </motion.button>
      </div>

      <style>{`
        @keyframes launchPulse {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.3; transform: scale(1.2); }
          100% { opacity: 0.1; transform: scale(1.4); }
        }
      `}</style>
    </StepWrap>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Setup Component
   ══════════════════════════════════════════════════════════════ */

export default function NGOSetup() {
  const navigate = useNavigate()
  const { org, completeOnboarding } = useNGOPartner()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLaunch = () => {
    completeOnboarding()
    navigate('/ngo')
  }

  const fadeIn = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  }

  return (
    <div style={{ padding: '24px 16px 60px', maxWidth: 780, margin: '0 auto', ...fadeIn }}>
      {/* Top back link */}
      <button
        onClick={() => navigate('/')}
        style={{
          ...dm(13), color: 'var(--text-tertiary)', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <ArrowLeft size={14} /> Back to Welcome
      </button>

      <h1 style={{ ...serif(28), color: 'var(--text-primary)', margin: '0 0 8px' }}>
        Partner Setup
      </h1>
      <p style={{ ...dm(14), color: 'var(--text-tertiary)', marginBottom: 28 }}>
        Complete these steps to activate your Mizan partner dashboard.
      </p>

      <StepIndicator current={state.step} />

      <div style={card}>
        <AnimatePresence mode="wait">
          {state.step === 1 && <Step1IRS key="s1" state={state} dispatch={dispatch} />}
          {state.step === 2 && <Step2Confirm key="s2" state={state} dispatch={dispatch} />}
          {state.step === 3 && <Step3Docs key="s3" state={state} dispatch={dispatch} />}
          {state.step === 4 && <Step4Cause key="s4" state={state} dispatch={dispatch} />}
          {state.step === 5 && <Step5Platforms key="s5a" state={state} dispatch={dispatch} />}
          {state.step === 5.5 && <Step5Bank key="s5b" state={state} dispatch={dispatch} />}
          {state.step === 6 && <Step6Launch key="s6" state={state} dispatch={dispatch} onLaunch={handleLaunch} />}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
