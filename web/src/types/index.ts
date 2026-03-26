export type TStoryPreview = {
  id: string
  title: string
  category: 'red' | 'clear' | 'honkaku' | 'henkaku'
  difficulty: 'easy' | 'medium' | 'hard'
  surface: string
}

export type TMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type: 'yes' | 'no' | 'irrelevant' | 'invalid' | 'question' | 'info'
  timestamp: number
}

export type TGameStatus = 'playing' | 'submitting' | 'partial' | 'won' | 'revealed'

export type TGameState = {
  storyId: string
  surface: string
  messages: TMessage[]
  status: TGameStatus
  questionCount: number
  yesCount: number
  startTime: number
}

export type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: 'RATE_LIMIT' | 'AI_ERROR' | 'NOT_FOUND' | 'INVALID_INPUT'
    message: string
  }
}
