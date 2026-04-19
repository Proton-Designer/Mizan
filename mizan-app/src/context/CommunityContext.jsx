import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CommunityContext = createContext(null)

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// ---------------------------------------------------------------------------
// Generate 47 congregation members deterministically
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Ahmed', 'Fatima', 'Omar', 'Aisha', 'Yusuf', 'Khadija', 'Ibrahim', 'Maryam',
  'Hassan', 'Zainab', 'Ali', 'Noor', 'Bilal', 'Salma', 'Tariq', 'Layla',
  'Hamza', 'Amina', 'Idris', 'Hafsa', 'Khalid', 'Sara', 'Jamal', 'Huda',
  'Mustafa', 'Yasmin', 'Sulaiman', 'Rania', 'Zakariya', 'Dina', 'Samir',
  'Bushra', 'Faisal', 'Asma', 'Nabil', 'Halima', 'Rashid', 'Safiya', 'Adnan',
  'Ruqayya', 'Waleed', 'Iman', 'Kareem', 'Samira', 'Ziad', 'Nawal', 'Hakeem'
]

const LAST_NAMES = [
  'Rahman', 'Al-Farsi', 'Osman', 'Hussain', 'Khan', 'Nasser', 'Mansour',
  'Abbas', 'El-Amin', 'Sharif', 'Qureshi', 'Haddad', 'Farouk', 'Saleh',
  'Malik', 'Bakri', 'Darwish', 'Abed', 'Taha', 'Essa', 'Syed', 'Jabari',
  'Issa', 'Hamdan', 'Morsi', 'Al-Rashid', 'Barakat', 'Awad', 'Nazir',
  'El-Sayed', 'Khalil', 'Younis', 'Mahdi', 'Anwar', 'Saeed', 'Chowdhury',
  'Begum', 'Mughal', 'Mirza', 'Hakim', 'Khoury', 'Bazzi', 'Shamsi',
  'Wahab', 'Daud', 'Noorani', 'Rizvi'
]

const CAUSES = ['Gaza Emergency', 'Yemen Relief', 'Somalia Aid', 'Local Community', 'Other']
const CAUSE_WEIGHTS = [0.34, 0.28, 0.18, 0.12, 0.08]

function weightedPick(rng, items, weights) {
  const r = rng()
  let cumulative = 0
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return items[i]
  }
  return items[items.length - 1]
}

function generateCongregation(count) {
  const rng = mulberry32(20260418)
  const members = []

  // Pre-assign giving patterns: 8 weekly, 19 monthly, 20 sporadic
  const patternSlots = [
    ...Array(8).fill('weekly'),
    ...Array(19).fill('monthly'),
    ...Array(20).fill('sporadic')
  ]
  // Shuffle deterministically
  for (let i = patternSlots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[patternSlots[i], patternSlots[j]] = [patternSlots[j], patternSlots[i]]
  }

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[i]
    const lastName = LAST_NAMES[i]
    const memberId = `member-${firstName.toLowerCase()}-${lastName.toLowerCase().replace(/[- ]/g, '')}-${String(i + 1).padStart(3, '0')}`

    const givingPattern = patternSlots[i]

    // Monthly amount clustered $40-$150 but range $20-$500
    let monthlyGivingAmount
    const amtRoll = rng()
    if (amtRoll < 0.75) {
      monthlyGivingAmount = Math.round(40 + rng() * 110)
    } else if (amtRoll < 0.92) {
      monthlyGivingAmount = Math.round(150 + rng() * 150)
    } else {
      monthlyGivingAmount = Math.round(300 + rng() * 200)
    }

    // Total given: based on tenure and pattern
    const tenureMonths = Math.floor(3 + rng() * 36)
    const consistency = givingPattern === 'weekly' ? 0.9 : givingPattern === 'monthly' ? 0.75 : 0.3
    const totalGiven = Math.round(monthlyGivingAmount * tenureMonths * consistency)

    const preferredCause = weightedPick(rng, CAUSES, CAUSE_WEIGHTS)

    const joinYear = 2023 + Math.floor(rng() * 3)
    const joinMonth = String(Math.floor(1 + rng() * 12)).padStart(2, '0')
    const joinDay = String(Math.floor(1 + rng() * 28)).padStart(2, '0')

    members.push({
      memberId,
      name: `${firstName} ${lastName}`,
      joinedDate: `${joinYear}-${joinMonth}-${joinDay}`,
      givingPattern,
      monthlyGivingAmount,
      totalGiven,
      preferredCause,
      activeThisMonth: rng() < 0.66
    })
  }

  return members
}

// ---------------------------------------------------------------------------
// Welfare Cases (pre-seeded)
// ---------------------------------------------------------------------------
const now = new Date()

function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n) {
  const d = new Date(now)
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

function weeksAgo(n) {
  return daysAgo(n * 7)
}

const initialWelfareCases = [
  // INCOMING (3)
  {
    id: 'wc-1',
    type: 'zakat',
    purpose: 'Rent assistance',
    amount: 800,
    urgency: 'urgent',
    submittedAt: daysAgo(2),
    mosqueTenure: '2+ years',
    householdSize: 4,
    algorithmConfidence: 87,
    zakatEligible: true,
    category: 'fuqara',
    status: 'incoming',
    notes: []
  },
  {
    id: 'wc-2',
    type: 'qard_hassan',
    purpose: 'Car repair',
    amount: 500,
    urgency: 'high',
    submittedAt: daysAgo(1),
    mosqueTenure: '6mo-2yr',
    householdSize: 2,
    algorithmConfidence: 72,
    zakatEligible: false,
    status: 'incoming',
    notes: []
  },
  {
    id: 'wc-3',
    type: 'sadaqah',
    purpose: 'Medical bills',
    amount: 300,
    urgency: 'medium',
    submittedAt: hoursAgo(4),
    mosqueTenure: '2+ years',
    householdSize: 1,
    algorithmConfidence: 91,
    zakatEligible: false,
    status: 'incoming',
    notes: []
  },

  // IN_REVIEW (2)
  {
    id: 'wc-4',
    type: 'zakat',
    purpose: 'Tuition assistance',
    amount: 1200,
    urgency: 'high',
    submittedAt: daysAgo(5),
    mosqueTenure: '2+ years',
    householdSize: 5,
    algorithmConfidence: 94,
    zakatEligible: true,
    category: 'ibn_sabil',
    status: 'in_review',
    assignedTo: 'Sheikh Abdullah',
    notes: []
  },
  {
    id: 'wc-5',
    type: 'qard_hassan',
    purpose: 'Utility bills',
    amount: 200,
    urgency: 'medium',
    submittedAt: daysAgo(3),
    mosqueTenure: '6mo-2yr',
    householdSize: 3,
    algorithmConfidence: 65,
    zakatEligible: false,
    status: 'in_review',
    assignedTo: null,
    notes: []
  },

  // RESOLVED (3)
  {
    id: 'wc-6',
    type: 'zakat',
    purpose: 'Food assistance',
    amount: 400,
    urgency: 'medium',
    submittedAt: daysAgo(5),
    mosqueTenure: '2+ years',
    householdSize: 3,
    algorithmConfidence: 88,
    zakatEligible: true,
    category: 'fuqara',
    status: 'resolved',
    resolvedAt: daysAgo(3),
    resolution: 'zakat_distributed',
    daysToResolve: 2,
    notes: []
  },
  {
    id: 'wc-7',
    type: 'qard_hassan',
    purpose: 'Emergency travel',
    amount: 600,
    urgency: 'high',
    submittedAt: daysAgo(11),
    mosqueTenure: '2+ years',
    householdSize: 2,
    algorithmConfidence: 78,
    zakatEligible: false,
    status: 'resolved',
    resolvedAt: weeksAgo(1),
    resolution: 'loan_approved',
    daysToResolve: 4,
    notes: []
  },
  {
    id: 'wc-8',
    type: 'sadaqah',
    purpose: 'Funeral expenses',
    amount: 500,
    urgency: 'urgent',
    submittedAt: daysAgo(15),
    mosqueTenure: '2+ years',
    householdSize: 4,
    algorithmConfidence: 95,
    zakatEligible: false,
    status: 'resolved',
    resolvedAt: weeksAgo(2),
    resolution: 'sadaqah_provided',
    daysToResolve: 1,
    notes: []
  }
]

// ---------------------------------------------------------------------------
// Zakat Pool
// ---------------------------------------------------------------------------
const initialZakatPool = {
  zakatReceived: 6800,
  zakatDistributed: 3200,
  zakatRemaining: 3600,
  lunarYearDaysRemaining: 47,
  lunarYearProgress: 0.87
}

// ---------------------------------------------------------------------------
// Vouch data
// ---------------------------------------------------------------------------
const initialVouchQueue = [
  {
    id: 'vouch-bilal',
    applicantName: 'Bilal Mansour',
    amount: 1200,
    tier: 'Standard',
    purpose: 'Tuition',
    urgency: 'high',
    needScore: 68,
    submittedAt: '2026-04-16T09:14:00Z',
    narrative:
      "I need help with this semester's tuition. I work part time at the library making about $1,400 a month. After rent and groceries, there is almost nothing left. I'm $1,200 short for the tuition deadline on May 1st. I've been attending the Islamic Center for 4 years and I volunteer at the weekend school. I can repay $200/month starting in June when my summer hours increase.",
    mosqueTenure: '4 years',
    inDirectory: true,
    priorLoans: 0
  }
]

function generateVouchHistory() {
  const rng = mulberry32(99887766)
  const names = [
    'Amira Saleh', 'Tariq Hussain', 'Noor Bakri', 'Anonymous',
    'Hassan Qureshi', 'Safiya Darwish', 'Kareem Haddad', 'Layla Sharif',
    'Idris Taha', 'Dina Abbas', 'Faisal Essa', 'Waleed Jabari'
  ]
  const purposes = ['Rent', 'Medical', 'Tuition', 'Car repair', 'Groceries', 'Utilities', 'Childcare', 'Moving costs']

  return names.map((name, i) => {
    const isDeclined = name === 'Anonymous'
    const isExpired = i === 11
    const day = String(Math.max(1, 15 - i)).padStart(2, '0')
    const month = i < 6 ? '04' : '03'

    let decision = 'vouched'
    if (isDeclined) decision = 'declined'
    if (isExpired) decision = 'expired'

    return {
      id: `vouch-hist-${i + 1}`,
      applicantName: name,
      amount: Math.round(400 + rng() * 1600),
      purpose: purposes[i % purposes.length],
      decision,
      decidedAt: `2026-${month}-${day}T${String(8 + Math.floor(rng() * 10)).padStart(2, '0')}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00Z`,
      note: isDeclined
        ? 'Applicant not found in mosque directory.'
        : isExpired
          ? 'No quorum reached within voting window.'
          : `Vouched by circle member. ${Math.floor(rng() * 5) + 3} supporting votes.`
    }
  })
}

// ---------------------------------------------------------------------------
// Events (with correlation data)
// ---------------------------------------------------------------------------
const initialEvents = [
  {
    id: 'event-eid-fitr-2026',
    name: 'Eid Al-Fitr Celebration',
    date: '2026-03-30',
    attendees: 350,
    givers: 18,
    totalRaised: 3200,
    correlationMultiplier: 12.4,
    type: 'celebration',
    followupSent: false
  },
  {
    id: 'event-ramadan-27',
    name: 'Ramadan Night 27 — Laylat al-Qadr',
    date: '2026-04-20',
    attendees: 200,
    givers: 14,
    totalRaised: 2140,
    correlationMultiplier: 7.6,
    type: 'spiritual',
    followupSent: false
  },
  {
    id: 'event-jummah-fundraiser',
    name: 'Jummah Fundraiser',
    date: '2026-03-15',
    attendees: 85,
    givers: 8,
    totalRaised: 840,
    correlationMultiplier: 3.2,
    type: 'fundraiser',
    followupSent: false
  },
  {
    id: 'event-finance-workshop',
    name: 'Islamic Finance Workshop',
    date: '2026-02-12',
    attendees: 45,
    givers: 6,
    totalRaised: 580,
    correlationMultiplier: 2.2,
    type: 'education',
    followupSent: true
  }
]

// ---------------------------------------------------------------------------
// Welfare Ledger (tracks all zakat/sadaqah distributions)
// ---------------------------------------------------------------------------
const initialWelfareLedger = [
  { id: 'led-1', caseId: 'wc-6', type: 'zakat', amount: 400, resolution: 'zakat_distributed', resolvedAt: daysAgo(3) },
  { id: 'led-2', caseId: 'wc-7', type: 'qard_hassan', amount: 600, resolution: 'loan_approved', resolvedAt: weeksAgo(1) },
  { id: 'led-3', caseId: 'wc-8', type: 'sadaqah', amount: 500, resolution: 'sadaqah_provided', resolvedAt: weeksAgo(2) }
]

// ---------------------------------------------------------------------------
// Compute aggregate stats from member data
// ---------------------------------------------------------------------------
function deriveAggregateStats(members) {
  const totalCommitted = members.reduce((s, m) => s + m.totalGiven, 0)
  const activeGiversThisMonth = members.filter((m) => m.activeThisMonth).length
  const monthlyGiving = members
    .filter((m) => m.activeThisMonth)
    .reduce((s, m) => s + m.monthlyGivingAmount, 0)

  const total = members.length

  // Cause distribution
  const causeCounts = {}
  members.forEach((m) => {
    causeCounts[m.preferredCause] = (causeCounts[m.preferredCause] || 0) + 1
  })
  const causeDistribution = Object.entries(causeCounts)
    .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percent - a.percent)

  // Frequency distribution
  const weekly = members.filter((m) => m.givingPattern === 'weekly').length
  const monthly = members.filter((m) => m.givingPattern === 'monthly').length
  const sporadic = members.filter((m) => m.givingPattern === 'sporadic').length
  const frequencyDistribution = {
    weekly: Math.round((weekly / total) * 100),
    monthly: Math.round((monthly / total) * 100),
    sporadic: Math.round((sporadic / total) * 100)
  }

  return {
    totalCommitted,
    totalFamiliesHelped: 89,
    activeGiversThisMonth,
    monthlyGiving,
    causeDistribution,
    frequencyDistribution
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CommunityProvider({ children }) {
  // Mosque identity
  const [mosqueIdentity] = useState({
    mosqueName: 'Islamic Center of Austin',
    adminName: 'Sheikh Abdullah Al-Farsi',
    adminRole: 'Imam',
    mosqueCode: 'ICA-AUSTIN-2847',
    verified: true,
    ein: '74-2567891'
  })

  // Congregation
  const [congregation, setCongregation] = useState(() => generateCongregation(47))

  // Welfare cases
  const [welfareCases, setWelfareCases] = useState(initialWelfareCases)

  // Welfare ledger
  const [welfareLedger, setWelfareLedger] = useState(initialWelfareLedger)

  // Zakat pool
  const [zakatPool, setZakatPool] = useState(initialZakatPool)

  // Vouching
  const [vouchQueue, setVouchQueue] = useState(initialVouchQueue)
  const [vouchHistory, setVouchHistory] = useState(() => generateVouchHistory())

  // Events
  const [events, setEvents] = useState(initialEvents)

  // -------------------------------------------------------------------------
  // Aggregate stats (computed)
  // -------------------------------------------------------------------------
  const aggregateStats = useMemo(() => deriveAggregateStats(congregation), [congregation])

  // -------------------------------------------------------------------------
  // Congregation Health Score (computed)
  // -------------------------------------------------------------------------
  const congregationHealthScore = useMemo(() => {
    const activeGivers = congregation.filter((m) => m.activeThisMonth).length
    const total = congregation.length || 1

    // Giving frequency component (0-25)
    const givingFreq = Math.round((activeGivers / total) * 25)

    // Welfare speed component (0-25): what fraction of resolved cases were resolved in 7 days or less
    const resolvedCases = welfareCases.filter((c) => c.status === 'resolved')
    const totalResolved = resolvedCases.length || 1
    const resolvedIn7Days = resolvedCases.filter((c) => (c.daysToResolve || 0) <= 7).length
    const welfareSpeed = Math.round((resolvedIn7Days / totalResolved) * 25)

    // Zakat progress component (0-25): are we on track to distribute by year end?
    const { zakatDistributed, zakatReceived, lunarYearProgress } = zakatPool
    const zakatProgress = Math.round(
      (zakatDistributed / (zakatReceived || 1)) * lunarYearProgress * 25
    )

    // Engagement component (0-25)
    const engagement = Math.round((activeGivers / total) * 25)

    const score = Math.min(100, givingFreq + welfareSpeed + zakatProgress + engagement)
    const interpretation = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Needs attention'

    return { score, givingFreq, welfareSpeed, zakatProgress, engagement, interpretation }
  }, [congregation, welfareCases, zakatPool])

  // -------------------------------------------------------------------------
  // Giving Alerts (computed)
  // -------------------------------------------------------------------------
  const givingAlerts = useMemo(() => {
    const alerts = []

    // Urgent: welfare cases needing immediate attention
    const urgentCases = welfareCases.filter(
      (c) => c.status === 'incoming' && c.urgency === 'urgent'
    )
    if (urgentCases.length > 0) {
      alerts.push({
        type: 'urgent',
        title: `${urgentCases.length} urgent welfare case${urgentCases.length > 1 ? 's' : ''} awaiting review`,
        detail: urgentCases.map((c) => `${c.purpose} ($${c.amount})`).join(', ')
      })
    }

    // Warning: zakat deadline approaching
    if (zakatPool.lunarYearDaysRemaining <= 60 && zakatPool.zakatRemaining > 0) {
      alerts.push({
        type: 'warning',
        title: `$${zakatPool.zakatRemaining.toLocaleString()} zakat undistributed with ${zakatPool.lunarYearDaysRemaining} days remaining`,
        detail: 'Prioritize eligible welfare cases to distribute zakat before the lunar year ends.'
      })
    }

    // Warning: sporadic givers
    const sporadicPercent = aggregateStats.frequencyDistribution?.sporadic || 0
    if (sporadicPercent > 35) {
      alerts.push({
        type: 'warning',
        title: `${sporadicPercent}% of congregation gives sporadically`,
        detail: 'A giving streak campaign typically re-engages 40% of sporadic givers.'
      })
    }

    // Info: lapsed members
    const lapsedCount = congregation.filter((m) => !m.activeThisMonth).length
    if (lapsedCount > 10) {
      alerts.push({
        type: 'info',
        title: `${lapsedCount} members have not given this month`,
        detail: 'A personal check-in message typically re-engages 40% of lapsed givers.'
      })
    }

    // Info: event correlation insight
    alerts.push({
      type: 'info',
      title: 'Jummah gives highest per-attendee return',
      detail: 'Schedule giving reminders for Friday afternoons based on your event data.'
    })

    return alerts
  }, [welfareCases, zakatPool, congregation, aggregateStats])

  // AI insight
  const aiInsight =
    '41% of your congregation gives sporadically. A Ramadan consistency challenge could activate this group.'

  // -------------------------------------------------------------------------
  // Operations
  // -------------------------------------------------------------------------

  /** Move a welfare case between status columns */
  const updateCaseStatus = useCallback((caseId, newStatus) => {
    setWelfareCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const updated = { ...c, status: newStatus }
        if (newStatus === 'in_review' && !c.assignedTo) {
          updated.assignedTo = null
        }
        return updated
      })
    )
  }, [])

  /** Resolve a welfare case and log to the welfare ledger */
  const resolveCase = useCallback((caseId, resolution, amount, notes) => {
    const resolvedAt = new Date().toISOString()

    setWelfareCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const submittedDate = new Date(c.submittedAt)
        const resolvedDate = new Date(resolvedAt)
        const daysToResolve = Math.max(
          1,
          Math.round((resolvedDate - submittedDate) / (1000 * 60 * 60 * 24))
        )
        return {
          ...c,
          status: 'resolved',
          resolution,
          resolvedAt,
          daysToResolve,
          notes: notes ? [...(c.notes || []), notes] : c.notes
        }
      })
    )

    // Log to welfare ledger
    setWelfareLedger((prev) => [
      ...prev,
      {
        id: `led-${Date.now()}`,
        caseId,
        type: resolution.includes('zakat') ? 'zakat' : resolution.includes('sadaqah') ? 'sadaqah' : 'qard_hassan',
        amount,
        resolution,
        resolvedAt
      }
    ])
  }, [])

  /** Log a new event */
  const logEvent = useCallback((eventData) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      followupSent: false,
      ...eventData,
      createdAt: new Date().toISOString()
    }
    setEvents((prev) => [newEvent, ...prev])
  }, [])

  /** Mark an event follow-up as sent */
  const markFollowupSent = useCallback((eventId) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, followupSent: true } : e))
    )
  }, [])

  /** Cast a vouch decision */
  const castVouch = useCallback((applicantId, decision, note) => {
    setVouchQueue((prev) => {
      const item = prev.find((v) => v.id === applicantId)
      if (!item) return prev

      setVouchHistory((hist) => [
        {
          id: `vouch-hist-${Date.now()}`,
          applicantName: item.applicantName,
          amount: item.amount,
          purpose: item.purpose,
          decision,
          decidedAt: new Date().toISOString(),
          note: note || ''
        },
        ...hist
      ])

      return prev.filter((v) => v.id !== applicantId)
    })
  }, [])

  /** Distribute zakat from the pool to a case */
  const distributeZakat = useCallback((amount, caseId) => {
    setZakatPool((prev) => {
      if (amount > prev.zakatRemaining) return prev
      return {
        ...prev,
        zakatDistributed: prev.zakatDistributed + amount,
        zakatRemaining: prev.zakatRemaining - amount
      }
    })

    // If tied to a case, resolve it
    if (caseId) {
      resolveCase(caseId, 'zakat_distributed', amount, `Zakat distribution of $${amount}`)
    }
  }, [resolveCase])

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      // Mosque identity
      ...mosqueIdentity,

      // Congregation
      congregation,

      // Aggregate stats
      aggregateStats,

      // Welfare
      welfareCases,
      welfareLedger,
      zakatPool,

      // Vouching
      vouchQueue,
      vouchHistory,

      // Events
      events,

      // Insights and health
      aiInsight,
      congregationHealthScore,
      givingAlerts,

      // Operations
      updateCaseStatus,
      resolveCase,
      logEvent,
      markFollowupSent,
      castVouch,
      distributeZakat
    }),
    [
      mosqueIdentity,
      congregation,
      aggregateStats,
      welfareCases,
      welfareLedger,
      zakatPool,
      vouchQueue,
      vouchHistory,
      events,
      aiInsight,
      congregationHealthScore,
      givingAlerts,
      updateCaseStatus,
      resolveCase,
      logEvent,
      markFollowupSent,
      castVouch,
      distributeZakat
    ]
  )

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const ctx = useContext(CommunityContext)
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider')
  return ctx
}

export default CommunityContext
