import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from './Avatar'
import { ReactionBar } from './ReactionBar'
import { useGetCommentsQuery, useAddCommentMutation, type ApiPost } from '../../api/orbitApi'
import { useAppSelector } from '../../app/hooks'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: ApiPost
  index?: number
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const me = useAppSelector((s) => s.auth.user)
  const { data: comments = [], isLoading: commentsLoading } = useGetCommentsQuery(post.id, { skip: !commentsOpen })
  const [addComment] = useAddCommentMutation()
  const [commentText, setCommentText] = useState('')
  const { author } = post

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    await addComment({ postId: post.id, content: commentText })
    setCommentText('')
  }

  return (
    <motion.article
      className={`${styles.card} glass`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      layout
    >
      {/* Orbit tag */}
      {post.orbitTag && (
        <span className={styles.orbitBadge}>{post.orbitTag}</span>
      )}

      {/* Author */}
      <div className={styles.header}>
        <Avatar src={author.avatar ?? ''} alt={author.displayName} size="sm" online={author.isOnline} />
        <div className={styles.authorInfo}>
          <span className={styles.displayName}>
            {author.displayName}
            {author.isVerified && <span className={styles.verified}>✓</span>}
          </span>
          <span className={styles.handle}>@{author.username}</span>
        </div>
        <time className={styles.time}>
          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </time>
      </div>

      {/* Content */}
      <p className={styles.content}>{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className={styles.imageWrap}>
          <img src={post.image} alt="" className={styles.image} loading="lazy" />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <ReactionBar post={post} />

        <motion.button
          className={styles.actionBtn}
          onClick={() => setCommentsOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
        >
          <span>◎</span>
          <span className={styles.statNum}>{post.commentCount}</span>
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            className={styles.comments}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className={styles.commentsInner}>
              {commentsLoading ? (
                <p className={styles.loadingText}>Loading…</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className={styles.comment}>
                    <Avatar src={c.author.avatar ?? ''} alt={c.author.displayName} size="xs" />
                    <div className={styles.commentBody}>
                      <span className={styles.commentAuthor}>{c.author.displayName}</span>
                      <p className={styles.commentText}>{c.content}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Add comment */}
              {me && (
                <form className={styles.commentForm} onSubmit={handleComment}>
                  <Avatar src={me.avatar ?? ''} alt={me.displayName} size="xs" />
                  <input
                    className={styles.commentInput}
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className={styles.commentSubmit} disabled={!commentText.trim()}>↗</button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
