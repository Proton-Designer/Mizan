# MIZAN — Phase 2.2: Decision Screen, Active Loan Dashboard & Payment
## Build Document for Claude Code

---

## Prerequisites

Phase 2.1 must be complete. BorrowerContext, all intake and verification screens, and the application review screen must work. Phase 2.2 builds on existing context state and routing.

---

## Phase 2.2 Scope

1. **Page 4: Decision Screen** — All three outcomes (Approved, Reduced, Denied) with full detail and simulated money flow
2. **Page 5: Active Loan Dashboard** — The borrower's home screen post-approval with loan hero, repayment schedule, and the "Journey of Your Loan" section
3. **Page 6: Make a Payment** — Full payment screen with real balance deductions, partial payment support, and the "Having trouble?" entry point

---

## Simulated Money at the Decision Moment

The decision screen is where simulated money first moves in the borrower account. Understanding the money flow here is critical for building it correctly.

### Approved flow

When the decision is Approved and the borrower taps "Link bank account to receive funds":

1. `receiveDisbursement(500)` is called in BorrowerContext
2. The borrower's checking balance goes from $847 → $1,347
3. A `loan_disbursement` transaction is logged: "Qard hassan loan disbursement — $500"
4. The shared pool's available capital decreases by $500 (borrowed from lender commitments)
5. The confirmation shows: "Deposited to University Credit Union ****9273 — $500"
6. `applicationStage` is set to `'active_loan'`
7. The sidebar immediately updates to show the new checking balance

This happens instantly in the demo — no delay needed. The visual effect of the number changing in the sidebar is the payoff.

### Reduced flow

When the borrower accepts the reduced amount ($350):

Same as Approved but with `receiveDisbursement(350)`. Checking balance goes $847 → $1,197.

### Denied flow

No money moves. The denied screen routes the user to external resources. No balance changes.

---

## Page 4: Decision Screen

### Route

`/borrower/decision`

The Decision screen reads `decisionOutcome` from BorrowerContext and renders one of three outcome components. The screen shares the sidebar layout but the content area is centered (max-width 680px) with generous vertical padding — this moment deserves space.

### Outcome A: Approved

**Visual design philosophy:** Relief. The moment of approval should feel like a burden lifting. The word "Alhamdulillah" does more work than any animation could.

**Header section:**

A full-width tinted hero card at the top of the content area. Background: `var(--bg-surface)` with a radial teal glow from the center-top (same radial gradient technique used in Phase 1's reflection overlay, but teal instead of gold). No border — the glow defines the boundary.

Centered within this card:

An animated SVG checkmark: a circle that draws itself (stroke-dasharray / stroke-dashoffset animation, 600ms) followed by a checkmark path drawing in (400ms, 200ms delay). Circle stroke: `var(--teal-mid)`. Checkmark stroke: white. After completion, a brief pulse scale(1 → 1.08 → 1) with a spring easing.

Below the checkmark (fades in after the animation completes, 400ms delay):
"Alhamdulillah — you've been approved." — Cormorant Garamond 600, 38px, `var(--text-primary)`, centered.

**Loan details card:**

A card with teal left accent bar. Two-column grid of label/value pairs:

Left column:
- Loan amount: $500
- Tier: Standard (with TierBadge)
- Repayment window: 5 months
- Monthly payment: $100/month

Right column:
- Interest: $0.00 — this is qard hassan (the "$0.00" in `var(--status-green)`, "this is qard hassan" in `var(--text-tertiary)` italic)
- Pool status: Funds available now ✓ (green)
- Disbursement: Within 24 hours

The layout is clean and table-like — all information visible at a glance without scrolling.

**Repayment schedule:**

A compact schedule table with 5 rows:
- Date | Amount | Status
- April 18, 2026 | $100 | — (shown for reference)
- May 18, 2026 | $100 | ⏳ Next payment
- June 18, 2026 | $100 | Upcoming
- July 18, 2026 | $100 | Upcoming
- Aug 18, 2026 | $100 | Upcoming

Footer: "Total: $500 | No interest | No fees. Ever." — The word "Ever." in `var(--status-green)` DM Sans 700.

**The Hadith:**

Centered below the schedule, in a visually distinct treatment:
"Whoever relieves a Muslim of hardship, Allah will relieve him of hardship on the Day of Judgment."
— Sahih Muslim

Cormorant Garamond 400, 20px, italic, `var(--text-secondary)`, line-height 1.7, max-width 480px, centered. Citation in DM Sans 400, 13px, `var(--text-tertiary)`.

**CTA — Link bank account:**

A full-width teal primary button: "Link bank account to receive funds →"

On click:
1. Show a brief "Connecting..." loading state on the button (700ms)
2. Show a success state: button turns green, text changes to "✓ University Credit Union ****9273 connected"
3. After 500ms: a success card slides down below the button
4. The success card shows: "💰 $500 deposited to your account" and "University Credit Union ****9273 — Balance: $1,347"
5. Call `receiveDisbursement(500)` — checking balance updates in sidebar instantly
6. A teal "Enter my loan dashboard →" button appears within the success card
7. Clicking this sets `applicationStage = 'active_loan'` and navigates to `/borrower/loan`

The sidebar's checking balance update happening in real time while the user is looking at the success card is a key moment — it makes the simulation feel real.

---

### Outcome B: Reduced Amount

**Header:**

A warm, non-rejection header. No checkmark animation (not a full approval). Instead, a handshake or heart icon in teal (40px).

"We can help — with a small adjustment." — Cormorant Garamond 600, 36px, centered.

**Comparison card:**

A card showing the adjustment clearly:

Left side: "You requested: $500" — smaller text, `var(--text-secondary)`, crossed-out amount visual (or lighter).
Right side: "We can offer: $350" — larger text, `var(--teal-mid)`, Cormorant Garamond 600, 28px. The offered amount is the focal point.

A thin center divider with an arrow → separating the two.

**Explanation card:**

A card with a teal left accent. Warm, honest explanation text:

"Based on your income and current expenses, $500 over 5 months would leave less than your household of 3 needs for basic living costs. $350 keeps your monthly payment at $70 — manageable without creating new hardship."

This text is dynamic — it reads from the computed feasibility data in BorrowerContext. The household size, proposed amount, and computed monthly payment are all real values from the algorithm.

Below: Monthly payment: $70/month for 5 months | Interest: $0.00

**Two CTAs:**

"Accept $350 →" — full-width teal primary button. On click: same flow as Approved, but `receiveDisbursement(350)`. Balance goes to $1,197. Shows success card with "💰 $350 deposited."

"I'd like to discuss this →" — ghost button below. Opens a centered dialog with a simple message field: "Tell us more about your situation" + a "Send" button that shows a success state: "Message sent. Our team will reach out within 24 hours." No real API call.

---

### Outcome C: Denied

**Design philosophy:** This screen is the most important design decision in the entire borrower account. It must feel like a caring person is talking, not a form rejection.

**Layout:** No cards. No grid. Just copy, centered, generous spacing. This is intentionally less structured than the other outcomes — the softness of the layout mirrors the softness of the message.

**Content (top to bottom, centered, max-width 600px):**

"We weren't able to approve this request." — Cormorant Garamond 600, 36px.

Margin-top 16px: "This isn't a judgment of your character." — DM Sans 400, 18px, italic, `var(--text-secondary)`.

A thin teal divider (60px, centered), margin 24px auto.

"Qard hassan is built for people who can realistically repay — and based on your situation right now, the monthly payment would create more hardship, not less." — DM Sans 400, 16px, `var(--text-secondary)`, line-height 1.7.

**Alternative resources (3 cards):**

Three cards with comfortable spacing between them. Each card: `var(--bg-surface)`, border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 20px 24px. An `ExternalLink` icon right-aligned.

Card 1 — Islamic Relief Emergency Fund:
"Islamic Relief USA — Emergency Fund"
"Grants, not loans — no repayment required"
"irusa.org/emergency" (teal link)

Card 2 — Local mosque zakat committee:
"[Mosque name from application] — Zakat Committee" (personalized from `submittedApplication.mosqueName`)
"Contact your mosque for zakat assistance — funds are available for community members in genuine need"
(Mosque name from the application, making this feel specifically relevant)

Card 3 — MCSS Austin:
"Muslim Community Support Services Austin"
"Financial assistance for Austin-area Muslims — rent, utilities, and emergency support"
"mcssaustin.org"

All three organization names link to their real websites (open in new tab).

**Closing section:**

"You can reapply in 90 days if your situation changes." — DM Sans 400, 14px, `var(--text-tertiary)`, centered.

"May Allah make it easy for you. 🤍" — Cormorant Garamond 500, 22px, italic, `var(--text-secondary)`, centered. The heart emoji is the only emoji used in the entire borrower account. It is sincere, not decorative.

---

## Page 5: Active Loan Dashboard

### Route

`/borrower/loan`

This is the borrower's home screen once `applicationStage === 'active_loan'`. The sidebar "My Loan" nav item is active.

### Layout

The content area is split into a left-heavy two-column layout: a main column (65% width) and a right sidebar column (35% width). On narrower viewports, these stack vertically.

**Main column (top to bottom):** Loan Hero Card → Repayment Schedule → Journey of Your Loan

**Right sidebar column:** Quick actions panel → Account summary → Trust level display

### Loan Hero Card

A wide card spanning the full main column width. Teal radial glow at the top of the card (matching the Approved decision screen's visual continuity).

**Content layout (two rows):**

Row 1 — Label and amount:
- "Active Qard Hassan" — DM Sans 500, 12px, `var(--text-tertiary)`, letter-spacing 0.08em, uppercase
- "$500 active loan" — "$500" in Cormorant Garamond 600, 48px, `var(--text-primary)` + " active loan" in DM Sans 400, 16px, `var(--text-secondary)` on the same baseline

Row 2 — Remaining and progress:
- "$400 remaining" — DM Sans 400, 14px, `var(--text-tertiary)`
- A progress bar: a red-tinted fill showing the remaining percentage (80% of bar is red/teal-dim, 20% is teal — the paid portion). As payments are made, the teal portion grows from left. This inverted bar represents "debt shrinking" not "progress."
- Below bar: "$100 repaid ✓" in `var(--status-green)` left side, "$400 remaining" in `var(--text-tertiary)` right side

Row 3 — Next payment:
- "Next payment: $100" — DM Sans 500, 15px, `var(--text-primary)`
- "due May 18, 2026" — DM Sans 400, 14px, `var(--text-secondary)` inline
- "12 days away" — color-coded: >14 days: `var(--text-tertiary)`, 7-14 days: `var(--status-yellow)`, <7 days: `var(--status-red)`

Row 4 — Two buttons:
- "Pay Now →" — teal primary (navigates to `/borrower/payment`)
- "See full schedule" — ghost (scrolls to RepaymentSchedule section)

### Repayment Schedule

Full-width card in the main column. A clean table with headers: Payment / Date / Amount / Status.

5 rows for the mock loan:

| | Date | Amount | Status |
|---|---|---|---|
| ✓ | April 18, 2026 | $100 | Paid on time |
| ⏳ | May 18, 2026 | $100 | Due in 12 days |
| ⚪ | June 18, 2026 | $100 | Upcoming |
| ⚪ | July 18, 2026 | $100 | Upcoming |
| ⚪ | Aug 18, 2026 | $100 | Upcoming |

Status column styling:
- Paid: green checkmark icon + "Paid on time" in `var(--status-green)`
- Due: yellow clock icon (CSS pulse) + "Due in 12 days" in `var(--status-yellow)`. The entire row has a very subtle yellow background wash.
- Upcoming: empty circle + "Upcoming" in `var(--text-tertiary)`. Row at 60% opacity.

Table footer row: "Total repaid: $100 of $500 | No interest | No fees. Ever." — "Ever." in `var(--status-green)` DM Sans 700.

### Journey of Your Loan

This is the feature that transforms the borrower from a debtor into a participant in the chain of good. It must feel meaningful, not transactional.

Below the schedule, a section with a distinct visual break:

**Header:** "What happens when you repay?" — Cormorant Garamond 500, 28px.

**The story card:**

A card with a 4px teal left accent bar. Background `var(--bg-elevated)`.

"Your $100 April repayment has already been redeployed to help the next person in need."

Below, an indented line with a teal → arrow:
"→ It is now part of a $300 loan to a student in Chicago covering tuition."

This text reads from `activeLoan.redeployedPayment` in BorrowerContext. It updates after each payment — when the borrower makes their May payment, the card updates to show the next redeployment story.

**The Hadith:**

"The one who lends is in sadaqah until it is repaid."
— Ibn Majah

Cormorant Garamond 400, 18px, italic, `var(--text-secondary)`.

**The closing thought:**

"By repaying, you extend the chain of good." — DM Sans 400, 15px, `var(--text-secondary)`, italic.

"Every repayment is your sadaqah to the next person." — DM Sans 400, 15px, `var(--text-secondary)`.

These lines do not live in a card — they breathe freely below the story card with generous spacing. The absence of card borders makes them feel like a sincere statement, not a UI element.

### Right sidebar column

**Quick actions panel:**

Three action buttons stacked:
- "Make a payment" — teal primary (navigates to `/borrower/payment`)
- "Having trouble?" — ghost (navigates to `/borrower/hardship`)
- "View loan history" — ghost (navigates to `/borrower/history`)

**Account summary:**

A small card showing:
- Loan amount: $500
- Remaining: $400
- Monthly payment: $100
- Payments: 1 of 5 made
- Tier: Standard

**Trust level:**

A small card showing the community trust level:
- "Community Trust" label
- Four filled stars + one empty star (★★★★☆) — rendered as Unicode ★ and ☆
- "Strong" label in `var(--text-secondary)`
- "Two previous loans repaid in full" — DM Sans 400, 12px, `var(--text-tertiary)`

---

## Page 6: Make a Payment

### Route

`/borrower/payment`

### Layout

Content area, max-width 640px, centered. This is a focused single-task screen. Clean, minimal, no distractions.

### Scheduled payment card

At the top: a prominent card showing what is scheduled.

"Scheduled payment:" — DM Sans 500, 12px, `var(--text-tertiary)`, uppercase, letter-spacing 0.06em.

"$100" — Cormorant Garamond 600, 52px, `var(--text-primary)`.

"due May 18, 2026" — DM Sans 400, 15px, `var(--text-secondary)`.

Below the amount, within the same card: "Pay exactly $100" — a full-width teal primary button, height 52px. This is the zero-friction path. One click, the right amount, done.

### Custom amount section

Below the scheduled payment card:

"Or pay a different amount:" — DM Sans 500, 13px, uppercase label.

Four chips: [$50] [$75] [$100] [$150]. A fifth chip: [Custom] that reveals a number input field below when clicked.

When the selected amount is greater than the scheduled $100:

A teal "Barakah!" card slides in below the chips (Framer Motion slide-down animation):

"Paying early or extra? Barakah! ✨" — DM Sans 700, 15px, `var(--teal-mid)`.

"Any amount above $100 reduces your remaining balance directly — shortening your loan." — DM Sans 400, 13px.

"New balance after this payment: $[400 - selectedAmount]" — this updates in real time as the user changes the amount.

### Payment method card

"Payment method:" — uppercase label.

A card showing the linked bank: 🏦 University Credit Union ****9273 — a "Change" link on the right (mocked — shows a brief "Coming soon" toast if clicked).

Below: "+ Add payment method" — a ghost card (mocked for demo).

### Confirm payment button

A full-width teal primary button: "Confirm $[selected amount] payment →"

The amount in the button label updates dynamically as the user selects different chips or enters a custom amount.

On click:
1. Show "Processing..." spinner for 600ms
2. Call `makePayment(selectedAmount)` from BorrowerContext
3. This debits the checking balance by the payment amount
4. Updates `activeLoan.remaining` by subtracting the payment
5. Advances the schedule: May 18 status changes from 'due' to 'paid', June 18 changes from 'upcoming' to 'due'
6. Updates `activeLoan.redeployedPayment` to the next redeployment story
7. Logs a `loan_repayment` transaction
8. Triggers the cross-account pool update (pool capital available for next borrower increases by payment amount)
9. Button turns green: "✓ Payment received"
10. Below the button: a teal card slides in: "JazakAllahu Khayran — May Allah reward you with good. Your $100 repayment has already been redeployed to help the next person in need."
11. After 2 seconds: "Return to my loan →" button appears in the card
12. Clicking it navigates back to `/borrower/loan` where the updated schedule is immediately visible

The sidebar checking balance must update immediately when `makePayment()` is called — the judge sees the number change in real time while reading the success message.

### "Having trouble?" section

This is NOT a footnote. It appears in the page at a visible position — roughly mid-page on a normal desktop view, between the confirm button and the bottom of the content.

"Having trouble making this payment?" — DM Sans 500, 16px, `var(--text-primary)`.

"We'll work something out before anything escalates. No penalties. No judgment." — DM Sans 400, 14px, `var(--text-secondary)`, italic.

"No penalties. No judgment." — DM Sans 500, 13px, `var(--teal-mid)`.

"Talk to us →" — a medium teal button (not full-width — this is an invitation, not a default action). Navigates to `/borrower/hardship`.

The visual weight of "Having trouble?" must be comparable to the payment button — not hidden below the fold, not styled as secondary. A borrower who is struggling must be able to see this option immediately.

---

## Money Flow Verification

After Phase 2.2, the following money flows must work end-to-end:

**Flow 1: Approval and disbursement**
1. Judge clicks "Show: Approved" on review screen
2. Arrives at Decision/Approved screen
3. Clicks "Link bank account to receive funds"
4. Checking balance in sidebar: $847 → $1,347 (immediately)
5. Transaction logged: loan_disbursement $500

**Flow 2: Making a payment**
1. From loan dashboard, click "Pay Now"
2. On payment screen, select $100, click Confirm
3. Checking balance: $1,347 → $1,247 (immediately)
4. Loan remaining: $400 → $300
5. Schedule updates: May → paid, June → due
6. Redeployment story updates to next borrower
7. Transaction logged: loan_repayment -$100

**Flow 3: Paying extra**
1. On payment screen, select $150
2. Barakah card appears, new balance preview shows $1,197
3. Confirm
4. Checking balance: $1,347 → $1,197 (immediately)
5. Loan remaining: $400 → $250
6. Transaction logged: loan_repayment -$150

All three flows must produce consistent numbers with no discrepancies between the sidebar balance, the loan remaining, and the transaction log.

---

## Phase 2.2 Acceptance Criteria

**Decision screen — Approved:**
- [ ] Arrives at `/borrower/decision` with decisionOutcome = 'approved'
- [ ] SVG checkmark animation draws circle then checkmark
- [ ] "Alhamdulillah" fades in after animation completes
- [ ] Teal radial glow visible in hero card
- [ ] Loan details show $500, Standard, 5 months, $100/month, $0.00 interest
- [ ] Schedule table shows 5 payment rows with correct dates
- [ ] "No fees. Ever." with "Ever." in green
- [ ] Hadith renders in Cormorant Garamond italic
- [ ] "Link bank account" button shows "Connecting..." then success state
- [ ] On success: checking balance $847 → $1,347 in sidebar immediately
- [ ] loan_disbursement transaction logged
- [ ] Success card shows correct new balance
- [ ] "Enter my loan dashboard" navigates to /borrower/loan

**Decision screen — Reduced:**
- [ ] Offered amount ($350) displayed large in teal
- [ ] Requested amount ($500) shown smaller/lighter
- [ ] Explanation text uses real computed feasibility data
- [ ] "Accept $350" triggers disbursement of $350, balance $847 → $1,197
- [ ] "Discuss" button opens dialog with message field

**Decision screen — Denied:**
- [ ] Copy-first layout, no card grid
- [ ] Three alternative resource cards render with real organization names
- [ ] Second card is personalized with the mosque name from the application
- [ ] All three external links open in new tab
- [ ] "May Allah make it easy for you. 🤍" in Cormorant Garamond italic
- [ ] No money moves, no balance change

**Active loan dashboard:**
- [ ] Sidebar nav shows "My Loan" as active
- [ ] Loan hero card shows $500, $400 remaining, progress bar, next payment info
- [ ] Progress bar shows remaining (not completion) — red-tinted for remaining portion
- [ ] "12 days" color correct (white/yellow/red based on proximity)
- [ ] "Pay Now" navigates to /borrower/payment
- [ ] Repayment schedule shows 5 rows with correct status icons and colors
- [ ] Due row (May 18) has yellow pulsing clock and yellow background tint
- [ ] Paid row (April 18) has green checkmark
- [ ] Upcoming rows are dimmed at 60% opacity
- [ ] Schedule footer: "No interest | No fees. Ever." with "Ever." in green
- [ ] Journey of Your Loan section renders below schedule
- [ ] Redeployment story reads from activeLoan.redeployedPayment
- [ ] Hadith and closing lines render below story card without card borders
- [ ] Right sidebar: Quick actions, Account summary, Trust level all render
- [ ] Trust level shows 4 filled stars + 1 empty star

**Make a Payment:**
- [ ] Scheduled amount card shows $100 due date
- [ ] "Pay exactly $100" button works as zero-friction path
- [ ] Custom amount chips render and select correctly
- [ ] "Custom" chip reveals number input
- [ ] Selecting amount > $100 shows Barakah card with animation
- [ ] New balance preview updates in real time
- [ ] Payment method card shows University Credit Union ****9273
- [ ] Confirm button label updates with selected amount
- [ ] On confirm: makePayment() called with correct amount
- [ ] Checking balance decreases by payment amount in sidebar immediately
- [ ] Loan remaining decreases correctly
- [ ] Schedule advances (May → paid, June → due)
- [ ] Redeployment story updates
- [ ] loan_repayment transaction logged
- [ ] Success card shows "JazakAllahu Khayran" and new balance
- [ ] "Return to my loan" navigates to updated dashboard
- [ ] "Having trouble?" section visible without scrolling on typical desktop
- [ ] "Talk to us →" navigates to /borrower/hardship (stub for Phase 2.3)

**End-to-end money flows 1, 2, and 3 all produce consistent numbers with no discrepancies**

---

## Notes for Claude Code

The SVG checkmark animation in Outcome A consists of two elements: an SVG `circle` element with `stroke-dasharray` and `stroke-dashoffset` (set to the circumference initially, animated to 0 to "draw" the circle), and an SVG `polyline` for the checkmark (same technique). Framer Motion's `pathLength` property handles both cleanly. The circle goes first (duration 500ms), the checkmark follows (duration 300ms, delay 400ms). After both complete, trigger the `scale(1.08)` spring pulse on the entire SVG element.

The progress bar on the Loan Hero Card is intentionally inverted from what users expect. Most progress bars show "how much you've accomplished." This bar shows "how much you still owe." The visual implication is a bar shrinking from right to left as payments are made. Implement by setting the filled portion width to `(remaining/total) * 100%` and using a red-tinted color for it. The unfilled (paid) portion is the teal-colored section. This counterintuitive design is intentional — it reinforces the borrower's goal of paying off the debt, not "completing" a journey.

The cross-account pool update when `makePayment()` is called is the trickiest implementation detail in Phase 2.2. The simplest approach: both PortfolioContext and BorrowerContext import from a lightweight `PoolContext` that maintains `poolAvailableCapital`. When BorrowerContext calls `makePayment()`, it also calls a `returnToPool(amount)` function from PoolContext. PortfolioContext reads from the same PoolContext for the demand algorithm. This creates the cross-account connection without making the contexts directly dependent on each other.

The redeployment story in "Journey of Your Loan" updates after each payment. Maintain a small array of redeployment stories in BorrowerContext:

- After payment 1 (April): "a student in Chicago covering tuition — $300 loan"
- After payment 2 (May): "a family in Phoenix for utility bills — $200 loan"
- After payment 3 (June): "a worker in Detroit for car repair — $450 loan"
- After payment 4 (July): "a single parent in Minneapolis for rent — $800 loan"
- After payment 5 (August): "Your final payment completes your loan. Your full $500 has cycled through 5 families. JazakAllahu Khayran."

Each call to `makePayment()` advances an index into this array. The loan dashboard reads the current redeployment story from this index.
