# MIZAN — Phase 3.1: Community Hub — Foundation, Dashboard & Congregation Data
## Build Document for Claude Code

---

## Web App Context

The Community Hub Account is a mosque administration tool — its audience is more institutional than personal. The layout is a full-width web dashboard appropriate for desktop. The visual identity uses teal as the primary accent (distinct from portfolio gold and borrower teal — here teal has a more institutional, less personal quality). The sidebar is expanded to show more context and the main content area uses wider, more data-rich layouts than the personal accounts.

---

## Phase 3.1 Scope

1. **CommunityContext** — all mosque state, simulated congregation data, circle data, loan data, and the cross-account connections to the shared pool
2. **Account creation & verification flow** — the mosque onboarding experience
3. **Tab 1: Dashboard** — hero card, congregation giving breakdown, active loans summary, pending actions card
4. **Simulated congregation data** — realistic, richly populated data representing a real mosque community

Phase 3.2 covers: Circles tab (create, manage, vote, pool history).
Phase 3.3 covers: Vouching tab (queue, review, decisions) + Insights tab (giving, loans, events, impact).

---

## Simulated Data Strategy

The Community Hub's power comes from the richness of its data. Unlike the personal accounts where one user's data is shown, the Community Hub shows aggregate data from a simulated congregation of 47 members. This data must feel real — varied giving patterns, realistic loan histories, actual cause distributions, and meaningful event correlations.

All congregation member data is simulated in CommunityContext. Members are never identified individually to the admin (only aggregate patterns), but the underlying data drives all the analytics calculations.

### The Simulated Congregation — 47 Members

Generate a realistic distribution of 47 members. These are not shown individually to the admin — they power the aggregate stats. Each member has:

- `memberId` — anonymous ID
- `joinedDate` — when they linked to this mosque
- `givingPattern` — 'weekly' | 'monthly' | 'sporadic' (distributed: 8 weekly, 19 monthly, 20 sporadic)
- `givingMode` — 'direct' | 'compound' | 'jariyah' (distributed: 62% direct, 38% compound, with 17% having Jariyah commitments)
- `monthlyGivingAmount` — realistic range: $20-$500, most clustered $40-$150
- `totalGiven` — lifetime giving amount
- `preferredCauses` — weighted toward the congregation's known preferences (Gaza 34%, Yemen 28%, Somalia 18%, local 12%, other 8%)
- `activeCircle` — which circle they're in, if any

From these 47 members, all dashboard stats are computed:
- Total committed by congregation: $12,400 (sum of all `totalGiven`)
- Total families helped: 89 (computed from giving amounts × NGO impact rates)
- Active giving this month: $1,240 (sum of this month's giving)
- 12 families helped this month
- 31 of 47 members active this month (66%)

### Simulated Circles — 3 Active Circles

**MSA Graduate Circle:**
- 12 members (drawn from the congregation pool)
- Monthly pledge: $200/member
- Total pooled: $2,400
- 2 active loans: Omar B. ($600 Standard, month 2 of 5), Hana K. ($200 Micro, month 1 of 2)
- 1 pending vote: Bilal M. ($1,200 Standard, tuition)
- Repayment rate: 94%
- Pool health score: 82/100 — Strong

**Sisters Giving Circle:**
- 8 members
- Monthly pledge: $120/member
- Total pooled: $960
- 1 active loan: Amina H. ($300 Standard, medical bills, month 3 of 5)
- Repayment rate: 100%
- Pool health score: 96/100 — Excellent

**Ramadan Emergency Circle:**
- 5 members
- Monthly pledge: $100/member
- Total pooled: $500
- 0 active loans (newly formed)
- Repayment rate: N/A (no history)
- Pool health score: N/A — Waiting for first loan

### Simulated Vouched Loans — Historical Record

The mosque has vouched for 12 loan applications over its history:

Reviewed and vouched (active/complete):
1. Omar B. — $600 Standard — Vouched — Loan active (MSA Graduate Circle)
2. Hana K. — $200 Micro — Vouched — Repaid in full ✓
3. Fatima M. — $400 Standard — Vouched — Repaid in full ✓
4. Ahmad K. — $150 Micro — Vouched — Repaid in full ✓
5. Yusuf A. — $800 Standard — Vouched — Repaid in full ✓
6. Maryam S. — $500 Standard — Vouched — Repaid in full ✓
7. Amina H. — $300 Standard — Vouched — Loan active (Sisters Circle)
8. Khalid R. — $1,500 Standard — Vouched — In Circle vote
9. Safia N. — $250 Micro — Vouched — Repaid in full ✓
10. Ibrahim T. — $400 Standard — Vouched — Repaid (late, with extension)

Declined:
11. [Anonymous] — Declined vouch (admin did not know this person)

Need more time (expired):
12. [Anonymous] — 48-hour hold expired, reverted to pending

**Pending vouch queue:**
- Bilal Mansour — $1,200 Standard — Submitted 2 days ago (the primary demo pending vouch)

Total loan performance: 10 vouched loans fully repaid of 11 completed. 92.8% repayment rate on mosque vouched loans.

### Simulated Event History — 4 Past Events

1. **Ramadan Night 27 Iftar** — April 20, 2026, 200 attendees
   - 48hr giving spike: 14 members gave vs 3-4 average
   - Total committed in window: $2,140
   - 7.6x multiplier on typical baseline

2. **Jummah Fundraiser** — March 15, 2026, 85 attendees
   - 48hr spike: 8 members gave
   - Total committed: $840
   - 3.2x multiplier

3. **Eid Al-Fitr Celebration** — March 30, 2026, 350 attendees
   - 48hr spike: 18 members gave
   - Total committed: $3,200
   - 12.4x multiplier (highest of all events)

4. **Islamic Finance Workshop** — February 12, 2026, 45 attendees
   - 48hr spike: 6 members gave
   - Total committed: $580
   - 2.2x multiplier

### World Impact Data — Where the Congregation's Giving Lands

Pre-computed impact by country (from congregation giving × real NGO impact rates):
- Yemen: $4,200 committed, 22 families helped (Islamic Relief)
- Gaza: $3,800 committed, 18 families helped (Penny Appeal, Islamic Relief)
- Somalia: $1,200 committed, water access for 340 people (Zakat Foundation)
- Pakistan: $900 committed, 8 orphans in school (Human Appeal)
- USA (local): $2,300 committed, 9 qard hassan loans active

Coordinates for map pins: same lat/lng values from Phase 1.3. Add a US pin for the local loans component.

---

## CommunityContext

### State structure

**Mosque identity:**
- `mosqueName` — "Islamic Center of Austin"
- `mosqueAddress` — "123 Main St, Austin TX 78701"
- `adminName` — "Sheikh Abdullah Al-Farsi"
- `adminRole` — "Imam"
- `mosqueCode` — "ICA-AUSTIN-2847"
- `verificationStatus` — 'tier1' (IRS 501(c)(3) verified)
- `ein` — "74-2567891"
- `verified` — true

**Congregation state:**
- `members` — array of 47 simulated member objects
- `aggregateStats` — computed from members: totalCommitted, totalFamiliesHelped, activeGivers, etc.
- `givingBreakdown` — Direct/Compound/Jariyah percentages
- `causeDistribution` — giving by cause category
- `givingFrequencyDistribution` — weekly/monthly/sporadic percentages

**Circles state:**
- `circles` — array of 3 circle objects (MSA Graduate, Sisters, Ramadan Emergency)
- `activeLoans` — array of 5 active loans across all circles
- `pendingVotes` — array of pending circle votes

**Vouching state:**
- `vouchQueue` — pending vouch requests (Bilal Mansour pre-seeded)
- `vouchHistory` — reviewed vouches (12 historical entries)

**Events state:**
- `events` — array of 4 historical events with correlation data
- `eventFormOpen` — bool for the log-event form

**Insights state:**
- `insightsTab` — 'giving' | 'loans' | 'events' | 'impact'
- `aiInsight` — Claude-generated monthly insight string for the giving tab
- `poolHealthScore` — 94/100 (computed from repayment data)

**Actions:**
- `castVouch(applicantId, decision, note)` — processes a vouch decision, updates queue and history, triggers cross-account notification to borrower
- `createCircle(circleData)` — adds a new circle to the circles array
- `logEvent(eventData)` — adds an event to the events array
- `generateImpactReport()` — triggers report generation (Phase 3.3)

### Cross-account connections

CommunityContext subscribes to SharedEventsContext (established in Phase 2.3). Events it listens for:

- `LOAN_REPAID` — when a borrower from this mosque repays, update the loans sub-tab metrics
- `SADAQAH_CONVERSION` — when a borrower's loan converts, update circle history and loans insights
- `VOUCH_REQUEST` — when a borrower selects this mosque as their community reference, add to vouchQueue

Events it publishes:
- `VOUCH_GRANTED` — when the admin vouches, notify the borrower's application
- `CIRCLE_VOTE_COMPLETE` — when a circle vote passes, trigger loan disbursement

---

## Account Creation & Verification Flow

### Entry point

From the Welcome screen, the Community Hub card navigates to `/community`. If no `verified` flag is set in context, the setup flow is shown before the dashboard.

For the demo: `verified: true` is the default state so judges immediately see the full dashboard. The setup flow is accessible via a "How setup works →" link in the sidebar for reference.

### Setup flow (4 steps, accessible as demo reference)

Route: `/community/setup`

The setup flow uses a full-page centered layout (max-width 640px) with a step progress bar at the top.

**Step 1 — Organization Identity:**

A form with fields: mosque name, primary address, contact name, contact email, contact phone. All fields pre-filled with the demo data (Islamic Center of Austin) so judges can see the completed state.

Below the form, a "Continue →" primary teal button.

**Step 2 — Affiliation Verification:**

Three verification path cards:

Card 1 — IRS 501(c)(3): "Enter your EIN number. We'll verify automatically." EIN input field: [74-2567891]. A "Verify →" button that simulates a verification check (spinner for 1 second, then "✓ EIN 74-2567891 — Islamic Center of Austin — 501(c)(3) Verified"). The IRS API from Phase 1.1 can optionally be queried here for real EIN lookup.

Card 2 — ISNA/ICNA Directory: "If your mosque is listed in the ISNA or ICNA directory, we'll find it automatically." A search field.

Card 3 — Manual verification: "Upload a letter of establishment or incorporation document." A file upload zone.

For the demo, Card 1 with the pre-filled EIN is pre-selected and shows the verified state.

**Step 3 — Admin Profile:**

Role selector: Imam / Executive Director / Board Chair / Administrator (pre-selected: Imam).

A short bio textarea: "Describe your mosque's mission and community." Pre-filled with 2 sentences about ICA Austin.

Sub-admin toggle: "Allow additional administrators to access this account?" — toggle on with 2 pending sub-admin invites shown.

**Step 4 — Member Linking:**

Shows the generated mosque code: `ICA-AUSTIN-2847` in a prominent display box with a copy button.

Instructions: "Share this code with your congregation members. When they add it to their Mizan account, their aggregate giving contributes to your dashboard."

For the demo: shows "47 members currently linked" to indicate the code has been widely shared.

A "Enter my dashboard →" button navigates to `/community`.

---

## Community Hub Sidebar

**240px left sidebar** (same structure as other accounts but distinct styling):

- Mizan wordmark in teal
- Mosque name: "Islamic Center of Austin" in Cormorant Garamond 500, 16px
- Admin name: "Sheikh Abdullah" + "Imam" in DM Sans 400, 13px
- Verification badge: "✓ IRS Verified" in small teal pill

Navigation links:
- Dashboard
- Circles
- Vouching (with a red badge showing "1" pending)
- Insights

Bottom of sidebar:
- Mosque code: "Code: ICA-AUSTIN-2847" in small text with copy icon
- "Invite congregation members →" text link
- "Switch account" back to Welcome

The "1" pending badge on Vouching is computed from `vouchQueue.length`. This persists across all tabs — judges always see there's something requiring attention.

---

## Tab 1: Dashboard

### Route

`/community` (index route of the community account)

### Layout

Full-width content area. A 3-column grid layout for the main dashboard sections:

- Left column (full width, top): Hero card
- Second row: Congregation giving breakdown (60%) + Active loans summary (40%)
- Third row: Pending actions card (full width)

On narrower viewports, all stack to single column.

### Hero Card

A full-width card spanning the entire content area. Institutional but warm — slightly more structured than the personal portfolio's hero, but not cold.

Background: `var(--bg-surface)` with a subtle radial teal glow from the top-center (same technique as other accounts but lower intensity — this is an admin dashboard, not a personal portfolio).

**Content layout (two rows):**

Left block:
- "Islamic Center of Austin" — Cormorant Garamond 600, 32px, `var(--text-primary)`
- "Community Hub · ✓ IRS Verified" — DM Sans 400, 14px, `var(--text-secondary)` with green ✓

Right block (4 stat cards in a 2×2 grid):
- "47 members" — Congregation on platform
- "$12,400" — Total committed by congregation
- "89 families" — Total families helped
- "3 circles" — Active Qard Hassan Circles

Bottom row (full width):
- "This month: $1,240 committed · 12 families helped · 31 of 47 members active (66%)"

All numbers animate in with Framer Motion count-up on mount.

**Important:** No individual member data is ever shown. All numbers are aggregate. The admin never sees individual giving amounts.

### Congregation Giving Breakdown

A card occupying 60% of the second row. Title: "Congregation Giving Patterns."

**Section 1 — Mode breakdown:**
Two horizontal progress bars:
- Direct: 62% (teal fill for the completed portion)
- Compound: 38% (gold fill — Compound is a portfolio-register concept)
- Below: "8 members have active Jariyah commitments" — in green with a ✦ symbol

**Section 2 — Top causes:**
A ranked list with horizontal bars. Each bar shows the percentage share. Pre-computed from the congregation's actual giving distribution:

1. Gaza Emergency Fund — 34% — red-tinted bar
2. Yemen Orphan Fund — 28% — purple bar
3. Somalia Water Wells — 18% — blue bar
4. Local mosque repair — 12% — teal bar
5. Other — 8% — gray bar

**Section 3 — Giving frequency:**
Three horizontal bars: Weekly (18%), Monthly (41%), Sporadic (41%).

Below the frequency section: a teal info box with the Claude-generated monthly insight:
"41% of your congregation gives sporadically — less than once per month. A Ramadan consistency challenge could activate this group. Communities that run giving streaks see 2.3× higher member retention."

This insight is pre-written for the demo but in production it would be generated by Claude. Store the insight string in `communityContext.aiInsight`. The box has a subtle teal background, border, and "💡 Monthly Insight" header in small teal text.

### Active Loans Summary

A card occupying 40% of the second row. Title: "Active Community Loans."

A compact summary:
- "5 active loans · $3,200 outstanding" — main stat line, Cormorant Garamond 600, 24px
- Three status rows with icons:
  - ✓ green: "2 loans on schedule"
  - ⚠️ yellow (pulsing): "1 loan: payment due in 3 days" (Omar B.)
  - 🔄 blue: "2 loans: pending Circle vote" (Bilal M. and Khalid R.)
- "Next repayment expected: May 20, 2026" — DM Sans 400, 14px
- Pool health: "Strong · 94% repayment rate" — with a green health bar (94/100 filled)

A "Manage loans →" text link navigates to the Circles tab.

### Pending Actions Card

Full-width card below the two-column row. Title: "Needs your attention" with a red dot pulsing beside the title.

Three action items in a list:

🔴 "1 vouch request pending · Bilal Mansour · submitted 2 days ago" — "Review →" teal link on the right (navigates to `/community/vouching`)

🟡 "1 Circle vote needs quorum · MSA Graduate Circle · expires May 20" — "Vote →" link (navigates to `/community/circles/msa-graduate`)

⚪ "1 new member linked to your mosque" — "Welcome them →" informational (shows a simple "Welcome [name] to the platform" card on click)

The 🔴 item has a subtle red background wash. The 🟡 item has a yellow wash. The ⚪ item is standard.

A "Review all →" button at the bottom of the card opens a modal listing all pending items with quick-action buttons inline.

---

## Phase 3.1 Acceptance Criteria

**CommunityContext:**
- [ ] 47 simulated congregation members generated with correct distribution (8 weekly, 19 monthly, 20 sporadic)
- [ ] Aggregate stats computed correctly from member data ($12,400 total, 89 families, 66% active)
- [ ] Giving breakdown computed (62% Direct, 38% Compound, 17% Jariyah)
- [ ] Cause distribution computed (Gaza 34%, Yemen 28%, Somalia 18%, local 12%, other 8%)
- [ ] 3 circles initialized (MSA Graduate, Sisters, Ramadan Emergency) with correct data
- [ ] 5 active loans across circles initialized
- [ ] Bilal Mansour vouch request pre-seeded in vouchQueue
- [ ] 12 historical vouch entries in vouchHistory
- [ ] 4 historical events in events array with correlation data
- [ ] Cross-account subscriptions to SharedEventsContext set up
- [ ] All community operations (castVouch, createCircle, logEvent) implemented

**Setup flow:**
- [ ] `/community/setup` route exists with 4 steps
- [ ] Step 1: Organization identity form pre-filled with ICA Austin data
- [ ] Step 2: EIN verification simulates real check with 1-second spinner → verified state
- [ ] Step 3: Role selector pre-set to Imam, bio pre-filled
- [ ] Step 4: Mosque code ICA-AUSTIN-2847 displayed with copy button, "47 members linked" shown
- [ ] Default `verified: true` means setup flow is skipped for demo

**Sidebar:**
- [ ] Teal Mizan wordmark
- [ ] Mosque name and admin name shown
- [ ] IRS Verified badge displayed
- [ ] 4 nav links with Vouching showing red "1" pending badge
- [ ] Mosque code shown with copy icon
- [ ] "Switch account" navigates to Welcome

**Dashboard:**
- [ ] Hero card shows mosque name, verification, and 4 aggregate stats in 2×2 grid
- [ ] Stats count up with Framer Motion on mount
- [ ] No individual member data ever displayed
- [ ] This month summary row renders below stats
- [ ] Congregation Giving Breakdown card occupies 60% of second row
- [ ] Mode breakdown bars (Direct 62%, Compound 38%) render correctly
- [ ] Jariyah indicator shows 8 members
- [ ] Top 5 causes rendered as ranked list with percentage bars
- [ ] Frequency distribution bars render (18%, 41%, 41%)
- [ ] AI insight box renders with pre-written insight text
- [ ] Active Loans Summary card occupies 40% of second row
- [ ] 5 loans summary with status icons and health score
- [ ] Yellow status (Omar B.) has pulsing animation
- [ ] Pool health bar renders at 94/100 fill
- [ ] Pending Actions card renders full-width below
- [ ] Red, yellow, white action items with correct data
- [ ] Red item has red background wash
- [ ] "Review →" links navigate correctly
- [ ] No console errors

---

## Notes for Claude Code

The 47 congregation members should be generated programmatically, not manually listed. A `generateCongregation(count)` function in CommunityContext creates the array using seeded randomness (use a fixed seed so the output is deterministic across renders). The function distributes giving patterns, amounts, and cause preferences according to the target percentages. Individual members are never displayed to the admin — they only power the aggregate computations.

The aggregate stats are computed functions, not stored values. `computeAggregateStats(members)` runs on context initialization and returns the stats object. This ensures consistency — if the simulated data ever updates, stats always match the underlying data.

The pool health score (94/100) is computed from: `(repaymentRate * 50) + (capitalUtilization * 25) + (recencyOfActivity * 25)`. For the demo: 92.8% repayment rate gives 46.4 points, capital utilization ($3,200 loaned of $3,860 available = 82.9% utilization, healthy range) gives 20.7 points, recent activity (last 7 days) gives 25 points. Total: 92.1 rounded to 94 for display.

The AI insight string in the demo is pre-written. In production, this would be a weekly Claude API call that analyzes the congregation's recent data. For Phase 3.1, store a realistic pre-written insight. Phase 3.3 can optionally wire up a real Claude call if time permits.

The Vouching badge count ("1") on the sidebar nav link must be reactive — it reads from `vouchQueue.length` in context. When the admin resolves the Bilal Mansour vouch in Phase 3.3, the badge disappears. This reactivity is automatic if the badge component reads from context correctly.
