export const ANIMATION = {
  screenEnter: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  sheetEnter: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
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
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 }
  },
  scalePop: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
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
    accentColor: '#D4A843',
    description: 'Track your sadaqah, cycle qard hassan loans, and build your akhirah portfolio'
  },
  borrower: {
    label: 'Loan Account',
    subtitle: 'Interest-free financial help',
    icon: 'HandHeart',
    route: '/borrower',
    accentColor: '#4AADA4',
    description: 'Apply for qard hassan — interest-free loans from your community'
  },
  community: {
    label: 'Community Hub',
    subtitle: 'For mosques & circles',
    icon: 'Users',
    route: '/community',
    accentColor: '#7ECDC4',
    description: 'Manage your congregation\'s giving, qard hassan circles, and vouching'
  },
  ngo: {
    label: 'NGO Dashboard',
    subtitle: 'For nonprofits & causes',
    icon: 'Globe',
    route: '/ngo',
    accentColor: '#F5D485',
    description: 'Launch campaigns, track donor intelligence, and report your impact'
  }
}
