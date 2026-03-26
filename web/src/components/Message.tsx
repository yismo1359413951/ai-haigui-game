import type { TMessage } from '../types'

type MessageProps = {
  message: TMessage
}

const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user'

  const borderByType: Record<
    TMessage['type'],
    string
  > = {
    yes: 'border-green-400/70',
    no: 'border-red-400/70',
    irrelevant: 'border-slate-500/70',
    invalid: 'border-amber-400/80',
    question: 'border-slate-600',
    info: 'border-slate-600',
  }

  const borderClass = borderByType[message.type]

  const bubbleClass = isUser
    ? 'bg-blue-700/40 text-blue-50'
    : message.type === 'invalid'
      ? 'bg-amber-900/20 text-amber-200'
      : 'bg-slate-800 text-slate-100'

  const icon = isUser ? '🧑' : '🎴'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="mr-2 self-end text-lg leading-none">
          {icon}
        </span>
      )}

      <div
        className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 border ${bubbleClass} ${borderClass}`}
      >
        {message.content}
      </div>

      {isUser && (
        <span className="ml-2 self-end text-lg leading-none">
          {icon}
        </span>
      )}
    </div>
  )
}

export default Message
