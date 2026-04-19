import { motion } from 'framer-motion'
import { ANIMATION } from '../../utils/constants'

export default function TransitionWrapper({ children }) {
  return (
    <motion.div
      initial={ANIMATION.screenEnter.initial}
      animate={ANIMATION.screenEnter.animate}
      exit={ANIMATION.screenEnter.exit}
      transition={ANIMATION.screenEnter.transition}
    >
      {children}
    </motion.div>
  )
}
