Good, I have deep research now. Here's the full prompt:

---

**Execute a complete, enterprise-grade UI/UX revamp of the entire Mizan application across all four account types. The current version has empty space, flat cards, inconsistent hierarchy, and no visual identity beyond basic color usage. Transform it into something that competes visually with Coinbase, Linear, and Stripe — the benchmark references for this revamp. You have full creative freedom on execution details. Follow the direction below precisely but solve the how yourself.**

---

## The Design Philosophy

Mizan is an akhirah investment platform. Every visual decision should reinforce one idea: this money is doing something sacred and real. The aesthetic should feel like if Coinbase, a Bloomberg terminal, and a prayer hall had a child. Dark, data-dense, warm gold accents, and moments of genuine elegance that feel culturally specific to the Muslim experience — not generic fintech with Islamic typography bolted on.

The research benchmarks are: Coinbase's information hierarchy and color discipline, Stripe's KPI strip pattern (4 metrics above the fold, every metric earns its pixel), Linear's sidebar and navigation predictability, Kraken's data density without clutter, and Robinhood's emotional storytelling through numbers. The glassmorphism trend from Awwwards 2025 — frosted glass cards with `backdrop-filter: blur()` layered over colored backgrounds — should be used selectively for hero cards and modal overlays, not everywhere.

**The rule: every empty space must be replaced with either data, context, or intentional visual breathing room that serves hierarchy. No whitespace that exists because nothing was put there.**

---

## Design System Foundations — Rebuild These First

Before touching any screen, establish a cohesive design system that applies everywhere.

**Depth layers:** The app should have 5 distinct background depths. The void (deepest, navigation background), the base (main content area), the surface (cards), the elevated (card interiors, drawers), and the overlay (modals, tooltips). Each layer should be visually distinct but harmonious. Currently the app uses 2-3 depths. Double it.

**Glass cards:** Create a `GlassCard` component used throughout the app for hero sections and featured data. It uses `backdrop-filter: blur(20px)`, a semi-transparent background (`rgba` of the surface color at ~60% opacity), a 1px border using a white or accent color at very low opacity (6-8%), and a subtle inner shadow. This component appears in hero sections, modal headers, and campaign cards. Not on tables or list items — only where visual hierarchy needs to be established.

**Typography scale:** The app uses Cormorant Garamond for display and DM Sans for body. The problem is inconsistent sizing — numbers look the same as labels. Establish a strict scale: display numbers (portfolio balance, settlement total, campaign raised) use Cormorant Garamond 600 at sizes ranging from 48px down to 28px. Section headers use Cormorant Garamond 500 at 24-32px. All body copy, labels, and data use DM Sans at 13-15px. Never use DM Sans for primary numbers. Never use Cormorant Garamond for interface labels or button text.

**Gradient mesh backgrounds:** Each of the four accounts needs a subtle ambient gradient in the background of the hero section that visually distinguishes the account. Personal Portfolio: deep gold-amber radial glow (top-center, spreads 600px). Borrower: teal radial from top-left, softer, more subtle. Community Hub: a green-teal gradient that suggests growth and trust. NGO Dashboard: gold from top, matching portfolio — they share the akhirah register. These are `radial-gradient` CSS applied to the hero section's `::before` pseudo-element, not background colors. They should be barely perceptible but add depth.

**Micro-interaction standard:** Every interactive element must have a response. Buttons: `transform: scale(0.97)` on press. Cards: `translateY(-2px)` on hover with a subtle shadow increase. Data numbers: count-up animations using Framer Motion on mount and whenever the value changes. Toggle switches: spring physics. Tab transitions: `AnimatePresence` with a 200ms lateral slide. Loading states: skeleton shimmer (a traveling highlight animation, not a spinner). Success states: a brief green pulse on the affected element, not a toast alone.

**Data visualization standard:** All charts should use `@visx/visx` or D3 directly — not recharts. Recharts produces generic charts. `@visx/visx` allows full visual control. Charts should use the account's accent color for the primary series, with secondary series in a desaturated version of the same color. Grid lines at 20% opacity only. No chart borders. Axis labels at 11px DM Sans in `var(--text-tertiary)`. Every chart has a tooltip that appears on hover with a custom styled card — no default browser tooltips.

**Status indicator system:** Standardize across all four accounts. Green (#4ADE80) for positive/active/healthy. Amber (#F59E0B) for warning/pending/attention. Red (#F87171) for critical/failed/urgent. Teal (`var(--teal-mid)`) for informational/in-progress. Gold (`var(--gold-mid)`) for akhirah/compound/special. These never deviate. Every badge, pill, and indicator uses these exact colors.

---

## Sidebar — Universal Redesign

The sidebar is the same structure across all four accounts but styled differently per account. The current sidebar is a flat list of links. Replace it with:

**Structure (240px fixed):** A logo zone (top 64px) containing the Mizan wordmark + account-specific subtitle. A navigation zone with labeled groups where applicable. An account summary card (context-sensitive per account). A bottom zone with utility links.

**Navigation items:** 36px row height (desktop is precise — this is intentional). 8px left padding. Active item: a 3px left border in the account accent color, background `rgba(accent, 0.08)`, text in accent color. Hover: background `rgba(accent, 0.04)`. Icons: 18px, using Lucide — every nav item has an icon, not just text. The icon is always visible; labels truncate if the sidebar collapses. Badge counts (where applicable) sit flush right, 20px pill.

**Account summary card (bottom of nav, above utility links):** A compact glass card. For Portfolio: balance + today's change with an up/down arrow. For Borrower: active loan balance + next payment due. For Community Hub: congregation health score + zakat pool. For NGO: available balance + pipeline. This card is always visible regardless of which tab is active. Clicking it navigates to the relevant section.

**Sidebar background texture:** A very subtle repeating SVG pattern at 2-3% opacity — geometric Islamic star pattern (8-pointed star tessellation, the rub el hizb geometry) — distinct enough to notice at close range, invisible at distance. This runs the full sidebar height. It is the one visual element that signals "this is designed for this community" without being loud.

---

## Account 1: Personal Investment Portfolio — Complete Revamp

**Dashboard tab:**

The current dashboard has a hero card and some stats below it. Replace with a three-zone layout that fills the entire viewport without scrolling on a 1440px display.

Zone 1 (top, full width, 220px height): The Portfolio Hero. A `GlassCard` spanning full width. Gold gradient mesh in the background. Left: "Akhirah Portfolio" — Cormorant Garamond 400, 14px, gold, uppercase. Below: the total portfolio value in Cormorant Garamond 600, 56px. Below that: "Lifetime real-world good: $X" — the compound-amplified total — in Cormorant Garamond 500, 24px, gold. Right side: a miniature sparkline of the portfolio's growth over time — 120px × 40px, gold line, no axes, no labels. Just the shape of growth. Beside it: a `+12.4%` growth indicator with a tiny up arrow. Far right: quick action buttons — "Invest" (gold primary), "Withdraw" (ghost).

Zone 2 (middle row, three columns, equal width, remaining height minus zone 3): 

Left column: Portfolio composition donut chart. The donut is 200px diameter, centered in the column. Segments animate in on mount — each segment sweeps from 0 to its angle with a 400ms stagger. The center shows the active toggle's primary stat. The three toggle views (By Cause / By Region / By Mode) are pill selectors above the donut. Switching animates the segments morphing. The legend sits to the right of the donut in the same column, as compact key-value rows.

Middle column: Impact graph (the time-series chart). This is a `@visx/visx` area chart — not a line chart. The area below the line should be a gradient that starts at the accent color at the line and fades to transparent at the x-axis. The four toggle buttons (Families / Meals / Families in the Chain / Real-World Good) sit above the chart. "Families in the Chain" renders as a step chart, others as smooth area curves. Add event annotation dots on the line at dates when significant investments were made — hovering them shows a tooltip.

Right column: The compound pipeline visualization. Not a table — a visual pipeline showing each active position as a horizontal card. Each card shows: NGO logo (32px), position name, amount, cycle indicator (Cycle 2 of 3 rendered as three dots, two filled one empty), and a thin progress bar showing the cycle's time elapsed. The most active position (closest to settling) has a gold accent border. At the bottom of the column: "Total in motion: $X" in Cormorant Garamond 600, 24px, gold.

Zone 3 (bottom strip, full width, 80px height): A horizontal stats strip. Six stats in equal columns separated by thin vertical dividers. Each stat: label (10px DM Sans uppercase) above value (Cormorant Garamond 600, 22px). Stats: Jariyah Active, Families Helped, Meals Funded, Families in the Chain, Active Positions, Days Until Next Settlement. The settlement countdown ticks live.

**Portfolio tab (positions list):**

Replace the current list with a data-dense table inspired by Coinbase's portfolio view and Webull's holdings table. Each row: NGO logo (28px) + name + campaign | Mode badge (Compound/Direct/Jariyah pill) | Amount | Current cycle | Families helped by this position | Est. settlement date | A sparkline of this position's history (80px × 24px). Alternating row backgrounds. Sortable columns with sort indicators. A search/filter bar above the table. Clicking a row expands it inline (no navigation) to show full position details — the expansion uses AnimatePresence for a smooth height animation.

**Journey tab (map):**

The current map is functional but visually underdeveloped. The map container should fill the full content area with no white space around it. The toggle between "My Impact" and "My Chain" sits as a floating pill selector positioned absolutely at the top-left of the map — not outside the map. The vignette overlay (radial gradient from transparent center to the page background at edges) should be stronger, making the map feel embedded in the page rather than iframed. Add a legend card positioned at the bottom-left of the map absolutely — compact, glass card style with the color coding explanation.

**Discover tab:**

The current Discover feed shows campaign cards in a list. Replace with a two-column masonry layout. Campaign cards get a full visual overhaul: each card has a cover image zone at the top (200px, the NGO's OG image from Microlink — show a gradient placeholder with the NGO's accent color while loading), the NGO logo overlapping the cover image bottom-left (circular, 40px, white border), cause category badge top-right. Below the image: campaign name in Cormorant Garamond 600 18px, the "$1 = X" impact metric in gold, the funding bar (subtle, 6px, full width), and the Invest / Jariyah action buttons. Cards have `hover: translateY(-4px)` with a shadow that has the NGO's accent color at 20% opacity as a tint.

---

## Account 2: Borrower Account — Complete Revamp

**Empty state (no active loan):**

The current empty state is minimal text. Replace with a centered full-page design that functions like an editorial landing page. A large Cormorant Garamond headline: "Interest-Free. Community-Backed. Your right as a Muslim." Below: the three-principle explainer as horizontal icon cards (not a list). The "Request a Qard Hassan Loan" CTA button should be the largest element on the page — 64px height, full attention.

**Loan application pipeline:**

Each step of the 6-step application should have its own distinct visual treatment. The step progress bar at the top should be a horizontal timeline with connecting lines — not just dots. Completed steps: filled teal with a checkmark icon. Active step: animated pulse ring. The step content card should be a `GlassCard` with the teal gradient mesh behind it.

Step 1 (Purpose): The 8 purpose cards should be large, visually distinct — 160px × 160px squares in a 4×2 grid, each with a large icon (48px), the category name, and a one-line example. Selected state: teal border (3px), teal glow (`box-shadow: 0 0 20px rgba(teal, 0.3)`).

Step 3 (Financial Picture): The live need score bar should be a prominent visual element, not a footnote. Show it as a large horizontal gauge — the same speedometer arc style as the Community Hub radial gauge but horizontal. As the user types income and expenses, the needle moves in real time with a spring animation.

**Loan dashboard (active loan):**

This needs the most work. Currently flat. Redesign as a two-column layout: left column (65%) contains the repayment progress as a large circular ring (using `react-circular-progressbar`) showing percentage paid, with the remaining balance in the center in Cormorant Garamond. Below: a payment timeline — a horizontal SVG showing all payment periods as segments, paid ones filled teal, upcoming ones outlined, overdue ones amber. Right column (35%): loan details card, the vouch status card, and the "Make payment" button pinned to the bottom of the column.

**Decision screens:**

The Approved screen should feel celebratory without being childish. A large checkmark SVG that draws itself on mount (SVG stroke-dasharray animation). The loan amount in Cormorant Garamond 600, 64px, teal. Below: the monthly payment and schedule. The confetti from `react-confetti-explosion` fires immediately when the screen mounts.

The Denied screen should feel dignified, not punitive. A soft amber circle with an information icon — not a red X. The reason in plain language. The "What would improve my outcome" suggestions in teal cards below.

---

## Account 3: Community Hub — Complete Revamp

**Dashboard:**

The three radial gauges (Congregation Health, Zakat Distribution, Welfare Resolution) need to be the visual centerpiece. Make them larger — 200px diameter each — and give each one a colored ambient glow at its current value level that pulses slowly. The arc colors should be:

- Congregation Health: transitions from deep red (0) through amber to a vibrant teal (100)
- Zakat Distribution: amber (#F59E0B) filling a gold track
- Welfare Resolution: green (#4ADE80) filling a teal track

Below the gauges: the Urgent Actions strip should look like a real alert system — each card has a colored left border and a subtle background wash, with a pulsing dot on critical items. The dots should be CSS-only (scale animation, box-shadow pulse).

The Activity Timeline (right column) should use a proper timeline component — a vertical line with markers at each event, alternating left-right placement for visual interest. The timeline line itself animates drawing from top to bottom on mount.

**Welfare Cases tab (Kanban):**

The three kanban columns need proper visual weight. Column headers should have a colored top border (3px) matching their status. Cards should have `drag` enabled via Framer Motion — they should visibly lift (scale 1.02, shadow increase) when being dragged. The drop zones should highlight (subtle background flash) when a card is dragged over them. The confetti on resolution should fire from the card's position, not the center of the screen.

**Events tab:**

The event ROI bar chart needs to be the hero visual. Make it a `@visx/visx` horizontal bar chart with gradient fills — gold gradient for high-performing events, teal for average, gray for low. The bars should animate in from the left on mount (width from 0 to final value). The event cards should show the multiplier number in Cormorant Garamond 600, 40px — it should be the biggest number on the card.

---

## Account 4: NGO Partner Dashboard — Complete Revamp

**Dashboard:**

The hero card needs to be reimagined as a two-panel glass card. Left panel: organization identity with the real logo (large, 64px). Right panel: the four monthly stats — but make "Compound in-transit" visually distinct from the others. It should be in gold, with the ⟳ icon, and have a subtle animated shimmer background (a traveling gradient highlight, suggesting money in motion). This is the one metric no other platform shows and it deserves to look different from the others.

The campaign performance row should become a proper data strip — not scrollable cards but a full-width strip where each campaign is a compact row: logo + name + progress bar + raised amount + in-transit amount + ranking badge + last update indicator. All four campaigns visible at once on a 1440px display. Progress bars use `@visx/visx` for smooth rendering.

The settlement calendar on the right should show the proportional bars as actual SVG bars that animate from 0 to their final width on mount. The July bar (the largest) should be visually dominant.

**Campaigns tab:**

Campaign cards in the list should match the visual richness of the portfolio's Discover feed cards — cover images, NGO logo overlap, funding bars, ranking badges. The individual campaign management page needs the most visual work in the entire NGO account. The geographic heatmap should fill the full width of the map section — not a small inset. The Discover ranking chart (30-day sparkline) in the right sidebar should use `@visx/visx` with peaks clearly marked on the days of impact updates.

**Automations tab:**

The four automation engine cards need the most visual differentiation. Each card should have a distinct ambient glow color behind it matching its status: teal for the acknowledgment engine, amber for lapse prevention, gold for calendar engine, and red for payment recovery. The `GlassCard` treatment works perfectly here — frosted glass cards over the colored ambient background. The live activity feed at the bottom should look like a terminal or a trading ticker — monospace font for the timestamps, very compact rows, new entries sliding in from the top.

---

## Global Interactions to Implement Everywhere

**Page transitions:** Every route change uses `AnimatePresence` with a 200ms fade. Not a slide — a clean fade. Slide transitions feel slow. Fade transitions feel instant and professional.

**Data loading:** Every data-dependent section has a skeleton state. Skeletons match the exact shape of the content they replace — a skeleton for a 3-column stat strip looks like three gray rectangles in a row, not a generic spinner. The shimmer animation travels left-to-right across all skeletons simultaneously (synchronized, not staggered).

**Number changes:** Any time a number updates in context (a payment is made, a withdrawal happens, a donation comes in), the number on screen should not just jump to the new value. It should briefly animate: scale to 1.05 and highlight in the accent color for 400ms, then scale back. This makes financial state changes feel real and weighty.

**Empty states:** Every tab and section that can be empty has a designed empty state — not `<p>No data</p>`. An SVG illustration (simple, abstract geometric — not clipart), a headline in Cormorant Garamond, a one-line description in DM Sans, and a primary CTA. The illustrations should use the account's accent color.

**Hover states on tables:** Row hover should not just change background color — it should reveal an action area on the right side of the row. The action area slides in from the right with a quick translate animation, showing 2-3 contextually relevant icon buttons. This is the pattern used by Linear and Notion for table/list interactions.

**Tooltips:** Replace all `title` attributes with custom tooltip components. Tooltips appear on a 300ms delay (not instant — immediate tooltips are jarring), animate in with a subtle scale from 0.95 to 1.0, and have the `GlassCard` treatment — frosted, elegant, never a flat dark box.

---

## Things to Remove or Fix

**Remove:** Any `<hr>` or horizontal divider that exists just to separate sections. Use spacing and background depth instead.

**Remove:** Generic card headers that just say "Overview" or "Summary" with no additional information. Every section header should be informative — tell the user what they're looking at and why it matters.

**Fix:** Button hierarchy. Currently many screens have 3+ primary buttons of equal visual weight. Establish strict hierarchy: one primary (filled, accent color), one secondary (ghost with accent border), everything else is a text link. Never two primary buttons in the same view.

**Fix:** Form inputs. All inputs should have a custom focused state — a 1px accent-colored border and a very subtle inner glow. The placeholder text should be lighter than current. Labels should be above the input, never inside it on focus.

**Fix:** Modal and drawer backdrops. The current backdrop is likely a flat semi-transparent black. Replace with a `backdrop-filter: blur(4px)` treatment — the page blurs slightly when a modal is open. This is the industry standard in 2025 and makes overlays feel native.

**Fix:** Spacing inconsistency. Audit every section gap, card padding, and grid gap. Standardize: card padding is 24px (compact) or 32px (standard) or 40px (hero). Section gaps are 24px. Never 15px, 17px, or other odd numbers. All spacing values should be multiples of 4.

---

## The Test

When the revamp is complete, open the app and ask: does this look like something that cost $200,000 to build? Does every pixel feel intentional? Does a Muslim who opens this app feel that it was built by people who understood their faith, their aesthetic, and their need for trustworthy financial infrastructure?

If the answer to any of those is no — keep going. The bar is Coinbase-level polish with Islamic cultural specificity. That combination does not exist anywhere right now. Build it.