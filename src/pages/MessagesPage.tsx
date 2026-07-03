import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  orbitApi,
  useGetConversationsQuery, useGetMessagesQuery, useOpenConversationMutation,
  useSearchUsersQuery,
  type ApiConversation, type ApiMessage, type ApiUser, type StoryContext,
} from '../api/orbitApi'
import { getSocket } from '../api/socket'
import { Avatar } from '../components/ui/Avatar'
import styles from './MessagesPage.module.css'

function TypingBubble() {
  return (
    <div className={styles.typingWrap}>
      <motion.div
        className={`${styles.typingBubble} glass`}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.9 }}
      >
        <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
      </motion.div>
    </div>
  )
}

function StoryContextCard({ ctx, isMe }: { ctx: StoryContext; isMe: boolean }) {
  return (
    <div className={`${styles.storyCard} ${isMe ? styles.storyCardMe : styles.storyCardThem}`}>
      <span className={styles.storyCardLabel}>Replied to your story</span>
      <div
        className={styles.storyCardThumb}
        style={ctx.type === 'text' ? { background: ctx.bgColor ?? '#6366F1' } : undefined}
      >
        {ctx.type === 'image' && ctx.mediaUrl
          ? <img src={ctx.mediaUrl} alt="Story" className={styles.storyCardImg} />
          : <p className={styles.storyCardText} style={{ color: ctx.textColor ?? '#fff' }}>{ctx.content}</p>
        }
        <div className={styles.storyCardFade} />
      </div>
    </div>
  )
}

function ChatPanel({ conv }: { conv: ApiConversation }) {
  const me = useAppSelector((s) => s.auth.user)
  const { data, isError: msgsError, refetch } = useGetMessagesQuery(conv.id, { refetchOnMountOrArgChange: true })
  const [pendingMsgs, setPendingMsgs] = useState<ApiMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const socket = getSocket()

  const serverIds = new Set(data?.messages.map((m) => m.id) ?? [])
  const messages = [
    ...(data?.messages ?? []),
    ...pendingMsgs.filter((m) => !serverIds.has(m.id)),
  ]

  useEffect(() => {
    if (!socket || !conv.id) return
    setPendingMsgs([])
    socket.emit('join_conversation', conv.id)

    const onMsg = (msg: ApiMessage) => setPendingMsgs((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
    )
    const onTypingStart = ({ convId }: { convId: string }) => { if (convId === conv.id) setIsTyping(true) }
    const onTypingStop  = ({ convId }: { convId: string }) => { if (convId === conv.id) setIsTyping(false) }

    socket.on('new_message', onMsg)
    socket.on('typing_start', onTypingStart)
    socket.on('typing_stop',  onTypingStop)

    return () => {
      socket.emit('leave_conversation', conv.id)
      socket.off('new_message', onMsg)
      socket.off('typing_start', onTypingStart)
      socket.off('typing_stop',  onTypingStop)
    }
  }, [socket, conv.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

  const sendMessage = () => {
    const content = text.trim()
    if (!content || !socket) return
    socket.emit('send_message', { convId: conv.id, content })
    setText('')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (!socket) return
    socket.emit('typing_start', { convId: conv.id })
    clearTimeout((handleTyping as any)._timer)
    ;(handleTyping as any)._timer = setTimeout(() => socket.emit('typing_stop', { convId: conv.id }), 1200)
  }

  if (!conv.participant) return null

  return (
    <div className={styles.chatPanel}>
      <div className={`${styles.chatHeader} glass`}>
        <Avatar src={conv.participant.avatar ?? ''} alt={conv.participant.displayName} size="sm" online={conv.participant.isOnline} />
        <div className={styles.chatHeaderInfo}>
          <span className={styles.chatName}>{conv.participant.displayName}</span>
          <span className={styles.chatStatus}>
            {isTyping
              ? <motion.span key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.typingLabel}>typing…</motion.span>
              : conv.participant.isOnline ? 'Online' : 'Offline'
            }
          </span>
        </div>
      </div>

      <div className={styles.messages}>
        {msgsError ? (
          <div className={styles.errorState}>
            <p>Failed to load messages.</p>
            <button onClick={() => refetch()} className={styles.retryBtn}>Retry</button>
          </div>
        ) : !data ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`${styles.convSkeleton} ${i % 2 !== 0 ? styles.myRow : ''}`}
              style={{ width: `${40 + (i * 13) % 35}%`, height: 38, flexShrink: 0 }}
            />
          ))
        ) : messages.map((msg) => {
              const isMe = msg.senderId === me?.id
              return (
                <motion.div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.myRow : ''}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {!isMe && <Avatar src={conv.participant!.avatar ?? ''} alt={conv.participant!.displayName} size="xs" />}
                  <div className={`${styles.bubble} ${isMe ? styles.myBubble : styles.theirBubble}`}>
                    {msg.storyContext && <StoryContextCard ctx={msg.storyContext} isMe={isMe} />}
                    <p className={styles.bubbleText}>{msg.content}</p>
                    <span className={styles.bubbleTime}>
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              )
            })
        }
        <AnimatePresence>{isTyping && <TypingBubble key="typing" />}</AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className={`${styles.inputRow} glass`}>
        <input
          className={styles.input}
          placeholder={`Message ${conv.participant.displayName}…`}
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <motion.button className={styles.sendBtn} onClick={sendMessage} whileTap={{ scale: 0.9 }}>↗</motion.button>
      </div>
    </div>
  )
}

function NewChatModal({ onClose, onOpen }: { onClose: () => void; onOpen: (convId: string) => void }) {
  const [q, setQ] = useState('')
  const [openConversation] = useOpenConversationMutation()
  const { data: results = [], isFetching } = useSearchUsersQuery(q, { skip: q.trim().length < 1 })

  const handleSelect = async (user: ApiUser) => {
    const conv = await openConversation(user.id).unwrap()
    onOpen(conv.id)
    onClose()
  }

  return (
    <motion.div
      className={styles.ncOverlay}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`${styles.ncModal} glass`}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.ncHeader}>
          <h3 className={styles.ncTitle}>New Message</h3>
          <button className={styles.ncClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.ncSearch}>
          <input
            autoFocus
            className={styles.ncInput}
            placeholder="Search by name or @username…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className={styles.ncResults}>
          {isFetching && <p className={styles.ncHint}>Searching…</p>}
          {!isFetching && q.trim() && results.length === 0 && (
            <p className={styles.ncHint}>No users found</p>
          )}
          {results.map((user) => (
            <motion.button
              key={user.id}
              className={styles.ncItem}
              onClick={() => handleSelect(user)}
              whileTap={{ scale: 0.97 }}
            >
              <Avatar src={user.avatar ?? ''} alt={user.displayName} size="sm" online={user.isOnline} />
              <div className={styles.ncItemInfo}>
                <span className={styles.ncName}>{user.displayName}</span>
                <span className={styles.ncHandle}>@{user.username}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

const ACTIVE_CONV_KEY = 'orbit-active-conv'

export function MessagesPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const socket = getSocket()
  const { data: conversations = [], isLoading } = useGetConversationsQuery()
  const [activeConvId, setActiveConvId] = useState<string | null>(
    () => sessionStorage.getItem(ACTIVE_CONV_KEY)
  )
  const [showNewChat, setShowNewChat] = useState(false)
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null

  const selectConv = (id: string) => {
    setActiveConvId(id)
    sessionStorage.setItem(ACTIVE_CONV_KEY, id)
  }

  useEffect(() => {
    if (location.state?.convId) {
      selectConv(location.state.convId)
    }
  }, [location.state?.convId])

  useEffect(() => {
    if (conversations.length === 0) return
    if (activeConvId && conversations.some((c) => c.id === activeConvId)) return
    selectConv(conversations[0].id)
  }, [conversations, activeConvId])

  useEffect(() => {
    if (!socket) return
    const refresh = () => dispatch(orbitApi.util.invalidateTags(['Conversation']))
    socket.on('story_reply_dm', refresh)
    return () => {
      socket.off('story_reply_dm', refresh)
    }
  }, [socket, dispatch])

  return (
    <div className={styles.page}>
      <div className={`${styles.convList} glass`}>
        <div className={styles.convListHeader}>
          <h2 className={styles.convListTitle}>Messages</h2>
          <motion.button
            className={styles.newChatBtn}
            onClick={() => setShowNewChat(true)}
            whileTap={{ scale: 0.93 }}
            title="New conversation"
          >
            +
          </motion.button>
        </div>
        <div className={styles.convItems}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.convSkeleton} />)
            : conversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  className={`${styles.convItem} ${activeConvId === conv.id ? styles.convActive : ''}`}
                  onClick={() => selectConv(conv.id)}
                  whileTap={{ scale: 0.97 }}
                >
                  <Avatar src={conv.participant?.avatar ?? ''} alt={conv.participant?.displayName ?? ''} size="md" online={conv.participant?.isOnline} />
                  <div className={styles.convInfo}>
                    <span className={styles.convName}>{conv.participant?.displayName}</span>
                    <span className={styles.convLast}>{conv.lastMessage?.content ?? ''}</span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <motion.span className={styles.unreadBadge} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {conv.unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              ))
          }
          {!isLoading && conversations.length === 0 && (
            <p className={styles.noConvs}>No messages yet. Start a conversation!</p>
          )}
        </div>
      </div>

      {activeConv
        ? <ChatPanel key={activeConv.id} conv={activeConv} />
        : (
          <div className={styles.emptyPanel}>
            <span className={styles.emptyIcon}>◉</span>
            <p className={styles.emptyText}>
              {isLoading ? 'Loading…' : 'Select a conversation or start a new one'}
            </p>
            <motion.button className={styles.startBtn} onClick={() => setShowNewChat(true)} whileTap={{ scale: 0.96 }}>
              New Message
            </motion.button>
          </div>
        )
      }

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            onClose={() => setShowNewChat(false)}
            onOpen={(id) => selectConv(id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
