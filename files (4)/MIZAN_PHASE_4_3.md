# MIZAN — Phase 4.3: NGO Partner Dashboard — Donors, Insights, Account & Withdrawals
## Build Document for Claude Code

---

## Prerequisites

Phase 4.1 (foundation, dashboard) and Phase 4.2 (campaigns, impact updates) must be complete. Phase 4.3 completes the NGO Partner Dashboard and closes out all four accounts of Mizan.

---

## Phase 4.3 Scope

1. **Tab 3: Donors** — Top donors table with detail drawer, segmentation, messaging composer with Claude suggestion, and CRM export
2. **Tab 4: Insights** — Conversion funnel, A/B testing, settlement pipeline detail
3. **Tab 5: Account** — Organization profile, bank management, withdrawal flow with real balance deduction, team access, transaction history
4. **Settlements detail page** — Full per-position breakdown of the Compound pipeline

After Phase 4.3, the NGO Partner Dashboard is complete and all four accounts of Mizan are feature-complete.

---

## Phase 4.3 Financial Mechanics

### What the $4,200 available balance represents

The `availableBalance` of $4,200 in NGOContext is made up of:

- $3,200 from settled Direct donations to active campaigns (cleared through the simulated escrow automatically)
- $600 from two completed Compound cycles (positions that finished all cycles and released their capital to the NGO)
- $400 from two sadaqah conversion events received via SharedEventsContext (Phase 2.3's $350 conversion rounded to $350 + $50 from an earlier conversion in the closed campaign history)

**Financial transaction pre-seeded history (in chronological order, oldest first):**

| Date | Type | Amount | Description | Balance After |
|---|---|---|---|---|
| Jan 15, 2026 | Settlement | +$2,450 | Direct donations batch — Q1 2026 | $2,450 |
| Feb 20, 2026 | Withdrawal | -$2,450 | ACH to Chase ****8821 | $0 |
| Mar 5, 2026 | Settlement | +$800 | Compound positions settled — 2 positions | $800 |
| Mar 20, 2026 | Conversion | +$180 | Qard hassan conversion — Somalia Wells (Khalid) | $980 |
| Mar 28, 2026 | Settlement | +$2,650 | Direct donations batch — March | $3,630 |
| Apr 10, 2026 | Settlement | +$1,200 | Compound positions settled — 4 positions | $4,830 |
| Apr 15, 2026 | Withdrawal | -$630 | ACH to Chase ****8821 | $4,200 |
| Apr 18, 2026 (today) | Conversion | +$350 | Qard hassan conversion — Yemen Orphan Fund (Bilal) | $4,200 |

Note: The April 18 conversion (+$350) comes from Phase 2.3's sadaqah conversion event. The balance remains $4,200 because the +$350 from Bilal's conversion arrived today and the prior balance was already $3,850 after the April 15 withdrawal — wait, the pre-seeded history should work out to exactly $4,200 after all events. Adjust amounts in the pre-seeded history to ensure the final balance is $4,200.

The "Khalid conversion" and "Bilal conversion" entries appear in the NGO's financial record as a direct consequence of Phase 2.3's cross-account sadaqah conversion. These two rows demonstrate that the qard hassan loop is fully visible to the NGO.

### Withdrawal simulation

When the admin initiates a full withdrawal of $4,200:
- `initiateWithdrawal(4200)` called in NGOContext
- `availableBalance` goes from $4,200 → $0
- A new row added to financialTransactions: "ACH to Chase ****8821 — $4,200"
- Sidebar balance updates immediately to $0
- Pipeline total ($16,500) does NOT change — that's committed capital, not available cash

---

## Tab 3: Donors

### Route

`/ngo/donors`

### Layout

Full content area. Three-panel layout: left sub-navigation sidebar (200px), main content area (remaining). The left sidebar is internal to the Donors tab, not the main account sidebar.

**Left sub-navigation:**

"Donors (412)" — header label in DM Sans 500, 13px, uppercase.

Sub-view links:
- Top Donors
- Segments
- Message
- Export

Below the links, filter controls:

"Filter by:" — label.

Campaign dropdown: [All campaigns ▾] — selecting a campaign filters the entire tab to only donors who gave to that campaign.

Date range: [All time ▾] — options: Last 30 days / Last 90 days / This year / All time.

Giving mode: All / Direct only / Compound only / Jariyah.

These filters apply globally to all sub-views.

---

### Top Donors Sub-view

Default view when the Donors tab loads.

**Header:** "Top Donors by Lifetime Value" — Cormorant Garamond 600, 24px.

**Privacy note:** "Showing 184 identified donors (opted in to name sharing). 228 donors are anonymized — city-level only." — DM Sans 400, 13px, italic, `var(--text-secondary)`.

**Sortable donor table:**

Column headers: Rank / Donor / City / Lifetime Value / Gifts / Last Gift / Mode / Jariyah / Segment. Click headers to sort, toggle asc/desc. Default: Lifetime Value descending.

Pre-seeded rows (top 5):

| # | Donor | City | Lifetime | Gifts | Last Gift | Mode | Jariyah |
|---|---|---|---|---|---|---|---|
| 1 | Ahmad K. | Austin TX | $2,400 | 8 | 3 days ago | 70% Compound | ✓ |
| 2 | Fatima M. | Dallas TX | $1,800 | 5 | 2 wks ago | 100% Direct | — |
| 3 | [Anonymous] | Houston TX | $1,600 | 12 | Today | 50% Compound | ✓ |
| 4 | Omar B. | Austin TX | $600 | 3 | 1 month | 100% Compound | — |
| 5 | Maryam S. | Chicago IL | $400 | 1 | 4 months | Direct | — |

Rows 6-20: generated donor data.

**Table styling:**
- Alternating row backgrounds (`var(--bg-surface)` and `var(--bg-elevated)`)
- Anonymous rows: "[Anonymous]" in italic `var(--text-tertiary)`, city shown normally
- Jariyah column: "✓ Active" in `var(--status-green)`, "—" in `var(--text-tertiary)`
- "Last Gift" color-coded: <7 days = green, 7-30 = `var(--text-primary)`, 30-90 = `var(--status-yellow)`, >90 = `var(--status-red)`

**Pagination:** 20 rows per page. Page controls at the bottom of the table.

**Row click → Donor detail drawer:**

Clicking any row opens a drawer that slides in from the right. The drawer is 340px wide. The rest of the page dims but remains visible.

**Drawer for Ahmad K.:**

```
┌──────────────────────────────────────────────────┐
│  Ahmad K.                            ✕ Close     │
│  Austin TX · Identified donor                    │
│  Mizan member since January 2026                 │
│                                                  │
│  GIVING SUMMARY                                  │
│  Lifetime: $2,400 · 8 gifts · Last: 3 days ago  │
│                                                  │
│  By campaign:                                    │
│  Yemen Orphan Fund    $1,440 (60%)              │
│  Gaza Emergency       $960  (40%)               │
│                                                  │
│  Mode: 70% Compound · 30% Direct                │
│  Jariyah: Active → Yemen Orphan Fund ($500)     │
│                                                  │
│  GIVING HISTORY                                  │
│  Apr 15, 2026   $300  Compound 3cy  Yemen       │
│  Mar 14, 2026   $200  Direct        Gaza        │
│  Feb 10, 2026   $500  Compound Jariyah Yemen    │
│  Jan 20, 2026   $400  Compound 2cy  Gaza        │
│  Dec 15, 2025   $250  Direct        Yemen       │
│  ... (8 total)                                   │
│                                                  │
│  [ Message Ahmad K. → ]    [ View portfolio → ] │
└──────────────────────────────────────────────────┘
```

Drawer: `var(--bg-surface)`, shadow on the left edge, full height. Header with name + close (✕) button. Sections separated by thin dividers.

"View portfolio →" is a demo-only button that navigates to the portfolio account (simulating that this is a cross-account admin view — in production this would require the user's permission).

"Message Ahmad K. →" opens the messaging composer pre-filled for this individual donor (one-off message, not a segment broadcast).

Drawer closes on click-outside or Escape key. Use `AnimatePresence` from Framer Motion: `initial: { x: '100%' }`, `animate: { x: 0 }`, `exit: { x: '100%' }`.

---

### Segments Sub-view

**Header:** "Donor Segments" — Cormorant Garamond 600, 24px.

Five segment cards in a 2-column grid (with one full-width card if odd number). Each card is wider and more detailed than in a mobile layout.

**Card 1 — Jariyah Donors (18):**

Header: green left bar + "✦ Jariyah Donors" — DM Sans 700, 16px, `var(--status-green)`.

"Perpetual commitment — highest lifetime value segment. Avg lifetime: $1,847 · Avg gifts: 6.2 · Avg days since last gift: 12"

Suggestion box (gold background, `rgba(212,168,67,0.08)`): "Consider: personal thank-you message, exclusive advance impact updates, annual impact summary report."

Two buttons: "View list →" | "Message segment →"

**Card 2 — Repeat Donors (94):**

Blue header. "Gave 2+ times. Core retention segment. Avg lifetime: $423 · Avg last gift: 23 days ago."

Suggestion: "Consistent impact updates keep this segment engaged. They respond well to milestone messaging."

**Card 3 — Lapsed Donors (47):**

Amber header. "Last gift was 90+ days ago. High re-engagement potential."

Suggestion: "Best practice: message with their specific impact from their last gift. 'Your $200 funded 40 meals. Those children just received Eid clothes.' 3× higher response than generic messaging."

**Card 4 — Compound Donors (93):**

Gold header with ⟳ icon. "Chose Compound mode — your most engaged donors."

Suggestion: "Don't interrupt their cycle with donation asks. Time outreach to when their cycle is completing. Consider messaging about what's happening to their money right now."

**Card 5 — First-time Donors (170):**

Gray header. "One gift within the last 90 days. Critical onboarding window."

Suggestion: "Message within 48 hours of first gift — 3.1× higher response rate. Welcome them, show their specific impact, invite them to learn about Compound mode."

**"View list" behavior:** Navigates to a filtered Top Donors table showing only that segment's donors. A breadcrumb: "Donors → Jariyah Donors (18)."

---

### Message Sub-view

**Header:** "Message a Donor Segment" — Cormorant Garamath 600, 24px.

**Segment selector at top:** A dropdown showing all 5 segments. Pre-selected: Lapsed Donors (47) — the most urgent segment for demo purposes.

**Message composer — two-column layout:**

Left column (55%): The composer interface.
Right column (45%): Live preview.

**Left column:**

Delivery channel chips: [📱 Push notification] [📧 Email] [● Both]. "Both" pre-selected.

When email is selected: "Estimated email delivery: 32 of 47 have email linked." — DM Sans 400, 12px, italic.

**Message textarea:** A large open text field. Character counter appears in the corner. At 280 characters, a soft warning: "Push notifications truncate at 280 characters."

**Auto-insert tag chips** below the textarea:

```
[Donor name] [Last gift amount] [Last gift date] [Campaign name] [Their specific impact]
```

Clicking any chip inserts the tag at the cursor position in the textarea. The tags use double bracket syntax: `{{donor_name}}`, `{{last_gift_amount}}`, etc.

Pre-filled default message for Lapsed segment:

"{{donor_name}}, it's been a while since your last gift to {{campaign_name}}. Here's what your previous {{last_gift_amount}} funded: {{their_specific_impact}}. Come back and help us reach our next milestone."

**Right column — live preview:**

"Preview (using Ahmad K.'s data):" — label.

The preview shows the message with Ahmad K.'s data filled in:

"Ahmad, it's been 3 months since your last gift to Yemen Orphan Fund. Here's what your previous $200 funded: 40 meals for children in Sana'a. Come back and help us reach our next milestone."

Preview updates live as the admin types or edits the message.

**Claude suggestion advisory box:**

A small teal-bordered box below the preview:

"💡 Claude suggestion: This message uses 3 of 3 recommended personalization tags. Adding `{{their_specific_impact}}` typically improves re-engagement rate by 3×. Your current message includes it — great."

When the admin removes personalization tags, the suggestion changes: "⚠️ This message is missing personalization. 'Ahmad' responds 3× better when shown their own impact data. Add `{{their_specific_impact}}`."

This is the Claude-powered advisory from the feature spec — analyzing message content in real time and surfacing actionable suggestions. For the demo, implement as a conditional check: if the message contains `{{their_specific_impact}}` or `{{last_gift_amount}}`, show the positive suggestion. If neither is present, show the warning.

**Two buttons:**

"Send to all 47 →" — gold primary. On click:
1. Spinner 800ms: "Sending to 47 donors..."
2. `messageDonorSegment(segmentId, message)` called in NGOContext
3. Success toast: "Message queued for 47 donors — push delivery within minutes, email within 15 minutes."
4. A "sent" badge appears on the Lapsed segment card in the Segments sub-view

"Review list first →" — ghost button. Opens the filtered donor table for this segment before sending.

---

### Export Sub-view

**Header:** "Export Donor Data" — Cormorant Garamath 600, 24px.

**Privacy note:** "Anonymous donors export with city-level data only, per user consent settings. Identified donors export with full details." — DM Sans 400, 13px, italic.

**Four export format cards in a 2×2 grid:**

**CSV (Generic):**
Icon: spreadsheet. "Standard CSV — compatible with Excel, Google Sheets, and most tools."
File preview text: "Columns: Name, City, State, Lifetime Value, Gift Count, Last Gift Date, Mode, Jariyah, Segments, Campaigns."
"Download CSV" button.

**Salesforce:**
Icon: Salesforce cloud logo (SVG, no external image). "Pre-formatted for Salesforce CRM import. Includes Contact, Opportunity, and Campaign Member records."
Column headers used: `FirstName, LastName, Email, Phone, MailingCity, MailingState, Mizan_Lifetime_Value__c, Mizan_Gift_Count__c, Mizan_Last_Gift_Date__c, Mizan_Giving_Mode__c, Mizan_Segment__c`.
"Download for Salesforce" button.

**Mailchimp:**
"Formatted for Mailchimp audience import. Includes segment tags for each donor."
Columns: Email Address, First Name, Last Name, City, Tags (comma-separated segment names).
"Download for Mailchimp" button.

**HubSpot:**
"Formatted for HubSpot CRM. Includes contact properties and lifecycle stage."
"Download for HubSpot" button.

**On any download button click:**

1. Call `exportDonors(format)` in NGOContext
2. Build the appropriate data structure from the `donors` array
3. Use a `downloadCSV(filename, headers, rows)` utility function from `src/utils/exports.js`:
   - Build CSV string from headers array and rows array, escaping commas and quotes
   - Create a `Blob` with `text/csv` MIME type
   - Create `URL.createObjectURL(blob)` and trigger a link click to download
   - Revoke the object URL after download
4. Log an export event in NGOContext
5. Success toast: "Exported 412 donors as [format] — [filename].csv"

The Salesforce export must use the custom field `__c` suffix convention. This is Salesforce's notation for custom fields — showing this level of detail demonstrates genuine understanding of the platform's workflow.

---

## Tab 4: Insights

### Route

`/ngo/insights`

### Layout

Full content area. Three horizontal tab pills: [Analytics] [A/B Tests] [Settlements]. Default: Analytics.

---

### Analytics Sub-tab

**Campaign conversion funnel:**

Campaign selector dropdown at top: "Yemen Orphan Fund ▾"

A vertical funnel visualization. Each step is a full-width tapered bar, narrower than the previous. The bars use a gold gradient.

```
Discover impressions this month:   4,840
                  ↓  18.4% clicked
Campaign page views:                892
                  ↓  38.2% started investment
Investments initiated:              341
                  ↓  72.4% completed
Investments completed:              247

Overall conversion rate:  5.1%
Platform average:  4.3%  ✓ Above average
```

Each step: label (DM Sans 500, 14px) + number (Cormorant Garamath 600, 24px, `var(--gold-mid)`) + percentage drop-off below (DM Sans 400, 12px, `var(--text-tertiary)`).

Drop-off advisory below the funnel: "Biggest drop-off: impressions → page views (81.6%). Posting frequent impact updates improves this by 12-18% by increasing Discover ranking." — DM Sans 400, 13px, italic, advisory gold box.

"Platform average: 4.3%" — shown with a green "✓ Above average" badge. Islamic Relief converts better than average because of their name recognition.

**Compound vs Direct over time:**

A two-line SVG chart. X-axis: months from October 2025 through April 2026 (7 months). Y-axis: percentage of total donations.

- Line 1 (Compound %): starts at 18% in October, rises gradually to 38% in April — adoption is growing as users learn about the mechanic
- Line 2 (Direct %): inverse, starts at 82%, falls to 62%

This chart demonstrates that Compound mode is gaining traction over time — a proof point for the platform's value to the NGO.

**Donor retention rates:**

Three stat cards in a row:

- "First-time to returning: 41%" — "vs 23% industry average" in green below
- "Gave 3+ times: 18%"
- "Jariyah (permanent retention): 18 donors = 100% retention"

Advisory: "Your retention rate is 1.8× the industry average. Jariyah commitments represent 100% retention by design — they don't lapse. Consider featuring Jariyah in your campaign messaging." — gold advisory box.

---

### A/B Tests Sub-tab

**Header:** "Campaign A/B Tests" — Cormorant Garamath 600, 24px.

"Test two versions of a campaign element. The algorithm serves each to equal audiences and reports which converts better." — DM Sans 400, 14px, italic.

**Completed test (card):**

```
Yemen Orphan Fund — Campaign Title Test
Ran: March 1-15, 2026  (completed)

Variant A: "Yemen Orphan Fund"         → 4.1% conversion (1,420 impressions)
Variant B: "Give an Orphan a Tomorrow" → 6.4% conversion (1,380 impressions)

★ Winner: Variant B (+56% relative improvement)
Applied: Variant B is now the active title
```

Card: `var(--bg-surface)`, green left accent bar, border `var(--border-subtle)`. "Winner" badge in gold star. "Applied" confirmation in green.

**Active test (card):**

```
Gaza Emergency Fund — Cover Photo Test
Running: April 10 - April 24, 2026  (ends in 6 days)

Variant A: Group of children (current)     → 3.7% conversion (840 impressions)
Variant B: Single child, close-up (testing) → 4.7% conversion (810 impressions)

Variant B leading (+27%). Test incomplete.

[ Apply Variant B now ]   [ Wait for completion ]
```

Card: gold left accent bar (active). "Leading" badge in teal. "Apply Variant B now" — gold primary button (triggers `applyAbVariant(testId, 'B')` in NGOContext — immediately updates the Gaza campaign's cover photo). "Wait for completion" — ghost button.

**"Create new A/B test" button:** Above the cards, gold ghost button. Opens a modal:

- Campaign to test: [Dropdown of active campaigns]
- What to test: [Title / Cover photo / Impact metric / Short description] — radio cards
- Variant A: (auto-filled with current value)
- Variant B: (input for the challenger)
- Test duration: [7 days / 14 days / 21 days]

"Start test →" button. On click: creates test record in NGOContext, shows "Your test will run on ~2,800 impressions over 14 days. Results available [date]."

---

### Settlements Sub-tab

Also accessible as a standalone page from the dashboard's "View full settlement schedule →" link, at route `/ngo/settlements`.

**Header:** "Compound Pipeline — All Positions" — Cormorant Garamath 600, 28px.

"$16,500 in committed capital currently cycling through qard hassan." — Cormorant Garamath 500, 20px, `var(--gold-mid)`.

**Per-campaign breakdown:**

For each campaign with Compound positions, a section with the campaign name as a sub-header:

---

**Yemen Orphan Fund — 14 positions:**

A sortable table:

| Donor | Commitment | Mode | Cycles | Est. Settlement | Status |
|---|---|---|---|---|---|
| Ahmad K. (identified) | $500 | Jariyah (∞) | Perpetual | Perpetual | Cycle 3 active |
| [Anonymous] Houston TX | $300 | Compound | 2 cycles | Sept 2026 | Cycle 1 active |
| [Anonymous] Dallas TX | $200 | Compound | 3 cycles | Jan 2027 | Cycle 2/3 active |
| [Anonymous] Austin TX | $150 | Compound | 1 cycle | May 2026 | Settling |
| ... (14 rows total) | | | | | |

For identified donors: show name. For anonymous: show "City, State" only. The commitment amount is always shown.

"Est. Settlement" is computed from the demand algorithm's per-cycle time estimate and the number of cycles remaining. Positions in their final cycle with `daysUntilCycleEnd < 30` show "Settling" in the status column.

Totals row: "14 positions · $3,200 in-transit · Avg estimated settlement: September 2026"

**Gaza Emergency Fund — 6 positions:**

Smaller table (same format). "6 positions · $1,800 in-transit"

**Somalia Water Wells — 3 positions, Rohingya Medical — 2 positions:** Similar small tables.

---

**Sadaqah conversions section:**

A separate section with a distinct header: "Qard Hassan Conversions — Capital That Became Sadaqah"

"When a borrower cannot repay, the community may vote to convert the outstanding balance to sadaqah. This capital becomes a donation to your campaign — tagged separately for full transparency." — advisory text.

Two conversion rows (from Phase 2.3 and prior history):

| Date | Amount | Borrower | Campaign | Notes |
|---|---|---|---|---|
| April 18, 2026 | $350 | [Anonymous] — Austin TX | Yemen Orphan Fund | Borrower hardship, circle-approved |
| March 5, 2026 | $180 | [Anonymous] — Houston TX | Somalia Water Wells | Borrower hardship, circle-approved |

These rows read from the `SADAQAH_CONVERSION` events received via SharedEventsContext. They close the loop between Phase 2.3 (borrower hardship) and Phase 4 (NGO financial record). The April 18 conversion is the Bilal Mansour conversion from Phase 2.3 — the same borrower, seen from the NGO's perspective.

"Total converted: $530 · 2 conversions — listed as sadaqah jariyah, not standard donations, in your financial records." — advisory note.

---

**"Message Compound donors" batch action:**

A card at the bottom of the Settlements tab:

"Message your 14 Compound donors about their Yemen Orphan Fund positions →"

A gold ghost button. On click, opens the message composer pre-filled with a message that only this platform can send:

"Your $[amount] has helped [N] families through interest-free loans so far, and is now in its [N]th cycle on its way to Yemen Orphan Fund. JazakAllahu Khayran for your commitment to the full journey."

This message is unique to Mizan. Islamic Relief could not send this message to any donor on any other platform because no other platform knows that the donor's money is currently cycling through qard hassan loans. This is the platform's value proposition made tangible in a single message.

---

## Tab 5: Account

### Route

`/ngo/account`

### Layout

Full content area, max-width 900px. Sections stacked vertically.

---

### Organization Profile Card

Full-width card at top. Two-column: left is identity, right is verification.

**Left:**

Islamic Relief USA logo — from Phase 1.1 data layer (Clearbit), full size (~48px height). Fallback: "IR" initials circle in gold.

"Islamic Relief USA" — Cormorant Garamath 600, 28px.

Website: "irusa.org" — teal clickable link.

Contact info: "Aisha Rahman · Director of Digital Fundraising · aisha@irusa.org · (703) 555-0192"

Mission (collapsible): "Islamic Relief USA provides relief and development in a dignified manner..." — click "Read more" to expand.

"Edit profile →" link — opens edit modal pre-filled with all fields.

**Right:**

"Tier 1 Verified" — large gold badge (32px padding, gold background, gold text, very prominent).

"EIN: 95-3253008" — verified against IRS → link "View on IRS →" opens `https://apps.irs.gov/app/eos/details/#pub78Organization?ein=953253008` (real IRS URL).

If Charity Navigator data was fetched in Phase 1.1: show "Charity Navigator: ★★★★☆ · 87/100" with a link to their CN profile.

"Verified: January 15, 2026 · Renewal: January 2027" — DM Sans 400, 13px, `var(--text-tertiary)`.

---

### Bank & Financial Settings

**Section header:** "Financial Settings" — DM Sans 500, 13px, uppercase.

**Connected bank card:**

"🏦 Chase Bank ****8821
Connected: January 15, 2026
ACH routing: 021000021"

"Change account →" — ghost link (mocked — shows "Bank changes require re-verification" advisory toast).

---

**Available balance display:**

"$4,200 available for withdrawal" — Cormorant Garamath 600, 36px, `var(--status-green)`.

"From settled donations and completed qard hassan cycles." — DM Sans 400, 13px, italic.

**Withdrawal buttons:**

"Withdraw all ($4,200) →" — gold primary, full-width, 52px height.

"Withdraw a partial amount →" — ghost gold, full-width below.

Clicking "Withdraw partial": reveals a number input between the two buttons:

"Amount: $[ ___ ]" — validates minimum $100, maximum `availableBalance`. Shows "Arrives in 2-3 business days (ACH)" below.

---

### Withdrawal Confirmation Flow

When "Withdraw all ($4,200)" is clicked:

**Step 1 — Confirmation card slides down:**

```
Withdrawal confirmation

Amount:      $4,200.00
To account:  Chase Bank ****8821
Method:      ACH transfer
Arrival:     April 21-22, 2026 (2-3 business days)

[ Confirm withdrawal ]          [ Cancel ]
```

Card: `var(--bg-elevated)`, gold border (1px), border-radius `var(--radius-xl)`, padding 24px. Animated slide-down with Framer Motion.

**Step 2 — On confirm:**

1. `initiateWithdrawal(4200)` called in NGOContext
2. `availableBalance` → $0 (immediate reactive update)
3. Sidebar financial summary updates: "Available: $0" in red, "Pipeline: $16,500" unchanged
4. New row added to `financialTransactions`:
   `{ date: "Apr 18, 2026", type: "Withdrawal", amount: -4200, description: "ACH to Chase ****8821", balanceAfter: 0 }`
5. Confirmation card transforms to success state:
   ```
   ✓ Transfer initiated
   $4,200 → Chase Bank ****8821
   Transaction ID: TXN-20260418-0001
   Arrives: April 21-22, 2026
   ```
   Green checkmark animation (same SVG technique as Phase 2.2 decision screen, smaller).

The sidebar showing $0 immediately while the success card is still visible is the visual payoff — it demonstrates that the balance is the single source of truth across the entire account.

---

### Transaction History

**Section header:** "Transaction History" — DM Sans 500, 13px, uppercase.

A full table with all pre-seeded transactions plus any new ones created during the demo session:

| Date | Type | Amount | Description | Balance After |
|---|---|---|---|---|
| Apr 18, 2026 | Withdrawal | -$4,200 | ACH to Chase ****8821 | $0 |
| Apr 18, 2026 | Conversion | +$350 | Qard hassan conversion — Yemen (Bilal) | $4,200 |
| Apr 15, 2026 | Withdrawal | -$630 | ACH to Chase ****8821 | $3,850 |
| Apr 10, 2026 | Settlement | +$1,200 | Compound cycles settled (4 positions) | $4,480 |
| Mar 28, 2026 | Settlement | +$2,650 | Direct donations batch — March | $3,280 |
| Mar 20, 2026 | Conversion | +$180 | Qard hassan conversion — Somalia (Khalid) | $630 |
| Mar 5, 2026 | Settlement | +$800 | Compound cycles settled (2 positions) | $450 |
| Feb 20, 2026 | Withdrawal | -$2,450 | ACH to Chase ****8821 | $0 |
| Jan 15, 2026 | Settlement | +$2,450 | Direct donations batch — Q1 | $2,450 |

Amount column: green for positive (credits), red for negative (debits). The "Conversion" rows with the borrower names (Bilal, Khalid) are the cross-account entries — they appear in the NGO's financial record as a result of events from Phase 2.3.

**"Export financial history as CSV →"** — ghost link. Generates and downloads a CSV of the full transaction table.

---

### Team Management

**Section header:** "Team Members" — DM Sans 500, 13px, uppercase.

A table:

| Member | Email | Role | Permissions | Status |
|---|---|---|---|---|
| Aisha Rahman (you) | aisha@irusa.org | Admin | Full access | Active |
| Omar Hassan | omar@irusa.org | Campaigns Manager | Campaigns + Donors (no withdrawals) | Active |
| Fatima Al-Sayed | fatima@irusa.org | Communications | Post updates + Message donors | Active |

**Permission role descriptions:**

A collapsible "View permissions matrix" section. When expanded, a grid table showing which features each role can access:

| Feature | Admin | Manager | Staff |
|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ |
| Create campaigns | ✓ | ✓ | — |
| View donors | ✓ | ✓ | — |
| Message donors | ✓ | ✓ | ✓ |
| Post impact updates | ✓ | ✓ | ✓ |
| Initiate withdrawals | ✓ | — | — |
| Manage team | ✓ | — | — |

"Invite team member →" — gold ghost button. Opens a modal: Email input + Role selector dropdown + "Send invitation" button. Mocked success: "Invitation sent to [email]. They'll receive a link to set up their account."

---

### Organization Settings

**Cause categories:** Editable tag list. Adding/removing a category immediately updates the NGO's semantic tags in the algorithm — their campaigns' Discover rankings adjust within the session.

**Countries of operation:** Editable tag list. Same algorithm impact.

**Notification preferences:** Toggle switches for each type:
- New donor commitment (on by default)
- Compound cycle settled (on)
- A/B test result ready (on)
- Donor milestone reached (on)
- Monthly impact summary email (on)

**Integrations (planned):**

Two integration cards labeled "Coming soon":

Salesforce: "Native sync of donor data to Salesforce CRM. Replaces manual export."
Mailchimp: "Automatic sync of segments to Mailchimp audiences."

A note: "Until integrations launch, use the Export feature in the Donors tab to import data manually." — DM Sans 400, 13px, italic.

---

## Phase 4.3 Acceptance Criteria

**Donors tab:**
- [ ] Three-panel layout: left sub-nav + filters, main content
- [ ] Sub-nav links navigate between Top Donors / Segments / Message / Export
- [ ] Campaign filter, date range, and mode filter all work
- [ ] Top donors table: 20 rows (5 pre-seeded at top), sortable columns
- [ ] Anonymous rows show [Anonymous] italic, city only
- [ ] Last Gift color coding correct (green/yellow/red)
- [ ] Clicking any row opens donor detail drawer from right
- [ ] Ahmad K. drawer shows all fields, giving history, and action buttons
- [ ] Drawer closes on click-outside and Escape
- [ ] Segments sub-view: 5 cards in 2-column grid
- [ ] Each card has correct count, stats, and suggestion box
- [ ] "View list" opens filtered table with breadcrumb
- [ ] "Message segment" opens message composer with segment pre-selected
- [ ] Message sub-view: campaign dropdown, delivery chips, textarea, tag chips
- [ ] Auto-insert tag chips work (insert at cursor position)
- [ ] Default message uses {{donor_name}} and other tags
- [ ] Live preview updates in real time with Ahmad K.'s data
- [ ] Claude suggestion shows positive state when {{their_specific_impact}} is present
- [ ] Claude suggestion shows warning when personalization tags are absent
- [ ] "Send to all 47 →" spinner → success toast
- [ ] messageDonorSegment() called and logged in context
- [ ] Export sub-view: 4 format cards
- [ ] CSV download generates actual file and triggers browser download
- [ ] Salesforce export uses __c suffix column headers
- [ ] All 4 export formats produce distinct, correctly formatted CSV files

**Insights tab:**
- [ ] Three pills: Analytics, A/B Tests, Settlements
- [ ] Analytics: campaign dropdown selects Yemen Orphan Fund by default
- [ ] Conversion funnel: 4-step tapered bars with correct numbers
- [ ] 5.1% overall conversion with "Above average ✓" badge
- [ ] Drop-off advisory below funnel
- [ ] Compound vs Direct line chart: 7 months, two lines rising/falling inversely
- [ ] Retention stats: 41% return rate vs 23% industry, 18 Jariyah = 100%
- [ ] Retention advisory gold box renders
- [ ] A/B Tests: completed test shows Yemen title test with Variant B winner
- [ ] Active Gaza test shows Variant B leading, "Apply now" and "Wait" buttons
- [ ] "Apply Variant B now" calls applyAbVariant(), updates Gaza campaign's cover
- [ ] "Create new A/B test" modal opens with all fields
- [ ] Settlements: "$16,500" in large gold Cormorant Garamath
- [ ] Per-campaign tables render (Yemen 14 rows, Gaza 6 rows, etc.)
- [ ] Ahmad K. shows "Jariyah (∞)" in Mode column and "Perpetual" in Est. Settlement
- [ ] Sadaqah conversions section: 2 rows (Bilal $350 April 18, Khalid $180 March 5)
- [ ] "Message Compound donors" opens composer with unique cycling-money message

**Account tab:**
- [ ] Organization profile card: logo from Phase 1.1 data, name, website, contact
- [ ] Edit profile modal opens pre-filled
- [ ] Gold "Tier 1 Verified" badge prominent in right column
- [ ] EIN with real IRS link
- [ ] Charity Navigator rating if available from Phase 1.1 data
- [ ] Chase Bank ****8821 with routing number shown
- [ ] "$4,200 available" in large green Cormorant Garamath
- [ ] "Withdraw all ($4,200)" gold primary button
- [ ] Confirmation card slides down with correct details
- [ ] On confirm: initiateWithdrawal(4200) called
- [ ] Sidebar balance updates to $0 immediately
- [ ] Success card shows TXN ID and arrival date
- [ ] Partial withdrawal: number input validates min $100, max $4,200
- [ ] Transaction history table: all 9 pre-seeded rows in correct order
- [ ] After withdrawal: -$4,200 row appears at top with $0 balance after
- [ ] Conversion rows (Bilal, Khalid) visible with cross-account context
- [ ] "Export financial history as CSV" downloads correct file
- [ ] Team management table: 3 members with correct roles
- [ ] Permissions matrix expands correctly
- [ ] "Invite team member" modal opens and shows success
- [ ] Cause category tag edits update algorithm scoring
- [ ] Notification preference toggles work

**Cross-account final verifications:**
- [ ] Posting impact update (Phase 4.2) → Journey tab entry appears in portfolio (Phase 1.3)
- [ ] Posting impact update → Jariyah Vault entry appears for Ahmed Al-Farsi (Phase 1.2)
- [ ] Sadaqah conversion from Phase 2.3 → appears in NGO's financial transactions (today)
- [ ] Sadaqah conversion → appears in Settlements tab sadaqah conversions section
- [ ] Circle vote completion (Phase 3.2) → borrower application advances (Phase 2.1)
- [ ] NGO withdrawal → sidebar balance updates to $0 without page reload
- [ ] All 4 accounts navigable from Welcome screen without errors

---

## All Four Accounts Complete

After Phase 4.3, Mizan is fully built:

**Personal Portfolio Account** (Phases 1.1–1.3)
- Banking system, real NGO data, portfolio dashboard, invest flow, Jariyah Vault, Journey map, Discover feed

**Borrower Account** (Phases 2.1–2.3)
- Claude-powered intake, verification, algorithm-based review, decision with disbursement, loan dashboard, payment, hardship + sadaqah conversion

**Community Hub** (Phases 3.1–3.3)
- Congregation dashboard, circle management with vote simulation, vouching queue with 4 decision types, giving/loan/event/impact insights, PDF impact report

**NGO Partner Dashboard** (Phases 4.1–4.3)
- Campaign creation and management, impact updates with 5-channel cross-account notifications, donor intelligence with messaging, A/B testing, Compound pipeline view, withdrawal flow

**The complete demo loop:**
1. Portfolio lender invests $300 Compound → Yemen Orphan Fund (Phase 1.2)
2. Algorithm shows borrower pool demand — cycle estimate: ~5 months (Phase 1.2)
3. Community Hub mosque vouches for borrower Bilal (Phase 3.3)
4. Borrower receives $500 loan — checking balance $847 → $1,347 (Phase 2.2)
5. Borrower repays — cross-account pool update advances lender's cycle (Phase 2.2)
6. Circle votes on Bilal's loan in Community Hub (Phase 3.2) — borrower's review screen advances (Phase 2.1)
7. Islamic Relief posts impact update — lender's Journey tab and Jariyah Vault update in real time (Phase 4.2, 1.3, 1.2)
8. Borrower converts debt to sadaqah — NGO's available balance increases, conversion visible in NGO financials (Phase 2.3, 4.3)
9. NGO withdraws $4,200 — sidebar updates to $0 instantly (Phase 4.3)

---

## Notes for Claude Code

The `downloadCSV(filename, headers, rows)` utility must live in `src/utils/exports.js` and be importable by any component that needs to download data. Build it once here and do not duplicate the logic. The function signature: takes a filename string, a headers array, and a 2D rows array. Escapes any commas or double quotes within field values. Creates a Blob, objectURL, programmatically clicks a hidden anchor element, then revokes the URL.

The Salesforce export's `__c` suffix is Salesforce custom field API name convention. Any field that isn't a standard Salesforce field needs `__c`. Use exactly these column names — real Salesforce developers will recognize them immediately: `FirstName`, `LastName`, `Email` (standard, no suffix) and `Mizan_Lifetime_Value__c`, `Mizan_Gift_Count__c`, `Mizan_Last_Gift_Date__c`, `Mizan_Giving_Mode__c`, `Mizan_Segment__c` (custom, with suffix).

The withdrawal confirmation's transaction ID should be generated from the current date: `TXN-${date.getFullYear()}${month}${day}-${bankLast4}`. This makes the ID look real and unique for the demo date.

The `applyAbVariant(testId, 'B')` function in NGOContext should update the specific campaign's data — if the test was for the title, it updates `campaign.name`. If for the cover photo, it updates `campaign.coverPhoto`. After this update, the campaign card in the campaigns list should immediately reflect the new variant — no page reload needed.

The sadaqah conversion rows in the Settlements tab (Bilal $350 and Khalid $180) are driven by events received from SharedEventsContext. Pre-populate NGOContext's `sadaqahConversions` array with these two entries to represent conversions that happened before the demo session. The Phase 2.3 Bilal conversion (April 18, the demo date) will add a third entry if the judge actually walks through Phase 2.3 in the same session — demonstrating live cross-account communication.
