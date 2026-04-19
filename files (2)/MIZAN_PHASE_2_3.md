# MIZAN — Phase 2.3: Hardship Handling, Loan History & Account Tab
## Build Document for Claude Code

---

## Prerequisites

Phase 2.1 and 2.2 must be complete. All intake, verification, decision, loan dashboard, and payment screens must be working with real money simulation. Phase 2.3 completes the borrower account with hardship handling (including the sadaqah conversion money flow), loan history, and the account management tab.

---

## Phase 2.3 Scope

1. **Page 7: Hardship & Default Handling** — All three hardship paths, with the sadaqah conversion path triggering a real money flow event across accounts
2. **Page 8: Loan History & Reputation Building** — Full loan history with community trust level
3. **Account Tab** — Profile, verification status, trust level, mosque affiliation, support

After Phase 2.3, the Borrower Account is feature-complete.

---

## The Sadaqah Conversion Money Flow

The conversion-to-sadaqah path (Page 7, Path C) is the most technically interesting feature in Phase 2.3 because it triggers a cross-account money event: the borrower's outstanding loan balance converts to a donation that appears in the lender's portfolio.

When conversion is confirmed:

1. `initiateConversion()` is called in BorrowerContext
2. The outstanding balance ($350 remaining on the demo loan) is removed from the borrower's loan — their debt is cleared
3. A `loan_converted` transaction is logged in the borrower's ledger: "Outstanding balance of $350 converted to sadaqah — Yemen Orphan Fund"
4. In the lending pool, $350 of capital is marked as "converted to sadaqah" rather than "defaulted"
5. That $350 flows to the destination cause that the original lenders selected when they made their compound investment — in the demo, this is "Yemen Orphan Fund" (Islamic Relief USA)
6. In PortfolioContext, the lender's position card for the position that funded this loan is updated: status changes to "Cycle converted to sadaqah — Yemen Orphan Fund received $350"
7. The Jariyah Vault (if the lender tagged this position to Ahmed Al-Farsi) gets a new entry: "Your father's sadaqah received an unexpected addition — a borrower's hardship was converted to $350 of sadaqah for Yemen Orphan Fund"

This cross-account update is what makes the conversion beautiful rather than tragic. The borrower's burden becomes the lender's blessing, and both parties see it simultaneously.

For the demo, the cross-account update is visible: if the judge has the Portfolio account open in another tab and switches to it after a conversion, they'll see the updated position card. This is achievable by having both contexts read from the same shared `PoolContext`.

---

## BorrowerContext Additions for Phase 2.3

Add to BorrowerContext:

**Hardship state:**
- `hardshipPath` — null | 'extension' | 'restructure' | 'conversion'
- `extensionGranted` — bool, true after a successful extension request
- `conversionPending` — bool, true while circle vote is in progress
- `conversionConfirmed` — bool, true after conversion is finalized

**Hardship operations:**
- `requestExtension(newDate)` — updates the loan schedule's next due date, sets `extensionGranted: true`, logs restructuring event
- `requestRestructure(reason, newPlan)` — updates monthly payment and schedule, logs restructuring event
- `initiateConversion()` — starts the conversion process, sets `conversionPending: true`
- `confirmConversion()` — finalizes conversion, clears loan, triggers cross-account sadaqah flow, logs conversion transaction

---

## Page 7: Hardship & Default Handling

### Route structure

`/borrower/hardship` — Main entry screen (which path do you need?)
`/borrower/hardship/extension` — Path A: Need more time
`/borrower/hardship/restructure` — Path B: Situation changed
`/borrower/hardship/conversion` — Path C: Convert to sadaqah
`/borrower/hardship/success` — Shared success screen for all paths

### Layout

All hardship screens use the full content area with max-width 680px, centered, generous vertical padding. No cluttered grids — these are conversations, not dashboards.

### Main Entry Screen (`/borrower/hardship`)

**Design philosophy:** This is the most important design decision in the borrower account. The opening tone must be disarming — the opposite of a debt collection notice.

**Header section:**

"We're here to help, not to collect." — Cormorant Garamond 600, 36px, `var(--text-primary)`.

"Whatever you're going through, we want to find a solution before anything escalates." — DM Sans 400, 16px, italic, `var(--text-secondary)`, line-height 1.7.

A thin teal divider (60px, centered), margin 24px auto.

"Islam forbids adding hardship to the one already in hardship. We take that seriously." — DM Sans 400, 15px, italic, `var(--text-secondary)`, centered.

**Path selection label:**

"Tell us what's going on:" — DM Sans 500, 13px, `var(--text-tertiary)`, letter-spacing 0.06em, uppercase, margin-top 32px, margin-bottom 16px.

**Three path cards:**

Each card is a large, tappable card with generous padding. Stacked vertically with 12px gap. Max-width 560px, centered.

**Card A — Need more time:**

Left icon: `Clock` (24px) in a 48px teal circle background.
Title: "I need more time this month" — Cormorant Garamond 500, 22px, `var(--text-primary)`.
Description: "We'll automatically extend your payment by 30 days — no questions asked for a first-time request." — DM Sans 400, 14px, `var(--text-secondary)`.

Card styling: `var(--bg-surface)`, border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 24px, `whileTap={{ scale: 0.98 }}`.
On hover: border color lifts to `var(--teal-mid)` at 30% opacity. Left border accent (3px, `var(--teal-mid)`) appears on hover.

**Card B — Situation changed:**

Left icon: `FileText` (24px) in a 48px teal circle.
Title: "My situation has changed significantly" — same styling.
Description: "Job loss, medical emergency, family crisis. We'll work together to restructure your plan."

**Card C — Convert to sadaqah:**

Left icon: `Heart` (24px) in a 48px circle with subtle green background (`rgba(74, 222, 128, 0.15)`).
Title: "I need to discuss converting to sadaqah" — same styling.
Description: "If repayment is truly not possible, the Quran provides for this. We'll guide you through it."

Card styling: same as Cards A/B but with a very subtle green border tint: `border: 1px solid rgba(74, 222, 128, 0.20)` and background `rgba(74, 222, 128, 0.02)`. This card is slightly different — it should feel like a sacred option, not a shame option.

**Card D — Something else:**

Not a full card — just a text link below the three cards: "Something else →" — DM Sans 400, 14px, `var(--teal-mid)`. Opens a dialog with a text area and "Send message" button (mocked success state).

---

### Path A: Extension (`/borrower/hardship/extension`)

**Header:** "Take the time you need." — Cormorant Garamond 600, 34px.

"First-time extension requests are automatically approved — no questions asked." — DM Sans 400, 16px, italic, `var(--text-secondary)`.

**Current payment display:**

"Your current due date:" — small label
"May 18, 2026 · $100" — DM Sans 500, 18px, `var(--text-primary)`

**New date selection:**

"Choose your new payment date:" — label.

Three chips: "In 2 weeks" / "In 3 weeks" / "In 30 days ●" (default: 30 days).

Below chips: "New due date: June 17, 2026" — computed dynamically from the selection. DM Sans 400, 14px, `var(--text-secondary)`.

**Circle notification note:**

A small info card: "ⓘ Your circle will be notified that a member has requested a brief extension. No personal details or amounts are shared." — DM Sans 400, 13px, `var(--text-secondary)`, italic.

**Confirm button:**

Full-width teal: "Extend to June 17, 2026 →" (date updates with chip selection)

On click:
1. Call `requestExtension(newDate)` in BorrowerContext
2. The loan schedule's May 18 row changes from 'due' to 'extended' with the new date
3. Navigate to `/borrower/hardship/success?path=extension`

---

### Path B: Restructure (`/borrower/hardship/restructure`)

**Header:** "Let's figure this out together." — Cormorant Garamond 600, 34px.

"Whatever changed, we'd rather find a solution than leave you struggling." — DM Sans 400, 16px, italic.

**Reason selection:**

"What changed?" — label.

Four selectable cards (same card styling as path selection but smaller):
1. "Job loss / income reduction" — `TrendingDown` icon in red circle
2. "Medical emergency" — `Heart` icon in yellow circle
3. "Family crisis" — `Users` icon in teal circle
4. "Other" — `MoreHorizontal` icon in gray circle

When a card is selected (teal left accent, teal border), a text area expands below it: "Tell us a little more (optional)" — warm open-ended prompt.

**Restructuring options:**

"What would help most?" — label below the reason selection.

Two option cards:
1. "Extend my repayment window" — "Give me more months to pay, keeping payments similar"
2. "Reduce my monthly payments" — "Lower each payment, spread over more months"

When either option is selected, show a computed preview card:

"New plan: $350 remaining ÷ 8 months = $44/month · Starting June 18, 2026"

This preview uses the actual remaining balance from `activeLoan.remaining` ($350 for the demo). DM Sans 500, 14px, `var(--text-primary)`.

**Submit button:**

Full-width teal: "Submit restructuring request →"

On click:
1. Call `requestRestructure(reason, newPlan)` in BorrowerContext
2. The loan schedule is regenerated with the new plan (8 monthly payments of $44)
3. Navigate to `/borrower/hardship/success?path=restructure`

---

### Path C: Convert to Sadaqah (`/borrower/hardship/conversion`)

**Design philosophy:** This is the most theologically profound screen in the entire application. The visual design must match the gravity of this moment. Generous whitespace. Large, centered text. The Quran verse is not a decoration — it is the theological and legal basis for the entire mechanism.

**No header card, no icon.** Just text, breathing.

**Opening (centered, max-width 560px, margin 0 auto):**

"The Quran has provided for this moment." — Cormorant Garamond 600, 36px, `var(--text-primary)`, centered.

A thin gold divider (not teal — this moment transcends the borrower/lender divide and enters the realm of akhirah), 60px, centered, margin 24px auto.

Then the Quran verse, in full:

"If the debtor is in difficulty, grant him time until it is easy for him; and if you remit it as charity, that is better for you, if you only knew."

— Quran 2:280

Cormorant Garamond 400, 22px, italic, `var(--text-secondary)`, line-height 1.8, centered, max-width 520px, margin 0 auto. The citation on the next line in DM Sans 400, 13px, `var(--text-tertiary)`.

**What conversion means (card, margin-top 32px):**

A card with a gold border (not teal — the gold signals this is an akhirah action):

"What happens when you convert:" — DM Sans 500, 12px, `var(--text-tertiary)`, uppercase, letter-spacing 0.06em.

"The $[remaining] remaining on your loan will be forgiven — and converted to sadaqah for [destinationCause], the cause your lenders chose when they committed their money." — DM Sans 400, 15px, `var(--text-secondary)`, line-height 1.7.

The `remaining` and `destinationCause` values are read from `activeLoan` in BorrowerContext. For the demo: $350 remaining, Yemen Orphan Fund.

Below, on their own lines:

"You are not in debt." — DM Sans 700, 16px, `var(--text-primary)`.
"This is between you and Allah." — DM Sans 400, 16px, italic, `var(--text-secondary)`.

These two lines deserve visual breathing room — 12px between them and 20px above/below.

**Conversion detail card:**

A second card showing exactly what flows where:

Outstanding balance: $350
↓ converts to
Sadaqah to: Yemen Orphan Fund (Islamic Relief USA)
Amount: $350
From: Your lenders — who pre-agreed to this possibility

A thin horizontal divider with an arrow → symbol in the middle, separating "Outstanding balance" from "converts to." The arrow is `var(--gold-mid)` — again, the gold accent for this akhirah-tier action.

Below the detail: "The lenders' portfolios will show this as 'Circle-converted sadaqah jariyah.'" — DM Sans 400, 13px, italic, `var(--text-tertiary)`.

**Circle vote notice:**

A small info card: "ⓘ This conversion requires your circle to vote. Most conversions are approved within 24 hours. Your circle will not know your reason unless you choose to share it." — DM Sans 400, 13px, italic.

**Two CTAs:**

"Request conversion →" — a GOLD primary button (not teal). The only gold button in the entire borrower account. This is intentional: the conversion to sadaqah is an akhirah action that uses the same gold language as the investor's portfolio. The borrower is now, in this moment, also a giver.

"I'm not ready yet — go back" — ghost teal button below.

**On "Request conversion" click:**

1. Call `initiateConversion()` in BorrowerContext
2. `conversionPending = true`
3. The cross-account money flow fires:
   - Outstanding balance ($350) cleared from the loan
   - $350 marked as sadaqah in the lending pool
   - PortfolioContext position card updated with "Cycle converted to sadaqah" status
   - Jariyah Vault (if applicable) gets new entry
   - `loan_converted` transaction logged: "Outstanding balance of $350 converted to sadaqah — Yemen Orphan Fund"
4. Navigate to `/borrower/hardship/success?path=conversion`

---

### Shared Success Screen (`/borrower/hardship/success`)

Read the `path` query parameter to determine which content to show.

**All paths share:**

A large animated checkmark in the path's accent color (teal for Extension and Restructure, gold for Conversion). Same SVG animation as the Approved decision screen.

The checkmark scale is slightly smaller (44px) and the animation is gentler (scale 1 → 1.06 → 1) — this is not a celebration, it is a resolution.

**Extension path content:**

"Your payment has been extended." — Cormorant Garamond 600, 32px.

"New payment date: June 17, 2026 | Amount: $100" — DM Sans 400, 16px.

"The extension is complete. Your circle has been notified — no personal details were shared."

Hadith: "Allah is gentle and loves gentleness in all matters." — Bukhari. Cormorant Garamond 400, 18px, italic.

**Restructure path content:**

"Your request has been submitted." — Cormorant Garamond 600, 32px.

"Your circle admin has been notified and will review within 24 hours. You'll receive a notification when the new plan is confirmed."

Hadith: "Make things easy and do not make them difficult." — Bukhari. Cormorant Garamond 400, 18px, italic.

**Conversion path content:**

"Your conversion has been submitted." — Cormorant Garamond 600, 32px, gold color (not teal — this is the akhirah register).

"Your circle will vote within 24 hours. When approved, the $350 remaining will become sadaqah for Yemen Orphan Fund — a good deed that continues."

The Quran verse again: "And if you remit it as charity, that is better for you." — Quran 2:280. Cormorant Garamond 400, 18px, italic.

"You leave this account free of debt and, through this act, a giver." — DM Sans 400, 14px, italic, `var(--text-secondary)`.

This last line is the most important sentence in the conversion success screen. The borrower entered this process as someone who needed help. They leave it as someone who gave. The framing honors that.

**All paths:** A "Return to my loan →" teal button at the bottom. Navigates to `/borrower/loan`.

---

## Page 8: Loan History

### Route

`/borrower/history`

### Layout

Content area, max-width 800px. A two-panel layout on desktop: main content (65%) and a sidebar panel (35%).

### Trust level section (main content, top)

A full-width card at the top:

**Left side:** "Community Trust Level" — DM Sans 500, 13px, `var(--text-secondary)`, uppercase.

Four filled stars + one empty star — rendered as Unicode ★★★★☆. Star size 28px. Stars in `var(--gold-mid)` (filled) and `var(--text-tertiary)` (empty). The gold color for stars is appropriate here — trust is an akhirah metric, not a borrower metric, so it uses the portfolio's gold language.

"Strong" — DM Sans 500, 16px, `var(--text-primary)`, below the stars.

**Right side:** A donut chart (SVG) showing repayment success rate. For the demo: 100% of past loans paid in full. The donut is teal with a `var(--status-green)` fill. Below the donut: "3 of 3 loans repaid on time."

**Full-width below the left/right:** 

"Repayment history improves your priority score for future loan requests." — DM Sans 400, 14px, `var(--text-secondary)`.

The hadith: "The best of you are those who are best in repaying debts." — Bukhari. Cormorant Garamond 400, 18px, italic, `var(--text-secondary)`.

### Loan history list

"Past Loans" — DM Sans 500, 13px, `var(--text-tertiary)`, uppercase, label.

**Current loan row (first, at top):**

```
🔄  April 2026 · $500 · Standard Tier
    In progress · $400 remaining
    1 of 5 payments made
```

Teal left accent bar. "In progress" badge in teal.

**Past loan rows (from mock history):**

Row 1: March 2025
```
✓  March 2025 · $300 · Standard Tier
   Paid in full · 4.5 months
   "Paid 0.5 months early"
```
Green checkmark. Green "Paid in full" badge.

Row 2: October 2024
```
✓  October 2024 · $200 · Micro Tier
   Paid in full · 2.1 months
   "Paid on time"
```
Green checkmark. Green badge.

Each row: `var(--bg-surface)`, border `var(--border-subtle)`, border-radius `var(--radius-lg)`, padding 16px 20px, margin-bottom 8px. The checkmark icon is `CheckCircle2` from Lucide (18px, `var(--status-green)`).

**Empty state (if no history):**

If both `loanHistory` is empty and `activeLoan` is null: "No loan history yet. When you repay a qard hassan loan, it appears here — a record of the trust the community placed in you, and how you honored it." — centered, DM Sans 400, 14px, italic, `var(--text-secondary)`.

### Right sidebar panel

A "Loan Stats" card showing aggregate numbers:
- Total borrowed: $1,000 (sum of all loans including current)
- Total repaid: $600 (from past loans + $100 first payment of current)
- Total sadaqah generated: $0 (none converted yet) or $350 (after conversion demo)
- Average repayment time: 3.3 months

These numbers are computed from the context data, not hardcoded.

Below: a "Apply for another loan →" button (teal ghost). For the demo, this navigates to `/borrower/intake` if there's no active loan, or shows a "You have an active loan — applications are paused until it's repaid" message if there is one.

---

## Account Tab

### Route

`/borrower/account`

### Layout

Content area, max-width 800px. Sections stacked vertically.

### Profile card

Full-width card at the top. Teal radial glow at the card top-left.

Left: Avatar circle (64px × 64px, teal background, white initials "OA" or user's real initials in Cormorant Garamond 600, 26px).

Right of avatar: Name ("Omar Al-Rashid"), "Borrower Account", and below: "UT Austin MSA · Member 2+ years."

Verification badges below the info: "📱 Phone verified" (teal pill) and "🏛️ Mosque vouched" (teal pill). These read from the application data.

A "Switch account" link on the far right of the profile card: returns to the Welcome screen.

### Settings sections

Stacked list sections with category headers.

**Loan & Status:**
- Community Trust Level → links to `/borrower/history`
- Loan History → links to `/borrower/history`
- Active Application → links to `/borrower/review` or `/borrower/loan`

Each row: label left, a brief value or status right, `ChevronRight` icon.

**Verification:**
- Identity: "✓ Verified" (from Phase 2.1 verification)
- Phone: "✓ ****0192" (last 4 of phone entered)
- Community Vouch: "✓ UT Austin MSA · Sheikh Abdullah"

**Mosque:**
- Your Mosque: "UT Austin MSA" → (shows mosque details on click — basic info card)
- Qard Hassan Circles: "1 active circle" → (shows circle membership info)

**Privacy & Support:**

A "Support" card (more prominent than a row): "Need help? Our team is here — whether it's about your loan, your application, or anything else." + "Contact us" ghost button (opens the contact dialog from Phase 2.2).

Privacy row: "Privacy Policy" + "Data & Security" links (external links to placeholder pages).

"Delete my account" — in `var(--status-red)` text, bottom of the section. On click: a confirmation dialog. For demo: shows "Account deletion request received" success state (no actual deletion).

### Transaction ledger

Below the main settings section: a collapsible "Transaction History" section. When expanded, shows the borrower's full transaction table — same format as the Portfolio transactions page but for the borrower's account:

| Date | Type | Amount | Description | Balance |
|---|---|---|---|---|
| April 18, 2026 | Loan disbursement | +$500 | Qard hassan loan approved | $1,347 |
| April 18, 2026 | Repayment | -$100 | Monthly repayment #1 | $1,247 |

The transaction history reads from `borrowerTransactions` in BorrowerContext and is paginated (10 rows per page).

### Reapply section

Shown when `activeLoan === null` (no active loan):

"Ready to apply for another loan?" — Cormorant Garamond 500, 24px.

"Your community trust level of 4 stars gives you priority consideration for future applications."

"Apply for Qard Hassan →" — teal primary button. On click: reset `applicationStage` to `'pre_application'` and navigate to `/borrower/intake`.

---

## Phase 2.3 Acceptance Criteria

**Hardship entry screen:**
- [ ] "We're here to help" header in Cormorant Garamond
- [ ] Teal divider and Islamic quote render correctly
- [ ] Three path cards render with correct icons and descriptions
- [ ] Card C has subtle green tint different from A and B
- [ ] Card D "Something else" opens contact dialog
- [ ] All path cards navigate to correct sub-routes

**Extension path:**
- [ ] Header "Take the time you need" renders
- [ ] Current due date shown from activeLoan data
- [ ] Three date chips work, computed new date updates dynamically
- [ ] Circle notification info card renders
- [ ] Confirm button calls requestExtension with computed date
- [ ] Schedule updates after extension (May date shifts to June 17)
- [ ] Navigates to success screen with extension content

**Restructure path:**
- [ ] "Let's figure this out together" header renders
- [ ] Four reason cards render, selection shows text area
- [ ] Two restructuring option cards render
- [ ] Selecting an option shows computed new payment plan
- [ ] Plan uses real activeLoan.remaining in calculation
- [ ] Submit navigates to success with restructure content

**Conversion path:**
- [ ] "The Quran has provided for this moment" in Cormorant Garamond
- [ ] GOLD divider (not teal) between header and verse
- [ ] Quran 2:280 renders in full in Cormorant Garamond italic
- [ ] Conversion detail card shows correct remaining amount and destination cause
- [ ] Outstanding amount reads from activeLoan.remaining ($350)
- [ ] Destination cause reads from activeLoan.destinationCause
- [ ] "You are not in debt." renders in DM Sans 700
- [ ] Circle vote notice renders
- [ ] "Request conversion" button is GOLD (not teal)
- [ ] On click: initiateConversion() called
- [ ] Loan balance cleared from BorrowerContext
- [ ] loan_converted transaction logged with correct amount
- [ ] Cross-account: PortfolioContext position card updated
- [ ] Cross-account: Jariyah Vault (if applicable) gets new entry
- [ ] Checking balance does NOT change (debt forgiven, not paid)
- [ ] Navigates to success with conversion content
- [ ] Success screen uses gold color for "Your conversion has been submitted"
- [ ] "You leave this account free of debt and, through this act, a giver" renders

**Success screen:**
- [ ] Animated SVG checkmark appears for all three paths
- [ ] Extension: teal checkmark, extension-specific content, Bukhari quote
- [ ] Restructure: teal checkmark, restructure-specific content, Bukhari quote
- [ ] Conversion: gold checkmark, conversion-specific content, Quran 2:280 quote
- [ ] "Return to my loan" navigates to /borrower/loan

**Loan history:**
- [ ] Two-panel layout on desktop
- [ ] Trust level card shows 4 stars in gold color
- [ ] Donut chart shows repayment success rate
- [ ] Hadith "Best of you are those who are best in repaying debts" renders
- [ ] Current loan shown at top with teal accent and "in progress" badge
- [ ] 2 past loans render with green checkmarks and "paid in full" badges
- [ ] Loan stats sidebar shows computed aggregate numbers
- [ ] "Apply for another loan" shows correctly based on activeLoan state

**Account tab:**
- [ ] Profile card renders with teal avatar and correct user info
- [ ] Mosque name and tenure from submittedApplication shown
- [ ] Phone and mosque verification badges shown
- [ ] All settings sections render with correct data
- [ ] Support card renders with "Contact us" button
- [ ] Transaction history section is collapsible
- [ ] Borrower transactions table shows disbursement and repayment rows
- [ ] Reapply section shown when no active loan
- [ ] Delete account confirmation dialog works (success state, no actual deletion)

**Phase 2 complete verification:**
- [ ] Full demo flow: Review → [Simulate vouch] → Decision/Approved → [Link bank] → balance $847→$1,347 → Loan Dashboard → [Pay Now] → Payment screen → [Confirm $100] → balance $1,347→$1,247 → Dashboard shows updated schedule → [Having trouble?] → Hardship entry → [Conversion path] → $350 cleared → cross-account update in PortfolioContext → Jariyah Vault entry → Success screen → Loan History shows converted loan → Account tab shows trust level

---

## Borrower Account Complete

After Phase 2.3:

- **Page 1** ✓ Natural Language Intake + Claude extraction (2.1)
- **Page 2** ✓ Verification — identity, vouch, repayment proposal (2.1)
- **Page 3** ✓ Application Review — step tracker + demo simulator (2.1)
- **Page 4** ✓ Decision — Approved (with disbursement), Reduced, Denied (2.2)
- **Page 5** ✓ Active Loan Dashboard with repayment schedule + Journey section (2.2)
- **Page 6** ✓ Make a Payment — real balance deduction, Barakah card, JazakAllahu Khayran (2.2)
- **Page 7** ✓ Hardship — Extension, Restructure, Conversion with cross-account sadaqah flow (2.3)
- **Page 8** ✓ Loan History with trust level and stats (2.3)
- **Account Tab** ✓ Profile, verification, transaction history, support (2.3)

---

## Notes for Claude Code

The sadaqah conversion cross-account update is the most architecturally complex event in the entire application. The cleanest implementation: maintain a `SharedEventsContext` (or `PoolContext`) that both BorrowerContext and PortfolioContext subscribe to. When BorrowerContext calls `initiateConversion()`, it publishes a `SADAQAH_CONVERSION` event to SharedEventsContext with `{ amount: 350, destinationCause: 'Yemen Orphan Fund', positionId: 'pos-001' }`. PortfolioContext has a `useEffect` listening for events from SharedEventsContext — when it receives `SADAQAH_CONVERSION`, it finds the relevant position and updates its status. This publish-subscribe pattern keeps the contexts decoupled while enabling cross-account communication.

The gold button for the conversion path is the only gold button in the entire borrower account. Every other interactive element is teal. The gold signals the akhirah register — this action belongs to the world of the portfolio, the world of giving and akhirah, not the world of debt. Do not accidentally apply gold to any other borrower account button.

The Quran 2:280 verse must be exact: "If the debtor is in difficulty, grant him time until it is easy for him; and if you remit it as charity, that is better for you, if you only knew." Do not paraphrase or shorten.

The "You leave this account free of debt and, through this act, a giver." line on the conversion success screen is the single most important sentence in the borrower account. It reframes the entire borrower experience — the person who came to borrow leaves as a giver. This reframe is theologically accurate (their debt forgiveness generates sadaqah) and psychologically important (removing any shame from the conversion). Give this line visual space — at least 24px margin above and below, and render it in a slightly larger font (DM Sans 400, 16px) than the surrounding text.

The reapply flow on the Account tab must check whether an active loan exists before navigating to intake. If `activeLoan !== null`, show an inline message rather than navigating: "You currently have an active loan. You can apply for a new loan after your current loan is repaid or converted." This prevents a confusing state where a borrower has two simultaneous active loans.
