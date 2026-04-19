# MIZAN — Phase 3.2: Community Hub — Circles Tab
## Build Document for Claude Code

---

## Prerequisites

Phase 3.1 must be complete. CommunityContext, all simulated congregation data, and the Dashboard must be working. Phase 3.2 builds the most operationally complex tab in the Community Hub — the Qard Hassan Circles management system.

---

## Phase 3.2 Scope

The Circles tab and all its sub-screens:

1. **Circles overview** — the list of all circles with health indicators
2. **Create new Circle flow** — 4-step setup wizard
3. **Individual Circle management page** — members, active loans, pending votes, pool history
4. **Circle vote mechanics** — real vote tracking with threshold computation
5. **Pool simulation for circles** — how money flows in and out of each circle's capital pool

---

## Circle Pool Simulation

Each circle has a real simulated capital pool. Understanding how the money flows is critical for building the Circles tab correctly.

### How circle capital works

Each circle member pledges a monthly amount. That pledge is drawn from their personal portfolio account (via the invest flow — Phase 1.2) and added to the circle's pool. The circle's pool is a sub-pool of the platform-wide qard hassan lending pool.

When a loan is disbursed from a circle:
1. The loan amount is deducted from the circle's available capital
2. If the circle's capital is insufficient alone, the platform's general pool bridges the gap
3. A disbursement event is logged in the circle's pool history

When a borrower repays:
1. The repayment flows back into the circle's pool (or the general pool if the bridge was used)
2. The repayment is logged in the circle's pool history
3. The circle's available capital increases
4. The borrower's loan remaining decreases
5. The cross-account update fires: lender's portfolio position advances

When a loan converts to sadaqah:
1. The outstanding balance is removed from the circle's pool as a donation
2. The amount flows to the destination cause (same as Phase 2.3 conversion flow)
3. The conversion is logged in the circle's pool history
4. All circle members' portfolios show a "circle-derived sadaqah jariyah" entry

### Circle pool state per circle

Each circle object in CommunityContext has:

```
{
  id: 'msa-graduate' | 'sisters' | 'ramadan-emergency',
  name: string,
  type: 'general' | 'sisters-only' | 'youth' | 'custom',
  members: array of member objects,
  monthlyPledge: number (per member),
  totalPooled: number (sum of all pledges received),
  availableCapital: number (pooled minus active loans),
  activeLoans: array,
  pendingVotes: array,
  poolHistory: array of capital flow events,
  memberCap: number (5-20),
  minPoolBeforeFirstLoan: number,
  maxLoanPercent: 0.40 (40% of pool default),
  approvalRules: { micro, standard, major },
  repaymentRate: number (0.0-1.0),
  poolHealthScore: number (0-100),
  createdAt: ISO date string
}
```

### Pre-seeded pool history for MSA Graduate Circle

The richest of the three circles, with the most history. Pre-seed these events:

```
May 1, 2026    — 12 members pledged monthly commitments   +$2,400
April 5, 2026  — Hana K. loan disbursed                  -$200
April 18, 2026 — Omar B. repayment #2 received            +$120
April 25, 2026 — Hana K. repayment (full, early)          +$200
April 25, 2026 — Hana K. loan closed — fully repaid        $0
March 15, 2026 — Fatima M. repayment received             +$80
March 1, 2026  — 12 members pledged monthly commitments   +$2,400
March 5, 2026  — Omar B. loan disbursed                   -$600
```

Pool history entries use the same format as the platform's transaction log: date, description, amount (positive = inflow, negative = outflow), running balance after.

---

## Tab 2: Circles

### Route

`/community/circles` (index) → Circles overview
`/community/circles/new` → Create circle wizard
`/community/circles/:circleId` → Individual circle management

### Layout

Full content area. The circles overview is a single-column list of circle cards. The individual circle management page uses a two-panel layout (main content + right sidebar).

---

## Circles Overview Screen

Default view when the Circles tab is selected.

**Page header:**
"Qard Hassan Circles" — Cormorant Garamond 600, 32px. Below: "Manage your community's interest-free lending circles." — DM Sans 400, 15px, `var(--text-secondary)`.

"+ Create new Circle" — a teal primary button top-right of the header.

**Three circle cards, stacked:**

Each circle card is a wider, more information-dense card than the personal account's position cards (this is a web admin dashboard, not a personal portfolio). Use a two-column card layout: left section shows identity and key stats, right section shows the health bar and quick actions.

**MSA Graduate Circle card:**

Left:
- Circle name: "MSA Graduate Circle" — Cormorant Garamond 600, 22px
- "12 members · $2,400 pooled" — DM Sans 400, 14px
- "2 active loans · 94% repayment rate" — DM Sans 400, 14px

Center: Pool health bar
- Label: "Pool health:" — DM Sans 500, 12px, uppercase
- Bar: 82% filled in teal, 18% empty
- Label right: "Strong" — in `var(--teal-mid)`

Right: Quick actions
- "Manage →" — teal text link navigates to `/community/circles/msa-graduate`
- A badge: "1 pending vote" — yellow pill with pulsing dot (Bilal M.'s pending application)

**Sisters Giving Circle card:**
Same structure. No pending votes. Pool health 96% "Excellent" — `var(--status-green)`.

**Ramadan Emergency Circle card:**
Pool health shows "Awaiting first loan" instead of a bar. "0 active loans · No history yet."

**Between each card:** The card borders have a very subtle teal left accent bar (3px) to reinforce the Community Hub's teal identity. This is a consistent visual pattern across all circle cards.

---

## Create New Circle Wizard

Route: `/community/circles/new`

A 4-step flow within the main content area. A step progress indicator at the top. "← Back to circles" link top-left.

### Step 1 — Circle Identity

**Circle name field:** A large, prominent text input — Cormorant Garamond 500 for the input text. Pre-filled with nothing. Placeholder: "e.g., MSA Graduate Circle."

**Purpose field (optional):** A smaller text input. Placeholder: "What is this circle for? Who does it serve?"

**Circle type selector:** Four selectable cards in a 2×2 grid:
- General — anyone in the congregation
- Sisters-only — women's circle
- Youth — for college/young adults (appropriate for hack.msa context)
- Custom — define your own rules

Each type card: icon + name + 1-line description. Selecting highlights with teal border and teal left accent.

"Continue →" button. Disabled until circle name is filled.

### Step 2 — Circle Rules

**Member cap slider:** A range slider from 5 to 20. Current value displayed prominently: "[ 12 ]" in Cormorant Garamond 600, 28px. The slider moves and the number updates live.

**Monthly pledge per member:** Four chips: [$20] [$50] [$100] [$200] [Custom]. Selecting "Custom" reveals a number input. The selected amount shows a computed line: "12 members × $100/month = $1,200/month total capacity."

**Minimum pool before first loan:** A number input. Default $500. Helper text: "We recommend at least 2-3 months of pledges before your first loan."

**Maximum single loan:** A radio group:
- 40% of pool (platform default, recommended) — pre-selected
- 25% of pool (more conservative)
- Custom percentage

### Step 3 — Approval Rules

Three sections, one per tier:

**Micro tier ($50–$500):**
Radio cards: "Auto-approve if imam-vouched" (recommended) / "Always require circle vote"

**Standard tier ($500–$2,000):**
Radio cards: "Simple majority (>50%)" (recommended) / "Supermajority (≥66%)"

**Major tier ($2,000–$4,000):**
Always requires supermajority (≥66%) — this is locked, not selectable. Show as a locked row with explanation: "Major tier loans always require supermajority vote plus admin co-sign per platform rules."

**Voting window:** A dropdown: 24 hours / 48 hours (default) / 72 hours.

**Default conversion:** When a loan defaults after Circle review, the outstanding balance converts to sadaqah. Destination:
- Radio: "Borrower's chosen cause" (default) / "Circle's designated cause"
- If "Circle's designated cause": a search field to select an NGO from the database.

### Step 4 — Invite Members

A multi-input invitation panel.

**Invitation methods (tabs within the step):** Email / Phone / Username / Share link.

**Email tab (default):** A growing list of email input fields. "Add another" adds a new field. Each field has an inline "Remove" × link.

For the demo, show 3 pre-filled invite slots:
- sarah.k@email.com — ✓ Accepted (she's already a member)
- +1 (512) 555-0198 — ⏳ Pending
- +1 (512) 555-0247 — ⏳ Pending

**Share link tab:** A generated link (hardcoded for demo): `mizan.app/join/msa-graduate-circle-847`. A "Copy link" button with clipboard API + success toast.

**Preview of invitation message:** A bordered box showing exactly what the invited member will receive:
"[Admin name] at Islamic Center of Austin has invited you to join the MSA Graduate Circle — a qard hassan (interest-free) lending circle on Mizan. Your monthly pledge would be $100. Accepting adds this commitment to your Mizan portfolio."

**"Launch Circle" button:** Primary teal. On click:
1. Simulates sending invitations (spinner 800ms)
2. Creates the circle object in CommunityContext
3. Logs a "Circle created" event in the pool history
4. Navigates to `/community/circles/[new-circle-id]`

---

## Individual Circle Management Page

Route: `/community/circles/:circleId`

This is the most complex screen in the Community Hub. Uses a main content + right sidebar layout.

**Main content (70% width):** Members section → Active Loans section → Pending Votes section → Pool History log

**Right sidebar (30% width):** Circle stats card → Quick actions → Circle rules summary

---

### Circle Header

At the top of the main content, spanning full width:

"MSA Graduate Circle" — Cormorant Garamond 600, 28px.

Below: "12 members · $2,400 pooled · 2 active loans" — DM Sans 400, 15px.

Pool health bar (full width): a teal fill bar labeled "Pool health: Strong (94% repayment rate)." The bar is 82/100 filled. The same pool health score computation from Phase 3.1.

---

### Members Section

**Section header:** "Members (12)" — DM Sans 500, 13px, uppercase, teal color.

A table (appropriate for the web admin context):

| Status | Name | Monthly Pledge | Circle Role | Pledge Status |
|---|---|---|---|---|
| ✓ | Ahmad K. | $200/mo | Member | Active |
| ✓ | Fatima M. | $200/mo | Member | Active |
| ✓ | Yusuf A. | $200/mo | Member | Active |
| ✓ | Maryam S. | $200/mo | Member | Active |
| ⚠️ | Ibrahim T. | $200/mo | Member | Missed May |
| ... | ... | ... | ... | ... |

Show first 5 rows with a "Show all 12 →" expandable section.

Ibrahim T. row: yellow background wash, ⚠️ icon, "Missed May" badge in yellow. The admin can click this row to see a simple action panel: "Mark as excused" / "Send reminder" (both mocked — success toast after click).

Two buttons below the table: "Invite new member →" (opens the invite modal from Step 4 of create flow) and "Remove member" (opens a confirmation dialog with the caveat "Removing a member does not affect their active portfolio commitments").

---

### Active Loans Section

**Section header:** "Active Loans (2)"

A detailed view of each active loan:

**Loan card 1 — Omar B.:**

```
Omar B. — $600 Standard Tier
Repayment on schedule · Next due: May 20, 2026

Progress: [████████░░░░░░░░░░] Month 2 of 5 (40% repaid)

Repaid: $240 of $600
Monthly payment: $120

Remaining: $360
Estimated completion: September 2026
```

The progress bar has two sections: teal (repaid) and dim (remaining). Month counter "Month 2 of 5" is derived from the mock start date and repayment schedule.

An expandable "Repayment history" section below each loan shows the full schedule:
- April 18 — $120 — Paid on time ✓
- May 18 — $120 — Due in 2 days ⏳
- June 18 — $120 — Upcoming ⚪
- July 18 — $120 — Upcoming ⚪
- Aug 18 — $120 — Upcoming ⚪

**Loan card 2 — Hana K.:**

```
Hana K. — $200 Micro Tier
Repayment on schedule · Next due: May 25, 2026

Progress: [████████████░░░░░░] Month 1 of 2 (50% repaid)

Repaid: $100 of $200
Monthly payment: $100

Remaining: $100
Estimated completion: June 2026
```

Both loan cards use the same shrinking-bar approach from Phase 2.2's loan dashboard.

---

### Pending Votes Section

**Section header:** "Pending Circle Vote (1)" — with a yellow pulse indicator dot.

The vote card is the most interactive element in the entire Circles tab:

```
┌────────────────────────────────────────────────────────┐
│  Loan Application — Bilal Mansour                      │
│  $1,200 · Standard Tier · Tuition gap                  │
│                                                        │
│  Vouched by: Imam Abdullah ✓                          │
│  Need Score: 68/100                                   │
│                                                        │
│  "I need help with this semester's tuition. I work     │
│  part-time at the library making about $1,400/month    │
│  and my family helps when they can. I've been at ICA  │
│  for 4 years and Sheikh Abdullah knows me."            │
│                                                        │
│  EXTRACTED DETAILS:                                    │
│  Purpose: Tuition (Standard) · Income: $1,400/mo      │
│  Household: Single · Need Score: 68/100               │
│  Monthly payment if approved: $240/mo                 │
│  New DTI: 47% — manageable                            │
│                                                        │
│  CURRENT VOTE COUNT:                                  │
│  ████████████████░░░░  7/12 members voted             │
│  Yes: 5   No: 1   Abstain: 1                          │
│  Threshold needed: >50% (7 of 12 = 58%)              │
│  Current approval: 71% — THRESHOLD MET ✓             │
│                                                        │
│  Voting closes: May 20, 2026 · 11:59 PM               │
│                                                        │
│  [ View full application ]   [ Co-sign as Imam → ]    │
└────────────────────────────────────────────────────────┘
```

**Vote count bar:** A horizontal bar showing votes cast. The bar segments: Yes (green), No (red), Abstain (gray). The 7/12 voted indicator shows above the bar. "71% yes — THRESHOLD MET ✓" in green below.

**"View full application" link:** Opens a modal with the complete application including all verification data, extracted fields, and the algorithm transparency section from Phase 2.1.

**"Co-sign as Imam" button:** Available because this is a Standard tier vote — for Major tier, co-sign would be required. Clicking shows:
1. A confirmation: "Co-signing indicates your personal endorsement of this application. Are you sure?"
2. On confirm: A co-sign badge appears on the vote card: "Imam co-sign: ✓ Sheikh Abdullah · April 18, 2026"
3. This increases the vote's trust weight in the algorithm

**Demo: "Simulate vote completion" button** (below the vote card, labeled as demo control):
On click:
1. The remaining 5 members "vote" over a 2-second animated sequence
2. Vote counts animate: Yes goes from 5 → 9, Not voted goes from 5 → 0
3. Final: 9/12 voted yes (75%) — well above 50% threshold
4. A "Vote passed — Loan approved" success card slides in
5. The loan enters the disbursement queue — a `CIRCLE_VOTE_COMPLETE` event fires to SharedEventsContext
6. A cross-account update fires: the borrower's application review screen (Phase 2.1) would show Step 3 complete if the borrower account is also open
7. The vote card changes to "Approved — Pending disbursement" status

This simulation is the most important demo moment in Phase 3.2 — it shows the real-time cross-account communication.

---

### Circle Pool History

**Section header:** "Pool History" — DM Sans 500, 13px, uppercase.

A scrollable log of all capital flows through the circle. Table format:

| Date | Event | Amount | Running Balance |
|---|---|---|---|
| May 1, 2026 | 12 members pledged monthly | +$2,400 | $2,400 |
| April 25, 2026 | Hana K. repaid in full (early) | +$200 | $1,800 |
| April 25, 2026 | Hana K. loan closed | — | $1,800 |
| April 18, 2026 | Omar B. repayment #2 | +$120 | $1,600 |
| April 5, 2026 | Hana K. loan disbursed | -$200 | $1,480 |
| March 15, 2026 | Fatima M. repayment | +$80 | $1,680 |
| March 1, 2026 | 12 members pledged monthly | +$2,400 | $1,600 |
| March 5, 2026 | Omar B. loan disbursed | -$600 | -$800 |

Amount column: green for positive, red for negative, dash for zero. Running balance tracks cumulative pool health over time.

Pagination: Show 10 rows per page with "Load older entries →" at the bottom.

---

### Right Sidebar (Circle Management Page)

**Circle stats card:**
- Available capital: $[computed from pooled - activeLoans]
- Total loaned this cycle: $800
- Average loan size: $400
- Pool utilization: 40% (healthy range indicator)
- Repayment rate: 94% (with colored indicator — green for >90%)

**Quick actions:**
- "Invite member →" (opens invite modal)
- "View insights →" (navigates to Insights tab / Loans sub-tab)
- "Edit circle rules →" (opens a version of the Create wizard pre-filled with current settings)
- "Archive circle" (confirmation dialog, mocked)

**Circle rules summary:**
A compact read-only summary of the rules set during creation:
- Member cap: 20
- Monthly pledge: $200
- Min pool: $500
- Max single loan: 40% ($960 currently)
- Voting threshold: Standard: >50%
- Voting window: 48 hours
- Default conversion: Borrower's chosen cause

---

## Phase 3.2 Acceptance Criteria

**Circles overview:**
- [ ] "Qard Hassan Circles" header with "Create new Circle" button
- [ ] 3 circle cards render with correct names, member counts, pool amounts
- [ ] Pool health bars render with correct fill percentages
- [ ] "1 pending vote" yellow badge on MSA Graduate Circle card
- [ ] Sisters Circle shows "Excellent" in green
- [ ] Ramadan Circle shows "Awaiting first loan" instead of bar
- [ ] "Manage →" links navigate to individual circle pages

**Create Circle wizard:**
- [ ] 4-step flow renders with progress bar
- [ ] Step 1: Circle name and type selector work, continue disabled until name filled
- [ ] Step 2: Member cap slider updates live, pledge chips work, computed monthly total shown
- [ ] Step 3: All approval rule selectors work, Major tier row is locked as non-selectable
- [ ] Step 4: Pre-filled invites show accepted/pending states, share link copies to clipboard
- [ ] Invitation message preview renders correctly
- [ ] "Launch Circle" creates circle in context and navigates to new circle page

**Individual circle management (MSA Graduate):**
- [ ] Circle header shows name, member count, pooled amount
- [ ] Pool health bar at 82% fill labeled "Strong"
- [ ] Members table shows 5 visible rows + "Show all 12" expander
- [ ] Ibrahim T. row has yellow wash and "Missed May" badge
- [ ] "Mark as excused" action on Ibrahim T. shows success toast
- [ ] Active loans section shows Omar B. and Hana K. cards
- [ ] Each loan card shows correct progress bar (40% and 50% respectively)
- [ ] Repayment schedules expand correctly
- [ ] Pending vote card shows Bilal M. with 7/12 votes and 71% approval
- [ ] Vote bar shows Yes/No/Abstain segments correctly
- [ ] "Threshold met" ✓ shown in green
- [ ] "View full application" opens modal with complete application data
- [ ] "Co-sign as Imam" button shows confirmation → adds co-sign badge
- [ ] "Simulate vote completion" button:
  - [ ] Animates vote counts increasing over 2 seconds
  - [ ] Final state shows 9/12 voted yes (75%)
  - [ ] "Vote passed — Loan approved" success card slides in
  - [ ] CIRCLE_VOTE_COMPLETE event fires to SharedEventsContext
  - [ ] Vote card changes to "Approved — Pending disbursement"
- [ ] Pool history table shows 8 pre-seeded events with correct amounts
- [ ] Running balance column computed correctly
- [ ] Table is paginated at 10 rows
- [ ] Right sidebar: circle stats, quick actions, rules summary all render
- [ ] Available capital computed correctly ($2,400 - $600 - $200 = $1,600)

**Money flows:**
- [ ] Pool history amounts match the pre-seeded simulation data
- [ ] After vote completion, a new "Bilal M. disbursement pending" event would appear in pool history (optional nice-to-have)

---

## Notes for Claude Code

The vote simulation (animating from 7/12 to 9/12 voted) should use Framer Motion's `animate` to count the "Yes" number from 5 to 9 over approximately 1.8 seconds, while the "Members voted" bar expands from 58% to 75%. The animation should feel organic — not linear — use an ease-in-out curve.

The pool history table's "Running Balance" column is computed by starting from $0 and adding/subtracting each event's amount in reverse chronological order (oldest first). The display is newest-first but the running balance must be computed in chronological order. Pre-compute this during CommunityContext initialization so it's not recomputed on every render.

The individual circle management page is the most data-rich page in the entire application. Prioritize information hierarchy: the pending vote section should be immediately visible without scrolling — it's the most urgent item. Put it before the pool history in the DOM order.

The "Edit circle rules" quick action in the right sidebar should reuse the Create Circle wizard components. Pass the current circle data as initial state. The wizard shows with pre-filled values and a "Save changes" button instead of "Launch Circle."

For the cross-account communication after "Simulate vote completion": fire the `CIRCLE_VOTE_COMPLETE` event via SharedEventsContext. The BorrowerContext should listen for this event and update the application review screen's step tracker — Step 3 (Algorithm review) advances to complete, Step 4 (Pool availability) advances to pending. This demonstrates the real-time cross-account communication that is central to the platform's design.
