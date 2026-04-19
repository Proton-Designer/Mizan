import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart3, BookOpen, Check } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Report Card                                                        */
/* ------------------------------------------------------------------ */
function ReportCard({ title, description, extra, buttonLabel, icon: Icon }) {
  const [status, setStatus] = useState('idle') // idle | generating | done

  const handleGenerate = () => {
    setStatus('generating')
    setTimeout(() => setStatus('done'), 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.card}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Teal left accent bar */}
        <div style={styles.accentBar} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Icon size={20} style={{ color: 'var(--teal-light)' }} />
            <h3 style={styles.cardTitle}>{title}</h3>
          </div>

          <p style={styles.cardDesc}>{description}</p>

          {extra && (
            <p style={{ ...styles.cardDesc, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 6 }}>
              {extra}
            </p>
          )}

          <div style={{ marginTop: 16 }}>
            {status === 'idle' && (
              <button style={styles.tealBtn} onClick={handleGenerate}>
                {buttonLabel}
              </button>
            )}

            {status === 'generating' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid var(--teal-mid)',
                    borderTopColor: 'transparent',
                  }}
                />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
                  Generating...
                </span>
              </div>
            )}

            <AnimatePresence>
              {status === 'done' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={16} style={{ color: 'var(--status-green)' }} />
                  <span style={{ fontSize: 14, color: 'var(--status-green)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                    Report downloaded
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Reports Page                                                  */
/* ------------------------------------------------------------------ */
export default function CommunityReports() {
  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Reports & Documentation</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        <ReportCard
          title="Monthly Board Report"
          description="Auto-generated summary for your mosque board."
          icon={FileText}
          buttonLabel="Generate for April 2026 &rarr;"
        />

        <ReportCard
          title="Annual Zakat Report"
          description="Complete documentation of all zakat received and distributed this lunar year."
          extra="Required by Islamic law."
          icon={BookOpen}
          buttonLabel="Generate Zakat Report &rarr;"
        />

        <ReportCard
          title="Event Impact Summary"
          description="ROI analysis of every event this year."
          extra="Based on this year's data, your highest-ROI events are Ramadan Night iftars (7.6x) and Eid celebrations (12.4x)."
          icon={BarChart3}
          buttonLabel="Generate Event Report &rarr;"
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
const styles = {
  page: {
    padding: '24px 16px',
    maxWidth: 720,
    margin: '0 auto',
  },

  pageTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 36,
    color: 'var(--text-primary)',
    margin: 0,
  },

  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 14,
    padding: 24,
    boxShadow: 'var(--shadow-card)',
  },

  accentBar: {
    width: 4,
    borderRadius: 4,
    background: 'var(--teal-mid)',
    flexShrink: 0,
    alignSelf: 'stretch',
  },

  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: 20,
    color: 'var(--text-primary)',
    margin: 0,
  },

  cardDesc: {
    fontSize: 14,
    color: 'var(--text-tertiary)',
    fontFamily: "'DM Sans', sans-serif",
    margin: 0,
    lineHeight: 1.5,
  },

  tealBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--teal-mid)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
}
