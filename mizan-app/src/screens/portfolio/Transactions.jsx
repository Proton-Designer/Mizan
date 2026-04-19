import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePortfolio } from '../../context/PortfolioContext'

/* ── Badge config per transaction type ── */
const BADGE_CONFIG = {
  invest_direct:    { label: 'Direct',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  invest_compound:  { label: 'Compound', color: '#D4A017', bg: 'rgba(212,160,23,0.12)' },
  cycle_return:     { label: 'Return',   color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' },
  deposit:          { label: 'Deposit',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  sadaqah_settled:  { label: 'Settled',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
}

const FILTER_OPTIONS = [
  { value: 'all',         label: 'All' },
  { value: 'investments', label: 'Investments' },
  { value: 'returns',     label: 'Returns' },
  { value: 'deposits',    label: 'Deposits' },
]

const PAGE_SIZE = 20

/* ── Date formatter ── */
function formatDate(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Amount formatter ── */
function formatAmount(amount) {
  const abs = Math.abs(amount)
  const formatted = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
  return amount >= 0 ? `+${formatted}` : `-${formatted}`
}

export default function Transactions() {
  const { transactions } = usePortfolio()
  const [filter, setFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    if (filter === 'investments')
      return transactions.filter((t) => t.type === 'invest_direct' || t.type === 'invest_compound')
    if (filter === 'returns')
      return transactions.filter((t) => t.type === 'cycle_return')
    if (filter === 'deposits')
      return transactions.filter((t) => t.type === 'deposit')
    return transactions
  }, [transactions, filter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Title */}
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Transaction History
      </h1>

      {/* Filter */}
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            padding: '8px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          No transactions yet. Connect your bank and start investing to see activity here.
        </div>
      ) : (
        <>
          {/* Table container */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg, 12px)',
              overflow: 'hidden',
              background: 'var(--bg-surface)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['Date', 'Type', 'Description', 'Amount', 'Balance After'].map((col) => (
                    <th
                      key={col}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-tertiary)',
                        padding: '14px 16px',
                        textAlign: col === 'Amount' || col === 'Balance After' ? 'right' : 'left',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((txn, i) => {
                  const badge = BADGE_CONFIG[txn.type] || {
                    label: txn.type,
                    color: '#888',
                    bg: 'rgba(136,136,136,0.12)',
                  }
                  const isPositive = txn.amount >= 0
                  const rowBg = i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-deep)'

                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      style={{ background: rowBg, cursor: 'default' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-overlay)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg
                      }}
                    >
                      {/* Date */}
                      <td
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          padding: '14px 16px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(txn.timestamp)}
                      </td>

                      {/* Type badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            color: badge.color,
                            background: badge.bg,
                            padding: '3px 10px',
                            borderRadius: 999,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          padding: '14px 16px',
                        }}
                      >
                        {txn.description}
                      </td>

                      {/* Amount */}
                      <td
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: isPositive ? '#10B981' : '#EF4444',
                          padding: '14px 16px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatAmount(txn.amount)}
                      </td>

                      {/* Balance After */}
                      <td
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          padding: '14px 16px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ${txn.balanceAfter.toLocaleString('en-US')}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '10px 28px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-overlay)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
