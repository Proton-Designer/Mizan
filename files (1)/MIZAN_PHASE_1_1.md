# MIZAN — Phase 1.1 (REVISED): Portfolio Dashboard, Banking & Data Foundation
## Build Document for Claude Code

---

## Web App Context

Mizan is a **web application** for desktop and tablet browsers. All layouts are full-width responsive designs using a left sidebar for navigation. Do not use mobile-first 430px containers or bottom navigation bars. Sidebar nav, multi-column grids, and standard web UX patterns throughout.

---

## Phase 1.1 Scope

Three foundational systems built in this phase, in this order:

1. **Simulated Banking System** — fake bank account connection, live balance management, full transaction ledger. Must be built first — every investment action in Phases 1.2 and 1.3 runs through it.

2. **Real NGO Data Layer** — fetch real nonprofit data from public APIs, cache it, expose it to the discovery algorithm and invest flow.

3. **Portfolio Dashboard** — the main screen of the personal account, wired to the banking system and real NGO data.

---

## System 1: Simulated Banking

### Purpose

The banking simulation makes money feel real throughout the demo. When a user invests $300, that $300 leaves their available balance. When a compound cycle completes and returns 50% to the user, $150 appears back in their balance. All numbers are consistent across every screen.

### Core concepts

The user has one simulated bank account with three money buckets:

**Available balance** — money the user can invest or withdraw right now. Starts at $5,000 after bank connection.

**Committed capital** — money locked inside active compound positions cycling through qard hassan. Not spendable. Shows separately so the user understands where their money is.

**Total portfolio value** — the sum of available + committed + all money already donated as sadaqah (cumulative, never decreases).

### Bank connection onboarding

The first time a user enters the Portfolio account, they see a bank connection modal before reaching the dashboard. This is a one-time flow.

The modal presents a list of fake banks (Chase, Bank of America, Wells Fargo, Capital One, University Credit Union). The user selects one and enters any 10-digit account number. The system accepts any number — this is pure simulation.

On completion: a success screen shows "Successfully connected — [Bank Name] ****[last 4 digits]. Your simulated balance: $5,000." A brief one-screen explainer follows: "This balance is simulated — no real money moves. When you invest, your balance goes down. When cycles complete and return funds, your balance goes up. Everything stays consistent." Then the user enters the dashboard.

The `bankConnected` flag is stored in context. Once true, this flow never shows again.

### Balance seeding

The demo has pre-existing mock positions to make the dashboard look rich on first load. These positions must have already consumed funds from the initial $5,000:

- Position 1: $500 → Islamic Relief (Jariyah) — committed
- Position 2: $300 → Zakat Foundation (Compound, 2 cycles) — committed
- Position 3: $150 → Penny Appeal (Direct, complete) — spent
- Position 4: $200 → Human Appeal (Compound, 3 cycles) — committed

Available balance on load: `5000 - 500 - 300 - 150 - 200 = $3,850`
Committed capital: `500 + 300 + 200 = $1,000`
Sadaqah donated: `$150` (the completed direct donation)

These numbers must be consistent. If the user opens the Transactions page, they see four historical transactions matching these positions with timestamps from the past few months.

### Banking operations

These are functions exported from PortfolioContext that all other components must use for any monetary action. No component should directly mutate balance numbers.

**`investDirect(amount, ngo)`** — deducts `amount` from `bankBalance`. Creates a position record of type `direct`. Logs a `invest_direct` transaction. Returns `{ success: true }` or `{ success: false, reason: 'insufficient_funds' }`.

**`investCompound(amount, ngo, cycles, splitPercent)`** — deducts `amount` from `bankBalance`, adds it to `committedCapital`. Creates a compound position record. Logs `invest_compound`. Returns success/failure.

**`processReturn(positionId, returnAmount)`** — adds `returnAmount` to `bankBalance`. Removes `returnAmount` from `committedCapital`. Logs `cycle_return`. Called by the simulation engine when a cycle completes and the user has a >0% return split.

**`addFunds(amount)`** — adds `amount` to `bankBalance`. Logs `deposit`. Used by the "Add funds" button in the sidebar.

**Validation:** Every debit operation checks `amount <= bankBalance`. If not, returns failure. The UI shows an inline error: "Insufficient funds — you have $X available. Add more funds or reduce your amount."

### Transaction ledger

Every monetary event generates a transaction record:

```
{
  id: unique string,
  timestamp: ISO date string,
  type: 'invest_direct' | 'invest_compound' | 'cycle_return' | 'cycle_complete' | 'deposit' | 'sadaqah_settled',
  amount: number (positive = credit, negative = debit),
  description: human-readable string,
  balanceAfter: number,
  relatedPositionId: string | null,
  relatedNgoName: string | null
}
```

The `balanceAfter` field is critical — it lets the Transactions page show a running balance history like a real bank statement.

Pre-populate the transaction ledger with 4 historical transactions matching the mock positions. Timestamps should be spread over the past 90 days to look realistic.

### Add Funds flow

The "Add funds" button in the sidebar opens a simple modal. User types any dollar amount. Clicking "Add $[amount]" calls `addFunds()`, closes the modal, and the sidebar balance updates immediately. No validation — any amount is accepted (it's simulated). Show a brief success toast: "Added $[amount] to your account."

### Transactions page

At route `/portfolio/transactions`. A full-width table with columns: Date | Type | Description | Amount | Balance After. Filterable by transaction type via a dropdown. Each row's Amount is colored green for credits, red for debits. The table is paginated (20 rows per page) if the ledger grows large.

---

## System 2: Real NGO Data

### Data sources and fetch strategy

Fetch real data from these public sources. All fetching happens on app initialization, asynchronously, without blocking the dashboard from rendering.

**IRS Exempt Organizations Search API**
Public, no authentication required, CORS accessible.
Base URL: `https://efts.irs.gov/LATEST/search-index`

Query for Muslim/Islamic charities:
```
https://efts.irs.gov/LATEST/search-index?q=%22islamic%22&limit=50
https://efts.irs.gov/LATEST/search-index?q=%22muslim%22&limit=50
https://efts.ifs.gov/LATEST/search-index?q=%22zakat%22&limit=25
```

Returns: organization name, EIN, state, subsection code, NTEE classification. Use this to verify 501(c)(3) status and get EINs for further lookups.

**Charity Navigator Open Data**
Charity Navigator publishes a free dataset. Access via their API:
```
https://api.charitynavigator.org/v2/Organizations?app_id=[APP_ID]&app_key=[APP_KEY]
```
Apply for a free developer API key at `https://www.charitynavigator.org/index.cfm?bay=content.view&cpid=1397`. The key is typically issued within 24 hours.

Fetch ratings for the specific EINs of the target NGOs. This returns: overall score, star rating, financial health score, accountability score, program expense percentage.

If Charity Navigator API is unavailable, use their published annual data export (CSV) from `https://data.charitynavigator.org/` — parse the relevant rows for the target NGOs.

**NGO websites for supplementary content**
For each NGO, fetch their site's Open Graph metadata:
```
https://api.microlink.io/?url=[NGO_URL]
```
Microlink is a public API that extracts OG data (title, description, image) from any URL — CORS friendly, free tier available. This gives the NGO's own description and a usable image.

Alternatively, use `https://jsonlink.io/api/extract?url=[NGO_URL]` as a fallback.

For logos specifically: `https://logo.clearbit.com/[domain]` returns a clean company logo for most well-known domains. Islamic Relief, Penny Appeal, and Zakat Foundation are all in Clearbit's database.

### Target NGOs with known data

These 10 NGOs should be seeded as hardcoded fallback data and enhanced with live API data:

| Organization | EIN | Domain | Primary Category |
|---|---|---|---|
| Islamic Relief USA | 95-3253008 | irusa.org | Emergency relief / orphan care |
| Penny Appeal USA | 46-3144351 | pennyappealusa.org | Food / water / emergency |
| Zakat Foundation of America | 36-4476244 | zakat.org | Water / education / poverty |
| Human Appeal USA | 83-2421623 | humanappealusa.org | Orphan care / food / medical |
| Helping Hand for Relief (HHRD) | 36-4622474 | hhrd.org | Food / education / emergency |
| ICNA Relief USA | 11-2745327 | icnarelief.org | Domestic poverty / refugees |
| Islamic Medical Association (IMANA) | 36-2922671 | imana.org | Healthcare / medical |
| Muslim Aid USA | 26-4387963 | muslimaidusa.org | Water / food / refugees |
| LaunchGood (platform) | N/A | launchgood.com | Crowdfunding / varied |
| Dar ul-Islam | varies | varies | Mosque / community |

### What to store per NGO

After fetching and merging all available sources, store each NGO as:

- `id` — slugified name (e.g., `islamic-relief-usa`)
- `name` — official name
- `ein` — IRS EIN
- `logo` — URL of logo image (Clearbit or OG image)
- `website` — official URL
- `mission` — 1-2 sentence description from OG data or IRS filing
- `category` — primary cause type (water | food | medical | education | orphan | emergency | refugees | community)
- `secondaryCategories` — array of secondary types
- `countriesOfOperation` — array of country names (hardcoded from their websites since this isn't in APIs)
- `verificationStatus` — `tier1` if IRS 501(c)(3) confirmed, `tier2` if community-vouched only
- `irsVerified` — bool, from IRS API response
- `charityNavigatorScore` — overall score 0-100 (null if not rated)
- `charityNavigatorStars` — 0-4 stars (null if not rated)
- `programExpensePercent` — percentage of revenue going to programs (from Form 990 data)
- `annualRevenue` — most recent year revenue from Form 990 (in dollars)
- `impactPerDollar` — number (e.g., 2 for "2 meals per dollar")
- `impactUnit` — string (e.g., "meals", "water days", "school days")
- `impactDescription` — "$1 = 2 meals for an orphan in Yemen"
- `compoundEligible` — bool (true for all except emergency-only campaigns)
- `urgencyScore` — 0.0 to 1.0 (computed from campaign data, recency of updates)
- `platformDonorCount` — simulated number seeded by NGO size (Islamic Relief: 847, small NGOs: 3-12)
- `tags` — array of keyword strings for semantic matching
- `currentCampaigns` — array of active campaign objects

### Impact-per-dollar derivation

These are derived from publicly reported program data:

- **Islamic Relief USA**: Reports ~$0.92 of every dollar to programs. Their feeding programs report approximately $0.47/meal in Yemen. So `$1 ≈ 2 meals`.
- **Penny Appeal USA**: Higher efficiency model, reports ~$0.89 to programs with food programs at ~$0.30/meal. `$1 ≈ 3 meals`.
- **Zakat Foundation**: Clean water programs report $1 funds approximately 3 days of clean water access per person. `$1 ≈ 3 water days`.
- **Human Appeal**: ~91% program efficiency from their Form 990. Orphan sponsorship programs: $1 ≈ 1.5 school meals.
- **HHRD**: School feeding programs: $1 ≈ 4 school meals. Medical programs: $1 ≈ 0.5 clinic visits.
- **ICNA Relief**: Domestic poverty programs: $1 ≈ 2 meals or $0.50 toward rental assistance.

Present these as estimates, not guarantees: "$1 funds approximately 2 meals" not "$1 = exactly 2 meals."

### Caching strategy

After the first successful fetch:
1. Store the full `ngoDatabase` array as a JSON string in localStorage with a timestamp key
2. On subsequent loads, check if cached data is less than 24 hours old — if yes, use cached data without refetching
3. If cache is older than 24 hours, refetch in the background and update the cache
4. If the user is offline or all fetches fail, use the hardcoded seed data

### Loading state

While NGO data is fetching (`ngoLoading: true`), show skeleton cards in the Discover feed and placeholder boxes in the holdings that show real NGO logos. The dashboard itself loads immediately with portfolio stats and chart — only the NGO-specific content shows skeletons.

---

## System 3: Portfolio Dashboard

### Layout

The portfolio account uses a persistent two-column layout:

**Left sidebar (240px fixed):**
Contains:
- Mizan wordmark (gold, Cormorant Garamond)
- Bank balance section: "Available $3,850" and "Committed $1,000" — visible at all times
- "Add funds" button (ghost, opens deposit modal)
- Navigation links: Portfolio / Invest / Journey / Discover / Transactions / Settings
- Active link: gold left border indicator
- Bottom: user name, mosque affiliation, a "Switch account" link back to Welcome

**Main content area (fills remaining width):**
All dashboard content renders here. Max width ~960px with auto margins if viewport is very wide.

### Dashboard sections

**Section 1 — Hero stat cards**
A horizontal row of 5 cards spanning full content width. Each card is roughly equal width. Cards:
1. Total Akhirah Portfolio — cumulative total deployed (increases only). Large Cormorant Garamond number.
2. Families Helped — cumulative impact count. Counts up on mount with Framer Motion.
3. Active Positions — current count of active investments.
4. Jariyah Active — count of perpetual commitments.
5. Impact Rate — families helped per month. Shows as "[X]/month."

These numbers are computed from the positions array and updated live as the simulation engine runs.

**Section 2 — Chart row (two columns)**
Left column (65% width): The performance chart. SVG line chart showing cumulative families helped over time. Y-axis never decreases. Time filter tabs above chart: 1M, 3M, 6M, 1Y, All. Metric toggle below: Families / Meals / Loans / Committed. Each combination produces an always-rising line. Path draws with Framer Motion `pathLength` animation on mount, re-animates on metric/range change.

Right column (35% width): Portfolio composition. A donut chart showing the breakdown of committed capital by cause category (emergency relief, water, orphan care, education, etc.). Rendered in SVG. Category colors consistent with the broader color system. Legend below the donut. Labels show both category name and percentage.

**Section 3 — Holdings grid**
A 2-column card grid. One card per position. Grid uses CSS Grid with `grid-template-columns: repeat(2, 1fr)` and `gap: 16px`.

Each position card shows:
- Top: NGO logo (real, from the data layer) + cause name + commitment type badge
- Middle: Amount committed + families helped + cycle progress bar
- Compound positions: current borrower info ("Ahmed, Dallas — car repair")
- Bottom: Estimated settlement date or "Jariyah — perpetual"

The logos must be real — fetched from the NGO data layer. If a logo fails, show a colored initial circle.

**Section 4 — Diversification nudge (conditional)**
Full-width card that appears once per month if the portfolio is too concentrated in one category. Shows the cause distribution as a stacked horizontal bar (same category colors as the donut chart). AI-generated analysis text. Two suggested NGO cards to explore. Dismissable with X.

**Section 5 — Jariyah Vault preview**
Full-width card. Shows memorial/tribute accounts. For the demo, Ahmed Al-Farsi (father, memorial) is pre-seeded. Shows his latest impact entry: "Your father's sadaqah fed 40 children in Yemen during iftar — 2 hours ago." A "Manage Vault →" link navigates to the Vault page.

**Section 6 — AI Reflection inline**
A static card at the very bottom showing a hardcoded hadith-grounded reflection on the portfolio's current state. Phase 1.2 replaces this with a live Claude API call. For Phase 1.1, hardcode a contextually appropriate reflection.

---

## Cycle Simulation Engine

The compound positions simulate the passage of time so the demo feels live.

### Design

Each compound position has:
- `cycleStartDate` — ISO string for when the current cycle began
- `estimatedCycleEndDate` — computed from algorithm output (months per cycle)
- `cyclesCurrent` — how many cycles have completed
- `cyclesTotal` — total cycles requested (or null for Jariyah)
- `currentBorrowers` — array of borrower objects from the pool

Set the mock position dates so they are interesting on April 18, 2026:

Position 2 (Zakat Foundation, 2 cycles): Cycle 1 started Feb 14, 2026. Estimated end Sept 2026. At April 18, cycle is ~40% complete. This shows a meaningful in-progress state.

Position 4 (Human Appeal, 3 cycles): Cycle 1 started April 1, 2026. Very early — shows as "just started."

### Simulation engine behavior

On app load, the simulation engine (a `useEffect` in PortfolioContext) runs through all compound positions:

1. For each position, compute `cycleProgress` using real `Date.now()` math against the stored dates
2. If `cycleProgress >= 1.0` and this hasn't been logged yet, process the cycle completion: create the next cycle, update the journey log, optionally trigger a return to balance if `splitPercent < 100`
3. Update position records with current progress percentages

The engine runs once on load. It does not run on a timer — the "real time" aspect is achieved through date math, not animation.

### Borrower pool

Pre-seed 20 fake borrowers in PortfolioContext. Each has: `firstName`, `city`, `state`, `purpose`, `loanAmount`, `tier`, `repaymentRate` (0.0-1.0). Names and cities should reflect the Muslim American community — mix of Arabic, Somali, South Asian, and Western names across cities like Detroit, Houston, Chicago, Dallas, Atlanta, Minneapolis, New York.

Borrowers are assigned to cycles from this pool based on tier matching. The pool ensures the journey log always has human names to display, making the "your money helped Ahmed in Dallas" story feel real.

---

## Algorithm Functions

Create `src/utils/algorithms.js` with all algorithm functions exported. Both Phase 1 (portfolio) and Phase 2 (borrower) import from here.

### `scoreNGOFeed(ngoDatabase, userIntentions, userPositions, sessionSeed)`

Runs the five-signal feed scoring algorithm. Returns a sorted array of NGOs with their scores. All signals described above. The `sessionSeed` is generated once per session (`Math.random()` on app load, stored in context) and used for the Thompson Sampling component to ensure consistent ordering within a session.

The Sunnah Discovery slot is identified as the highest-scoring NGO that is Tier C (small, `platformDonorCount < 15`) and has never been donated to by this user.

### `computeQardhassanDemand(amount, ngoId, borrowerPool)`

Takes investment amount, the NGO (for its category/tier preference), and the simulated borrower pool. Returns `{ estimatedMonthsPerCycle, rangeMin, rangeMax, familiesPerCycle, deploymentShape }`. The `deploymentShape` shows how many Micro/Standard/Major borrowers the amount would fund. Runs in ~1ms.

### `computeImpactPreview(amount, type, cycles, splitPercent, ngo)`

Computes the live impact preview shown at the bottom of the invest modal. Returns: `{ familiesTotal, totalRealWorldGood, estimatedMonths, sadaqahAmount, returnAmount }`. Called on every input change in the invest flow.

### `computeNeedScore(income, householdSize, purposeCategory, dependents, vouchScore)`

Borrower evaluation algorithm. Returns a score 0-100 with breakdown by component. Exported here, used in Phase 2.

### `assignTier(amount)`

Returns the appropriate loan tier object for a given loan request amount.

### `computeFeasibility(income, debts, loanAmount, tier, householdSize)`

Returns feasibility assessment for a borrower. Used in Phase 2.

---

## Phase 1.1 Acceptance Criteria

**Banking system:**
- [ ] Bank connection modal fires on first portfolio visit
- [ ] Bank selection and account number entry work
- [ ] After connection, balance seeded correctly ($3,850 available, $1,000 committed)
- [ ] Sidebar shows Available and Committed balances at all times
- [ ] "Add funds" modal opens, entering amount increases available balance
- [ ] All four banking operations implemented and exported from context
- [ ] Insufficient funds check prevents over-investing
- [ ] Transaction ledger has 4 pre-populated historical transactions
- [ ] `/portfolio/transactions` page shows transaction table with correct data
- [ ] Table is filterable by transaction type

**NGO data:**
- [ ] IRS API queried on app load
- [ ] Charity Navigator API queried for target EINs
- [ ] Clearbit logos fetched for NGO domains
- [ ] OG data fetched via Microlink or similar for NGO descriptions
- [ ] At minimum 8 of 10 target NGOs have real data
- [ ] Data cached in localStorage with 24-hour expiry
- [ ] Skeleton loading state shows during fetch
- [ ] Hardcoded fallback data covers all 10 NGOs
- [ ] Real logos appear in position cards on the dashboard
- [ ] Impact-per-dollar figures match the derived real-world estimates

**Portfolio dashboard:**
- [ ] Two-column layout: 240px sidebar + main content area
- [ ] Sidebar shows balance, nav links, user info, add funds button
- [ ] Active nav link shows gold left border indicator
- [ ] Hero stat bar: 5 cards with computed numbers from positions
- [ ] Performance chart renders SVG line with correct data
- [ ] Chart animates path on mount
- [ ] Chart updates on metric/range change with re-animation
- [ ] Donut chart renders with correct category breakdown
- [ ] Holdings grid: 2-column, real NGO logos in cards
- [ ] Position 2 (Zakat Foundation) shows ~40% cycle progress
- [ ] Position 3 (Penny Appeal) shows complete status
- [ ] Diversification nudge renders and is dismissable
- [ ] Jariyah Vault preview shows Ahmed Al-Farsi with impact entry
- [ ] Hardcoded reflection card at bottom with authentic hadith

**Simulation engine:**
- [ ] Cycle progress computed from real date math on load
- [ ] Position 2 shows correct progress for April 18, 2026
- [ ] Borrower pool of 20 fake borrowers initialized in context
- [ ] Journey log populated from position history

**Algorithms:**
- [ ] `src/utils/algorithms.js` exists and exports all functions
- [ ] `scoreNGOFeed` runs against real NGO data and returns sorted array
- [ ] Sunnah Discovery slot identified correctly
- [ ] `computeQardhassanDemand` runs on invest amount input
- [ ] `computeImpactPreview` computes correct numbers for Direct and Compound modes
- [ ] No console errors on any dashboard screen

---

## Notes for Claude Code

The IRS EFTS API sometimes rate-limits. If it returns an error, immediately fall back to the hardcoded seed data — do not retry in a loop. Log the error and continue.

The Clearbit logo API (`logo.clearbit.com/[domain]`) returns a 404 for domains it doesn't recognize. Always have an `onError` handler on logo image elements that swaps to the initial-circle fallback. Never show a broken image.

The two-column sidebar layout should use CSS Grid at the AppShell level with `grid-template-columns: 240px 1fr` and `height: 100vh`. The sidebar should be `position: sticky; top: 0; height: 100vh; overflow-y: auto`. The main content should be `overflow-y: auto; height: 100vh`. Both columns scroll independently.

The cycle simulation engine's date math must handle the case where `estimatedCycleEndDate` is in the future (progress < 1.0, normal case) and the case where it's in the past (progress >= 1.0, cycle complete case). Both cases must be handled without errors.

Build `algorithms.js` as pure functions with no side effects and no imports from React or context. This makes them testable in isolation and importable from both portfolio and borrower contexts.
