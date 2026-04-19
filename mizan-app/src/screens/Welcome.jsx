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
        height: 80,
        background: 'linear-gradient(to bottom, var(--bg-void, #0A0A0F) 0%, rgba(10, 10, 15, 0.4) 60%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Left edge fade — extra strong where waterfall meets river */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 120,
        background: 'linear-gradient(to right, var(--bg-void, #0A0A0F) 0%, rgba(10, 10, 15, 0.5) 50%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Left corner blend — radial fade where waterfall curves into river */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 200,
        height: '100%',
        background: 'radial-gradient(ellipse at 0% 0%, var(--bg-void, #0A0A0F) 0%, transparent 70%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Right edge fade */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 120,
        background: 'linear-gradient(to left, var(--bg-void, #0A0A0F) 0%, rgba(10, 10, 15, 0.5) 50%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Right corner blend — radial fade where waterfall curves into river */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        height: '100%',
        background: 'radial-gradient(ellipse at 100% 0%, var(--bg-void, #0A0A0F) 0%, transparent 70%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Bottom edge fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 20,
        background: 'linear-gradient(to top, var(--bg-void, #0A0A0F) 0%, transparent 100%)',
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

/* ── Edge Waterfall Effect ── */
function WaterfallEdge({ side = 'left' }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const dropletsRef = useRef([])
  const timeRef = useRef(Math.random() * 100)

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Initialize droplets
      const drops = []
      const w = rect.width
      const h = rect.height
      for (let i = 0; i < 80; i++) {
        drops.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: 1.5 + Math.random() * 3,
          size: 0.8 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.35,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.04,
          trail: 8 + Math.random() * 20,
        })
      }
      dropletsRef.current = drops
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      timeRef.current += 0.01

      ctx.clearRect(0, 0, w, h)

      // Vertical flowing streams that curve outward at the bottom
      const curveZone = h * 0.7 // streams start curving in the bottom 30%
      const isLeftSide = side === 'left'

      for (let stream = 0; stream < 6; stream++) {
        const baseX = (w / 7) * (stream + 0.5 + Math.sin(stream * 1.3) * 0.3)
        const streamAlpha = 0.025 + stream * 0.008
        const streamSpeed = timeRef.current * (0.8 + stream * 0.15)

        ctx.beginPath()
        for (let y = 0; y <= h; y += 2) {
          const wobble = Math.sin(y * 0.012 + streamSpeed + stream * 0.8) * (3 + stream * 1.5) +
            Math.sin(y * 0.025 + streamSpeed * 1.4) * 2
          // Curve outward (towards center of screen) as y approaches bottom
          let curvePush = 0
          if (y > curveZone) {
            const t = (y - curveZone) / (h - curveZone) // 0 to 1
            curvePush = t * t * w * 0.6 * (isLeftSide ? 1 : -1) // ease-in quadratic
          }
          const x = baseX + wobble + curvePush
          // Fade stream opacity as it curves
          const fadeAlpha = y > curveZone ? streamAlpha * (1 - ((y - curveZone) / (h - curveZone)) * 0.8) : streamAlpha
          if (y === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(74, 173, 164, ${streamAlpha})`
        ctx.lineWidth = 1.5 + stream * 0.5
        ctx.stroke()
      }

      // Flowing droplets — curve outward at the bottom
      dropletsRef.current.forEach(d => {
        d.y += d.speed
        d.wobble += d.wobbleSpeed
        let wx = Math.sin(d.wobble) * 2.5

        // Curve droplets outward as they approach the bottom
        if (d.y > curveZone) {
          const t = (d.y - curveZone) / (h - curveZone)
          wx += t * t * 4 * (isLeftSide ? 1 : -1) // push outward
          d.x += t * 0.5 * (isLeftSide ? 1 : -1) // drift horizontally
        }

        if (d.y > h + 20) {
          d.y = -d.trail - Math.random() * 40
          d.x = Math.random() * w
        }

        // Fade opacity in the curve zone so droplets dissolve into the river
        const bottomFade = d.y > curveZone ? 1 - ((d.y - curveZone) / (h - curveZone)) : 1
        const fadedOpacity = d.opacity * bottomFade

        // Droplet trail (vertical streak)
        const trailGrad = ctx.createLinearGradient(d.x + wx, d.y - d.trail, d.x + wx, d.y)
        trailGrad.addColorStop(0, 'rgba(74, 173, 164, 0)')
        trailGrad.addColorStop(0.7, `rgba(126, 205, 196, ${fadedOpacity * 0.4})`)
        trailGrad.addColorStop(1, `rgba(212, 200, 160, ${fadedOpacity})`)

        ctx.beginPath()
        ctx.moveTo(d.x + wx, d.y - d.trail)
        ctx.lineTo(d.x + wx, d.y)
        ctx.strokeStyle = trailGrad
        ctx.lineWidth = d.size
        ctx.lineCap = 'round'
        ctx.stroke()

        // Bright head of droplet (fades in curve zone)
        ctx.beginPath()
        ctx.arc(d.x + wx, d.y, d.size * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 210, 180, ${fadedOpacity * 0.8})`
        ctx.fill()

        // Glow (fades in curve zone)
        if (fadedOpacity > 0.05) {
          const glow = ctx.createRadialGradient(d.x + wx, d.y, 0, d.x + wx, d.y, d.size * 5)
          glow.addColorStop(0, `rgba(74, 173, 164, ${fadedOpacity * 0.2})`)
          glow.addColorStop(1, 'rgba(74, 173, 164, 0)')
          ctx.beginPath()
          ctx.arc(d.x + wx, d.y, d.size * 5, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }
      })

      // Mist/spray at the bottom where waterfall meets river
      const mistY = h - 30
      for (let i = 0; i < 15; i++) {
        const mx = Math.random() * w
        const my = mistY + Math.random() * 30
        const mr = 3 + Math.random() * 8
        const mistAlpha = (0.03 + Math.random() * 0.05) * (1 - (my - mistY) / 30)
        const mistGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mr)
        mistGrad.addColorStop(0, `rgba(126, 205, 196, ${mistAlpha})`)
        mistGrad.addColorStop(1, 'rgba(126, 205, 196, 0)')
        ctx.beginPath()
        ctx.arc(mx, my, mr, 0, Math.PI * 2)
        ctx.fillStyle = mistGrad
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const isLeft = side === 'left'

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      [side]: 0,
      width: 'clamp(40px, 6vw, 80px)',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {/* Inner fade — soft blend towards content */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'right' : 'left']: 0,
        width: '70%',
        background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, transparent 20%, var(--bg-void, #0A0A0F) 100%)`,
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Outer edge fade — soft blend towards screen border */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: '40%',
        background: `linear-gradient(to ${isLeft ? 'left' : 'right'}, transparent 0%, var(--bg-void, #0A0A0F) 100%)`,
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Top fade — soft emergence */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        background: 'linear-gradient(to bottom, var(--bg-void, #0A0A0F) 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      {/* Bottom fade — deep soft merge into river */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(to top, var(--bg-void, #0A0A0F) 0%, rgba(10, 10, 15, 0.7) 40%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
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

      {/* Edge waterfalls flowing down into the river */}
      <WaterfallEdge side="left" />
      <WaterfallEdge side="right" />

      {/* Flowing water/river effect at the bottom */}
      <FlowingWater />
    </div>
  )
}
