import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleTheme } from '../../features/theme/themeSlice'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  return (
    <button
      className={`${styles.track} ${isDark ? styles.dark : ''}`}
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      role="switch"
      aria-checked={isDark}
    >
      <motion.span
        className={styles.thumb}
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      >
        {isDark ? '☽' : '◐'}
      </motion.span>
    </button>
  )
}
