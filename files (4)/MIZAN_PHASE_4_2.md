# MIZAN — Phase 4.2: NGO Partner Dashboard — Campaigns Tab
## Build Document for Claude Code

---

## Prerequisites

Phase 4.1 must be complete. NGOContext, all simulated data, and the dashboard must be working. Phase 4.2 builds the Campaigns tab — where NGOs create and manage their fundraising campaigns, monitor live funding, and post impact updates that trigger real cross-account donor notifications.

---

## Phase 4.2 Scope

1. **Campaigns list** — Active, Draft, and Closed tabs with status indicators and quick actions
2. **Campaign creation wizard** — 5-step flow that creates a live campaign in the Phase 1.3 Discover algorithm
3. **Individual campaign management page** — live funding dashboard with Compound breakdown, geographic donor heatmap, and the impact reporting module
4. **Impact Update Modal** — the cross-account notification system with the 5-channel preview

---

## Campaigns Tab

### Route

`/ngo/campaigns`

### Layout

Full content area. The campaigns list is a single-column stack of campaign cards. The individual campaign management page uses a two-column layout (main content 65% + right sidebar 35%).

---

### Campaigns List Screen

**Page header:**

"Your Campaigns" — Cormorant Garamond 600, 32px.

"+ New Campaign" — gold primary button, positioned top-right of the header row. Navigates to `/ngo/campaigns/new`.

**Status tab pills:** [Active (4)] [Drafts (1)] [Closed (7)]. Active tab highlighted with gold bottom border + gold text. Default: Active.

---

**Active campaign cards:**

Each card is a wide, dense admin row card (not as compact as the dashboard's horizontal cards — this is the management view with more actions available).

Card: `var(--bg-surface)`, gold left accent bar (4px), border `var(--border-subtle)`, border-radius `var(--radius-xl)`, padding 24px, margin-bottom 12px.

**Yemen Orphan Fund card (full spec):**

First row: "Yemen Orphan Fund" — DM Sans 700, 16px. Beside it inline: "Active" badge (green pill) and "Tier 1 ✓" badge (gold pill).

Second row: "Created January 2026" — DM Sans 400, 12px, `var(--text-tertiary)`.

Stats row: "$8,400 raised · 247 donors · 18 Jariyah commitments" — DM Sans 400, 14px.

Compound in-transit line: "Compound in-transit: $3,200 ⟳ · 14 active positions" — gold, DM Sans 500, 14px.

Funding bar: Full width, 12px height, gold fill at 70%, label below: "Goal: $12,000 · 70% complete · $3,600 remaining" — DM Sans 400, 12px.

Two status indicators (right-aligned on the same row):
- "Discover ranking: Top 12% this week" — teal badge
- "Last impact update: 3 days ago ✓" — green because <7 days old

Action buttons row at bottom (three buttons):
- "Manage →" — gold primary button (navigates to `/ngo/campaigns/camp-001`)
- "Post Impact Update" — teal ghost button (opens the impact update modal for this campaign)
- "View on Discover →" — text link (opens Discover feed showing this campaign's card)

**Gaza Emergency Fund card:**

Same layout. The funding bar is 100% green with a "Goal met ✓" label instead of percentage. An amber advisory badge: "Consider: extend or close campaign" — links to campaign management.

**Discover ranking color coding:**
- Top 0-15%: teal badge — strong performance
- Top 15-35%: yellow badge — good performance
- Top 35-60%: gray badge — average
- Top 60%+: red badge — needs improvement

The ranking percentile is computed from the scoring algorithm. After an impact update is posted, urgency score increases and ranking improves within the same session.

**"Last impact update" color coding:**
- < 7 days: green ✓ ("3 days ago ✓")
- 7-30 days: yellow ⚠️ ("2 weeks ago ⚠️")
- > 30 days: red 🔴 ("45 days ago 🔴 — donors are waiting")

**Drafts tab:**

One draft card for "Sudan Crisis Fund Winter 2026". Shows: "Draft · Incomplete" badge. Progress bar for draft completion: "2 of 5 steps complete." Two actions: "Continue editing →" and "Discard draft."

**Closed campaigns tab:**

A compact sortable table (not full cards — space-efficient for historical data):

| Campaign | Created | Closed | Raised | Donors | Outcome |
|---|---|---|---|---|---|
| Palestine Relief Fund | Oct 2024 | Dec 2024 | $22,400 | 847 | Goal met ✓ |
| Ramadan Food Drive 2025 | Mar 2025 | Apr 2025 | $8,100 | 312 | Goal met ✓ |
| Sudan Flood Emergency | Jun 2024 | Aug 2024 | $11,200 | 503 | Goal met ✓ |
| Bangladesh Education | Jan 2025 | Mar 2025 | $4,400 | 189 | Partial (44%) |
| Morocco Earthquake Relief | Sep 2023 | Nov 2023 | $18,900 | 672 | Goal met ✓ |
| Pakistan Flood Relief | Jul 2024 | Sep 2024 | $14,200 | 511 | Goal met ✓ |
| Somalia Drought 2024 | Apr 2024 | Jun 2024 | $9,800 | 378 | Goal met ✓ |

Columns sortable by clicking headers. Table uses standard web table styling: alternating row backgrounds, gold column header accent. An "Archived" badge on each row. A "Reopen campaign →" button on each row (mocked — shows "Reopening coming soon" toast on click).

---

## Campaign Creation Wizard

### Route

`/ngo/campaigns/new`

5-step centered flow, max-width 720px, centered, step progress bar at top. Breadcrumb: "Campaigns → New Campaign."

---

### Step 1 — Campaign Basics

**Campaign name:** Large text input, Cormorant Garamond 500 for the typed text. Placeholder: "e.g., Yemen Orphan Fund Winter 2026."

**Primary cause category:** Select/dropdown. All categories from Phase 1.1's taxonomy: Emergency relief / Orphan care / Clean water / Education / Healthcare / Refugee support / Mosque & community / Debt relief.

**Secondary cause (optional):** Same dropdown, only available after primary is selected.

**Countries of impact:** A tag input. Type country name → Enter to add as tag. Autocomplete from 60 countries. Max 5 tags. Tags show with × to remove.

**Funding goal:** Number input + "No specific goal" toggle. When "No specific goal" is toggled on, input grays out. Helper text below: "Campaigns with specific goals show progress bars in the Discover feed — goals create urgency. We recommend setting one."

**Campaign duration:** Two large radio cards:
- "Open-ended — runs until you close it" — with sub-label "Best for ongoing programs"
- "Set end date" — reveals a date picker when selected, with sub-label "Creates time pressure — good for emergency campaigns"

"Continue →" enabled when name, primary category, and at least 1 country are filled.

---

### Step 2 — Campaign Description

**Short description (120 char max):**

A textarea with a live character counter in the corner (styled like Twitter's char counter — circle filling up, turns red near limit). Label: "Appears on your Discover card."

Placeholder: "$1 = 2 meals for an orphan in Yemen. Funds provide food, education, and shelter for 40 children."

**Full description (no limit):**

A larger textarea. Label: "Appears on your campaign detail page." Placeholder helps the NGO know what to write: "Include: who you serve, where programs operate, how funds are used, and why this campaign matters now."

**Impact metric — the most important field on this step:**

Two inputs on the same row:
- "$1 = [____]" — a number input (e.g., 2)
- "[____]" — a text input (e.g., "meals for an orphan in Yemen")

A live preview below: "$1 = 2 meals for an orphan in Yemen" — Cormorant Garamond 500, 18px, updates in real time.

Below the preview: "This single line appears on every campaign card in the Discover feed, and on each donor's portfolio position card. Specific, tangible metrics outperform generic ones. '$1 = 2 meals' converts 3× better than 'your donation helps children.'" — DM Sans 400, 13px, italic, `var(--text-secondary)`.

**"Need inspiration?" expandable section:**

A collapsible row showing real impact metrics from the Phase 1.1 NGO data. Pull from `ngoDatabase`:
- Islamic Relief USA: "$1 = 2 meals"
- Penny Appeal: "$1 = 3 meals"
- Zakat Foundation of America: "$1 = 3 days of clean water"
- Human Appeal: "$1 = 1.5 school meals"
- HHRD: "$1 = 4 school meals"

Show these as clickable chips — clicking a chip pre-fills the impact metric inputs with that organization's real values. This ties the NGO creation flow to the real Phase 1.1 data, making the platform feel cohesive.

---

### Step 3 — Media

**Cover photo upload zone:**

A drag-and-drop zone, 480px wide × 200px tall on desktop. Dashed gold border, gold cloud-upload icon, label: "Upload cover photo" + "Recommended: 1200×630px landscape." On drag-over: border turns solid gold, background lightens slightly.

On file drop/select: show a thumbnail preview within the zone. The filename and resolution appear below. Accept any image file format.

**Additional photos:**

A 3×2 grid of smaller upload zones (6 total). Same behavior — show thumbnail on upload.

**Campaign video:**

A text input for YouTube or Vimeo URL. On paste, use the YouTube thumbnail API to fetch a preview image: `https://img.youtube.com/vi/[VIDEO_ID]/mqdefault.jpg` (extract the video ID from the URL). Show the thumbnail immediately below the input. For Vimeo, show a generic video placeholder (Vimeo doesn't have a public thumbnail API without authentication).

**Photo caption for cover image:**

A text input below the cover photo zone. Placeholder: "e.g., Children at the Al-Noor center in Sana'a, Yemen."

**Consent warning:**

A yellow advisory box below all media: "⚠️ All media must show real beneficiaries with appropriate consent documentation. By uploading, you confirm consent was obtained." — DM Sans 400, 13px.

---

### Step 4 — Compound Loan Preferences

**Allow Compound commitments — the key toggle:**

Two large radio cards:

**Left card (pre-selected) — Yes:**
"● Allow Compound commitments to this campaign"
"Donors cycle their money through interest-free qard hassan loans before it reaches you. Average: **3.2× more capital** over time."
"✓ Recommended for all campaigns"
Card: gold border (selected), gold left accent bar.

**Right card — No:**
"○ Direct donations only"
"Donors give directly. No loan cycling."

When the user selects "No," show a gentle advisory below: "Disabling Compound reduces your estimated capital pipeline by 68% on average. Consider allowing it — donors still control how many cycles their money makes." — `var(--status-yellow)` text, small font.

**Loan tier preference (conditional — only shown when Yes is selected):**

Four radio options below the toggle cards:
- "● Auto — algorithm allocates based on current demand" (pre-selected)
- "○ Prefer Micro ($50-500) — fastest settlement (~2 months/cycle)"
- "○ Prefer Standard ($500-2k) — most common need (~5 months/cycle)"
- "○ Prefer Major ($2k-4k) — highest impact per family (~9 months/cycle)"

Below the radio options, a brief explanation: "Micro loans settle fastest — good for emergency campaigns where you need funds quickly. Standard loans serve the most borrowers. Auto optimizes dynamically." — DM Sans 400, 13px, italic.

---

### Step 5 — Review & Launch

**Two preview panels:**

"Preview in Discover feed →" — gold primary button. Opens a modal containing the real `CauseCard` component from Phase 1.3 populated with this campaign's in-progress form data. The modal has a device frame around the card to simulate the donor's view. The campaign's data (name, $1 = X metric, category, verification badge) appears exactly as donors will see it.

"Preview campaign page →" — ghost gold button. Opens a modal containing the `CauseDetail` component from Phase 1.3, also populated with current form data.

**Algorithm tags detected:**

"Semantic tags detected:" — label. A row of chips generated from the campaign's name, categories, countries, and description. For the demo campaign (Yemen Orphan Fund): `[Orphan care] [Education] [Yemen] [Emergency relief] [Food security]`. These tags are the inputs to the discovery algorithm's Signal 1 (semantic match). The NGO can see exactly what tags their campaign has — if the tags don't match their intent, they know to update their description.

**Estimated weekly Discover impressions:**

"Estimated weekly impressions: 340–500" — displayed as a range, not a false-precision number. Computed as: `userCount × intentMatchRate × discoverySessionRate × tierBoost`. For the demo: 47 portfolio account members × 30% matching intentions × 2 Discover sessions/week × 1.2 Tier 1 boost = ~340-500. This is an honest range.

**Verification status:**

"Tier 1 Verified ✓ — your campaign goes live immediately."
(vs "Tier 2 campaigns go live after 24-hour platform review.")

**"Launch Campaign" button:**

Gold primary, full width, height 52px: "Launch Campaign →"

On click:
1. Spinner 800ms: "Launching your campaign..."
2. `createCampaign(campaignData)` called in NGOContext
3. Campaign added to `activeCampaigns` array
4. `CAMPAIGN_LAUNCHED` event published to SharedEventsContext
5. Phase 1.3 discover algorithm immediately includes this campaign in its `ngoDatabase` scoring
6. Success state: "Your campaign is now live. Donors with matching intentions will see it in their next Discover session."
7. Navigate to `/ngo/campaigns/[new-campaign-id]`

---

## Individual Campaign Management Page

### Route

`/ngo/campaigns/:campaignId` (example: `/ngo/campaigns/camp-001`)

**Breadcrumb:** "Campaigns → Yemen Orphan Fund"

**Layout:** Two-column — main content (65%) + right sidebar (35%).

---

### Page Header

"Yemen Orphan Fund" — Cormorant Garamond 600, 30px.
"Live · Tier 1 ✓ · Created January 2026" — DM Sans 400, 14px, `var(--text-secondary)`.

An "Edit campaign →" button top-right — opens the creation wizard pre-filled with this campaign's data.

---

### Funding Overview Section (main content)

**Large progress bar:**

Goal: $12,000 | Raised: $8,400 | Remaining: $3,600

A full-width bar, 20px height. Gold fill at 70%. Track: `var(--bg-overlay)`. Below bar: "$8,400 raised of $12,000 goal · 70% complete · $3,600 remaining" in DM Sans 400, 13px.

**Split breakdown (below progress bar):**

Two columns:

Left: Direct donations:
- "$5,200" — Cormorant Garamond 600, 24px, `var(--status-green)`
- "Direct donations — 62% of total" — DM Sans 400, 13px

Right: Compound in-transit:
- "$3,200 ⟳" — Cormorant Garamond 600, 24px, `var(--gold-mid)` with ⟳ icon
- "Compound in-transit — 38% of total" — DM Sans 400, 13px

Expanded Compound breakdown (a collapsible sub-card under the right column):
```
Cycles in progress:    14 active lender positions
Est. Q2 settlement:    $1,200 (4 positions)
Est. Q3 settlement:    $2,000 (10 positions)
Families helped on
the way:               42 borrowers across these cycles
```

"Families helped on the way: 42" — this is the computed number of qard hassan borrowers who have received loans from capital ultimately destined for Yemen Orphan Fund. The number is computed from the positions array in PortfolioContext (positions targeting camp-001) × their cycle history. For the demo, hardcode 42 derived from the mock positions.

**Engagement stats (4 chips in a row):**

```
Active lenders: 247   |   Jariyah: 18 (perpetual)   |   Avg commitment: $34   |   Compound/Direct: 38/62%
```

Chips: `var(--bg-elevated)`, border `var(--border-subtle)`, border-radius `var(--radius-pill)`, DM Sans 500, 13px, padding 6px 14px. Each chip has a subtle gold left border (2px).

---

### Geographic Distribution Section (main content)

**Section header:** "Donor Geographic Distribution" — DM Sans 500, 13px, uppercase.

**US heatmap:**

`react-simple-maps` zoomed to the United States. Center: `[-96, 38]`, scale: 800.

Country fill: `var(--bg-elevated)`. State borders: `var(--border-subtle)`. Background: `var(--bg-void)`.

City pins from the pre-seeded donor data:

| City | Donors | Amount | Coordinates |
|---|---|---|---|
| Austin TX | 31 | $4,800 | [-97.7, 30.3] |
| Dallas TX | 28 | $3,600 | [-96.8, 32.8] |
| Houston TX | 22 | $2,100 | [-95.4, 29.8] |
| New York NY | 18 | $2,400 | [-74.0, 40.7] |
| Chicago IL | 14 | $1,800 | [-87.6, 41.9] |
| Los Angeles CA | 12 | $1,400 | [-118.2, 34.1] |
| Dearborn MI | 9 | $1,200 | [-83.2, 42.3] |
| Minneapolis MN | 8 | $900 | [-93.3, 44.9] |

Pin size: proportional to donor count — `radius = Math.sqrt(donorCount) * 2`. Austin's pin (radius ~11px) is the largest. Minneapolis (radius ~6px) is the smallest.

Pin color: `var(--gold-mid)` — consistent with campaign's gold identity.

Tooltip on pin hover: city name, donor count, total raised, and "View donors →" link.

**Ranked list below the map:**

"Top donor cities:" — label.

Compact horizontal list: "Austin TX (31 donors · $4,800) · Dallas TX (28 · $3,600) · Houston TX (22 · $2,100) · ..."

DM Sans 400, 13px, `var(--text-secondary)`. Items separated by · middot.

---

### Impact Reporting Module (main content)

**Section header:** "Impact Updates" — Cormorant Garamond 600, 24px.

Advisory: "Donors who see impact updates give again 3.1× more often. Update at least every 30 days to maintain your Discover ranking." — DM Sans 400, 14px, italic, gold color.

**"Post Impact Update" button:** Gold primary, height 48px: "Post Impact Update →"

**Update history list (below the button):**

Two pre-seeded updates for Yemen Orphan Fund:

**Update 1 — April 15, 2026 (3 days ago):**
```
40 children received Eid meals at the Al-Noor center in Sana'a, Yemen.
Photos show children with new Eid clothing and food packages.
```
[📷 thumbnail placeholder] [📷 thumbnail placeholder]
"Sent to 247 donors · Opened by 184 (75% open rate)"

**Update 2 — March 28, 2026 (3 weeks ago):**
```
Our teams distributed 1,200 meals during the final 10 nights of Ramadan.
Your sadaqah reached 60 families across 3 distribution centers.
```
[📷 thumbnail placeholder]
"Sent to 219 donors · Opened by 151 (69% open rate)"

Each update: `var(--bg-elevated)`, border `var(--border-subtle)`, border-radius `var(--radius-lg)`, padding 16px. Date label + update text + photo thumbnails (gray placeholder boxes 60px × 60px). Stats line in DM Sans 400, 12px, `var(--text-tertiary)`.

---

### Impact Update Modal

Opened by any "Post Impact Update" button (from either the campaign management page or the campaigns list). A centered modal, max-width 680px.

**Modal header:** "Post Impact Update — Yemen Orphan Fund"

---

**Section 1: Update Type**

Five type chips in a wrap row:

[📸 Photo update] [🎯 Milestone] [✅ Campaign completion] [⚡ Emergency] [💙 Thank you]

Each chip: `var(--bg-surface)`, border `var(--border-subtle)`, border-radius `var(--radius-pill)`, padding 8px 16px. Selected: gold background, gold border.

"Photo update" is pre-selected.

When "Milestone" is selected: a milestone dropdown appears below: "1,000 meals served / 50% of goal / 100 donors / Custom: [input]."
When "Emergency" is selected: a note appears: "Emergency posts immediately boost your Discover urgency score by +0.4."

---

**Section 2: Update Content**

Update text: a large textarea. Placeholder: "Tell donors what happened with their money. Be specific — '40 children received Eid meals' outperforms 'we helped children.'"

Photo upload: up to 5 photos. Same drag-and-drop zone as campaign creation.

---

**Section 3: Cross-Account Notification Preview — the most important section**

**Header:** "Preview — What your donors will see:" — DM Sans 700, 15px, `var(--text-primary)`.

A bordered card showing 5 notification channels. This is the moment that shows the NGO the full breadth of what one update does.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Preview — What donors will see when you post:                        │
│                                                                        │
│  📱 Push notification (247 donors):                                   │
│     "Your sadaqah just helped 40 children in Yemen for Eid.          │
│      Islamic Relief posted new photos."                               │
│                                                                        │
│  ✦  Jariyah Vault update (18 donors):                                 │
│     Donors who tagged gifts to a loved one will see:                 │
│     "Ahmed Al-Farsi: your sadaqah helped 40 children celebrate       │
│      Eid in Sana'a. [Photo]"                                         │
│                                                                        │
│  📊 Portfolio position card (247 donors):                             │
│     Their "Yemen Orphan Fund" position card shows:                   │
│     "NGO Update · April 18, 2026 · 40 Eid meals"                    │
│                                                                        │
│  🗺️ Journey tab log entry (247 donors):                              │
│     "Islamic Relief: 40 children received Eid meals · [Photo]        │
│      · 2 hours ago"                                                  │
│                                                                        │
│  📧 Email (donors with email linked — est. 189 donors):              │
│     Full formatted email with photos. [ Preview email → ]            │
│                                                                        │
│  Estimated reach: 247 donors across 5 channels                       │
└────────────────────────────────────────────────────────────────────────┘
```

Card: `var(--bg-elevated)`, gold border (1px, 40% opacity), border-radius `var(--radius-xl)`, padding 24px.

Each channel line: icon + bold channel name + description of what the donor sees. 16px gap between channels. A thin divider between channels.

The **Jariyah Vault channel** is the most emotionally impactful line. The NGO's impact update becomes a personal message to someone who gave in honor of a deceased parent or spouse. No other platform creates this emotional connection. The demo shows "Ahmed Al-Farsi" as the example — the same vault person from Phase 1.2.

The **"Preview email →" link** opens a second modal or drawer showing a mocked HTML email layout: IR logo at top, update text, 1-2 photo placeholders, a "Continue supporting →" CTA button. Static HTML for the demo.

---

**Post button:**

Gold primary, full width, 52px: "Post to 247 donors across 5 channels →"

On click:
1. Spinner 800ms: "Sending to 247 donors..."
2. `postImpactUpdate(campaignId, updateData)` called in NGOContext
3. Cross-account updates fire via SharedEventsContext:
   - `NGO_IMPACT_UPDATE` event published with `{ campaignId, updateText, campaignName, donorCount: 247 }`
   - PortfolioContext receives this event: adds a new Journey log entry for all lenders with positions in this campaign
   - Jariyah Vault sub-accounts tagged to this campaign receive a new impact entry
   - Position cards in the portfolio add an "NGO Update" badge
4. Campaign's `lastImpactUpdate` timestamp resets to "Just now" → Discover ranking updates
5. Urgency score increases by 0.3 (improves Discover ranking)
6. New update entry appears in the update history list
7. Success toast: "Update posted to 247 donors across 5 channels."

**The most powerful demo moment in Phase 4.2:** If the judge has the Portfolio account open in another tab, the Journey tab immediately shows a new "Islamic Relief: 40 children received Eid meals" entry after posting the update. This cross-account real-time update is the platform's core value proposition — the loop between NGO action and donor portfolio is live.

---

### Right Sidebar Panel (Campaign Management Page)

**Campaign stats card:**

Compact key-value table: Campaign ID / Created / Status / Duration / Compound enabled / Tier preference.

**Discover performance card:**

"Discover ranking: Top 12% this week" — large teal badge.

"Posting an impact update typically improves ranking by 8-15% within 24 hours." — advisory text.

A small 30-day SVG ranking chart (200px × 60px). A line showing the ranking percentile over time. Peaks on April 15 and March 28 (the two impact update dates). The line dips between updates and recovers after each post.

**Settlement tracking for this campaign:**

Mini settlement card:
"14 Compound positions cycling"
"Est. Q2 2026: $1,200 (4 positions)"
"Est. Q3 2026: $2,000 (10 positions)"
"View all positions →" — navigates to `/ngo/settlements?campaign=camp-001`.

**Quick actions:**
- "Edit campaign →" (creation wizard pre-filled)
- "Duplicate campaign →" (pre-fills new campaign with current settings, adds " (Copy)" to name)
- "Close campaign →" (confirmation dialog with "Are you sure? This cannot be undone." warning)

---

## Phase 4.2 Acceptance Criteria

**Campaigns list:**
- [ ] "Your Campaigns" header with "+ New Campaign" gold button
- [ ] Three tabs: Active (4), Drafts (1), Closed (7)
- [ ] Yemen Orphan Fund card: all fields correct, 70% bar, $3,200 Compound line
- [ ] Gaza card: 100% green bar, "Goal met ✓", amber "extend or close" badge
- [ ] Discover ranking badges: teal for top performers, gold/gray for mid
- [ ] "Last impact update" color coding: green/yellow/red based on recency
- [ ] Three action buttons per card navigate/open correctly
- [ ] Draft card shows "2 of 5 steps complete" completion bar
- [ ] Closed campaigns table: 7 rows, sortable columns

**Campaign creation wizard:**
- [ ] 5-step progress bar at top
- [ ] Step 1: All fields work, countries use tag input, "Continue" validates correctly
- [ ] Step 2: Char counter on short description, impact metric live preview
- [ ] "Need inspiration?" section shows real NGO data from Phase 1.1
- [ ] Clicking an inspiration chip pre-fills the metric inputs
- [ ] Step 3: Cover photo upload shows thumbnail preview, YouTube URL fetches thumbnail
- [ ] Step 4: Compound toggle pre-selected to Yes, "3.2×" stat prominently shown
- [ ] Advisory message when No is selected
- [ ] Step 5: "Preview in Discover feed" opens modal with real CauseCard component
- [ ] "Preview campaign page" opens modal with real CauseDetail component
- [ ] Algorithm tags chips computed from campaign data
- [ ] Estimated reach shown as range (340-500)
- [ ] "Launch Campaign" calls createCampaign(), publishes CAMPAIGN_LAUNCHED event
- [ ] Campaign appears in algorithm immediately after launch
- [ ] Navigate to new campaign's management page on success

**Individual campaign management:**
- [ ] Funding bar at 70% gold fill, full width
- [ ] "$5,200 Direct (62%)" in green, "$3,200 Compound (38%)" in gold
- [ ] Compound sub-breakdown shows 14 positions and Q2/Q3 estimates
- [ ] "Families helped on the way: 42" shown
- [ ] 4 engagement chips render correctly
- [ ] US heatmap renders with 8 city pins sized by donor count
- [ ] Hover tooltips on pins work
- [ ] Top cities ranked list below map
- [ ] 2 pre-seeded impact updates show with open rate stats
- [ ] "Post Impact Update" button opens modal

**Impact update modal:**
- [ ] 5 type chips render, Photo update pre-selected
- [ ] Milestone dropdown appears when Milestone chip selected
- [ ] Emergency urgency advisory note shown
- [ ] Update textarea and photo upload work
- [ ] Cross-account preview card shows all 5 channels
- [ ] Jariyah Vault channel shows "Ahmed Al-Farsi" example
- [ ] "Preview email →" opens HTML email preview
- [ ] Post button: spinner → success toast "247 donors across 5 channels"
- [ ] postImpactUpdate() called, NGO_IMPACT_UPDATE event published
- [ ] Journey tab entry created in PortfolioContext (cross-account)
- [ ] Position cards in portfolio get "NGO Update" badge
- [ ] Campaign's lastImpactUpdate resets to "Just now"
- [ ] Urgency score increases (ranking badge updates)
- [ ] New update appears in history list

**Right sidebar:**
- [ ] Campaign stats card renders
- [ ] "Top 12%" Discover ranking in teal badge
- [ ] 30-day ranking SVG chart shows line with peaks on update dates
- [ ] Settlement tracking mini-card with Q2/Q3 estimates
- [ ] Quick actions all functional

---

## Notes for Claude Code

The two preview buttons in Step 5 (Discover feed preview and campaign page preview) must reuse the actual `CauseCard` and `CauseDetail` components from Phase 1.3 — not new components. Pass the wizard's in-progress form state as the `cause` prop. This ensures the preview is pixel-accurate to what donors will see. The modal wrapping these previews should show a "This is a preview — donors will see this when your campaign is live" header banner.

The impact update modal's cross-account preview is a static simulation — it doesn't fetch each donor's actual vault configuration (that would violate privacy). Instead, it shows the templated formats, with "Ahmed Al-Farsi" as the illustrative example for the Jariyah Vault channel. In production this would say "18 donors' legacy accounts will receive a personalized entry."

The 30-day ranking chart in the campaign sidebar is an SVG path drawing two peaks. Pre-compute the path data as an array of [day, percentile] tuples for the past 30 days. On days with impact updates (March 28 = day -21, April 15 = day -3), the percentile drops sharply (ranking improves = lower percentage number = better). Between updates, percentile drifts upward (ranking weakens as other campaigns compete). The SVG viewBox should be "0 0 200 60" with Y-axis inverted (lower percentile = higher on the chart).

The Compound toggle in Step 4 defaults to Yes — never show it defaulting to No. The 3.2× figure should appear in the card itself, not just in surrounding text. Use Cormorant Garamond 600, 20px for "3.2×" within the Yes card to give it visual weight. This is the number that makes NGOs choose Compound mode.
