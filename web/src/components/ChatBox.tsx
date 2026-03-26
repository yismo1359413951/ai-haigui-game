import { useEffect, useRef, useState } from 'react'
import type { TMessage } from '../types'
import Message from './Message'

type ChatBoxProps = {
  messages: TMessage[]
  onSend: (question: string) => void | Promise<void>
  isLoading?: boolean
}

const GUIDANCE =
  '💡 提问技巧：把问题改成可以用是/否回答的形式，例如"他是在室内死亡的吗？"'

const ChatBox = ({ messages, onSend, isLoading = false }: ChatBoxProps) => {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const hasFirstQuestion = messages.some(
    (m) => m.role === 'user' && m.type === 'question',
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

  const send = (): void => {
    if (isLoading) return
    const question = input.trim()
    if (!question) return
    onSend(question)
    setInput('')
  }

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (isLoading) return
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <section className="flex h-full flex-1 flex-col rounded-lg border border-slate-700 bg-slate-800/40">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          {!hasFirstQuestion && (
            <div className="flex w-full justify-start">
              <div className="max-w-[86%] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm leading-6 text-slate-200">
                {GUIDANCE}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-slate-700 bg-slate-900/70 px-3 py-3 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="向神秘主持人提问..."
            readOnly={isLoading}
            disabled={isLoading}
            className="min-h-[44px] max-h-40 flex-1 resize-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:placeholder:text-slate-500"
          />
          <button
            type="button"
            disabled={!input.trim() || isLoading}
            onClick={send}
            className="min-h-[44px] rounded-lg border border-amber-400/80 px-4 font-semibold text-amber-300 transition-all duration-200 enabled:hover:shadow-[0_0_20px_rgba(251,191,36,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '思考中...' : '发送'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default ChatBox
