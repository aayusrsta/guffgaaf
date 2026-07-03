import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateStoryMutation } from '../../api/orbitApi'
import styles from './StoryCreator.module.css'

const BG_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F97316',
  '#14B8A6', '#10B981', '#F59E0B', '#1A1A2E',
]

interface StoryCreatorProps {
  onClose: () => void
}

type Mode = 'choose' | 'text' | 'image'

export function StoryCreator({ onClose }: StoryCreatorProps) {
  const [createStory, { isLoading }] = useCreateStoryMutation()
  const [mode,    setMode]    = useState<Mode>('choose')
  const [content, setContent] = useState('')
  const [bgColor, setBgColor] = useState(BG_COLORS[0])
  const [file,    setFile]    = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMode('image')
  }

  const handlePost = async () => {
    const fd = new FormData()
    if (mode === 'text') {
      if (!content.trim()) return
      fd.append('type', 'text')
      fd.append('content', content)
      fd.append('bgColor', bgColor)
      fd.append('textColor', '#ffffff')
    } else {
      if (!file) return
      fd.append('type', 'image')
      fd.append('media', file)
    }
    await createStory(fd)
    onClose()
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>New Story</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" className={styles.choose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.button
                className={`${styles.choiceBtn} glass`}
                onClick={() => setMode('text')}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className={styles.choiceIcon}>Aa</span>
                <span className={styles.choiceLabel}>Text</span>
                <span className={styles.choiceHint}>Write a note or thought</span>
              </motion.button>
              <motion.button
                className={`${styles.choiceBtn} glass`}
                onClick={() => fileRef.current?.click()}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className={styles.choiceIcon}>◧</span>
                <span className={styles.choiceLabel}>Photo</span>
                <span className={styles.choiceHint}>Share an image</span>
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
            </motion.div>
          )}

          {mode === 'text' && (
            <motion.div key="text" className={styles.textEditor} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className={styles.preview} style={{ background: bgColor }}>
                <textarea
                  autoFocus
                  className={styles.textInput}
                  placeholder="What's your story?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className={styles.colorPicker}>
                {BG_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorDot} ${bgColor === c ? styles.colorActive : ''}`}
                    style={{ background: c }}
                    onClick={() => setBgColor(c)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {mode === 'image' && preview && (
            <motion.div key="image" className={styles.imagePreview} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <img src={preview} alt="Story preview" className={styles.previewImg} />
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== 'choose' && (
          <div className={styles.footer}>
            <button className={styles.backBtn} onClick={() => { setMode('choose'); setContent(''); setFile(null); setPreview(null) }}>
              ← Back
            </button>
            <motion.button
              className={styles.postBtn}
              onClick={handlePost}
              disabled={isLoading || (mode === 'text' && !content.trim()) || (mode === 'image' && !file)}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Posting…' : 'Share Story'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
