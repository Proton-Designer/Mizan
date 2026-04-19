import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useContext } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import InvestModal from '../portfolio/InvestModal'
import SpiritualReflection from '../portfolio/SpiritualReflection'
import PortfolioContext from '../../context/PortfolioContext'

export default function AppShell({ accountType }) {
  const portfolio = useContext(PortfolioContext)
  const isPortfolio = accountType === 'portfolio'

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-deep)',
    }}>
      <Sidebar accountType={accountType} />

      <div style={{
        flex: 1,
        marginLeft: '240px',
        position: 'relative',
        minHeight: '100vh',
      }}>
        {/* Ambient gold glow */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: '240px',
          right: 0,
          height: '300px',
          background: 'var(--gradient-glow-top)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <TopBar accountType={accountType} />

        <main style={{
          paddingTop: '80px',
          paddingBottom: '40px',
          paddingLeft: '32px',
          paddingRight: '32px',
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Portfolio-specific overlays */}
      {isPortfolio && portfolio && (
        <>
          <AnimatePresence>
            {portfolio.investModalOpen && <InvestModal />}
          </AnimatePresence>
          <AnimatePresence>
            {portfolio.reflectionData && (
              <SpiritualReflection
                type="post_commit"
                onClose={() => portfolio.setReflectionData(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
