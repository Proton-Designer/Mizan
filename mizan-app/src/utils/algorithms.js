/**
 * algorithms.js
 *
 * Pure functions for Mizan's core logic.
 * No React imports, no context imports, no side effects.
 */

// ---------------------------------------------------------------------------
// Category relatedness map for intention matching
// ---------------------------------------------------------------------------
const RELATED_CATEGORIES = {
  education: ['youth', 'literacy', 'scholarships', 'training'],
  health: ['medical', 'healthcare', 'mental_health', 'nutrition'],
  medical: ['health', 'healthcare', 'mental_health'],
  food: ['nutrition', 'hunger', 'agriculture'],
  housing: ['shelter', 'homelessness', 'rent'],
  shelter: ['housing', 'homelessness', 'rent'],
  environment: ['climate', 'sustainability', 'water'],
  water: ['environment', 'sanitation', 'infrastructure'],
  youth: ['education', 'mentorship', 'orphans'],
  orphans: ['youth', 'childcare', 'foster'],
  refugees: ['displacement', 'immigration', 'emergency'],
  emergency: ['disaster', 'relief', 'refugees'],
  poverty: ['economic', 'microfinance', 'food', 'housing'],
  microfinance: ['poverty', 'small_business', 'economic'],
};

// Purpose urgency weights for need scoring
const PURPOSE_URGENCY = {
  medical: 1.0,
  rent: 0.9,
  car_repair: 0.7,
  tuition: 0.6,
  utility: 0.5,
  small_business: 0.4,
};

// ---------------------------------------------------------------------------
// 1. scoreNGOFeed
// ---------------------------------------------------------------------------
/**
 * Five-signal scoring algorithm for the NGO discovery feed.
 *
 * @param {Array}  ngoDatabase   - Array of NGO objects
 * @param {Array}  userIntentions - User's stated intention categories/tags
 * @param {Array}  userPositions  - User's existing donation positions (with category fields)
 * @param {number} sessionSeed   - Deterministic seed for Thompson Sampling per session
 * @returns {{ feed: Array, sunnahDiscovery: object|null, sunnahReason: string }}
 */
export function scoreNGOFeed(ngoDatabase, userIntentions, userPositions, sessionSeed) {
  const donatedCategories = new Set(
    (userPositions || []).map((p) => p.category).filter(Boolean)
  );

  const scored = (ngoDatabase || []).map((ngo, index) => {
    // --- Signal 1: Intention match (40%) ---
    const ngoTags = [
      ...(ngo.categories || []),
      ...(ngo.tags || []),
    ].map((t) => t.toLowerCase());

    let intentionScore = 0;
    if (userIntentions && userIntentions.length > 0) {
      const matches = userIntentions.map((intention) => {
        const intentionLower = intention.toLowerCase();
        // Exact match
        if (ngoTags.includes(intentionLower)) return 1.0;
        // Related category match
        const related = RELATED_CATEGORIES[intentionLower] || [];
        if (ngoTags.some((tag) => related.includes(tag))) return 0.5;
        // Check reverse: does any ngo tag consider this intention related?
        if (
          ngoTags.some((tag) => {
            const tagRelated = RELATED_CATEGORIES[tag] || [];
            return tagRelated.includes(intentionLower);
          })
        ) {
          return 0.5;
        }
        return 0;
      });
      intentionScore = matches.length > 0
        ? matches.reduce((a, b) => a + b, 0) / matches.length
        : 0;
    }

    // --- Signal 2: Urgency (20%) ---
    const urgencyScore = ngo.urgencyScore || 0;

    // --- Signal 3: Underserved bonus (15%) ---
    const donorCount = ngo.platformDonorCount || 0;
    const underservedScore = 1 - Math.min(1, donorCount / 500);

    // --- Signal 4: Diversity (15%) ---
    const ngoCategory = (ngo.categories && ngo.categories[0]) || ngo.category || '';
    const diversityScore = donatedCategories.has(ngoCategory.toLowerCase()) ? 0 : 1;

    // --- Signal 5: Thompson Sampling (10%) ---
    const thompsonScore =
      Math.sin(sessionSeed * index * 12.9898) * 0.5 + 0.5;

    // --- Weighted total ---
    const totalScore =
      intentionScore * 0.4 +
      urgencyScore * 0.2 +
      underservedScore * 0.15 +
      diversityScore * 0.15 +
      thompsonScore * 0.1;

    return {
      ...ngo,
      _score: totalScore,
      _breakdown: {
        intention: intentionScore,
        urgency: urgencyScore,
        underserved: underservedScore,
        diversity: diversityScore,
        thompson: thompsonScore,
      },
    };
  });

  // Sort descending by score
  const feed = scored.sort((a, b) => b._score - a._score);

  // Sunnah Discovery: highest-scoring NGO with < 15 donors and not in user positions
  const positionNgoIds = new Set(
    (userPositions || []).map((p) => p.ngoId).filter(Boolean)
  );

  const sunnahDiscovery =
    feed.find(
      (ngo) =>
        (ngo.platformDonorCount || 0) < 15 && !positionNgoIds.has(ngo.id)
    ) || null;

  const sunnahReason = sunnahDiscovery
    ? `This cause has only ${sunnahDiscovery.platformDonorCount || 0} supporters on Mizan and matches your values — be among the first to back it.`
    : '';

  return { feed, sunnahDiscovery, sunnahReason };
}

// ---------------------------------------------------------------------------
// 2. computeQardhassanDemand
// ---------------------------------------------------------------------------
/**
 * Compute cycle estimates for a Qardhassan deployment.
 *
 * @param {number} amount        - Lender contribution amount in dollars
 * @param {string} ngoId         - Target NGO / pool identifier
 * @param {Array}  borrowerPool  - Array of borrower objects with { tier, ... }
 * @returns {{ estimatedMonthsPerCycle, rangeMin, rangeMax, familiesPerCycle, deploymentShape }}
 */
export function computeQardhassanDemand(amount, ngoId, borrowerPool) {
  const pool = borrowerPool || [];

  const microBorrowers = pool.filter((b) => b.tier === 'micro');
  const standardBorrowers = pool.filter((b) => b.tier === 'standard');
  const majorBorrowers = pool.filter((b) => b.tier === 'major');

  // Average loan size per tier
  const TIER_AVG = { micro: 275, standard: 1250, major: 4000 };
  const TIER_MONTHS = { micro: 3, standard: 5, major: 8 };

  // Greedily allocate amount across tiers starting from micro (most impact)
  let remaining = amount;
  let microFunded = 0;
  let standardFunded = 0;
  let majorFunded = 0;

  // Fund micro borrowers first
  for (let i = 0; i < microBorrowers.length && remaining >= TIER_AVG.micro; i++) {
    remaining -= TIER_AVG.micro;
    microFunded++;
  }
  // Then standard
  for (let i = 0; i < standardBorrowers.length && remaining >= TIER_AVG.standard; i++) {
    remaining -= TIER_AVG.standard;
    standardFunded++;
  }
  // Then major
  for (let i = 0; i < majorBorrowers.length && remaining >= TIER_AVG.major; i++) {
    remaining -= TIER_AVG.major;
    majorFunded++;
  }

  const totalFunded = microFunded + standardFunded + majorFunded;
  const familiesPerCycle = Math.max(1, totalFunded);

  // Weighted average repayment time
  let estimatedMonthsPerCycle;
  if (totalFunded > 0) {
    estimatedMonthsPerCycle = Math.round(
      (microFunded * TIER_MONTHS.micro +
        standardFunded * TIER_MONTHS.standard +
        majorFunded * TIER_MONTHS.major) /
        totalFunded
    );
  } else {
    // Fallback: estimate from amount alone
    const tier = assignTier(amount);
    estimatedMonthsPerCycle = tier.expectedMonths;
  }

  return {
    estimatedMonthsPerCycle,
    rangeMin: estimatedMonthsPerCycle - 1,
    rangeMax: estimatedMonthsPerCycle + 2,
    familiesPerCycle,
    deploymentShape: {
      micro: microFunded,
      standard: standardFunded,
      major: majorFunded,
    },
  };
}

// ---------------------------------------------------------------------------
// 3. computeImpactPreview
// ---------------------------------------------------------------------------
/**
 * Compute the live impact preview shown in the invest modal.
 *
 * @param {number}      amount       - Dollar amount
 * @param {string}      type         - 'direct' | 'compound' | 'jariyah'
 * @param {number|null} cycles       - Number of compound cycles (null for jariyah)
 * @param {number}      splitPercent - Percentage allocated as sadaqah (0-100)
 * @param {object}      ngo          - NGO object with optional impactPerDollar
 * @returns {{ familiesTotal, totalRealWorldGood, estimatedMonths, sadaqahAmount, returnAmount }}
 */
export function computeImpactPreview(amount, type, cycles, splitPercent, ngo) {
  const typeLower = (type || '').toLowerCase();

  if (typeLower === 'direct') {
    const impactPerDollar = (ngo && ngo.impactPerDollar) || 2;
    return {
      familiesTotal: Math.round((amount * impactPerDollar) / 100),
      totalRealWorldGood: amount,
      estimatedMonths: 0,
      sadaqahAmount: amount,
      returnAmount: 0,
    };
  }

  if (typeLower === 'compound') {
    const familiesPerCycle = Math.ceil(amount / 400);
    const familiesTotal = familiesPerCycle * (cycles || 1);
    const estimatedMonthsPerCycle = assignTier(amount).expectedMonths;

    return {
      familiesTotal,
      totalRealWorldGood: amount * (cycles || 1),
      estimatedMonths: estimatedMonthsPerCycle * (cycles || 1),
      sadaqahAmount: amount * ((splitPercent || 0) / 100),
      returnAmount: amount * ((100 - (splitPercent || 0)) / 100),
    };
  }

  if (typeLower === 'jariyah') {
    return {
      familiesTotal: '\u221E',
      totalRealWorldGood: 'Unlimited',
      estimatedMonths: 'Perpetual',
      sadaqahAmount: amount,
      returnAmount: 0,
    };
  }

  // Fallback for unknown type
  return {
    familiesTotal: 0,
    totalRealWorldGood: 0,
    estimatedMonths: 0,
    sadaqahAmount: 0,
    returnAmount: 0,
  };
}

// ---------------------------------------------------------------------------
// 4. computeNeedScore
// ---------------------------------------------------------------------------
/**
 * Borrower need evaluation (Phase 2).
 *
 * @param {number} income          - Annual income in dollars
 * @param {number} householdSize   - Number of people in household
 * @param {string} purposeCategory - Loan purpose category
 * @param {number} dependents      - Number of dependents
 * @param {number} vouchScore      - Community vouch score 0-1
 * @returns {{ score: number, breakdown: { income, household, purpose, dependents, vouch } }}
 */
export function computeNeedScore(income, householdSize, purposeCategory, dependents, vouchScore) {
  const incomeFactor = 1 - Math.min(1, (income || 0) / 80000);
  const householdFactor = Math.min(1, (householdSize || 1) / 8);
  const purposeFactor = PURPOSE_URGENCY[purposeCategory] || 0.3;
  const dependentsFactor = Math.min(1, (dependents || 0) / 5);
  const vouchFactor = vouchScore || 0;

  const raw =
    incomeFactor * 0.3 +
    householdFactor * 0.2 +
    purposeFactor * 0.25 +
    dependentsFactor * 0.15 +
    vouchFactor * 0.1;

  const score = Math.max(0, Math.min(100, raw * 100));

  return {
    score,
    breakdown: {
      income: incomeFactor,
      household: householdFactor,
      purpose: purposeFactor,
      dependents: dependentsFactor,
      vouch: vouchFactor,
    },
  };
}

// ---------------------------------------------------------------------------
// 5. assignTier
// ---------------------------------------------------------------------------
/**
 * Assign a loan tier based on amount.
 *
 * @param {number} amount - Loan amount in dollars
 * @returns {{ name: string, maxAmount: number, expectedMonths: number }}
 */
export function assignTier(amount) {
  if (amount <= 500) return { name: 'Micro', maxAmount: 500, expectedMonths: 3 };
  if (amount <= 2000) return { name: 'Standard', maxAmount: 2000, expectedMonths: 5 };
  return { name: 'Major', maxAmount: 10000, expectedMonths: 8 };
}

// ---------------------------------------------------------------------------
// 6. computeFeasibility
// ---------------------------------------------------------------------------
/**
 * Debt-to-income feasibility check.
 *
 * @param {number} income        - Annual income in dollars
 * @param {number} debts         - Monthly existing debt obligations
 * @param {number} loanAmount    - Requested loan amount
 * @param {object} tier          - Tier object from assignTier()
 * @param {number} householdSize - Number of people in household
 * @returns {{ feasible: boolean, monthlyPayment: number, discretionaryIncome: number, utilizationPercent: number }}
 */
export function computeFeasibility(income, debts, loanAmount, tier, householdSize) {
  const monthlyPayment = loanAmount / tier.expectedMonths;
  const monthlyIncome = income / 12;
  const discretionaryIncome = monthlyIncome - debts - (householdSize * 500);
  const utilizationPercent =
    discretionaryIncome > 0
      ? Math.round((monthlyPayment / discretionaryIncome) * 100)
      : 100;

  return {
    feasible: discretionaryIncome > monthlyPayment,
    monthlyPayment,
    discretionaryIncome,
    utilizationPercent,
  };
}
