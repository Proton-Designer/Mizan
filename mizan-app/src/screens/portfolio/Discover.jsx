import { useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGO } from '../../context/NGOContext'
import { usePortfolio } from '../../context/PortfolioContext'
import { scoreNGOFeed } from '../../utils/algorithms'
import {
  Search,
  Star,
  CheckCircle,
  X,
  Pencil,
  ArrowRight,
  TrendingUp,
  Users,
  ChevronDown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'

/* ── Constants ── */

const ALL_CATEGORIES = [
  'Water', 'Food', 'Medical', 'Education', 'Orphan',
  'Emergency', 'Refugees', 'Community',
]

const TABS = ['For You', 'Trending', 'All Causes']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'az', label: 'A-Z' },
]

/* ── Helpers ── */

function LogoWithFallback({ src, name, size = 36, style = {} }) {
  const [failed, setFailed] = useState(false)
  const initial = (name || '?')[0].toUpperCase()
  const hue = name ? name.charCodeAt(0) * 37 % 360 : 200

  if (failed || !src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `hsl(${hue}, 45%, 35%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: size * 0.45,
          flexShrink: 0,
          ...style,
        }}
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

function VerificationBadge({ status }) {
  if (status !== 'tier1') return null
  return (
    <CheckCircle
      size={14}
      style={{ color: 'var(--accent-gold)', marginLeft: 4, flexShrink: 0 }}
    />
  )
}

function StarRating({ stars }) {
  if (stars == null) return null
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= stars ? 'var(--accent-gold)' : 'transparent'}
          stroke={i <= stars ? 'var(--accent-gold)' : 'var(--text-tertiary)'}
        />
      ))}
    </div>
  )
}

/* ── Main Component ── */

export default function Discover() {
  const navigate = useNavigate()
  const { ngoDatabase, ngoLoading } = useNGO()
  const { positions, sessionSeed, openInvest } = usePortfolio()

  /* ── Intentions state ── */
  const [intentions, setIntentions] = useState(['Gaza', 'Water', 'Orphans'])
  const [editingIntentions, setEditingIntentions] = useState(false)
  const [draftCategories, setDraftCategories] = useState([])

  /* ── Tabs ── */
  const [activeTab, setActiveTab] = useState('For You')

  /* ── All Causes state ── */
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const searchTimerRef = useRef(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [sortBy, setSortBy] = useState('relevance')

  /* ── Debounced search (local only) ── */
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearchDebounced(value)
    }, 150)
  }, [])

  /* ── Algorithm feed ── */
  const { feed, sunnahDiscovery, sunnahReason } = useMemo(() => {
    if (!ngoDatabase || ngoDatabase.length === 0) {
      return { feed: [], sunnahDiscovery: null, sunnahReason: '' }
    }
    return scoreNGOFeed(ngoDatabase, intentions, positions, sessionSeed)
  }, [ngoDatabase, intentions, positions, sessionSeed])

  /* ── Trending feed ── */
  const trendingFeed = useMemo(() => {
    if (!ngoDatabase || ngoDatabase.length === 0) return []
    return [...ngoDatabase].sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0))
  }, [ngoDatabase])

  /* ── All Causes feed (curated database search) ── */
  const allCausesFeed = useMemo(() => {
    if (!ngoDatabase || ngoDatabase.length === 0) return []
    let filtered = [...ngoDatabase]

    // Category filter
    if (categoryFilter) {
      const cat = categoryFilter.toLowerCase()
      filtered = filtered.filter(
        (ngo) =>
          ngo.category === cat ||
          (ngo.secondaryCategories || []).map((c) => c.toLowerCase()).includes(cat)
      )
    }

    // Search filter
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase().trim()
      filtered = filtered.filter((ngo) => {
        const haystack = [
          ngo.name, ngo.mission, ...(ngo.tags || []),
          ngo.category, ...(ngo.secondaryCategories || []),
          ...(ngo.countriesOfOperation || []),
        ].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.charityNavigatorScore || 0) - (a.charityNavigatorScore || 0))
    } else if (sortBy === 'az') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [ngoDatabase, categoryFilter, searchDebounced, sortBy])

  /* ── Regular feed (For You minus sunnah) ── */
  const regularFeed = useMemo(() => {
    if (!sunnahDiscovery) return feed
    return feed.filter((ngo) => ngo.id !== sunnahDiscovery.id)
  }, [feed, sunnahDiscovery])

  /* ── Edit intentions ── */
  const openEditIntentions = useCallback(() => {
    setDraftCategories([...intentions])
    setEditingIntentions(true)
  }, [intentions])

  const toggleDraftCategory = useCallback((cat) => {
    setDraftCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }, [])

  const saveIntentions = useCallback(() => {
    setIntentions(draftCategories)
    setEditingIntentions(false)
  }, [draftCategories])

  const removeIntention = useCallback((tag) => {
    setIntentions((prev) => prev.filter((t) => t !== tag))
  }, [])

  /* ── Styles ── */
  const dmSans = "'DM Sans', sans-serif"
  const cormorant = "'Cormorant Garamond', serif"

  if (ngoLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: dmSans }}
      >
        Loading causes...
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page Title ── */}
      <h1
        style={{
          fontFamily: cormorant,
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Discover Causes
      </h1>
      <p
        style={{
          fontFamily: dmSans,
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 20,
        }}
      >
        {ngoDatabase.length} organizations aligned with your values
      </p>

      {/* ── Intentions Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 24,
          position: 'relative',
        }}
      >
        {intentions.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-overlay)',
              color: 'var(--text-secondary)',
              fontFamily: dmSans,
              fontSize: 13,
              padding: '5px 12px',
              borderRadius: 999,
            }}
          >
            {tag}
            <X
              size={12}
              style={{ cursor: 'pointer', opacity: 0.6 }}
              onClick={() => removeIntention(tag)}
            />
          </span>
        ))}

        <button
          onClick={openEditIntentions}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Pencil size={15} />
        </button>

        {/* ── Edit popover ── */}
        <AnimatePresence>
          {editingIntentions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                zIndex: 100,
                minWidth: 280,
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              }}
            >
              <p
                style={{
                  fontFamily: dmSans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                Select your intentions
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {ALL_CATEGORIES.map((cat) => {
                  const selected = draftCategories.includes(cat)
                  return (
                    <label
                      key={cat}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontFamily: dmSans,
                        background: selected ? 'rgba(212,168,67,0.15)' : 'var(--bg-overlay)',
                        color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        border: selected
                          ? '1px solid var(--border-gold)'
                          : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleDraftCategory(cat)}
                        style={{ display: 'none' }}
                      />
                      {cat}
                    </label>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={saveIntentions}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: dmSans,
                    fontSize: 13,
                    fontWeight: 600,
                    background: 'var(--accent-gold)',
                    color: '#000',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingIntentions(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontFamily: dmSans,
                    fontSize: 13,
                    background: 'none',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tab Selector ── */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 28,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
              paddingBottom: 10,
              borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'For You' && (
        <ForYouTab
          sunnahDiscovery={sunnahDiscovery}
          sunnahReason={sunnahReason}
          regularFeed={regularFeed}
          openInvest={openInvest}
          navigate={navigate}
        />
      )}

      {activeTab === 'Trending' && (
        <TrendingTab
          feed={trendingFeed}
          openInvest={openInvest}
          navigate={navigate}
        />
      )}

      {activeTab === 'All Causes' && (
        <AllCausesTab
          feed={allCausesFeed}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          openInvest={openInvest}
          navigate={navigate}
        />
      )}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════
   FOR YOU TAB
   ══════════════════════════════════════════════ */

function ForYouTab({ sunnahDiscovery, sunnahReason, regularFeed, openInvest, navigate }) {
  const dmSans = "'DM Sans', sans-serif"

  return (
    <div>
      {/* ── Sunnah Discovery Card ── */}
      {sunnahDiscovery && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 28,
            background: 'var(--bg-surface)',
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
            <span
              style={{
                fontFamily: dmSans,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent-gold)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              A cause you'd never have found
            </span>
          </div>

          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <LogoWithFallback
              src={sunnahDiscovery.logo}
              name={sunnahDiscovery.name}
              size={48}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontFamily: dmSans,
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {sunnahDiscovery.name}
                </span>
                <VerificationBadge status={sunnahDiscovery.verificationStatus} />
              </div>
            </div>
          </div>

          {/* Sunnah reason */}
          <p
            style={{
              fontFamily: dmSans,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {sunnahReason}
          </p>

          {/* Impact line */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span
              style={{
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--accent-gold)',
              }}
            >
              $1 = {sunnahDiscovery.impactPerDollar} {sunnahDiscovery.impactUnit}
            </span>

            {sunnahDiscovery.compoundEligible && (
              <span
                style={{
                  fontFamily: dmSans,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                  background: 'rgba(212,168,67,0.1)',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                Compound available
              </span>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <span
              style={{
                fontFamily: dmSans,
                fontSize: 12,
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Users size={12} />
              {sunnahDiscovery.platformDonorCount || 0} donors this month
            </span>
            {(sunnahDiscovery.platformDonorCount || 0) < 50 && (
              <span
                style={{
                  fontFamily: dmSans,
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                }}
              >
                You'd be the {(sunnahDiscovery.platformDonorCount || 0) + 1}
                {getOrdinalSuffix((sunnahDiscovery.platformDonorCount || 0) + 1)} donor
              </span>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              openInvest(sunnahDiscovery.id)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--accent-gold)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 14,
            }}
          >
            Invest in this cause <ArrowRight size={14} />
          </button>

          {/* Hadith */}
          <p
            style={{
              fontFamily: dmSans,
              fontSize: 11,
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            The Prophet said: "The best of people are those most beneficial to others."
          </p>
        </motion.div>
      )}

      {/* ── 2-column grid of regular cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {regularFeed.map((ngo, i) => (
          <CauseCard
            key={ngo.id}
            ngo={ngo}
            index={i}
            openInvest={openInvest}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   TRENDING TAB
   ══════════════════════════════════════════════ */

function TrendingTab({ feed, openInvest, navigate }) {
  const dmSans = "'DM Sans', sans-serif"

  return (
    <div>
      {feed.map((ngo, i) => {
        const isTop = i === 0
        return (
          <motion.div
            key={ngo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/portfolio/discover/${ngo.id}`)}
            style={{
              background: 'var(--bg-surface)',
              border: isTop ? '1.5px solid #ef4444' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              marginBottom: 12,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              animation: isTop ? 'pulse-border 2s ease-in-out infinite' : undefined,
            }}
          >
            {isTop && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(239,68,68,0.12)',
                  color: '#ef4444',
                  fontFamily: dmSans,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 6,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <AlertTriangle size={12} /> Urgent need
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <LogoWithFallback src={ngo.logo} name={ngo.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: dmSans,
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {ngo.name}
                  </span>
                  <VerificationBadge status={ngo.verificationStatus} />

                  {(ngo.urgencyScore || 0) > 0.7 && !isTop && (
                    <span
                      style={{
                        fontFamily: dmSans,
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.1)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        marginLeft: 4,
                      }}
                    >
                      Urgent
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontFamily: dmSans,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    marginBottom: 10,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {ngo.mission}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: dmSans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--accent-gold)',
                    }}
                  >
                    $1 = {ngo.impactPerDollar} {ngo.impactUnit}
                  </span>
                  <StarRating stars={ngo.charityNavigatorStars} />
                  {ngo.compoundEligible && (
                    <span
                      style={{
                        fontFamily: dmSans,
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--accent-gold)',
                        background: 'rgba(212,168,67,0.1)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Compound
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: dmSans,
                      fontSize: 11,
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {ngo.platformDonorCount} investors
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openInvest(ngo.id)
                  }}
                  style={{
                    marginTop: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'var(--accent-gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 6,
                    padding: '7px 14px',
                    fontFamily: dmSans,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Invest <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ALL CAUSES TAB
   ══════════════════════════════════════════════ */

function AllCausesTab({
  feed,
  searchQuery,
  onSearchChange,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  openInvest,
  navigate,
}) {
  const dmSans = "'DM Sans', sans-serif"
  const [sortOpen, setSortOpen] = useState(false)

  return (
    <div>
      {/* ── Search ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-elevated)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 16,
        }}
      >
        <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search causes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: dmSans,
            fontSize: 14,
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* ── Category pills + Sort ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setCategoryFilter(null)}
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            border: !categoryFilter ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
            background: !categoryFilter ? 'rgba(212,168,67,0.1)' : 'transparent',
            color: !categoryFilter ? 'var(--accent-gold)' : 'var(--text-tertiary)',
            fontFamily: dmSans,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const active = categoryFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(active ? null : cat)}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: active ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: active ? 'rgba(212,168,67,0.1)' : 'transparent',
                color: active ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                fontFamily: dmSans,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          )
        })}

        {/* Sort dropdown */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button
            onClick={() => setSortOpen((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '5px 10px',
              fontFamily: dmSans,
              fontSize: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <ChevronDown size={12} />
          </button>
          {sortOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 50,
                minWidth: 120,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value)
                    setSortOpen(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 14px',
                    background: sortBy === opt.value ? 'rgba(212,168,67,0.08)' : 'transparent',
                    border: 'none',
                    fontFamily: dmSans,
                    fontSize: 13,
                    color:
                      sortBy === opt.value ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3-column compact grid ── */}
      {feed.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontFamily: dmSans,
            fontSize: 14,
          }}
        >
          No causes match your search.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {feed.map((ngo, i) => (
            <motion.div
              key={ngo.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/portfolio/discover/${ngo.id}`)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 16,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LogoWithFallback src={ngo.logo} name={ngo.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ngo.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      color: 'var(--text-tertiary)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {ngo.category}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openInvest(ngo.id)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: 'var(--accent-gold)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Invest <ArrowRight size={11} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   CAUSE CARD (For You grid)
   ══════════════════════════════════════════════ */

function CauseCard({ ngo, index, openInvest, navigate }) {
  const dmSans = "'DM Sans', sans-serif"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      onClick={() => navigate(`/portfolio/discover/${ngo.id}`)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Logo + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LogoWithFallback src={ngo.logo} name={ngo.name} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontFamily: dmSans,
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ngo.name}
            </span>
            <VerificationBadge status={ngo.verificationStatus} />
          </div>
        </div>

        {/* Urgency badge */}
        {(ngo.urgencyScore || 0) > 0.7 && (
          <span
            style={{
              fontFamily: dmSans,
              fontSize: 10,
              fontWeight: 700,
              color: '#ef4444',
              background: 'rgba(239,68,68,0.1)',
              padding: '2px 8px',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            Urgent
          </span>
        )}
      </div>

      {/* Mission */}
      <p
        style={{
          fontFamily: dmSans,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {ngo.mission}
      </p>

      {/* Impact + Stars row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontFamily: dmSans,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--accent-gold)',
          }}
        >
          $1 = {ngo.impactPerDollar} {ngo.impactUnit}
        </span>
        <StarRating stars={ngo.charityNavigatorStars} />
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {ngo.compoundEligible && (
          <span
            style={{
              fontFamily: dmSans,
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--accent-gold)',
              background: 'rgba(212,168,67,0.1)',
              padding: '2px 7px',
              borderRadius: 4,
            }}
          >
            Compound available
          </span>
        )}
        <span
          style={{
            fontFamily: dmSans,
            fontSize: 11,
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Users size={11} />
          {ngo.platformDonorCount} investors
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          openInvest(ngo.id)
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          alignSelf: 'flex-start',
          background: 'var(--accent-gold)',
          color: '#000',
          border: 'none',
          borderRadius: 6,
          padding: '7px 14px',
          fontFamily: dmSans,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 2,
        }}
      >
        Invest <ArrowRight size={12} />
      </button>
    </motion.div>
  )
}

/* ── Utility ── */

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
