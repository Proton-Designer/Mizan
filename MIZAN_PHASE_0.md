# MIZAN — Phase 0: Foundation, Theme & Welcome Screen
## Build Document for Claude Code

---

## Overview

This is the Phase 0 build document for **Mizan** — an Islamic giving and qard hassan platform. Phase 0 establishes the complete application skeleton, global design system, navigation shell, and the welcome/account-selection screen that serves as the entry point for all demo flows.

Every subsequent phase (1.1 through 4.3) builds on top of what this document establishes. Nothing in later phases should override or conflict with the design tokens, component patterns, or navigation architecture defined here.

---

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS + custom CSS variables (no Tailwind component libraries)
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Google Fonts (loaded in index.html)
  - Display font: `Cormorant Garamond` (400, 500, 600, 700 weights) — for hero text, headers, spiritual copy
  - Body font: `DM Sans` (300, 400, 500) — for UI copy, labels, data
  - Accent/Arabic: `Amiri` (400, 700) — for Arabic phrases and Quranic/hadith text
- **State Management:** React Context API (global app state)
- **Build:** Vite

---

## File Structure to Scaffold

```
mizan/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              ← Global CSS variables + resets
│   ├── routes/
│   │   └── index.jsx          ← React Router setup
│   ├── context/
│   │   └── AppContext.jsx     ← Global state provider
│   ├── screens/
│   │   ├── Welcome.jsx        ← Phase 0 main deliverable
│   │   ├── portfolio/         ← Phase 1 screens (empty stubs)
│   │   ├── borrower/          ← Phase 2 screens (empty stubs)
│   │   ├── community/         ← Phase 3 screens (empty stubs)
│   │   └── ngo/               ← Phase 4 screens (empty stubs)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx   ← Persistent shell wrapper
│   │   │   ├── BottomNav.jsx  ← Bottom tab navigation
│   │   │   └── TopBar.jsx     ← Per-screen top bar
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Divider.jsx
│   │   └── shared/
│   │       ├── AccountTypeCard.jsx  ← Used on Welcome screen
│   │       └── TransitionWrapper.jsx
│   └── utils/
│       └── constants.js
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Design System

### Color Palette

All colors are defined as CSS custom properties in `src/index.css`. Use ONLY these variables throughout the entire application — never hardcode hex values.

```css
:root {
  /* === BACKGROUNDS === */
  --bg-void: #0A0A0F;           /* Deepest background — near-black with blue undertone */
  --bg-deep: #0F0F1A;           /* Main app background */
  --bg-surface: #16161F;        /* Cards, panels, elevated surfaces */
  --bg-elevated: #1E1E2A;       /* Modals, dropdowns, higher elevation */
  --bg-overlay: #252533;        /* Hover states, selected states */

  /* === GOLD — Primary Brand Color === */
  --gold-light: #F5D485;        /* Light gold — text on dark, highlights */
  --gold-mid: #D4A843;          /* Mid gold — primary interactive elements */
  --gold-deep: #A07830;         /* Deep gold — pressed states, borders */
  --gold-glow: rgba(212, 168, 67, 0.15);   /* Gold ambient glow */
  --gold-glow-strong: rgba(212, 168, 67, 0.30); /* Gold strong glow */

  /* === TEAL — Secondary/Action Color === */
  --teal-light: #7ECDC4;        /* Light teal — positive states, links */
  --teal-mid: #4AADA4;          /* Mid teal — secondary actions */
  --teal-deep: #2D7A73;         /* Deep teal — borders, accents */
  --teal-glow: rgba(74, 173, 164, 0.15);

  /* === STATUS COLORS === */
  --status-green: #4ADE80;      /* Jariyah / complete / on schedule */
  --status-yellow: #FBBF24;     /* Active / in-progress / pending */
  --status-red: #F87171;        /* Urgent / denied / overdue */
  --status-blue: #60A5FA;       /* Direct / settled / informational */

  /* === TEXT === */
  --text-primary: #F0EDE8;      /* Primary text — warm white */
  --text-secondary: #A8A49E;    /* Secondary text — muted warm grey */
  --text-tertiary: #6B6760;     /* Tertiary text — very muted */
  --text-gold: #D4A843;         /* Gold text — emphasis, labels */
  --text-inverse: #0A0A0F;      /* Text on gold backgrounds */

  /* === BORDERS === */
  --border-subtle: rgba(240, 237, 232, 0.06);   /* Very subtle dividers */
  --border-default: rgba(240, 237, 232, 0.12);  /* Standard borders */
  --border-strong: rgba(240, 237, 232, 0.20);   /* Emphasized borders */
  --border-gold: rgba(212, 168, 67, 0.30);      /* Gold borders */

  /* === GRADIENTS === */
  --gradient-gold: linear-gradient(135deg, #F5D485 0%, #D4A843 50%, #A07830 100%);
  --gradient-surface: linear-gradient(180deg, #16161F 0%, #0F0F1A 100%);
  --gradient-glow-top: radial-gradient(ellipse at 50% 0%, rgba(212, 168, 67, 0.12) 0%, transparent 70%);
  --gradient-hero: linear-gradient(180deg, rgba(212,168,67,0.08) 0%, transparent 60%);

  /* === SHADOWS === */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 8px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-gold: 0 0 20px rgba(212, 168, 67, 0.25), 0 0 60px rgba(212, 168, 67, 0.08);
  --shadow-gold-strong: 0 0 30px rgba(212, 168, 67, 0.40), 0 0 80px rgba(212, 168, 67, 0.15);

  /* === SPACING SCALE === */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* === BORDER RADIUS === */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 100px;

  /* === TRANSITIONS === */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === Z-INDEX LAYERS === */
  --z-base: 0;
  --z-raised: 10;
  --z-overlay: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-nav: 50;
}
```

---

### Typography System

```css
/* In index.css, after :root block */

/* Display — Cormorant Garamond */
.text-display-xl { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; }
.text-display-lg { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; }
.text-display-md { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 500; line-height: 1.2; }
.text-display-sm { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500; line-height: 1.25; }

/* Body — DM Sans */
.text-body-lg { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 400; line-height: 1.6; }
.text-body-md { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 400; line-height: 1.6; }
.text-body-sm { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.5; }
.text-body-xs { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400; line-height: 1.4; }

/* Labels — DM Sans Medium */
.text-label-lg { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; line-height: 1.4; letter-spacing: 0.02em; }
.text-label-md { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; line-height: 1.4; letter-spacing: 0.04em; }
.text-label-sm { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; line-height: 1.3; letter-spacing: 0.06em; text-transform: uppercase; }

/* Arabic — Amiri */
.text-arabic { font-family: 'Amiri', serif; direction: rtl; font-size: 18px; line-height: 1.8; }
.text-arabic-lg { font-family: 'Amiri', serif; direction: rtl; font-size: 24px; line-height: 1.8; }
```

---

### Global CSS Resets & Base Styles

```css
/* In index.css */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Mobile-first viewport — app is designed for 390px wide (iPhone 14 width) */
/* All layouts center within a max-width container */
#root {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--bg-deep);
}

/* Scrollbar hiding for mobile feel */
::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }

/* Selection */
::selection {
  background: var(--gold-glow-strong);
  color: var(--text-primary);
}

/* Focus visible (accessibility) */
:focus-visible {
  outline: 2px solid var(--gold-mid);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## Global Component Specifications

### Button Component (`src/components/ui/Button.jsx`)

Three variants used throughout the app:

**Primary (Gold)**
- Background: `var(--gradient-gold)`
- Text: `var(--text-inverse)` — dark text on gold
- Font: DM Sans 500, 15px
- Height: 52px
- Border radius: `var(--radius-pill)`
- Shadow: `var(--shadow-gold)`
- Hover: scale(1.02), shadow intensifies to `var(--shadow-gold-strong)`
- Active: scale(0.98)
- Transition: `var(--transition-spring)`

**Secondary (Outlined)**
- Background: transparent
- Border: 1px solid `var(--border-gold)`
- Text: `var(--text-gold)`
- Hover: background `var(--gold-glow)`, border `var(--gold-mid)`
- Same sizing as Primary

**Ghost**
- Background: `var(--bg-overlay)`
- Border: 1px solid `var(--border-subtle)`
- Text: `var(--text-secondary)`
- Hover: background `var(--bg-elevated)`, text `var(--text-primary)`

---

### Card Component (`src/components/ui/Card.jsx`)

Base card used for all content containers:

- Background: `var(--bg-surface)`
- Border: 1px solid `var(--border-subtle)`
- Border radius: `var(--radius-lg)`
- Shadow: `var(--shadow-card)`
- Padding: `var(--space-lg)`

**Elevated variant:**
- Background: `var(--bg-elevated)`
- Border: 1px solid `var(--border-default)`
- Shadow: `var(--shadow-elevated)`

**Gold accent variant:**
- Background: `var(--bg-surface)`
- Border: 1px solid `var(--border-gold)`
- Inner glow: `box-shadow: inset 0 0 24px var(--gold-glow)`

---

### AppShell Component (`src/components/layout/AppShell.jsx`)

The persistent wrapper rendered around every screen except the Welcome screen.

```
Structure:
┌────────────────────────────┐
│ TopBar (56px fixed top)    │
├────────────────────────────┤
│                            │
│ Screen Content             │
│ (scrollable, padding-top   │
│ 56px, padding-bottom 80px) │
│                            │
└────────────────────────────┘
│ BottomNav (64px fixed bot) │
└────────────────────────────┘
```

- Background: `var(--bg-deep)`
- The glow gradient `var(--gradient-glow-top)` is applied as a fixed pseudo-element behind all content — creates ambient gold light from the top of the screen
- Screen content area scrolls independently
- TopBar and BottomNav are sticky/fixed

---

### TopBar Component (`src/components/layout/TopBar.jsx`)

Fixed to the top of every screen (except Welcome):

- Height: 56px
- Background: `var(--bg-deep)` with `backdrop-filter: blur(20px)`
- Border-bottom: 1px solid `var(--border-subtle)`
- Contains: back button (left), screen title (center, Cormorant Garamond 500 20px), action icon (right)
- The Mizan wordmark (small, gold, Cormorant Garamond) appears on the home/dashboard screen topbar only

---

### BottomNav Component (`src/components/layout/BottomNav.jsx`)

Fixed to bottom of every screen within an account type. Each account has its own tab configuration (defined in later phases) but the visual system is defined here:

- Height: 64px + safe-area-inset-bottom padding
- Background: `var(--bg-deep)` with `backdrop-filter: blur(20px)`
- Border-top: 1px solid `var(--border-subtle)`
- 3-5 tabs depending on account type
- Active tab: icon in `var(--gold-mid)`, label in `var(--gold-mid)`, animated dot indicator above icon
- Inactive tab: icon in `var(--text-tertiary)`, label in `var(--text-tertiary)`
- Tab transition: icon scales from 1.0 to 1.15 on selection, color transitions over 200ms
- Font: DM Sans 500, 10px, letter-spacing 0.04em, uppercase

---

## Animation System

All animations use Framer Motion. Define reusable variants in `src/utils/constants.js`:

```js
// src/utils/constants.js

export const ANIMATION = {

  // Screen entrance — used for every screen mount
  screenEnter: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Modal/bottom sheet entrance
  sheetEnter: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },

  // Card stagger — used for lists of cards
  cardStagger: {
    container: {
      animate: { transition: { staggerChildren: 0.07 } }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
    }
  },

  // Fade in only — for overlays, reflections
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 }
  },

  // Scale pop — for confirmations, success states
  scalePop: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },

  // Number counter — for stats that count up
  // Implemented via Framer Motion useMotionValue + animate
  counterUp: {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1]
  }
}

export const ACCOUNT_TYPES = {
  PORTFOLIO: 'portfolio',
  BORROWER: 'borrower',
  COMMUNITY: 'community',
  NGO: 'ngo'
}

export const ACCOUNT_CONFIG = {
  portfolio: {
    label: 'Personal Portfolio',
    subtitle: 'Akhirah investments & giving',
    icon: 'TrendingUp',
    route: '/portfolio',
    accentColor: '#D4A843',  // gold
    description: 'Track your sadaqah, cycle qard hassan loans, and build your akhirah portfolio'
  },
  borrower: {
    label: 'Loan Account',
    subtitle: 'Interest-free financial help',
    icon: 'HandHeart',
    route: '/borrower',
    accentColor: '#4AADA4',  // teal
    description: 'Apply for qard hassan — interest-free loans from your community'
  },
  community: {
    label: 'Community Hub',
    subtitle: 'For mosques & circles',
    icon: 'Users',
    route: '/community',
    accentColor: '#7ECDC4',  // light teal
    description: 'Manage your congregation\'s giving, qard hassan circles, and vouching'
  },
  ngo: {
    label: 'NGO Dashboard',
    subtitle: 'For nonprofits & causes',
    icon: 'Globe',
    route: '/ngo',
    accentColor: '#F5D485',  // light gold
    description: 'Launch campaigns, track donor intelligence, and report your impact'
  }
}
```

---

## Routing Setup (`src/routes/index.jsx`)

```jsx
// React Router v6 configuration

import { createBrowserRouter } from 'react-router-dom'
import Welcome from '../screens/Welcome'
import AppShell from '../components/layout/AppShell'

// Portfolio screens (stubs for Phase 1)
import PortfolioDashboard from '../screens/portfolio/Dashboard'

// Borrower screens (stubs for Phase 2)
import BorrowerHome from '../screens/borrower/Home'

// Community screens (stubs for Phase 3)
import CommunityDashboard from '../screens/community/Dashboard'

// NGO screens (stubs for Phase 4)
import NGODashboard from '../screens/ngo/Dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />
  },
  {
    path: '/portfolio',
    element: <AppShell accountType="portfolio" />,
    children: [
      { index: true, element: <PortfolioDashboard /> },
      // Phase 1 routes added here
    ]
  },
  {
    path: '/borrower',
    element: <AppShell accountType="borrower" />,
    children: [
      { index: true, element: <BorrowerHome /> },
      // Phase 2 routes added here
    ]
  },
  {
    path: '/community',
    element: <AppShell accountType="community" />,
    children: [
      { index: true, element: <CommunityDashboard /> },
      // Phase 3 routes added here
    ]
  },
  {
    path: '/ngo',
    element: <AppShell accountType="ngo" />,
    children: [
      { index: true, element: <NGODashboard /> },
      // Phase 4 routes added here
    ]
  }
])
```

---

## Global State (`src/context/AppContext.jsx`)

```jsx
import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [demoUser, setDemoUser] = useState({
    name: 'Yusuf',
    mosque: 'UT Austin MSA',
    streak: 23,
    totalDeployed: 1247,
    familiesHelped: 43
  })

  return (
    <AppContext.Provider value={{
      currentAccount,
      setCurrentAccount,
      demoUser,
      setDemoUser
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
```

---

## Phase 0 Main Deliverable: Welcome Screen (`src/screens/Welcome.jsx`)

### Design Brief

The Welcome screen is the first thing judges and demo viewers see. It must:
- Communicate what Mizan is in under 3 seconds
- Feel premium, spiritual, and modern simultaneously
- Make account type selection feel meaningful — not like a dropdown
- Set the visual tone for the entire application
- Be memorable as a standalone screen

**Aesthetic direction:** Dark luxury with Islamic geometric undertones. The background is near-black with a deep gold ambient glow emanating from the center-top. The Mizan wordmark is large and commands the top third. The four account type cards are the bottom two-thirds. The overall feel is like opening a premium investment app, but every visual choice is spiritually grounded.

---

### Welcome Screen Full Specification

**Background:**
- Base: `var(--bg-void)` — the deepest background color
- Radial gold glow: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212, 168, 67, 0.18) 0%, transparent 70%)` — fixed, not scrollable
- Subtle Islamic geometric pattern overlay at 3% opacity — a tessellating eight-pointed star (khatemeh) pattern rendered as an SVG background pattern. This adds texture without overwhelming.
- Grain overlay: a CSS noise texture at 4% opacity for tactile depth

**Top Section — Brand Mark:**
- Arabic text: `ميزان` (Mizan in Arabic) — Amiri font, 14px, `var(--text-tertiary)`, centered, appears above the English wordmark
- English wordmark: `Mizan` — Cormorant Garamond 600, 48px, `var(--gold-light)`, centered
- Tagline below wordmark: `The Akhirah Portfolio` — DM Sans 300, 14px, `var(--text-secondary)`, centered, letter-spacing 0.12em, uppercase
- A thin horizontal rule: 40px wide, 1px, `var(--border-gold)`, centered below tagline, with slight glow
- Spacing: this entire block sits in the top 38% of the screen with generous top padding

**Middle Section — Context Copy:**
- A single line: `Choose your account to begin` — DM Sans 400, 13px, `var(--text-tertiary)`, centered, letter-spacing 0.06em, uppercase
- This line appears with a 400ms fade-in delay after the logo animates in

**Bottom Section — Account Type Cards:**
Four cards arranged in a 2×2 grid with 12px gap. Each card is tappable and navigates to the corresponding account.

**Account Type Card Design:**

Each card (`src/components/shared/AccountTypeCard.jsx`):
- Dimensions: ~163px wide, ~172px tall (fills 2-column grid at 390px viewport with 16px horizontal padding + 12px gap)
- Background: `var(--bg-surface)`
- Border: 1px solid `var(--border-subtle)`
- Border radius: `var(--radius-xl)` — 24px
- Shadow: `var(--shadow-card)`
- Padding: 20px
- On hover/press: border color transitions to account's accent color at 40% opacity; a very subtle inner glow matching the accent color appears; card lifts with `translateY(-2px)` and shadow deepens
- Transition: `var(--transition-spring)` for scale, `var(--transition-base)` for colors

Card internal layout (top to bottom):
1. **Icon container** — 44px × 44px, `var(--bg-elevated)`, `var(--radius-md)`, contains Lucide icon at 22px in the account's accent color
2. **Account label** — Cormorant Garamond 600, 18px, `var(--text-primary)`, margin-top 14px
3. **Account subtitle** — DM Sans 400, 12px, `var(--text-secondary)`, margin-top 4px, 2 lines max
4. **Bottom arrow** — Lucide `ChevronRight` at 14px, `var(--text-tertiary)`, aligned bottom-right, appears with the hover state

**Card grid layout:**
- Top-left: Personal Portfolio (gold accent)
- Top-right: Loan Account (teal accent)
- Bottom-left: Community Hub (light teal accent)
- Bottom-right: NGO Dashboard (light gold accent)

**Card entrance animation:**
Cards animate in with staggered entrance after the logo section appears:
- Logo fades in: 0ms delay, 500ms duration
- Tagline fades in: 300ms delay
- "Choose your account" label: 500ms delay
- Card grid container fades in: 600ms delay
- Individual cards: stagger 80ms between each, slide up 16px + fade in

**On card tap:**
1. Card scales down to 0.96, then immediately navigates
2. A brief full-screen flash of the account's accent color at 15% opacity (30ms)
3. React Router pushes to the account route
4. The destination screen enters with the standard `screenEnter` animation

**Bottom of screen:**
- Below the card grid, a very small line: `© 2026 Mizan · Built at hack.msa` — DM Sans 400, 10px, `var(--text-tertiary)`, centered
- This sits 16px above the bottom safe area

---

### Welcome Screen Implementation Notes

```
IMPORTANT for Claude Code building this screen:

1. The Arabic text "ميزان" must be rendered with font-family: 'Amiri'
   and direction: rtl. Do not skip this — it grounds the brand.

2. The Islamic geometric background pattern should be rendered as an
   inline SVG element positioned absolutely behind all content, not
   as a CSS background-image. Use an 8-pointed star (khatam) repeat
   pattern. The SVG should tile at approximately 60px × 60px per tile.
   Opacity: 0.04. Color: var(--gold-mid).

3. The grain overlay is achieved with a CSS pseudo-element using a
   url("data:image/svg+xml...") noise texture or a CSS filter approach.
   Opacity must be ≤ 0.05 — it adds texture only, not visibility.

4. The radial gold glow behind the wordmark is a div with position:
   absolute, pointer-events: none, width: 100%, height: 50%,
   top: 0, background: the radial gradient defined above.

5. All four account cards must have identical sizing. Use CSS Grid
   with grid-template-columns: 1fr 1fr and gap: 12px. Parent has
   padding: 0 16px.

6. Navigation on card tap must use React Router's useNavigate hook.
   Set the currentAccount in AppContext before navigating.

7. The entire screen should be non-scrollable — all content fits
   within 100dvh (dynamic viewport height for mobile).

8. Safe area insets: use padding-bottom: env(safe-area-inset-bottom)
   on the bottom bar element. Use padding-top: env(safe-area-inset-top)
   on the top section.
```

---

## Stub Screens (Required for Routing)

Each of these files must exist with a minimal placeholder that renders the AppShell correctly. They will be replaced in later phases.

### `src/screens/portfolio/Dashboard.jsx` (stub)
```jsx
// STUB — replaced in Phase 1.1
export default function PortfolioDashboard() {
  return (
    <div style={{ padding: '24px 16px', color: 'var(--text-secondary)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '24px', color: 'var(--gold-mid)' }}>
        Personal Portfolio
      </p>
      <p style={{ marginTop: '8px', fontSize: '14px' }}>Phase 1 — coming in next build phase</p>
    </div>
  )
}
```

Repeat this same stub pattern for:
- `src/screens/borrower/Home.jsx`
- `src/screens/community/Dashboard.jsx`
- `src/screens/ngo/Dashboard.jsx`

Each stub should display the account type name and "Phase X — coming in next build phase" in the same style.

---

## AppShell Implementation Notes

```
IMPORTANT for Claude Code building AppShell:

1. AppShell receives an `accountType` prop (one of: 'portfolio',
   'borrower', 'community', 'ngo'). Use this to:
   - Set the correct BottomNav tabs for each account
   - Apply a subtle accent glow color per account to the TopBar border

2. AppShell uses React Router's <Outlet /> to render child screens.
   Wrap <Outlet /> in an AnimatePresence component to enable screen
   transitions between child routes.

3. The global ambient glow (var(--gradient-glow-top)) must be rendered
   as a position:fixed, pointer-events:none div that sits at z-index 0,
   behind all content but above the body background. Width: 100%,
   Height: 300px, top: 0. This glow persists across all screens
   within the shell.

4. BottomNav tab configurations per account:
   - Portfolio: [ Home, Invest, Journey, Discover ]
   - Borrower: [ Home, Payments, Account ]
   - Community: [ Dashboard, Circles, Vouching, Insights ]
   - NGO: [ Dashboard, Campaigns, Donors, Insights, Account ]

5. The back button in TopBar only renders when the current route
   is not the index route for that account. Use useLocation() to
   determine this.
```

---

## Phase 0 Acceptance Criteria

The following must be true before Phase 0 is considered complete and Phase 1 can begin:

- [ ] Vite + React project scaffolded and running
- [ ] All CSS custom properties defined in `index.css`
- [ ] Google Fonts (Cormorant Garamond, DM Sans, Amiri) loaded in `index.html`
- [ ] Framer Motion installed and imported
- [ ] React Router v6 configured with all 4 account routes
- [ ] AppContext provider wrapping the app
- [ ] Welcome screen renders correctly with all visual elements:
  - [ ] Arabic wordmark in Amiri font
  - [ ] English wordmark in Cormorant Garamond
  - [ ] Radial gold glow behind wordmark
  - [ ] Islamic geometric background pattern at correct opacity
  - [ ] All 4 account type cards in 2×2 grid
  - [ ] Correct accent colors per card
  - [ ] Stagger entrance animation on load
  - [ ] Hover states working on cards
  - [ ] Navigation to correct route on tap
- [ ] AppShell renders with TopBar and BottomNav for each account
- [ ] All 4 stub screens rendering inside AppShell
- [ ] Screen transition animation working between routes
- [ ] App fits within 430px max-width, centered on wider screens
- [ ] No horizontal scroll anywhere in the app
- [ ] No console errors

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0"
  }
}
```

## `index.html` Google Fonts Link

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet">
```

---

## Notes for Claude Code

- Build Phase 0 completely before touching any Phase 1-4 files
- The design system defined here is the single source of truth — later phases must import from these CSS variables, never redefine them
- Every component must be mobile-first — design at 390px width, ensure nothing breaks at 320px
- Test the welcome screen entrance animation at load — it is the first impression and must be smooth
- The Islamic geometric SVG pattern is important — do not skip it or replace it with a CSS pattern. It must be a proper 8-pointed star tessellation.
- Framer Motion's AnimatePresence must wrap route transitions at the AppShell level — this enables the screen entrance/exit animations to fire on navigation
- All hardcoded demo data lives in AppContext for now — later phases will use more granular state but should import from context
