# MIZAN — Phase 1.3 (REVISED): Journey Tab & Discover Feed
## Build Document for Claude Code

---

## Prerequisites

Phase 1.1 (banking, real NGO data, dashboard) and Phase 1.2 (invest flow, Jariyah Vault, AI reflection, streak) must be fully complete. Phase 1.3 replaces the stub screens for Journey and Discover with full implementations that use real NGO data and actual position/transaction data from context.

---

## Phase 1.3 Scope

1. **The Journey Tab** — Proof of impact. A world map with real cause pins, live impact counters derived from actual positions, a chronological event log from the simulation engine, and per-position drill-down.

2. **The Discover Feed** — The NGO marketplace. Three sub-tabs, the five-signal algorithm running on real fetched NGO data, cause cards with real logos and real information, and the Sunnah Discovery slot.

After Phase 1.3, the Personal Portfolio Account is feature-complete.

---

## The Journey Tab

### Route

`/portfolio/journey`

### Layout — web

Full sidebar layout (same sidebar as dashboard). Main content area fills the right column. The Journey tab is selected in the sidebar nav with a gold left border.

The page content is a two-panel layout:

**Left panel (55% width):** The world map. Occupies the full height of the content area (minus the top bar).

**Right panel (45% width):** Stacked vertically:
- Impact counters row (4 stats)
- Journey log (scrollable)

On narrower viewports (< 1024px), the layout switches to a single column: map on top (fixed height 350px), counters + log below (scrollable).

### The World Map

**Implementation:** Use a lightweight SVG-based map. Do not use Mapbox or Google Maps — too heavy to configure in a hackathon and requires API keys. Use the `react-simple-maps` library which provides a TopoJSON-based SVG world map with projections. It is lightweight, CORS-free, and renders entirely client-side.

Install: `react-simple-maps`. It renders country polygons from public TopoJSON data (no external API calls needed at runtime, the data is bundled).

**Map visual design:**
- Background: `var(--bg-void)` — deepest background
- Country fill: `var(--bg-elevated)` — subtle, dark
- Country stroke: `var(--border-subtle)` — barely visible borders
- The map should feel like a dark mission control visualization, not a Google Maps clone

**Cause pins (NGO destination countries):**
For each position with an active or complete compound commitment, drop a pin at the NGO's primary country of operation. The country of operation comes from the real NGO data fetched in Phase 1.1.

Pin visual:
- A circle marker with a category-specific color
- Water causes: `var(--status-blue)`
- Food/orphan causes: `var(--status-green)`
- Medical causes: `var(--status-yellow)`
- Emergency causes: `var(--status-red)`
- Education causes: `#A78BFA` (purple)
- A pulsing outer ring animation (CSS keyframe, scale 1 → 1.5 → 1, opacity 1 → 0 → 0, 2s repeat)
- Radius: 8px for the inner circle, animated outer ring expanding from 8px to 20px

Pin coordinates: `react-simple-maps` accepts longitude/latitude coordinates. Use these for the key countries:
- Yemen: [48.5, 15.5]
- Somalia: [46.2, 5.2]
- Gaza/Palestine: [34.5, 31.5]
- Pakistan: [69.3, 30.4]
- Bangladesh: [90.4, 23.7]
- Syria: [38.8, 34.8]
- Sudan: [30.2, 12.8]
- Morocco: [-5.0, 31.8]

**Borrower pins (US cities, active loans):**
For each active compound position with an assigned borrower, show a smaller pin at the borrower's city. Use a different shape or color (gold, smaller) to distinguish from cause pins.

Borrower city coordinates for the mock borrowers:
- Dallas TX: [-96.8, 32.8]
- Houston TX: [-95.4, 29.8]
- Chicago IL: [-87.6, 41.9]
- Atlanta GA: [-84.4, 33.7]
- Detroit MI: [-83.0, 42.3]
- Minneapolis MN: [-93.3, 44.9]

**Animated connection lines:**
For each active compound position, draw an animated SVG path connecting:
User's location (Austin TX: [-97.7, 30.3]) → Borrower city → NGO destination country

Use `react-simple-maps`'s `<Line>` component for these paths. Style with:
- Stroke: `var(--gold-mid)` at 25% opacity
- Stroke-width: 1
- Stroke-dasharray: "6 4"
- A CSS animation on `stroke-dashoffset` that makes the dashes travel along the path (from Austin toward the cause country)
- Duration: 4 seconds, linear, infinite

The animated line communicates "your money is traveling" without any text explanation needed.

**Tooltips on pin hover:**
When the user hovers or clicks a pin, a tooltip card appears near the pin. The tooltip is a small card (200px wide) showing:
- For cause pins: NGO name (real, from fetched data), cause name, amount committed by this user, families helped, last impact date
- For borrower pins: Borrower first name, city, loan purpose, loan amount, expected repayment date

Use a `useState` to track which pin is hovered and render the tooltip absolutely positioned near the hovered pin's SVG coordinates.

### Impact Counters

Below the map (right panel top) or below the map section (single-column): a row of 4 stats derived from actual position data.

**The counters are computed, not hardcoded.** They derive from the positions array in PortfolioContext:

- **Families Helped:** Sum of `familiesHelped` across all positions. Counts up with Framer Motion on tab mount.
- **Meals Funded:** Sum of `familiesHelped × ngo.impactPerDollar × (amount/100)` for food-category positions. Computed from real NGO data.
- **Loans Cycled:** Count of completed cycles across all compound positions.
- **Water Days:** Sum computed for water-category positions using their real impact-per-dollar metric.

All four counters animate from 0 to their target value on mount using Framer Motion's `animate` function. Stagger: 150ms between each counter starting.

### Journey Log

A chronological feed of events from the simulation engine. The log is built from:

1. **Position creation events** — when the user invested (from transaction history)
2. **Cycle events** — when cycles completed (from simulation engine outputs)
3. **Borrower events** — loan assignments and repayments (from borrower pool assignments)
4. **NGO update events** — hardcoded simulated NGO updates (see below)

Each entry in the log is a rendered card. The visual format differs by event type.

**Investment entry:**
Shows the NGO logo (real, from data layer) + "You committed $[amount] to [NGO name]" + timestamp. Gold accent color.

**Cycle event:**
"[NGO position] — Cycle [N] complete. [Borrower] in [City] repaid in [X] months. Redeploying to Cycle [N+1]." Teal accent.

**Borrower assigned:**
"[Borrower first name] in [City] received $[amount] for [purpose]. Expected repayment: [N] months." Gold accent.

**NGO update (simulated):**
These are 3-5 hardcoded events per NGO that appear in the log as if the NGO just posted them. They include a photo placeholder and a quote: "40 children received iftar meals this week funded by contributions like yours — Islamic Relief, 2 days ago." These make the log feel alive.

The NGO update events should be seeded in PortfolioContext and tied to the NGOs that the user has positions in. For the demo positions (Islamic Relief, Zakat Foundation, Penny Appeal, Human Appeal), include 1-2 simulated NGO updates each.

**Log ordering:** All events sorted by timestamp descending (newest first). Grouped by date: "Today," "This Week," "Last Month," etc.

**Load more:** If the log has more than 10 entries, show the first 10 and a "Load more" button that reveals the rest.

### Per-Position Drill-Down

Clicking on any entry in the journey log, or clicking "See journey →" on a position card in the dashboard, navigates to `/portfolio/journey/:positionId`.

This page shows the complete dollar trail for one specific investment:

A vertical timeline (the "blockchain transparency" moment) showing every event for that position's money:
- Committed date + amount
- Deployed to pool
- Each borrower matched (name, city, purpose, amount)
- Each repayment received
- Each new borrower assigned
- Estimated final sadaqah destination

Use the same borrower pool data from PortfolioContext to populate real borrower info. The timeline entries for completed cycles (Position 3, the Penny Appeal direct donation) show as fully complete. Active cycles (Position 2, Zakat Foundation) show current state with a "in progress" marker and estimated completion.

Timeline visual: vertical line down the left side, event markers (circles) on the line, event content to the right. Completed: filled green circle. In progress: pulsing gold circle. Future/estimated: empty gray circle with dashed line.

---

## The Discover Feed

### Route

`/portfolio/discover`

### Layout — web

Full sidebar layout. Main content area has a page header ("Discover Causes") and below it, the feed content.

**Page structure:**
- Intentions bar (always visible, below the page title)
- Three-tab selector: [For You] [Trending] [All Causes]
- Tab content fills remaining space

### Intentions Bar

A horizontally scrollable row of chip tags representing the user's stated cause interests. Edit with a pencil icon button on the right.

The chips are seeded from onboarding (set to ["Gaza", "Water", "Orphans"] for the demo). These are the seed inputs to the `scoreNGOFeed` algorithm. When chips change, the algorithm re-runs and the feed updates.

Edit mode: clicking the pencil opens a dropdown/popover showing all available categories. User can add/remove categories. On save, the feed reshuffles.

### For You Tab — Feed Algorithm

The `scoreNGOFeed(ngoDatabase, userIntentions, userPositions, sessionSeed)` function from `algorithms.js` runs on mount and whenever intentions change. It returns the ordered array of NGOs.

**This algorithm runs on real data.** The `ngoDatabase` is the real fetched NGO array from Phase 1.1. Each NGO's score depends on its actual category, its actual `platformDonorCount`, its actual `urgencyScore`, and the semantic match to the user's real intentions.

The result is rendered as:
1. The **Sunnah Discovery card** at the very top (the highest-scoring Tier C NGO not yet donated to)
2. A **2-column grid** of regular cause cards below (the rest of the scored list, excluding the Sunnah Discovery choice)

On desktop with a wide content area, 2-column grid is appropriate. Cards can be larger and show more detail than on mobile.

### Sunnah Discovery Card

Visually distinct from regular cards. Full width (not in the 2-column grid). Gold border. A star icon in the header. The personalized reason text explaining why this NGO was surfaced.

The card shows:
- "⭐ A cause you'd never have found" label in gold
- NGO logo (real, from data) + name + verification badge
- The `sunnahReason` string (generated for this NGO based on the user's intentions and history)
- "$1 = [X] [impactUnit]" from real NGO data
- "Compound available ✓" if `compoundEligible: true`
- Investor count ("3 donors this month")
- Social proof line ("You'd be the 4th donor this cause has ever received")
- "Invest in this cause →" gold primary button

The `sunnahReason` string is computed from comparing the NGO's categories to the user's history. For example, if the user gave to Pakistani causes before and the Sunnah Discovery NGO is also in Pakistan, the reason is "You've given to causes in Pakistan before. These children have received $120 this month."

For the demo, pre-compute this string for the primary Sunnah Discovery candidate (Human Appeal's Al-Noor Girls School campaign) and store it in the NGO's data record.

Islamic rationale line below the card (small gray text): "The Prophet ﷺ said: 'The best of people are those most beneficial to others.' This cause needs you today."

### Regular Cause Cards

Each card in the 2-column grid shows real data from the fetched NGO database:

- **NGO logo** — real logo from Clearbit or OG data
- **NGO name** — real official name
- **Verification badge** — Tier 1 (IRS verified) or Tier 2 (community-vouched)
- **Urgency badge** — "🔥 Urgent" if urgencyScore > 0.7
- **Cause name** — the specific campaign name if available, otherwise the NGO's main program area
- **"$1 = X [unit]"** — from real `impactPerDollar` and `impactUnit` data
- **Funding bar** — if the NGO has a specific campaign with a goal, show real progress (fetched from their site). Otherwise show "Ongoing campaign."
- **Impact rating** — stars derived from Charity Navigator score (if available) or computed from program efficiency percentage
- **Compound badge** — "⟳ Compound available" if eligible
- **Investor count** — "247 investors" from `platformDonorCount`
- **Social proof line** — contextually chosen: Tier A NGOs get credibility framing ("Islamic Relief helped 2.3M people last year"), Tier B get local framing ("2 people from your mosque gave here"), Tier C get pioneer framing ("Be the first from Austin to give here")
- **Last impact timestamp** — "2 hours ago" / "3 days ago" etc.
- **"Invest in this cause →" button** — opens the invest modal with this NGO pre-selected

The cause card must use the real NGO's logo. If the logo fails to load, the initial circle fallback applies. No broken image states ever visible.

### Cause Detail Page

Clicking any cause card (or the "Invest in this cause" button) navigates to `/portfolio/discover/:ngoId`.

This full page shows comprehensive information about the NGO:

**Header section:**
- NGO logo (real, large)
- NGO name in Cormorant Garamond
- Verification badge
- A hero image if the NGO's website had an OG image
- "$1 = [X] [unit]" in large gold text
- Funding bar if applicable

**About section:**
- Full mission statement (from real fetched data or Form 990 description)
- Countries of operation
- Year founded (from IRS data or website)
- Annual revenue (from Form 990)
- Program expense percentage (from Charity Navigator or Form 990)

**Impact section:**
- All impact metrics
- Recent NGO updates (simulated for demo)
- Photos (placeholder if no real photos available)

**Charity Navigator section (if data available):**
- Overall score
- Star rating (displayed as stars)
- Financial health sub-score
- Accountability sub-score
- Link to their full Charity Navigator profile

**IRS section:**
- EIN (displayed as "IRS EIN: 95-3253008")
- 501(c)(3) status: "✓ Verified 501(c)(3)"
- Link to IRS search result for this EIN

**Sticky invest CTA:**
A bar fixed to the bottom of the page with "Invest in [NGO name] →" gold button. Clicking opens the invest modal pre-populated with this NGO.

### Trending Tab

A simplified feed sorted purely by urgency. The `scoreNGOFeed` output is re-sorted by urgency score only. No Sunnah Discovery slot — just NGOs in urgency order. The top card (highest urgency) has a special visual treatment: a pulsing red border and "⚡ Urgent need" badge.

For campaigns with a deadline (if fetchable from the NGO's site), show a countdown in the card header: "Ramadan campaign ends in 3 days."

### All Causes Tab

A searchable, filterable directory of all NGOs in the database.

**Search:** A wide search input at the top of the tab. Searches in real time against: NGO name, mission text, tags, categories, countries. Debounced to 150ms.

**Filters panel (left sidebar within the tab):**
A compact filter sidebar (200px) to the left of the results:
- Category filter (checkboxes): Water, Food, Medical, Education, Orphan Care, Emergency, Refugees, Mosque/Community
- Country filter (multi-select dropdown)
- Verification tier filter (Tier 1 only toggle)
- Compound eligible toggle
- Minimum Charity Navigator score (slider if CN data available)

**Results:** A 3-column grid of compact NGO cards (simpler version of the full cards — logo + name + category + Invest button). This denser layout is appropriate for a directory view.

**Sort options:** By relevance (default, uses user intentions), by Charity Navigator score, alphabetically.

---

## Full Seven-Feature Loop Verification

After Phase 1.3, verify the complete loop works:

1. User on dashboard sees diversification nudge → clicks a suggested cause
2. Navigate to Discover → cause is shown in the feed
3. Click cause → opens CauseDetail with real NGO data
4. Click "Invest →" → Invest modal opens with this NGO pre-selected
5. Enter amount → balance-remaining preview updates
6. Select Compound → algorithm runs → per-cycle estimate computes from real pool
7. Select cycles → Impact Preview shows correct `computeImpactPreview()` output
8. Set split → slider moves, hadith appears
9. Tag to Ahmed Al-Farsi in vault
10. Click Commit → `investCompound()` called → balance debits → position created → streak increments
11. SpiritualReflection overlay appears → Claude API fires → reflection displays
12. Click Continue → dashboard updates → new position card in holdings with real NGO logo
13. Open Journey tab → world map shows new NGO's country pin → log shows the new commit event
14. Click the position in the log → navigate to `/portfolio/journey/:positionId`
15. Position timeline shows commit → deployed → borrower assigned
16. Navigate to Vault → Ahmed Al-Farsi card shows latest entry from this new commitment
17. Open Transactions → new `invest_compound` entry visible with correct amount

All 17 steps must work end-to-end with consistent data.

---

## Phase 1.3 Acceptance Criteria

**Journey tab:**
- [ ] Two-panel layout (map left, counters+log right) on desktop
- [ ] Single-column layout on viewport < 1024px
- [ ] `react-simple-maps` installed and rendering world map correctly
- [ ] Country polygons render in dark `var(--bg-elevated)` fill
- [ ] At least 3 cause pins render at correct lat/lng coordinates
- [ ] Pins have category-appropriate colors
- [ ] Pulsing outer ring animation on cause pins
- [ ] Borrower pins render in gold at US city coordinates
- [ ] Animated dashed connection lines from Austin → borrower → cause country
- [ ] Hovering a pin shows tooltip with correct data (real NGO info for cause pins)
- [ ] Impact counters derived from actual position data (not hardcoded)
- [ ] All 4 counters animate from 0 on tab mount with stagger
- [ ] Journey log shows at least 5 different event types
- [ ] Investment entries show real NGO logos
- [ ] NGO update events appear with simulated quotes and photo placeholders
- [ ] Log is grouped by date correctly
- [ ] Clicking any log entry navigates to `/portfolio/journey/:positionId`
- [ ] Position drill-down shows vertical timeline with correct event states
- [ ] Completed cycles show filled green circles
- [ ] Active cycle shows pulsing gold circle
- [ ] Future cycles show empty gray circles

**Discover feed:**
- [ ] Intentions bar shows pre-seeded chips
- [ ] Deleting a chip removes it, algorithm re-runs, feed reshuffles
- [ ] Three-tab selector navigates between For You, Trending, All Causes
- [ ] For You tab: `scoreNGOFeed` runs on real NGO data
- [ ] Sunnah Discovery card at top with gold border and personalized reason text
- [ ] Sunnah Discovery shows a Tier C NGO not previously donated to
- [ ] 2-column grid of cause cards below Sunnah Discovery
- [ ] Cause cards show: real logo, real name, real impact metric, real verification badge
- [ ] Urgency badges appear on high-urgency NGOs
- [ ] Social proof lines vary correctly by tier (credibility / local / pioneer)
- [ ] Charity Navigator ratings displayed where data is available
- [ ] "Invest in this cause →" button opens invest modal with NGO pre-selected
- [ ] Clicking any card navigates to `/portfolio/discover/:ngoId`
- [ ] Cause detail page shows: real mission text, real EIN, real CN score if available
- [ ] IRS verification section shows real EIN and links to IRS search
- [ ] Sticky invest CTA on cause detail page works
- [ ] Trending tab shows NGOs sorted by urgency
- [ ] Trending top card has red pulsing border
- [ ] All Causes tab: search filters NGOs by name/tags in real time
- [ ] Filter sidebar works (category checkboxes, compound toggle)
- [ ] 3-column compact grid in All Causes tab

**End-to-end verification:**
- [ ] All 17 steps of the full loop described above work without errors
- [ ] Bank balance consistent throughout (each invest debits correctly, no balance displayed incorrectly)
- [ ] Real NGO logos appear everywhere (position cards, discover feed, journey log, cause detail)
- [ ] No broken image states anywhere
- [ ] No console errors on any portfolio screen

---

## Phase 1 Complete

After Phase 1.3, the Personal Portfolio Account is feature-complete:

- **Banking system** ✓ — simulated bank connected, real balance management, full transaction ledger
- **Real NGO data** ✓ — 10+ NGOs fetched from IRS, Charity Navigator, and OG metadata
- **Feature 1** ✓ — Akhirah Portfolio Dashboard with web layout
- **Feature 2** ✓ — Invest Interface with working capital flow
- **Feature 3** ✓ — Jariyah Vault with impact feed
- **Feature 4** ✓ — Journey Tab with real SVG map and computed counters
- **Feature 5** ✓ — AI Spiritual Reflection with Claude API
- **Feature 6** ✓ — Giving Streak wired to actual invest actions
- **Feature 7** ✓ — Discover Feed running real algorithm on real NGO data

---

## Notes for Claude Code

The `react-simple-maps` library is the right choice for the map. It renders server-side-compatible SVGs from bundled TopoJSON. No external API calls, no API keys, no CORS issues. The basic world map setup is straightforward — import `ComposableMap`, `Geographies`, `Geography`, `Marker`, and `Line`. The TopoJSON file is included with the library or can be fetched from `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`.

The connection lines between Austin → borrower → cause use `react-simple-maps`'s `<Line>` component which accepts `from` and `to` as [longitude, latitude] arrays. For a multi-leg path (Austin → Dallas → Yemen), draw two separate Line components. Both share the animated stroke-dashoffset CSS animation.

The feed algorithm's session seed should be stored in PortfolioContext as a constant generated once on provider mount (`Math.random()` in an initializer, not in `useState` — generate it as a module-level constant or inside the provider function body, not inside a hook). This ensures the same seed for the entire session.

The All Causes tab filter sidebar should use CSS Grid at the tab content level: `grid-template-columns: 200px 1fr`. The filter sidebar is sticky within the tab content area.

For the NGO data fetch, write a single async function `fetchNGODatabase()` that orchestrates all three sources (IRS, Charity Navigator, OG metadata) with `Promise.allSettled()` so that one failing source doesn't prevent the others from loading. Call this once from a `useEffect` in PortfolioContext on mount.

The most common failure mode in demoing will be NGO logos not loading (CORS, rate limits). Ensure every `<img>` with an NGO logo has `onError={() => showFallback()}` where the fallback is a colored initial circle. Never allow a broken image icon to appear anywhere in the app.
