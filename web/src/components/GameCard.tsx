import { Link } from 'react-router-dom'
import type { TStoryPreview } from '../types'

type GameCardProps = {
  story: TStoryPreview
}

const categoryMeta: Record<
  TStoryPreview['category'],
  { label: string; className: string }
> = {
  red: {
    label: '红汤',
    className:
      'border-red-400/40 bg-red-900 text-red-400',
  },
  clear: {
    label: '清汤',
    className:
      'border-blue-400/40 bg-blue-900 text-blue-400',
  },
  honkaku: {
    label: '本格',
    className:
      'border-slate-400/30 bg-slate-700 text-slate-400',
  },
  henkaku: {
    label: '变格',
    className:
      'border-slate-400/30 bg-slate-700 text-slate-400',
  },
}

const difficultyMeta: Record<
  TStoryPreview['difficulty'],
  { label: string; className: string }
> = {
  easy: {
    label: 'easy',
    className:
      'border-green-400/35 bg-green-900/25 text-green-400',
  },
  medium: {
    label: 'medium',
    className:
      'border-amber-400/35 bg-amber-900/20 text-amber-400',
  },
  hard: {
    label: 'hard',
    className:
      'border-red-400/35 bg-red-900/20 text-red-400',
  },
}

const GameCard = ({ story }: GameCardProps) => {
  const cat = categoryMeta[story.category]
  const diff = difficultyMeta[story.difficulty]

  return (
    <Link
      to={`/game/${story.id}`}
      className="group block min-h-[44px] h-full w-full rounded-lg border border-slate-700 bg-slate-800/60 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_0_22px_rgba(251,191,36,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold tracking-wide text-amber-400 group-hover:text-amber-300">
          {story.title}
        </h2>
        <span className={`min-h-7 rounded-full border px-3 py-1 text-xs font-semibold ${diff.className}`}>
          {diff.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`min-h-7 rounded-full border px-3 py-1 text-xs font-semibold ${cat.className}`}>
          {cat.label}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        {story.surface}
      </p>
    </Link>
  )
}

export default GameCard
