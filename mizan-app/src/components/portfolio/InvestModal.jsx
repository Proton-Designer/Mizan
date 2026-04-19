import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  User,
  Plus,
  Check,
  Infinity,
} from 'lucide-react'
import { usePortfolio } from '../../context/PortfolioContext'
import { useNGO } from '../../context/NGOContext'
import {
  computeQardhassanDemand,
  computeImpactPreview,
} from '../../utils/algorithms'

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */

const QUICK_AMOUNTS = [25, 50, 100, 250, 500]
const CYCLE_OPTIONS = [1, 2, 3, 5, 10, null] // null = Jariyah

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
}

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

function fmt(n) {
  if (typeof n === 'string') return n
  return new Intl.NumberFormat('en-US').format(n)
}

function fmtDollars(n) {
  if (typeof n === 'string') return n
  return '$' + fmt(n)
}

function categoryLabel(cat) {
  if (!cat) return ''
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

/* ──────────────────────────────────────────────
   PROGRESS DOTS
   ────────────────────────────────────────────── */

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? 'var(--gold-mid)' : 'var(--bg-overlay)',
            transition: 'var(--transition-base)',
          }}
        />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────
   CAUSE HEADER BAR (shown when NGO is pre-selected)
   ────────────────────────────────────────────── */

function CauseHeader({ ngo }) {
  if (!ngo) return null
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-lg)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <img
        src={ngo.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&size=24&background=1E1E2A&color=D4A843`}
        alt=""
        style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
        {ngo.name}
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--gold-glow)',
          color: 'var(--text-gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {categoryLabel(ngo.category)}
      </span>
    </div>
  )
}

/* ──────────────────────────────────────────────
   LIVE IMPACT PREVIEW BAR
   ────────────────────────────────────────────── */

function ImpactPreview({ amount, investType, cycles, splitPercent, ngo }) {
  const preview = useMemo(() => {
    if (!amount || amount <= 0 || !ngo) return null

    if (investType === 'direct') {
      return computeImpactPreview(amount, 'direct', 0, 100, ngo)
    }
    if (cycles === null) {
      return computeImpactPreview(amount, 'jariyah', null, 100, ngo)
    }
    return computeImpactPreview(amount, 'compound', cycles, splitPercent, ngo)
  }, [amount, investType, cycles, splitPercent, ngo])

  if (!preview || !ngo) return null

  let text = ''
  if (investType === 'direct') {
    const meals = preview.familiesTotal
    text = `${fmtDollars(amount)} \u2192 ${ngo.name} \u2192 ${meals} ${ngo.impactUnit || 'meals'} funded \u2192 Delivered today`
  } else if (cycles === null) {
    const tier = amount <= 500 ? 3 : amount <= 2000 ? 5 : 8
    text = `A family helped every ~${tier} months, forever.`
  } else {
    text = `~${preview.familiesTotal} families helped over ~${preview.estimatedMonths} months, total good: ${fmtDollars(preview.totalRealWorldGood)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'var(--gold-glow)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-tertiary)',
          margin: 0,
          marginBottom: 4,
        }}
      >
        Live Impact Preview
      </p>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: 'var(--text-gold)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════
   MAIN INVEST MODAL
   ══════════════════════════════════════════════ */

export default function InvestModal() {
  const {
    investModalOpen,
    investPreselectedNgo,
    closeInvest,
    bankBalance,
    borrowerPool,
    vaultPersons,
    addVaultPerson,
    investDirect,
    investCompound,
    incrementStreak,
    setReflectionData,
    tagPositionToVault,
  } = usePortfolio()

  const { ngoDatabase, getNgoById, searchNgos } = useNGO()

  /* ── Local State ── */
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedNgo, setSelectedNgo] = useState(null)
  const [amount, setAmount] = useState('')
  const [investType, setInvestType] = useState(null) // 'direct' | 'compound'
  const [cycles, setCycles] = useState(1)
  const [splitPercent, setSplitPercent] = useState(100)
  const [vaultPersonId, setVaultPersonId] = useState(null)
  const [algorithmResult, setAlgorithmResult] = useState(null)
  const [isComputing, setIsComputing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newVaultName, setNewVaultName] = useState('')
  const [showAddVault, setShowAddVault] = useState(false)

  const amountNum = useMemo(() => {
    const n = parseFloat(amount)
    return isNaN(n) ? 0 : n
  }, [amount])

  const inputRef = useRef(null)

  /* ── Determine if cause selection step is skipped ── */
  const skipCauseSelection = !!investPreselectedNgo

  /* ── Build the step sequence based on invest type ── */
  const steps = useMemo(() => {
    const s = []
    if (!skipCauseSelection) s.push('cause')       // Step: Cause Selection
    s.push('amount')                                // Step: Amount
    s.push('type')                                  // Step: Direct or Compound
    // Compound-only steps added dynamically after type selection
    if (investType === 'compound') {
      s.push('algorithm')                           // Step: Algorithm Output
      s.push('cycles')                              // Step: Cycles & Split
    }
    s.push('vault')                                 // Step: Vault Tag
    s.push('confirm')                               // Step: Confirm
    return s
  }, [skipCauseSelection, investType])

  const currentStepName = steps[step] || 'cause'
  const totalSteps = steps.length

  /* ── Reset state when modal opens/closes ── */
  useEffect(() => {
    if (investModalOpen) {
      setStep(0)
      setDirection(1)
      setAmount('')
      setInvestType(null)
      setCycles(1)
      setSplitPercent(100)
      setVaultPersonId(null)
      setAlgorithmResult(null)
      setIsComputing(false)
      setSearchQuery('')
      setNewVaultName('')
      setShowAddVault(false)

      if (investPreselectedNgo) {
        const ngo = getNgoById(investPreselectedNgo)
        setSelectedNgo(ngo)
      } else {
        setSelectedNgo(null)
      }
    }
  }, [investModalOpen, investPreselectedNgo, getNgoById])

  /* ── Pre-select invest type based on urgency when NGO is chosen ── */
  useEffect(() => {
    if (selectedNgo && investType === null) {
      if (selectedNgo.urgencyScore > 0.7) {
        setInvestType('direct')
      } else {
        setInvestType('compound')
      }
    }
  }, [selectedNgo, investType])

  /* ── Run algorithm computation when entering algorithm step ── */
  const computeTimerRef = useRef(null)
  useEffect(() => {
    // Only trigger when we land on the algorithm step with no result yet
    if (currentStepName !== 'algorithm') return
    if (algorithmResult || isComputing) return

    setIsComputing(true)
    computeTimerRef.current = setTimeout(() => {
      const result = computeQardhassanDemand(
        amountNum,
        selectedNgo?.id,
        borrowerPool
      )
      setAlgorithmResult(result)
      setIsComputing(false)
    }, 600)

    return () => {
      if (computeTimerRef.current) clearTimeout(computeTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepName])

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [totalSteps])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  /* ── Lock split to 100% for jariyah ── */
  useEffect(() => {
    if (cycles === null) {
      setSplitPercent(100)
    }
  }, [cycles])

  /* ── Validate whether Continue is allowed ── */
  const canContinue = useMemo(() => {
    switch (currentStepName) {
      case 'cause':
        return !!selectedNgo
      case 'amount':
        return amountNum > 0 && amountNum <= bankBalance
      case 'type':
        return !!investType
      case 'algorithm':
        return !isComputing && !!algorithmResult
      case 'cycles':
        return true
      case 'vault':
        return true
      case 'confirm':
        return true
      default:
        return false
    }
  }, [currentStepName, selectedNgo, amountNum, bankBalance, investType, isComputing, algorithmResult])

  /* ── Handle commit ── */
  const handleCommit = useCallback(() => {
    if (amountNum <= 0 || amountNum > bankBalance) return

    let result
    if (investType === 'direct') {
      result = investDirect(amountNum, selectedNgo)
    } else {
      result = investCompound(amountNum, selectedNgo, cycles, splitPercent)
    }

    if (result?.success) {
      // Tag vault person if selected
      if (vaultPersonId && result.positionId) {
        tagPositionToVault(result.positionId, vaultPersonId)
      }

      incrementStreak()

      // Build reflection data
      const preview = investType === 'direct'
        ? computeImpactPreview(amountNum, 'direct', 0, 100, selectedNgo)
        : cycles === null
          ? computeImpactPreview(amountNum, 'jariyah', null, 100, selectedNgo)
          : computeImpactPreview(amountNum, 'compound', cycles, splitPercent, selectedNgo)

      setReflectionData({
        type: investType,
        amount: amountNum,
        ngoName: selectedNgo.name,
        ngoId: selectedNgo.id,
        cycles,
        splitPercent,
        familiesTotal: preview.familiesTotal,
        totalRealWorldGood: preview.totalRealWorldGood,
        estimatedMonths: preview.estimatedMonths,
        vaultPersonId,
        vaultPersonName: vaultPersonId
          ? vaultPersons.find((v) => v.id === vaultPersonId)?.name
          : null,
        positionId: result.positionId,
        timestamp: new Date().toISOString(),
      })

      closeInvest()
    }
  }, [
    amountNum,
    bankBalance,
    investType,
    investDirect,
    investCompound,
    selectedNgo,
    cycles,
    splitPercent,
    vaultPersonId,
    tagPositionToVault,
    incrementStreak,
    setReflectionData,
    vaultPersons,
    closeInvest,
  ])

  /* ── Filtered NGO list for cause selection ── */
  // Search curated database (synchronous, no API calls)
  const filteredNgos = useMemo(() => {
    if (!searchQuery.trim()) return ngoDatabase
    return searchNgos(searchQuery)
  }, [searchQuery, ngoDatabase, searchNgos])

  /* ── Handle add vault person ── */
  const handleAddVaultPerson = useCallback(() => {
    if (!newVaultName.trim()) return
    const id = addVaultPerson({
      name: newVaultName.trim(),
      relationship: '',
      type: 'memorial',
      photo: null,
      note: '',
    })
    setVaultPersonId(id)
    setShowAddVault(false)
    setNewVaultName('')
  }, [newVaultName, addVaultPerson])

  /* ── Summary data for confirm step ── */
  const confirmPreview = useMemo(() => {
    if (!selectedNgo || amountNum <= 0) return null
    if (investType === 'direct') {
      return computeImpactPreview(amountNum, 'direct', 0, 100, selectedNgo)
    }
    if (cycles === null) {
      return computeImpactPreview(amountNum, 'jariyah', null, 100, selectedNgo)
    }
    return computeImpactPreview(amountNum, 'compound', cycles, splitPercent, selectedNgo)
  }, [amountNum, investType, cycles, splitPercent, selectedNgo])

  const vaultPerson = vaultPersonId ? vaultPersons.find((v) => v.id === vaultPersonId) : null

  /* ── Portal guard (AFTER all hooks) ── */
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot || !investModalOpen) return null

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeInvest}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* ── Dialog ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 'var(--space-2xl)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Close Button ── */}
        <button
          onClick={closeInvest}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            transition: 'var(--transition-fast)',
            zIndex: 2,
          }}
        >
          <X size={16} />
        </button>

        {/* ── Progress Dots ── */}
        <ProgressDots current={step} total={totalSteps} />

        {/* ── Pre-selected Cause Header ── */}
        {skipCauseSelection && currentStepName !== 'confirm' && (
          <CauseHeader ngo={selectedNgo} />
        )}

        {/* ── Step Content ── */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─────────────────────────────────────
               STEP: CAUSE SELECTION
               ───────────────────────────────────── */}
            {currentStepName === 'cause' && (
              <motion.div
                key="cause"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>Choose a Cause</h2>
                <p style={styles.subtext}>Where would you like your giving to go?</p>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-tertiary)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, category, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Results list */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-xs)',
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {filteredNgos.map((ngo) => (
                    <motion.button
                      key={ngo.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedNgo(ngo)
                        setInvestType(null) // reset so urgency-based pre-selection runs
                        setDirection(1)
                        setStep((s) => s + 1)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: '10px var(--space-md)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <img
                        src={ngo.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&size=24&background=1E1E2A&color=D4A843`}
                        alt=""
                        style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                        {ngo.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: 'var(--gold-glow)',
                          color: 'var(--text-gold)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                        }}
                      >
                        {categoryLabel(ngo.category)}
                      </span>
                    </motion.button>
                  ))}
                  {filteredNgos.length === 0 && searchQuery.trim() && (
                    <p style={{ ...styles.subtext, textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                      No causes match "{searchQuery}". Try a different search term.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: AMOUNT
               ───────────────────────────────────── */}
            {currentStepName === 'amount' && (
              <motion.div
                key="amount"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>How much?</h2>
                <p style={styles.subtext}>Enter the amount you want to give</p>

                {/* Large number input */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    margin: 'var(--space-xl) 0 var(--space-md)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 48,
                      fontWeight: 600,
                      color: 'var(--text-gold)',
                      marginRight: 4,
                    }}
                  >
                    $
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, '')
                      // Allow only one decimal point, max 2 decimals
                      const parts = val.split('.')
                      if (parts.length > 2) return
                      if (parts[1] && parts[1].length > 2) return
                      setAmount(val)
                    }}
                    placeholder="0"
                    autoFocus
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 48,
                      fontWeight: 600,
                      color: 'var(--text-gold)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: amountNum > bankBalance
                        ? '2px solid var(--status-red)'
                        : '2px solid var(--gold-mid)',
                      outline: 'none',
                      textAlign: 'center',
                      width: '60%',
                      maxWidth: 280,
                      caretColor: 'var(--gold-mid)',
                      padding: '0 0 4px',
                    }}
                  />
                </div>

                {/* Quick-select chips */}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--space-lg)',
                  }}
                >
                  {QUICK_AMOUNTS.map((qa) => {
                    const isSelected = amountNum === qa
                    return (
                      <button
                        key={qa}
                        onClick={() => setAmount(String(qa))}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          padding: '6px 16px',
                          borderRadius: 'var(--radius-pill)',
                          background: isSelected ? 'var(--gold-glow-strong)' : 'var(--bg-elevated)',
                          border: isSelected ? '1px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
                          color: isSelected ? 'var(--text-gold)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        ${qa}
                      </button>
                    )
                  })}
                </div>

                {/* Balance info */}
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: amountNum > bankBalance ? 'var(--status-red)' : 'var(--text-tertiary)',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {amountNum > bankBalance
                    ? `Insufficient funds \u2014 you have ${fmtDollars(bankBalance)} available`
                    : `Your balance: ${fmtDollars(bankBalance)} \u2192 after this: ${fmtDollars(bankBalance - amountNum)}`}
                </p>
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: DIRECT OR COMPOUND
               ───────────────────────────────────── */}
            {currentStepName === 'type' && (
              <motion.div
                key="type"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>How should it flow?</h2>
                <p style={styles.subtext}>Choose how your giving reaches the cause</p>

                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                  {/* Direct Card */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInvestType('direct')
                      setAlgorithmResult(null)
                    }}
                    style={{
                      flex: 1,
                      padding: 'var(--space-xl) var(--space-md)',
                      background: investType === 'direct'
                        ? 'rgba(96, 165, 250, 0.1)'
                        : 'var(--bg-elevated)',
                      border: investType === 'direct'
                        ? '2px solid var(--status-blue)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: investType === 'direct'
                          ? 'rgba(96, 165, 250, 0.15)'
                          : 'var(--bg-overlay)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={22} color={investType === 'direct' ? 'var(--status-blue)' : 'var(--text-tertiary)'} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20,
                        fontWeight: 600,
                        color: investType === 'direct' ? 'var(--status-blue)' : 'var(--text-primary)',
                      }}
                    >
                      Direct
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      Money reaches the cause today
                    </span>
                    {investType === 'direct' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--status-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} color="var(--text-inverse)" />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Compound Card */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInvestType('compound')
                      setAlgorithmResult(null)
                    }}
                    style={{
                      flex: 1,
                      padding: 'var(--space-xl) var(--space-md)',
                      background: investType === 'compound'
                        ? 'var(--gold-glow)'
                        : 'var(--bg-elevated)',
                      border: investType === 'compound'
                        ? '2px solid var(--gold-mid)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: investType === 'compound'
                          ? 'var(--gold-glow-strong)'
                          : 'var(--bg-overlay)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RefreshCw size={22} color={investType === 'compound' ? 'var(--gold-mid)' : 'var(--text-tertiary)'} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20,
                        fontWeight: 600,
                        color: investType === 'compound' ? 'var(--text-gold)' : 'var(--text-primary)',
                      }}
                    >
                      Compound
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      Money works through qard hassan loans first
                    </span>
                    {investType === 'compound' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--gold-mid)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} color="var(--text-inverse)" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: ALGORITHM OUTPUT (Compound only)
               ───────────────────────────────────── */}
            {currentStepName === 'algorithm' && (
              <motion.div
                key="algorithm"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>Pool Analysis</h2>
                <p style={styles.subtext}>Computing how your money will be deployed...</p>

                {isComputing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-2xl) 0' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 size={32} color="var(--gold-mid)" />
                    </motion.div>
                    <p style={{ ...styles.subtext, marginTop: 'var(--space-md)' }}>Computing...</p>
                  </div>
                ) : algorithmResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-xl)',
                      marginTop: 'var(--space-lg)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        margin: '0 0 var(--space-lg) 0',
                      }}
                    >
                      Based on current pool demand:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <p style={styles.metricLabel}>Cycle Time Estimate</p>
                        <p style={styles.metricValue}>
                          {algorithmResult.rangeMin}&ndash;{algorithmResult.rangeMax} months
                        </p>
                      </div>
                      <div>
                        <p style={styles.metricLabel}>Families Per Cycle</p>
                        <p style={styles.metricValue}>{algorithmResult.familiesPerCycle}</p>
                      </div>
                    </div>

                    {/* Deployment shape */}
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                      <p style={styles.metricLabel}>Deployment Shape</p>
                      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        {[
                          { label: 'Micro', count: algorithmResult.deploymentShape.micro, color: 'var(--status-green)' },
                          { label: 'Standard', count: algorithmResult.deploymentShape.standard, color: 'var(--status-blue)' },
                          { label: 'Major', count: algorithmResult.deploymentShape.major, color: 'var(--gold-mid)' },
                        ].map((tier) => (
                          <div
                            key={tier.label}
                            style={{
                              flex: 1,
                              padding: 'var(--space-sm)',
                              background: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-sm)',
                              textAlign: 'center',
                            }}
                          >
                            <p style={{ ...styles.metricValue, fontSize: 20, color: tier.color }}>{tier.count}</p>
                            <p style={{ ...styles.metricLabel, marginTop: 2 }}>{tier.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: CYCLES & SPLIT (Compound only)
               ───────────────────────────────────── */}
            {currentStepName === 'cycles' && (
              <motion.div
                key="cycles"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>Cycles & Split</h2>
                <p style={styles.subtext}>How many times should your money cycle?</p>

                {/* Cycle chips */}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    margin: 'var(--space-xl) 0 var(--space-xl)',
                  }}
                >
                  {CYCLE_OPTIONS.map((c) => {
                    const isJariyah = c === null
                    const isSelected = cycles === c
                    return (
                      <button
                        key={c === null ? 'jariyah' : c}
                        onClick={() => setCycles(c)}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: isJariyah ? 13 : 16,
                          fontWeight: isSelected ? 600 : 500,
                          padding: isJariyah ? '8px 20px' : '8px 18px',
                          borderRadius: 'var(--radius-pill)',
                          background: isSelected
                            ? isJariyah
                              ? 'linear-gradient(135deg, var(--gold-mid), var(--status-green))'
                              : 'var(--gold-glow-strong)'
                            : 'var(--bg-elevated)',
                          border: isSelected
                            ? isJariyah
                              ? '1px solid var(--status-green)'
                              : '1px solid var(--gold-mid)'
                            : '1px solid var(--border-subtle)',
                          color: isSelected
                            ? isJariyah
                              ? 'var(--text-inverse)'
                              : 'var(--text-gold)'
                            : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isJariyah ? (
                          <>
                            <Infinity size={14} />
                            Jariyah
                          </>
                        ) : (
                          c
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Split slider (hidden for Jariyah) */}
                {cycles !== null && (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-sm)' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)' }}>
                        Sadaqah split after cycles
                      </span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-gold)' }}>
                        {splitPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={splitPercent}
                      onChange={(e) => setSplitPercent(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--gold-mid)',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)' }}>
                        0% (return all)
                      </span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'var(--text-tertiary)' }}>
                        100% (donate all)
                      </span>
                    </div>

                    {/* Hadith for below 100% */}
                    {splitPercent < 100 && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 14,
                          fontStyle: 'italic',
                          color: 'var(--text-gold)',
                          textAlign: 'center',
                          margin: 'var(--space-lg) 0 0',
                          lineHeight: 1.6,
                          padding: '0 var(--space-md)',
                        }}
                      >
                        &ldquo;Every loan given is sadaqah until it is repaid&rdquo; &mdash; Ibn Majah
                      </motion.p>
                    )}
                  </div>
                )}

                {cycles === null && (
                  <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      Your money cycles forever &mdash; 100% dedicated as perpetual sadaqah jariyah.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: VAULT TAG
               ───────────────────────────────────── */}
            {currentStepName === 'vault' && (
              <motion.div
                key="vault"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>Give in someone&apos;s name?</h2>
                <p style={styles.subtext}>Tag this gift to your Jariyah Vault (optional)</p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-sm)',
                    marginTop: 'var(--space-lg)',
                    marginBottom: 'var(--space-md)',
                  }}
                >
                  {vaultPersons.map((person) => {
                    const isSelected = vaultPersonId === person.id
                    return (
                      <motion.button
                        key={person.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setVaultPersonId(isSelected ? null : person.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-md)',
                          padding: 'var(--space-md)',
                          background: isSelected ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                          border: isSelected ? '1.5px solid var(--gold-mid)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: isSelected ? 'var(--gold-glow-strong)' : 'var(--bg-overlay)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {person.photo ? (
                            <img src={person.photo} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <User size={16} color={isSelected ? 'var(--gold-mid)' : 'var(--text-tertiary)'} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 14,
                              fontWeight: 500,
                              color: isSelected ? 'var(--text-gold)' : 'var(--text-primary)',
                              margin: 0,
                            }}
                          >
                            {person.name}
                          </p>
                          {person.relationship && (
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                              {person.relationship}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={16} color="var(--gold-mid)" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}

                  {/* Add someone */}
                  {!showAddVault ? (
                    <button
                      onClick={() => setShowAddVault(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-md)',
                        background: 'transparent',
                        border: '1px dashed var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        color: 'var(--text-tertiary)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                      }}
                    >
                      <Plus size={16} />
                      Add someone
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                        padding: 'var(--space-sm)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter their name..."
                        value={newVaultName}
                        onChange={(e) => setNewVaultName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddVaultPerson()
                          if (e.key === 'Escape') setShowAddVault(false)
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-deep)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleAddVaultPerson}
                        disabled={!newVaultName.trim()}
                        style={{
                          padding: '8px 16px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          background: newVaultName.trim() ? 'var(--gold-mid)' : 'var(--bg-overlay)',
                          color: newVaultName.trim() ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: newVaultName.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Skip link */}
                <button
                  onClick={goNext}
                  style={{
                    display: 'block',
                    margin: 'var(--space-md) auto 0',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Skip
                </button>
              </motion.div>
            )}

            {/* ─────────────────────────────────────
               STEP: CONFIRM
               ───────────────────────────────────── */}
            {currentStepName === 'confirm' && (
              <motion.div
                key="confirm"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 style={styles.heading}>Confirm Your Gift</h2>

                {/* Summary card */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-xl)',
                    marginTop: 'var(--space-lg)',
                  }}
                >
                  {/* NGO */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                    <img
                      src={selectedNgo?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedNgo?.name || '')}&size=32&background=1E1E2A&color=D4A843`}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {selectedNgo?.name}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                        {categoryLabel(selectedNgo?.category)}
                      </p>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md) var(--space-lg)' }}>
                    <div>
                      <p style={styles.metricLabel}>Amount</p>
                      <p style={{ ...styles.metricValue, color: 'var(--text-gold)' }}>{fmtDollars(amountNum)}</p>
                    </div>
                    <div>
                      <p style={styles.metricLabel}>Type</p>
                      <p style={styles.metricValue}>
                        {investType === 'direct' ? 'Direct Sadaqah' : cycles === null ? 'Jariyah (Perpetual)' : 'Compound'}
                      </p>
                    </div>

                    {investType === 'compound' && (
                      <>
                        <div>
                          <p style={styles.metricLabel}>Cycles</p>
                          <p style={styles.metricValue}>{cycles === null ? '\u221E Jariyah' : cycles}</p>
                        </div>
                        <div>
                          <p style={styles.metricLabel}>Split</p>
                          <p style={styles.metricValue}>{splitPercent}% sadaqah</p>
                        </div>
                      </>
                    )}

                    {confirmPreview && (
                      <>
                        <div>
                          <p style={styles.metricLabel}>Families Helped</p>
                          <p style={styles.metricValue}>{typeof confirmPreview.familiesTotal === 'number' ? fmt(confirmPreview.familiesTotal) : confirmPreview.familiesTotal}</p>
                        </div>
                        <div>
                          <p style={styles.metricLabel}>Total Good</p>
                          <p style={styles.metricValue}>
                            {typeof confirmPreview.totalRealWorldGood === 'number' ? fmtDollars(confirmPreview.totalRealWorldGood) : confirmPreview.totalRealWorldGood}
                          </p>
                        </div>
                        {confirmPreview.estimatedMonths !== 0 && (
                          <div>
                            <p style={styles.metricLabel}>Timeline</p>
                            <p style={styles.metricValue}>
                              {typeof confirmPreview.estimatedMonths === 'number' ? `~${confirmPreview.estimatedMonths} months` : confirmPreview.estimatedMonths}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {vaultPerson && (
                      <div>
                        <p style={styles.metricLabel}>In the name of</p>
                        <p style={{ ...styles.metricValue, color: 'var(--text-gold)' }}>{vaultPerson.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCommit}
                  style={{
                    width: '100%',
                    height: 56,
                    marginTop: 'var(--space-xl)',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--gradient-gold)',
                    color: 'var(--text-inverse)',
                    border: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-gold)',
                    transition: 'var(--transition-base)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-sm)',
                  }}
                >
                  Commit {fmtDollars(amountNum)}
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Live Impact Preview (persistent) ── */}
        {selectedNgo && amountNum > 0 && currentStepName !== 'cause' && currentStepName !== 'confirm' && (
          <ImpactPreview
            amount={amountNum}
            investType={investType || 'direct'}
            cycles={investType === 'compound' ? cycles : 0}
            splitPercent={investType === 'compound' ? splitPercent : 100}
            ngo={selectedNgo}
          />
        )}

        {/* ── Bottom Navigation (Back / Continue) ── */}
        {currentStepName !== 'cause' && currentStepName !== 'confirm' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-xl)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={goBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: 'var(--text-tertiary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <motion.button
              whileHover={canContinue ? { scale: 1.02 } : {}}
              whileTap={canContinue ? { scale: 0.98 } : {}}
              onClick={canContinue ? goNext : undefined}
              disabled={!canContinue}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: canContinue ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                background: canContinue ? 'var(--gradient-gold)' : 'var(--bg-overlay)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '10px 24px',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                boxShadow: canContinue ? 'var(--shadow-gold)' : 'none',
                transition: 'var(--transition-base)',
              }}
            >
              Continue
              <ChevronRight size={16} />
            </motion.button>
          </div>
        )}

        {/* Back button on confirm step */}
        {currentStepName === 'confirm' && (
          <button
            onClick={goBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              marginTop: 'var(--space-md)',
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </motion.div>
    </motion.div>,
    modalRoot
  )
}

/* ──────────────────────────────────────────────
   SHARED STYLES
   ────────────────────────────────────────────── */

const styles = {
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 600,
    color: 'var(--text-primary)',
    textAlign: 'center',
    margin: 0,
    marginBottom: 'var(--space-xs)',
  },
  subtext: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: 0,
    marginBottom: 'var(--space-md)',
  },
  metricLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'var(--text-tertiary)',
    margin: 0,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
}
