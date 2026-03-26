import type { TStoryPreview } from '../types'
import GameCard from '../components/GameCard'
import { HARDCODED_PREVIEW_STORIES } from '../data/previewStories'

const Home = () => {
  // TODO: Day 13换成/api/stories接口
  const previewStories: TStoryPreview[] = HARDCODED_PREVIEW_STORIES

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-900 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-900/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-amber-700/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.08),rgba(2,6,23,0.3)_45%,rgba(2,6,23,0.9)_80%)]" />

      <section className="relative mx-auto w-full max-w-5xl rounded-lg border border-slate-700/80 bg-slate-900/50 p-6 shadow-2xl shadow-slate-950 backdrop-blur-sm md:p-10">
        <div className="rounded-lg border border-slate-700/80 bg-slate-900/40 p-5">
          <p className="text-sm tracking-[0.25em] text-slate-400">MIDNIGHT CASE FILE</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.55)] sm:text-5xl">
            🐢 AI海龟汤
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            让“是/否/无关”的沉默，替你丈量真相的距离。选择一份汤面，向神秘主持人提问，
            在每次回应里找出缺口，直到真相无法再被隐藏。
          </p>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-amber-300">谜题大厅</h2>
            <p className="text-sm text-slate-400">点击卡片进入游戏</p>
          </div>

          {previewStories.length === 0 ? (
            // TODO: 题库为空时显示提示文字
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center text-slate-300">
              暂时没有可用的谜题。请稍后再来。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {previewStories.map((story) => (
                <GameCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Home
