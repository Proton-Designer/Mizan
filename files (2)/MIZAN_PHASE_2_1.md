# MIZAN — Phase 2.1: Borrower Account — Foundation, Banking & Application Flow
## Build Document for Claude Code

---

## Web App Context

All layouts are full-width desktop web. This account uses a left sidebar like the portfolio account, but with a distinct visual identity (teal accent instead of gold) and a simplified sidebar (3 nav items instead of 6). The borrower is in a moment of financial stress — the interface is intentionally less dense than the portfolio, warmer in tone, and focused on a single task at a time.

---

## Phase 2.1 Scope

1. **BorrowerContext** — all state, simulated loan data, real algorithm functions, and the simulated banking system for loan disbursement
2. **Account entry and routing** — how users enter the borrower account and how the router dispatches to the correct screen
3. **Simulated banking integration** — how the borrower account connects to real money simulation (disbursement, repayment processing)
4. **Page 1: Natural Language Intake** — Claude-powered conversational form + Quick Questions alternative
5. **Page 2: Verification & Trust Building** — identity, community vouch, repayment proposal
6. **Page 3: Application Review** — transparent step tracker with live simulation

Phase 2.2 covers: Decision screen (all 3 outcomes), Active Loan Dashboard, Make a Payment.
Phase 2.3 covers: Hardship & Default Handling, Loan History, Account Tab.

---

## Simulated Banking for the Borrower Account

### Connection to Portfolio Banking

The borrower account has its own simulated bank account, separate from the Portfolio account's investment balance. The two accounts exist in parallel — a real user might be a lender through their portfolio while being a borrower separately, and the app keeps these completely private from each other.

The borrower's banking simulation tracks:

**Borrower bank account:** A separate simulated checking account used to receive loan disbursements and make repayments. Seeded with a realistic balance that reflects a low-to-moderate income person:

- Checking balance: $847 (simulated current balance, reflects someone living paycheck to paycheck)
- The loan, once approved, is deposited here: balance would jump to $847 + $500 = $1,347
- Each repayment debits this account

This separation is important for the demo: when a judge sees the borrower's account, they see a checking balance that feels authentic to the demographic (not $5,000 like the investor's account). The contrast reinforces the product's purpose.

**Borrower bank name:** "University Credit Union" (appropriate for the UT Austin MSA audience)
**Account last 4:** 9273

### Loan disbursement simulation

When a loan is approved and the borrower links their bank account:

1. A `loan_disbursement` transaction is logged in the borrower's transaction ledger
2. The borrower's checking balance increases by the loan amount
3. The lending pool's available capital decreases by the loan amount (this connects to the portfolio context — the same simulated pool that lenders' compound commitments feed)
4. A notification fires: "Your $500 qard hassan loan has been deposited to University Credit Union ****9273"

For the demo, the disbursement happens automatically on the approved decision screen — the borrower taps "Link bank account to receive funds" which immediately shows "Funds deposited" without a real Plaid connection.

### Repayment simulation

When the borrower makes a payment:

1. The payment amount debits their checking balance
2. A `loan_repayment` transaction is logged
3. The loan's `remaining` balance decreases
4. The repayment capital re-enters the lending pool (available to other borrowers or to cycle back to lenders)
5. The lender's position card in their portfolio updates — the cycle progress advances
6. If this payment completes a cycle, a new borrower gets assigned and the lender's journey log gets a new entry

This cross-account loop is the central mechanic of the platform. Step 6 is what makes the borrower's repayment visible in the lender's portfolio. Both happen from the same payment action.

### Borrower transaction ledger

Same structure as the portfolio transaction ledger. Logs every monetary event with timestamp, type, amount, balance-after, and description. Types:

- `loan_disbursement` — money received when approved
- `loan_repayment` — monthly repayment made
- `loan_restructured` — repayment plan changed
- `loan_converted` — outstanding balance converted to sadaqah
- `partial_payment` — partial repayment made

The borrower can view their transaction history from the Account tab.

---

## BorrowerContext

### What it contains

All state for the borrower account. This is a separate context from PortfolioContext — they do not share state. However, they share the `algorithms.js` utility file from Phase 1.

**Application state:**
- `applicationStage` — where the borrower is in the flow: `'pre_application'` | `'intake'` | `'verification'` | `'review'` | `'decided'` | `'active_loan'`
- `draftApplication` — the in-progress application object, updated as the user moves through intake and verification
- `extractedData` — what Claude pulled from the natural language input (before user confirmation)
- `submittedApplication` — the finalized application after all steps are complete
- `extracting` — bool, true while Claude API is processing

**Decision state:**
- `decisionOutcome` — `'approved'` | `'reduced'` | `'denied'` | null
- `offeredAmount` — for the reduced outcome, what amount was offered
- `decisionReason` — brief explanation text for display

**Loan state:**
- `activeLoan` — the current active loan object (post-approval)
- `loanHistory` — array of past completed loans
- `communityTrustLevel` — 1-5 integer, builds from repayment history

**Banking state:**
- `checkingBalance` — simulated checking account balance (starts at $847)
- `bankName` — "University Credit Union"
- `bankLast4` — "9273"
- `bankLinked` — bool, set to true after decision screen bank linkage
- `borrowerTransactions` — transaction ledger

**Hardship state:**
- `hardshipPath` — which hardship path was selected (null | 'extension' | 'restructure' | 'conversion')
- `extensionGranted` — bool
- `conversionPending` — bool

### Mock data — the pre-seeded demo state

For the demo, the borrower account starts in `applicationStage: 'review'` so judges land on the most impressive screen immediately. The mock data represents a realistic application:

**Submitted application:**
- Loan amount: $500
- Purpose: Car repair (Transportation category)
- Gross monthly income: $2,000
- Monthly debts: $1,200 (rent $950 + utilities $250)
- Household size: 3 (applicant + 2 children)
- Dependents: 2
- Urgency: High (work commute depends on car)
- Mosque: UT Austin MSA
- Mosque tenure: Long (2+ years)
- Imam name: Sheikh Abdullah
- Imam phone: +1 (512) 555-0192
- Repayment frequency: Monthly
- Proposed monthly payment: $100
- Application ID: QH-2847
- Submitted: April 18, 2026, 3:42 PM

**Algorithm outputs (pre-computed for the demo):**
- Assigned tier: Standard ($500–$2,000)
- Monthly payment: $100 (500 / 5 months)
- Residual income: $700/month ($2,000 - $1,200 - $100)
- Min residual for household of 3: $1,600
- Feasibility: Technically below minimum, but just below — algorithm suggests the loan is workable given the urgency and that the residual is not dangerously low. The algorithm flags it as "tight but feasible" rather than infeasible.
- Need score: 72/100 (income: 20, urgency: 20, dependents: 15, trust: 17)
- Vouch score: 17 (imam vouch pending + 2yr tenure = 10 from tenure alone until imam responds)
- Threshold for Standard: score ≥ 50, trust ≥ 18 — the trust is borderline at 17, so it's sent to circle vote

**Application steps for the review screen:**
1. Identity confirmed ✓ (complete)
2. Imam vouch pending ⏳ (Sheikh Abdullah notified)
3. Algorithm review ⚪ (waiting)
4. Pool availability check ⚪ (waiting)
5. Decision ⚪ (waiting)

**Active loan (for when demo is switched to active state):**
- Loan amount: $500
- Remaining: $400 (one payment of $100 already made)
- Monthly payment: $100
- Repayment schedule: 5 months starting April 18, 2026
- Schedule items: April 18 (paid, $100), May 18 (due, 12 days), June 18 (upcoming), July 18 (upcoming), Aug 18 (upcoming)
- Redeployed repayment: The $100 April repayment was redeployed to "a student in Chicago, tuition, $300 loan"

**Loan history (past loans, builds trust):**
- October 2024: $200 loan, paid in full in 2.1 months, Standard tier
- March 2025: $300 loan, paid in full in 4.5 months, Standard tier

**Community trust level:** 4 out of 5 stars (two previous loans paid in full, builds the 4-star rating)

### Algorithm integration

Import `computeNeedScore`, `computeFeasibility`, `computeVouchScore`, and `assignTier` from `src/utils/algorithms.js` (established in Phase 1.1). These are the same functions used across the platform — consistent scoring everywhere.

BorrowerContext uses these functions to:
1. Pre-compute the demo application's scores on context initialization
2. Re-compute scores in real time as the user edits their application in the verification step
3. Determine which tier to assign and which approval path to route to

### Banking operations exposed from context

- `receiveDisb ursement(amount)` — credits checking balance, logs disbursement transaction
- `makePayment(amount)` — debits checking balance, logs repayment, updates loan remaining, triggers the cross-account pool update
- `getCheckingBalance()` — returns current checking balance
- `getLoanRemaining()` — returns outstanding loan balance

---

## Account Entry and Routing

### Entry points

The borrower account is accessed from the Welcome screen (one of the four account type cards) or from a "Switch account" option inside another account.

There is no default portfolio account requirement — in the demo, the borrower account is completely standalone.

### Layout — web

The borrower account uses the same two-column layout as the portfolio:

**Left sidebar (240px):**
- Mizan wordmark in teal (not gold — this is a different account type)
- User name and "Borrower Account" label
- Checking balance: "Available: $847" (or $1,347 after disbursement)
- Navigation: My Loan / Payments / Account
- A "Switch account" link back to the Welcome screen
- A privacy pill at the bottom: "🔒 Your information is private"

**Main content area:**
The active screen renders here.

### BorrowerHome router

The home route (`/borrower`) reads `applicationStage` from context and navigates to the correct screen. For the demo, default to `'review'` so the application review screen loads immediately. The full application flow (intake → verification → review) is navigable via the sidebar or direct URL if a judge wants to walk through it.

Demo switcher: A small unobtrusive row at the very bottom of the review screen (visible in all modes, not just dev) with buttons: [Show: Approved] [Show: Reduced] [Show: Denied] [Show: Active Loan]. Clicking each sets the appropriate context state and navigates to the decision or loan screen. This is the primary navigation tool for judges walking through the demo.

---

## Page 1: Natural Language Intake

### Route

`/borrower/intake`

### Layout

The intake screen uses the full content area with a centered container (max-width 720px, auto margins). This is not a form — it is a conversation. The layout reflects that: generous vertical spacing, large readable text, no table-like field rows.

### Opening header

Large warm heading: "Tell us what's going on." — Cormorant Garamond 600, 40px, `var(--text-primary)`.

Subheading: "We're here to help, not to judge." — DM Sans 400, 18px, `var(--text-secondary)`, italic.

A thin teal divider (50px, centered) below the subheading. This divider is the first use of teal on the page and signals to the user they're in a safe, distinct space.

### The text area

A single large textarea, full width of the centered container, minimum 200px height, expanding as the user types. Warm, open styling: rounded corners, soft border, no hard box lines.

Placeholder text shows two example situations (the examples rotate with a subtle fade every few seconds):

Example 1: "I need help with my car repair. I can't get to work without it. I make about $2,000 a month, my bills are around $1,200. I have two kids and I've been at my mosque for 3 years."

Example 2: "My rent is due in 5 days and I'm $600 short. I work part-time at the library making about $1,400/month. I'm a student and have been going to the Islamic Center of Austin for 2 years."

These examples show the user the level of detail needed without making the form feel like a police report.

Below the textarea: "You can write in Arabic, Urdu, Somali, Amharic, Spanish, or any language." — DM Sans 400, 13px, `var(--text-tertiary)`.

Below that: a character count that appears once the user starts typing. No minimum enforced until Submit is tapped — then check for at least 50 characters.

### Privacy statement

Below the textarea, a contained box (not a card — just a lightly bordered region): "🔒 Your conversation is private. No one outside our platform sees your words. This is just between you and the community you trust." — DM Sans 400, 13px, teal text.

### Quick questions alternative

A text link below the privacy statement: "Answer a few quick questions instead →" — this navigates to `/borrower/intake/quick` and is styled as a teal text link, not a button. The link is intentionally low-profile — the text area is the primary path, the form is the escape hatch.

### Primary CTA

A teal primary button: "Analyze my situation →" — 600px wide, centered, 52px height. Disabled when textarea has fewer than 50 characters.

On click: the button shows "Reading your situation..." with a spinner. The Claude API call fires (see below). The textarea becomes disabled (grayed out) during processing.

### Claude API call for intake extraction

Call the Anthropic API at `https://api.anthropic.com/v1/messages`. No API key in headers.

System prompt instructs Claude to extract structured data from a free-form description of financial hardship. Claude is told to be generous with inferences (if someone says "my bills are around $1,200" treat that as monthlyDebts: 1200) and to handle all languages gracefully.

The response must be valid JSON with these fields: `loanAmount` (number or null), `purpose` (brief string), `purposeCategory` (one of the defined categories), `urgency` ('emergency'|'high'|'medium'|'low'), `grossMonthlyIncome` (number or null), `monthlyDebts` (number or null), `householdSize` (number, always at least 1, includes applicant), `dependents` (number), `mosqueName` (string or null), `mosqueTenure` ('long'|'medium'|'short'|'none'), `proposedMonthlyPayment` (number or null), `confidenceScore` (0-100), `notes` (any useful context).

On success: store in `extractedData`, navigate to `/borrower/intake/confirm`.

On failure or timeout (5 second timeout): show an inline error with a link to the quick questions path: "We had trouble understanding that. Try the quick questions path instead →"

### Intake confirmation screen

Route: `/borrower/intake/confirm`

The user sees what Claude extracted, displayed as editable cards. The layout is a centered container with a grid of 6 field cards (2 columns on desktop, 1 column on tablet).

Each field card shows: a label (uppercase, small, teal), the extracted value in large readable text, and a small pencil icon. Tapping/clicking the pencil makes the value inline-editable. On save (Enter or clicking outside), the edit is committed to `extractedData`.

Below the field cards: a computed tier badge showing which tier the extracted data maps to. This is computed live from `assignTier(extractedData.loanAmount)`.

Below the tier badge: a live feasibility check. If income and debts are both extracted, compute `computeFeasibility()` and show either "✓ This loan looks manageable based on what you shared" or "⚠️ This may be tight — we may suggest a smaller amount." This is informational only, not a denial.

Two buttons at the bottom:
- Primary: "This looks right — continue →" (navigates to `/borrower/verification`)
- Secondary: "← Start over" (clears extraction, returns to `/borrower/intake`)

On continue: merge `extractedData` into `draftApplication`.

### Quick Questions flow

Route: `/borrower/intake/quick`

Seven sequential questions, each on its own "step" within the same page (not different routes — use state to track the current question and animate between them). A step progress bar at the top: "Question 3 of 7."

Questions:
1. What do you need help with? — 8 category chips (Medical, Car/Transportation, Rent, Utilities, Tuition, Food, Funeral, Other). Selecting one enables a small follow-up text field.
2. How much do you need? — Large number input + quick-select chips ($100, $250, $500, $1,000, $2,000). Live tier badge appears as user types.
3. How urgent is this? — 4 large radio cards (Emergency, Within a week, Within a month, Planning ahead).
4. What's your approximate monthly income? — Number input. Skip link available.
5. What are your main monthly expenses? — Number input (rent + bills combined). Helper text and Skip link.
6. How many people are in your household? — A number stepper (1–10). A second stepper for dependents (0–8).
7. Are you part of a mosque or Islamic community? — Yes/No. If Yes: mosque name input + tenure chips.

After question 7, the answers are assembled into the same `extractedData` structure (no API call). Navigate to `/borrower/intake/confirm`.

---

## Page 2: Verification

### Route

`/borrower/verification`

### Layout

The verification page uses the full content area with a maximum width of 800px. Three sections arranged vertically. Each section is a card with a clear header. Sections B and C are visually locked (lower opacity, a "locked" icon) until Section A is complete. Unlock with animation as each section completes.

### Section A: Identity Verification

Fields: Full legal name (two inputs side by side: first + last), Date of birth (MM/DD/YYYY), Phone number with inline "Send code" button, Government ID number (with a small "Why we ask this" info link), Current address.

Phone verification: Clicking "Send code" simulates sending an SMS (logs a console message for demo purposes, shows "Code sent ✓" immediately). A 6-digit code input appears below. For the demo, any 6-digit code is accepted. When a valid code is entered, the phone field shows a green verification badge.

Government ID: The field shows a lock icon and helper text: "Stored encrypted. Used to verify your identity. Never shared." Accepting any value is fine for demo.

When all Section A fields are filled and phone is verified, Section A shows a green ✓ completion badge and Sections B + C unlock.

### Section B: Community Vouch

A mosque search field (text input that searches a hardcoded list of 20 major US mosques). Selecting a mosque from the autocomplete list fills in the mosque name. Manual entry is also accepted.

Imam contact fields: Name and phone number.

Mosque tenure chips: "< 6 months" / "6 months – 2 years" / "2+ years ●" (default to 2+ years for demo)

The vouch preview card: After the imam's name and phone are entered, a preview box shows exactly what message they'll receive: "[Name] has applied for an interest-free loan through Mizan. They listed you as a community reference. Do you know this person and can vouch for their character? Reply YES or NO." Below: "That's all they're asked. No amounts, no loan details."

Circle alternative: Below the imam vouch section, a secondary option: "Already in a Qard Hassan Circle? Use your circle membership as verification." This appears as a ghost card. For the demo, it shows "UT Austin MSA Circle" as an available circle and selecting it sets `circleMember: true`, marks Section B complete.

Section B completes when mosque + imam contact are filled OR circle membership is selected.

### Section C: Repayment Proposal

Frequency chips: Weekly / Bi-weekly / Monthly (default: Monthly).

Start timing chips: As soon as funded / In 2 weeks / Next month (default: As soon as funded).

Proposed monthly payment input: A number field. Below it, a live computation: "At $100/month over 5 months, you'd repay $500 total. After your bills, this leaves ~$700/month for living expenses." This uses the data from Section A and the `computeFeasibility()` function in real time.

If the proposed payment is unrealistically high (e.g., $3,000/month on a $2,000 income), show a gentle note: "That's more than your income allows — consider $100–$200/month." This is advisory, not blocking.

### Submit button

At the bottom of the verification page, a full-width teal primary button: "Submit my application." Enabled only when Sections A, B, and C are all complete.

On submit:
1. Button shows "Submitting..." with a spinner for 1.5 seconds (simulates backend processing)
2. All application data is merged into `submittedApplication`
3. The need score and vouch score are computed using `computeNeedScore()` and `computeVouchScore()` and stored on the application
4. `applicationStage` is set to `'review'`
5. Navigate to `/borrower/review`

---

## Page 3: Application Review

### Route

`/borrower/review`

### Layout

Full content area, max-width 720px, centered. Clean, uncluttered. No sidebar-within-sidebar. This is a waiting state — the UI should feel calm, not overwhelming.

### Header

"Your application is in." — Cormorant Garamond 600, 40px.

"Application #QH-2847 · Submitted April 18, 2026" — DM Sans 400, 14px, `var(--text-tertiary)`, margin-top 8px.

### Step tracker

A vertical step tracker — the most important component on this screen. Five steps, each with a visual state (complete, pending, waiting).

Step visual states:
- Complete (✓): A filled teal circle (24px) with a white checkmark icon. Label in `var(--text-primary)`, DM Sans 500. A "Completed" sub-label in teal, DM Sans 400, 13px.
- Pending (⏳): A pulsing teal circle outline (CSS keyframe animation: scale 1 → 1.1 → 1, opacity 1 → 0.6 → 1, 2s repeat). Label in `var(--text-primary)`. A detail sub-label (e.g., "Sheikh Abdullah notified") in DM Sans 400, 13px, `var(--text-secondary)`. The row has a subtle teal background wash.
- Waiting (⚪): An empty circle outline in `var(--border-subtle)`. Label in `var(--text-tertiary)`. No sub-label. Row at 60% opacity.

A vertical connector line (2px, teal at full opacity for complete-to-pending, dashed for pending-to-waiting, `var(--border-subtle)` for waiting-to-waiting) runs between the step circles.

The five steps for the demo application:
1. Identity confirmed ✓
2. Imam vouch pending ⏳ (Sheikh Abdullah notified)
3. Algorithm review ⚪
4. Pool availability check ⚪
5. Decision ⚪

### Simulate vouch button

A small, clearly labeled demo control directly below the step tracker: "[ Demo: Simulate vouch response ]" — a small ghost teal button. Clicking it:
1. Advances Step 2 from Pending → Complete
2. Sets Step 3 from Waiting → Pending with detail "Running need score analysis..."
3. After 1 second, Step 3 → Complete, Step 4 → Pending
4. After another second, Step 4 → Complete, Step 5 → Pending "Preparing decision..."
5. After another second, all steps complete and the screen auto-navigates to `/borrower/decision`

This is the primary demo flow that judges will see — it shows the system working end-to-end without waiting for a real SMS.

### Estimated timeline card

A secondary card below the step tracker. Three timeline estimates:
- "Imam vouch: 1–24 hours"
- "Algorithm review: Automatic (minutes)"
- "Decision: Within 48 hours of vouch"

Card: `var(--bg-elevated)`, border `var(--border-subtle)`, teal-tinted left accent bar (3px).

### Request summary card

Compact summary of the submitted application:
- Tier: Standard ($500–$2,000) — with the TierBadge component (yellow badge for Standard)
- Your request: $500
- Purpose: Car repair (Transportation)
- Estimated monthly payment: $100 over 5 months
- Interest: $0.00

Card: same styling as timeline card.

### Algorithm transparency section

A collapsible "How does the review work?" section. When expanded, shows a plain-language explanation of what the algorithm checks:

"We look at four things: your income compared to your household's needs, how urgent your situation is, whether you have dependents, and your community standing. We never use credit scores. We prioritize the people who need help most."

Below that: the actual computed scores for this application (since the demo has pre-computed values):
- Income score: 20/30 — "Your income is below 250% of the poverty line for a household of 3"
- Urgency score: 20/25 — "Transportation to work is a high-urgency need"
- Dependents score: 15/20 — "2 dependents"
- Community score: 17/25 — "Imam vouch pending; mosque tenure (2+ years) counted"
- Total: 72/100

This transparency is a core value of the platform. The borrower can see exactly how they were evaluated.

### Edit link

At the bottom: "Need to change something? Edit application →" — teal text link. Clicking shows a warning modal: "Editing will restart the imam vouch process." Cancel or Continue. Continue navigates to `/borrower/verification`.

### Demo navigation switcher

At the very bottom of the review page, below all content:

```
─── Demo navigation ───────────────────────────────────
[ Approved ] [ Reduced amount ] [ Denied ] [ Active loan ]
```

Four ghost buttons that instantly switch to any demo state. These are always visible (this is a hackathon — judges need to navigate quickly).

---

## Phase 2.1 Acceptance Criteria

**BorrowerContext:**
- [ ] BorrowerContext created with all mock data and algorithm imports
- [ ] Demo application pre-seeded: QH-2847, $500, Standard tier, Sheikh Abdullah pending vouch
- [ ] Need score pre-computed correctly (72/100)
- [ ] Vouch score pre-computed correctly (17/25 before imam response)
- [ ] Checking balance initialized at $847
- [ ] Loan history seeded with 2 past loans
- [ ] Community trust level set to 4
- [ ] All banking operations implemented (receiveDisbursement, makePayment, getCheckingBalance)
- [ ] Checking balance shown in sidebar

**Account entry and sidebar:**
- [ ] Sidebar shows Mizan wordmark in teal
- [ ] Sidebar nav: My Loan / Payments / Account (3 items only)
- [ ] Checking balance displayed in sidebar
- [ ] Privacy pill at sidebar bottom
- [ ] BorrowerHome router navigates based on applicationStage
- [ ] Default applicationStage is 'review' for demo

**Intake page:**
- [ ] Warm header renders in Cormorant Garamond
- [ ] Textarea expands as user types
- [ ] Placeholder examples show and rotate
- [ ] Language support note below textarea
- [ ] Privacy statement in teal text
- [ ] Quick questions link navigates to /borrower/intake/quick
- [ ] "Analyze my situation" button disabled below 50 characters
- [ ] Claude API fires on submit with correct structured prompt
- [ ] Loading state shows "Reading your situation..."
- [ ] On success: data stored in extractedData, navigate to confirm
- [ ] On failure: error shown, quick questions link offered

**Intake confirm screen:**
- [ ] 6 extracted fields rendered as editable cards
- [ ] Inline editing works (pencil click → edit in place → save)
- [ ] Tier badge computed live from extracted amount
- [ ] Feasibility check runs and shows correct result
- [ ] Continue commits data to draftApplication, navigates to verification

**Quick questions flow:**
- [ ] 7 questions rendered sequentially with step progress bar
- [ ] All 7 question types render correctly (chips, stepper, radio cards, inputs)
- [ ] Assembled data matches extractedData structure
- [ ] Navigates to confirm screen after Q7

**Verification page:**
- [ ] Three sections render, B and C locked until A completes
- [ ] All Section A fields work, phone verification accepts any 6-digit code
- [ ] Section A completion unlocks B with animation
- [ ] Mosque search autocompletes from hardcoded list
- [ ] Vouch message preview renders with imam's name
- [ ] Circle membership alternative works and completes Section B
- [ ] Repayment proposal live computation uses computeFeasibility correctly
- [ ] Submit button disabled until all sections complete
- [ ] On submit: scores computed, applicationStage set to 'review', navigate to /borrower/review

**Application review page:**
- [ ] Step tracker renders all 5 steps with correct initial states
- [ ] Pending step has pulsing animation
- [ ] Step connector lines render correctly between steps
- [ ] "Simulate vouch response" button advances steps sequentially with delays
- [ ] After all steps complete, auto-navigates to /borrower/decision
- [ ] Algorithm transparency section is collapsible and shows correct computed scores
- [ ] Timeline card and request summary card render
- [ ] Demo navigation switcher renders at bottom with 4 buttons
- [ ] Each switcher button correctly sets state and navigates

---

## Notes for Claude Code

The six-digit SMS code input is best implemented as a single hidden `<input>` element underneath 6 styled `<div>` boxes. The hidden input captures actual keyboard input; the divs display individual characters. This is the pattern used by Stripe and other payment UIs. It handles paste correctly and is accessible.

The "Simulate vouch response" sequential animation (steps advancing with delays) should use Promise-based setTimeout chains, not nested setTimeout calls. This makes it easier to cancel if the user navigates away before the sequence completes.

The algorithms imported from `algorithms.js` run synchronously client-side. Do not wrap them in async functions. Call them directly and use the return values.

The BorrowerContext checking balance and the PortfolioContext bank balance are completely separate. There is no shared banking state between the two contexts. The only cross-account communication is through the shared lending pool — when a borrower repays, it updates the pool capacity that the portfolio context reads for the demand algorithm. Implement this cross-context communication through a top-level shared `poolState` context, or more simply: when `makePayment()` is called in BorrowerContext, also update a `sharedPoolCapacity` value in a lightweight PoolContext that both account contexts can read.

The demo defaults matter a lot for judge experience. The entry default (`applicationStage: 'review'`) means judges immediately see the transparent step tracker, which is the most impressive Phase 2.1 screen. The demo switcher at the bottom gives them one-click access to every other state. Plan the tab order so judges can Tab through the demo switcher buttons quickly.
