import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { useViewStoryMutation, useReplyToStoryMutation, type StoryGroup } from '../../api/orbitApi'
import { useAppSelector } from '../../app/hooks'
import styles from './StoryViewer.module.css'

const STORY_DURATION = 5000

interface StoryViewerProps {
  groups: StoryGroup[]
  startGroupIndex: number
  onClose: () => void
}

export function StoryViewer({ groups, startGroupIndex, onClose }: StoryViewerProps) {
  const navigate = useNavigate()
  const me = useAppSelector((s) => s.auth.user)
  const [groupIdx,  setGroupIdx]  = useState(startGroupIndex)
  const [storyIdx,  setStoryIdx]  = useState(0)
  const [progress,  setProgress]  = useState(0)
  const [paused,    setPaused]    = useState(false)
  const [reply,     setReply]     = useState('')
  const [showReply, setShowReply] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [viewStory]  = useViewStoryMutation()
  const [replyStory] = useReplyToStoryMutation()

  const group = groups[groupIdx]
  const story = group?.stories[storyIdx]

  const goNext = useCallback(() => {
    if (storyIdx < (group?.stories.length ?? 1) - 1) {
      setStoryIdx((i) => i + 1)
      setProgress(0)
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1)
      setStoryIdx(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [storyIdx, groupIdx, group?.stories.length, groups.length, onClose])

  const goPrev = () => {
    if (storyIdx > 0) { setStoryIdx((i) => i - 1); setProgress(0) }
    else if (groupIdx > 0) { setGroupIdx((i) => i - 1); setStoryIdx(0); setProgress(0) }
  }

  // Auto-advance timer
  useEffect(() => {
    if (paused || showReply) return
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { goNext(); return 0 }
        return p + (100 / (STORY_DURATION / 100))
      })
    }, 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, showReply, goNext, storyIdx, groupIdx])

// Mark as viewed
   useEffect(() => {
     if (story && me && !story.viewed) {
       viewStory(story.id)
     }
   }, [story?.id, me, story?.viewed])

  const handleReply = async () => {
    if (!reply.trim() || !story) return
    const result = await replyStory({ id: story.id, content: reply }).unwrap()
    setReply('')
    setShowReply(false)
    onClose()
    navigate('/messages', { state: { convId: result.convId } })
  }

  if (!group || !story) return null

  const isMyStory = group.author.id === me?.id

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.viewer}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className={styles.progressBars}>
          {group.stories.map((s, i) => (
            <div key={s.id} className={styles.progressTrack}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: i < storyIdx ? '100%' : '0%' }}
                animate={{ width: i < storyIdx ? '100%' : i === storyIdx ? `${progress}%` : '0%' }}
                transition={{ duration: 0 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={styles.header}>
          <Avatar src={group.author.avatar ?? ''} alt={group.author.displayName} size="sm" />
          <div className={styles.headerInfo}>
            <span className={styles.authorName}>{group.author.displayName}</span>
            <span className={styles.timeAgo}>
              {formatRelative(story.createdAt)}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Story content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            className={styles.content}
            style={story.type === 'text' ? { background: story.bgColor ?? '#6366F1' } : undefined}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {story.type === 'image' && story.mediaUrl ? (
              <img src={story.mediaUrl} alt="" className={styles.storyImage} />
            ) : (
              <p className={styles.storyText} style={{ color: story.textColor ?? '#fff' }}>
                {story.content}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tap zones */}
        <button className={styles.tapPrev} onClick={goPrev} aria-label="Previous" />
        <button
          className={styles.tapNext}
          onClick={goNext}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          aria-label="Next"
        />

        {/* Stats for own stories */}
        {isMyStory && (
          <div className={styles.stats}>
            <span>👁 {story.viewCount}</span>
            <span>↩ {story.replyCount}</span>
          </div>
        )}

        {/* Reply bar */}
        {!isMyStory && (
          <div className={styles.replyBar}>
            {showReply ? (
              <motion.div
                className={styles.replyInput}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <input
                  autoFocus
                  placeholder="Reply to story…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  className={styles.replyField}
                />
                <motion.button className={styles.sendReply} onClick={handleReply} whileTap={{ scale: 0.9 }}>↗</motion.button>
              </motion.div>
            ) : (
              <button className={styles.replyTrigger} onClick={() => setShowReply(true)}>
                Reply to story…
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
