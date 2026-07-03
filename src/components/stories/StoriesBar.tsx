import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGetStoriesFeedQuery, type StoryGroup } from '../../api/orbitApi'
import { useAppSelector } from '../../app/hooks'
import { Avatar } from '../ui/Avatar'
import { StoryViewer } from './StoryViewer'
import { StoryCreator } from './StoryCreator'
import styles from './StoriesBar.module.css'

export function StoriesBar() {
  const me = useAppSelector((s) => s.auth.user)
  const { data: groups = [] } = useGetStoriesFeedQuery()
  const [viewing, setViewing] = useState<{ groups: StoryGroup[]; startIndex: number } | null>(null)
  const [creating, setCreating] = useState(false)

  const myGroup = groups.find((g) => g.author.id === me?.id)
  const otherGroups = groups.filter((g) => g.author.id !== me?.id)

  const openViewer = (group: StoryGroup) => {
    const allGroups = groups
    const idx = allGroups.findIndex((g) => g.author.id === group.author.id)
    setViewing({ groups: allGroups, startIndex: Math.max(0, idx) })
  }

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.scroll}>
          {/* My story bubble */}
          <motion.button
            className={styles.bubble}
            onClick={() => myGroup ? openViewer(myGroup) : setCreating(true)}
            whileTap={{ scale: 0.93 }}
          >
            <div className={`${styles.ring} ${myGroup ? styles.ringActive : styles.ringAdd}`}>
              <Avatar src={me?.avatar ?? ''} alt={me?.displayName ?? ''} size="md" />
              {!myGroup && <span className={styles.addIcon}>+</span>}
            </div>
            <span className={styles.label}>Your story</span>
          </motion.button>

          {/* Others */}
          {otherGroups.map((group, i) => {
            const allViewed = group.stories.every((s) => s.viewed)
            return (
              <motion.button
                key={group.author.id}
                className={styles.bubble}
                onClick={() => openViewer(group)}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.93 }}
              >
                <div className={`${styles.ring} ${allViewed ? styles.ringViewed : styles.ringActive}`}>
                  <Avatar src={group.author.avatar ?? ''} alt={group.author.displayName} size="md" />
                </div>
                <span className={styles.label}>{group.author.displayName.split(' ')[0]}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {viewing && (
        <StoryViewer
          groups={viewing.groups}
          startGroupIndex={viewing.startIndex}
          onClose={() => setViewing(null)}
        />
      )}
      {creating && <StoryCreator onClose={() => setCreating(false)} />}
    </>
  )
}
