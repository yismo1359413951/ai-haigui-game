import { useId } from 'react'

type SurfacePanelProps = {
  title: string
  surface: string
  expanded: boolean
  onToggle: () => void
}

const SurfacePanel = ({
  title,
  surface,
  expanded,
  onToggle,
}: SurfacePanelProps) => {
  const panelId = useId()

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 shadow-2xl shadow-slate-950/70">
      <h1 className="text-xl font-extrabold tracking-tight text-amber-400 md:text-2xl">
        {title}
      </h1>

      <div className="mt-3">
        <button
          type="button"
          onClick={onToggle}
          aria-controls={panelId}
          aria-expanded={expanded}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 text-slate-200 transition-all duration-200 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(251,191,36,0.22)]"
        >
          <span aria-hidden="true">🔍</span>
          {expanded ? '收起汤面' : '展开汤面'}
        </button>

        <div
          id={panelId}
          className={`overflow-hidden rounded-lg transition-all duration-300 ${
            expanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          } border border-slate-700 bg-slate-800/40`}
        >
          <p className="p-4 whitespace-pre-wrap text-slate-200">{surface}</p>
        </div>
      </div>
    </div>
  )
}

export default SurfacePanel

