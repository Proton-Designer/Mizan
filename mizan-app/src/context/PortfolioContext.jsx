import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react'

/* ──────────────────────────────────────────────
   CONSTANTS / SEED DATA
   ────────────────────────────────────────────── */

const SEED_POSITIONS = [
  {
    id: 'pos-1',
    ngoId: 'islamic-relief-usa',
    ngoName: 'Islamic Relief USA',
    type: 'compound',
    mode: 'jariyah',
    amount: 500,
    status: 'active',
    cyclesCurrent: 1,
    cyclesTotal: null,
    cycleStartDate: '2026-01-15T00:00:00Z',
    estimatedCycleEndDate: '2026-06-15T00:00:00Z',
    splitPercent: 100,
    familiesHelped: 12,
    currentBorrowers: [
      { firstName: 'Omar', city: 'Chicago', state: 'IL', purpose: 'tuition', loanAmount: 250 },
    ],
    vaultPersonId: 'vault-ahmed',
    createdAt: '2026-01-15T00:00:00Z',
    category: 'emergency',
  },
  {
    id: 'pos-2',
    ngoId: 'zakat-foundation',
    ngoName: 'Zakat Foundation of America',
    type: 'compound',
    mode: 'standard',
    amount: 300,
    status: 'active',
    cyclesCurrent: 1,
    cyclesTotal: 2,
    cycleStartDate: '2026-02-14T00:00:00Z',
    estimatedCycleEndDate: '2026-09-14T00:00:00Z',
    splitPercent: 100,
    familiesHelped: 8,
    currentBorrowers: [
      { firstName: 'Fatima', city: 'Dallas', state: 'TX', purpose: 'car repair', loanAmount: 300 },
    ],
    vaultPersonId: null,
    createdAt: '2026-02-14T00:00:00Z',
    category: 'water',
  },
  {
    id: 'pos-3',
    ngoId: 'penny-appeal-usa',
    ngoName: 'Penny Appeal USA',
    type: 'direct',
    mode: 'direct',
    amount: 150,
    status: 'complete',
    cyclesCurrent: 0,
    cyclesTotal: 0,
    splitPercent: 100,
    familiesHelped: 5,
    currentBorrowers: [],
    vaultPersonId: null,
    createdAt: '2026-03-01T00:00:00Z',
    category: 'food',
  },
  {
    id: 'pos-4',
    ngoId: 'human-appeal-usa',
    ngoName: 'Human Appeal USA',
    type: 'compound',
    mode: 'standard',
    amount: 200,
    status: 'active',
    cyclesCurrent: 1,
    cyclesTotal: 3,
    cycleStartDate: '2026-04-01T00:00:00Z',
    estimatedCycleEndDate: '2026-09-01T00:00:00Z',
    splitPercent: 100,
    familiesHelped: 3,
    currentBorrowers: [
      { firstName: 'Ahmed', city: 'Houston', state: 'TX', purpose: 'medical bills', loanAmount: 200 },
    ],
    vaultPersonId: null,
    createdAt: '2026-04-01T00:00:00Z',
    category: 'orphan',
  },
]

const SEED_TRANSACTIONS = [
  {
    id: 'txn-1',
    timestamp: '2026-01-15T10:30:00Z',
    type: 'invest_compound',
    amount: -500,
    description: 'Jariyah commitment to Islamic Relief USA',
    balanceAfter: 4500,
    relatedPositionId: 'pos-1',
    relatedNgoName: 'Islamic Relief USA',
  },
  {
    id: 'txn-2',
    timestamp: '2026-02-14T14:15:00Z',
    type: 'invest_compound',
    amount: -300,
    description: 'Compound investment to Zakat Foundation (2 cycles)',
    balanceAfter: 4200,
    relatedPositionId: 'pos-2',
    relatedNgoName: 'Zakat Foundation of America',
  },
  {
    id: 'txn-3',
    timestamp: '2026-03-01T09:00:00Z',
    type: 'invest_direct',
    amount: -150,
    description: 'Direct sadaqah to Penny Appeal USA',
    balanceAfter: 4050,
    relatedPositionId: 'pos-3',
    relatedNgoName: 'Penny Appeal USA',
  },
  {
    id: 'txn-4',
    timestamp: '2026-04-01T11:45:00Z',
    type: 'invest_compound',
    amount: -200,
    description: 'Compound investment to Human Appeal USA (3 cycles)',
    balanceAfter: 3850,
    relatedPositionId: 'pos-4',
    relatedNgoName: 'Human Appeal USA',
  },
]

const SEED_VAULT = [
  {
    id: 'vault-ahmed',
    name: 'Ahmed Al-Farsi',
    relationship: 'Father',
    type: 'memorial',
    photo: null,
    note: 'He always cared about education and feeding the hungry.',
    createdAt: '2025-12-01T00:00:00Z',
    impactEntries: [
      {
        id: 've-1',
        text: "Your father's sadaqah fed 40 children in Yemen during iftar.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ngoName: 'Islamic Relief USA',
        campaign: 'Yemen Emergency',
      },
      {
        id: 've-2',
        text: "A student read Surah Al-Mulk on scholarship funded by your father's sadaqah.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ngoName: 'Islamic Relief USA',
        campaign: 'Education Program',
      },
      {
        id: 've-3',
        text: "A Quran was completed in a refugee camp — your father's jariyah contributed to this student's tuition.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ngoName: 'Zakat Foundation of America',
        campaign: 'Refugee Education',
      },
      {
        id: 've-4',
        text: "Your father's sadaqah helped purchase medical supplies for 15 children in Sana'a.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ngoName: 'Islamic Relief USA',
        campaign: 'Yemen Medical',
      },
      {
        id: 've-5',
        text: "A child received new school shoes — made possible by the continuous flow of your father's jariyah.",
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        ngoName: 'Penny Appeal USA',
        campaign: 'Back to School',
      },
    ],
  },
]

/* ── Borrower Pool (20 diverse borrowers) ── */

const BORROWER_POOL = [
  { id: 'bor-01', firstName: 'Khalid',   city: 'Detroit',       state: 'MI', purpose: 'car repair',     loanAmount: 800,  tier: 'standard',  repaymentRate: 0.95 },
  { id: 'bor-02', firstName: 'Amina',    city: 'Houston',       state: 'TX', purpose: 'tuition',        loanAmount: 1500, tier: 'major',     repaymentRate: 0.92 },
  { id: 'bor-03', firstName: 'Abdi',     city: 'Minneapolis',   state: 'MN', purpose: 'rent',           loanAmount: 1200, tier: 'major',     repaymentRate: 0.88 },
  { id: 'bor-04', firstName: 'Zahra',    city: 'Chicago',       state: 'IL', purpose: 'medical',        loanAmount: 600,  tier: 'standard',  repaymentRate: 0.97 },
  { id: 'bor-05', firstName: 'Ibrahim',  city: 'Dallas',        state: 'TX', purpose: 'small business', loanAmount: 2000, tier: 'major',     repaymentRate: 0.90 },
  { id: 'bor-06', firstName: 'Hawa',     city: 'Atlanta',       state: 'GA', purpose: 'utility bills',  loanAmount: 350,  tier: 'micro',     repaymentRate: 0.98 },
  { id: 'bor-07', firstName: 'Yusuf',    city: 'New York',      state: 'NY', purpose: 'tuition',        loanAmount: 1800, tier: 'major',     repaymentRate: 0.93 },
  { id: 'bor-08', firstName: 'Mariam',   city: 'Philadelphia',  state: 'PA', purpose: 'car repair',     loanAmount: 500,  tier: 'standard',  repaymentRate: 0.96 },
  { id: 'bor-09', firstName: 'Tariq',    city: 'Detroit',       state: 'MI', purpose: 'rent',           loanAmount: 900,  tier: 'standard',  repaymentRate: 0.91 },
  { id: 'bor-10', firstName: 'Safiya',   city: 'Houston',       state: 'TX', purpose: 'medical',        loanAmount: 400,  tier: 'micro',     repaymentRate: 0.99 },
  { id: 'bor-11', firstName: 'Bilal',    city: 'Chicago',       state: 'IL', purpose: 'small business', loanAmount: 1600, tier: 'major',     repaymentRate: 0.87 },
  { id: 'bor-12', firstName: 'Khadija',  city: 'Minneapolis',   state: 'MN', purpose: 'utility bills',  loanAmount: 250,  tier: 'micro',     repaymentRate: 1.00 },
  { id: 'bor-13', firstName: 'Rashid',   city: 'Atlanta',       state: 'GA', purpose: 'tuition',        loanAmount: 1100, tier: 'major',     repaymentRate: 0.89 },
  { id: 'bor-14', firstName: 'Aisha',    city: 'Dallas',        state: 'TX', purpose: 'rent',           loanAmount: 700,  tier: 'standard',  repaymentRate: 0.94 },
  { id: 'bor-15', firstName: 'Jamal',    city: 'New York',      state: 'NY', purpose: 'car repair',     loanAmount: 450,  tier: 'micro',     repaymentRate: 0.96 },
  { id: 'bor-16', firstName: 'Noor',     city: 'Philadelphia',  state: 'PA', purpose: 'medical',        loanAmount: 950,  tier: 'standard',  repaymentRate: 0.93 },
  { id: 'bor-17', firstName: 'Suleiman', city: 'Detroit',       state: 'MI', purpose: 'small business', loanAmount: 1900, tier: 'major',     repaymentRate: 0.85 },
  { id: 'bor-18', firstName: 'Halima',   city: 'Houston',       state: 'TX', purpose: 'utility bills',  loanAmount: 200,  tier: 'micro',     repaymentRate: 1.00 },
  { id: 'bor-19', firstName: 'Dawud',    city: 'Minneapolis',   state: 'MN', purpose: 'tuition',        loanAmount: 1400, tier: 'major',     repaymentRate: 0.91 },
  { id: 'bor-20', firstName: 'Sumaya',   city: 'Atlanta',       state: 'GA', purpose: 'rent',           loanAmount: 550,  tier: 'standard',  repaymentRate: 0.95 },
]

/* ── Pre-seeded journey / NGO update entries ── */

const SEED_JOURNEY_UPDATES = [
  {
    id: 'jrn-u1',
    type: 'ngo_update',
    timestamp: '2026-01-20T08:00:00Z',
    text: 'Islamic Relief USA distributed emergency food kits to 200 families in Yemen.',
    ngoName: 'Islamic Relief USA',
    ngoId: 'islamic-relief-usa',
    positionId: 'pos-1',
    accentColor: '#10B981',
  },
  {
    id: 'jrn-u2',
    type: 'ngo_update',
    timestamp: '2026-02-20T12:00:00Z',
    text: 'Zakat Foundation completed a clean-water well serving 350 people in Bangladesh.',
    ngoName: 'Zakat Foundation of America',
    ngoId: 'zakat-foundation',
    positionId: 'pos-2',
    accentColor: '#3B82F6',
  },
  {
    id: 'jrn-u3',
    type: 'ngo_update',
    timestamp: '2026-03-05T15:30:00Z',
    text: 'Penny Appeal USA provided iftar meals to 1,200 families across 5 cities.',
    ngoName: 'Penny Appeal USA',
    ngoId: 'penny-appeal-usa',
    positionId: 'pos-3',
    accentColor: '#F59E0B',
  },
  {
    id: 'jrn-u4',
    type: 'ngo_update',
    timestamp: '2026-03-18T10:00:00Z',
    text: 'Islamic Relief USA opened a new maternal health clinic in Somalia.',
    ngoName: 'Islamic Relief USA',
    ngoId: 'islamic-relief-usa',
    positionId: 'pos-1',
    accentColor: '#10B981',
  },
  {
    id: 'jrn-u5',
    type: 'ngo_update',
    timestamp: '2026-04-05T14:00:00Z',
    text: 'Human Appeal USA sponsored 50 orphans in Lebanon for the new school year.',
    ngoName: 'Human Appeal USA',
    ngoId: 'human-appeal-usa',
    positionId: 'pos-4',
    accentColor: '#8B5CF6',
  },
  {
    id: 'jrn-u6',
    type: 'ngo_update',
    timestamp: '2026-04-10T09:15:00Z',
    text: 'Zakat Foundation distributed Eid clothing packages to 400 children.',
    ngoName: 'Zakat Foundation of America',
    ngoId: 'zakat-foundation',
    positionId: 'pos-2',
    accentColor: '#3B82F6',
  },
  {
    id: 'jrn-u7',
    type: 'ngo_update',
    timestamp: '2026-04-14T16:45:00Z',
    text: 'Islamic Relief USA shipped medical supplies to three hospitals in Gaza.',
    ngoName: 'Islamic Relief USA',
    ngoId: 'islamic-relief-usa',
    positionId: 'pos-1',
    accentColor: '#10B981',
  },
  {
    id: 'jrn-u8',
    type: 'ngo_update',
    timestamp: '2026-04-16T11:30:00Z',
    text: 'Human Appeal USA launched a micro-finance programme for refugee women in Jordan.',
    ngoName: 'Human Appeal USA',
    ngoId: 'human-appeal-usa',
    positionId: 'pos-4',
    accentColor: '#8B5CF6',
  },
]

/* ── Accent colour mapping (for journey entries derived from transactions) ── */

const NGO_ACCENT = {
  'islamic-relief-usa': '#10B981',
  'zakat-foundation': '#3B82F6',
  'penny-appeal-usa': '#F59E0B',
  'human-appeal-usa': '#8B5CF6',
}

/* ──────────────────────────────────────────────
   HELPERS (pure, outside component)
   ────────────────────────────────────────────── */

function buildStreakHistory() {
  const days = []
  for (let i = 27; i >= 0; i--) {
    days.push(i < 23)  // last 23 days = true, first 5 = false
  }
  return days
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function todayDateStr() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/* ──────────────────────────────────────────────
   CONTEXT
   ────────────────────────────────────────────── */

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  /* ── Banking (start connected with seeded data) ── */
  const [bankConnected, setBankConnected] = useState(true)
  const [bankName, setBankName] = useState('Chase')
  const [bankAccountLast4, setBankAccountLast4] = useState('4821')
  const [bankBalance, setBankBalance] = useState(3850)
  const [committedCapital, setCommittedCapital] = useState(1000)

  /* ── Positions (pre-seeded) ── */
  const [positions, setPositions] = useState(SEED_POSITIONS)

  /* ── Transactions (pre-seeded, newest first) ── */
  const [transactions, setTransactions] = useState(() => [...SEED_TRANSACTIONS].reverse())

  /* ── Jariyah Vault (pre-seeded) ── */
  const [vaultPersons, setVaultPersons] = useState(() =>
    SEED_VAULT.map((v) => ({ ...v, impactEntries: v.impactEntries.map((e) => ({ ...e })) }))
  )

  /* ── Streak ── */
  const [streakCount, setStreakCount] = useState(23)
  const [lastGivingDate, setLastGivingDate] = useState(getYesterday())
  const [streakHistory, setStreakHistory] = useState(buildStreakHistory)

  /* ── Invest modal ── */
  const [investModalOpen, setInvestModalOpen] = useState(false)
  const [investPreselectedNgo, setInvestPreselectedNgo] = useState(null)

  /* ── Recurring buys ── */
  const [recurringBuys, setRecurringBuys] = useState([])

  /* ── Reflection ── */
  const [reflectionData, setReflectionData] = useState(null)

  /* ── Session seed (stable per mount) ── */
  const sessionSeed = useMemo(() => Math.random(), [])

  /* ──────────────────────────────────────────
     INTERNAL HELPERS
     ────────────────────────────────────────── */

  const logTransaction = useCallback(
    (type, amount, description, balanceAfter, relatedPositionId, relatedNgoName) => {
      const txn = {
        id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        type,
        amount,
        description,
        balanceAfter,
        relatedPositionId: relatedPositionId ?? null,
        relatedNgoName: relatedNgoName ?? null,
      }
      setTransactions((prev) => [txn, ...prev])
    },
    []
  )

  const assignBorrowers = useCallback((amount) => {
    const count = amount < 400 ? 1 : amount < 1000 ? 2 : 3
    const shuffled = [...BORROWER_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((b) => ({
      firstName: b.firstName,
      city: b.city,
      state: b.state,
      purpose: b.purpose,
      loanAmount: Math.min(b.loanAmount, Math.round(amount / count)),
    }))
  }, [])

  /* ──────────────────────────────────────────
     BANKING OPERATIONS
     ────────────────────────────────────────── */

  const connectBank = useCallback(
    (name, accountNumber) => {
      setBankConnected(true)
      setBankName(name)
      setBankAccountLast4(accountNumber.slice(-4))

      // Seed data after bank connection
      // Balance: 5000 - 500 - 300 - 150 - 200 = 3850
      setBankBalance(3850)
      // Committed: active compound positions = 500 + 300 + 200 = 1000
      setCommittedCapital(1000)
      setPositions(SEED_POSITIONS)
      setTransactions([...SEED_TRANSACTIONS].reverse()) // newest first
      setVaultPersons(
        SEED_VAULT.map((v) => ({
          ...v,
          // Recompute timestamps so they stay relative to "now"
          impactEntries: v.impactEntries.map((e) => ({ ...e })),
        }))
      )
    },
    []
  )

  const investDirect = useCallback(
    (amount, ngo) => {
      if (amount > bankBalance) return { success: false, reason: 'insufficient_funds' }

      const newBalance = bankBalance - amount
      setBankBalance(newBalance)

      const posId = `pos-${Date.now()}`
      const newPosition = {
        id: posId,
        ngoId: ngo.id,
        ngoName: ngo.name,
        type: 'direct',
        mode: 'direct',
        amount,
        status: 'complete',
        cyclesCurrent: 0,
        cyclesTotal: 0,
        splitPercent: 100,
        familiesHelped: Math.round((amount * (ngo.impactPerDollar || 2)) / 100),
        currentBorrowers: [],
        vaultPersonId: null,
        createdAt: new Date().toISOString(),
        category: ngo.category || 'general',
      }

      setPositions((prev) => [...prev, newPosition])
      logTransaction(
        'invest_direct',
        -amount,
        `Direct sadaqah to ${ngo.name}`,
        newBalance,
        posId,
        ngo.name
      )

      return { success: true, positionId: posId }
    },
    [bankBalance, logTransaction]
  )

  const investCompound = useCallback(
    (amount, ngo, cycles, splitPercent) => {
      if (amount > bankBalance) return { success: false, reason: 'insufficient_funds' }

      const newBalance = bankBalance - amount
      setBankBalance(newBalance)
      setCommittedCapital((prev) => prev + amount)

      const posId = `pos-${Date.now()}`
      const assignedBorrowers = assignBorrowers(amount)

      const now = new Date()
      const estEnd = new Date(now)
      estEnd.setMonth(estEnd.getMonth() + 5)

      const newPosition = {
        id: posId,
        ngoId: ngo?.id || 'jariyah-pool',
        ngoName: ngo?.name || 'Qard Hassan Pool (Jariyah)',
        type: 'compound',
        mode: cycles === null ? 'jariyah' : 'standard',
        amount,
        status: 'active',
        cyclesCurrent: 1,
        cyclesTotal: cycles,
        cycleStartDate: now.toISOString(),
        estimatedCycleEndDate: estEnd.toISOString(),
        splitPercent,
        familiesHelped: assignedBorrowers.length,
        currentBorrowers: assignedBorrowers,
        vaultPersonId: null,
        createdAt: now.toISOString(),
        category: ngo?.category || 'community',
      }

      setPositions((prev) => [...prev, newPosition])
      const ngoLabel = ngo?.name || 'Qard Hassan Pool (Jariyah)'
      logTransaction(
        'invest_compound',
        -amount,
        cycles === null
          ? `Jariyah commitment to ${ngoLabel}`
          : `Compound investment to ${ngoLabel} (${cycles} cycles)`,
        newBalance,
        posId,
        ngoLabel
      )

      return { success: true, positionId: posId }
    },
    [bankBalance, logTransaction, assignBorrowers]
  )

  const processReturn = useCallback(
    (positionId, returnAmount) => {
      setBankBalance((prev) => {
        const newBal = prev + returnAmount
        logTransaction(
          'cycle_return',
          returnAmount,
          'Cycle return from position',
          newBal,
          positionId,
          null
        )
        return newBal
      })
      setCommittedCapital((prev) => Math.max(0, prev - returnAmount))
    },
    [logTransaction]
  )

  const addFunds = useCallback(
    (amount) => {
      setBankBalance((prev) => {
        const newBal = prev + amount
        logTransaction('deposit', amount, 'Added funds to account', newBal, null, null)
        return newBal
      })
    },
    [logTransaction]
  )

  /* ──────────────────────────────────────────
     RECURRING BUYS
     ────────────────────────────────────────── */

  const createRecurringBuy = useCallback(
    (config) => {
      const id = `rec-${Date.now()}`
      const recurring = {
        id,
        ngoId: config.ngoId,
        ngoName: config.ngoName,
        amount: config.amount,
        frequency: config.frequency, // 'weekly' | 'biweekly' | 'monthly'
        investType: config.investType, // 'direct' | 'compound'
        cycles: config.cycles,
        splitPercent: config.splitPercent,
        startDate: new Date().toISOString(),
        endDate: config.endDate || null, // null = indefinite
        totalExecutions: config.totalExecutions || null, // e.g. 12 for 12 months
        executionCount: 0,
        nextExecution: new Date().toISOString(),
        status: 'active', // 'active' | 'paused' | 'completed'
        createdAt: new Date().toISOString(),
      }
      setRecurringBuys((prev) => [...prev, recurring])

      // Execute the first buy immediately
      let result
      const ngo = { id: config.ngoId, name: config.ngoName, category: config.category || 'community', impactPerDollar: config.impactPerDollar || 2, impactUnit: config.impactUnit || 'families' }
      if (config.investType === 'direct') {
        result = investDirect(config.amount, ngo)
      } else {
        result = investCompound(config.amount, ngo, config.cycles, config.splitPercent)
      }

      if (result?.success) {
        // Mark first execution
        setRecurringBuys((prev) =>
          prev.map((r) => r.id === id ? { ...r, executionCount: 1, lastExecuted: new Date().toISOString() } : r)
        )
      }

      return { success: true, recurringId: id, firstBuyResult: result }
    },
    [investDirect, investCompound]
  )

  const pauseRecurringBuy = useCallback((id) => {
    setRecurringBuys((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'paused' } : r)
    )
  }, [])

  const resumeRecurringBuy = useCallback((id) => {
    setRecurringBuys((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'active' } : r)
    )
  }, [])

  const cancelRecurringBuy = useCallback((id) => {
    setRecurringBuys((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Simulate recurring execution (check on mount if any are due)
  useEffect(() => {
    if (recurringBuys.length === 0) return
    const now = Date.now()
    const FREQ_MS = { weekly: 7 * 86400000, biweekly: 14 * 86400000, monthly: 30 * 86400000 }

    recurringBuys.forEach((rec) => {
      if (rec.status !== 'active') return
      if (rec.totalExecutions && rec.executionCount >= rec.totalExecutions) {
        setRecurringBuys((prev) =>
          prev.map((r) => r.id === rec.id ? { ...r, status: 'completed' } : r)
        )
        return
      }
      const lastExec = new Date(rec.lastExecuted || rec.createdAt).getTime()
      const interval = FREQ_MS[rec.frequency] || FREQ_MS.monthly
      if (now - lastExec >= interval) {
        // Due for execution — simulate it
        const ngo = { id: rec.ngoId, name: rec.ngoName, category: 'community', impactPerDollar: 2, impactUnit: 'families' }
        if (rec.investType === 'direct') {
          investDirect(rec.amount, ngo)
        } else {
          investCompound(rec.amount, ngo, rec.cycles, rec.splitPercent)
        }
        setRecurringBuys((prev) =>
          prev.map((r) => r.id === rec.id ? { ...r, executionCount: r.executionCount + 1, lastExecuted: new Date().toISOString() } : r)
        )
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  /* ──────────────────────────────────────────
     HELPER ACTIONS
     ────────────────────────────────────────── */

  const incrementStreak = useCallback(() => {
    const today = todayDateStr()
    if (lastGivingDate === today) return // already counted today
    setStreakCount((prev) => prev + 1)
    setLastGivingDate(today)
    setStreakHistory((prev) => [...prev.slice(1), true])
  }, [lastGivingDate])

  const openInvest = useCallback((ngoId = null) => {
    setInvestPreselectedNgo(ngoId)
    setInvestModalOpen(true)
  }, [])

  const closeInvest = useCallback(() => {
    setInvestModalOpen(false)
    setInvestPreselectedNgo(null)
  }, [])

  const addVaultPerson = useCallback((person) => {
    const newPerson = {
      ...person,
      id: person.id || `vault-${Date.now()}`,
      createdAt: person.createdAt || new Date().toISOString(),
      impactEntries: person.impactEntries || [],
    }
    setVaultPersons((prev) => [...prev, newPerson])
    return newPerson.id
  }, [])

  const addVaultImpactEntry = useCallback((personId, entry) => {
    const newEntry = {
      ...entry,
      id: entry.id || `ve-${Date.now()}`,
      timestamp: entry.timestamp || new Date().toISOString(),
    }
    setVaultPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? { ...p, impactEntries: [newEntry, ...p.impactEntries] }
          : p
      )
    )
  }, [])

  const tagPositionToVault = useCallback((positionId, personId) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === positionId ? { ...p, vaultPersonId: personId } : p
      )
    )
  }, [])

  /* ──────────────────────────────────────────
     SIMULATION ENGINE
     Compute cycleProgress via date math on each
     active compound position. Runs whenever
     positions change (including initial seed).
     ────────────────────────────────────────── */

  useEffect(() => {
    if (!bankConnected) return

    const now = Date.now()
    let needsUpdate = false

    const updated = positions.map((pos) => {
      if (pos.type !== 'compound' || pos.status !== 'active') return pos

      const start = new Date(pos.cycleStartDate).getTime()
      const end = new Date(pos.estimatedCycleEndDate).getTime()
      const progress = end > start ? Math.min(1, (now - start) / (end - start)) : 0

      if (pos.cycleProgress !== progress) {
        needsUpdate = true
        return { ...pos, cycleProgress: progress }
      }
      return pos
    })

    if (needsUpdate) {
      setPositions(updated)
    }
    // We intentionally only run this when bankConnected transitions or positions
    // length changes (not on every positions ref change, to avoid infinite loops).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankConnected, positions.length])

  /* ──────────────────────────────────────────
     JOURNEY LOG (derived / computed)
     ────────────────────────────────────────── */

  const journeyLog = useMemo(() => {
    const entries = []

    // Entries from transactions
    transactions.forEach((txn) => {
      let type = 'investment'
      if (txn.type === 'cycle_return') type = 'cycle'

      entries.push({
        id: `jrn-${txn.id}`,
        type,
        timestamp: txn.timestamp,
        text: txn.description,
        ngoName: txn.relatedNgoName,
        ngoId: null,
        positionId: txn.relatedPositionId,
        accentColor: '#6366F1',
      })
    })

    // Entries from active borrowers
    positions.forEach((pos) => {
      if (!pos.currentBorrowers) return
      pos.currentBorrowers.forEach((bor, idx) => {
        entries.push({
          id: `jrn-bor-${pos.id}-${idx}`,
          type: 'borrower',
          timestamp: pos.createdAt,
          text: `${bor.firstName} in ${bor.city}, ${bor.state} received a ${bor.purpose} qard of $${bor.loanAmount}`,
          ngoName: pos.ngoName,
          ngoId: pos.ngoId,
          positionId: pos.id,
          accentColor: NGO_ACCENT[pos.ngoId] || '#6366F1',
        })
      })
    })

    // Pre-seeded NGO update entries
    if (bankConnected) {
      SEED_JOURNEY_UPDATES.forEach((u) => entries.push({ ...u }))
    }

    // Sort newest first
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return entries
  }, [transactions, positions, bankConnected])

  /* ──────────────────────────────────────────
     DERIVED VALUES
     ────────────────────────────────────────── */

  const totalDeployed = useMemo(
    () => positions.reduce((sum, p) => sum + p.amount, 0),
    [positions]
  )

  const totalFamiliesHelped = useMemo(
    () => positions.reduce((sum, p) => sum + (p.familiesHelped || 0), 0),
    [positions]
  )

  const activePositions = useMemo(
    () => positions.filter((p) => p.status === 'active'),
    [positions]
  )

  /* ──────────────────────────────────────────
     PROVIDER VALUE
     ────────────────────────────────────────── */

  const value = useMemo(
    () => ({
      // Banking state
      bankConnected,
      bankName,
      bankAccountLast4,
      bankBalance,
      committedCapital,

      // Positions
      positions,
      activePositions,

      // Transactions
      transactions,

      // Vault
      vaultPersons,

      // Streak
      streakCount,
      lastGivingDate,
      streakHistory,

      // Invest modal
      investModalOpen,
      investPreselectedNgo,

      // Reflection
      reflectionData,
      setReflectionData,

      // Session seed
      sessionSeed,

      // Derived
      totalDeployed,
      totalFamiliesHelped,
      journeyLog,

      // Borrower pool (read-only reference)
      borrowerPool: BORROWER_POOL,

      // Banking operations
      connectBank,
      investDirect,
      investCompound,
      processReturn,
      addFunds,

      // Recurring buys
      recurringBuys,
      createRecurringBuy,
      pauseRecurringBuy,
      resumeRecurringBuy,
      cancelRecurringBuy,

      // Helpers
      incrementStreak,
      openInvest,
      closeInvest,
      addVaultPerson,
      addVaultImpactEntry,
      tagPositionToVault,
    }),
    [
      bankConnected,
      bankName,
      bankAccountLast4,
      bankBalance,
      committedCapital,
      positions,
      activePositions,
      transactions,
      vaultPersons,
      streakCount,
      lastGivingDate,
      streakHistory,
      investModalOpen,
      investPreselectedNgo,
      reflectionData,
      sessionSeed,
      totalDeployed,
      totalFamiliesHelped,
      journeyLog,
      connectBank,
      investDirect,
      investCompound,
      processReturn,
      addFunds,
      recurringBuys,
      createRecurringBuy,
      pauseRecurringBuy,
      resumeRecurringBuy,
      cancelRecurringBuy,
      incrementStreak,
      openInvest,
      closeInvest,
      addVaultPerson,
      addVaultImpactEntry,
      tagPositionToVault,
    ]
  )

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return ctx
}

export default PortfolioContext
