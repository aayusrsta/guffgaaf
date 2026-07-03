import { motion } from 'framer-motion'
import { useGetExplorePostsQuery, useGetSuggestedUsersQuery, useFollowUserMutation } from '../api/orbitApi'
import { Avatar } from '../components/ui/Avatar'
import { PostCard } from '../components/ui/PostCard'
import styles from './ExplorePage.module.css'

export function ExplorePage() {
  const { data: postsData, isLoading: postsLoading } = useGetExplorePostsQuery()
  const { data: suggested = [], isLoading: usersLoading } = useGetSuggestedUsersQuery()
  const [followUser] = useFollowUserMutation()

  return (
    <div className={styles.page}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.title}>Explore</h1>
        <p className={styles.subtitle}>Discover people and posts</p>
      </motion.header>

      {/* Suggested people */}
      {!usersLoading && suggested.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>People to Follow</h2>
          <div className={styles.peopleList}>
            {suggested.map((user, i) => (
              <motion.div
                key={user.id}
                className={`${styles.personCard} glass`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Avatar src={user.avatar ?? ''} alt={user.displayName} size="md" online={user.isOnline} />
                <div className={styles.personInfo}>
                  <div className={styles.personNameRow}>
                    <span className={styles.personName}>{user.displayName}</span>
                    {user.isVerified && <span className={styles.verified}>✓</span>}
                  </div>
                  <span className={styles.personHandle}>@{user.username}</span>
                  {user.bio && <p className={styles.personBio}>{user.bio}</p>}
                </div>
                <div className={styles.personStats}>
                  <span className={styles.followers}>{(user.followers / 1000).toFixed(1)}k</span>
                  <button className={styles.followBtn} onClick={() => followUser(user.id)}>
                    Follow
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trending posts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trending Posts</h2>
        {postsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${styles.postSkeleton} glass`} />
            ))
          : postsData?.posts.length === 0
            ? <p className={styles.empty}>No posts yet. Be the first to post!</p>
            : postsData?.posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        }
      </section>
    </div>
  )
}
