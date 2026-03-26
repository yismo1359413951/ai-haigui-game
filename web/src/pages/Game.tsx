import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { TMessage } from '../types'
import ChatBox from '../components/ChatBox'
import SurfacePanel from '../components/SurfacePanel'
import BottomActions from '../components/BottomActions'
import InlineToast from '../components/InlineToast'
import { HARDCODED_PREVIEW_STORIES } from '../data/previewStories'
import { askAI, judgeAnswer } from '../api'

const Game = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [surfaceExpanded, setSurfaceExpanded] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [messages, setMessages] = useState<TMessage[]>([])
  const messagesRef = useRef<TMessage[]>(messages)
  const [isLoading, setIsLoading] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [answerDraft, setAnswerDraft] = useState('')

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const story = useMemo(() => {
    if (!id) return null
    return HARDCODED_PREVIEW_STORIES.find((s) => s.id === id) ?? null
  }, [id])

  useEffect(() => {
    if (!id) return
    if (story) return

    setToast('题目不存在')
    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [id, navigate, story])

  const mapAssistant = (
    answer: string,
    tip?: string,
  ): { type: TMessage['type']; content: string } => {
    if (tip) {
      return { type: 'invalid', content: tip }
    }

    if (answer === '是') {
      return { type: 'yes', content: '✅ 是' }
    }

    if (answer === '否') {
      return { type: 'no', content: '❌ 否' }
    }

    if (answer === '无关') {
      return { type: 'irrelevant', content: '🔘 无关' }
    }

    return { type: 'invalid', content: answer || '无法回答' }
  }

  const onSend = async (question: string): Promise<void> => {
    if (!story) return
    if (isLoading) return

    setToast(null)
    setIsLoading(true)

    const now = Date.now()
    const loadingId = `loading-${now}`
    const userMsg: TMessage = {
      id: `u-${now}`,
      role: 'user',
      type: 'question',
      content: question,
      timestamp: now,
    }
    const loadingMsg: TMessage = {
      id: loadingId,
      role: 'assistant',
      type: 'info',
      content: '思考中...',
      timestamp: now + 1,
    }

    setMessages((prev) => [...prev, userMsg, loadingMsg])

    try {
      const { answer, tip } = await askAI(question, story.id)
      const mapped = mapAssistant(answer, tip)
      const aiMsg: TMessage = {
        id: loadingId,
        role: 'assistant',
        type: mapped.type,
        content: mapped.content,
        timestamp: now + 2,
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === loadingId ? aiMsg : m)),
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '出错了，请重试'
      setToast(msg)
      setMessages((prev) => prev.filter((m) => m.id !== loadingId))
    } finally {
      setIsLoading(false)
    }
  }

  const submitRestore = async (): Promise<void> => {
    if (!story) return
    if (isLoading) return

    const finalAnswer = answerDraft.trim()
    if (!finalAnswer) {
      setToast('请先输入你的完整推理答案')
      return
    }

    setToast(null)
    setIsLoading(true)
    setShowAnswerModal(false)
    const loadingId = `judge-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        type: 'info',
        content: '思考中...',
        timestamp: Date.now(),
      },
    ])

    try {
      const result = await judgeAnswer(story.id, finalAnswer)
      const nextMessages = messagesRef.current.filter((m) => m.id !== loadingId)
      setMessages(nextMessages)

      if (result.result === 'won') {
        navigate('/result', {
          state: {
            status: 'won',
            title: story.title,
            bottom: result.bottom,
            messages: nextMessages,
          },
        })
        return
      }

      if (result.result === 'partial') {
        const missing = result.missing ?? 1
        setToast(`还差 ${missing} 个关键信息，继续推理`)
        return
      }

      setToast('wrong，思路偏了，重新推理吧')
    } catch (err) {
      const nextMessages = messagesRef.current.filter((m) => m.id !== loadingId)
      setMessages(nextMessages)
      setToast(err instanceof Error ? err.message : '出错了，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const onRestore = (): void => {
    if (isLoading) return
    setAnswerDraft('')
    setShowAnswerModal(true)
  }

  const onGiveUp = async (): Promise<void> => {
    if (!story) return
    if (isLoading) return

    setToast(null)
    setIsLoading(true)
    try {
      const result = await judgeAnswer(story.id)
      const nextMessages = messagesRef.current
      navigate('/result', {
        state: {
          status: 'revealed',
          title: story.title,
          bottom: result.bottom,
          messages: nextMessages,
        },
      })
    } catch (err) {
      setToast(err instanceof Error ? err.message : '出错了，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-slate-900 text-white pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.08),rgba(2,6,23,0.3)_35%,rgba(2,6,23,0.92)_85%)]" />

      {toast && <InlineToast message={toast} />}

      <div className="relative flex flex-none flex-col gap-3 px-4 pt-4 md:px-6">
        <SurfacePanel
          key={id}
          title={story?.title ?? '...'}
          surface={story?.surface ?? ''}
          expanded={surfaceExpanded}
          onToggle={() => setSurfaceExpanded((v) => !v)}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-3 md:px-6">
        <ChatBox messages={messages} onSend={onSend} isLoading={isLoading} />
      </div>

      <div className="relative flex-none">
        <BottomActions
          onRestore={onRestore}
          onGiveUp={onGiveUp}
        />
      </div>

      {showAnswerModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/60">
            <h2 className="text-lg font-bold text-amber-300">还原真相</h2>
            <p className="mt-2 text-sm text-slate-300">请输入你认为的完整汤底：</p>
            <textarea
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              placeholder="例如：他因为......所以......"
              className="mt-3 min-h-32 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submitRestore}
                disabled={isLoading}
                className="min-h-[44px] rounded-lg border border-amber-400/80 px-4 font-semibold text-amber-300 transition-all duration-200 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)] disabled:opacity-50"
              >
                提交判定
              </button>
              <button
                type="button"
                onClick={() => setShowAnswerModal(false)}
                disabled={isLoading}
                className="min-h-[44px] rounded-lg border border-slate-600 px-4 text-slate-200 transition-all duration-200 hover:bg-slate-800 disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Game

