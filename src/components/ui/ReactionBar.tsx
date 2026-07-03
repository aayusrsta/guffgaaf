import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReactToPostMutation, type ApiPost } from '../../api/orbitApi'
import styles from './ReactionBar.module.css'

const REACTIONS = [
  { type: 'love',  icon: '♥' },
  { type: 'spark', icon: '✦' },
  { type: 'haha',  icon: ':D' },
  { type: 'wow',   icon: '!!' },
  { type: 'think', icon: '··' },
]

interface ReactionBarProps {
  post: ApiPost
}

export function ReactionBar({ post }: ReactionBarProps) {
  const [reactToPost] = useReactToPostMutation()
  const [open, setOpen]   = useState(false)
  const [burst, setBurst] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalCount = post.reactions.reduce((acc, r) => acc + r.count, 0)
  const myReaction = post.myReaction

  const handleReact = async (type: string) => {
    setBurst(type)
    setTimeout(() => setBurst(null), 600)
    setOpen(false)
    await reactToPost({ postId: post.id, type })
  }

  const openPicker = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const scheduledClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <div className={styles.root} onMouseEnter={openPicker} onMouseLeave={scheduledClose}>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`${styles.picker} glass`}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onMouseEnter={openPicker}
            onMouseLeave={scheduledClose}
          >
            {REACTIONS.map((r) => (
              <motion.button
                key={r.type}
                className={`${styles.chip} ${myReaction === r.type ? styles.active : ''}`}
                whileHover={{ scale: 1.3, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(r.type)}
                title={r.type}
              >
                <span className={styles.icon}>{r.icon}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`${styles.trigger} ${myReaction ? styles.reacted : ''}`}
        whileTap={{ scale: 0.88 }}
      >
        <AnimatePresence mode="wait">
          {burst ? (
            <motion.span key={burst} initial={{ scale: 1.8 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={styles.burstIcon}>
              {REACTIONS.find((r) => r.type === burst)?.icon}
            </motion.span>
          ) : (
            <motion.span key="default" className={styles.defaultIcon}>
              {myReaction ? REACTIONS.find((r) => r.type === myReaction)?.icon : '♡'}
            </motion.span>
          )}
        </AnimatePresence>
        <span className={styles.count}>{totalCount > 0 ? totalCount : ''}</span>
      </motion.button>
    </div>
  )
}
