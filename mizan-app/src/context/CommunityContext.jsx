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

const CIRCLE_IDS = ['circle-msa-grad', 'circle-sisters', 'circle-ramadan-emergency']

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

    // Giving mode: 62% direct, 38% compound, 17% jariyah overlap
    const modeRoll = rng()
    let givingMode
    if (modeRoll < 0.17) {
      givingMode = ['compound', 'jariyah']
    } else if (modeRoll < 0.38) {
      givingMode = ['compound']
    } else {
      givingMode = ['direct']
    }

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

    // Assign some members to circles
    let activeCircle = null
    if (i < 12) activeCircle = CIRCLE_IDS[0]
    else if (i < 20) activeCircle = CIRCLE_IDS[1]
    else if (i < 25) activeCircle = CIRCLE_IDS[2]

    const joinYear = 2023 + Math.floor(rng() * 3)
    const joinMonth = String(Math.floor(1 + rng() * 12)).padStart(2, '0')
    const joinDay = String(Math.floor(1 + rng() * 28)).padStart(2, '0')

    members.push({
      memberId,
      name: `${firstName} ${lastName}`,
      joinedDate: `${joinYear}-${joinMonth}-${joinDay}`,
      givingPattern,
      givingMode,
      monthlyGivingAmount,
      totalGiven,
      preferredCause,
      activeCircle,
      activeThisMonth: rng() < 0.66
    })
  }

  return members
}

// ---------------------------------------------------------------------------
// Pool history for MSA Graduate Circle
// ---------------------------------------------------------------------------
const msaPoolHistory = [
  { date: '2025-11-01', description: 'Circle formed — 8 founding members pledge $200/mo', amount: 1600, balance: 1600 },
  { date: '2025-12-01', description: 'Monthly contributions collected', amount: 1600, balance: 3200 },
  { date: '2026-01-01', description: 'Monthly contributions collected', amount: 1600, balance: 4800 },
  { date: '2026-01-18', description: 'Loan disbursed to Omar Osman — tuition', amount: -1800, balance: 3000 },
  { date: '2026-02-01', description: 'Monthly contributions collected (4 new members joined)', amount: 2400, balance: 5400 },
  { date: '2026-02-28', description: 'Loan repayment received from Omar Osman', amount: 600, balance: 6000 },
  { date: '2026-03-01', description: 'Monthly contributions collected', amount: 2400, balance: 8400 },
  { date: '2026-03-15', description: 'Loan disbursed to Fatima Al-Farsi — medical', amount: -1400, balance: 7000 }
]

// ---------------------------------------------------------------------------
// Circles
// ---------------------------------------------------------------------------
function buildInitialCircles(members) {
  const msaMembers = members.filter((m) => m.activeCircle === 'circle-msa-grad')
  const sistersMembers = members.filter((m) => m.activeCircle === 'circle-sisters')
  const ramadanMembers = members.filter((m) => m.activeCircle === 'circle-ramadan-emergency')

  return [
    {
      id: 'circle-msa-grad',
      name: 'MSA Graduate Circle',
      type: 'qard-hasan',
      members: msaMembers.map((m) => m.memberId),
      monthlyPledge: 200,
      totalPooled: 8400,
      availableCapital: 7000,
      activeLoans: 2,
      pendingVotes: 1,
      poolHistory: msaPoolHistory,
      repaymentRate: 94,
      poolHealthScore: 82,
      createdAt: '2025-11-01T00:00:00Z',
      approvalRules: { quorum: 0.6, approvalThreshold: 0.75, maxLoanPercent: 40 },
      maxLoanPercent: 40
    },
    {
      id: 'circle-sisters',
      name: 'Sisters Circle',
      type: 'qard-hasan',
      members: sistersMembers.map((m) => m.memberId),
      monthlyPledge: 120,
      totalPooled: 3840,
      availableCapital: 2940,
      activeLoans: 1,
      pendingVotes: 0,
      poolHistory: [
        { date: '2025-12-01', description: 'Circle formed', amount: 960, balance: 960 },
        { date: '2026-01-01', description: 'Monthly contributions', amount: 960, balance: 1920 },
        { date: '2026-02-01', description: 'Monthly contributions', amount: 960, balance: 2880 },
        { date: '2026-02-20', description: 'Loan disbursed — emergency rent', amount: -900, balance: 1980 },
        { date: '2026-03-01', description: 'Monthly contributions', amount: 960, balance: 2940 },
        { date: '2026-04-01', description: 'Monthly contributions', amount: 960, balance: 3900 }
      ],
      repaymentRate: 100,
      poolHealthScore: 96,
      createdAt: '2025-12-01T00:00:00Z',
      approvalRules: { quorum: 0.5, approvalThreshold: 0.67, maxLoanPercent: 35 },
      maxLoanPercent: 35
    },
    {
      id: 'circle-ramadan-emergency',
      name: 'Ramadan Emergency Circle',
      type: 'emergency',
      members: ramadanMembers.map((m) => m.memberId),
      monthlyPledge: 100,
      totalPooled: 500,
      availableCapital: 500,
      activeLoans: 0,
      pendingVotes: 0,
      poolHistory: [
        { date: '2026-03-28', description: 'Circle formed for Ramadan emergency aid', amount: 500, balance: 500 }
      ],
      repaymentRate: null,
      poolHealthScore: 100,
      createdAt: '2026-03-28T00:00:00Z',
      approvalRules: { quorum: 0.5, approvalThreshold: 0.6, maxLoanPercent: 50 },
      maxLoanPercent: 50
    }
  ]
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
// Events
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
    type: 'celebration'
  },
  {
    id: 'event-ramadan-27',
    name: 'Ramadan Night 27 — Laylat al-Qadr',
    date: '2026-04-20',
    attendees: 200,
    givers: 14,
    totalRaised: 2140,
    correlationMultiplier: 7.6,
    type: 'spiritual'
  },
  {
    id: 'event-jummah-fundraiser',
    name: 'Jummah Fundraiser',
    date: '2026-03-15',
    attendees: 85,
    givers: 8,
    totalRaised: 840,
    correlationMultiplier: 3.2,
    type: 'fundraiser'
  },
  {
    id: 'event-finance-workshop',
    name: 'Islamic Finance Workshop',
    date: '2026-02-12',
    attendees: 45,
    givers: 6,
    totalRaised: 580,
    correlationMultiplier: 2.2,
    type: 'education'
  }
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

  // Giving mode breakdown
  const directCount = members.filter((m) => m.givingMode.includes('direct')).length
  const compoundCount = members.filter((m) => m.givingMode.includes('compound')).length
  const jariyahCount = members.filter((m) => m.givingMode.includes('jariyah')).length

  const givingBreakdown = {
    direct: Math.round((directCount / total) * 100),
    compound: Math.round((compoundCount / total) * 100),
    jariyah: Math.round((jariyahCount / total) * 100)
  }

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
    givingBreakdown,
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
    mosqueAddress: '123 Main St, Austin TX 78701',
    adminName: 'Sheikh Abdullah Al-Farsi',
    adminRole: 'Imam',
    mosqueCode: 'ICA-AUSTIN-2847',
    verified: true,
    ein: '74-2567891'
  })

  // Congregation
  const [congregation, setCongregation] = useState(() => generateCongregation(47))

  // Circles
  const [circles, setCircles] = useState(() => buildInitialCircles(generateCongregation(47)))

  // Vouching
  const [vouchQueue, setVouchQueue] = useState(initialVouchQueue)
  const [vouchHistory, setVouchHistory] = useState(() => generateVouchHistory())

  // Events
  const [events, setEvents] = useState(initialEvents)

  // AI insight
  const aiInsight =
    '41% of your congregation gives sporadically — less than once per month. A Ramadan consistency challenge could activate this group.'

  // Pool health (overall)
  const poolHealth = 94

  // -------------------------------------------------------------------------
  // Computed aggregate stats
  // -------------------------------------------------------------------------
  const computeAggregateStats = useCallback(() => {
    return deriveAggregateStats(congregation)
  }, [congregation])

  const aggregateStats = useMemo(() => computeAggregateStats(), [computeAggregateStats])

  // -------------------------------------------------------------------------
  // Operations
  // -------------------------------------------------------------------------

  const castVouch = useCallback(
    (applicantId, decision, note) => {
      setVouchQueue((prev) => {
        const item = prev.find((v) => v.id === applicantId)
        if (!item) return prev

        // Add to history
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

        // Remove from queue
        return prev.filter((v) => v.id !== applicantId)
      })
    },
    []
  )

  const createCircle = useCallback((circleData) => {
    setCircles((prev) => [
      ...prev,
      {
        id: circleData.id || `circle-${Date.now()}`,
        name: circleData.name,
        type: circleData.type || 'qard-hasan',
        members: circleData.members || [],
        monthlyPledge: circleData.monthlyPledge || 0,
        totalPooled: 0,
        availableCapital: 0,
        activeLoans: 0,
        pendingVotes: 0,
        poolHistory: [],
        repaymentRate: null,
        poolHealthScore: 100,
        createdAt: new Date().toISOString(),
        approvalRules: circleData.approvalRules || {
          quorum: 0.5,
          approvalThreshold: 0.67,
          maxLoanPercent: 40
        },
        maxLoanPercent: circleData.maxLoanPercent || 40,
        ...circleData
      }
    ])
  }, [])

  const logEvent = useCallback((eventData) => {
    setEvents((prev) => [
      {
        id: eventData.id || `event-${Date.now()}`,
        name: eventData.name,
        date: eventData.date || new Date().toISOString().slice(0, 10),
        attendees: eventData.attendees || 0,
        givers: eventData.givers || 0,
        totalRaised: eventData.totalRaised || 0,
        correlationMultiplier: eventData.correlationMultiplier || 1.0,
        type: eventData.type || 'other'
      },
      ...prev
    ])
  }, [])

  const switchCommunityDemo = useCallback(
    (demoState) => {
      if (demoState === 'reset') {
        const freshMembers = generateCongregation(47)
        setCongregation(freshMembers)
        setCircles(buildInitialCircles(freshMembers))
        setVouchQueue(initialVouchQueue)
        setVouchHistory(generateVouchHistory())
        setEvents(initialEvents)
      }
    },
    []
  )

  // -------------------------------------------------------------------------
  // Backward-compatible "community" object for existing consumers
  // -------------------------------------------------------------------------
  const community = useMemo(() => ({
    name: mosqueIdentity.mosqueName,
    verified: mosqueIdentity.verified,
    members: congregation.length,
    committed: aggregateStats.totalCommitted,
    familiesHelped: aggregateStats.totalFamiliesHelped,
    circles: circles.length,
    monthly: {
      committed: aggregateStats.monthlyGiving,
      families: 12,
      active: aggregateStats.activeGiversThisMonth,
      total: congregation.length
    },
    giving: {
      direct: aggregateStats.givingBreakdown.direct,
      compound: aggregateStats.givingBreakdown.compound,
      jariyah: aggregateStats.givingBreakdown.jariyah,
      causes: aggregateStats.causeDistribution.map((c) => ({ name: c.name, pct: c.percent })),
      frequency: aggregateStats.frequencyDistribution
    },
    loans: {
      active: circles.reduce((s, c) => s + c.activeLoans, 0),
      outstanding: circles.reduce((s, c) => s + (c.totalPooled - c.availableCapital), 0),
      onSchedule: 2,
      dueSoon: 1,
      pendingVote: circles.reduce((s, c) => s + c.pendingVotes, 0),
      repaymentRate: Math.round(
        circles.filter((c) => c.repaymentRate !== null).reduce((s, c) => s + c.repaymentRate, 0) /
          circles.filter((c) => c.repaymentRate !== null).length
      )
    },
    pendingActions: [
      ...(vouchQueue.length > 0
        ? [{ type: 'vouch', label: vouchQueue[0].applicantName, severity: 'red' }]
        : []),
      ...(circles.some((c) => c.pendingVotes > 0)
        ? [{ type: 'vote', label: 'Circle vote needs quorum', severity: 'yellow' }]
        : []),
      { type: 'info', label: 'New member linked', severity: 'grey' }
    ]
  }), [mosqueIdentity, congregation, aggregateStats, circles, vouchQueue])

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      // Backward-compatible community object
      community,

      // Mosque identity (flat)
      ...mosqueIdentity,

      // Congregation
      congregation,

      // Aggregate stats
      aggregateStats,
      computeAggregateStats,

      // Circles
      circles,

      // Vouching
      vouchQueue,
      vouchHistory,

      // Events
      events,

      // Insights & health
      aiInsight,
      poolHealth,

      // Operations
      castVouch,
      createCircle,
      logEvent,
      switchCommunityDemo
    }),
    [
      community,
      mosqueIdentity,
      congregation,
      aggregateStats,
      computeAggregateStats,
      circles,
      vouchQueue,
      vouchHistory,
      events,
      aiInsight,
      poolHealth,
      castVouch,
      createCircle,
      logEvent,
      switchCommunityDemo
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
