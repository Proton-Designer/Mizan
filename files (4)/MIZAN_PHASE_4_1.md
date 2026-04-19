# MIZAN — Phase 4.1: NGO Partner Dashboard — Foundation, Verification & Main Dashboard
## Build Document for Claude Code

---

## Web App Context

The NGO Partner Dashboard is designed for organizational fundraising staff — program officers, communications managers, development directors. This is the most data-dense of all four accounts. The layout is full-width desktop web: left sidebar, wide content area with multi-column grids, sortable tables, and data visualizations appropriate for a professional administration tool. The visual identity uses gold accents (consistent with the Personal Portfolio — NGOs receive the akhirah capital, so both share the gold register) combined with a clean institutional tone.

The demo NGO is Islamic Relief USA — the presenting sponsor at hack.msa and the most recognizable Islamic NGO in the US. All data should feel like real data from a mid-size international Islamic relief operation.

---

## Phase 4.1 Scope

1. **NGOContext** — all NGO state, simulated campaign data, donor database, financial pipeline, and cross-account connections
2. **Account creation & verification** — 4-step setup flow with IRS EIN verification and bank connection
3. **Tab 1: Dashboard** — hero card, campaign performance row, pending actions, settlement calendar
4. **Simulated financial data** — realistic campaigns, donors, and Compound pipeline representing a real NGO

Phase 4.2 covers: Campaigns tab — list, creation wizard, individual campaign management, impact reporting module.
Phase 4.3 covers: Donors tab, Insights tab, Account tab, withdrawal flow, settlements detail page.

---

## Simulated NGO Data

### Organization Profile

The demo NGO is Islamic Relief USA, EIN 95-3253008. The NGOContext should attempt to load this NGO's data from Phase 1.1's `ngoDatabase` first (since we fetched real data for Islamic Relief in Phase 1.1). If the real data is present, use it. If not, fall back to these hardcoded values.

- **Name:** Islamic Relief USA
- **EIN:** 95-3253008 (real, verifiable against IRS API from Phase 1.1)
- **Website:** irusa.org
- **Logo:** From Phase 1.1's Clearbit fetch (`https://logo.clearbit.com/irusa.org`) or initials fallback "IR"
- **Mission:** "Islamic Relief USA provides relief and development in a dignified manner regardless of gender, race, or religion, and works to empower individuals who are in need."
- **Primary contact:** Aisha Rahman — Director of Digital Fundraising — aisha@irusa.org — (703) 555-0192
- **Cause categories:** Emergency relief, Orphan care, Clean water, Education
- **Countries of operation:** Yemen, Gaza, Somalia, Sudan, Pakistan, Bangladesh, Syria, Morocco
- **Verification:** Tier 1 (IRS 501(c)(3) verified, verified January 15, 2026)
- **Bank account:** Chase Bank ****8821 (simulated, connected)
- **Bank routing:** 021000021 (real Chase routing number — adds realism)

### Simulated Campaigns — 4 Active, 1 Draft, 7 Closed

**Active campaigns:**

**Campaign 1 — Yemen Orphan Fund** (flagshipcampaign, most data)
- Campaign ID: `camp-001`
- Created: January 18, 2026
- Goal: $12,000
- Raised (Direct): $5,200 — 62% of total raised
- Compound in-transit: $3,200 — 38%, from 14 active lender positions
- Total raised: $8,400 (70% of goal)
- Total donors: 247 (identified: 112, anonymous: 135)
- Jariyah commitments: 18 (perpetual, permanent commitments)
- Discover ranking: Top 12% this week
- Last impact update: April 15, 2026 (3 days before demo date)
- Impact metric: "$1 = 2 meals for an orphan in Yemen"
- Countries: Yemen
- Categories: Orphan care, Education

**Campaign 2 — Gaza Emergency Fund**
- Campaign ID: `camp-002`
- Created: October 14, 2025
- Goal: $5,000 (GOAL MET ✓)
- Raised (Direct): $3,800 — 90% of total raised
- Compound in-transit: $1,800 — still cycling (pre-emergency compound commitments)
- Total raised: $4,200 (goal met, 84% of raised from direct, but total exceeds goal)
- Total donors: 183
- Jariyah commitments: 7
- Discover ranking: Top 8% this week (urgency drives ranking)
- Last impact update: Today (April 18, 2026)
- Impact metric: "$1 = 3 meals in Gaza"
- Countries: Gaza/Palestine
- Categories: Emergency relief, Food security

**Campaign 3 — Somalia Water Wells**
- Campaign ID: `camp-003`
- Created: February 2, 2026
- Goal: $8,000
- Raised (Direct): $2,640 — 77% of total raised
- Compound in-transit: $800 — 23%
- Total raised: $3,440 (43% of goal)
- Total donors: 89
- Jariyah commitments: 0
- Discover ranking: Top 31%
- Last impact update: April 11, 2026 (1 week ago)
- Impact metric: "$1 = 3 days of clean water for 1 person"
- Countries: Somalia
- Categories: Clean water, Community development

**Campaign 4 — Rohingya Medical Care**
- Campaign ID: `camp-004`
- Created: March 5, 2026
- Goal: $15,000
- Raised (Direct): $1,200 — 77%
- Compound in-transit: $360 — 23%
- Total raised: $1,560 (10% of goal)
- Total donors: 47
- Jariyah commitments: 2
- Discover ranking: Top 44%
- Last impact update: April 13, 2026 (5 days ago)
- Impact metric: "$1 = 4 clinic visits"
- Countries: Bangladesh, Myanmar
- Categories: Healthcare, Emergency relief

**Draft campaign (1):**
- "Sudan Crisis Fund Winter 2026" — draft, partially filled, not yet launched. Has a name and primary category but no description, goal, or media. Accessible in the Drafts tab.

**Closed campaigns (7):**
Historical records from 2024-2025 with final amounts raised. Pre-seed these as a simple array in NGOContext with enough data to populate the closed campaigns table: name, closed date, total raised, total donors, outcome (goal met or not met).

### Simulated Donor Database — 412 Total Donors

Generate 412 donor records using a seeded deterministic function (same pattern as the 47 congregation members in Phase 3.1). Use a fixed seed so the list is identical every load.

**Distribution:**
- Identified donors (opted in to name sharing): 184 (45%)
- Anonymous donors: 228 (55%)

**Pre-seeded specific donors (appear first, before generated donors):**

1. **Ahmad K.** — Austin TX — Identified
   - Lifetime value: $2,400 | Gifts: 8 | Last gift: 3 days ago
   - Giving mode: 70% Compound, 30% Direct
   - Jariyah: Yes — active, Yemen Orphan Fund
   - Causes: Yemen 60%, Gaza 40%
   - Segments: Jariyah, Repeat, Compound

2. **Fatima M.** — Dallas TX — Identified
   - Lifetime: $1,800 | Gifts: 5 | Last gift: 2 weeks ago
   - Mode: 100% Direct
   - Jariyah: No
   - Causes: Orphan care 80%, Water 20%
   - Segments: Repeat

3. **[Anonymous]** — Houston TX — Anonymous
   - Lifetime: $1,600 | Gifts: 12 | Last gift: Today
   - Mode: 50% Compound, 50% Direct
   - Jariyah: Yes — active, Gaza Emergency
   - Segments: Jariyah, Repeat, Compound

4. **Omar B.** — Austin TX — Identified
   - Lifetime: $600 | Gifts: 3 | Last gift: 1 month ago
   - Mode: 100% Compound
   - Jariyah: No
   - Segments: Compound, Repeat

5. **Maryam S.** — Chicago IL — Identified
   - Lifetime: $400 | Gifts: 1 | Last gift: 4 months ago
   - Mode: Direct
   - Segments: Lapsed

**Generated donors (407 more):** Realistic Muslim American names (Arabic, South Asian, Somali, Western mix), cities weighted toward Austin, Dallas, Houston, New York, Chicago, Los Angeles, Dearborn MI, Minneapolis MN. Lifetime values distributed $50–$5,000, most clustered $100–$500.

**Pre-computed donor segments:**
- Jariyah Donors: 18 (have active perpetual Jariyah commitments)
- Repeat Donors: 94 (gave 2+ times, not lapsed)
- Lapsed Donors: 47 (last gift >90 days ago)
- Compound Donors: 93 (chose Compound at least once)
- First-time Donors: 170 (exactly one gift within 90 days)

### Simulated Financial Pipeline

The settlement calendar shows incoming Compound money. These are the committed lender positions from Phase 1.1 that target Islamic Relief campaigns, projected to complete their cycles:

- **May 2026:** $1,200 from 4 positions completing their cycles
- **June 2026:** $2,800 from 9 positions
- **July 2026:** $4,100 from 14 positions (largest batch — positions started in early 2026 during the mock Ramadan campaign)
- **Q4 2026:** $8,400 from 31 positions

Total pipeline: $16,500 currently cycling

Available for withdrawal right now: $4,200 (settled Direct donations + 2 recently completed Compound cycles + sadaqah conversions from Phase 2.3)

Lifetime total raised on platform (all time): $284,700
Lifetime families helped: 1,247

---

## NGOContext

### State structure

**Organization:**
- `orgName`, `ein`, `website`, `logo`, `mission`
- `contactName`, `contactTitle`, `contactEmail`, `contactPhone`
- `verificationTier` — 1 (fully verified)
- `verificationDate` — "January 15, 2026"
- `causeCategories` — array
- `countriesOfOperation` — array
- `bankName` — "Chase Bank"
- `bankLast4` — "8821"
- `bankRouting` — "021000021"
- `bankConnected` — true

**Financial:**
- `availableBalance` — $4,200
- `pipelineTotal` — $16,500
- `settlementSchedule` — array of settlement windows with month, amount, positionCount
- `lifetimeTotalRaised` — $284,700
- `lifetimeFamiliesHelped` — 1,247
- `financialTransactions` — full ledger of settlements, withdrawals, and conversions

**Campaigns:**
- `campaigns` — all campaign objects
- `activeCampaigns` — filtered view
- `draftCampaigns` — filtered view
- `closedCampaigns` — filtered view

**Donors:**
- `donors` — array of 412 objects
- `donorSegments` — object with keys: jariyah, repeat, lapsed, compound, firstTime
- `exportHistory` — log of past exports

**Insights:**
- `conversionFunnels` — per-campaign conversion data
- `abTests` — array of A/B test objects

**Operations:**
- `createCampaign(data)` — adds campaign, makes live in Discover algorithm
- `postImpactUpdate(campaignId, update)` — logs update, fires cross-account notifications
- `messageDonorSegment(segmentId, message)` — logs outreach action
- `initiateWithdrawal(amount)` — debits availableBalance, logs transaction
- `exportDonors(format)` — generates downloadable file
- `launchAbTest(campaignId, config)` — creates A/B test record
- `applyAbVariant(testId, variant)` — updates campaign with winning variant

### Cross-account connections

NGOContext subscribes to SharedEventsContext. Events it listens for:
- `SADAQAH_CONVERSION` — when Phase 2.3 fires a sadaqah conversion, NGOContext receives the amount and destination cause; if the destination matches one of this NGO's campaigns, `availableBalance` increases by that amount and a conversion transaction is logged
- `COMPOUND_SETTLEMENT` — when Phase 1.1's cycle simulation completes a final cycle targeting an IR campaign, the settlement amount moves from pipeline to available

Events it publishes:
- `NGO_IMPACT_UPDATE` — when a campaign posts an update; received by Phase 1.1 PortfolioContext (updates donor's Journey log and Jariyah Vault)
- `CAMPAIGN_LAUNCHED` — when a new campaign is created; received by Phase 1.3 discover algorithm (immediately includes it in scoring)

### Integration with Phase 1.1 NGO Data Layer

NGOContext initializes by looking for Islamic Relief USA (EIN 95-3253008) in `ngoDatabase` from PortfolioContext. If found, pull the `logo`, `mission`, `charityNavigatorScore`, and `charityNavigatorStars` from that fetched data. This avoids duplicating the real NGO data and ensures the dashboard uses the same real data as the Discover feed.

---

## Account Creation & Verification Flow

### Entry and default state

Default for the demo: `verificationTier: 1` — fully verified. Setup flow is skipped. Judges land directly on the dashboard. The setup flow is accessible at `/ngo/setup` for reference.

### Setup flow — 4 steps (route: `/ngo/setup`)

Centered layout, max-width 680px, 4-step progress bar.

**Step 1 — Organization Identity:**

Fields: Organization name, Website, Primary contact name, Contact title, Contact email, Contact phone.

All pre-filled with Islamic Relief USA data. The website field has a "Fetch profile →" button that calls the Microlink API from Phase 1.1 (`https://api.microlink.io/?url=irusa.org`) to pull OG data. For the demo, this shows a 1-second spinner then pre-fills the mission field in Step 3 with the real fetched description.

**Step 2 — Nonprofit Verification:**

Two cards side by side.

**Left card — Tier 1 (pre-selected for demo):**
"Highest visibility · All features unlocked"
Required: IRS EIN + 501(c)(3) letter + Form 990
EIN field pre-filled: "95-3253008"
"Verify EIN →" button — calls the IRS EFTS API from Phase 1.1. Shows: "✓ EIN 95-3253008 — Islamic Relief USA — 501(c)(3) active." Spinner for 1 second before result.
File upload zones for the documents — accept any file for demo, show filename + success state.
"Verified within 48 hours" — demo shows as already verified (fast-tracked).

**Right card — Tier 2:**
"For smaller or newer organizations"
"Required: vouching from 2 verified mosques OR 1 Tier 1 NGO"
"Request community vouch →" button (mocked — shows "Request sent" success).

**Step 3 — Organization Profile:**

Logo upload zone — shows real IR logo from Phase 1.1 data layer or Clearbit as default.

Mission statement textarea — pre-filled from Microlink fetch or hardcoded real IR mission.

Cause category checkboxes: Emergency relief ✓, Orphan care ✓, Clean water ✓, Education ✓, Healthcare ☐, Refugee support ☐, Mosque/community ☐, Debt relief ☐.

Countries of operation — tag input with × to remove each tag. Pre-filled: Yemen, Gaza, Somalia, Sudan, Pakistan, Bangladesh, Syria.

**Step 4 — Bank Account Linking:**

Three connection options: "Connect via Stripe" / "Connect via Dwolla" / "Enter bank details manually."

For the demo, show "Chase Bank ****8821" already connected as the active state with green "✓ Connected" badge and "Change account" link (mocked). Below the connected state: "ACH routing: 021000021."

"Funds are held in a secure escrow account until you initiate withdrawal. No funds are moved without your explicit action." — DM Sans 400, 13px, italic.

"Enter my dashboard →" navigates to `/ngo`.

---

## NGO Partner Sidebar

**240px fixed left sidebar:**

- Mizan wordmark in **gold** (same as portfolio — NGOs are akhirah register)
- Organization name: "Islamic Relief USA" — Cormorant Garamond 500, 16px
- Contact: "Aisha Rahman · Director" — DM Sans 400, 13px, `var(--text-secondary)`
- Verification badge: "✓ Tier 1 Verified" — gold pill (`rgba(212, 168, 67, 0.15)` background, gold border, gold text)

**Navigation links (5 tabs):**
- Dashboard
- Campaigns — badge showing "4" active
- Donors — badge showing "412"
- Insights
- Account

**Financial summary (below nav, in sidebar):**

A compact card that's always visible:
- "Available: $4,200" — DM Sans 500, 14px, `var(--status-green)`
- "Pipeline: $16,500" — DM Sans 400, 13px, `var(--text-secondary)` + gold ⟳ icon
- "Withdraw funds →" — small teal text link (opens withdrawal flow from Account tab)

The available balance must update reactively — when a withdrawal is made in the Account tab, this number changes immediately.

**Bottom of sidebar:**
- "View live on Discover →" — navigates to `/portfolio/discover` and filters for Islamic Relief campaigns, showing the NGO what donors see
- "Switch account →" — returns to Welcome screen

---

## Tab 1: Dashboard

### Route

`/ngo` (index route)

### Layout

Full content area. Four stacked sections:

1. Hero card (full width)
2. Campaign performance row (full width, horizontally scrollable row)
3. Two columns: Pending actions (60%) + Settlement calendar (40%)

---

### Hero Card

Full-width card. Background: `var(--bg-surface)` with the radial gold glow from the top-center (same treatment as the personal portfolio hero — gold register consistency).

**Two-column internal layout:**

**Left column — lifetime stats:**

"Islamic Relief USA" — Cormorant Garamond 600, 30px.
"Tier 1 Verified ✓" — small gold badge inline, margin-left 12px.

Below in a 2×2 grid of stat items:
- "Total raised on platform: $284,700"
- "Families helped: 1,247"
- "Active campaigns: 4"
- "Jariyah commitments: 89" — green with ✦ symbol

All numbers animate with Framer Motion count-up on mount (same technique as portfolio dashboard hero). Stagger: 100ms between each counter starting.

**Right column — this month:**

"This month:" — DM Sans 500, 12px, `var(--text-tertiary)`, uppercase, letter-spacing 0.06em.

Four stat lines:
- "Direct donations: $12,400" — `var(--status-green)`
- "Compound in-transit: $8,200 (est. landing Q3)" — `var(--gold-mid)` + ⟳ icon
- "New donors: 43" — `var(--teal-mid)`
- "Returning donors: 127" — `var(--text-primary)`

**The "Compound in-transit" line requires emphasis.** It is the number no other charity platform can show — money committed by donors that is currently cycling through interest-free loans, not yet received but definitively committed. Use gold color and the ⟳ cycle icon. A tooltip on hover (or info icon with tooltip): "This money is currently helping borrowers via qard hassan loans. It will land at your campaigns when cycles complete — committed but not yet received." This tooltip is what distinguishes the platform to any NGO staff member who sees it.

---

### Campaign Performance Row

A horizontally scrollable row of campaign summary cards below the hero. On a standard 1440px desktop, all 4 campaigns are visible without scrolling. On narrower viewports, the row scrolls.

**Each campaign card:**

Width: 280px (min). Height: flexible. Card: `var(--bg-surface)`, gold left accent bar (4px, `var(--gold-mid)`), border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 20px.

**Yemen Orphan Fund card (example):**

"Yemen Orphan Fund" — DM Sans 700, 15px, `var(--text-primary)`.
"Active · Tier 1 · Jan 2026" — DM Sans 400, 12px, `var(--text-tertiary)`.

Stats row: "$8,400 raised · 247 donors" — DM Sans 400, 13px.

Funding bar: full width, 8px height, gold fill at 70%, `var(--bg-overlay)` track. Below bar: "$8,400 / $12,000 — 70% complete" in DM Sans 400, 11px.

Compound line: "Compound in-transit: $3,200 ⟳" — `var(--gold-mid)`, DM Sans 500, 13px.

"View campaign →" — gold text link at the bottom. Navigates to `/ngo/campaigns/camp-001`.

**Gaza Emergency Fund card:**

The funding bar is 100% gold and also has a green overlay with "Goal met ✓" badge instead of the percentage. The bar is 100% green, not gold — goal completion uses `var(--status-green)` to differentiate from in-progress.

**Somalia Water Wells card:**

43% progress. No special treatment.

**Rohingya Medical Care card:**

10% progress. A subtle "Low momentum" advisory note below the bar: "Consider posting an update to improve Discover ranking." DM Sans 400, 11px, `var(--status-yellow)`.

---

### Pending Actions Card

Left column, 60% width of the lower section.

Title: "Needs your attention" — Cormorant Garamond 600, 22px. A red pulsing dot (CSS animation, scale 1 → 1.3 → 1, 2s repeat) beside the title.

Four action items, priority ordered:

**🔴 Red — Most urgent:**
"3 donors awaiting impact update — Yemen Orphan Fund hasn't posted in 30+ days."
Subtext: "Donors with active positions who haven't heard from you in over a month are 3× more likely to lapse."
"Post update →" — gold link, navigates to the impact update modal for Yemen Orphan Fund.

This alert is the platform directly addressing Islamic Relief's Problem 1 (donor follow-up). The 30-day threshold is hardcoded in the demo but in production would be computed from the last `postImpactUpdate` timestamp vs today.

Row styling: subtle red background wash (`rgba(248, 113, 113, 0.06)`), red left accent (2px), border-radius `var(--radius-md)`, padding 14px 16px.

**🟡 Yellow — Time sensitive:**
"Gaza Emergency Fund goal reached — consider extending or closing."
"Manage campaign →" — link to campaign management.

**🟡 Yellow — Financial:**
"$4,200 available for withdrawal — sitting in escrow since April 10."
"Withdraw →" — link to Account tab withdrawal flow.

**⚪ White — Informational:**
"12 new donors this week — consider a welcome message."
"Message them →" — link to Donors tab with First-time Donors segment pre-selected.

**"Take action →" button** at the bottom of the card — opens a right-side drawer listing all pending items with inline action buttons for each.

The pending actions in the demo are pre-written. Store them as `pendingActions` array in NGOContext. In production, a `generatePendingActions()` function using Claude would analyze account state and generate this list dynamically.

---

### Settlement Calendar

Right column, 40% width of the lower section.

Title: "Incoming Settlements" — Cormorant Garamond 600, 22px.

Subheading: "Committed capital currently cycling through qard hassan. These amounts arrive when donor cycles complete." — DM Sans 400, 13px, italic, `var(--text-secondary)`.

**Four settlement rows:**

```
May 2026    $1,200    4 positions settling
June 2026   $2,800    9 positions settling
July 2026   $4,100    14 positions settling
Q4 2026     $8,400    31 positions settling
```

Each row: month label (DM Sans 500, 14px) + gold amount (Cormorant Garamond 600, 20px, `var(--gold-mid)`) + positions count (DM Sans 400, 12px, `var(--text-tertiary)`). Flex row, space-between.

A thin proportional bar below each row. The bar width represents the settlement amount as a share of total pipeline ($16,500). July at $4,100 = 25% bar width. Q4 at $8,400 = 51% bar width. All bars are gold.

**Footer card:**

```
Total pipeline: $16,500
Currently cycling through qard hassan
```

"$16,500" — Cormorant Garamond 600, 32px, `var(--gold-mid)`. Label below in DM Sans 400, 13px, italic.

"View full settlement schedule →" — gold text link. Navigates to `/ngo/settlements` (built in Phase 4.3).

**Why this section is the most distinctive feature of the entire NGO dashboard:** This is money that traditional charity platforms cannot show. A standard fundraising dashboard shows historical receipts. This shows a forward-looking pipeline of committed capital with month-level precision. An NGO program director can look at July 2026 and know $4,100 is coming — and plan a program deployment around it. This is a planning tool, not a reporting tool. No other platform offers this.

---

## Phase 4.1 Acceptance Criteria

**NGOContext:**
- [ ] Organization profile uses Phase 1.1 NGO data where available (EIN lookup)
- [ ] Logo loads from Clearbit/Phase 1.1 with "IR" initials fallback
- [ ] 4 active campaigns initialized with all specified amounts and stats
- [ ] 1 draft campaign and 7 closed campaigns initialized
- [ ] 412 donor records generated deterministically (5 pre-seeded at top)
- [ ] All 5 donor segments computed with correct counts
- [ ] Settlement schedule: May $1,200 / June $2,800 / July $4,100 / Q4 $8,400
- [ ] Available balance: $4,200
- [ ] Pipeline total: $16,500
- [ ] Lifetime stats: $284,700 raised, 1,247 families helped
- [ ] SharedEventsContext subscriptions set up for SADAQAH_CONVERSION and COMPOUND_SETTLEMENT
- [ ] All 6 operations implemented (createCampaign, postImpactUpdate, messageDonorSegment, initiateWithdrawal, exportDonors, launchAbTest, applyAbVariant)
- [ ] CAMPAIGN_LAUNCHED and NGO_IMPACT_UPDATE events published correctly

**Setup flow:**
- [ ] `/ngo/setup` renders 4-step flow with progress bar
- [ ] Step 1: All fields pre-filled with IR data, "Fetch profile" calls Microlink API
- [ ] Step 2: EIN pre-filled, "Verify EIN →" calls IRS API → shows verified state
- [ ] Step 2: Tier 2 "Request vouch" shows mocked success
- [ ] Step 3: Logo from Phase 1.1 data, categories pre-checked, countries as tags
- [ ] Step 4: Chase Bank ****8821 shown as connected with routing number
- [ ] Default `verificationTier: 1` skips setup for demo

**Sidebar:**
- [ ] Gold Mizan wordmark
- [ ] Organization name and contact
- [ ] Gold "Tier 1 Verified" badge
- [ ] 5 nav links with "4" badge on Campaigns and "412" on Donors
- [ ] Financial summary: $4,200 available (green) and $16,500 pipeline (gold)
- [ ] "Withdraw funds →" link navigates to Account tab
- [ ] "View live on Discover →" opens Discover feed filtered for IR campaigns
- [ ] Available balance updates reactively after withdrawal

**Dashboard:**
- [ ] Hero card: two-column layout, gold radial glow
- [ ] All stat numbers count up with Framer Motion on mount
- [ ] "Compound in-transit: $8,200" in gold with ⟳ icon
- [ ] Tooltip on Compound in-transit explains the metric
- [ ] Campaign performance row: 4 cards, horizontally scrollable
- [ ] Yemen card: 70% gold bar, $3,200 Compound line
- [ ] Gaza card: 100% green bar, "Goal met ✓" badge
- [ ] Rohingya card: "Low momentum" yellow advisory note
- [ ] Pending actions card: 4 items in priority order
- [ ] Red item has red background wash, links to impact update flow
- [ ] Both yellow items have yellow background wash
- [ ] Settlement calendar: 4 rows with gold amounts in Cormorant Garamond
- [ ] Proportional bars per row (Q4 bar is ~2× July bar width)
- [ ] "$16,500" in large gold Cormorant Garamond in footer
- [ ] "View full settlement schedule →" link navigates to /ngo/settlements
- [ ] No console errors

---

## Notes for Claude Code

Use a seeded pseudo-random number generator for the 412 donor records. A simple seeded LCG (linear congruential generator) or using a seed-based shuffle of a pre-built name list will work. The seed should be a constant (e.g., 42) stored in NGOContext. This ensures the same 412 donors appear every time the app loads, making the demo reproducible.

The `pendingActions` array in NGOContext should be computed by a pure function `computePendingActions(campaigns, donors, availableBalance)`. For the demo, this function returns the 4 hardcoded items. Write it as a function (even if hardcoded for now) so Phase 4.3 can optionally wire it to a Claude API call.

The sidebar financial summary card (Available / Pipeline / Withdraw) must be a separate small component that reads directly from NGOContext. When `initiateWithdrawal()` is called from the Account tab, `availableBalance` updates in context and the sidebar re-renders immediately without any prop drilling. This reactivity demonstrates that the financial state is consistent across the entire NGO account.

The "View live on Discover →" sidebar link is a demo-specific feature. It navigates to the portfolio's Discover feed and pre-sets a filter or search to show Islamic Relief campaigns. This lets a judge see the NGO dashboard and the donor-facing campaign card in the same demo flow without switching accounts. This is a significant UX convenience for the hackathon presentation.
