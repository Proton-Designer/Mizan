# MIZAN — NGO Partner Onboarding Flow (Revised & Standalone)
## Build Document for Claude Code

---

## Overview

This document replaces the NGO setup flow described in Phase 4.1. It specifies a realistic, multi-step onboarding experience where:

- **Step 1 (IRS Search)** — fully real. Calls the live IRS API and returns actual nonprofit records.
- **Step 2 (Record selection)** — real data from the IRS response drives the UI.
- **Step 3 (Document upload)** — simulated. Documents are pre-filled, the user just clicks Verify.
- **Step 4 (Cause Profile)** — simulated. Categories and countries seed the discovery algorithm.
- **Step 5A (Platform Integrations)** — simulated. 11 real platforms with logos, connection flows, and insight unlocks. Google Sheets has special import preview.
- **Step 5B (Bank Account)** — simulated. Starts connected for demo.
- **Step 6 (Launch)** — commits all state to NGOContext, enters dashboard.

The default demo state remains `verified: true` so judges land on the dashboard. This flow is accessed via `/ngo/setup` and is demoed intentionally as part of the pitch.

---

## Route

`/ngo/setup`

The flow lives entirely on this route. A step indicator at the top tracks progress. No sub-routes per step — use local state to manage which step is active.

A "← Back" link at the very top returns to the Welcome screen (not to the previous step — escaping the setup flow returns to account selection).

---

## Visual Design

**Layout:** Centered container, max-width 640px, auto margins, full-height page with vertical centering for the active step card.

**Step indicator:** A horizontal row of 7 steps at the top: 1 IRS Search → 2 Confirm Details → 3 Documents → 4 Cause Profile → 5A Platforms → 5B Bank → 6 Launch. Completed steps: filled gold circle with white checkmark. Active step: gold circle with step number, pulsing outer ring animation. Upcoming steps: empty circle, `var(--border-subtle)`.

**Step cards:** `var(--bg-surface)`, border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 40px. Each step card enters with a subtle slide-up + fade animation (`translateY(16px) → 0, opacity 0 → 1`, 300ms).

---

## Step 1 — IRS Nonprofit Search (REAL API CALL)

### What the user sees

A single focused screen. No sidebar, no other UI — just this.

**Header:**
"Find your organization." — Cormorant Garamond 600, 36px, `var(--text-primary)`.
"We'll verify your nonprofit status using IRS records." — DM Sans 400, 16px, `var(--text-secondary)`, italic, margin-top 8px.

**Search input:**

A large, prominent search field. Full width. Placeholder: "Enter your organization name or EIN..."

Below the input, a subtle helper: "Example: 'Islamic Relief' or '95-3253008'" — DM Sans 400, 12px, `var(--text-tertiary)`.

A gold "Search IRS Records →" button below the input. Full-width, height 52px.

**Validation:** Button is disabled if the input has fewer than 3 characters.

---

### The Real API Call

On button click, query the IRS EFTS API:

```
https://efts.irs.gov/LATEST/search-index?q=[encoded search term]&limit=10
```

This API is:
- Publicly accessible with no authentication
- CORS-accessible from the browser
- Returns real 501(c)(3) records from the IRS database
- Free, no rate limiting for reasonable use

**Loading state:** The button shows a spinner and "Searching IRS records..." text. The input is disabled. A subtle shimmer animation appears below the input where results will appear.

**Request:**
```javascript
const searchIRS = async (query) => {
  const encoded = encodeURIComponent(query)
  const response = await fetch(
    `https://efts.irs.gov/LATEST/search-index?q=${encoded}&limit=10`
  )
  const data = await response.json()
  return data.hits?.hits || []
}
```

**Response structure** (real IRS API format):
```json
{
  "hits": {
    "hits": [
      {
        "_source": {
          "org_name": "ISLAMIC RELIEF USA",
          "ein": "953253008",
          "city": "ALEXANDRIA",
          "state": "VA",
          "ntee_code": "Q33",
          "subsection_code": "03",
          "ruling_date": "199611",
          "asset_amount": "...",
          "income_amount": "..."
        }
      }
    ]
  }
}
```

**Parse the response** into a normalized array:
```javascript
const parseIRSResults = (hits) => hits.map(hit => ({
  name: hit._source.org_name,
  ein: hit._source.ein,
  city: hit._source.city,
  state: hit._source.state,
  nteeCode: hit._source.ntee_code,
  rulingDate: hit._source.ruling_date,
  verified501c3: hit._source.subsection_code === '03'
}))
```

---

### Results Display

**If results found (typical case):**

A results list appears below the search field with a smooth slide-down animation. Each result is a selectable card:

```
┌────────────────────────────────────────────────────────┐
│  ISLAMIC RELIEF USA                                    │
│  EIN: 95-3253008 · Alexandria, VA                     │
│  501(c)(3) Public Charity  ✓                          │
│  IRS ruling: November 1996                            │
│                                            [ Select ] │
└────────────────────────────────────────────────────────┘
```

Card styling: `var(--bg-elevated)`, border `var(--border-subtle)`, border-radius `var(--radius-lg)`, padding 16px 20px. On hover: border lifts to `var(--gold-mid)` at 40% opacity.

Each card shows:
- **Organization name** — DM Sans 700, 15px, `var(--text-primary)` (as returned by IRS — typically all caps, render as-is)
- **EIN** — formatted as XX-XXXXXXX (add hyphen after 2 digits: `ein.slice(0,2) + '-' + ein.slice(2)`)
- **City, State** — DM Sans 400, 13px, `var(--text-secondary)`
- **501(c)(3) badge** — green pill: "501(c)(3) Public Charity ✓" — only shown if `subsection_code === '03'`
- **IRS ruling date** — formatted: "IRS ruling: [Month Year]" — parsed from `ruling_date` (format: YYYYMM → "November 1996")
- **"Select →" button** — gold text link on the right

**"Select" on click:** Stores the selected record in local state, advances to Step 2.

---

**If no results found:**

```
┌────────────────────────────────────────────────────────┐
│  No IRS records found for "[query]"                   │
│                                                        │
│  Only IRS-registered 501(c)(3) organizations can     │
│  create a Partner account on Mizan.                  │
│                                                        │
│  If your organization is registered but not found:   │
│  · Try searching by EIN instead of name             │
│  · Check the exact legal name on your IRS letter    │
│  · Contact us if you believe this is an error       │
│                                                        │
│  [ Try a different search ]                          │
└────────────────────────────────────────────────────────┘
```

The "Try a different search" button resets the results and re-focuses the input. **The user cannot proceed past Step 1 without selecting a real IRS record.** This is the gate.

---

**If API fails (network error, CORS issue, timeout):**

```
⚠️ We couldn't reach IRS records right now.
   This is temporary — please try again in a moment.
   [ Retry ]
```

Do not show the "proceed without verification" path. The IRS lookup is the integrity mechanism.

---

## Step 2 — Confirm Organization Details

### What the user sees

The selected IRS record is displayed for review. The user confirms this is their organization and fills in contact details.

**Header:**
"Is this your organization?" — Cormorant Garamath 600, 32px.

**Selected record card (read-only, cannot be edited):**

```
┌────────────────────────────────────────────────────────┐
│  ✓ IRS Verified                                        │
│                                                        │
│  ISLAMIC RELIEF USA                                   │
│  EIN: 95-3253008                                      │
│  Alexandria, VA · 501(c)(3) · Ruling: Nov 1996       │
│                                                        │
│  [ ← Search again ]                                   │
└────────────────────────────────────────────────────────┘
```

Gold border, gold "✓ IRS Verified" badge in the top-right corner of the card. A green checkmark icon beside "IRS Verified". "Search again" link takes them back to Step 1.

**Contact information form (below the record card):**

"Tell us who will manage this account:" — DM Sans 500, 14px, uppercase, letter-spacing 0.06em, margin-bottom 16px.

Fields:
- **Organization website:** Text input, placeholder "yourorg.org" (no https:// required — strip it if entered). When filled, a small "Fetch logo →" link appears beside the field that calls Clearbit and previews the logo.
- **Contact name:** Text input, "Full name"
- **Contact title:** Text input, "Your role (e.g., Director of Digital Fundraising)"
- **Contact email:** Email input
- **Contact phone:** Tel input with formatting

**Logo preview:**

When the website field is filled and the user tabs away (or clicks "Fetch logo →"):
```javascript
const logoUrl = `https://logo.clearbit.com/${domain}`
```
Display a 48px × 48px logo preview with an `onError` fallback to an initials circle. Below the preview: "Logo fetched from your website. You can upload a different one in the next step." — DM Sans 400, 12px, italic.

"Continue →" gold primary button. Enabled when all required fields are filled (website, name, title, email).

On continue: store all data in local onboarding state. Advance to Step 3.

---

## Step 3 — Document Verification (SIMULATED)

### Philosophy

Real document verification takes 24-48 hours and involves human review. For the demo, the documents are "pre-uploaded" and verification is instant. The UI should feel like the documents are genuinely present — not like a placeholder.

### What the user sees

**Header:**
"Upload verification documents." — Cormorant Garamath 600, 32px.
"We require two documents to complete Tier 1 verification." — DM Sans 400, 16px, italic.

**Document 1 — IRS 501(c)(3) Determination Letter:**

A document upload card. But for the demo, this card starts in a "pre-uploaded" state:

```
┌────────────────────────────────────────────────────────┐
│  📄 IRS 501(c)(3) Determination Letter                │
│                                                        │
│  ✓ islamic-relief-determination-letter.pdf            │
│    Uploaded · 847 KB · PDF                           │
│                                                        │
│  [ Replace file ]                                     │
└────────────────────────────────────────────────────────┘
```

Card: `var(--bg-elevated)`, green left accent bar (3px), border `var(--border-subtle)`. The filename is realistic. "Replace file" link is present but clicking it opens a file picker — accepting any file and displaying its real name. For the demo, the pre-uploaded state is what the judge sees.

**Document 2 — Most Recent Form 990:**

Same card structure:

```
┌────────────────────────────────────────────────────────┐
│  📄 Form 990 (Most Recent Filing)                     │
│                                                        │
│  ✓ islamic-relief-990-2024.pdf                        │
│    Uploaded · 2.3 MB · PDF                           │
│                                                        │
│  [ Replace file ]                                     │
└────────────────────────────────────────────────────────┘
```

**Verify button:**

Below both document cards, a large gold primary button:

"Verify my organization →"

On click:
1. Button shows loading state: spinner + "Verifying with IRS records..." (1200ms)
2. A progress sequence runs:
   - 400ms: "Checking EIN 95-3253008..." 
   - 400ms: "Reviewing 501(c)(3) status..."
   - 400ms: "Confirming document validity..."
3. All three lines show green checkmarks
4. Button transforms to success state: green background, "✓ Verification complete"
5. After 800ms: advance to Step 4

The progress messages make the instant verification feel earned rather than trivially instant. Each line fades in with a 50ms stagger. All three show in sequence with `setTimeout` chains, not simultaneously.

---

## Step 4 — Cause Profile Setup

### What the user sees

**Header:**
"Tell donors what you stand for." — Cormorant Garamath 600, 32px.
"This information seeds the algorithm that matches your campaigns to relevant donors." — DM Sans 400, 15px, italic.

**Cause categories (multi-select chip grid):**

A wrap grid of category chips. Each chip is selectable (toggle). At least 1 required.

```
[Emergency relief] [Orphan care] [Clean water] [Education]
[Healthcare] [Refugee support] [Mosque & community] [Debt relief]
[Zakat distribution] [Food security] [Disaster response] [Women's programs]
```

Chip styling: `var(--bg-elevated)`, border `var(--border-subtle)`. Selected: gold background (`rgba(212,168,67,0.15)`), gold border, gold text. At least 1 must be selected to continue.

For the demo: Emergency relief, Orphan care, Clean water, Education are pre-selected.

**Countries of operation:**

A tag input. Type a country name and press Enter to add as a tag. Autocomplete from a list of 80 countries. Max 10 tags. Each tag shows with × to remove.

Pre-filled for demo: Yemen, Gaza, Somalia, Sudan, Pakistan, Bangladesh, Syria.

**Mission statement:**

A textarea. Max 300 characters. Counter in the corner. Placeholder: "Describe your organization's mission in 2-3 sentences."

Below the textarea: "A clear, specific mission statement improves your campaigns' performance in the Discover feed." — advisory text.

**Impact metric (optional but recommended):**

"What does $1 do at your organization?" — label.

Two inputs: `$1 = [number] [unit]` — same as Phase 4.2's campaign creation. Pre-filled: "2 meals."

"Continue →" enabled when at least 1 category selected, at least 1 country, and mission is filled.

---

## Step 5 — Connect Your Existing Platforms (SIMULATED)

This step is now split into two sub-steps:

**5A — Donation & Payment Platforms** (where money comes in)
**5B — Bank Account** (where money goes out)

Both sub-steps live within Step 5. A small secondary progress indicator ("5 of 6 · Step A of 2") sits below the main step dots.

---

### Step 5A — Connect Donation & Payment Platforms

**Header:**
"Connect your existing tools." — Cormorant Garamond 600, 32px.
"Mizan syncs with the platforms you already use. Donations recorded there automatically appear here." — DM Sans 400, 15px, italic.

---

**Search bar:**

A prominent search input at the top of the platform grid. Full-width, height 44px, placeholder: "Search platforms..." — `Search` icon on the left. Filters the platform cards in real time as the user types. Case-insensitive match against platform name and category.

---

**Platform Grid:**

A 3-column grid of platform cards (on the 640px max-width container: 3 columns of ~190px each). All 11 platforms displayed by default. Grid collapses to 2 columns if search narrows to ≤6 results, to 1 column if ≤3 results.

Each platform card: `var(--bg-elevated)`, border `var(--border-subtle)`, border-radius `var(--radius-lg)`, padding 16px, `cursor: pointer`, `whileTap={{ scale: 0.97 }}`. On hover: border lifts to `var(--gold-mid)` at 30% opacity.

**The 11 platforms — exact data:**

```javascript
const PLATFORMS = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: 'https://logo.clearbit.com/stripe.com',
    category: 'Payment processing',
    description: 'Process donations and recurring gifts. Auto-syncs all transactions.',
    color: '#635BFF',
    popular: true,
    connectField: { label: 'Stripe publishable key', placeholder: 'pk_live_...' },
    validation: (val) => val.startsWith('pk_'),
    connectedLabel: 'Stripe account connected · Syncing donations',
    insight: 'Unlocks real-time donation feed, donor RFM scoring, and failed payment recovery alerts.'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'https://logo.clearbit.com/salesforce.com',
    category: 'Donor CRM',
    description: 'Sync donor records, gift history, and segments with your Salesforce NPSP.',
    color: '#00A1E0',
    popular: true,
    connectField: { label: 'Salesforce instance URL', placeholder: 'https://yourorg.my.salesforce.com' },
    validation: (val) => val.includes('salesforce.com'),
    connectedLabel: 'Salesforce NPSP connected · Donor records syncing',
    insight: 'Unlocks bidirectional donor sync, campaign member tracking, and opportunity pipeline in Mizan.'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    logo: 'https://logo.clearbit.com/quickbooks.intuit.com',
    category: 'Accounting',
    description: 'Pull program expense data and fund accounting for real-time efficiency metrics.',
    color: '#2CA01C',
    popular: false,
    connectField: { label: 'QuickBooks company ID', placeholder: '1234567890' },
    validation: (val) => val.length >= 6,
    connectedLabel: 'QuickBooks connected · Pulling expense data',
    insight: 'Unlocks live program efficiency %, budget vs. actual, and restricted fund tracking on campaign pages.'
  },
  {
    id: 'bloomerang',
    name: 'Bloomerang',
    logo: 'https://logo.clearbit.com/bloomerang.co',
    category: 'Donor CRM',
    description: 'Import donor engagement scores, giving history, and lapsed donor flags.',
    color: '#F47920',
    popular: false,
    connectField: { label: 'Bloomerang API key', placeholder: 'bl_live_...' },
    validation: (val) => val.length >= 8,
    connectedLabel: 'Bloomerang connected · Importing donor records',
    insight: 'Unlocks Bloomerang engagement scores layered onto Mizan donor segments and RFM analysis.'
  },
  {
    id: 'donorbox',
    name: 'Donorbox',
    logo: 'https://logo.clearbit.com/donorbox.org',
    category: 'Fundraising',
    description: 'Sync campaigns, recurring donors, and peer-to-peer fundraising data.',
    color: '#F5594F',
    popular: false,
    connectField: { label: 'Donorbox organization slug', placeholder: 'your-org-name' },
    validation: (val) => val.length >= 3,
    connectedLabel: 'Donorbox connected · Syncing campaigns',
    insight: 'Unlocks Donorbox recurring donor data, campaign performance comparison, and peer fundraiser tracking.'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://logo.clearbit.com/paypal.com',
    category: 'Payment processing',
    description: 'Import PayPal donations including Giving Fund, Venmo, and in-person QR codes.',
    color: '#003087',
    popular: true,
    connectField: { label: 'PayPal client ID', placeholder: 'AXxx...' },
    validation: (val) => val.startsWith('A') && val.length >= 10,
    connectedLabel: 'PayPal connected · Syncing transactions',
    insight: 'Unlocks PayPal Giving Fund attribution, Venmo donor identification, and QR code source tracking.'
  },
  {
    id: 'zeffy',
    name: 'Zeffy',
    logo: 'https://logo.clearbit.com/zeffy.com',
    category: 'Fundraising',
    description: '100% free fundraising platform. Import all campaigns and donor data with zero fees.',
    color: '#7C3AED',
    popular: false,
    connectField: { label: 'Zeffy organization email', placeholder: 'admin@yourorg.org' },
    validation: (val) => val.includes('@'),
    connectedLabel: 'Zeffy connected · Importing campaigns',
    insight: 'Unlocks Zeffy campaign data with zero-fee donation attribution alongside paid platform comparisons.'
  },
  {
    id: 'launchgood',
    name: 'LaunchGood',
    logo: 'https://logo.clearbit.com/launchgood.com',
    category: 'Muslim fundraising',
    description: 'The Muslim crowdfunding platform. Sync campaigns, backers, and Ramadan giving data.',
    color: '#1A6B4A',
    popular: true,
    connectField: { label: 'LaunchGood campaign URL or username', placeholder: 'launchgood.com/yourorg' },
    validation: (val) => val.length >= 4,
    connectedLabel: 'LaunchGood connected · Syncing Muslim donor base',
    insight: 'Unlocks LaunchGood campaign performance, Ramadan spike analysis, and Muslim donor segment overlap with Mizan.'
  },
  {
    id: 'googlesheets',
    name: 'Google Sheets',
    logo: 'https://logo.clearbit.com/sheets.google.com',
    category: 'Spreadsheets',
    description: 'Import donor lists, event data, or mosque records directly from a shared spreadsheet.',
    color: '#0F9D58',
    popular: false,
    connectField: { label: 'Google Sheets share link', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
    validation: (val) => val.includes('docs.google.com/spreadsheets'),
    connectedLabel: 'Google Sheets connected · Reading your data',
    insight: 'Unlocks spreadsheet import for mosque visit logs, donor lists, and event tracking — no Salesforce required.'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    logo: 'https://logo.clearbit.com/mailchimp.com',
    category: 'Email marketing',
    description: 'Sync donor segments as Mailchimp audiences. Send targeted campaigns from Mizan.',
    color: '#FFE01B',
    popular: false,
    connectField: { label: 'Mailchimp API key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us21' },
    validation: (val) => val.includes('-us') || val.length >= 20,
    connectedLabel: 'Mailchimp connected · Syncing audiences',
    insight: 'Unlocks two-way segment sync: lapsed donors in Mizan auto-populate a Mailchimp re-engagement list.'
  },
  {
    id: 'networkforgood',
    name: 'Network for Good',
    logo: 'https://logo.clearbit.com/networkforgood.com',
    category: 'Donor management',
    description: 'Import donation history, donor profiles, and automated acknowledgment data.',
    color: '#E8453C',
    popular: false,
    connectField: { label: 'Network for Good account email', placeholder: 'admin@yourorg.org' },
    validation: (val) => val.includes('@'),
    connectedLabel: 'Network for Good connected · Importing donors',
    insight: 'Unlocks donor acknowledgment history and giving society tier data for personalized outreach.'
  }
]
```

**"Popular" badge:** Stripe, Salesforce, PayPal, and LaunchGood have a small gold "Popular" badge in the top-right corner of their card. DM Sans 500, 10px, gold background `rgba(212,168,67,0.15)`, gold text, pill shape.

**Card layout (each platform card):**

```
┌──────────────────────────────┐
│  [logo 32px]  Stripe  Popular│
│  Payment processing          │
│                              │
│  Process donations and       │
│  recurring gifts. Auto-      │
│  syncs all transactions.     │
│                              │
│  [ Connect → ]               │
└──────────────────────────────┘
```

- Logo: 32px × 32px, fetched from Clearbit, `onError` fallback to colored initials circle using the platform's `color` field
- Platform name: DM Sans 700, 14px, `var(--text-primary)` — inline with logo
- Category: DM Sans 400, 11px, `var(--text-tertiary)`, below the name row
- Description: DM Sans 400, 12px, `var(--text-secondary)`, line-height 1.5, 3 lines max with ellipsis
- "Connect →" — DM Sans 500, 13px, `var(--gold-mid)`, text button at the bottom

**Already-connected state (for the demo — Stripe pre-connected):**

```
┌──────────────────────────────┐
│  [logo]  Stripe     ✓ Live   │
│  Payment processing          │
│                              │
│  Stripe account connected    │
│  Syncing donations           │
│                              │
│  [ Disconnect ]              │
└──────────────────────────────┘
```

Border: `1px solid var(--status-green)` at 40% opacity. Green "✓ Live" badge top-right. "Disconnect" text is `var(--status-red)` small text. The insight line appears below the card when connected (outside the card, below it):

"💡 Unlocks real-time donation feed, donor RFM scoring, and failed payment recovery alerts." — DM Sans 400, 12px, italic, `var(--text-secondary)`, margin-top 8px.

---

**Connection Flow (triggered by "Connect →" on any platform):**

Clicking "Connect →" opens a centered modal dialog (400px wide). The modal has:

**Modal header:** Platform logo (40px) + platform name + "Connect [Platform]" — Cormorant Garamond 500, 20px.

**Input field:** The platform's `connectField.label` as the field label, `connectField.placeholder` as the placeholder. A single text input, full-width.

**Validation hint:** Below the input, in `var(--text-tertiary)`: 
- Stripe: "Your publishable key starts with pk_live_ or pk_test_"
- Salesforce: "Find this in Setup → Company Settings → My Domain"
- Google Sheets: "Share your Sheet as 'Anyone with the link can view' first"
- Other: Platform-specific guidance

**"Connect [Platform]" button:** Gold primary, full-width, disabled until input passes the platform's `validation` function.

**On button click (simulated connection flow):**

1. Button shows spinner + "Connecting to [Platform]..." (1000ms)
2. A progress sequence (platform-specific):

   **Stripe:** "Verifying API key..." → "Fetching account details..." → "Syncing recent transactions..."
   
   **Salesforce:** "Authenticating with Salesforce..." → "Checking NPSP installation..." → "Mapping donor fields..."
   
   **QuickBooks:** "Connecting to QuickBooks Online..." → "Locating chart of accounts..." → "Reading program expenses..."
   
   **Bloomerang:** "Verifying API key..." → "Fetching donor records..." → "Importing engagement scores..."
   
   **Donorbox:** "Locating organization..." → "Fetching campaign data..." → "Importing recurring donors..."
   
   **PayPal:** "Authenticating client ID..." → "Accessing transaction history..." → "Matching to donor profiles..."
   
   **Zeffy:** "Finding your organization..." → "Fetching campaign history..." → "Importing donor list..."
   
   **LaunchGood:** "Locating campaign..." → "Fetching backer data..." → "Importing Ramadan giving history..."
   
   **Google Sheets:** "Fetching spreadsheet..." → "Reading column headers..." → "Importing [N] rows of data..."
   
   **Mailchimp:** "Verifying API key..." → "Fetching audience lists..." → "Mapping subscriber segments..."
   
   **Network for Good:** "Verifying credentials..." → "Fetching donor profiles..." → "Importing acknowledgment history..."

3. Each step: 300ms apart, green checkmark fades in beside each line as it completes.

4. After all steps complete: modal shows success state:

```
✓ [Platform] connected successfully

[Platform name] is now syncing with Mizan.
[Platform's connectedLabel]

What this unlocks:
[Platform's insight text]

[ Done ]
```

"Done" closes the modal. The platform card in the grid updates to the connected state (green border, "✓ Live" badge, insight line below).

---

**Google Sheets — Special Handling:**

For Google Sheets specifically, after the connection sequence, simulate an actual data preview. The "Fetching spreadsheet..." step should show a brief skeleton table animation, then display a real-looking data preview:

```
┌────────────────────────────────────────────────────────┐
│  Preview — 3 columns detected, 47 rows                 │
│                                                        │
│  MOSQUE NAME            LAST VISIT    AMOUNT RAISED   │
│  Islamic Society of...  10/31/2025    —               │
│  Islamic Center of ...  10/3/2025     —               │
│  Chino Valley Islamic…  9/19/2025     —               │
│  ...                                                   │
│                                                        │
│  [ Import 47 rows into Community Hub ]                 │
└────────────────────────────────────────────────────────┘
```

This preview exactly mirrors the spreadsheet the judge showed on the projector — mosque name, last visit, amount raised. Even though the data is simulated, the column structure is real. The "Import 47 rows into Community Hub" button is a second moment — clicking it simulates importing the mosque list into the Community Hub's congregation data.

---

**"Skip for now" link:**

Below the platform grid (outside the search results): "Skip — I'll connect platforms later →" — DM Sans 400, 13px, `var(--text-tertiary)`. Navigates directly to Step 5B. At least one platform must be connected OR the user must explicitly skip.

**Step 5A summary bar (bottom of step):**

Once at least one platform is connected, a summary bar appears above the Continue button:

```
Connected: [Stripe logo] [Salesforce logo]   +  Add more
```

Shows logos of connected platforms. "Add more" reopens the grid.

"Continue to bank account →" — gold primary, appears once ≥1 platform connected OR skip was chosen.

---

### Step 5B — Bank Account Connection

**Header:**
"Where should we send your funds?" — Cormorant Garamond 600, 32px.
"Settled donations and completed Compound cycles are deposited to your linked account." — DM Sans 400, 15px, italic.

**Three connection method cards (same as original spec):**

Plaid / Stripe Payouts / Manual bank details — same layout as original, same simulated flow.

**For the demo:** Starts in "Chase Bank ****8821 connected" state.

**Connected state:**

```
┌────────────────────────────────────────────────────────┐
│  🏦 Chase Bank ****8821                               │
│  ✓ Connected · ACH routing: 021000021                │
│  [ Change account ]                                   │
└────────────────────────────────────────────────────────┘
```

"Continue →" enabled when bank is connected (always in demo).

---

## Step 6 — Launch & Dashboard Preview

*[This step is unchanged from the original spec — see below.]*

---

## Step 6 — Launch & Dashboard Preview

### What the user sees

**Header:**
"You're ready." — Cormorant Garamath 600, 40px, centered.

A brief animated celebration — not confetti (too playful) but a gentle gold radial pulse from the center of the screen (the same radial glow used in hero cards, but animated: opacity 0 → 0.3 → 0.1 over 1.5 seconds).

**Summary card:**

```
┌────────────────────────────────────────────────────────┐
│  Account Summary                                       │
│                                                        │
│  Organization: ISLAMIC RELIEF USA                     │
│  EIN: 95-3253008 · IRS Verified ✓                    │
│  Contact: Aisha Rahman · aisha@irusa.org              │
│  Verification: Tier 1 (documents reviewed)           │
│  Bank: Chase Bank ****8821 · Connected               │
│  Causes: Emergency relief · Orphan care · +3 more    │
│  Countries: Yemen · Gaza · Somalia · +4 more         │
└────────────────────────────────────────────────────────┘
```

Card: `var(--bg-elevated)`, gold border (1px), border-radius `var(--radius-xl)`, padding 24px.

**What's next section:**

Three cards in a row explaining what they can do now:

```
[🚀 Launch your first campaign]
Create a fundraising campaign that appears in the Discover feed immediately.

[👥 Invite your team]
Add staff members with role-based access to your account.

[📊 Connect Stripe]
Sync your existing donation data for real-time analytics.
```

Each card: `var(--bg-surface)`, border `var(--border-subtle)`, icon + title + 1-line description, a small arrow →. Clicking any of them navigates to the relevant section after dashboard entry.

**Primary CTA:**

"Enter my dashboard →" — gold primary, full-width, 56px height.

On click:
1. Set `verified: true` in NGOContext
2. Store all onboarding data in NGOContext: org name, EIN, website, logo URL, categories, countries, mission, bank details
3. Set `bankConnected: true`
4. Navigate to `/ngo` (the main dashboard)
5. The dashboard hero card immediately shows the real org name and EIN fetched from IRS

---

## State Management During Onboarding

Use a single `useReducer` in the onboarding component (not NGOContext — keep onboarding state local until Step 6 commits it):

```javascript
const initialOnboardingState = {
  currentStep: 1,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,
  selectedIRSRecord: null,   // the raw IRS API record
  website: '',
  logoUrl: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  documentsVerified: false,
  selectedCategories: [],
  countries: [],
  mission: '',
  impactMetric: { amount: '', unit: '' },
  bankConnected: false,
  bankName: '',
  bankLast4: '',
}
```

On Step 6 "Enter my dashboard →": dispatch all state to NGOContext via a single `initializeNGO(onboardingState)` action.

---

## Error Handling

**IRS API network failure:**
Show retry button. Do not allow proceeding. The API is the integrity mechanism.

**IRS API returns results but none are 501(c)(3):**
Show the results but disable the Select button with a tooltip: "This organization is not a 501(c)(3) public charity. Only public charities can create partner accounts." Show `subsection_code` check: only `'03'` is eligible.

**Clearbit logo fails:**
Fall back silently to initials circle. No error shown to user.

**All form validation:**
Inline, below the relevant field, in `var(--status-red)`, 12px. Never toast for form errors — keep them adjacent to the problematic field.

---

## Demo Script for This Flow

The onboarding should be demoed as follows during the pitch:

1. Navigate to `/ngo/setup`
2. Type "Islamic Relief" into the search field
3. Click "Search IRS Records →"
4. Watch the real IRS results appear (this is live data — the org is genuinely in the IRS database)
5. Click "Select →" on the Islamic Relief USA record
6. Show the IRS-verified record card, fill in Aisha Rahman's contact info
7. Click "Continue →" — the Clearbit logo loads from their real website
8. On Step 3: show the pre-uploaded documents, click "Verify" — watch the three-line progress sequence
9. Step 4: cause categories already pre-selected, continue
10. Step 5: bank already connected, continue
11. Step 6: "Enter my dashboard →" — land on the fully populated dashboard

**The moment that lands:** When the IRS search returns real data and the judge can see it's actually querying the IRS database in real time, not showing fake results. That one moment — a live government database confirming this real nonprofit exists — makes the entire simulation around it feel credible.

---

## What the Other Account Onboarding Flows Should Simulate

Since you asked what the next pipeline steps should look like — here's how to apply the same pattern to all 4 accounts:

### Personal Portfolio Account — Simulated Bank Connection

**Real:** Nothing (can't do real banking auth in a hackathon)
**Simulated:** A bank selector (Chase, BofA, Wells Fargo, University Credit Union) + fake account number input + "✓ $5,000 loaded for demo" confirmation
**The real moment:** The balance is live — every invest action actually debits it

### Borrower Account — Community Vouch

**Real:** The Claude API extraction from the intake form (Phase 2.1 — build this tonight)
**Simulated:** The imam SMS vouch (show "Sheikh Abdullah notified" state)
**The real moment:** When Claude actually reads their typed situation and extracts structured data in real time

### Community Hub — EIN Verification (same as NGO)

**Real:** Query the IRS API with the mosque's EIN
**Simulated:** The ISNA/ICNA directory check, the 48-hour human review
**The real moment:** The IRS returns the real mosque name and 501(c)(3) status

### NGO Partner — Full flow as specced above

**Real:** IRS search, Clearbit logo, the EIN in the verified card
**Simulated:** Document review, bank connection, Stripe integration
**The real moment:** Searching "Islamic Relief" and watching real IRS records appear

---

## Acceptance Criteria

- [ ] Step 1: Search input enabled with ≥3 characters
- [ ] Step 1: Real fetch to `efts.irs.gov/LATEST/search-index` fires on button click
- [ ] Step 1: Loading state shows "Searching IRS records..." with spinner
- [ ] Step 1: Results render as selectable cards with EIN, city, state, 501(c)(3) badge
- [ ] Step 1: EIN formatted with hyphen (95-3253008 not 953253008)
- [ ] Step 1: Ruling date parsed from YYYYMM to human-readable
- [ ] Step 1: Non-501(c)(3) results are shown but cannot be selected (disabled with tooltip)
- [ ] Step 1: No-results state shows honest "cannot proceed" message
- [ ] Step 1: API failure shows retry button only — no bypass
- [ ] Step 2: Selected IRS record shown as read-only gold-bordered card
- [ ] Step 2: "Search again" returns to Step 1 and clears selection
- [ ] Step 2: Clearbit logo fetches when website is entered, shows initials fallback on error
- [ ] Step 2: All contact fields validate before Continue enables
- [ ] Step 3: Both document cards show pre-uploaded state by default
- [ ] Step 3: "Replace file" opens real file picker and updates filename on selection
- [ ] Step 3: Verify button shows 3-line progress sequence with stagger
- [ ] Step 3: Each progress line fades in with checkmark after delay
- [ ] Step 3: Automatically advances to Step 4 after sequence completes
- [ ] Step 4: Category chips toggle correctly, minimum 1 required
- [ ] Step 4: Country tag input with autocomplete works
- [ ] Step 4: Mission textarea has char counter
- [ ] Step 5: Bank connection cards render all 3 methods
- [ ] Step 5: Starts in "Chase Bank ****8821 connected" state for demo
- [ ] Step 5: Simulated Plaid flow works if "Change account" is tapped
- [ ] Step 6: Summary card shows real IRS data (org name, EIN from Step 1)
- [ ] Step 6: Logo from Clearbit shows in summary card
- [ ] Step 6: "Enter my dashboard" commits all state to NGOContext
- [ ] Step 6: Dashboard hero card shows real org name and EIN after entry
- [ ] Step progress indicator updates correctly throughout
- [ ] "Back" within steps returns to previous step (not to Welcome)
- [ ] The top "← Back to accounts" link always returns to Welcome
- [ ] No console errors throughout the entire flow

## Acceptance Criteria — Step 5A Platform Integrations (Additions)

- [ ] Search bar filters platform cards in real time (case-insensitive)
- [ ] All 11 platform cards render with Clearbit logos and initials fallback on error
- [ ] Stripe, Salesforce, PayPal, LaunchGood show gold "Popular" badge
- [ ] Clicking "Connect →" on any platform opens the modal
- [ ] Modal shows the platform's logo, name, and correct connectField label/placeholder
- [ ] "Connect" button in modal disabled until input passes platform's validation function
- [ ] Stripe: validates `val.startsWith('pk_')` — entering "pk_test_abc" enables the button
- [ ] Salesforce: validates `val.includes('salesforce.com')`
- [ ] Google Sheets: validates `val.includes('docs.google.com/spreadsheets')`
- [ ] All platforms: connection sequence runs with platform-specific step labels (not generic)
- [ ] Each step in the sequence fades in with green checkmark, 300ms stagger
- [ ] After sequence completes: modal shows success state with connectedLabel and insight text
- [ ] Closing the modal: platform card updates to connected state (green border, "✓ Live" badge)
- [ ] Insight line appears below connected platform card
- [ ] Google Sheets: after connection sequence, shows data preview with mosque columns (Name, Last Visit, Amount Raised)
- [ ] Google Sheets: "Import 47 rows into Community Hub" button populates Community Hub data
- [ ] Connected platforms logos appear in the summary bar at the bottom of Step 5A
- [ ] "Skip for now" link navigates to Step 5B without connecting any platform
- [ ] "Continue to bank account →" appears after ≥1 platform connected OR skip chosen
- [ ] Demo starts with Stripe already connected (green border visible on Stripe card on load)
- [ ] Step 6 summary card shows icons of all connected platforms alongside bank info
