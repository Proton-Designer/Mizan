# MIZAN — Phase 3.3: Community Hub — Vouching Tab, Insights Tab & Impact Report
## Build Document for Claude Code

---

## Prerequisites

Phase 3.1 (Dashboard) and Phase 3.2 (Circles) must be complete. Phase 3.3 completes the Community Hub with the two remaining tabs and the impact report feature.

---

## Phase 3.3 Scope

1. **Tab 3: Vouching** — The vouch request queue, full vouch review page, all four vouch decision types, and reviewed history
2. **Tab 4: Insights** — Four sub-tabs: Giving, Loans, Events, Impact (including the event correlation algorithm and world map)
3. **Impact Report Generation** — The one-click shareable PDF/image of congregation impact

After Phase 3.3, the Community Hub Account is feature-complete.

---

## Tab 3: Vouching

### Route

`/community/vouching`

### Layout

Full content area, max-width 900px. Two panels stacked: "Pending" queue at the top, "Reviewed History" below.

---

### Vouching Queue

**Section header:** "Vouch Requests" — Cormorant Garamond 600, 28px.

Tab pills below: "Pending (1)" and "Reviewed (12)" — the active tab is highlighted in teal.

**Pending tab:**

One vouch request card for Bilal Mansour:

```
┌────────────────────────────────────────────────────────┐
│  🔴 New · 2 days old                    [Urgent]       │
│                                                        │
│  Bilal Mansour                                        │
│  Mosque member: Yes · Listed in mosque directory      │
│  Request: $1,200 · Standard Tier · Tuition gap       │
│  Urgency: High                                        │
│  Submitted: April 16, 2026 · 9:14 AM                 │
│                                                        │
│  Need Score: 68/100 · Vouch score: 0 (pending)       │
│                                                        │
│         [ Review full request → ]                     │
└────────────────────────────────────────────────────────┘
```

Card: `var(--bg-surface)`, red left accent bar (3px, `var(--status-red)`), border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 24px.

"Urgent" badge in the top-right: red pill. "2 days old" is computed from the submission timestamp.

The need score is visible (68/100) because it helps the admin understand why this person applied. The vouch score shows 0 because the imam hasn't responded yet — the admin can see this directly: their vouch is the most important remaining piece.

"Review full request →" is a teal primary button.

**If no pending items:** An empty state: "No pending vouch requests. When congregation members apply for qard hassan loans and list this mosque as their community reference, they'll appear here." — DM Sans 400, 15px, italic, centered, with a soft teal empty state illustration.

---

### Full Vouch Review Page

Route: `/community/vouching/:applicantId`

Navigated to by clicking "Review full request →". Uses the full content area with max-width 800px.

**Back link:** "← Back to vouch queue" navigates to `/community/vouching`.

**Page header:**

"Vouch Request — Bilal Mansour" — Cormorant Garamond 600, 30px.

"$1,200 · Standard Tier · Submitted April 16, 2026" — DM Sans 400, 15px, `var(--text-secondary)`.

A timer below: "⏱ Vouch requested 2 days ago. Requests expire in 48 hours." — This urgency indicator is yellow if within 12 hours of expiry, red if less than 6 hours.

---

**Three-column layout:**

Left column (40%): What they said + Extracted details
Right column (60%): Community standing + Vouch options

---

**Left column:**

"WHAT THEY SAID:" — DM Sans 500, 11px, `var(--text-tertiary)`, letter-spacing 0.08em, uppercase.

The full free-text narrative from the intake:
"I need help with this semester's tuition. I work part time at the library making about $1,400 a month and my family helps when they can. I've been at ICA for 4 years and Sheikh Abdullah knows me."

Displayed in a bordered box: `var(--bg-elevated)`, padding 16px, border-radius `var(--radius-md)`, DM Sans 400, 14px, italic, `var(--text-secondary)`, line-height 1.7.

"EXTRACTED DETAILS:" — same uppercase label.

A clean key-value table:
- Request: $1,200 (Standard tier)
- Purpose: Tuition
- Income: $1,400/month
- Household: Single (no dependents)
- Need Score: 68/100 (High) — with a bar showing 68/100 fill
- Monthly payment if approved: $240/month (= $1,200 / 5 months)
- New DTI after loan: 47% — "Manageable" label in green

The need score bar: a small horizontal bar (140px wide), teal fill at 68%, gray empty at 32%. The 68 number in Cormorant Garamond 600, 18px beside it.

---

**Right column:**

"COMMUNITY STANDING:" — uppercase label.

A structured display of verification status:

```
Mosque affiliation: 4 years  ✓ (green check)
Listed in mosque directory:  Yes ✓
Prior platform loans:        0
Prior loans repaid:          0 (first application)
Circle membership:           None
```

Each row: left label (DM Sans 500, 13px, `var(--text-secondary)`) + right value (DM Sans 400, 13px, `var(--text-primary)`). Green checkmarks for positive signals.

The "0 prior loans repaid" is not negative framing — the helper text below: "No prior history is neutral. First-time borrowers have as much opportunity as returning borrowers."

---

**Vouch Decision section (below both columns, full width):**

"YOUR VOUCH OPTIONS:" — uppercase label, with a note: "Your decision is private. The applicant is not told the reason for any outcome."

Four decision cards in a 2×2 grid:

**Card 1 — Full Vouch:**
Left border: 4px teal accent.
Icon: `CheckCircle` (24px, `var(--status-green)`) in green circle background.
Title: "Vouch — I know this person and trust them" — DM Sans 700, 15px.
Description: "Full endorsement. Adds maximum trust score (25 points for imam endorsement + 2yr tenure). Moves application to next stage."
On select: card highlights with teal border, a "Submit vouch →" button appears.

**Card 2 — Partial Vouch:**
Left border: 4px yellow accent.
Icon: `AlertCircle` (24px, `var(--status-yellow)`) in yellow circle.
Title: "Partial vouch — I know them but have reservations"
Description: "Application proceeds with reduced trust score. Only you and the platform see your note."
On select: a textarea expands within the card: "Add a confidential note (only platform team sees this):" — placeholder: "e.g., I know them casually but cannot fully attest to their financial reliability."
When the textarea is filled, "Submit partial vouch →" button appears.

**Card 3 — Decline:**
Left border: 4px red accent.
Icon: `XCircle` (24px, `var(--status-red)`) in red circle.
Title: "Decline — I cannot verify this person or have concerns"
Description: "Application is denied at the vouch stage. No reason is shared with the applicant."
On select: a confirmation appears within the card: "Are you sure? This person will be notified their vouch was not approved, with no reason given." Two buttons: "Cancel" and "Confirm decline."

**Card 4 — Need More Time:**
Left border: 4px gray accent.
Icon: `Clock` (24px, `var(--text-tertiary)`) in gray circle.
Title: "I'll reach out first — need 48 hours"
Description: "A 48-hour hold is placed. If you don't respond, the application reverts to pending and the applicant is notified of the delay."
On select: "Request 48-hour hold →" button appears.

---

**Submitting a vouch decision:**

When any decision button is clicked:

1. A confirmation toast: "Vouch decision submitted — [decision type]"
2. `castVouch(applicantId, decision, note)` called in CommunityContext
3. The vouch request is moved from `vouchQueue` to `vouchHistory`
4. Cross-account: a `VOUCH_GRANTED` event fires to SharedEventsContext (for Full Vouch)
5. The borrower's application review screen (Phase 2.1) would update — Step 2 (Imam vouch) advances from Pending to Complete, Step 3 advances to Pending
6. The sidebar vouching badge count decreases from "1" to "0"
7. Navigate back to `/community/vouching`

For Full Vouch: The algorithm re-runs in BorrowerContext with the updated trust score. If the new need score + vouch score clears the Standard tier threshold (≥50 need score + ≥18 trust score), the application auto-advances to circle vote.

For the demo specifically: After the admin submits Full Vouch for Bilal, his trust score updates to 25 (full imam vouch) + 10 (2+ year tenure) = 35. Total score: 68 + 35 = not how it works — vouch score is one of four components. Recalculate: trust_points(vouch=full, tenure=long) = 25. Need score recomputed = income_points(20) + urgency_points(15) + dependents_points(5) + trust_points(25) = 65. Standard threshold: score ≥ 50 ✓ + trust ≥ 18 ✓. Moves to circle vote.

---

### Reviewed History

**"Reviewed (12)" tab:**

A table showing all past vouch decisions:

| Date | Applicant | Amount | Decision | Outcome |
|---|---|---|---|---|
| Apr 10 | Omar B. | $600 | ✓ Vouched | Loan active |
| Mar 28 | Hana K. | $200 | ✓ Vouched | Repaid ✓ |
| Mar 15 | [Anonymous] | — | ✗ Declined | — |
| Feb 20 | Fatima M. | $400 | ✓ Vouched | Repaid ✓ |
| ... | ... | ... | ... | ... |

The declined row shows "[Anonymous]" — the declined person's name is not stored in the visible history to protect their privacy. The admin only knows they declined someone, not who.

The vouched rows that ended in repayment show "Repaid ✓" in green. Active loans show "Loan active" in teal. The declined row shows "—" in the outcome column.

**Mosque Trust Badge (below the table):**

A card showing the mosque's platform reputation:

"Mosque Trust Record:" — DM Sans 500, 13px, uppercase.

"10 of 11 vouched loans repaid in full — 90.9% repayment rate on vouched loans." — DM Sans 400, 15px.

Below: A badge: "🏅 Trusted Voucher — This mosque's vouches carry enhanced weight in the algorithm (1.15× trust multiplier)." — Shown because the repayment rate on vouched loans is above 90%.

This badge is a direct incentive for mosque admins to vouch carefully. Their reputation affects their vouches' algorithm weight.

---

## Tab 4: Insights

### Route

`/community/insights`

### Layout

Full content area. A horizontal pill selector at the top: [Giving] [Loans] [Events] [Impact]. Each pill navigates to the corresponding sub-view. The active sub-view fills the content below the pills.

---

### Giving Sub-tab

**A two-column layout:**

Left column (55%): Congregation engagement data
Right column (45%): Cause distribution chart

**Left column sections:**

**This month vs last month card:**
A card with two stat columns:
- This month: "$1,240 committed (+18% ↑)" — the +18% in green with an upward arrow
- Last month: "$1,051 committed"

Below: "31 of 47 members active (66%) · 4 new givers this month"

The 18% growth is computed: (1240 - 1051) / 1051 × 100 = 18.0%. This is a real calculation from the simulated data.

**Giving mode breakdown:**
Three horizontal bars in a card:
- Direct: 62% — teal bar
- Compound: 38% — gold bar (compound is portfolio-register)
- Jariyah: 17% — green bar, with note "(8 members have active Jariyah commitments)"

**Engagement segments card:**
A segmented display:
- Highly engaged (weekly/biweekly): 8 members — green segment
- Moderate (monthly): 19 members — teal segment
- Sporadic (less than once/month): 20 members — yellow segment

Visual: a simple horizontal stacked bar (8:19:20 proportion). Below: a compact list of each segment's count and label.

**AI Insight box** (full width within left column):
A teal-bordered box with "💡 Monthly Insight" header.

The pre-written insight for the demo:
"41% of your congregation gives sporadically — less than once per month. A Ramadan consistency challenge could activate this group. Communities that run giving streaks see 2.3× higher member retention on average."

Below the insight: "This insight refreshes monthly. [Refresh now →]" — a text link that simulates an API call (spinner → new insight text after 1.5s, showing a different pre-written insight from a small pool of 3 options).

**Right column:**

**Cause distribution chart:**
An SVG donut chart showing cause category breakdown. Each category is a segment:
- Gaza Emergency: 34% — red-tinted
- Yemen Orphan: 28% — purple
- Somalia Water: 18% — blue
- Local mosque: 12% — teal
- Other: 8% — gray

In the center of the donut: "47 members" in Cormorant Garamond 600, 18px.

A legend below the donut: category color + name + percentage + dollar amount ($4,488 for Gaza at 34% of $12,400, etc.).

**Top 5 causes table** below the chart:

| Rank | Cause | NGO | Share | Total |
|---|---|---|---|---|
| 1 | Gaza Emergency Fund | Islamic Relief | 34% | $4,216 |
| 2 | Yemen Orphan Fund | Islamic Relief | 28% | $3,472 |
| 3 | Somalia Water Wells | Zakat Foundation | 18% | $2,232 |
| 4 | Local mosque repair | ICA Austin | 12% | $1,488 |
| 5 | Other | Various | 8% | $992 |

NGO logos (real, from Phase 1.1's data layer) appear beside each NGO name in the table.

---

### Loans Sub-tab

**A two-column layout:**

Left column (55%): Aggregate loan metrics
Right column (45%): Circle performance comparison

**Left column:**

**Lifetime loans card:**

```
Total loaned through mosque: $8,400
Total repaid:                $7,800 (92.8%)
Currently outstanding:       $3,200
```

Below: a horizontal bar chart showing the breakdown — repaid (teal), outstanding (yellow), written off as sadaqah (green if any conversions).

**Tier breakdown:**

A table:

| Tier | Loans | Amount | Repaid | Rate |
|---|---|---|---|---|
| Micro ($50-500) | 6 | $1,050 | $1,050 | 100% |
| Standard ($500-2k) | 4 | $2,600 | $2,340 | 90% |
| Major ($2k-4k) | 1 | $2,750 | In progress | N/A |

Color-coded Rate column: 100% in green, 90% in light green.

**Repayment speed vs tier window:**

A small comparison chart showing average repayment time vs expected window:
- Micro: 1.8 months avg vs 2.0 window — "0.2 months faster ↑" in green
- Standard: 5.2 months avg vs 5.0 window — "0.2 months slower ↓" in yellow (barely above)

**Pool health score:**

Large centered display: "94/100" in Cormorant Garamond 600, 64px, `var(--teal-mid)`. Label below: "Pool Health Score — Strong."

A breakdown card showing the four components of the pool health score:
- Repayment rate (50% weight): 92.8% → 46.4 points
- Capital utilization (25% weight): 83% utilized → 20.7 points
- Activity recency (25% weight): 7 days → 25 points
- Total: 92.1 → displayed as 94 (rounded with slight upward adjustment for strong repayment history)

**Right column:**

**Circle performance comparison:**

A horizontal bar chart comparing all 3 circles:
- MSA Graduate Circle: 94% repayment — teal bar filling 94% of width
- Sisters Giving Circle: 100% repayment — teal bar full width with "Perfect ✓" label
- Ramadan Emergency Circle: "No loans yet" — empty bar with dashed border

**Waitlist status:**
A compact view of the loan waitlist (borrowers approved but waiting for pool capital):
- "2 approved borrowers awaiting disbursement" — one for each of the pending circle votes
- Estimated wait: "Next disbursement when current cycle pool replenishes (est. June 2026)"

---

### Events Sub-tab

**Page header:** "Community Events & Giving Correlation"

**Sub-header:** "Log your mosque's events and see which ones drive charitable giving. Over time, this becomes your evidence base for programming decisions." — DM Sans 400, 15px, italic.

**Log new event — Action panel:**

A card with a small form (single-row horizontal layout for desktop):

"Event name: [ _____________ ]  Type: [ Iftar ▾ ]  Date: [ MM/DD/YYYY ]  Attendance: [ ___ ]  [ Save event ]"

This compact form collapses the 4-step form from the feature spec into one row for efficiency. On "Save event": adds to the events array in context, shows a success toast "Event logged. Correlation data will appear within 7 days." For the demo, clicking "Save" on any event immediately shows the correlation card (no 7-day wait) using pre-computed impact data.

**Event history — 4 cards:**

Each event renders as a detailed card. The cards are ordered by giving impact (highest multiplier first), not by date — this prioritizes the most impactful events at the top.

**Card 1 — Eid Al-Fitr Celebration (highest impact):**

```
┌────────────────────────────────────────────────────┐
│  🌙 Eid Al-Fitr Celebration           March 30    │
│     ~350 attendees                                 │
│                                                   │
│  48-hour giving spike:                            │
│  18 members gave (vs 3-4 average)                │
│  Total committed: $3,200 (vs $280 baseline)      │
│  12.4× multiplier — Highest of all events ★      │
│                                                   │
│  Giving mode in 48hr window:                     │
│  Direct 41% · Compound 59% · Jariyah 28%        │
│  (Compound and Jariyah both above your baselines)│
│                                                   │
│  Top causes:                                     │
│  Gaza 52% · Yemen 31% · Local 17%              │
└────────────────────────────────────────────────────┘
```

The "12.4× multiplier" is the headline number. It's in Cormorant Garamond 600, 28px, `var(--gold-mid)` — the highest value uses gold to signal this is the most valuable data point. A ★ "Highest of all events" badge in gold beside it.

**Card 2 — Ramadan Night 27 Iftar (second highest):**

Same format but with 7.6× multiplier. No gold star. The 7.6× is also large and gold-colored.

Unique insight for this event: "Jariyah rate higher than usual (22% vs 17% baseline) — night's spiritual atmosphere may have influenced long-term commitment mode." — This nuanced observation is the type of insight that makes admins trust the data.

**Card 3 — Jummah Fundraiser:**

3.2× multiplier. Standard card.

**Card 4 — Islamic Finance Workshop:**

2.2× multiplier. Note: "Smallest multiplier but highest per-attendee rate ($12.89/attendee vs $9.14 average) — highly engaged smaller audience."

This reframe — from total impact to per-attendee efficiency — shows the data is sophisticated enough to surface insights that aren't immediately obvious.

**All Events Table (below the cards):**

A compact sortable table of all events with columns: Event / Date / Attendees / 48hr Giving / Multiplier / Jariyah Rate. Sort by clicking column headers. Default sort: Multiplier descending.

The table lets admins see their full event history at a glance and sort by different metrics to draw their own conclusions.

---

### Impact Sub-tab

**Layout:** A two-panel layout on desktop — map left (55%), stats right (45%).

**Left panel — World Map:**

Same `react-simple-maps` implementation from Phase 1.3, but showing the congregation's collective impact rather than one user's positions.

Impact pins representing the congregation's giving:
- Yemen (22 families helped — Islamic Relief) — large purple pin
- Gaza (18 families helped — Penny Appeal) — large red pin
- Somalia (340 people with water access — Zakat Foundation) — blue pin
- Pakistan (8 orphans in school — Human Appeal) — green pin
- USA (local loans — Austin TX) — small teal pin

The map is static (no borrower pins — the congregation's data doesn't expose individual loan positions). The cause pins are sized proportionally to the total amount committed — Yemen and Gaza have larger pins than Pakistan.

Hovering a pin shows a tooltip: Country name, amount committed by congregation, families/people helped, primary NGO, last impact update.

**Right panel — Congregation Impact Stats:**

Four large stat cards (2×2 grid):
- "89 families helped" — across all countries
- "7 countries reached" — geographic breadth
- "$12,400 committed" — total by congregation
- "11 qard hassan loans" — community finance impact

Below the grid: a ranked country list with amounts:

```
Yemen        $4,200 · 22 families helped
Gaza         $3,800 · 18 families helped
Somalia      $1,200 · water for 340 people
Pakistan     $900   · 8 orphans in school
USA (local)  $2,300 · 9 loans active
```

**Generate Impact Report section (below stats):**

"Share this with your congregation →" — Cormorant Garamond 500, 22px.

"Generate a one-page impact report for Jummah, WhatsApp, or your mosque's website." — DM Sans 400, 14px, italic.

A teal primary button: "Generate Impact Report →"

---

## Impact Report Generation

On clicking "Generate Impact Report":

1. A brief loading state: "Preparing your report..." with a spinner (800ms)
2. A full-page preview modal opens showing the report

**Report content (designed as a shareable one-pager):**

The report is generated using `html2canvas` on a hidden off-screen div with a styled layout:

- **Header:** Mizan logo + "Islamic Center of Austin — Community Impact Report" + Month/Year (April 2026)
- **Hero stat:** "Your congregation helped **89 families** across 7 countries" — large, centered
- **Map thumbnail:** A screenshot of the impact map (or a simplified static map for the report)
- **Giving summary:** $12,400 committed this year | 47 members on Mizan | 31 active this month
- **Qard Hassan section:** 11 interest-free loans | $8,400 total | 92.8% repaid on time | 3 active circles
- **Top causes:** The top 3 causes with their dollar amounts and impact metrics
- **Call to action:** "Join us on Mizan with code ICA-AUSTIN-2847"
- **Footer:** Mizan logo + "Connecting the Ummah via tech"

The visual design uses the Islamic geometric pattern at low opacity from the Welcome screen as a background element. Dark background, gold and teal text — consistent with the app's aesthetic.

**Report modal actions:**

- "Download as PNG" — triggers `html2canvas` download
- "Download as PDF" — uses `html2canvas` + a PDF library (jsPDF) to generate a PDF from the canvas
- "Copy shareable link" — a simulated link: `mizan.app/impact/ica-austin-2026-04` (mocked)
- Close button

---

## Phase 3.3 Acceptance Criteria

**Vouching tab:**
- [ ] Vouching overview shows Pending (1) and Reviewed (12) tabs
- [ ] Bilal Mansour pending card renders with red accent bar and urgency timer
- [ ] Need score (68/100) visible on the pending card
- [ ] "Review full request →" navigates to full vouch review page
- [ ] Full vouch review page shows three-column layout
- [ ] Applicant's full narrative text in bordered box
- [ ] Extracted details key-value table with need score bar
- [ ] Community standing shows 4 years, directory listed, 0 prior loans
- [ ] Four vouch option cards in 2×2 grid
- [ ] Full Vouch card: clicking shows "Submit vouch" button
- [ ] Partial Vouch card: clicking expands confidential note textarea
- [ ] Decline card: clicking shows confirmation within card
- [ ] Need More Time card: clicking shows "Request 48-hour hold" button
- [ ] Submitting Full Vouch:
  - [ ] `castVouch()` called with correct params
  - [ ] Vouch moves from queue to history
  - [ ] VOUCH_GRANTED event fires to SharedEventsContext
  - [ ] Borrower's review screen updates Step 2 to complete
  - [ ] Sidebar badge decreases from "1" to "0"
  - [ ] Navigate to /community/vouching
- [ ] Reviewed History tab shows 12 entries in table format
- [ ] Declined entry shows [Anonymous] in applicant column
- [ ] Mosque Trust Badge renders with 90.9% repayment rate
- [ ] "Enhanced weight" badge shows for >90% repayment rate

**Insights tab:**
- [ ] Four pills render: Giving, Loans, Events, Impact
- [ ] Giving sub-tab: two-column layout renders
- [ ] Month-over-month: $1,240 +18% correctly computed and displayed
- [ ] Direct/Compound/Jariyah bars render at 62%/38%/17%
- [ ] Engagement segments stacked bar renders at 8:19:20 ratio
- [ ] AI insight box renders with pre-written text
- [ ] "Refresh now" link triggers 1.5s spinner + shows alternative insight
- [ ] Donut chart renders with 5 cause segments in correct proportions
- [ ] Center shows "47 members"
- [ ] Legend shows category + name + % + dollar amounts
- [ ] Top 5 causes table renders with real NGO logos from Phase 1.1 data
- [ ] Loans sub-tab: aggregate metrics card ($8,400 total, 92.8% repaid)
- [ ] Lifetime loans horizontal bar chart renders
- [ ] Tier breakdown table renders with correct repayment rates
- [ ] Repayment speed comparison (Micro faster, Standard slightly slower)
- [ ] Pool health score shows "94/100" in large Cormorant Garamond gold text
- [ ] Pool health breakdown shows 4 components with point values
- [ ] Circle performance bar chart shows all 3 circles
- [ ] Sisters Circle shows "Perfect ✓" at 100%
- [ ] Ramadan Circle shows empty bar
- [ ] Events sub-tab: compact event form renders (single row)
- [ ] 4 event cards render ordered by multiplier (Eid first at 12.4×)
- [ ] Eid card: 12.4× in large Cormorant Garamond gold with ★ badge
- [ ] Ramadan Night 27 card: 7.6× with Jariyah insight note
- [ ] All Events sortable table renders below cards
- [ ] Impact sub-tab: world map renders with 5 cause pins
- [ ] Pin sizes proportional to giving amounts
- [ ] Pin hover tooltips show correct congregation impact data
- [ ] 4 stat cards render with congregation totals
- [ ] Country-by-country ranked list renders correctly
- [ ] "Generate Impact Report →" button opens loading state

**Impact Report:**
- [ ] Loading state shows for 800ms
- [ ] Report preview modal opens with full-pager content
- [ ] Report shows mosque name, date, hero stat (89 families), map, giving summary, loans section
- [ ] Islamic geometric pattern visible as background element
- [ ] "Download as PNG" triggers html2canvas download
- [ ] "Download as PDF" triggers jsPDF generation
- [ ] "Copy shareable link" shows success toast
- [ ] Close button dismisses modal

**Cross-account connections (Phase 3 complete):**
- [ ] Vouch submission triggers borrower application step update
- [ ] Circle vote completion triggers borrower application step update
- [ ] Loan repayment from borrower account updates circle pool history
- [ ] Sadaqah conversion from borrower account shows in circle history

---

## Community Hub Account Complete

After Phase 3.3:

- **Dashboard** ✓ — Hero card, congregation giving patterns, active loans, pending actions (3.1)
- **Setup flow** ✓ — 4-step mosque onboarding, EIN verification (3.1)
- **Circles tab** ✓ — Overview, create wizard, individual management, vote simulation (3.2)
- **Vouching tab** ✓ — Queue, full review, 4 decision types, reviewed history, trust badge (3.3)
- **Insights — Giving** ✓ — Month-over-month, mode breakdown, engagement segments, AI insight, cause donut (3.3)
- **Insights — Loans** ✓ — Aggregate metrics, tier breakdown, pool health score, circle comparison (3.3)
- **Insights — Events** ✓ — Event log form, 4 event cards with multipliers, sortable table (3.3)
- **Insights — Impact** ✓ — World map with congregation pins, stats, country breakdown (3.3)
- **Impact Report** ✓ — One-tap PNG/PDF generation of congregation impact (3.3)

---

## Notes for Claude Code

The insights tabs all compute from the simulated congregation data in CommunityContext. None of the numbers are hardcoded in the components — they're all derived from `aggregateStats`, `events`, `circles`, and `vouchHistory`. This means if the simulated data is adjusted, all Insights sub-tabs update automatically.

The jsPDF library should be added as a dependency for the PDF report: `npm install jspdf`. The standard pattern is: run `html2canvas` on the report div to get a canvas, then use `jsPDF.addImage(canvas, 'PNG', 0, 0, width, height)` and `pdf.save('mizan-impact-report.pdf')`. The PDF will be a single-page portrait document.

The donut chart in the Giving sub-tab uses the same SVG approach as the portfolio composition chart from Phase 1.1. It's a full circle with `stroke-dasharray` segments per category. The center label requires placing an SVG `<text>` element at the circle's center coordinates. Do not use a charting library — build the SVG directly for consistency with the portfolio account.

The sortable Events table should implement client-side sorting. Store a `sortColumn` and `sortDirection` state. On header click, toggle direction if the same column, or set new column with descending as default. This is a pure sort of the in-memory events array — no API call.

The vouch review page's three-column layout (narrative left, stats middle, vouch options right) should collapse to a single column on narrower viewports. Use CSS Grid: `grid-template-columns: 1fr 1fr` for the top two panels and `grid-template-columns: 1fr 1fr` for the four vouch option cards.

The impact report generation's hidden off-screen div should be carefully styled to exactly match the preview shown in the modal. Discrepancies between the preview and the downloaded file are confusing. Use a ref to the same div for both the preview and the `html2canvas` call — the preview modal simply makes this div visible; the download function captures it.
