import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useGetNotificationsQuery, useMarkNotificationsReadMutation, type ApiNotification } from '../api/orbitApi'
import styles from './NotificationsPage.module.css'

const TYPE_ICON: Record<string, string> = {
  follow:      '◎',
  like:        '♥',
  comment:     '◈',
  story_reply: '◉',
  mention:     '@',
}

const TYPE_COLOR: Record<string, string> = {
  follow:      '#6366F1',
  like:        '#EC4899',
  comment:     '#14B8A6',
  story_reply: '#F97316',
  mention:     '#8B5CF6',
}

function getNavTarget(n: ApiNotification): string | null {
  switch (n.type) {
    case 'follow':
      return n.triggerer ? `/user/${n.triggerer.username}` : null
    case 'like':
    case 'comment':
      return '/'   // feed — post cards are there; deep-linking to a post is a future improvement
    case 'story_reply':
      return '/'
    default:
      return null
  }
}

function NotifItem({ n }: { n: ApiNotification }) {
  const navigate = useNavigate()
  const icon     = TYPE_ICON[n.type]  ?? '◉'
  const color    = TYPE_COLOR[n.type] ?? 'var(--accent)'
  const target   = getNavTarget(n)

  return (
    <motion.div
      className={`${styles.item} ${!n.read ? styles.unread : ''} ${target ? styles.clickable : ''}`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={target ? () => navigate(target) : undefined}
    >
      <div className={styles.iconWrap} style={{ background: `${color}22`, color }}>
        {icon}
      </div>
      {n.triggerer && (
        <Avatar src={n.triggerer.avatar ?? ''} alt={n.triggerer.displayName} size="sm" />
      )}
      <div className={styles.body}>
        <p className={styles.notifTitle}>{n.title}</p>
        <p className={styles.desc}>{n.body}</p>
        <span className={styles.time}>{formatRelative(n.createdAt)}</span>
      </div>
      {!n.read && <span className={styles.dot} />}
      {target && <span className={styles.chevron}>›</span>}
    </motion.div>
  )
}

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationsReadMutation()

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (unread > 0) {
      const t = setTimeout(() => markRead(), 2000)
      return () => clearTimeout(t)
    }
  }, [unread])

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>Notifications</h1>
        {unread > 0 && <span className={styles.unreadCount}>{unread} new</span>}
      </motion.div>

      <div className={styles.list}>
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}

        {!isLoading && notifications.length === 0 && (
          <div className={`${styles.empty} glass`}>
            <span className={styles.emptyIcon}>◎</span>
            <p className={styles.emptyText}>No notifications yet</p>
            <p className={styles.emptyHint}>When someone follows you, likes or comments on your posts, you'll see it here.</p>
          </div>
        )}

        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <NotifItem n={n} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
