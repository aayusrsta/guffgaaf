import { useEffect, useRef } from 'react'
import { useAppDispatch } from '../app/hooks'
import { addMessage, setTyping } from '../features/messages/messagesSlice'
import { push } from '../features/notifications/notificationsSlice'
import { mockConversations, mockUsers } from '../api/mockData'

const AUTO_REPLIES: Record<string, string[]> = {
  conv1: [
    'Wednesday works perfectly!',
    'Also, have you seen the new Radix UI update?',
    'Should we use Figma\'s new variables for the migration?',
    'I was thinking we could start with the color tokens first.',
  ],
  conv2: [
    'That\'s a great point about progressive disclosure.',
    'What tools are you using for the user interviews?',
    'We should write this up as a case study.',
  ],
  conv3: [
    'When you do drop the code, I\'m ready to dig in.',
    'Have you tried pairing it with Three.js?',
    'The wave composition idea is chef\'s kiss honestly.',
  ],
}

/**
 * Simulates a WebSocket connection for DMs.
 * Sends auto-replies with a typing indicator before each message.
 */
export function useMessageSocket(activeConvId: string | null) {
  const dispatch = useAppDispatch()
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (!activeConvId) return
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []

    const conv = mockConversations.find((c) => c.id === activeConvId)
    if (!conv) return

    const replies = AUTO_REPLIES[activeConvId] ?? []
    if (!replies.length) return

    let replyIndex = 0

    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 7000
      const t = setTimeout(() => {
        const content = replies[replyIndex % replies.length]
        replyIndex++

        // Show typing indicator for 2s first
        dispatch(setTyping({ convId: activeConvId, typing: true }))

        const t2 = setTimeout(() => {
          dispatch(setTyping({ convId: activeConvId, typing: false }))
          const msg = {
            id: `ws_${Date.now()}`,
            conversationId: activeConvId,
            senderId: conv.participant.id,
            content,
            createdAt: new Date().toISOString(),
            read: false,
          }
          dispatch(addMessage(msg))
          dispatch(push({
            type: 'message',
            title: conv.participant.displayName,
            body: content,
            avatar: conv.participant.avatar,
          }))
        }, 2200)

        timerRef.current.push(t2)
        scheduleNext()
      }, delay)
      timerRef.current.push(t)
    }

    scheduleNext()

    return () => {
      timerRef.current.forEach(clearTimeout)
      dispatch(setTyping({ convId: activeConvId, typing: false }))
    }
  }, [activeConvId])
}
