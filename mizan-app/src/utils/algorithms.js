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
  // $200/person/month baseline living cost (realistic for low-income households)
  const discretionaryIncome = monthlyIncome - debts - (householdSize * 200);
  const utilizationPercent =
    discretionaryIncome > 0
      ? Math.round((monthlyPayment / discretionaryIncome) * 100)
      : 100;

  // Compute the maximum feasible loan amount
  const maxMonthlyPayment = Math.max(0, discretionaryIncome * 0.8);
  const maxFeasibleAmount = Math.floor(maxMonthlyPayment * tier.expectedMonths);

  return {
    feasible: discretionaryIncome > monthlyPayment,
    monthlyPayment,
    discretionaryIncome,
    utilizationPercent,
    maxFeasibleAmount,
  };
}

// ---------------------------------------------------------------------------
// 7. computeVouchScore
// ---------------------------------------------------------------------------
/**
 * Compute trust/vouch score from community standing.
 *
 * @param {boolean} imamVouched - Whether imam has vouched
 * @param {string} mosqueTenure - 'long' | 'medium' | 'short' | 'none'
 * @param {boolean} circleMember - Whether borrower is in a qard hassan circle
 * @returns {number} 0-25 trust score
 */
export function computeVouchScore(imamVouched, mosqueTenure, circleMember) {
  let score = 0;
  // Imam vouch: up to 15 points
  if (imamVouched) score += 15;
  // Mosque tenure: up to 10 points
  const tenurePoints = { long: 10, medium: 6, short: 3, none: 0 };
  score += tenurePoints[mosqueTenure] || 0;
  // Circle membership: bonus 5 points (can exceed 25 for strong cases)
  if (circleMember) score += 5;
  return Math.min(30, score); // cap at 30 but threshold checks use 25 scale
}

// ---------------------------------------------------------------------------
// 8. simulateCircleVote
// ---------------------------------------------------------------------------
/**
 * Deterministic circle vote simulation based on application strength.
 * Same inputs always produce the same vote outcome.
 */
export function simulateCircleVote(needScore, vouchScore, tier) {
  const circleSize = tier.name === 'Micro' ? 8 : tier.name === 'Standard' ? 12 : 15;

  // Base yes probability from need score
  const baseProbability = needScore / 100;
  // Trust score adjustment
  const trustAdjustment = (vouchScore / 25) * 0.2;
  const yesProbability = Math.min(0.95, baseProbability + trustAdjustment);

  // Deterministic vote count using score as seed
  const seed = Math.round(needScore * 100 + vouchScore);
  const jitter = 0.85 + (seed % 30) / 100;
  const yesVotes = Math.min(circleSize, Math.max(0, Math.round(circleSize * yesProbability * jitter)));
  const noVotes = circleSize - yesVotes;

  const threshold = tier.name === 'Major' ? 0.66 : 0.51;
  const passed = circleSize > 0 && (yesVotes / circleSize) >= threshold;

  return {
    passed,
    yesVotes,
    noVotes,
    circleSize,
    percentage: circleSize > 0 ? Math.round((yesVotes / circleSize) * 100) : 0,
    threshold: Math.round(threshold * 100),
  };
}

// ---------------------------------------------------------------------------
// 9. computeDecision
// ---------------------------------------------------------------------------
/**
 * Deterministic loan decision engine.
 * Uses real computed scores to produce realistic outcomes.
 *
 * @param {object} application - The submitted application object
 * @returns {object} Decision object with outcome, scores, and reasoning
 */
export function computeDecision(application) {
  const tier = assignTier(application.loanAmount || 500);
  const vouchScore = computeVouchScore(
    application.imamVouched || false,
    application.mosqueTenure || 'none',
    application.circleMember || false
  );

  const { score: needScore, breakdown: needBreakdown } = computeNeedScore(
    application.grossMonthlyIncome || 0,
    application.householdSize || 1,
    application.purposeCategory || 'other',
    application.dependents || 0,
    vouchScore / 25 // normalize to 0-1 for the algorithm
  );

  const feasibility = computeFeasibility(
    (application.grossMonthlyIncome || 0) * 12, // annualize
    application.monthlyDebts || 0,
    application.loanAmount || 500,
    tier,
    application.householdSize || 1
  );

  // Score thresholds per tier
  const scoreThreshold = tier.name === 'Micro' ? 40 : tier.name === 'Standard' ? 50 : 60;
  const trustThreshold = tier.name === 'Micro' ? 10 : tier.name === 'Standard' ? 18 : 22;

  // Hard deny: feasibility impossible
  if (!feasibility.feasible && (feasibility.maxFeasibleAmount || 0) < 50) {
    return {
      outcome: 'denied',
      reason: 'income_insufficient',
      needScore: Math.round(needScore),
      needBreakdown,
      vouchScore,
      feasibility,
      tier,
      denialMessage: 'Based on your income and expenses, any loan repayment would leave your household below the minimum needed for basic living costs. We cannot offer a loan that creates more hardship.',
      suggestions: buildSuggestions(needScore, vouchScore, feasibility, application, scoreThreshold, trustThreshold),
    };
  }

  // Reduced amount: feasible only at lower amount
  if (!feasibility.feasible && (feasibility.maxFeasibleAmount || 0) >= 50) {
    const offeredAmount = Math.floor((feasibility.maxFeasibleAmount || 0) / 50) * 50;
    return {
      outcome: 'reduced',
      reason: 'partial_feasibility',
      offeredAmount,
      monthlyPayment: Math.ceil(offeredAmount / tier.expectedMonths),
      needScore: Math.round(needScore),
      needBreakdown,
      vouchScore,
      feasibility,
      tier,
      reductionReason: `$${application.loanAmount} over ${tier.expectedMonths} months would leave your household of ${application.householdSize} below the minimum needed for basic expenses. We can offer $${offeredAmount} — keeping your monthly payment manageable.`,
    };
  }

  const meetsScore = needScore >= scoreThreshold;
  const meetsTrust = vouchScore >= trustThreshold;

  // Strong application: approve directly
  if (meetsScore && meetsTrust && needScore >= 65) {
    return {
      outcome: 'approved',
      approvedAmount: application.loanAmount,
      monthlyPayment: Math.ceil(application.loanAmount / tier.expectedMonths),
      needScore: Math.round(needScore),
      needBreakdown,
      vouchScore,
      feasibility,
      tier,
      approvalPath: 'direct',
    };
  }

  // Meets score but not trust: circle vote decides
  if (meetsScore && !meetsTrust) {
    const voteResult = simulateCircleVote(needScore, vouchScore, tier);
    if (voteResult.passed) {
      return {
        outcome: 'approved',
        approvedAmount: application.loanAmount,
        monthlyPayment: Math.ceil(application.loanAmount / tier.expectedMonths),
        needScore: Math.round(needScore),
        needBreakdown,
        vouchScore,
        feasibility,
        tier,
        approvalPath: 'circle_vote',
        voteResult,
      };
    } else {
      const reducedAmount = Math.floor(application.loanAmount * 0.7 / 50) * 50;
      return {
        outcome: 'reduced',
        reason: 'circle_vote_reduced',
        offeredAmount: reducedAmount,
        monthlyPayment: Math.ceil(reducedAmount / tier.expectedMonths),
        needScore: Math.round(needScore),
        needBreakdown,
        vouchScore,
        feasibility,
        tier,
        voteResult,
        reductionReason: 'The circle voted to fund a reduced amount given the early stage of your community standing. As your trust score grows, future applications can unlock the full amount.',
      };
    }
  }

  // Borderline: meets trust but not score
  if (!meetsScore && meetsTrust) {
    const voteResult = simulateCircleVote(needScore, vouchScore, tier);
    if (voteResult.passed) {
      const reducedAmount = Math.floor(application.loanAmount * 0.75 / 50) * 50;
      return {
        outcome: 'reduced',
        reason: 'borderline_approved',
        offeredAmount: reducedAmount,
        monthlyPayment: Math.ceil(reducedAmount / tier.expectedMonths),
        needScore: Math.round(needScore),
        needBreakdown,
        vouchScore,
        feasibility,
        tier,
        voteResult,
        reductionReason: `Your community standing is strong, but the need score was just below the threshold. The circle approved a reduced amount of $${reducedAmount} as a first step.`,
      };
    }
  }

  // Below threshold: deny with dignity
  return {
    outcome: 'denied',
    reason: 'below_threshold',
    needScore: Math.round(needScore),
    needBreakdown,
    vouchScore,
    feasibility,
    tier,
    denialMessage: "Your application didn't meet the threshold for this loan tier right now. This is based purely on the algorithm — not a judgment of your character.",
    suggestions: buildSuggestions(needScore, vouchScore, feasibility, application, scoreThreshold, trustThreshold),
  };
}

function buildSuggestions(needScore, vouchScore, feasibility, application, scoreThreshold, trustThreshold) {
  const suggestions = [];
  if (vouchScore < trustThreshold) {
    suggestions.push({
      title: 'Get an imam vouch',
      detail: `Adds up to 15 trust points. Your current trust score is ${vouchScore} — the threshold is ${trustThreshold}.`,
    });
  }
  if (needScore < scoreThreshold) {
    suggestions.push({
      title: 'Higher urgency needs score higher',
      detail: 'Medical, rent, and transportation needs score 20-25 urgency points. Planning-ahead requests score lower.',
    });
  }
  if (!feasibility.feasible && feasibility.maxFeasibleAmount > 50) {
    suggestions.push({
      title: `Request a smaller amount`,
      detail: `$${feasibility.maxFeasibleAmount} would be feasible on your current income instead of $${application.loanAmount}.`,
    });
  }
  if (!application.mosqueTenure || application.mosqueTenure === 'none' || application.mosqueTenure === 'short') {
    suggestions.push({
      title: 'Establish mosque connection',
      detail: '2+ years of mosque tenure adds 10 trust points. Even 6 months adds 6 points.',
    });
  }
  return suggestions;
}
