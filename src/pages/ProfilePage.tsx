import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { EditProfileModal } from '../components/ui/EditProfileModal'
import { PostCard } from '../components/ui/PostCard'
import { useAppSelector } from '../app/hooks'
import { useGetUserQuery, useGetUserPostsQuery, useGetFollowersQuery, useGetFollowingQuery, useUnfollowUserMutation, type ApiUser } from '../api/orbitApi'
import styles from './ProfilePage.module.css'

function StatCounter({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  return (
    <div className={`${styles.stat} ${onClick ? styles.statClickable : ''}`} onClick={onClick}>
      <span className={styles.statValue}>{value.toLocaleString()}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function FollowersModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: users = [] } = useGetFollowersQuery(userId)
  return <UserListModal title="Followers" users={users} onClose={onClose} />
}

function FollowingModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: users = [] } = useGetFollowingQuery(userId)
  return <UserListModal title="Following" users={users} showUnfollow onClose={onClose} />
}

function UserListModal({ title, users, showUnfollow, onClose }: { title: string; users: ApiUser[]; showUnfollow?: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [unfollowUser] = useUnfollowUserMutation()

  return (
    <motion.div
      className={styles.listOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`${styles.listModal} glass`}
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>{title}</h3>
          <button className={styles.listClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.listItems}>
          {users.length === 0 && <p className={styles.listEmpty}>Nobody here yet</p>}
          {users.map((u) => (
            <div key={u.id} className={styles.listItem}>
              <button className={styles.listItemBtn} onClick={() => { onClose(); navigate(`/user/${u.username}`) }}>
                <Avatar src={u.avatar ?? ''} alt={u.displayName} size="sm" online={u.isOnline} />
                <div className={styles.listItemInfo}>
                  <span className={styles.listName}>{u.displayName}</span>
                  <span className={styles.listHandle}>@{u.username}</span>
                </div>
              </button>
              {showUnfollow && (
                <motion.button
                  className={styles.listUnfollowBtn}
                  onClick={() => unfollowUser(u.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  Unfollow
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ProfilePage() {
  const me = useAppSelector((s) => s.auth.user)
  const [editOpen,  setEditOpen]  = useState(false)
  const [showModal, setShowModal] = useState<'followers' | 'following' | null>(null)

  const { data: profile }       = useGetUserQuery(me?.username ?? '', { skip: !me?.username })
  const { data: myPosts = [] }  = useGetUserPostsQuery(me?.id ?? '', { skip: !me?.id })

  const followers  = profile?.followers ?? me?.followers  ?? 0
  const following  = profile?.following ?? me?.following  ?? 0
  const postsCount = profile?.posts     ?? me?.posts      ?? 0

  if (!me) return null

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.cover}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {me.cover
          ? <img src={me.cover} alt="Cover" className={styles.coverImg} />
          : <div className={styles.coverFallback} />
        }
      </motion.div>

      <motion.div
        className={`${styles.profileHeader} glass`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className={styles.avatarWrap}>
          <Avatar src={me.avatar ?? ''} alt={me.displayName} size="xl" online={me.isOnline} />
        </div>
        <div className={styles.headerBody}>
          <div className={styles.nameRow}>
            <h1 className={styles.displayName}>{me.displayName}</h1>
            {me.isVerified && <span className={styles.verified}>✓ Verified</span>}
          </div>
          <span className={styles.handle}>@{me.username}</span>
          {me.bio && <p className={styles.bio}>{me.bio}</p>}
        </div>
        <button className={styles.editBtn} onClick={() => setEditOpen(true)}>Edit Profile</button>
      </motion.div>

      <motion.div
        className={`${styles.statsRow} glass`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.35 }}
      >
        <StatCounter value={followers}  label="Followers" onClick={() => setShowModal('followers')} />
        <div className={styles.statDivider} />
        <StatCounter value={following}  label="Following" onClick={() => setShowModal('following')} />
        <div className={styles.statDivider} />
        <StatCounter value={postsCount} label="Posts" />
      </motion.div>

      <section>
        <h2 className={styles.sectionTitle}>My Posts</h2>
        {myPosts.length > 0
          ? myPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          : (
            <div className={`${styles.emptyPosts} glass`}>
              <p className={styles.emptyText}>No posts yet. Share something!</p>
            </div>
          )
        }
      </section>

      <AnimatePresence>
        {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
        {showModal === 'followers' && <FollowersModal key="followers" userId={me.id} onClose={() => setShowModal(null)} />}
        {showModal === 'following' && <FollowingModal key="following" userId={me.id} onClose={() => setShowModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
