import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { TMessage } from '../types'

type TResultLocationState = {
  status?: 'won' | 'revealed' | 'wrong'
  title?: string
  bottom?: string
  messages?: TMessage[]
}

const Result = () => {
  const location = useLocation()
  const [typedLength, setTypedLength] = useState(0)
  const state = (location.state as TResultLocationState | null) ?? null
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const statusFromQuery = params.get('status') === 'revealed' ? 'revealed' : 'won'
  const status = state?.status ?? statusFromQuery
  const isWon = status === 'won'
  const bottomText =
    state?.bottom && state.bottom.trim().length > 0
      ? state.bottom
      : '暂无汤底信息，请返回大厅重新开始。'
  const storyTitle = state?.title ?? '未知题目'
  const history = (state?.messages ?? []).filter((m) => m.role !== 'system')

  useEffect(() => {
    setTypedLength(0)
    const timer = window.setInterval(() => {
      setTypedLength((prev) => {
        if (prev >= bottomText.length) {
          window.clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, 24)

    return () => window.clearInterval(timer)
  }, [status, bottomText])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-900 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      {isWon && (
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-[12%] top-10 text-3xl animate-bounce">🎉</span>
          <span className="absolute left-[30%] top-20 text-2xl animate-ping">🎊</span>
          <span className="absolute right-[25%] top-12 text-3xl animate-bounce">🎉</span>
          <span className="absolute right-[12%] top-24 text-2xl animate-pulse">🎊</span>
        </div>
      )}

      <section className="relative mx-auto w-full max-w-3xl rounded-lg border border-slate-700/80 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950 backdrop-blur-sm md:p-8">
        <h1
          className={`text-3xl font-extrabold md:text-5xl ${
            isWon
              ? 'text-green-400 drop-shadow-[0_0_16px_rgba(74,222,128,0.45)]'
              : 'text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.45)]'
          }`}
        >
          {isWon ? '推理成功' : '真相揭晓'}
        </h1>
        <p className="mt-2 text-lg font-semibold text-amber-300">{storyTitle}</p>
        <p className="mt-3 text-slate-300">
          {isWon ? '你在黑夜中找到了唯一正确的航线。' : '你选择了揭底，主持人给出了完整答案。'}
        </p>

        <section className="mt-6 rounded-lg border border-slate-700 bg-slate-800/80 p-4">
          <p className="mb-2 text-sm tracking-[0.2em] text-slate-400">汤底档案</p>
          <p className="min-h-32 whitespace-pre-wrap text-base leading-7 text-slate-100">
            {bottomText.slice(0, typedLength)}
            <span className="animate-pulse text-amber-300">|</span>
          </p>
        </section>

        <section className="mt-4 rounded-lg border border-slate-700 bg-slate-800/70 p-4">
          <p className="mb-2 text-sm tracking-[0.2em] text-slate-400">对话历史</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">本局没有可展示的对话记录。</p>
          ) : (
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {history.map((item) => (
                <p key={item.id} className="text-sm text-slate-200">
                  {item.role === 'user' ? '你：' : '主持人：'}
                  {item.content}
                </p>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-400/80 px-6 font-semibold text-amber-300 transition-all duration-200 hover:shadow-[0_0_22px_rgba(251,191,36,0.45)]"
          >
            🐢 再来一局
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Result
