# MIZAN — Product Context & Application Overview
## Reference Document for Claude Code (Read Before All Build Phases)

---

## What Mizan Is

Mizan is an Islamic giving and community finance platform that combines a personal charitable investment portfolio with an interest-free (qard hassan) lending pool. The name means "the scale" in Arabic — the scale on which deeds are weighed on the Day of Judgment. Every feature of the app is designed to help a Muslim build the side of that scale that matters.

The core thesis: **treat your giving like the most important investment you'll ever make.** The app borrows the visual language of modern investment platforms (Robinhood, Coinbase) and redenominates every metric in spiritual terms. Portfolio value is measured in families helped. Returns are measured in sadaqah jariyah. There is no losing position — every act of giving is permanent.

---

## The Core Innovation: The Qard Hassan Cycle

The feature that makes Mizan genuinely different from every other Islamic giving platform is the **compound giving mechanic**.

In standard charity apps, $100 goes from donor to cause. In Mizan, a donor can choose to route their $100 through an interest-free loan pool first. The money gets lent to Muslims in financial need (for car repairs, tuition, rent — real emergencies), repaid without interest, lent again, repaid again — for as many cycles as the donor chooses. At the end of the final cycle, the money lands at the donor's chosen cause as sadaqah.

This is grounded in a hadith: *"Every loan given is sadaqah until it is repaid."* (Ibn Majah). The app makes this literal — a single dollar earns spiritual reward on every cycle of lending, and again when it becomes permanent sadaqah.

The donor picks how many cycles (1–10, or infinite Jariyah). The app's algorithm reads current pool demand and tells the donor how long each cycle takes based on real borrower need. The donor sees: "Your $300 will help ~6 families over ~15 months before landing at Yemen Orphan Fund as sadaqah. Total real-world good: ~$1,200."

This is not crypto. No blockchain, no tokens, no speculation. The "investment portfolio" framing is a UX metaphor only.

---

## The Four Account Types

The app has four distinct account types, each with its own entry point, navigation, and purpose. They share one underlying pool and data layer.

### 1. Personal Investment Portfolio
The primary account. For any Muslim who wants to give. They see their giving as a portfolio — each cause is a "position," Jariyah commitments are their long holds, and their dashboard shows an always-rising impact chart. This is the account most users will have.

### 2. Loan Applicant Account
For Muslims in genuine financial hardship who need an interest-free loan. They describe their situation in plain language, Claude extracts the structured application, an algorithm evaluates need relative to pool capacity, and approved borrowers receive funds. Repayment is tracked; defaults convert to sadaqah. No interest, no collections, no shame.

### 3. Community Hub Account
For mosque administrators. The mosque is the center of Muslim community finance — this account digitizes that role. Admins see aggregate giving from their congregation, manage Qard Hassan Circles (small groups who pool and vote on loans), vouch for borrowers, and see which events drive charitable behavior. This directly addresses how mosques have run informal lending circles ("kameti/committee") for generations.

### 4. NGO Partner Dashboard
For nonprofits like Islamic Relief. They create campaigns that appear in the Discover feed, see real-time fundraising data, understand their donor base through an intelligence panel, post impact updates that flow back to donors, and track Compound commitments (money currently cycling through loans on its way to their cause). This solves the specific problems Islamic Relief presented: donor data fragmentation, friction in giving flows, and donors not knowing where money goes.

---

## The Four-Account Closed Loop

The four accounts are not four products — they are four views of one system.

A **Personal Portfolio** user commits $300 on Compound mode to Yemen Orphan Fund. Their capital enters the pool. An approved **Loan Applicant** draws from that pool for a car repair. They repay. The money cycles to the next borrower. After 3 cycles, $300 lands at Yemen Orphan Fund. The **NGO Partner Dashboard** sees the settlement arrive. The **Community Hub** mosque that vouched for the borrower sees the loan closed successfully. The donor's portfolio shows 3 families helped on the way, then a final sadaqah entry.

No feature is isolated. Every action in one account type affects every other.

---

## Who the Users Are

**Personal Portfolio users:** Muslim adults, primarily 18–40, in the US. Tech-comfortable. They currently give sporadically through LaunchGood or at the mosque. They feel disconnected from where their money goes. They want to give more systematically but existing platforms feel transactional.

**Loan Applicants:** Low-to-moderate income Muslims facing genuine emergencies. Car repairs, rent gaps, tuition shortfalls, medical co-pays. They cannot access conventional loans without interest and have no alternative except informal borrowing from family. The algorithm is explicitly designed to serve them — not to filter them out for having low income.

**Community Hub admins:** Mosque executive directors, Islamic center administrators, MSA officers. They're currently managing giving circles and borrower vouching through WhatsApp and spreadsheets. They need a tool that respects the community trust dynamics of Islamic finance while bringing organization and visibility.

**NGO partners:** Fundraising and communications staff at Muslim nonprofits. Islamic Relief USA is the primary target partner and was the presenting sponsor at the hackathon where Mizan was built. The Partner Dashboard is explicitly designed to solve the four problems Islamic Relief presented: event system fragmentation, donor data inaction, community ROI blindness, and donation friction.

---

## Design Philosophy

**Dark luxury with spiritual weight.** The app is dark-themed (near-black background, gold as the primary brand color, teal as a secondary). The aesthetic is premium and calm — not a charity app that makes you feel guilty, not a crypto app that makes you feel greedy. Somewhere between the two: serious, intentional, spiritually grounded.

**Cormorant Garamond** is used for all display text, spiritual copy, and big numbers. It is a refined serif that feels neither corporate nor generic. It carries weight.

**DM Sans** is used for all UI copy, labels, and data. It is clean and modern without being sterile.

**Amiri** is used for Arabic text — Quranic verses, hadith citations, the Arabic wordmark.

**Gold is the primary brand color.** It is used for: the wordmark, primary buttons, active states, key metrics, Jariyah indicators, and the portfolio value number. Gold is associated with wealth in every culture — here it is akhirah wealth.

**Teal is the secondary color.** It is used for: qard hassan loan-related elements, water causes, and general secondary actions. It provides visual relief from gold without competing with it.

**The app never goes down.** The performance chart rises. The families-helped counter only increases. Completed positions are preserved, not deleted. Past giving is permanent — the UI reflects this at every point.

---

## Demo Context

Mizan was built for **hack.msa** — UT Austin MSA's first-ever hackathon (April 18–19, 2026, 250 participants, $5K prize pool). The hackathon tracks targeted were **Giving Back** and **General**.

Sponsors: Islamic Relief USA (primary), Replit (vibe coding workshop), Vertical Health (med tech track), Cordoba.

Islamic Relief USA was a workshop presenter. They showed four specific problems they want solved (event management, donor data → action, community ROI mapping, donation friction). Mizan's NGO Partner Dashboard is designed to address all four.

For demo purposes, all data is mocked but realistic. The demo flow is:
1. Welcome screen → select Personal Portfolio
2. Dashboard → see portfolio with live stats
3. Discover → SunnahDiscovery slot → tap Al-Noor Girls School
4. Invest → Compound mode → 3 cycles → 100% to cause → tag in father's name
5. Confirm → Spiritual Reflection overlay
6. Return to Dashboard → see new position card, streak updated
7. Journey tab → world map shows pins, log shows the new event
8. Back to Welcome → select NGO Dashboard → show Islamic Relief's campaign view

Total demo time target: 3 minutes.

---

## Key Terminology (for consistent copy throughout the app)

| Term | Definition | Never use |
|---|---|---|
| **Akhirah Portfolio** | The user's collection of giving positions | "charity account", "donation history" |
| **Position** | A single giving commitment to a cause | "donation", "transaction" |
| **Compound** | Giving mode where money cycles through loans first | "complex giving", "loan-based" |
| **Direct** | Giving mode where money goes immediately to cause | "standard giving", "regular donation" |
| **Jariyah** | Perpetual sadaqah — ongoing giving that continues forever | "recurring donation", "subscription giving" |
| **Cycle** | One full rotation through the qard hassan loan pool | "transaction", "round" |
| **Qard Hassan** | Interest-free loan | "Islamic loan", "zero-interest loan" |
| **Families Helped** | Primary impact metric (not dollars) | "amount raised", "dollars donated" |
| **Jariyah Vault** | Sub-account for giving in someone's name | "memorial account", "tribute fund" |
| **Pool** | The collective qard hassan lending fund | "fund", "reserve", "account" |
| **Settle / Settlement** | When Compound money finishes cycling and reaches the cause | "arrive", "complete transfer" |
| **Vouch** | Mosque admin endorsing a borrower's loan application | "approve", "verify" |

---

## What Mizan Is Not

- **Not a bank.** No banking license, no regulated lending. Qard hassan is mutual aid, not commercial credit.
- **Not crypto.** No tokens, no blockchain, no speculation. The investment portfolio framing is a UX metaphor only.
- **Not a Zakat calculator** (though one is scoped for Phase 2 post-hackathon).
- **Not a replacement for existing NGO CRMs.** The NGO Partner Dashboard exports to Salesforce, Mailchimp, and HubSpot — it feeds existing tools, not replaces them.
- **Not a social network.** There are no public profiles, no social feeds, no public donation amounts. Privacy is Islamic — giving is between you, the recipient, and Allah.

---

## Technical Principles for Claude Code

These apply across all build phases and override any default coding tendencies:

1. **Mobile-first, always.** Every component is designed for 390px viewport. Nothing should require a wide screen.
2. **No hardcoded colors.** Every color value must reference a CSS variable from `index.css`. Never write `#D4A843` in a component — write `var(--gold-mid)`.
3. **No hardcoded font families in components.** Use the CSS class system (`.text-display-lg`, `.text-body-md`) or reference the font variables. Never write `font-family: 'Cormorant Garamond'` inline in a component.
4. **All mock data lives in context files.** Never define mock data inside a component file. Import from the relevant context (`PortfolioContext`, etc.).
5. **Framer Motion for all transitions.** No CSS transitions for component mount/unmount — use Framer Motion's `AnimatePresence`. CSS transitions are fine for hover states and color changes within mounted components.
6. **Never mutate state directly.** All context state updates use the provided setter functions.
7. **The Claude API needs no API key in fetch headers.** The environment handles authentication. Include only `Content-Type: application/json`.
8. **Build phases are sequential.** Phase 1.1 must be complete before 1.2. Phase 1.2 before 1.3. Never skip ahead.
9. **Stub screens are temporary.** Every stub created in Phase X.1 will be fully replaced in Phase X.2 or X.3. Do not add functionality to stubs — they are routing placeholders only.
10. **Spiritual copy must be accurate.** Any Quran verse or hadith displayed in the app must use the citation format: "[English translation]" — Surah X:Y or [Collector], from [Narrator] (RA). Never fabricate citations.
