import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ACCOUNT_CONFIG } from '../utils/constants'
import AccountTypeCard from '../components/shared/AccountTypeCard'

/* ── Flowing Water Effect ── */
function FlowingWater() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const timeRef = useRef(0)

  const initParticles = useCallback((width, height) => {
    const particles = []
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.5,
        speedX: 0.3 + Math.random() * 1.2,
        speedY: -0.1 + Math.random() * 0.2,
        opacity: 0.15 + Math.random() * 0.4,
        shimmer: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.02 + Math.random() * 0.03,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.scale(dpr, dpr)
      initParticles(rect.width, rect.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      timeRef.current += 0.008

      ctx.clearRect(0, 0, w, h)

      // Draw layered wave curves
      for (let layer = 0; layer < 5; layer++) {
        const layerOffset = layer * 0.6
        const amplitude = 6 + layer * 3
        const frequency = 0.008 - layer * 0.001
        const speed = timeRef.current * (1.2 + layer * 0.3)
        const yBase = 10 + layer * (h / 5.5)
        const alpha = 0.04 + layer * 0.025

        ctx.beginPath()
        ctx.moveTo(0, h)

        for (let x = 0; x <= w; x += 2) {
          const y = yBase +
            Math.sin(x * frequency + speed + layerOffset) * amplitude +
            Math.sin(x * frequency * 2.3 + speed * 0.7 + layerOffset * 2) * (amplitude * 0.4) +
            Math.cos(x * frequency * 0.5 + speed * 1.3) * (amplitude * 0.3)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(w, h)
        ctx.closePath()

        // Gradient fill per layer
        const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, h)
        const tealR = 74, tealG = 173, tealB = 164
        const goldR = 212, goldG = 168, goldB = 67
        const r = Math.round(tealR + (goldR - tealR) * (layer / 5))
        const g = Math.round(tealG + (goldG - tealG) * (layer / 5))
        const b = Math.round(tealB + (goldB - tealB) * (layer / 5))
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Draw flowing particles (light catching on water surface)
      particlesRef.current.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY + Math.sin(timeRef.current * 2 + p.shimmer) * 0.15
        p.shimmer += p.shimmerSpeed

        if (p.x > w + 10) {
          p.x = -5
          p.y = Math.random() * h
        }
        if (p.y < -5 || p.y > h + 5) {
          p.y = Math.random() * h
        }

        const shimmerOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.shimmer))

        // Light particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 200, 160, ${shimmerOpacity})`
        ctx.fill()

        // Glow around particle
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glowGrad.addColorStop(0, `rgba(212, 200, 160, ${shimmerOpacity * 0.3})`)
        glowGrad.addColorStop(1, 'rgba(212, 200, 160, 0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()
      })

      // Horizontal shimmer line (light reflection on water surface)
      for (let i = 0; i < 3; i++) {
        const lineY = 8 + i * (h / 3.5)
        const lineAlpha = 0.06 + Math.sin(timeRef.current * 1.5 + i) * 0.03
        ctx.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const y = lineY + Math.sin(x * 0.015 + timeRef.current * 2 + i * 2) * 3
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [initParticles])

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 160,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {/* Top fade — blends water into the dark background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'linear-gradient(to bottom, var(--bg-void, #0A0A0F) 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

function IslamicPattern() {
  const size = 60
  const half = size / 2
  const quarter = size / 4

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.04,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id="khatam" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="var(--gold-mid)" strokeWidth="0.5">
            <polygon points={`${half},0 ${half+quarter},${quarter} ${size},${half} ${half+quarter},${half+quarter} ${half},${size} ${quarter},${half+quarter} 0,${half} ${quarter},${quarter}`} />
            <rect x={quarter} y={quarter} width={half} height={half} transform={`rotate(45, ${half}, ${half})`} />
            <line x1={half} y1="0" x2={half} y2={size} />
            <line x1="0" y1={half} x2={size} y2={half} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam)" />
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { setCurrentAccount } = useApp()

  const handleAccountSelect = (accountType) => {
    setCurrentAccount(accountType)
    navigate(ACCOUNT_CONFIG[accountType].route)
  }

  const accountOrder = ['portfolio', 'borrower', 'community', 'ngo']

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Radial gold glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '60%',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212, 168, 67, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Islamic geometric pattern */}
      <IslamicPattern />

      {/* Grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1100px',
        padding: '0 40px',
      }}>
        {/* Brand section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <div style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <p style={{
            fontFamily: "'Amiri', serif",
            fontSize: '16px',
            color: 'var(--text-tertiary)',
            direction: 'rtl',
          }}>
            ميزان
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '56px',
            fontWeight: 600,
            color: 'var(--gold-light)',
            marginTop: '4px',
          }}>
            Mizan
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '10px',
            }}
          >
            The Akhirah Portfolio
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              width: '48px',
              height: '1px',
              background: 'var(--border-gold)',
              marginTop: '20px',
              boxShadow: '0 0 8px rgba(212, 168, 67, 0.3)',
            }}
          />
          </div>
        </motion.div>

        {/* Context copy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Choose your account to begin
        </motion.p>

        {/* Card grid — 4 columns on wide, 2 columns on narrower */}
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
            maxWidth: '1060px',
          }}
        >
          {accountOrder.map((type, index) => (
            <AccountTypeCard
              key={type}
              config={ACCOUNT_CONFIG[type]}
              onClick={() => handleAccountSelect(type)}
              index={index}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginTop: '48px',
            marginBottom: '80px',
          }}
        >
          © 2026 Mizan · Built at hack.msa
        </motion.p>
      </div>

      {/* Flowing water effect at the bottom */}
      <FlowingWater />
    </div>
  )
}
