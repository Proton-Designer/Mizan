import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, AlertTriangle, Calendar, CreditCard, Clock, Check, RefreshCw,
  Zap, Play, Pause, ChevronRight, Users, DollarSign, TrendingUp,
  Heart, Star, Send, X, Loader2,
} from 'lucide-react'
import { useNGOPartner } from '../../context/NGOContext_Partner'

/* ═══════════════════════════════════════════════════════════════════════════
   PRE-WRITTEN FALLBACK MESSAGES
   ═══════════════════════════════════════════════════════════════════════════ */

const ACKNOWLEDGMENT_MESSAGES = [
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nJazakAllah Khair for your generous ${donor.type} contribution of $${donor.amount} toward our ${donor.campaign} initiative. Your sadaqah arrives at a critical moment — families in ${donor.region} are counting on supporters like you.\n\nWe will send you a detailed impact report within 30 days showing exactly how your gift was deployed. May Allah multiply your reward and grant you barakah in your wealth.\n\nWith gratitude,\nMizan Relief Team`,
  (donor) =>
    `Dear ${donor.name},\n\nAlhamdulillah — your $${donor.amount} donation to ${donor.campaign} has been received and is already being processed for deployment. As a ${donor.type} contribution, your gift carries compounding impact that extends far beyond the initial amount.\n\nYour consistent generosity to our ${donor.region} operations has made a measurable difference. We are deeply grateful.\n\nMay Allah accept your ibadah and reward you abundantly.\n\nWarm regards,\nMizan Relief`,
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nThank you for your heartfelt contribution of $${donor.amount}. Your ${donor.type} gift to ${donor.campaign} reflects the prophetic tradition of giving with ihsan — excellence and beauty.\n\nOur team in ${donor.region} has confirmed that your funds will be allocated within the next 72 hours. You are part of a community of 412 donors who have collectively transformed thousands of lives this quarter.\n\nFi Amanillah,\nMizan Relief Team`,
  (donor) =>
    `Dear ${donor.name},\n\nWe are humbled by your $${donor.amount} ${donor.type} donation to our ${donor.campaign} program. In a world where so many look away, you chose to look closer — and to act.\n\nYour gift will directly support families in ${donor.region} who are in urgent need. We take our trust responsibility seriously and will provide full transparency on how every dollar is used.\n\nMay Allah bless you and your family.\n\nWith deep appreciation,\nMizan Relief`,
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nSubhanAllah — your generosity continues to inspire our entire team. Your $${donor.amount} ${donor.type} contribution to ${donor.campaign} is a testament to your commitment to the ummah.\n\nWe want you to know: donors like you are the reason we can plan long-term, sustainable programs in ${donor.region}. Your consistency is as valuable as the amount itself.\n\nJazakAllah Khair, always.\nMizan Relief`,
]

const LAPSE_OUTREACH_MESSAGES = [
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nWe noticed it has been a while since your last contribution, and we wanted to reach out — not to ask, but to reconnect. Your past support for our ${donor.campaign} program made a real difference in ${donor.region}.\n\nWith Dhul Hijjah approaching, many donors find this a meaningful time to renew their giving. If your circumstances allow, even a small contribution keeps the momentum going.\n\nWe value you as part of our community, regardless.\n\nWith warmth,\nMizan Relief`,
  (donor) =>
    `Dear ${donor.name},\n\nWe hope this message finds you well. As one of our valued supporters, your previous gifts to ${donor.campaign} helped us serve over 200 families in ${donor.region}.\n\nWe understand that life circumstances change, and we respect that completely. We simply wanted to share that our work continues and your impact is still felt daily.\n\nIf you would like to learn about our current initiatives or update your giving preferences, we are here.\n\nFi Amanillah,\nMizan Relief`,
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nDuring this blessed season, we are reminded of the donors who have shaped our mission. You are one of them. Your contributions to ${donor.campaign} created ripples of impact that continue today in ${donor.region}.\n\nAs we prepare for Dhul Hijjah — historically our highest-impact giving period — we wanted to personally invite you to be part of this year's campaign.\n\nNo pressure, only gratitude.\n\nJazakAllah Khair,\nMizan Relief Team`,
]

const RECOVERY_MESSAGES = [
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nWe wanted to let you know that your recent monthly contribution of $${donor.amount} was unable to be processed. This sometimes happens due to card expirations or bank security holds.\n\nTo ensure your ongoing support for ${donor.campaign} continues without interruption, you can update your payment method through your donor portal. It only takes a moment.\n\nWe truly appreciate your sustained commitment.\n\nJazakAllah Khair,\nMizan Relief`,
  (donor) =>
    `Dear ${donor.name},\n\nYour monthly gift of $${donor.amount} to ${donor.campaign} could not be processed this cycle. We understand these things happen and want to make it as easy as possible to resolve.\n\nYou can update your payment details here, or simply reply to this email and our team will assist you personally.\n\nYour recurring generosity is the backbone of our sustained programs, and we are grateful for every month you choose to give.\n\nWith appreciation,\nMizan Relief`,
  (donor) =>
    `Assalamu Alaikum ${donor.name},\n\nJust a gentle follow-up regarding your $${donor.amount}/month contribution. We attempted to process your gift but encountered an issue with your payment method.\n\nWe have held your allocation spot in our ${donor.campaign} program — once your payment details are updated, your gift will be deployed immediately to families counting on this support.\n\nPlease reach out if you need any assistance.\n\nFi Amanillah,\nMizan Relief`,
]

/* ═══════════════════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const PIPELINE_NODES = [
  'Donation received',
  'Profile enriched',
  'Claude drafts',
  'Admin review',
  'Sent \u2713',
]

const QUEUED_DONORS = [
  { id: 1, name: 'Ahmad K.', city: 'Austin TX', amount: 300, type: 'Compound', campaign: 'Yemen Relief', region: 'Yemen', timeAgo: '2 hours ago' },
  { id: 2, name: '[Anonymous]', city: 'Houston TX', amount: 200, type: 'Direct', campaign: 'Gaza Emergency', region: 'Gaza', timeAgo: '6 hours ago' },
  { id: 3, name: 'Fatima M.', city: 'Dallas TX', amount: 500, type: 'Jariyah', campaign: 'Orphan Care', region: 'Orphan Care', timeAgo: '1 day ago' },
]

const LAPSE_DONORS_DATA = Array.from({ length: 47 }, (_, i) => ({
  id: i,
  daysSinceLast: Math.floor(Math.random() * 180) + 20,
  lifetimeValue: Math.floor(Math.random() * 5000) + 200,
  critical: i < 8,
  name: ['Ahmad K.', 'Fatima M.', 'Omar S.', 'Khadijah R.', 'Yusuf A.', 'Maryam H.', 'Ibrahim T.', 'Aisha N.', 'Hassan B.', 'Zahra L.', 'Ali W.', 'Nour D.'][i % 12],
  campaign: ['Yemen Relief', 'Gaza Emergency', 'Orphan Care', 'Winter Appeal'][i % 4],
  region: ['Yemen', 'Gaza', 'Syria', 'Somalia'][i % 4],
}))

const CALENDAR_CAMPAIGNS = [
  { name: 'Dhul Hijjah Campaign', launchDays: 23, target: 50000, emails: 8, segmentSize: 180, icon: Calendar },
  { name: 'Eid Al-Adha Relief', launchDays: 32, target: 75000, emails: 5, segmentSize: 240, icon: Heart },
  { name: 'Muharram Giving', launchDays: 65, target: 30000, emails: 4, segmentSize: 120, icon: Star },
  { name: 'Winter Emergency Appeal', launchDays: 120, target: 100000, emails: 10, segmentSize: 350, icon: Send },
]

const PAYMENT_CARDS = [
  { id: 1, name: 'Ahmad K.', amount: 60, issue: 'Card declined', daysAgo: 3, status: 'sent', campaign: 'Yemen Relief', region: 'Yemen' },
  { id: 2, name: 'Fatima M.', amount: 80, issue: 'Card expired', daysAgo: 5, status: 'generating', campaign: 'Orphan Care', region: 'Syria' },
  { id: 3, name: '[Anonymous]', amount: 40, issue: null, daysAgo: 0, status: 'recovered', campaign: 'Gaza Emergency', region: 'Gaza' },
]

const INITIAL_FEED_ENTRIES = [
  { type: 'ack', text: 'Acknowledgment sent to Ahmad K. for $300 Yemen Relief donation', time: 'just now' },
  { type: 'ack', text: 'Message generated for Fatima M. — Orphan Care $500 Jariyah', time: '1 min ago' },
  { type: 'lapse', text: 'Lapse alert: Omar S. approaching 90-day threshold ($2,100 lifetime)', time: '2 min ago' },
  { type: 'recovery', text: 'Payment recovery email sent to Ahmad K. — $60/mo card declined', time: '3 min ago' },
  { type: 'calendar', text: 'Dhul Hijjah campaign assets pre-generated for 180-donor segment', time: '5 min ago' },
  { type: 'ack', text: 'Bulk acknowledgment batch completed — 12 messages sent', time: '7 min ago' },
  { type: 'lapse', text: 'Critical: Khadijah R. entered red zone — 150 days since last gift', time: '8 min ago' },
  { type: 'recovery', text: 'Payment restored: [Anonymous] $40/mo — card updated successfully', time: '10 min ago' },
  { type: 'calendar', text: 'Eid Al-Adha Relief campaign emails queued for review', time: '12 min ago' },
  { type: 'ack', text: 'Acknowledgment personalized for Maryam H. — $150 Direct to Gaza', time: '14 min ago' },
  { type: 'lapse', text: 'Re-engagement sequence triggered for 5 donors in amber zone', time: '15 min ago' },
  { type: 'recovery', text: 'Follow-up scheduled for Fatima M. — $80/mo card expired', time: '18 min ago' },
  { type: 'calendar', text: 'Islamic calendar sync: 23 days to Dhul Hijjah confirmed', time: '20 min ago' },
  { type: 'ack', text: 'Claude drafted acknowledgment for Hassan B. — awaiting review', time: '22 min ago' },
  { type: 'lapse', text: 'Donor Yusuf A. re-engaged after outreach — $250 contribution received', time: '25 min ago' },
  { type: 'recovery', text: 'Payment retry #2 initiated for Ahmad K. — awaiting bank response', time: '28 min ago' },
  { type: 'calendar', text: 'Muharram Giving campaign draft completed — 4 email sequence', time: '30 min ago' },
  { type: 'ack', text: 'Thank-you message delivered to Ibrahim T. — $75 monthly', time: '32 min ago' },
  { type: 'lapse', text: 'Win-back: Ali W. returned after 120 days — $400 Compound donation', time: '35 min ago' },
  { type: 'recovery', text: 'All payment retries for March batch completed — 87% success rate', time: '38 min ago' },
  { type: 'calendar', text: 'Winter Emergency Appeal timeline finalized — launches in 120 days', time: '40 min ago' },
  { type: 'ack', text: 'Acknowledgment queue cleared — 0 pending', time: '42 min ago' },
  { type: 'lapse', text: 'Weekly lapse report generated — 47 donors monitored, 8 critical', time: '45 min ago' },
  { type: 'recovery', text: 'Dunning sequence paused for Ramadan period', time: '48 min ago' },
  { type: 'calendar', text: 'Historical giving data imported for Dhul Hijjah prediction model', time: '50 min ago' },
  { type: 'ack', text: 'New donor Zahra L. — first-time acknowledgment template selected', time: '52 min ago' },
  { type: 'lapse', text: 'Segment analysis: 23 donors in amber zone, avg lifetime value $365', time: '55 min ago' },
  { type: 'recovery', text: 'Payment method update reminder sent to 3 donors', time: '58 min ago' },
  { type: 'calendar', text: 'Ramadan wrap-up report: 2.8x giving multiplier confirmed', time: '1 hr ago' },
  { type: 'ack', text: 'System startup — Acknowledgment Engine initialized', time: '1 hr ago' },
]

const ROTATING_FEED = [
  { type: 'ack', text: 'New donation detected: Bilal A. — $125 Direct to Yemen Relief', time: 'just now' },
  { type: 'lapse', text: 'Donor Amina S. crossed 60-day threshold — outreach queued', time: 'just now' },
  { type: 'recovery', text: 'Card update confirmed for Tariq M. — $55/mo restored', time: 'just now' },
  { type: 'calendar', text: 'Dhul Hijjah countdown: 23 days — pre-campaign warmup initiated', time: 'just now' },
  { type: 'ack', text: 'Acknowledgment generated for Salma K. — $200 Jariyah to Orphan Care', time: 'just now' },
  { type: 'lapse', text: 'Win-back success: Hamza R. donated $175 after 90-day outreach', time: 'just now' },
  { type: 'recovery', text: 'Payment retry successful: Layla N. — $70/mo resumed', time: 'just now' },
  { type: 'calendar', text: 'Eid Al-Adha campaign segment expanded to 240 donors', time: 'just now' },
  { type: 'ack', text: 'Bulk generation: 5 acknowledgments drafted in 2.3s', time: 'just now' },
  { type: 'lapse', text: 'Predictive alert: 3 donors likely to lapse within 14 days', time: 'just now' },
  { type: 'recovery', text: 'Monthly recovery report: $1,200 recovered, 87% success rate', time: 'just now' },
  { type: 'calendar', text: 'Last 10 Nights micro-campaign template auto-generated', time: 'just now' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER HOOKS & COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function useAnimatedNumber(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = null
    let raf
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* skeleton loader */
function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
      {[100, 85, 60].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: 12,
            borderRadius: 6,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ))}
    </div>
  )
}

/* toast */
function Toast({ message, type, onDismiss }) {
  const colors = { success: '#4ade80', progress: '#f59e0b', alert: '#ef4444' }
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${colors[type] || colors.success}`,
        borderLeft: `4px solid ${colors[type] || colors.success}`,
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 8,
        fontSize: 13,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: `0 4px 20px ${colors[type]}33`,
        minWidth: 280,
      }}
    >
      {type === 'success' && <Check size={14} color={colors.success} />}
      {type === 'progress' && <Loader2 size={14} color={colors.progress} style={{ animation: 'spin 1s linear infinite' }} />}
      {type === 'alert' && <AlertTriangle size={14} color={colors.alert} />}
      <span style={{ flex: 1 }}>{message}</span>
      <X size={12} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={onDismiss} />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Automations() {
  const ngo = useNGOPartner()

  /* ── state ── */
  const [toasts, setToasts] = useState([])
  const [generatedMessages, setGeneratedMessages] = useState({})
  const [generatingIds, setGeneratingIds] = useState(new Set())
  const [simulatedDonors, setSimulatedDonors] = useState([])
  const [simulateMode, setSimulateMode] = useState(false)
  const [lapseOverlay, setLapseOverlay] = useState(false)
  const [lapseChecked, setLapseChecked] = useState([])
  const [feedEntries, setFeedEntries] = useState(INITIAL_FEED_ENTRIES)
  const [feedPaused, setFeedPaused] = useState(false)
  const [countdown, setCountdown] = useState({ days: 23, hours: 14, minutes: 32, seconds: 0 })
  const [recoveryMessages, setRecoveryMessages] = useState({})
  const [recoveryGenerating, setRecoveryGenerating] = useState(new Set())
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [activeNode, setActiveNode] = useState(2)
  const feedRef = useRef(null)
  const feedIndexRef = useRef(0)
  const toastIdRef = useRef(0)

  /* animated stats */
  const donorsProcessed = useAnimatedNumber(412)
  const messagesGenerated = useAnimatedNumber(23)
  const revenueRecovered = useAnimatedNumber(1200)

  /* ── toast helpers ── */
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current
    setToasts((prev) => [{ id, message, type }, ...prev])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  /* ── countdown timer ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds += 1
        if (seconds >= 60) { seconds = 0; minutes -= 1 }
        if (minutes < 0) { minutes = 59; hours -= 1 }
        if (hours < 0) { hours = 23; days -= 1 }
        if (days < 0) days = 0
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  /* ── feed auto-add ── */
  useEffect(() => {
    if (feedPaused) return
    const iv = setInterval(() => {
      const entry = ROTATING_FEED[feedIndexRef.current % ROTATING_FEED.length]
      feedIndexRef.current++
      setFeedEntries((prev) => [{ ...entry, id: Date.now() }, ...prev.slice(0, 49)])
    }, 12000)
    return () => clearInterval(iv)
  }, [feedPaused])

  /* ── payment progress (card 2 auto-fill) ── */
  useEffect(() => {
    let raf
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / 2000, 1)
      setPaymentProgress(progress)
      if (progress < 1) raf = requestAnimationFrame(step)
      else {
        const donor = PAYMENT_CARDS[1]
        setTimeout(() => {
          setRecoveryMessages((prev) => ({
            ...prev,
            [donor.id]: RECOVERY_MESSAGES[1](donor),
          }))
        }, 500)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ── pipeline node cycling ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setActiveNode((p) => (p + 1) % PIPELINE_NODES.length)
    }, 4000)
    return () => clearInterval(iv)
  }, [])

  /* ── generate message for a donor ── */
  const generateMessage = useCallback((donor, idx = 0) => {
    if (generatingIds.has(donor.id)) return
    setGeneratingIds((prev) => new Set(prev).add(donor.id))
    addToast(`Generating message for ${donor.name}...`, 'progress')
    setTimeout(() => {
      const msgFn = ACKNOWLEDGMENT_MESSAGES[idx % ACKNOWLEDGMENT_MESSAGES.length]
      setGeneratedMessages((prev) => ({ ...prev, [donor.id]: msgFn(donor) }))
      setGeneratingIds((prev) => {
        const next = new Set(prev)
        next.delete(donor.id)
        return next
      })
      addToast(`Message ready for ${donor.name}`, 'success')
    }, 1500)
  }, [generatingIds, addToast])

  /* ── generate all ── */
  const generateAll = useCallback(() => {
    const allDonors = [...simulatedDonors, ...QUEUED_DONORS]
    allDonors.forEach((d, i) => {
      setTimeout(() => generateMessage(d, i), i * 500)
    })
  }, [simulatedDonors, generateMessage])

  /* ── simulate new donation ── */
  const simulateDonation = useCallback(() => {
    const names = ['Bilal A.', 'Hamza R.', 'Layla N.', 'Kareem S.', 'Yasmin D.']
    const cities = ['Chicago IL', 'Dearborn MI', 'Atlanta GA', 'Denver CO', 'Seattle WA']
    const types = ['Direct', 'Compound', 'Jariyah']
    const campaigns = ['Yemen Relief', 'Gaza Emergency', 'Orphan Care', 'Winter Appeal']
    const regions = ['Yemen', 'Gaza', 'Syria', 'Somalia']
    const i = simulatedDonors.length
    const newDonor = {
      id: Date.now(),
      name: names[i % names.length],
      city: cities[i % cities.length],
      amount: [150, 250, 100, 350, 175][i % 5],
      type: types[i % types.length],
      campaign: campaigns[i % campaigns.length],
      region: regions[i % regions.length],
      timeAgo: 'just now',
      isNew: true,
    }
    setSimulatedDonors((prev) => [newDonor, ...prev])
    addToast(`New donation: ${newDonor.name} — $${newDonor.amount} ${newDonor.type}`, 'success')
  }, [simulatedDonors, addToast])

  /* ── generate recovery message ── */
  const generateRecovery = useCallback((donor, idx = 0) => {
    if (recoveryGenerating.has(donor.id)) return
    setRecoveryGenerating((prev) => new Set(prev).add(donor.id))
    addToast(`Generating recovery message for ${donor.name}...`, 'progress')
    setTimeout(() => {
      setRecoveryMessages((prev) => ({
        ...prev,
        [donor.id]: RECOVERY_MESSAGES[idx % RECOVERY_MESSAGES.length](donor),
      }))
      setRecoveryGenerating((prev) => {
        const next = new Set(prev)
        next.delete(donor.id)
        return next
      })
      addToast(`Recovery message ready for ${donor.name}`, 'success')
    }, 1500)
  }, [recoveryGenerating, addToast])

  /* ── lapse overlay generate ── */
  const generateLapseOutreach = useCallback(() => {
    setLapseOverlay(true)
    setLapseChecked([])
    const targets = LAPSE_DONORS_DATA.filter((d) => d.critical || d.daysSinceLast > 100).slice(0, 12)
    targets.forEach((d, i) => {
      setTimeout(() => {
        setLapseChecked((prev) => [...prev, d.id])
      }, (i + 1) * 200)
    })
    setTimeout(() => {
      addToast('Outreach generated for 12 lapsed donors', 'success')
    }, 12 * 200 + 300)
  }, [addToast])

  /* ── all donors list (simulated + queued) ── */
  const allQueuedDonors = useMemo(() => [...simulatedDonors, ...QUEUED_DONORS], [simulatedDonors])

  /* ── feed type dot color ── */
  const feedDotColor = (type) => {
    switch (type) {
      case 'ack': return '#4ade80'
      case 'lapse': return '#f59e0b'
      case 'calendar': return '#60a5fa'
      case 'recovery': return '#ef4444'
      default: return '#888'
    }
  }

  const feedTypeLabel = (type) => {
    switch (type) {
      case 'ack': return 'Acknowledgment'
      case 'lapse': return 'Lapse Prevention'
      case 'calendar': return 'Calendar'
      case 'recovery': return 'Recovery'
      default: return 'System'
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div style={{ padding: '0 0 60px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      {/* ── global styles ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(212,168,67,0); }
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes particle-flow {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes flash-green {
          0% { background: rgba(74,222,128,0.15); }
          100% { background: transparent; }
        }
        @keyframes flash-gold {
          0% { background: rgba(212,168,67,0.15); }
          100% { background: transparent; }
        }
      `}</style>

      {/* ── toast container ── */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
          ))}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         HEADER
         ══════════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 4px',
        }}>
          Automation Engines
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--text-muted)',
          margin: '0 0 16px',
        }}>
          Live operations center — monitoring, generating, and recovering in real time
        </p>

        {/* shimmer line */}
        <div style={{
          height: 1,
          background: 'var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, var(--gold-mid), transparent)',
            animation: 'shimmerLine 3s infinite',
          }} />
        </div>

        {/* global stats bar */}
        <div style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          padding: '14px 24px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} color="var(--teal-mid)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Donors processed today:</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal-light)', fontFamily: "'Cormorant Garamond', serif" }}>{donorsProcessed}</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={14} color="var(--gold-mid)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Messages generated:</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-light)', fontFamily: "'Cormorant Garamond', serif" }}>{messagesGenerated}</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={14} color="#4ade80" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Revenue recovered:</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', fontFamily: "'Cormorant Garamond', serif" }}>${revenueRecovered.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
         AUTOMATION CARDS — 2x2 GRID
         ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}>
        {/* ────────────────────────────────────────────────────────────────────
           CARD 1 — ACKNOWLEDGMENT ENGINE
           ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.5 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            borderLeft: '5px solid var(--teal-mid)',
            position: 'relative',
          }}
        >
          {/* header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={18} color="var(--teal-mid)" />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Acknowledgment Engine
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* simulate toggle */}
              <button
                onClick={() => { setSimulateMode((p) => !p); if (!simulateMode) simulateDonation() }}
                style={{
                  background: simulateMode ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${simulateMode ? '#4ade80' : 'var(--border-subtle)'}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 11,
                  color: simulateMode ? '#4ade80' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Zap size={11} /> Simulate new donation
              </button>
              {/* live badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: '#4ade80',
                background: 'rgba(74,222,128,0.1)',
                padding: '3px 10px',
                borderRadius: 20,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Live
              </span>
            </div>
          </div>

          {/* status */}
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Monitoring {412 + simulatedDonors.length} donors &middot; {allQueuedDonors.length} acknowledgments queued
          </p>

          {/* pipeline SVG */}
          <div style={{ marginBottom: 20, overflowX: 'auto' }}>
            <svg width="100%" height={60} viewBox="0 0 520 60" style={{ minWidth: 480 }}>
              {PIPELINE_NODES.map((label, i) => {
                const cx = 50 + i * 110
                const isActive = i === activeNode
                const isPast = i < activeNode
                return (
                  <g key={i}>
                    {/* connecting line */}
                    {i < PIPELINE_NODES.length - 1 && (
                      <line
                        x1={cx + 16}
                        y1={22}
                        x2={cx + 94}
                        y2={22}
                        stroke={isPast ? 'var(--teal-mid)' : 'rgba(255,255,255,0.1)'}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        style={{ animation: isPast || isActive ? 'dash-flow 1s linear infinite' : 'none' }}
                      />
                    )}
                    {/* gold pulse ring for active */}
                    {isActive && (
                      <circle cx={cx} cy={22} r={16} fill="none" stroke="var(--gold-mid)" strokeWidth={2} opacity={0.6} style={{ animation: 'pulse-gold 2s infinite' }} />
                    )}
                    {/* node circle */}
                    <circle
                      cx={cx}
                      cy={22}
                      r={12}
                      fill={isPast ? 'var(--teal-mid)' : isActive ? 'var(--gold-mid)' : 'rgba(255,255,255,0.06)'}
                      stroke={isPast ? 'var(--teal-light)' : isActive ? 'var(--gold-light)' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={2}
                    />
                    {isPast && <path d={`M${cx - 4} ${22} l3 3 l5 -6`} stroke="#fff" strokeWidth={2} fill="none" />}
                    {isActive && <circle cx={cx} cy={22} r={3} fill="#fff" />}
                    {/* label */}
                    <text x={cx} y={50} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="inherit">
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* queued donor cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {allQueuedDonors.map((donor, idx) => (
                <motion.div
                  key={donor.id}
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    animation: donor.isNew ? 'flash-green 1s ease-out' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: generatedMessages[donor.id] || generatingIds.has(donor.id) ? 10 : 0 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{donor.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                        {donor.city} &middot; ${donor.amount} {donor.type} &middot; {donor.campaign} &middot; {donor.timeAgo}
                      </span>
                    </div>
                    {!generatedMessages[donor.id] && (
                      <button
                        onClick={() => generateMessage(donor, idx)}
                        disabled={generatingIds.has(donor.id)}
                        style={{
                          background: generatingIds.has(donor.id) ? 'rgba(255,255,255,0.04)' : 'rgba(74,173,164,0.12)',
                          border: '1px solid var(--teal-deep)',
                          borderRadius: 8,
                          padding: '5px 12px',
                          fontSize: 11,
                          color: 'var(--teal-light)',
                          cursor: generatingIds.has(donor.id) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {generatingIds.has(donor.id) ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Zap size={11} /> Generate message</>}
                      </button>
                    )}
                  </div>

                  {/* skeleton */}
                  {generatingIds.has(donor.id) && <SkeletonLoader />}

                  {/* generated message */}
                  {generatedMessages[donor.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.4 }}
                    >
                      <div style={{
                        border: '1px solid var(--gold-deep)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        background: 'rgba(212,168,67,0.04)',
                        marginTop: 4,
                      }}>
                        <pre style={{
                          fontFamily: 'inherit',
                          fontSize: 12,
                          color: 'var(--text-secondary, var(--text-muted))',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {generatedMessages[donor.id]}
                        </pre>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => addToast(`Message sent to ${donor.name}`, 'success')}
                          style={{
                            background: 'var(--teal-deep)',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 12,
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Send size={11} /> Send now
                        </button>
                        <button
                          onClick={() => addToast('Opening editor...', 'progress')}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 8,
                            padding: '6px 14px',
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          Edit first
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* generate all button */}
          <button
            onClick={generateAll}
            style={{
              width: '100%',
              marginTop: 14,
              background: 'linear-gradient(135deg, var(--teal-deep), var(--teal-mid))',
              border: 'none',
              borderRadius: 10,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Zap size={14} /> Generate all {allQueuedDonors.length}
          </button>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────────────
           CARD 2 — LAPSE PREVENTION ENGINE
           ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            borderLeft: '5px solid #f59e0b',
            position: 'relative',
          }}
        >
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Lapse Prevention Engine
              </h2>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)',
              padding: '3px 10px',
              borderRadius: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              Active
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            47 donors approaching lapse &middot; 8 in critical window
          </p>

          {/* radar visualization */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width={240} height={240} viewBox="0 0 240 240">
              {/* concentric rings */}
              {[100, 75, 50, 25].map((r, i) => (
                <circle
                  key={i}
                  cx={120}
                  cy={120}
                  r={r}
                  fill="none"
                  stroke={['rgba(74,222,128,0.15)', 'rgba(245,158,11,0.12)', 'rgba(239,68,68,0.12)', 'rgba(239,68,68,0.2)'][i]}
                  strokeWidth={1}
                />
              ))}
              {/* cross lines */}
              <line x1={120} y1={20} x2={120} y2={220} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <line x1={20} y1={120} x2={220} y2={120} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              {/* donor dots */}
              {LAPSE_DONORS_DATA.map((d) => {
                const angle = (d.lifetimeValue / 5200) * Math.PI * 2
                const radius = Math.min(100, (d.daysSinceLast / 200) * 100)
                const x = 120 + Math.cos(angle) * radius
                const y = 120 + Math.sin(angle) * radius
                return (
                  <circle
                    key={d.id}
                    cx={x}
                    cy={y}
                    r={d.critical ? 4 : 2.5}
                    fill={d.critical ? '#ef4444' : d.daysSinceLast > 90 ? '#f59e0b' : '#4ade80'}
                    opacity={d.critical ? 1 : 0.7}
                    style={d.critical ? { animation: 'pulse-red 1.5s infinite' } : undefined}
                  />
                )
              })}
              {/* labels */}
              <text x={120} y={14} textAnchor="middle" fill="var(--text-muted)" fontSize={8}>180+ days</text>
              <text x={120} y={236} textAnchor="middle" fill="var(--text-muted)" fontSize={8}>Recent</text>
            </svg>
          </div>

          {/* risk summary */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <div style={{
              flex: 1,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 10,
              padding: '10px 14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>At Risk</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>23 donors</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>$8,400 value</div>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10,
              padding: '10px 14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Critical</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>8 donors</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>$3,200 value</div>
            </div>
          </div>

          {/* Islamic calendar card */}
          <div style={{
            background: 'rgba(212,168,67,0.04)',
            border: '1px solid rgba(212,168,67,0.12)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Calendar size={13} color="var(--gold-mid)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-light)' }}>Islamic Calendar Insight</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Dhul Hijjah begins in 23 days &middot; Historical multiplier: 2.1&times; &middot; 12 lapsed donors gave during this period last year
            </p>
          </div>

          {/* generate outreach button */}
          <button
            onClick={generateLapseOutreach}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #92400e, #f59e0b)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Send size={14} /> Pre-generate outreach for 12 donors
          </button>

          {/* lapse overlay */}
          <AnimatePresence>
            {lapseOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(10,10,18,0.92)',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 28,
                  zIndex: 10,
                  overflow: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                    Generating outreach messages...
                  </h3>
                  <button onClick={() => setLapseOverlay(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
                {LAPSE_DONORS_DATA.filter((d) => d.critical || d.daysSinceLast > 100).slice(0, 12).map((d) => (
                  <div key={d.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    {lapseChecked.includes(d.id) ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={14} color="#4ade80" />
                      </motion.div>
                    ) : (
                      <Loader2 size={14} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    <span style={{ fontSize: 13, color: lapseChecked.includes(d.id) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {d.name} &middot; {d.daysSinceLast} days &middot; {d.campaign}
                    </span>
                    {lapseChecked.includes(d.id) && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 11, color: '#4ade80', marginLeft: 'auto' }}>
                        Ready
                      </motion.span>
                    )}
                  </div>
                ))}
                {lapseChecked.length === 12 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 13, color: '#4ade80', marginTop: 14, textAlign: 'center' }}>
                    All 12 outreach messages generated and queued for review
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────────────
           CARD 3 — ISLAMIC CALENDAR ENGINE
           ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            borderLeft: '5px solid var(--gold-mid)',
          }}
        >
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={18} color="var(--gold-mid)" />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Islamic Calendar Engine
              </h2>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--gold-mid)',
              background: 'rgba(212,168,67,0.1)',
              padding: '3px 10px',
              borderRadius: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold-mid)', display: 'inline-block' }} />
              Scheduled
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            4 campaigns pre-loaded &middot; Next: Dhul Hijjah (23 days)
          </p>

          {/* Islamic year timeline */}
          <div style={{ marginBottom: 20, overflowX: 'auto' }}>
            <svg width="100%" height={70} viewBox="0 0 520 70" style={{ minWidth: 480 }}>
              {/* segments */}
              {[
                { label: 'Ramadan', x: 0, w: 80, color: 'var(--gold-mid)', opacity: 0.3, multiplier: '2.8x', past: true },
                { label: 'Last 10', x: 80, w: 40, color: 'var(--gold-light)', opacity: 0.3, multiplier: '4.2x', past: true, pulse: false },
                { label: 'Eid Al-Fitr', x: 120, w: 50, color: 'var(--teal-mid)', opacity: 0.3, multiplier: '1.5x', past: true },
                { label: 'Dhul Hijjah', x: 250, w: 80, color: '#f59e0b', opacity: 0.8, multiplier: '2.1x', past: false },
                { label: 'Eid Al-Adha', x: 330, w: 50, color: '#f59e0b', opacity: 0.6, multiplier: '1.8x', past: false },
              ].map((seg, i) => (
                <g key={i}>
                  <rect
                    x={seg.x}
                    y={25}
                    width={seg.w}
                    height={20}
                    rx={4}
                    fill={seg.color}
                    opacity={seg.past ? seg.opacity : seg.opacity}
                  />
                  <text x={seg.x + seg.w / 2} y={38} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={600}>
                    {seg.label}
                  </text>
                  {!seg.past && (
                    <text x={seg.x + seg.w / 2} y={18} textAnchor="middle" fill="var(--gold-light)" fontSize={9} fontWeight={600}>
                      {seg.multiplier}
                    </text>
                  )}
                </g>
              ))}
              {/* timeline base */}
              <rect x={0} y={30} width={520} height={10} rx={5} fill="rgba(255,255,255,0.03)" />
              {/* TODAY marker */}
              <line x1={200} y1={15} x2={200} y2={55} stroke="#ef4444" strokeWidth={2} />
              <text x={200} y={66} textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={700}>TODAY</text>
            </svg>
          </div>

          {/* campaign cards — 2x2 sub-grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {CALENDAR_CAMPAIGNS.map((camp) => {
              const Icon = camp.icon
              return (
                <div key={camp.name} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Icon size={13} color="var(--gold-mid)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{camp.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    <div>Auto-launch: {camp.launchDays} days</div>
                    <div>Target: ${camp.target.toLocaleString()}</div>
                    <div>{camp.emails} pre-written emails</div>
                    <div>{camp.segmentSize} donor segment</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => addToast(`Previewing ${camp.name}...`, 'progress')}
                      style={{
                        background: 'rgba(212,168,67,0.1)',
                        border: '1px solid rgba(212,168,67,0.2)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 10,
                        color: 'var(--gold-light)',
                        cursor: 'pointer',
                      }}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => addToast(`Opening editor for ${camp.name}`, 'progress')}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* live countdown */}
          <div style={{
            background: 'rgba(212,168,67,0.06)',
            border: '1px solid rgba(212,168,67,0.15)',
            borderRadius: 10,
            padding: '14px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--gold-mid)', fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
              DHUL HIJJAH BEGINS IN
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--gold-light)',
              letterSpacing: 2,
            }}>
              {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
            </div>
          </div>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────────────
           CARD 4 — PAYMENT RECOVERY ENGINE
           ──────────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            borderLeft: '5px solid #ef4444',
          }}
        >
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={18} color="#ef4444" />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Payment Recovery Engine
              </h2>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: '#ef4444',
              background: 'rgba(239,68,68,0.1)',
              padding: '3px 10px',
              borderRadius: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              Recovering
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            3 failed payments &middot; $180/month at risk &middot; 2 recovery sequences active
          </p>

          {/* Sankey-style flow SVG */}
          <div style={{ marginBottom: 16, overflowX: 'auto' }}>
            <svg width="100%" height={100} viewBox="0 0 460 100" style={{ minWidth: 420 }}>
              {/* nodes */}
              {[
                { label: 'Failed (3)', x: 10, y: 40, color: '#ef4444', w: 80 },
                { label: 'Email sent (2)', x: 140, y: 30, color: '#f59e0b', w: 90 },
                { label: 'Awaiting (1)', x: 280, y: 15, color: '#f59e0b', w: 85 },
                { label: 'Recovered (1)', x: 280, y: 60, color: '#4ade80', w: 95 },
                { label: 'Generating (1)', x: 140, y: 72, color: 'var(--teal-mid)', w: 90 },
              ].map((node, i) => (
                <g key={i}>
                  <rect x={node.x} y={node.y} width={node.w} height={24} rx={6} fill={node.color} opacity={0.15} stroke={node.color} strokeWidth={1} />
                  <text x={node.x + node.w / 2} y={node.y + 15} textAnchor="middle" fill={node.color} fontSize={9} fontWeight={600}>
                    {node.label}
                  </text>
                </g>
              ))}
              {/* paths */}
              {[
                { d: 'M 90 52 C 115 52 115 42 140 42', color: '#f59e0b' },
                { d: 'M 90 52 C 115 52 115 84 140 84', color: 'var(--teal-mid)' },
                { d: 'M 230 42 C 255 42 255 27 280 27', color: '#f59e0b' },
                { d: 'M 230 42 C 255 42 255 72 280 72', color: '#4ade80' },
              ].map((p, i) => (
                <g key={i}>
                  <path d={p.d} fill="none" stroke={p.color} strokeWidth={2} opacity={0.4} />
                  {/* animated particle */}
                  <circle r={3} fill={p.color}>
                    <animateMotion dur="2.5s" repeatCount="indefinite" path={p.d} />
                  </circle>
                </g>
              ))}
            </svg>
          </div>

          {/* payment cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {/* Card 1 — sent, no response */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Ahmad K.</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                    $60/mo &middot; Card declined 3 days ago &middot; Recovery email sent, no response
                  </span>
                </div>
                {!recoveryMessages[1] ? (
                  <button
                    onClick={() => generateRecovery(PAYMENT_CARDS[0], 0)}
                    disabled={recoveryGenerating.has(1)}
                    style={{
                      background: recoveryGenerating.has(1) ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: 11,
                      color: '#ef4444',
                      cursor: recoveryGenerating.has(1) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {recoveryGenerating.has(1) ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><RefreshCw size={11} /> Generate follow-up</>}
                  </button>
                ) : (
                  <Check size={14} color="#4ade80" />
                )}
              </div>
              {recoveryGenerating.has(1) && <SkeletonLoader />}
              {recoveryMessages[1] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div style={{
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: 'rgba(239,68,68,0.03)',
                    marginTop: 8,
                  }}>
                    <pre style={{ fontFamily: 'inherit', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                      {recoveryMessages[1]}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Card 2 — generating (auto-fill with progress bar) */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Fatima M.</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                    $80/mo &middot; Card expired 5 days ago
                  </span>
                </div>
                {recoveryMessages[2] ? (
                  <Check size={14} color="#4ade80" />
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--teal-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generating...
                  </span>
                )}
              </div>
              {/* progress bar */}
              {!recoveryMessages[2] && (
                <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${paymentProgress * 100}%`, height: '100%', background: 'var(--teal-mid)', borderRadius: 4, transition: 'width 0.1s linear' }} />
                </div>
              )}
              {!recoveryMessages[2] && paymentProgress < 1 && <SkeletonLoader />}
              {recoveryMessages[2] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div style={{
                    border: '1px solid rgba(74,173,164,0.2)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: 'rgba(74,173,164,0.03)',
                    marginTop: 8,
                  }}>
                    <pre style={{ fontFamily: 'inherit', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                      {recoveryMessages[2]}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Card 3 — recovered */}
            <div style={{
              background: 'rgba(74,222,128,0.04)',
              border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#4ade80" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>[Anonymous]</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  $40/mo &middot; Payment restored &middot; 6 hours ago
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#4ade80',
                  background: 'rgba(74,222,128,0.12)',
                  padding: '2px 8px',
                  borderRadius: 10,
                }}>
                  Recovered
                </span>
              </div>
            </div>
          </div>

          {/* revenue counter */}
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 700,
              color: '#4ade80',
            }}>
              ${revenueRecovered.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>recovered this month</div>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         LIVE ACTIVITY FEED
         ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          marginTop: 28,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={16} color="var(--teal-mid)" />
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}>
              Automation Activity
            </span>
          </div>
          <button
            onClick={() => setFeedPaused((p) => !p)}
            style={{
              background: feedPaused ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${feedPaused ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 11,
              color: feedPaused ? '#f59e0b' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {feedPaused ? <><Play size={11} /> Resume feed</> : <><Pause size={11} /> Pause feed</>}
          </button>
        </div>

        <div ref={feedRef} style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <AnimatePresence initial={false}>
            {feedEntries.slice(0, 30).map((entry, idx) => (
              <motion.div
                key={entry.id || `feed-${idx}`}
                initial={idx === 0 && entry.id ? { opacity: 0, y: -10, background: 'rgba(212,168,67,0.12)' } : { opacity: 1 }}
                animate={{ opacity: 1, y: 0, background: 'transparent' }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                {/* colored dot */}
                <div style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: feedDotColor(entry.type),
                  marginTop: 5,
                  flexShrink: 0,
                }} />
                {/* timestamp */}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', minWidth: 70, flexShrink: 0 }}>
                  {entry.time}
                </span>
                {/* engine label */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: feedDotColor(entry.type),
                  background: `${feedDotColor(entry.type)}15`,
                  padding: '1px 6px',
                  borderRadius: 4,
                  minWidth: 80,
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {feedTypeLabel(entry.type)}
                </span>
                {/* description */}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {entry.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
