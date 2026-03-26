import { useMemo, useState } from 'react'
import type { TGameState, TMessage } from '../types'

const STORAGE_KEY = 'haigui_game_state'

const useGame = (storyId: string) => {
  const [messages, setMessages] = useState<TMessage[]>([])
  const [status, setStatus] = useState<TGameState['status']>('playing')
  const [questionCount, setQuestionCount] = useState(0)
  const [yesCount, setYesCount] = useState(0)

  const displayMessages = useMemo(() => messages.slice(-100), [messages])

  return {
    storyId,
    messages,
    status,
    questionCount,
    yesCount,
    displayMessages,
    setMessages,
    setStatus,
    setQuestionCount,
    setYesCount,
    storageKey: STORAGE_KEY,
  }
}

export default useGame
