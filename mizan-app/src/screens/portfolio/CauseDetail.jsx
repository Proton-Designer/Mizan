import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNGO } from '../../context/NGOContext'
import { usePortfolio } from '../../context/PortfolioContext'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Globe,
  ExternalLink,
  Shield,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react'

/* ── Helpers ── */

function formatCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)} million`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/* ── Reusable Card wrapper ── */

function Card({ title, icon: Icon, children, style }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {Icon && <Icon size={18} style={{ color: 'var(--text-secondary)' }} />}
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}

/* ── Star Rating ── */

function StarRating({ stars, max = 4 }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={18}
          fill={i < stars ? '#C9A84C' : 'none'}
          stroke={i < stars ? '#C9A84C' : 'var(--text-tertiary)'}
        />
      ))}
    </div>
  )
}

/* ── Pill chip ── */

function Chip({ children, style }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        background: 'var(--bg-overlay, rgba(255,255,255,0.06))',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */

export default function CauseDetail() {
  const { ngoId } = useParams()
  const { getNgoById, fetchLiveData, getFinancials } = useNGO()
  const { openInvest } = usePortfolio()
  const navigate = useNavigate()
  const ngo = getNgoById(ngoId)
  const [liveData, setLiveData] = useState(null)

  // Fetch live financial data from ProPublica when page loads
  useEffect(() => {
    if (!ngoId) return
    // Check cache first
    const cached = getFinancials(ngoId)
    if (cached) {
      setLiveData(cached)
      return
    }
    // Fetch fresh
    fetchLiveData(ngoId).then(data => {
      if (data) setLiveData(data)
    })
  }, [ngoId, fetchLiveData, getFinancials])

  if (!ngo) {
    return (
      <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>
        Organization not found.
      </div>
    )
  }

  const allCategories = [
    ngo.category,
    ...(ngo.secondaryCategories || []),
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '96px' }}
    >
      {/* ── Back link ── */}
      <button
        onClick={() => navigate('/portfolio/discover')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          cursor: 'pointer',
          padding: '0',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Back to Discover
      </button>

      {/* ── Header ── */}
      <div
        style={{
          background: 'rgba(22, 22, 31, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(240, 237, 232, 0.06)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          marginBottom: 24,
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '8px',
        }}
      >
        {/* Logo / fallback */}
        {ngo.logo ? (
          <img
            src={ngo.logo}
            alt={ngo.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              objectFit: 'cover',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: ngo.logo ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#C9A84C',
            flexShrink: 0,
          }}
        >
          {ngo.name.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              lineHeight: 1.1,
            }}
          >
            {ngo.name}
          </h1>

          {/* Verification badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            {ngo.verificationStatus === 'tier1' ? (
              <>
                <CheckCircle size={16} style={{ color: '#10B981' }} />
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#10B981',
                  }}
                >
                  IRS Verified 501(c)(3)
                </span>
              </>
            ) : (
              <>
                <Shield size={16} style={{ color: 'var(--text-tertiary)' }} />
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Community Vouched
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Impact headline */}
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '24px',
          fontWeight: 600,
          color: '#C9A84C',
          margin: '0 0 12px 0',
        }}
      >
        $1 = {ngo.impactPerDollar} {ngo.impactUnit}
      </p>

      {/* Category chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '28px',
        }}
      >
        {allCategories.map((cat) => (
          <Chip key={cat} style={{ textTransform: 'capitalize' }}>
            {cat}
          </Chip>
        ))}
      </div>
      </div>

      {/* ── Campaign Progress ── */}
      {ngo.currentCampaigns && ngo.currentCampaigns.length > 0 && (
        <Card title="Active Campaigns" icon={BarChart3} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {ngo.currentCampaigns.map((campaign) => {
              const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
              return (
                <div key={campaign.id}>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {campaign.name}
                  </p>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '5px',
                      background: 'var(--bg-overlay, rgba(255,255,255,0.06))',
                      marginBottom: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '5px',
                        background: '#C9A84C',
                        transition: 'width 0.4s ease',
                        boxShadow: '0 0 12px rgba(212, 168, 67, 0.2)',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontFamily: "'DM Sans', sans-serif",
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>
                      ${campaign.raised.toLocaleString()} raised of $
                      {campaign.goal.toLocaleString()} goal
                    </span>
                    <span style={{ fontWeight: 600, color: '#C9A84C' }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── About ── */}
      <Card title="About" style={{ marginBottom: '16px' }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
          }}
        >
          {ngo.mission}
        </p>

        {/* Countries */}
        {ngo.countriesOfOperation && ngo.countriesOfOperation.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <p
              style={{
                fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 8px 0',
              }}
            >
              Countries of Operation
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ngo.countriesOfOperation.map((c) => (
                <Chip key={c}>
                  <Globe
                    size={12}
                    style={{
                      verticalAlign: '-2px',
                      marginRight: '4px',
                      color: 'var(--text-tertiary)',
                    }}
                  />
                  {c}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Website */}
        {ngo.website && (
          <a
            href={ngo.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              color: '#C9A84C',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            {domainFromUrl(ngo.website)}
          </a>
        )}
      </Card>

      {/* ── Impact Metrics ── */}
      <Card title="Impact Metrics" icon={DollarSign} style={{ marginBottom: '16px' }}>
        {/* Impact description */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: 1.6,
          }}
        >
          {ngo.impactDescription}
        </p>

        {/* Program expense bar */}
        {ngo.programExpensePercent != null && (
          <div style={{ marginBottom: '16px' }}>
            <p
              style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                color: 'var(--text-primary)',
                margin: '0 0 8px 0',
              }}
            >
              {ngo.programExpensePercent}% of donations go directly to programs
            </p>
            <div
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '6px',
                background: 'var(--text-tertiary)',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${ngo.programExpensePercent}%`,
                  height: '100%',
                  background: '#10B981',
                  borderRadius: '6px 0 0 6px',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  background: 'var(--text-tertiary)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '11px',
                fontFamily: "'DM Sans', sans-serif",
                color: 'var(--text-tertiary)',
              }}
            >
              <span style={{ color: '#10B981' }}>
                Programs {ngo.programExpensePercent}%
              </span>
              <span>Overhead {100 - ngo.programExpensePercent}%</span>
            </div>
          </div>
        )}

        {/* Annual revenue */}
        {(liveData?.totalRevenue || ngo.annualRevenue) != null && (
          <p
            style={{
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            {formatCurrency(liveData?.totalRevenue || ngo.annualRevenue)} annual budget
            {liveData?.filingYear && (
              <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}> (FY{liveData.filingYear})</span>
            )}
          </p>
        )}
        {liveData && (
          <p style={{ fontSize: '11px', fontFamily: "'DM Sans', sans-serif", color: 'var(--teal-mid)', marginTop: '8px' }}>
            Live data from IRS Form 990
          </p>
        )}
      </Card>

      {/* ── Charity Navigator ── */}
      {ngo.charityNavigatorScore != null && (
        <Card title="Charity Navigator Rating" icon={BarChart3} style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '12px',
            }}
          >
            {/* Score circle */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid #C9A84C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#C9A84C',
                }}
              >
                {ngo.charityNavigatorScore}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'var(--text-primary)',
                  margin: '0 0 4px 0',
                }}
              >
                Overall Score: {ngo.charityNavigatorScore}/100
              </p>
              {ngo.charityNavigatorStars != null && (
                <StarRating stars={ngo.charityNavigatorStars} />
              )}
            </div>
          </div>
          <p
            style={{
              fontSize: '13px',
              fontFamily: "'DM Sans', sans-serif",
              color: 'var(--text-tertiary)',
              margin: '0 0 12px 0',
            }}
          >
            Based on financial health, accountability, and transparency.
          </p>
          <a
            href={`https://www.charitynavigator.org/ein/${(ngo.ein || '').replace('-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              color: '#C9A84C',
              textDecoration: 'none',
            }}
          >
            View on Charity Navigator
            <ExternalLink size={14} />
          </a>
        </Card>
      )}

      {/* ── IRS Verification ── */}
      {ngo.ein && (
        <Card title="Tax Information" icon={Shield} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p
              style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              IRS EIN: {ngo.ein}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} style={{ color: '#10B981' }} />
              <span
                style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#10B981',
                }}
              >
                Status: Verified 501(c)(3)
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                fontFamily: "'DM Sans', sans-serif",
                color: 'var(--text-tertiary)',
                margin: 0,
              }}
            >
              Tax-deductible contributions
            </p>
          </div>
        </Card>
      )}

      {/* ── Sticky Invest CTA ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          background: 'rgba(15, 15, 26, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-subtle)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => openInvest(ngo.id)}
          style={{
            width: '100%',
            maxWidth: '480px',
            height: '48px',
            borderRadius: 'var(--radius-lg, 12px)',
            border: 'none',
            background: '#C9A84C',
            color: '#0A0A0F',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.3px',
          }}
        >
          Invest in {ngo.name}
        </button>
      </div>
    </motion.div>
  )
}
