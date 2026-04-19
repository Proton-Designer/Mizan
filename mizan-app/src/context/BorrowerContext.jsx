import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { computeNeedScore, assignTier, computeFeasibility, computeDecision } from '../utils/algorithms'

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const SEED_APPLICATION = {
  applicationId: 'QH-2847',
  loanAmount: 500,
  purpose: 'Car repair',
  purposeCategory: 'car_repair',
  urgency: 'high',
  grossMonthlyIncome: 2000,
  monthlyDebts: 1200,
  householdSize: 3,
  dependents: 2,
  mosqueName: 'UT Austin MSA',
  mosqueTenure: 'long',
  imamName: 'Sheikh Abdullah',
  imamPhone: '+1 (512) 555-0192',
  repaymentFrequency: 'monthly',
  proposedMonthlyPayment: 100,
  submittedAt: '2026-04-18T15:42:00Z',
  fullName: 'Omar Al-Rashid',
  dateOfBirth: '1994-07-15',
  phone: '+1 (512) 555-8847',
  phoneVerified: true,
  address: '2400 Nueces St, Austin, TX 78705',
  // Pre-computed scores
  needScore: 72,
  needBreakdown: { income: 20, urgency: 20, dependents: 15, trust: 17 },
  vouchScore: 17,
  tier: { name: 'Standard', maxAmount: 2000, expectedMonths: 5 },
  feasibility: { feasible: true, monthlyPayment: 100, discretionaryIncome: 700, utilizationPercent: 14.3 },
}

const SEED_LOAN_HISTORY = [
  {
    id: 'loan-hist-1',
    amount: 200,
    tier: 'Micro',
    startDate: '2024-10-01',
    endDate: '2024-12-03',
    monthsTaken: 2.1,
    status: 'paid_full',
    purpose: 'Utility bills',
  },
  {
    id: 'loan-hist-2',
    amount: 300,
    tier: 'Standard',
    startDate: '2025-03-01',
    endDate: '2025-07-15',
    monthsTaken: 4.5,
    status: 'paid_full',
    purpose: 'Medical co-pay',
  },
]

const SEED_ACTIVE_LOAN = {
  id: 'loan-active-1',
  amount: 500,
  remaining: 400,
  monthlyPayment: 100,
  tier: 'Standard',
  purpose: 'Car repair',
  startDate: '2026-04-18',
  destinationCause: 'Yemen Orphan Fund',
  destinationNgo: 'Islamic Relief USA',
  schedule: [
    { date: '2026-04-18', amount: 100, status: 'paid' },
    { date: '2026-05-18', amount: 100, status: 'due' },
    { date: '2026-06-18', amount: 100, status: 'upcoming' },
    { date: '2026-07-18', amount: 100, status: 'upcoming' },
    { date: '2026-08-18', amount: 100, status: 'upcoming' },
  ],
  redeploymentStories: [
    'a student in Chicago covering tuition — $300 loan',
    'a family in Phoenix for utility bills — $200 loan',
    'a worker in Detroit for car repair — $450 loan',
    'a single parent in Minneapolis for rent — $800 loan',
    'Your final payment completes your loan. Your full $500 has cycled through 5 families. JazakAllahu Khayran.',
  ],
  currentRedeploymentIndex: 0,
  paymentsCompleted: 1,
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const BorrowerContext = createContext(null)

export function BorrowerProvider({ children }) {
  // ---- Application flow ----
  const [applicationStage, setApplicationStage] = useState(null) // null = no active application
  const [draftApplication, setDraftApplication] = useState({})
  const [extractedData, setExtractedData] = useState(null)
  const [submittedApplication, setSubmittedApplication] = useState(SEED_APPLICATION)
  const [extracting, setExtracting] = useState(false)

  // ---- Decision ----
  const [decisionOutcome, setDecisionOutcome] = useState(null) // 'approved'|'reduced'|'denied'
  const [offeredAmount, setOfferedAmount] = useState(350)
  const [decisionReason, setDecisionReason] = useState('')
  const [computedDecision, setComputedDecision] = useState(null) // full decision object from computeDecision()

  // ---- Loan ----
  const [activeLoan, setActiveLoan] = useState(null)
  const [loanHistory, setLoanHistory] = useState(SEED_LOAN_HISTORY)
  const [communityTrustLevel, setCommunityTrustLevel] = useState(4)

  // ---- Banking ----
  const [checkingBalance, setCheckingBalance] = useState(847)
  const [bankName] = useState('University Credit Union')
  const [bankLast4] = useState('9273')
  const [bankLinked, setBankLinked] = useState(false)
  const [borrowerTransactions, setBorrowerTransactions] = useState([])

  // ---- Hardship ----
  const [hardshipPath, setHardshipPath] = useState(null)
  const [extensionGranted, setExtensionGranted] = useState(false)
  const [conversionPending, setConversionPending] = useState(false)
  const [conversionConfirmed, setConversionConfirmed] = useState(false)

  // ---- Loan Draft (persisted to localStorage) ----
  const [loanDraft, setLoanDraft] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_loan_draft')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [pendingDecision, setPendingDecision] = useState(null)

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  const logBorrowerTransaction = useCallback((type, amount, description, balanceAfter) => {
    setBorrowerTransactions(prev => [
      {
        id: `btx-${Date.now()}`,
        type,
        amount,
        description,
        balanceAfter,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  // -----------------------------------------------------------------------
  // Banking Operations
  // -----------------------------------------------------------------------

  const receiveDisbursement = useCallback((amount) => {
    setCheckingBalance(prev => prev + amount)
    setBankLinked(true)
    logBorrowerTransaction('loan_disbursement', amount, `Qard hassan loan disbursement — $${amount}`, checkingBalance + amount)
  }, [checkingBalance, logBorrowerTransaction])

  const makePayment = useCallback((amount) => {
    if (amount > checkingBalance) return { success: false, reason: 'insufficient_funds' }

    const newBalance = checkingBalance - amount
    setCheckingBalance(newBalance)

    setActiveLoan(prev => {
      if (!prev) return prev

      const newRemaining = prev.remaining - amount
      const newPaymentsCompleted = prev.paymentsCompleted + 1

      // Find first 'due', mark paid
      let markedPaid = false
      const fixedSchedule = prev.schedule.map(item => {
        if (!markedPaid && item.status === 'due') {
          markedPaid = true
          return { ...item, status: 'paid' }
        }
        return item
      })

      // Find first 'upcoming', mark 'due'
      let markedDue = false
      const finalSchedule = fixedSchedule.map(item => {
        if (!markedDue && item.status === 'upcoming') {
          markedDue = true
          return { ...item, status: 'due' }
        }
        return item
      })

      return {
        ...prev,
        remaining: newRemaining,
        paymentsCompleted: newPaymentsCompleted,
        schedule: finalSchedule,
        currentRedeploymentIndex: Math.min(newPaymentsCompleted, prev.redeploymentStories.length - 1),
      }
    })

    logBorrowerTransaction(
      'loan_repayment',
      -amount,
      `Monthly repayment #${(activeLoan?.paymentsCompleted || 0) + 1}`,
      newBalance
    )

    return { success: true }
  }, [checkingBalance, activeLoan, logBorrowerTransaction])

  const addFundsBorrower = useCallback((amount) => {
    const newBal = checkingBalance + amount
    setCheckingBalance(newBal)
    logBorrowerTransaction('deposit', amount, 'Added funds', newBal)
  }, [checkingBalance, logBorrowerTransaction])

  // -----------------------------------------------------------------------
  // Hardship Operations
  // -----------------------------------------------------------------------

  const requestExtension = useCallback((newDate) => {
    setExtensionGranted(true)
    setActiveLoan(prev => {
      if (!prev) return prev
      const newSchedule = prev.schedule.map(item => {
        if (item.status === 'due') return { ...item, date: newDate, status: 'extended' }
        return item
      })
      return { ...prev, schedule: newSchedule }
    })
    logBorrowerTransaction('loan_restructured', 0, `Payment extended to ${newDate}`, checkingBalance)
  }, [checkingBalance, logBorrowerTransaction])

  const requestRestructure = useCallback((reason, newPlan) => {
    setActiveLoan(prev => {
      if (!prev) return prev
      return { ...prev, monthlyPayment: newPlan.monthlyPayment, schedule: newPlan.schedule }
    })
    logBorrowerTransaction('loan_restructured', 0, `Loan restructured: ${reason}`, checkingBalance)
  }, [checkingBalance, logBorrowerTransaction])

  const initiateConversion = useCallback(() => {
    setConversionPending(true)
    const remaining = activeLoan?.remaining || 0
    setActiveLoan(prev => (prev ? { ...prev, remaining: 0, status: 'converted' } : prev))
    logBorrowerTransaction(
      'loan_converted',
      0,
      `Outstanding balance of $${remaining} converted to sadaqah — ${activeLoan?.destinationCause || 'Yemen Orphan Fund'}`,
      checkingBalance
    )
    setConversionConfirmed(true)
  }, [activeLoan, checkingBalance, logBorrowerTransaction])

  // -----------------------------------------------------------------------
  // Demo Switcher
  // -----------------------------------------------------------------------

  // Run the real decision algorithm against application data
  const runDecisionAlgorithm = useCallback((applicationOverrides = {}) => {
    const app = { ...submittedApplication, ...applicationOverrides }
    const decision = computeDecision(app)
    setComputedDecision(decision)
    setDecisionOutcome(decision.outcome)
    if (decision.offeredAmount) setOfferedAmount(decision.offeredAmount)
    setDecisionReason(decision.denialMessage || decision.reductionReason || '')
    return decision
  }, [submittedApplication])

  // ---- Loan Draft Operations ----
  const INITIAL_DRAFT = {
    purposeCategory: 'car_repair', purposeDetail: 'Engine repair needed for daily commute to work', urgency: 'high',
    loanAmount: 500, repaymentFrequency: 'monthly', repaymentStart: 'as_soon',
    proposedMonthlyPayment: 100, grossMonthlyIncome: 2000,
    rentAmount: 950, utilitiesAmount: 250, otherExpenses: 0,
    householdSize: 3, dependents: 2, employmentStatus: 'Employed full-time',
    fullName: 'Omar Al-Rashid', firstName: 'Omar', lastName: 'Al-Rashid',
    dateOfBirth: '07/15/1994', address: '2400 Nueces St, Austin, TX 78705',
    phoneNumber: '(512) 555-8847', phoneVerified: true,
    governmentId: 'TX-28471956',
    mosqueName: 'UT Austin MSA, Austin, TX', mosqueTenure: 'long',
    imamName: 'Sheikh Abdullah', imamPhone: '(512) 555-0192',
    circleMember: false, currentStep: 1,
  }

  const updateDraft = useCallback((fields) => {
    setLoanDraft(prev => {
      const updated = { ...(prev || INITIAL_DRAFT), ...fields }
      try { localStorage.setItem('mizan_loan_draft', JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem('mizan_loan_draft')
    setLoanDraft(null)
  }, [])

  const startNewApplication = useCallback(() => {
    setLoanDraft({ ...INITIAL_DRAFT })
    try { localStorage.setItem('mizan_loan_draft', JSON.stringify(INITIAL_DRAFT)) } catch {}
  }, [])

  const draftMonthlyExpenses = useMemo(() =>
    (loanDraft?.rentAmount || 0) + (loanDraft?.utilitiesAmount || 0) + (loanDraft?.otherExpenses || 0),
    [loanDraft?.rentAmount, loanDraft?.utilitiesAmount, loanDraft?.otherExpenses]
  )

  const switchDemoState = useCallback((state) => {
    switch (state) {
      case 'approved': {
        // Strong case: imam vouched, good income, high urgency
        const decision = runDecisionAlgorithm({
          imamVouched: true,
          mosqueTenure: 'long',
          grossMonthlyIncome: 2000,
          monthlyDebts: 1200,
          householdSize: 3,
          dependents: 2,
          purposeCategory: 'car_repair',
          loanAmount: 500,
        })
        setApplicationStage('decided')
        break
      }
      case 'reduced': {
        // Borderline: higher amount requested than budget allows
        const decision = runDecisionAlgorithm({
          imamVouched: true,
          mosqueTenure: 'long',
          grossMonthlyIncome: 2200,
          monthlyDebts: 1400,
          householdSize: 3,
          dependents: 2,
          purposeCategory: 'car_repair',
          loanAmount: 1500,
        })
        // Force reduced if algorithm didn't produce it
        if (decision.outcome !== 'reduced') {
          setDecisionOutcome('reduced')
          setOfferedAmount(decision.offeredAmount || 350)
          setComputedDecision({ ...decision, outcome: 'reduced', offeredAmount: decision.offeredAmount || 350, reductionReason: decision.reductionReason || `$1,800 over ${decision.tier?.expectedMonths || 5} months would strain your budget. We can offer $${decision.offeredAmount || 350} to keep payments manageable.` })
        }
        setApplicationStage('decided')
        break
      }
      case 'denied': {
        // Weak case: low income, high debts, no mosque connection
        const decision = runDecisionAlgorithm({
          imamVouched: false,
          mosqueTenure: 'none',
          grossMonthlyIncome: 800,
          monthlyDebts: 700,
          householdSize: 1,
          dependents: 0,
          purposeCategory: 'other',
          loanAmount: 500,
        })
        // Force denied if algorithm didn't produce it
        if (decision.outcome !== 'denied') {
          setDecisionOutcome('denied')
          setComputedDecision({ ...decision, outcome: 'denied', denialMessage: "Based on your current income and expenses, a loan would create more hardship than it resolves. This is the algorithm's assessment — not a judgment of your character." })
        }
        setApplicationStage('decided')
        break
      }
      case 'active_loan':
        setApplicationStage('active_loan')
        setActiveLoan({ ...SEED_ACTIVE_LOAN })
        setCheckingBalance(1347)
        setBankLinked(true)
        break
      default:
        break
    }
  }, [runDecisionAlgorithm])

  // -----------------------------------------------------------------------
  // Provider Value
  // -----------------------------------------------------------------------

  const value = useMemo(() => ({
    // Application flow
    applicationStage,
    setApplicationStage,
    draftApplication,
    setDraftApplication,
    extractedData,
    setExtractedData,
    submittedApplication,
    setSubmittedApplication,
    extracting,
    setExtracting,

    // Decision
    decisionOutcome,
    setDecisionOutcome,
    computedDecision,
    setComputedDecision,
    offeredAmount,
    setOfferedAmount,
    decisionReason,
    runDecisionAlgorithm,
    setDecisionReason,

    // Loan
    activeLoan,
    setActiveLoan,
    loanHistory,
    setLoanHistory,
    communityTrustLevel,
    setCommunityTrustLevel,

    // Banking
    checkingBalance,
    bankName,
    bankLast4,
    bankLinked,
    setBankLinked,
    borrowerTransactions,

    // Hardship
    hardshipPath,
    setHardshipPath,
    extensionGranted,
    setExtensionGranted,
    conversionPending,
    setConversionPending,
    conversionConfirmed,
    setConversionConfirmed,

    // Operations
    receiveDisbursement,
    makePayment,
    addFundsBorrower,
    requestExtension,
    requestRestructure,
    initiateConversion,
    logBorrowerTransaction,

    // Loan draft
    loanDraft,
    updateDraft,
    clearDraft,
    startNewApplication,
    draftMonthlyExpenses,
    pendingDecision,
    setPendingDecision,

    // Demo
    switchDemoState,

    // Algorithm utilities (re-exported for convenience)
    computeNeedScore,
    assignTier,
    computeFeasibility,
  }), [
    applicationStage,
    draftApplication,
    extractedData,
    submittedApplication,
    extracting,
    decisionOutcome,
    offeredAmount,
    decisionReason,
    activeLoan,
    loanHistory,
    communityTrustLevel,
    checkingBalance,
    bankName,
    bankLast4,
    bankLinked,
    borrowerTransactions,
    hardshipPath,
    extensionGranted,
    conversionPending,
    conversionConfirmed,
    receiveDisbursement,
    makePayment,
    addFundsBorrower,
    requestExtension,
    requestRestructure,
    initiateConversion,
    logBorrowerTransaction,
    loanDraft,
    updateDraft,
    clearDraft,
    startNewApplication,
    draftMonthlyExpenses,
    pendingDecision,
    switchDemoState,
  ])

  return (
    <BorrowerContext.Provider value={value}>
      {children}
    </BorrowerContext.Provider>
  )
}

export function useBorrower() {
  const context = useContext(BorrowerContext)
  if (!context) {
    throw new Error('useBorrower must be used within a BorrowerProvider')
  }
  return context
}

export default BorrowerContext
