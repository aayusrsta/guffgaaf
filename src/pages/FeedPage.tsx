import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostCard } from '../components/ui/PostCard'
import { Avatar } from '../components/ui/Avatar'
import { StoriesBar } from '../components/stories/StoriesBar'
import { useGetFeedQuery, useCreatePostMutation } from '../api/orbitApi'
import { useAppSelector } from '../app/hooks'
import styles from './FeedPage.module.css'

function SkeletonCard() {
  return (
    <div className={`${styles.skeleton} glass`}>
      <div className={styles.skRow}>
        <div className={`${styles.skCircle} ${styles.pulse}`} />
        <div className={styles.skLines}>
          <div className={`${styles.skLine} ${styles.skLineShort} ${styles.pulse}`} />
          <div className={`${styles.skLine} ${styles.skLineTiny} ${styles.pulse}`} />
        </div>
      </div>
      <div className={`${styles.skLine} ${styles.pulse}`} />
      <div className={`${styles.skLine} ${styles.skLineMed} ${styles.pulse}`} />
    </div>
  )
}

function ComposeBox() {
  const me = useAppSelector((s) => s.auth.user)
  const [createPost, { isLoading }] = useCreatePostMutation()
  const [content, setContent] = useState('')
  const [image, setImage]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!me) return null

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    const fd = new FormData()
    fd.append('content', content)
    if (image) fd.append('image', image)
    await createPost(fd)
    setContent('')
    setImage(null)
    setPreview(null)
    setExpanded(false)
  }

  return (
    <motion.div className={`${styles.compose} glass`} layout>
      <form onSubmit={handleSubmit}>
        <div className={styles.composeRow}>
          <Avatar src={me.avatar ?? ''} alt={me.displayName} size="sm" online />
          <textarea
            className={styles.composeInput}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            rows={expanded ? 3 : 1}
          />
        </div>

        <AnimatePresence>
          {(expanded || preview) && (
            <motion.div
              className={styles.composeActions}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {preview && (
                <div className={styles.previewWrap}>
                  <img src={preview} className={styles.previewImg} alt="preview" />
                  <button type="button" className={styles.removeImg} onClick={() => { setImage(null); setPreview(null) }}>×</button>
                </div>
              )}
              <div className={styles.composeToolbar}>
                <button type="button" className={styles.toolbarBtn} onClick={() => fileRef.current?.click()}>
                  ◧ Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
                <motion.button
                  type="submit"
                  className={styles.postBtn}
                  disabled={!content.trim() || isLoading}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'Posting…' : 'Post'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

export function FeedPage() {
  const { data, isLoading } = useGetFeedQuery(undefined)
  const posts = data?.posts ?? []

  return (
    <div className={styles.page}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.title}>Your Feed</h1>
        <p className={styles.subtitle}>From the people you follow</p>
      </motion.header>

      <StoriesBar />

      <ComposeBox />

      <div className={styles.feed}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : posts.length === 0
            ? (
              <div className={`${styles.empty} glass`}>
                <p className={styles.emptyText}>Follow people to see their posts here. Check out Explore to discover new people.</p>
              </div>
            )
            : posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        }
      </div>
    </div>
  )
}
