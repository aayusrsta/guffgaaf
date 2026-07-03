import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'
import { useUpdateProfileMutation } from '../../api/orbitApi'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { setUser } from '../../features/auth/authSlice'
import { Avatar } from './Avatar'
import styles from './EditProfileModal.module.css'

interface EditProfileModalProps {
  onClose: () => void
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
  const dispatch = useAppDispatch()
  const me = useAppSelector((s) => s.auth.user)
  const [updateProfile] = useUpdateProfileMutation()

  const [displayName, setDisplayName] = useState(me?.displayName ?? '')
  const [bio,         setBio]         = useState(me?.bio ?? '')
  const [username,    setUsername]    = useState(me?.username ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef  = useRef<HTMLInputElement>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await updateProfile({ displayName, bio, username }).unwrap()
      dispatch(setUser({ ...me!, ...updated }))
      onClose()
    } catch (err: any) {
      setError(err?.data?.error ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await api.post('/users/me/avatar', fd)
      dispatch(setUser({ ...me!, avatar: res.data.avatar }))
    } catch { setError('Avatar upload failed') }
  }

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('cover', file)
    try {
      const res = await api.post('/users/me/cover', fd)
      dispatch(setUser({ ...me!, cover: res.data.cover }))
    } catch { setError('Cover upload failed') }
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
        className={`${styles.modal} glass`}
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Profile</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Cover + Avatar upload */}
        <div className={styles.coverArea}>
          <div className={styles.coverPreview} onClick={() => coverRef.current?.click()}>
            {me?.cover
              ? <img src={me.cover} alt="Cover" className={styles.coverImg} />
              : <div className={styles.coverPlaceholder} />
            }
            <div className={styles.coverOverlay}>◧ Change cover</div>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={uploadCover} />
          </div>
          <div className={styles.avatarEdit} onClick={() => avatarRef.current?.click()}>
            <Avatar src={me?.avatar ?? ''} alt={me?.displayName ?? ''} size="lg" />
            <div className={styles.avatarOverlay}>◧</div>
            <input ref={avatarRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSave}>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.field}>
            <span className={styles.label}>Display Name</span>
            <input className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <div className={styles.inputPrefixed}>
              <span className={styles.prefix}>@</span>
              <input className={styles.inputInner} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Bio</span>
            <textarea className={`${styles.input} ${styles.textarea}`} value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={160} />
          </label>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <motion.button type="submit" className={styles.saveBtn} disabled={saving} whileTap={{ scale: 0.96 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
