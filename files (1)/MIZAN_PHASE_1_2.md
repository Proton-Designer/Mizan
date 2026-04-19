# MIZAN — Phase 1.2 (REVISED): Invest Interface, Jariyah Vault, AI Reflection & Giving Streak
## Build Document for Claude Code

---

## Prerequisites

Phase 1.1 must be complete. The banking system, NGO data layer, and portfolio dashboard must all be working. Phase 1.2 builds the transactional engine on top of them.

---

## Phase 1.2 Scope

1. **Donate/Invest Interface** — the multi-step invest flow, fully wired to the banking system. Every commit must actually debit the user's simulated balance. The algorithm output must compute in real time from the real NGO data and borrower pool.

2. **Jariyah Vault** — full sub-account system for memorial/tribute giving. Standalone pages, impact feed, shareable cards.

3. **AI Spiritual Reflection** — Claude API integration for post-commit overlay and weekly reflection. Includes fallback handling.

4. **Giving Streak** — consistency tracker wired to actual investment commits, with calendar history.

---

## The Invest Interface

### Entry points

The invest interface opens from:
- The "Invest" link in the sidebar
- An "Invest in this cause" button on any NGO card in the Discover feed
- The "Add more" button on an existing position card
- A pre-filled quick-invest button in the streak panel ("Give $1 to keep it going")

When triggered from a specific NGO cause, the cause is pre-selected and the first step is skipped. When triggered from the sidebar with no cause, the user must search/select a cause first.

### Layout — web modal

The invest interface is a **centered modal** (not a bottom sheet). On web, it renders as a fixed overlay with a centered dialog box, approximately 600px wide and variable height (scrollable within the dialog if content is tall). A semi-transparent dark scrim covers the rest of the screen. Clicking the scrim closes the modal.

The dialog has:
- A close (X) button top-right
- A progress indicator at the top (step dots or a thin progress bar)
- The current step's content in the center
- Back/Continue buttons at the bottom

### Steps and flow

**Step 1 — Cause selection (skipped if pre-selected)**
A search input at the top of the modal. As the user types, the NGO database is searched by name, category, or country. Results appear as a compact list with logo + name + category chip. Selecting one sets the cause and advances to Step 2.

If a cause is pre-selected, instead of showing Step 1, a compact cause header bar appears at the top of the modal for all subsequent steps, showing the NGO logo, name, and category. This persists across steps.

**Step 2 — Amount**
A large centered number input. The user types any dollar amount. Quick-select chips below for common amounts ($25, $50, $100, $250, $500). As the user types, three things happen immediately:
- The Live Impact Preview card (persistent at the bottom of the modal) begins computing
- The available balance remaining is shown below the input: "Your balance: $3,850 → after this: $3,550"
- The input border turns red with an error if the amount exceeds available balance

**Step 3 — Direct or Compound**
Two large toggle cards side by side:
- Left: Direct — "Money reaches the cause today." Icon of a straight arrow.
- Right: Compound — "Money works through qard hassan loans first, multiplying your impact." Icon of a cycle arrow.

For urgent/emergency-flagged causes, Direct is pre-selected. For all others, Compound is pre-selected. The user can change either way.

If Direct: skip Steps 4 and 5, go to Step 6 (Vault tag).

**Step 4 — Algorithm output (Compound only)**
A read-only card appears after a simulated 600ms "computation" animation (spinner → result). The card shows the output of `computeQardhassanDemand(amount, ngoId, borrowerPool)`:

```
Based on current pool demand:
1 cycle ≈ 5 months  (range: 4–7 months)
~4 families helped per cycle
Deployment: 2 Standard loans + 1 Micro loan
```

The deployment shape (how many borrowers at what tier) is shown. This comes from the real `computeQardhassanDemand` algorithm — not hardcoded.

**Step 5 — Cycles and split (Compound only)**
Two controls:

**Cycle selector:** A horizontal row of chips: [1] [2] [3] [5] [10] [∞ Jariyah]. As each chip is selected, the Live Impact Preview updates. The Jariyah chip is styled distinctly (gold/green color, slightly larger). Selecting Jariyah locks the split to 100% cause and hides the split control.

**Destination split slider:** A slider from 0% (all back to me) to 100% (all to cause). Default 100% to cause. When dragged below 100%, a gentle hadith line appears: "Every loan given is sadaqah until it is repaid — Ibn Majah." The split percentage updates the Live Impact Preview's "returns to you" and "lands as sadaqah" lines.

**Step 6 — Tag to Jariyah Vault (optional)**
Shown for all commitment types. Prompt: "Give this in someone's name?" List of existing vault persons (from context). Each person shown as a small card with their name and relationship. A "+ Add someone" option at the bottom. A "Skip" link.

Selecting a person tags this commitment to their vault sub-account. All future impact updates from this NGO will be framed as that person's ongoing good deed.

**Step 7 — Confirm**
A summary of everything selected:
- NGO name + logo
- Amount ($300)
- Type (Compound, 2 cycles)
- Estimated timeline (~10 months)
- Estimated families helped (~8)
- Total real-world good (~$900)
- Split (100% to cause)
- Tagged to: Ahmed Al-Farsi (father)

A gold primary button: "Commit $300 →"

On tap:
1. Validate sufficient balance (call banking operation)
2. If insufficient: show inline error, do not close modal
3. If sufficient:
   a. Call the appropriate banking operation (`investDirect` or `investCompound`)
   b. This debits the balance and creates the position record
   c. The position is added to the positions array in context
   d. If Compound, the commitment is added to `committedCapital`
   e. The streak counter is incremented
   f. The modal closes
   g. The SpiritualReflection overlay opens (Phase 1.2 feature)
   h. On closing the reflection, the dashboard updates to show the new position

### Live Impact Preview

A persistent card fixed to the bottom of the modal dialog. Updates on every input change in real time. Content varies by state:

No amount entered: "Enter an amount to see your impact."

Direct, $300: "Your $300 → [NGO name] → 600 meals funded → Delivered today → Reward: sadaqah"

Compound, $300, 2 cycles: 
- ~8 families helped over ~10 months
- $300 lands as sadaqah at [NGO name]
- Total real-world good: ~$900
- Reward: sadaqah on every loan + final sadaqah jariyah

Jariyah mode: "A family helped every ~5 months, forever. Becomes sadaqah jariyah at your chosen exit. Total real-world good: unlimited."

The "Total real-world good" dollar figure uses `computeImpactPreview()` from algorithms.js. This function takes amount × cycles × impactPerDollar from the real NGO data. The number actually changes as the user adjusts cycles — watching it grow from $300 (direct) to $600 (1 cycle) to $900 (2 cycles) is the moment the concept clicks.

---

## Working Capital Flow

The invest flow must actually move money. After a successful commit:

**For Direct:**
- `bankBalance` decreases by the invested amount
- A `invest_direct` transaction is logged
- A position of type `direct` is created with `status: 'complete'` (no cycles to run)
- The position is immediately shown in holdings with the blue "Complete" badge

**For Compound:**
- `bankBalance` decreases by the invested amount
- `committedCapital` increases by the same amount
- An `invest_compound` transaction is logged
- A position of type `compound` is created with `status: 'active'`, cycle 1 beginning now
- The simulation engine assigns borrowers from the pool to this cycle
- The position appears in holdings with the yellow "Active — Cycle 1/[N]" badge

**For Jariyah:**
- Same as Compound but `cyclesTotal: null` (perpetual)
- The position shows the green "Jariyah" badge
- `committedCapital` includes this position indefinitely (unless the user manually exits)

When a cycle completes (detected by simulation engine):
- If `splitPercent > 0`: `processReturn(positionId, returnAmount)` credits the user's balance
- A `cycle_return` transaction is logged
- The position advances to the next cycle (or `status: 'complete'` if all done)
- The journey log gets a new entry

When all cycles complete and the position reaches its final sadaqah destination:
- A `sadaqah_settled` transaction is logged
- The position status becomes `complete`
- If tagged to a Jariyah Vault person, the vault gets a new impact entry

---

## Jariyah Vault

### Structure

The Jariyah Vault is a system of named sub-accounts. Each sub-account belongs to one person (living or deceased) and accumulates impact entries over time. Any commitment tagged to that person generates vault entries as impact occurs.

### Vault main page (`/portfolio/vault`)

Full-width web page within the portfolio sidebar layout. TopBar title: "Jariyah Vault."

**Page layout:**
A page header with "Their good deeds continue" as the title and a one-sentence explanation of sadaqah jariyah. Below: an "+ Open an account" card (dashed gold border, centered content, serves as the primary CTA). Below that: a grid (2 columns on desktop) of person cards, one per vault sub-account.

**Person card:**
Shows: photo/avatar, name, relationship, type (memorial/living), total good deeds count, active jariyah amount, latest impact entry in italic. "View their journey →" link.

### Add person flow

Clicking "+ Open an account" opens a modal with 4 steps:

Step 1: Name (large text input) + Relationship selector (Parent, Spouse, Child, Sibling, Friend, Self/Legacy, Other) + Type toggle (Memorial vs Living tribute)

Step 2: A text area asking "What would they have cared about?" — the note seeds the AI's framing for impact notifications. Optional.

Step 3: Photo upload. If skipped, show an initial circle in the person's accent color (consistent per person, derived from their name string).

Step 4: "Start their account with a Jariyah commitment?" — two options: "Yes — invest now" (opens the Invest flow pre-configured for Jariyah mode with this person tagged) or "I'll add later" (saves the sub-account and returns to the Vault page).

After creating a sub-account, it appears in the vault grid immediately.

### Individual person page (`/portfolio/vault/:personId`)

A dedicated page for one person. Shows their photo/avatar large at the top, their name, relationship, active commitments, total good deeds.

Below: a chronological impact feed. Each entry is a card with:
- Timestamp (relative and absolute)
- The impact text (AI-generated in Phase 1.2, hardcoded in Phase 1.1 for the demo seed)
- NGO name and campaign
- A photo placeholder if the NGO uploaded an image
- A "Share" button

### Impact feed entries

The demo seed (Ahmed Al-Farsi) has 5 pre-written impact entries in the context:

1. "Your father's sadaqah fed 40 children in Yemen during iftar." — 2 hours ago
2. "A student read Surah Al-Mulk on scholarship funded by your father's sadaqah." — Yesterday
3. "A Quran was completed in a refugee camp — your father's jariyah contributed to this student's tuition." — 3 days ago
4. "Your father's sadaqah helped purchase medical supplies for 15 children in Sana'a." — 1 week ago
5. "A child received new school shoes — made possible by the continuous flow of your father's jariyah." — 2 weeks ago

When a new investment is committed and tagged to a person, and when the simulation engine processes a cycle completion for a tagged position, a new entry is generated. For Phase 1.2, generate the entry text using the Claude API (see AI Reflection section). If the API is unavailable, use a template: "Your [relationship]'s sadaqah helped [N] [families/people] in [country]."

### Shareable cards

Each impact entry has a "Share" button. Clicking generates a card image using `html2canvas` targeting a hidden offscreen div with:
- Dark background with Islamic geometric pattern (reused from Welcome screen)
- Centered: the person's name, the impact text, the NGO name, the Mizan logo, and a relevant hadith on sadaqah jariyah
- The image downloads or opens the Web Share API if available

---

## AI Spiritual Reflection

### Integration points

**Post-commit overlay:** Immediately after a successful invest commit (the modal closes), a full-screen overlay appears before the dashboard is visible.

**Weekly reflection:** A "View this week's reflection" button appears at the bottom of the portfolio dashboard (below the Jariyah Vault preview). It triggers a full-screen modal. For demo purposes, this is triggered manually by clicking the button — no actual weekly timer.

### Post-commit overlay

A full-screen dark overlay (same background treatment as the Welcome screen — dark void with gold radial glow). Content is centered.

Loading state (while API call is in flight): a pulsing gold orb animation + "Reflecting..." text.

Loaded state (after API responds):
- Small label: "YOUR REFLECTION" in small uppercase
- The cause + amount summary
- A large decorative opening quotation mark (Cormorant Garamond, oversized, gold, 20% opacity)
- The hadith or Quran verse in Cormorant Garamond italic, centered
- Citation in small DM Sans
- A thin gold divider
- The personalized reflection text in DM Sans
- A closing line in gold italic
- A "Share" button
- A "Continue →" button that appears after a 2-second delay

### Claude API call for post-commit reflection

Call the Anthropic API at `https://api.anthropic.com/v1/messages`. No API key in headers (handled by environment).

The prompt provides:
- The NGO name and cause category
- The amount committed
- The commitment type (Direct, Compound N cycles, Jariyah)
- Whether it was tagged to a vault person (and their name/relationship)
- The user's giving history summary (count of prior giving actions, cause categories previously given to)
- Which number this is for this category ("this is your 4th water cause")

The model is instructed to respond with valid JSON containing:
- `reflection`: 2-3 sentences, personalized to the specific action
- `verse_or_hadith`: an authentic, verified reference
- `source`: citation string
- `closing_line`: one final sentence

Claude is instructed to never fabricate citations and to use only authenticated hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Ahmad) and verified Quran references.

### Fallback reflections

If the API call fails or times out (5 second timeout), use pre-written fallback reflections stored in `src/utils/reflectionFallbacks.js`. Define one per cause category (water, food, orphan, medical, education, emergency, refugees). Each fallback includes a verified hadith and 2 sentences of reflection. These should be high quality — not generic Islamic quotes but specific to the cause.

### Weekly reflection

Uses the same overlay UI but different content. The Claude prompt provides the week's portfolio activity summary (families helped this week, loans repaid, cycles completed, vault entries added, streak count). The model generates a week-in-review in the same JSON format.

The "View this week's reflection" button triggers this. For the hackathon demo, every click shows fresh content from the API.

---

## Giving Streak

### What counts as a streak day

Any of these actions increments the streak counter and marks today as a giving day:
- Any monetary investment (Direct or Compound, any amount)
- Adding a new Jariyah Vault person
- Completing a payment (borrower account)

The streak is stored in PortfolioContext as:
- `streakCount` — current consecutive days (starts at 23 for the demo)
- `lastGivingDate` — date string of the most recent giving action
- `streakHistory` — array of the last 28 day records, each with `date` and `hasGiving` boolean

On any invest commit, `incrementStreak()` is called. It checks if `lastGivingDate !== today`. If it's a new day, increments the count and marks today in the history. If already given today, does nothing (no double-counting).

### Where the streak appears

**In the sidebar:** A small flame icon + "🔥 23 days" shown below the balance section. Always visible.

**As an expandable panel:** Clicking the sidebar streak badge expands a panel below the balance showing: current streak, the Bukhari hadith on consistency, smallest-ever giving day, total giving days this year, and a 28-day calendar grid (4 rows × 7 columns, green dots for giving days, empty circles for non-giving days). A "Give $1 to keep it going" button at the bottom of the panel pre-opens the invest modal with $1 and Direct mode pre-filled.

**In the weekly reflection:** Mentioned as one contextual data point by Claude.

### Streak break handling

If the user opens the app and `lastGivingDate` is more than 1 day ago, the streak resets to 0. The streak calendar still shows historical giving days accurately. The sidebar shows "🔥 0 days — start a new streak!" and the calendar shows the break point visually.

For the demo: the streak should never actually break (it starts at 23 and any invest action keeps it going). This is fine — the demo always shows a positive, active streak.

---

## Route Updates

Add to the portfolio routes:
- `/portfolio/vault` — Vault main page
- `/portfolio/vault/:personId` — Individual person impact feed
- `/portfolio/transactions` — Transaction ledger (added in Phase 1.1 but documented here as it integrates with Phase 1.2 transaction logging)

The Invest interface is a modal, not a route. It is triggered by calling `openInvest(causeId?)` from PortfolioContext, which sets `investModalOpen: true`. The modal renders at the AppShell level (above all page content) via `ReactDOM.createPortal`.

The SpiritualReflection overlay is also not a route. It renders when `reflectionData !== null` in context. After the Claude API returns data, set `reflectionData` and the overlay appears. On "Continue →", set `reflectionData: null` and it unmounts.

---

## Phase 1.2 Acceptance Criteria

**Invest interface:**
- [ ] Modal opens from all four entry points (sidebar, cause card, position card, streak panel)
- [ ] Cause pre-selection skips Step 1 and shows cause header bar
- [ ] Amount input shows live balance-remaining preview below it
- [ ] Insufficient balance shows red border and error message
- [ ] Direct/Compound toggle pre-selects correctly based on cause urgency
- [ ] Algorithm output card shows loading animation then real computed output
- [ ] `computeQardhassanDemand` runs against the real borrower pool
- [ ] Cycle chips update the Live Impact Preview in real time
- [ ] Jariyah chip has distinct gold/green styling
- [ ] Destination split slider shows hadith when moved below 100%
- [ ] Vault tagging step shows existing vault persons
- [ ] Confirm screen shows full summary with correct computed numbers
- [ ] "Total real-world good" number reflects `computeImpactPreview()` output
- [ ] On confirm: `investDirect()` or `investCompound()` called with correct args
- [ ] Balance debited correctly from `bankBalance` after commit
- [ ] New position appears in holdings grid after modal closes
- [ ] Streak increments after commit
- [ ] SpiritualReflection overlay opens after modal closes

**Capital flow:**
- [ ] Direct investment: balance decreases, position shows 'complete', transaction logged
- [ ] Compound investment: balance decreases, committedCapital increases, transaction logged
- [ ] Jariyah investment: balance decreases, committedCapital increases, perpetual position created
- [ ] Insufficient balance check works for all investment types
- [ ] Transaction ledger updated after every commit
- [ ] Transaction page shows new entries immediately after invest

**Jariyah Vault:**
- [ ] `/portfolio/vault` renders person grid with Ahmed Al-Farsi pre-seeded
- [ ] "Open an account" modal opens with 4 steps
- [ ] New person added to vault grid after creation
- [ ] Person photo/avatar renders (real photo if uploaded, initial circle if not)
- [ ] `/portfolio/vault/:personId` shows individual page with impact feed
- [ ] Ahmed Al-Farsi has 5 pre-written impact entries rendered
- [ ] "Share" button generates shareable image card
- [ ] Tagging an investment to a vault person works in the invest flow

**AI Reflection:**
- [ ] Post-commit overlay appears after every successful invest
- [ ] Loading state shows pulsing animation
- [ ] Claude API called with correct structured prompt
- [ ] Reflection displays verse, citation, reflection text, and closing line
- [ ] "Continue →" appears after 2-second delay
- [ ] Fallback reflections show if API fails (verify by testing with bad endpoint)
- [ ] "View this week's reflection" button on dashboard opens weekly reflection modal
- [ ] Weekly reflection uses different prompt and generates different content

**Giving Streak:**
- [ ] Streak badge visible in sidebar
- [ ] Clicking streak badge expands calendar panel
- [ ] 28-day calendar grid shows correct giving days (green) vs non-giving (empty)
- [ ] "Give $1" button pre-fills invest modal with $1 Direct
- [ ] Streak increments after any qualifying action
- [ ] No double-increment if multiple actions on same day
- [ ] Streak count in sidebar updates immediately after commit

---

## Notes for Claude Code

The invest modal must use `ReactDOM.createPortal` to render above the sidebar layout. Without portal rendering, the sidebar's z-index and overflow will clip the modal. Render the portal target as a `<div id="modal-root">` in `index.html`, and portal the modal into it.

The `computeQardhassanDemand` function must import the borrower pool from PortfolioContext (or pass it as a parameter). The borrower pool is what makes the algorithm real — it checks actual simulated demand, not a static formula.

The `computeImpactPreview` function uses the NGO's real `impactPerDollar` value from the fetched NGO database, not a hardcoded number. If the NGO data hasn't loaded yet, use a default of `$1 ≈ 2 meals` as a conservative estimate.

The `html2canvas` package should be added as a dependency for the shareable cards. Target a hidden div rendered off-screen (position: absolute, left: -9999px) with the card's content, run `html2canvas` on it, and trigger a download of the resulting PNG. The Web Share API can also be tried first (`navigator.share()`) before falling back to download.

The 2-second delay on "Continue →" in the reflection overlay is implemented with a `setTimeout` inside a `useEffect` that sets `showContinue: true`. It is NOT a disabled button — the button does not exist until the timer fires. This forces the user to at least glance at the reflection content.
