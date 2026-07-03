import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getSocket } from '../../api/socket'
import styles from './Toast.module.css'

interface ToastItem {
  id: string
  title: string
  body: string
  avatar?: string
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onNotif = (n: any) => {
      const item: ToastItem = { id: n.id, title: n.title, body: n.body, avatar: n.triggerer?.avatar }
      setToasts((prev) => [...prev.slice(-2), item])
    }

    socket.on('notification', onNotif)
    return () => { socket.off('notification', onNotif) }
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className={styles.stack} aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      className={`${styles.toast} glass`}
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      layout
    >
      {toast.avatar && <img src={toast.avatar} alt="" className={styles.avatar} />}
      <div className={styles.body}>
        <span className={styles.title}>{toast.title}</span>
        <span className={styles.msg}>{toast.body}</span>
      </div>
      <button className={styles.close} onClick={onDismiss} aria-label="Dismiss">×</button>
    </motion.div>
  )
}
