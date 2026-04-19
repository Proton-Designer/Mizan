import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ── animation hook ── */
function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

/* ── stat mini-component ── */
function StatCell({ label, value, prefix = '', color = 'var(--text-primary)' }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0)
  const display = typeof value === 'number' ? `${prefix}${animated.toLocaleString()}` : value
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color, fontFamily: "'Cormorant Garamond', serif" }}>
        {display}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.3px' }}>
        {label}
      </div>
    </div>
  )
}

/* ── campaign card ── */
function CampaignCard({ name, percent, compound, note, noteColor, goalMet }) {
  return (
    <div style={{
      minWidth: '280px',
      background: 'rgba(22, 22, 31, 0.55)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(240, 237, 232, 0.06)',
      borderRadius: '14px',
      borderLeft: '4px solid var(--gold)',
      padding: '18px 16px',
      flexShrink: 0,
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: 'var(--text-primary)', marginBottom: '10px' }}>
        {name}
      </div>

      {/* progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '8px', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          borderRadius: '6px',
          background: goalMet
            ? 'var(--success, #4ade80)'
            : `linear-gradient(90deg, var(--gold), var(--gold-light))`,
          transition: 'width 1s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
        <span style={{ color: 'var(--text-muted)' }}>{percent}%</span>
        {goalMet && <span style={{ color: 'var(--success, #4ade80)', fontWeight: 600 }}>Goal met &#10003;</span>}
        {compound && <span style={{ color: 'var(--gold-light)', fontSize: '11px' }}>{compound} compound</span>}
        {note && <span style={{ color: noteColor || '#facc15', fontSize: '11px', fontWeight: 600 }}>{note}</span>}
      </div>

      <Link to={`/ngo/campaigns`} style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', color: 'var(--gold)', textDecoration: 'none' }}>
        View campaign &rarr;
      </Link>
    </div>
  )
}

/* ── pending action item ── */
function ActionItem({ priority, label, bgWash }) {
  const dotColor = priority === 'red' ? '#ef4444' : priority === 'yellow' ? '#facc15' : 'rgba(255,255,255,0.5)'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      borderRadius: '10px',
      background: bgWash || 'transparent',
      fontSize: '14px',
      color: 'var(--text-primary)',
    }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      {label}
    </div>
  )
}

/* ── settlement row ── */
function SettlementRow({ label, amount, maxAmount }) {
  const barPercent = (amount / maxAmount) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
      <span style={{ width: '40px', fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${barPercent}%`, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }} />
      </div>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', width: '60px', textAlign: 'right' }}>${amount.toLocaleString()}</span>
    </div>
  )
}

/* ════════════════════════════════════════
   NGO Dashboard
   ════════════════════════════════════════ */
export default function NGODashboard() {
  const ngo = useNGOPartner()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!ngo.onboardingComplete) {
      navigate('/ngo/setup', { replace: true })
    }
  }, [ngo.onboardingComplete, navigate])

  useEffect(() => { setMounted(true) }, [])

  const fadeIn = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  }

  return (
    <div style={{ padding: '24px 16px 40px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

      {/* ── Gold gradient mesh ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 350,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212, 168, 67, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Hero Card ── */}
      <div style={{
        background: `radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.18) 0%, transparent 60%), rgba(22, 22, 31, 0.55)`,
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 168, 67, 0.1)',
        borderRadius: '18px',
        padding: '24px 20px',
        marginBottom: '24px',
        ...fadeIn,
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          {/* Left column */}
          <div style={{ flex: '1 1 260px' }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 4px',
            }}>
              Islamic Relief USA
            </h1>
            <div style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--gold)',
              background: 'rgba(212,175,55,0.12)',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '18px',
            }}>
              Tier 1 Verified &#10003;
            </div>

            {/* 2x2 stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 24px',
              ...fadeIn,
              transitionDelay: '0.15s',
            }}>
              <StatCell label="Total raised" value={284700} prefix="$" color="var(--gold-light)" />
              <StatCell label="Families helped" value={1247} color="var(--text-primary)" />
              <StatCell label="Active campaigns" value={4} color="var(--text-primary)" />
              <StatCell label="Jariyah commitments" value={89} color="var(--gold-light)" />
            </div>
          </div>

          {/* Right column */}
          <div style={{
            flex: '1 1 200px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '16px',
            ...fadeIn,
            transitionDelay: '0.25s',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600, letterSpacing: '0.4px' }}>
              This month:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                <span style={{ color: 'var(--success, #4ade80)', fontWeight: 600 }}>$12,400</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Compound in-transit</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>$8,200 &#10227;</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>New donors</span>
                <span style={{ color: '#2dd4bf', fontWeight: 600 }}>43</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Returning</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>127</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaign Performance Row ── */}
      <div style={{ marginBottom: '24px', ...fadeIn, transitionDelay: '0.35s' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          color: 'var(--text-primary)',
          margin: '0 0 12px',
        }}>
          Campaign Performance
        </h2>
        <div style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch',
        }}>
          <CampaignCard name="Yemen Emergency Relief" percent={70} compound="$3,200" />
          <CampaignCard name="Gaza Reconstruction Fund" percent={100} goalMet />
          <CampaignCard name="Somalia Drought Response" percent={43} />
          <CampaignCard name="Rohingya Refugee Aid" percent={10} note="Low momentum" noteColor="#facc15" />
        </div>
      </div>

      {/* ── Lower Two-Column Section ── */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        ...fadeIn,
        transitionDelay: '0.45s',
      }}>

        {/* Pending Actions (60%) */}
        <div style={{
          flex: '3 1 320px',
          background: 'rgba(22, 22, 31, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
          padding: '18px 16px',
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '17px',
            color: 'var(--text-primary)',
            margin: '0 0 12px',
          }}>
            Pending Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ActionItem
              priority="red"
              label="Upload Q1 compliance docs (overdue)"
              bgWash="rgba(239,68,68,0.08)"
            />
            <ActionItem
              priority="red"
              label="Verify 3 new beneficiary families"
              bgWash="rgba(239,68,68,0.08)"
            />
            <ActionItem
              priority="yellow"
              label="Review compound interest allocation for Gaza"
              bgWash="rgba(250,204,21,0.06)"
            />
            <ActionItem
              priority="white"
              label="Update campaign photos for Somalia"
              bgWash="rgba(255,255,255,0.03)"
            />
          </div>
        </div>

        {/* Settlement Calendar (40%) */}
        <div style={{
          flex: '2 1 220px',
          background: 'rgba(22, 22, 31, 0.55)',
          border: '1px solid rgba(212, 168, 67, 0.1)',
          backdropFilter: 'blur(16px)',
          borderRadius: '14px',
          padding: '18px 16px',
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '17px',
            color: 'var(--text-primary)',
            margin: '0 0 14px',
          }}>
            Settlement Calendar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SettlementRow label="May" amount={1200} maxAmount={8400} />
            <SettlementRow label="Jun" amount={2800} maxAmount={8400} />
            <SettlementRow label="Jul" amount={4100} maxAmount={8400} />
            <SettlementRow label="Q4" amount={8400} maxAmount={8400} />
          </div>
          <div style={{
            marginTop: '16px',
            textAlign: 'right',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--gold)',
          }}>
            $16,500
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            total scheduled
          </div>
        </div>
      </div>
    </div>
  )
}
