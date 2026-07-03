import styles from './Avatar.module.css'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src: string
  alt: string
  size?: AvatarSize
  online?: boolean
  className?: string
}

const PALETTE = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F97316',
  '#14B8A6', '#10B981', '#F59E0B', '#3B82F6',
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

export function Avatar({ src, alt, size = 'md', online, className }: AvatarProps) {
  const showFallback = !src

  return (
    <span className={`${styles.root} ${styles[size]} ${className ?? ''}`}>
      {showFallback
        ? (
          <span className={styles.fallback} style={{ background: colorFor(alt || '?') }}>
            {initials(alt || '?')}
          </span>
        )
        : <img src={src} alt={alt} className={styles.img} />
      }
      {online && <span className={styles.dot} aria-label="Online" />}
    </span>
  )
}
