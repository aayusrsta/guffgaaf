import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Avatar } from '../components/ui/Avatar'
import { PostCard } from '../components/ui/PostCard'
import { useAppSelector } from '../app/hooks'
import { useGetUserQuery, useGetUserPostsQuery, useFollowUserMutation, useUnfollowUserMutation } from '../api/orbitApi'
import { useOpenConversationMutation } from '../api/orbitApi'
import styles from './UserProfilePage.module.css'

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate     = useNavigate()
  const me           = useAppSelector((s) => s.auth.user)

  const { data: user, isLoading } = useGetUserQuery(username ?? '', { skip: !username })
  const { data: posts = [] }      = useGetUserPostsQuery(user?.id ?? '', { skip: !user?.id })
  const [followUser,   { isLoading: following }]   = useFollowUserMutation()
  const [unfollowUser, { isLoading: unfollowing }] = useUnfollowUserMutation()
  const [openConv]                                  = useOpenConversationMutation()

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null)
  const actualFollowing = isFollowing ?? user?.isFollowing ?? false

  if (me?.username === username) {
    navigate('/profile', { replace: true })
    return null
  }

  const handleFollow = async () => {
    if (!user) return
    if (actualFollowing) {
      setIsFollowing(false)
      await unfollowUser(user.id)
    } else {
      setIsFollowing(true)
      await followUser(user.id)
    }
  }

  const handleMessage = async () => {
    if (!user) return
    const conv = await openConv(user.id).unwrap()
    navigate('/messages', { state: { convId: conv.id } })
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingIcon}>◉</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.notFound}>
        <p>User not found</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      <motion.div
        className={styles.cover}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {user.cover
          ? <img src={user.cover} alt="Cover" className={styles.coverImg} />
          : <div className={styles.coverFallback} />
        }
      </motion.div>

      <motion.div
        className={`${styles.profileHeader} glass`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
      >
        <div className={styles.avatarWrap}>
          <Avatar src={user.avatar ?? ''} alt={user.displayName} size="xl" online={user.isOnline} />
        </div>
        <div className={styles.headerBody}>
          <div className={styles.nameRow}>
            <h1 className={styles.displayName}>{user.displayName}</h1>
            {user.isVerified && <span className={styles.verified}>✓</span>}
          </div>
          <span className={styles.handle}>@{user.username}</span>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
        <div className={styles.actions}>
          <motion.button
            className={actualFollowing ? styles.unfollowBtn : styles.followBtn}
            onClick={handleFollow}
            disabled={following || unfollowing}
            whileTap={{ scale: 0.95 }}
          >
            {actualFollowing ? 'Following' : 'Follow'}
          </motion.button>
          <motion.button
            className={styles.msgBtn}
            onClick={handleMessage}
            whileTap={{ scale: 0.95 }}
          >
            Message
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className={`${styles.statsRow} glass`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className={styles.stat}>
          <span className={styles.statValue}>{user.followers.toLocaleString()}</span>
          <span className={styles.statLabel}>Followers</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{user.following.toLocaleString()}</span>
          <span className={styles.statLabel}>Following</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{user.posts.toLocaleString()}</span>
          <span className={styles.statLabel}>Posts</span>
        </div>
      </motion.div>

      <section>
        <h2 className={styles.sectionTitle}>Posts</h2>
        {posts.length > 0
          ? posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          : (
            <div className={`${styles.emptyPosts} glass`}>
              <p className={styles.emptyText}>No posts yet</p>
            </div>
          )
        }
      </section>
    </div>
  )
}
