import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// NGOPartnerContext — Phase 4.1
// The authenticated NGO-side data layer (partner dashboard).
// Distinct from NGOContext.jsx which serves the investor/portfolio view.
// ---------------------------------------------------------------------------

const NGOPartnerContext = createContext(null)

// ---- deterministic seeded PRNG (mulberry32) --------------------------------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- donor generator -------------------------------------------------------
const FIRST_NAMES = [
  'Ahmad', 'Fatima', 'Omar', 'Maryam', 'Yusuf', 'Khadijah', 'Ibrahim',
  'Aisha', 'Hassan', 'Zahra', 'Ali', 'Nour', 'Bilal', 'Amina', 'Tariq',
  'Salma', 'Hamza', 'Layla', 'Khalid', 'Sara', 'Idris', 'Hana', 'Zaid',
  'Rania', 'Jamal', 'Dina', 'Kareem', 'Yasmin', 'Sami', 'Huda', 'Rashid',
  'Mariam', 'Faisal', 'Nadia', 'Imran', 'Sumaya', 'Walid', 'Lina',
  'Mahdi', 'Reem',
]

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const CITIES = [
  'Houston', 'Dearborn', 'Chicago', 'Dallas', 'New York', 'Los Angeles',
  'Atlanta', 'Minneapolis', 'Philadelphia', 'San Francisco', 'Detroit',
  'Seattle', 'Washington DC', 'Boston', 'Denver', 'Phoenix', 'Orlando',
  'Tampa', 'Charlotte', 'St. Louis',
]

const CAMPAIGN_IDS = ['camp-001', 'camp-002', 'camp-003', 'camp-004']

function generateDonors() {
  const rng = mulberry32(20260101) // deterministic seed

  // ---------- 5 pre-seeded donors ----------
  const preSeeded = [
    {
      id: 'donor-001',
      name: 'Ahmad K.',
      city: 'Houston',
      email: 'ahmad.k@email.com',
      firstDonation: '2024-03-12',
      lastDonation: '2026-04-02',
      totalGiven: 4820,
      donationCount: 14,
      averageDonation: 344.29,
      campaigns: ['camp-001', 'camp-002', 'camp-003'],
      isJariyah: true,
      isCompound: true,
      segment: 'jariyah',
      compoundBalance: 1240,
      source: 'direct',
      notes: 'Consistent monthly donor, interested in orphan sponsorship',
    },
    {
      id: 'donor-002',
      name: 'Fatima M.',
      city: 'Dearborn',
      email: 'fatima.m@email.com',
      firstDonation: '2025-01-08',
      lastDonation: '2026-03-28',
      totalGiven: 2150,
      donationCount: 7,
      averageDonation: 307.14,
      campaigns: ['camp-001', 'camp-002'],
      isJariyah: false,
      isCompound: true,
      segment: 'compound',
      compoundBalance: 680,
      source: 'social',
      notes: 'Referred 3 other donors',
    },
    {
      id: 'donor-003',
      name: 'Anonymous',
      city: 'Houston',
      email: null,
      firstDonation: '2025-11-22',
      lastDonation: '2026-04-10',
      totalGiven: 8500,
      donationCount: 3,
      averageDonation: 2833.33,
      campaigns: ['camp-001', 'camp-002', 'camp-003', 'camp-004'],
      isJariyah: true,
      isCompound: false,
      segment: 'jariyah',
      compoundBalance: 0,
      source: 'direct',
      notes: 'Large anonymous donor from Houston area',
    },
    {
      id: 'donor-004',
      name: 'Omar B.',
      city: 'Chicago',
      email: 'omar.b@email.com',
      firstDonation: '2026-02-14',
      lastDonation: '2026-04-05',
      totalGiven: 375,
      donationCount: 3,
      averageDonation: 125,
      campaigns: ['camp-002'],
      isJariyah: false,
      isCompound: true,
      segment: 'repeat',
      compoundBalance: 210,
      source: 'referral',
      notes: '',
    },
    {
      id: 'donor-005',
      name: 'Maryam S.',
      city: 'Dallas',
      email: 'maryam.s@email.com',
      firstDonation: '2026-04-11',
      lastDonation: '2026-04-11',
      totalGiven: 50,
      donationCount: 1,
      averageDonation: 50,
      campaigns: ['camp-001'],
      isJariyah: false,
      isCompound: false,
      segment: 'firstTime',
      compoundBalance: 0,
      source: 'social',
      notes: 'New donor from Instagram campaign',
    },
  ]

  // ---------- 407 generated donors ----------
  // Segment targets: jariyah 18 total (13 more), repeat 94 (93 more),
  //   lapsed 47 (47 more), compound 93 (91 more), firstTime 170 (169 more)
  // We already have: jariyah 2, repeat 1, compound 1, firstTime 1 = 5

  const segmentBuckets = [
    { segment: 'jariyah', remaining: 13 },
    { segment: 'repeat', remaining: 93 },
    { segment: 'lapsed', remaining: 47 },
    { segment: 'compound', remaining: 91 },
    { segment: 'firstTime', remaining: 163 }, // 163 more to reach 170 - 5 preseeded but only 1 firstTime preseeded = 169... we adjust below
  ]
  // Total remaining = 13+93+47+91+163 = 407. Perfect.

  const generated = []

  let segIdx = 0
  let segCount = 0

  // Flatten segment list for assignment
  const segmentList = []
  for (const b of segmentBuckets) {
    for (let i = 0; i < b.remaining; i++) {
      segmentList.push(b.segment)
    }
  }
  // Shuffle deterministically
  for (let i = segmentList.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[segmentList[i], segmentList[j]] = [segmentList[j], segmentList[i]]
  }

  for (let i = 0; i < 407; i++) {
    const seg = segmentList[i]
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
    const lastInit = LAST_INITIALS[Math.floor(rng() * LAST_INITIALS.length)]
    const city = CITIES[Math.floor(rng() * CITIES.length)]

    const isAnon = rng() < 0.08
    const name = isAnon ? 'Anonymous' : `${firstName} ${lastInit}.`

    // donation amounts vary by segment
    let totalGiven, donationCount
    switch (seg) {
      case 'jariyah':
        totalGiven = Math.round(800 + rng() * 4200)
        donationCount = Math.round(4 + rng() * 18)
        break
      case 'repeat':
        totalGiven = Math.round(150 + rng() * 1800)
        donationCount = Math.round(3 + rng() * 8)
        break
      case 'lapsed':
        totalGiven = Math.round(50 + rng() * 600)
        donationCount = Math.round(1 + rng() * 4)
        break
      case 'compound':
        totalGiven = Math.round(100 + rng() * 2400)
        donationCount = Math.round(2 + rng() * 10)
        break
      default: // firstTime
        totalGiven = Math.round(25 + rng() * 300)
        donationCount = 1
    }

    const campaignCount = Math.min(
      CAMPAIGN_IDS.length,
      seg === 'firstTime' ? 1 : Math.ceil(rng() * 3)
    )
    const shuffled = [...CAMPAIGN_IDS].sort(() => rng() - 0.5)
    const campaigns = shuffled.slice(0, campaignCount)

    // Generate dates
    const startMonth = seg === 'firstTime'
      ? 3 + Math.floor(rng() * 2) // Mar-Apr 2026
      : seg === 'lapsed'
        ? 1 + Math.floor(rng() * 6) // Jan-Jun 2025 (lapsed)
        : Math.floor(rng() * 12) + 1 // any 2025 month
    const startYear = seg === 'lapsed' ? 2025 : (rng() < 0.4 ? 2025 : 2026)
    const firstDay = Math.ceil(rng() * 28)
    const firstDonation = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`

    let lastDonation
    if (seg === 'lapsed') {
      // Last donated 3-8 months ago
      const lapsedMonth = 8 + Math.floor(rng() * 5) // Aug-Dec 2025
      lastDonation = `2025-${String(lapsedMonth).padStart(2, '0')}-${String(Math.ceil(rng() * 28)).padStart(2, '0')}`
    } else if (seg === 'firstTime') {
      lastDonation = firstDonation
    } else {
      // Recent
      const recentMonth = 2 + Math.floor(rng() * 3) // Feb-Apr 2026
      lastDonation = `2026-${String(recentMonth).padStart(2, '0')}-${String(Math.ceil(rng() * 28)).padStart(2, '0')}`
    }

    const compoundBalance = (seg === 'compound' || seg === 'jariyah')
      ? Math.round(50 + rng() * (totalGiven * 0.4))
      : 0

    generated.push({
      id: `donor-${String(i + 6).padStart(3, '0')}`,
      name,
      city,
      email: isAnon ? null : `${firstName.toLowerCase()}.${lastInit.toLowerCase()}${i}@email.com`,
      firstDonation,
      lastDonation,
      totalGiven,
      donationCount,
      averageDonation: Math.round((totalGiven / donationCount) * 100) / 100,
      campaigns,
      isJariyah: seg === 'jariyah',
      isCompound: seg === 'compound' || seg === 'jariyah',
      segment: seg,
      compoundBalance,
      source: ['direct', 'social', 'referral', 'search', 'email'][Math.floor(rng() * 5)],
      notes: '',
    })
  }

  return [...preSeeded, ...generated]
}

// ---- initial state ---------------------------------------------------------

const INITIAL_ORG = {
  orgName: 'Islamic Relief USA',
  ein: '95-3253008',
  website: 'irusa.org',
  logo: 'https://logo.clearbit.com/irusa.org',
  mission:
    'Islamic Relief USA is dedicated to alleviating suffering, hunger, illiteracy, and diseases worldwide regardless of color, race, religion, or creed, and to provide aid in a compassionate and dignified manner guided by Islamic values of social justice, human dignity, and self-reliance.',
  contactName: 'Aisha Rahman',
  contactTitle: 'Director of Digital Fundraising',
  contactEmail: 'aisha@irusa.org',
  contactPhone: '(703) 555-0192',
  verificationTier: 1,
  verificationDate: 'January 15, 2026',
  causeCategories: ['Emergency relief', 'Orphan care', 'Clean water', 'Education'],
  countriesOfOperation: [
    'Yemen', 'Gaza', 'Somalia', 'Sudan', 'Pakistan', 'Bangladesh', 'Syria',
  ],
  bankName: 'Chase Bank',
  bankLast4: '8821',
  bankConnected: true,
}

const INITIAL_FINANCIAL = {
  availableBalance: 4200,
  pipelineTotal: 16500,
  lifetimeTotalRaised: 284700,
  lifetimeFamiliesHelped: 1247,
  settlementSchedule: [
    { month: 'May 2026', amount: 1200, positions: 4 },
    { month: 'June 2026', amount: 2800, positions: 9 },
    { month: 'July 2026', amount: 4100, positions: 14 },
    { month: 'Q4 2026', amount: 8400, positions: 31 },
  ],
  transactions: [
    {
      id: 'txn-001',
      date: '2026-01-15',
      type: 'settlement',
      description: 'January settlement — 6 matured positions',
      amount: 1850,
      balance: 1850,
    },
    {
      id: 'txn-002',
      date: '2026-01-22',
      type: 'withdrawal',
      description: 'Bank transfer to Chase ****8821',
      amount: -1500,
      balance: 350,
    },
    {
      id: 'txn-003',
      date: '2026-02-14',
      type: 'settlement',
      description: 'February settlement — 8 matured positions',
      amount: 2400,
      balance: 2750,
    },
    {
      id: 'txn-004',
      date: '2026-02-20',
      type: 'conversion',
      description: 'Compound-to-direct conversion — 3 donors',
      amount: 620,
      balance: 3370,
    },
    {
      id: 'txn-005',
      date: '2026-03-10',
      type: 'settlement',
      description: 'March settlement — 11 matured positions',
      amount: 3100,
      balance: 6470,
    },
    {
      id: 'txn-006',
      date: '2026-03-18',
      type: 'withdrawal',
      description: 'Bank transfer to Chase ****8821',
      amount: -4000,
      balance: 2470,
    },
    {
      id: 'txn-007',
      date: '2026-04-05',
      type: 'settlement',
      description: 'April settlement — 5 matured positions',
      amount: 1980,
      balance: 4450,
    },
    {
      id: 'txn-008',
      date: '2026-04-12',
      type: 'withdrawal',
      description: 'Bank transfer to Chase ****8821',
      amount: -250,
      balance: 4200,
    },
  ],
}

const INITIAL_CAMPAIGNS = [
  // ---- 4 Active campaigns ----
  {
    id: 'camp-001',
    name: 'Yemen Orphan Fund',
    status: 'active',
    goal: 12000,
    raised: 8400,
    directDonations: 5200,
    compoundDonations: 3200,
    donorCount: 247,
    jariyahCount: 18,
    ranking: 'Top 12%',
    impactMetric: '$1 = 2 meals',
    coverImage: '/images/campaigns/yemen-orphan.jpg',
    description:
      'Providing daily meals, education, and care for orphaned children in Sana\'a and Aden, Yemen.',
    createdAt: '2025-09-01',
    endsAt: '2026-09-01',
    updates: [
      {
        id: 'upd-001',
        date: '2026-03-15',
        title: 'March field report',
        body: '142 children received daily meals this month. New classroom opened in Aden.',
        photos: 2,
      },
      {
        id: 'upd-002',
        date: '2026-02-10',
        title: 'Winter supplies delivered',
        body: 'Blankets and warm clothing distributed to 89 orphans across 3 centers.',
        photos: 4,
      },
    ],
  },
  {
    id: 'camp-002',
    name: 'Gaza Emergency Relief',
    status: 'active',
    goal: 5000,
    raised: 4200,
    directDonations: 3800,
    compoundDonations: 1800,
    donorCount: 183,
    jariyahCount: 9,
    ranking: 'Top 8%',
    impactMetric: '$1 = 1 emergency kit',
    coverImage: '/images/campaigns/gaza-emergency.jpg',
    description:
      'Emergency food, medical supplies, and shelter kits for displaced families in Gaza.',
    createdAt: '2025-11-15',
    endsAt: '2026-06-15',
    goalMet: true,
    updates: [
      {
        id: 'upd-003',
        date: '2026-04-01',
        title: 'Goal reached!',
        body: 'Alhamdulillah — thanks to 183 donors, we have met our $5,000 goal. Every dollar continues to fund emergency kits.',
        photos: 1,
      },
    ],
  },
  {
    id: 'camp-003',
    name: 'Somalia Clean Water Initiative',
    status: 'active',
    goal: 8000,
    raised: 3440,
    directDonations: 2440,
    compoundDonations: 1000,
    donorCount: 89,
    jariyahCount: 4,
    ranking: 'Top 31%',
    impactMetric: '$1 = 3 days of clean water',
    coverImage: '/images/campaigns/somalia-water.jpg',
    description:
      'Building wells and water purification systems in drought-affected regions of Somalia.',
    createdAt: '2026-01-10',
    endsAt: '2026-12-31',
    updates: [],
  },
  {
    id: 'camp-004',
    name: 'Rohingya Medical Aid',
    status: 'active',
    goal: 15000,
    raised: 1560,
    directDonations: 1060,
    compoundDonations: 500,
    donorCount: 47,
    jariyahCount: 2,
    ranking: 'Top 44%',
    impactMetric: '$1 = 4 clinic visits',
    coverImage: '/images/campaigns/rohingya-medical.jpg',
    description:
      'Mobile clinics providing primary healthcare to Rohingya refugees in Cox\'s Bazar, Bangladesh.',
    createdAt: '2026-03-01',
    endsAt: '2027-03-01',
    updates: [],
  },

  // ---- 1 Draft campaign ----
  {
    id: 'camp-005',
    name: 'Sudan Education Initiative',
    status: 'draft',
    goal: 10000,
    raised: 0,
    directDonations: 0,
    compoundDonations: 0,
    donorCount: 0,
    jariyahCount: 0,
    ranking: null,
    impactMetric: '$1 = 1 school supply kit',
    coverImage: null,
    description: 'Providing school supplies and teacher training in displaced communities across Sudan.',
    createdAt: '2026-04-15',
    endsAt: null,
    updates: [],
  },

  // ---- 7 Closed campaigns ----
  {
    id: 'camp-closed-001',
    name: 'Ramadan Food Baskets 2025',
    status: 'closed',
    goal: 20000,
    raised: 22400,
    donorCount: 312,
    createdAt: '2025-02-01',
    closedAt: '2025-04-15',
  },
  {
    id: 'camp-closed-002',
    name: 'Pakistan Flood Relief',
    status: 'closed',
    goal: 15000,
    raised: 14200,
    donorCount: 198,
    createdAt: '2024-09-01',
    closedAt: '2025-01-31',
  },
  {
    id: 'camp-closed-003',
    name: 'Syria Winter Campaign 2024',
    status: 'closed',
    goal: 10000,
    raised: 11800,
    donorCount: 156,
    createdAt: '2024-11-01',
    closedAt: '2025-03-01',
  },
  {
    id: 'camp-closed-004',
    name: 'Qurbani 2025',
    status: 'closed',
    goal: 25000,
    raised: 27600,
    donorCount: 410,
    createdAt: '2025-05-01',
    closedAt: '2025-06-20',
  },
  {
    id: 'camp-closed-005',
    name: 'Bangladesh Cyclone Response',
    status: 'closed',
    goal: 8000,
    raised: 6900,
    donorCount: 102,
    createdAt: '2025-06-10',
    closedAt: '2025-09-30',
  },
  {
    id: 'camp-closed-006',
    name: 'Back to School 2025',
    status: 'closed',
    goal: 5000,
    raised: 5400,
    donorCount: 87,
    createdAt: '2025-07-15',
    closedAt: '2025-09-15',
  },
  {
    id: 'camp-closed-007',
    name: 'Yemen Emergency Medicine',
    status: 'closed',
    goal: 12000,
    raised: 13200,
    donorCount: 174,
    createdAt: '2025-03-01',
    closedAt: '2025-08-31',
  },
]

const INITIAL_PENDING_ACTIONS = [
  {
    id: 'action-001',
    type: 'impact_update',
    priority: 'high',
    title: 'Impact update overdue — Somalia Clean Water Initiative',
    description:
      'Your Somalia Clean Water campaign has not posted an impact update in 98 days. Donors who receive updates are 3.2x more likely to give again.',
    campaignId: 'camp-003',
    createdAt: '2026-04-15',
  },
  {
    id: 'action-002',
    type: 'goal_met',
    priority: 'medium',
    title: 'Gaza Emergency Relief has met its goal',
    description:
      'Congratulations! Your Gaza campaign raised $4,200 against a $5,000 goal. Consider posting a thank-you update and extending the goal or closing the campaign.',
    campaignId: 'camp-002',
    createdAt: '2026-04-01',
  },
  {
    id: 'action-003',
    type: 'balance_available',
    priority: 'medium',
    title: '$4,200 available for withdrawal',
    description:
      'You have $4,200 in settled funds ready to transfer to your Chase account ending in 8821.',
    createdAt: '2026-04-12',
  },
  {
    id: 'action-004',
    type: 'new_donors',
    priority: 'low',
    title: '12 new donors this week',
    description:
      'You gained 12 first-time donors in the past 7 days. Send a welcome message to increase retention by up to 40%.',
    createdAt: '2026-04-16',
  },
]

const INITIAL_AB_TESTS = [
  {
    id: 'ab-001',
    campaignId: 'camp-001',
    status: 'completed',
    field: 'title',
    variantA: {
      label: 'Variant A',
      value: 'Support Orphans in Yemen',
      impressions: 1420,
      clicks: 184,
      conversions: 38,
      ctr: 12.96,
      conversionRate: 2.68,
    },
    variantB: {
      label: 'Variant B',
      value: 'Yemen Orphan Fund — Feed a Child for $1',
      impressions: 1380,
      clicks: 241,
      conversions: 57,
      ctr: 17.46,
      conversionRate: 4.13,
    },
    winner: 'B',
    startedAt: '2026-02-01',
    endedAt: '2026-03-01',
    appliedVariant: 'B',
  },
  {
    id: 'ab-002',
    campaignId: 'camp-002',
    status: 'active',
    field: 'coverImage',
    variantA: {
      label: 'Variant A',
      value: '/images/campaigns/gaza-emergency-a.jpg',
      impressions: 640,
      clicks: 78,
      conversions: 18,
      ctr: 12.19,
      conversionRate: 2.81,
    },
    variantB: {
      label: 'Variant B',
      value: '/images/campaigns/gaza-emergency-b.jpg',
      impressions: 620,
      clicks: 104,
      conversions: 27,
      ctr: 16.77,
      conversionRate: 4.35,
    },
    winner: null,
    leading: 'B',
    startedAt: '2026-03-15',
    endedAt: null,
    appliedVariant: null,
  },
]

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NGOPartnerProvider({ children }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [org, setOrg] = useState(INITIAL_ORG)
  const [financial, setFinancial] = useState(INITIAL_FINANCIAL)
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [donors] = useState(() => generateDonors())
  const [pendingActions, setPendingActions] = useState(INITIAL_PENDING_ACTIONS)
  const [abTests, setAbTests] = useState(INITIAL_AB_TESTS)

  // Automation data
  const [acknowledgmentQueue] = useState([
    { id: 'ack-1', donorName: 'Ahmad K.', city: 'Austin TX', amount: 300, mode: 'compound', campaign: 'Yemen Orphan Fund', hoursAgo: 2, cycleNumber: 2, totalCycles: 3, isJariyah: false, acknowledged: false },
    { id: 'ack-2', donorName: '[Anonymous]', city: 'Houston TX', amount: 200, mode: 'direct', campaign: 'Gaza Emergency', hoursAgo: 6, isJariyah: false, acknowledged: false },
    { id: 'ack-3', donorName: 'Fatima M.', city: 'Dallas TX', amount: 500, mode: 'compound', campaign: 'Orphan Care', hoursAgo: 24, isJariyah: true, acknowledged: false },
  ])

  const [failedPayments] = useState([
    { id: 'fp-1', donorName: 'Ahmad K.', monthlyAmount: 60, campaign: 'Yemen Orphan Fund', failureReason: 'Card declined', daysSinceFailure: 3, recoveryAttempts: 1, status: 'in_progress' },
    { id: 'fp-2', donorName: 'Fatima M.', monthlyAmount: 80, campaign: 'Somalia Water Wells', failureReason: 'Card expired', daysSinceFailure: 5, recoveryAttempts: 0, status: 'pending' },
    { id: 'fp-3', donorName: '[Anonymous]', monthlyAmount: 40, campaign: 'Somalia Water Wells', failureReason: 'Insufficient funds', daysSinceFailure: 1, recoveryAttempts: 1, status: 'recovered' },
  ])

  const [islamicCalendarEvents] = useState([
    { id: 'ice-1', name: 'Dhul Hijjah', daysAway: 23, historicalMultiplier: 2.1, optimalOutreachDays: 18 },
    { id: 'ice-2', name: 'Eid Al-Adha', daysAway: 33, historicalMultiplier: 1.8, optimalOutreachDays: 28 },
    { id: 'ice-3', name: 'Muharram', daysAway: 54, historicalMultiplier: 1.3, optimalOutreachDays: 49 },
    { id: 'ice-4', name: 'Ramadan', daysAway: 320, historicalMultiplier: 4.2, optimalOutreachDays: 310 },
  ])

  // ---- donor segments (computed) ----
  const donorSegments = useMemo(() => {
    const segments = { jariyah: [], repeat: [], lapsed: [], compound: [], firstTime: [] }
    for (const d of donors) {
      if (segments[d.segment]) {
        segments[d.segment].push(d)
      }
    }
    return segments
  }, [donors])

  // ---- operations ----

  const createCampaign = useCallback(
    (data) => {
      const newCampaign = {
        id: `camp-${String(Date.now()).slice(-6)}`,
        status: 'draft',
        raised: 0,
        directDonations: 0,
        compoundDonations: 0,
        donorCount: 0,
        jariyahCount: 0,
        ranking: null,
        updates: [],
        createdAt: new Date().toISOString().slice(0, 10),
        ...data,
      }
      setCampaigns((prev) => [...prev, newCampaign])
      return newCampaign
    },
    []
  )

  const postImpactUpdate = useCallback(
    (campaignId, update) => {
      const newUpdate = {
        id: `upd-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        photos: 0,
        ...update,
      }
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId
            ? { ...c, updates: [newUpdate, ...(c.updates || [])] }
            : c
        )
      )
      // Dismiss related pending action
      setPendingActions((prev) =>
        prev.filter(
          (a) =>
            !(a.type === 'impact_update' && a.campaignId === campaignId)
        )
      )
      return newUpdate
    },
    []
  )

  const messageDonorSegment = useCallback(
    (segmentId, message) => {
      const count = donorSegments[segmentId]?.length || 0
      const log = {
        action: 'message_segment',
        segmentId,
        recipientCount: count,
        messagePreview: message.slice(0, 80),
        timestamp: new Date().toISOString(),
      }
      // eslint-disable-next-line no-console
      console.log('[NGOPartner] messageDonorSegment', log)
      return log
    },
    [donorSegments]
  )

  const initiateWithdrawal = useCallback(
    (amount) => {
      if (amount <= 0 || amount > financial.availableBalance) {
        return { success: false, error: 'Invalid withdrawal amount' }
      }
      const newBalance = financial.availableBalance - amount
      const txn = {
        id: `txn-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'withdrawal',
        description: `Bank transfer to ${org.bankName} ****${org.bankLast4}`,
        amount: -amount,
        balance: newBalance,
      }
      setFinancial((prev) => ({
        ...prev,
        availableBalance: newBalance,
        transactions: [...prev.transactions, txn],
      }))
      // Dismiss balance action if fully withdrawn
      if (newBalance === 0) {
        setPendingActions((prev) =>
          prev.filter((a) => a.type !== 'balance_available')
        )
      }
      return { success: true, transaction: txn }
    },
    [financial.availableBalance, org.bankName, org.bankLast4]
  )

  const exportDonors = useCallback(
    (format = 'json') => {
      if (format === 'csv') {
        const headers = [
          'id', 'name', 'city', 'email', 'firstDonation', 'lastDonation',
          'totalGiven', 'donationCount', 'segment', 'campaigns',
        ]
        const rows = donors.map((d) =>
          headers
            .map((h) => {
              const val = d[h]
              if (Array.isArray(val)) return `"${val.join(';')}"`
              if (typeof val === 'string' && val.includes(','))
                return `"${val}"`
              return val ?? ''
            })
            .join(',')
        )
        return [headers.join(','), ...rows].join('\n')
      }
      return donors
    },
    [donors]
  )

  const launchAbTest = useCallback(
    (campaignId, config) => {
      const newTest = {
        id: `ab-${String(Date.now()).slice(-6)}`,
        campaignId,
        status: 'active',
        field: config.field || 'title',
        variantA: {
          label: 'Variant A',
          value: config.variantA,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0,
        },
        variantB: {
          label: 'Variant B',
          value: config.variantB,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0,
        },
        winner: null,
        leading: null,
        startedAt: new Date().toISOString().slice(0, 10),
        endedAt: null,
        appliedVariant: null,
      }
      setAbTests((prev) => [...prev, newTest])
      return newTest
    },
    []
  )

  const applyAbVariant = useCallback(
    (testId, variant) => {
      let applied = null
      setAbTests((prev) =>
        prev.map((t) => {
          if (t.id !== testId) return t
          applied = t
          return {
            ...t,
            status: 'completed',
            winner: variant,
            endedAt: new Date().toISOString().slice(0, 10),
            appliedVariant: variant,
          }
        })
      )
      // Apply the winning variant to the campaign
      if (applied) {
        const winningValue =
          variant === 'A' ? applied.variantA.value : applied.variantB.value
        const field = applied.field
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === applied.campaignId
              ? { ...c, [field]: winningValue }
              : c
          )
        )
      }
    },
    []
  )

  // ---- context value ----
  const completeOnboarding = useCallback(() => setOnboardingComplete(true), [])

  const value = useMemo(
    () => ({
      // state
      onboardingComplete,
      org,
      financial,
      campaigns,
      donors,
      donorSegments,
      pendingActions,
      abTests,
      acknowledgmentQueue,
      failedPayments,
      islamicCalendarEvents,
      // operations
      completeOnboarding,
      createCampaign,
      postImpactUpdate,
      messageDonorSegment,
      initiateWithdrawal,
      exportDonors,
      launchAbTest,
      applyAbVariant,
    }),
    [
      onboardingComplete,
      org,
      financial,
      campaigns,
      donors,
      donorSegments,
      pendingActions,
      abTests,
      acknowledgmentQueue,
      failedPayments,
      islamicCalendarEvents,
      completeOnboarding,
      createCampaign,
      postImpactUpdate,
      messageDonorSegment,
      initiateWithdrawal,
      exportDonors,
      launchAbTest,
      applyAbVariant,
    ]
  )

  return (
    <NGOPartnerContext.Provider value={value}>
      {children}
    </NGOPartnerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNGOPartner() {
  const ctx = useContext(NGOPartnerContext)
  if (!ctx) {
    throw new Error('useNGOPartner must be used within an NGOPartnerProvider')
  }
  return ctx
}

export default NGOPartnerContext
