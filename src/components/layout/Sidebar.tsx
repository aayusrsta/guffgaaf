import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Avatar } from '../ui/Avatar'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { disconnectSocket } from '../../api/socket'
import { useGetConversationsQuery, useGetNotificationsQuery } from '../../api/orbitApi'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/',              label: 'Feed',          icon: '◈' },
  { to: '/explore',       label: 'Explore',        icon: '⊕' },
  { to: '/messages',      label: 'Messages',       icon: '◉' },
  { to: '/notifications', label: 'Notifications',  icon: '◎' },
  { to: '/profile',       label: 'Profile',        icon: '⊛' },
]

export function Sidebar() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const me        = useAppSelector((s) => s.auth.user)
  const { data: conversations = [] } = useGetConversationsQuery()
  const { data: notifications  = [] } = useGetNotificationsQuery()

  const totalUnreadDMs = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
  const unreadNotifs   = notifications.filter((n) => !n.read).length

  if (!me) return null

  const handleLogout = async () => {
    await dispatch(logout())
    disconnectSocket()
    navigate('/login')
  }

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.brand}>
        <img src={`${import.meta.env.BASE_URL}gg-icon.png`} alt="GuffGaaf" className={styles.brandIcon} />
        <span className={styles.brandName}>GuffGaaf</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.to === '/messages' && totalUnreadDMs > 0 && (
                  <motion.span className={styles.badge} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {totalUnreadDMs}
                  </motion.span>
                )}
                {item.to === '/notifications' && unreadNotifs > 0 && (
                  <motion.span className={styles.badge} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {unreadNotifs}
                  </motion.span>
                )}
                {isActive && (
                  <motion.span className={styles.activeIndicator} layoutId="active-nav"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.bottom}>
        <ThemeToggle />
        <div className={styles.userCard}>
          <Avatar src={me.avatar ?? ''} alt={me.displayName} size="sm" online={me.isOnline} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{me.displayName}</span>
            <span className={styles.userHandle}>@{me.username}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.logoutIcon}>⇤</span>
          Log out
        </button>
      </div>
    </aside>
  )
}
