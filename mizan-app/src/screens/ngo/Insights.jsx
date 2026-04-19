import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ═══════════════════════════════════════════════════════════════
   STYLE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const card = {
  background: 'var(--bg-surface, #111)',
  borderRadius: 'var(--radius-lg, 16px)',
  border: '1px solid var(--border-subtle, #222)',
  padding: 20,
}

const serif = (size = 24) => ({
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: size,
  fontWeight: 600,
})

const dm = (size = 13) => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: size,
})

const sectionTitle = {
  ...dm(11),
  fontWeight: 600,
  color: 'var(--text-tertiary, #666)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 12,
}

const goldBtn = {
  ...dm(13),
  fontWeight: 600,
  background: 'linear-gradient(135deg, #F5D485 0%, #D4A843 50%, #A07830 100%)',
  color: '#0A0A0F',
  border: 'none',
  borderRadius: 'var(--radius-sm, 8px)',
  padding: '10px 22px',
  cursor: 'pointer',
}

const outlineBtn = {
  ...dm(12),
  fontWeight: 500,
  background: 'transparent',
  border: '1px solid var(--border-default, #333)',
  borderRadius: 'var(--radius-sm, 8px)',
  color: 'var(--text-primary, #eee)',
  padding: '7px 14px',
  cursor: 'pointer',
}

/* ═══════════════════════════════════════════════════════════════
   PILL TABS
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['Analytics', 'A/B Tests', 'Settlements']

function PillTabs({ active, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg-elevated, #1a1a2e)',
      borderRadius: 'var(--radius-pill, 100px)',
      padding: 3,
      gap: 2,
      marginBottom: 28,
    }}>
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            ...dm(13),
            fontWeight: active === tab ? 600 : 400,
            padding: '8px 20px',
            borderRadius: 'var(--radius-pill, 100px)',
            border: 'none',
            background: active === tab ? 'rgba(212,168,67,0.15)' : 'transparent',
            color: active === tab ? 'var(--gold-light, #F5D485)' : 'var(--text-secondary, #999)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════════════════ */

const FUNNEL_STEPS = [
  { label: 'Impressions', value: 4840, width: 100 },
  { label: 'Page Views', value: 892, width: 76 },
  { label: 'Donations Initiated', value: 341, width: 52 },
  { label: 'Donations Completed', value: 247, width: 38 },
]

const COMPOUND_VS_DIRECT = [
  { month: 'Oct', compound: 2100, direct: 8400 },
  { month: 'Nov', compound: 2800, direct: 7600 },
  { month: 'Dec', compound: 4200, direct: 7100 },
  { month: 'Jan', compound: 5100, direct: 6200 },
  { month: 'Feb', compound: 6400, direct: 5100 },
  { month: 'Mar', compound: 7800, direct: 4400 },
  { month: 'Apr', compound: 9200, direct: 3800 },
]

function AnalyticsTab() {
  const maxVal = Math.max(...COMPOUND_VS_DIRECT.map(d => Math.max(d.compound, d.direct)))
  const chartH = 200
  const chartW = 500

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Campaign Funnel ── */}
      <div style={card}>
        <div style={sectionTitle}>CAMPAIGN FUNNEL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 480 }}>
          {FUNNEL_STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: `${step.width}%`,
                height: 36,
                background: `linear-gradient(90deg, rgba(212,168,67,${0.35 - i * 0.06}) 0%, rgba(212,168,67,${0.15 - i * 0.02}) 100%)`,
                borderRadius: 'var(--radius-sm, 8px)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 12,
                transition: 'width 0.6s ease',
              }}>
                <span style={{ ...dm(14), fontWeight: 700, color: 'var(--gold-light, #F5D485)' }}>
                  {step.value.toLocaleString()}
                </span>
              </div>
              <span style={{ ...dm(12), color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{step.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...serif(22), color: 'var(--gold-light, #F5D485)' }}>5.1%</span>
          <span style={{ ...dm(12), color: 'var(--text-secondary)' }}>conversion rate</span>
          <span style={{
            ...dm(11),
            fontWeight: 600,
            color: 'var(--status-green, #4ade80)',
            background: 'rgba(74,222,128,0.10)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill, 100px)',
          }}>
            Above average &#10003;
          </span>
        </div>
      </div>

      {/* ── Compound vs Direct Line Chart ── */}
      <div style={card}>
        <div style={sectionTitle}>COMPOUND VS DIRECT GIVING (7 MONTHS)</div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 12, ...dm(11) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 3, background: 'var(--gold-light, #F5D485)', borderRadius: 2, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Compound</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 3, background: 'var(--teal-light, #7ECDC4)', borderRadius: 2, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Direct</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} style={{ width: '100%', maxWidth: chartW }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={40} y1={chartH * (1 - f) + 10} x2={chartW - 10} y2={chartH * (1 - f) + 10}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          ))}
          {/* Y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <text key={f} x={36} y={chartH * (1 - f) + 14} fill="var(--text-tertiary, #666)" fontSize={9} textAnchor="end" fontFamily="DM Sans, sans-serif">
              ${Math.round(maxVal * f / 1000)}k
            </text>
          ))}
          {/* Compound line */}
          <polyline
            fill="none"
            stroke="var(--gold-light, #F5D485)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={COMPOUND_VS_DIRECT.map((d, i) => {
              const x = 50 + i * ((chartW - 70) / (COMPOUND_VS_DIRECT.length - 1))
              const y = chartH - (d.compound / maxVal) * (chartH - 20) + 10
              return `${x},${y}`
            }).join(' ')}
          />
          {/* Direct line */}
          <polyline
            fill="none"
            stroke="var(--teal-light, #7ECDC4)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={COMPOUND_VS_DIRECT.map((d, i) => {
              const x = 50 + i * ((chartW - 70) / (COMPOUND_VS_DIRECT.length - 1))
              const y = chartH - (d.direct / maxVal) * (chartH - 20) + 10
              return `${x},${y}`
            }).join(' ')}
          />
          {/* Data points + month labels */}
          {COMPOUND_VS_DIRECT.map((d, i) => {
            const x = 50 + i * ((chartW - 70) / (COMPOUND_VS_DIRECT.length - 1))
            const yC = chartH - (d.compound / maxVal) * (chartH - 20) + 10
            const yD = chartH - (d.direct / maxVal) * (chartH - 20) + 10
            return (
              <g key={i}>
                <circle cx={x} cy={yC} r={3.5} fill="var(--gold-light, #F5D485)" />
                <circle cx={x} cy={yD} r={3.5} fill="var(--teal-light, #7ECDC4)" />
                <text x={x} y={chartH + 26} fill="var(--text-tertiary, #666)" fontSize={10} textAnchor="middle" fontFamily="DM Sans, sans-serif">
                  {d.month}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Retention Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <div style={card}>
          <div style={sectionTitle}>DONOR RETENTION</div>
          <div style={{ ...serif(36), color: 'var(--gold-light, #F5D485)' }}>41%</div>
          <div style={{ ...dm(12), color: 'var(--text-secondary)', marginTop: 4 }}>your retention rate</div>
        </div>
        <div style={card}>
          <div style={sectionTitle}>INDUSTRY AVG</div>
          <div style={{ ...serif(36), color: 'var(--text-tertiary, #888)' }}>23%</div>
          <div style={{ ...dm(12), color: 'var(--text-secondary)', marginTop: 4 }}>
            <span style={{ color: 'var(--status-green, #4ade80)', fontWeight: 600 }}>+18pp</span> above average
          </div>
        </div>
        <div style={card}>
          <div style={sectionTitle}>JARIYAH RETENTION</div>
          <div style={{ ...serif(36), color: 'var(--status-green, #4ade80)' }}>100%</div>
          <div style={{ ...dm(12), color: 'var(--text-secondary)', marginTop: 4 }}>18 Jariyah donors &mdash; zero lapsed</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   A/B TESTS TAB
   ═══════════════════════════════════════════════════════════════ */

function ABTestsTab() {
  const [showNewModal, setShowNewModal] = useState(false)
  const [appliedGaza, setAppliedGaza] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Completed test */}
      <div style={{ ...card, borderLeft: '4px solid var(--status-green, #4ade80)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{
              ...dm(10),
              fontWeight: 600,
              color: 'var(--status-green, #4ade80)',
              background: 'rgba(74,222,128,0.10)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill, 100px)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Completed
            </span>
            <div style={{ ...serif(18), color: 'var(--text-primary)', marginTop: 8 }}>
              Yemen Emergency Relief &mdash; Title Test
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>Winner</div>
            <div style={{ ...dm(14), fontWeight: 600, color: 'var(--status-green, #4ade80)' }}>Variant B</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm, 8px)', padding: 14 }}>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Variant A (Original)</div>
            <div style={{ ...dm(13), color: 'var(--text-secondary)' }}>&ldquo;Help Yemen Families Today&rdquo;</div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 6 }}>3.2% conversion</div>
          </div>
          <div style={{ background: 'rgba(74,222,128,0.06)', borderRadius: 'var(--radius-sm, 8px)', padding: 14, border: '1px solid rgba(74,222,128,0.2)' }}>
            <div style={{ ...dm(11), color: 'var(--status-green)', marginBottom: 4 }}>Variant B (Winner)</div>
            <div style={{ ...dm(13), color: 'var(--text-primary)' }}>&ldquo;Your $50 Feeds a Family in Yemen for a Month&rdquo;</div>
            <div style={{ ...dm(12), color: 'var(--status-green)', marginTop: 6 }}>5.0% conversion &mdash; <strong>+56%</strong></div>
          </div>
        </div>
      </div>

      {/* Active test */}
      <div style={{ ...card, borderLeft: '4px solid var(--status-blue, #60a5fa)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{
              ...dm(10),
              fontWeight: 600,
              color: 'var(--status-blue, #60a5fa)',
              background: 'rgba(96,165,250,0.10)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill, 100px)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Active &bull; 5 days remaining
            </span>
            <div style={{ ...serif(18), color: 'var(--text-primary)', marginTop: 8 }}>
              Gaza Reconstruction &mdash; Hero Photo Test
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)' }}>Leading</div>
            <div style={{ ...dm(14), fontWeight: 600, color: 'var(--status-blue, #60a5fa)' }}>Variant B</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm, 8px)', padding: 14 }}>
            <div style={{ ...dm(11), color: 'var(--text-tertiary)', marginBottom: 4 }}>Variant A</div>
            <div style={{ ...dm(13), color: 'var(--text-secondary)' }}>Aerial damage photo</div>
            <div style={{ ...dm(12), color: 'var(--text-tertiary)', marginTop: 6 }}>4.1% conversion &mdash; 312 views</div>
          </div>
          <div style={{ background: 'rgba(96,165,250,0.06)', borderRadius: 'var(--radius-sm, 8px)', padding: 14, border: '1px solid rgba(96,165,250,0.2)' }}>
            <div style={{ ...dm(11), color: 'var(--status-blue)', marginBottom: 4 }}>Variant B (Leading)</div>
            <div style={{ ...dm(13), color: 'var(--text-primary)' }}>Family receiving aid photo</div>
            <div style={{ ...dm(12), color: 'var(--status-blue)', marginTop: 6 }}>5.2% conversion &mdash; 308 views &mdash; <strong>+27%</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={() => setAppliedGaza(true)}
            style={{
              ...goldBtn,
              opacity: appliedGaza ? 0.5 : 1,
            }}
          >
            {appliedGaza ? 'Applied \u2713' : 'Apply now'}
          </button>
          <button style={outlineBtn}>Wait</button>
        </div>
      </div>

      {/* Create new */}
      <button onClick={() => setShowNewModal(true)} style={{ ...outlineBtn, alignSelf: 'flex-start', padding: '10px 20px' }}>
        + Create new A/B test
      </button>

      {/* New test modal */}
      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 'var(--z-overlay, 100)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 460,
                maxWidth: '90vw',
                background: 'var(--bg-surface, #111)',
                border: '1px solid var(--border-subtle, #222)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: 28,
                zIndex: 'var(--z-modal, 200)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ ...serif(22), color: 'var(--text-primary)' }}>New A/B Test</span>
                <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={sectionTitle}>CAMPAIGN</div>
                  <select style={{
                    ...dm(13),
                    width: '100%',
                    background: 'var(--bg-elevated, #1a1a2e)',
                    border: '1px solid var(--border-subtle, #222)',
                    borderRadius: 'var(--radius-md, 10px)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    outline: 'none',
                  }}>
                    <option>Yemen Emergency Relief</option>
                    <option>Gaza Reconstruction Fund</option>
                    <option>Somalia Drought Response</option>
                    <option>Rohingya Refugee Aid</option>
                  </select>
                </div>

                <div>
                  <div style={sectionTitle}>ELEMENT TO TEST</div>
                  <select style={{
                    ...dm(13),
                    width: '100%',
                    background: 'var(--bg-elevated, #1a1a2e)',
                    border: '1px solid var(--border-subtle, #222)',
                    borderRadius: 'var(--radius-md, 10px)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    outline: 'none',
                  }}>
                    <option>Campaign Title</option>
                    <option>Hero Image</option>
                    <option>Call to Action</option>
                    <option>Donation Amounts</option>
                    <option>Impact Statement</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={sectionTitle}>VARIANT A</div>
                    <input placeholder="Control text..." style={{
                      ...dm(13),
                      width: '100%',
                      background: 'var(--bg-elevated, #1a1a2e)',
                      border: '1px solid var(--border-subtle, #222)',
                      borderRadius: 'var(--radius-md, 10px)',
                      color: 'var(--text-primary)',
                      padding: '10px 12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }} />
                  </div>
                  <div>
                    <div style={sectionTitle}>VARIANT B</div>
                    <input placeholder="Test text..." style={{
                      ...dm(13),
                      width: '100%',
                      background: 'var(--bg-elevated, #1a1a2e)',
                      border: '1px solid var(--border-subtle, #222)',
                      borderRadius: 'var(--radius-md, 10px)',
                      color: 'var(--text-primary)',
                      padding: '10px 12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }} />
                  </div>
                </div>

                <div>
                  <div style={sectionTitle}>DURATION</div>
                  <select style={{
                    ...dm(13),
                    width: '100%',
                    background: 'var(--bg-elevated, #1a1a2e)',
                    border: '1px solid var(--border-subtle, #222)',
                    borderRadius: 'var(--radius-md, 10px)',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    outline: 'none',
                  }}>
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </div>

                <button onClick={() => setShowNewModal(false)} style={{ ...goldBtn, width: '100%', marginTop: 6, padding: '12px 22px' }}>
                  Launch Test
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SETTLEMENTS TAB
   ═══════════════════════════════════════════════════════════════ */

const YEMEN_POSITIONS = [
  { donor: 'Ahmad K.', amount: 1200, mode: 'Compound', cycles: 8, estSettlement: 'Jul 2026', status: 'On track' },
  { donor: 'Omar J.', amount: 900, mode: 'Compound', cycles: 6, estSettlement: 'Aug 2026', status: 'On track' },
  { donor: 'Fatima S.', amount: 800, mode: 'Compound', cycles: 5, estSettlement: 'Sep 2026', status: 'On track' },
  { donor: 'Yusuf A.', amount: 750, mode: 'Compound', cycles: 7, estSettlement: 'Jul 2026', status: 'On track' },
  { donor: 'Khadija B.', amount: 600, mode: 'Compound', cycles: 4, estSettlement: 'Oct 2026', status: 'On track' },
  { donor: 'Hassan M.', amount: 550, mode: 'Compound', cycles: 3, estSettlement: 'Nov 2026', status: 'Pending' },
  { donor: 'Zainab T.', amount: 500, mode: 'Compound', cycles: 6, estSettlement: 'Aug 2026', status: 'On track' },
  { donor: 'Ibrahim N.', amount: 450, mode: 'Compound', cycles: 4, estSettlement: 'Oct 2026', status: 'On track' },
  { donor: 'Aisha L.', amount: 400, mode: 'Compound', cycles: 3, estSettlement: 'Nov 2026', status: 'Pending' },
  { donor: 'Noor R.', amount: 350, mode: 'Compound', cycles: 5, estSettlement: 'Sep 2026', status: 'On track' },
  { donor: 'Tariq H.', amount: 300, mode: 'Compound', cycles: 2, estSettlement: 'Dec 2026', status: 'Pending' },
  { donor: 'Layla D.', amount: 280, mode: 'Compound', cycles: 4, estSettlement: 'Oct 2026', status: 'On track' },
  { donor: 'Bilal W.', amount: 250, mode: 'Compound', cycles: 3, estSettlement: 'Nov 2026', status: 'On track' },
  { donor: 'Sumaya F.', amount: 200, mode: 'Compound', cycles: 2, estSettlement: 'Jan 2027', status: 'Pending' },
]

const GAZA_POSITIONS = [
  { donor: 'Fatima S.', amount: 2100, mode: 'Compound', cycles: 10, estSettlement: 'Jun 2026', status: 'On track' },
  { donor: 'Ahmad K.', amount: 1800, mode: 'Compound', cycles: 8, estSettlement: 'Jul 2026', status: 'On track' },
  { donor: 'Mariam R.', amount: 1400, mode: 'Compound', cycles: 6, estSettlement: 'Aug 2026', status: 'On track' },
  { donor: 'Dawud G.', amount: 900, mode: 'Compound', cycles: 4, estSettlement: 'Oct 2026', status: 'Pending' },
  { donor: 'Sara Q.', amount: 600, mode: 'Compound', cycles: 3, estSettlement: 'Nov 2026', status: 'On track' },
  { donor: 'Idris P.', amount: 400, mode: 'Compound', cycles: 2, estSettlement: 'Jan 2027', status: 'Pending' },
]

const SOMALIA_POSITIONS = [
  { donor: 'Omar J.', amount: 1100, mode: 'Compound', cycles: 7, estSettlement: 'Jul 2026', status: 'On track' },
  { donor: 'Hana V.', amount: 700, mode: 'Compound', cycles: 4, estSettlement: 'Oct 2026', status: 'On track' },
  { donor: 'Rami C.', amount: 350, mode: 'Compound', cycles: 2, estSettlement: 'Dec 2026', status: 'Pending' },
]

const ROHINGYA_POSITIONS = [
  { donor: 'Omar J.', amount: 800, mode: 'Compound', cycles: 5, estSettlement: 'Sep 2026', status: 'On track' },
  { donor: 'Salman E.', amount: 400, mode: 'Compound', cycles: 3, estSettlement: 'Nov 2026', status: 'Pending' },
]

const SADAQAH_CONVERSIONS = [
  { donor: 'Bilal W.', converted: 350, from: 'Sadaqah', to: 'Compound', campaign: 'Yemen Emergency Relief', date: 'Apr 10' },
  { donor: 'Khalid Z.', converted: 180, from: 'Sadaqah', to: 'Compound', campaign: 'Gaza Reconstruction Fund', date: 'Apr 3' },
]

function PositionTable({ title, positions }) {
  return (
    <div style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ ...serif(18), color: 'var(--text-primary)' }}>{title}</span>
        <span style={{ ...dm(12), color: 'var(--text-tertiary)' }}>{positions.length} positions</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...dm(12) }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default, #333)' }}>
              {['Donor', 'Amount', 'Mode', 'Cycles', 'Est. Settlement', 'Status'].map(h => (
                <th key={h} style={{
                  textAlign: h === 'Amount' || h === 'Cycles' ? 'right' : 'left',
                  padding: '8px 6px',
                  color: 'var(--text-tertiary, #888)',
                  fontWeight: 500,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle, #1a1a2e)' }}>
                <td style={{ padding: '8px 6px', color: 'var(--text-primary)' }}>{p.donor}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: 'var(--gold-light, #F5D485)' }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '8px 6px', color: 'var(--gold-light, #F5D485)', fontSize: 11 }}>{p.mode}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.cycles}</td>
                <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{p.estSettlement}</td>
                <td style={{ padding: '8px 6px' }}>
                  <span style={{
                    ...dm(10),
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill, 100px)',
                    background: p.status === 'On track' ? 'rgba(74,222,128,0.10)' : 'rgba(251,191,36,0.10)',
                    color: p.status === 'On track' ? 'var(--status-green, #4ade80)' : 'var(--status-yellow, #fbbf24)',
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SettlementsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Total */}
      <div style={{ ...card, textAlign: 'center', marginBottom: 8 }}>
        <div style={sectionTitle}>TOTAL SCHEDULED SETTLEMENTS</div>
        <div style={{
          ...serif(48),
          background: 'linear-gradient(135deg, #F5D485 0%, #D4A843 50%, #A07830 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          $16,500
        </div>
        <div style={{ ...dm(12), color: 'var(--text-secondary)', marginTop: 4 }}>
          across 25 compound positions in 4 campaigns
        </div>
      </div>

      {/* Per-campaign tables */}
      <PositionTable title="Yemen Emergency Relief" positions={YEMEN_POSITIONS} />
      <PositionTable title="Gaza Reconstruction Fund" positions={GAZA_POSITIONS} />
      <PositionTable title="Somalia Drought Response" positions={SOMALIA_POSITIONS} />
      <PositionTable title="Rohingya Refugee Aid" positions={ROHINGYA_POSITIONS} />

      {/* Sadaqah conversions */}
      <div style={{ ...card, borderLeft: '4px solid var(--gold-mid, #D4A843)' }}>
        <div style={sectionTitle}>SADAQAH TO COMPOUND CONVERSIONS</div>
        <div style={{ ...dm(12), color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
          Donors who converted their one-time Sadaqah gifts into recurring compound positions.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SADAQAH_CONVERSIONS.map((c, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(212,168,67,0.06)',
              borderRadius: 'var(--radius-sm, 8px)',
              padding: '10px 14px',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <div>
                <span style={{ ...dm(13), fontWeight: 600, color: 'var(--text-primary)' }}>{c.donor}</span>
                <span style={{ ...dm(12), color: 'var(--text-tertiary)', marginLeft: 10 }}>{c.campaign}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...dm(12), color: 'var(--text-tertiary)' }}>{c.from}</span>
                <span style={{ color: 'var(--gold-light)' }}>&rarr;</span>
                <span style={{ ...dm(12), color: 'var(--gold-light)', fontWeight: 600 }}>{c.to}</span>
                <span style={{ ...dm(13), fontWeight: 700, color: 'var(--gold-light)', marginLeft: 6 }}>${c.converted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message compound donors */}
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ ...serif(16), color: 'var(--text-primary)' }}>Message Compound Donors</div>
          <div style={{ ...dm(12), color: 'var(--text-secondary)', marginTop: 4 }}>
            Send a settlement timeline update to all 25 compound donors across campaigns.
          </div>
        </div>
        <button style={goldBtn}>
          Message Compound donors
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NGOInsights() {
  const ngo = useNGOPartner()
  const [activeTab, setActiveTab] = useState('Analytics')

  return (
    <div style={{ padding: '24px 28px 40px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ ...serif(28), color: 'var(--text-primary)', marginBottom: 8 }}>Insights</h1>

      <PillTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Analytics' && <AnalyticsTab />}
      {activeTab === 'A/B Tests' && <ABTestsTab />}
      {activeTab === 'Settlements' && <SettlementsTab />}
    </div>
  )
}
