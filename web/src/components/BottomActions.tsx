type BottomActionsProps = {
  onRestore: () => void
  onGiveUp: () => void
}

const BottomActions = ({ onRestore, onGiveUp }: BottomActionsProps) => {
  return (
    <div className="relative flex flex-none flex-col gap-2 px-4 pb-4 md:px-6 md:pb-6">
      <button
        type="button"
        onClick={onRestore}
        className="min-h-[44px] rounded-lg border border-amber-400/80 px-4 py-3 text-center font-semibold text-amber-300 transition-all duration-200 hover:shadow-[0_0_22px_rgba(251,191,36,0.35)]"
      >
        🔍 还原真相
      </button>
      <button
        type="button"
        onClick={onGiveUp}
        className="min-h-[44px] rounded-lg border border-red-400/70 px-4 py-3 text-center font-semibold text-red-300 transition-all duration-200 hover:shadow-[0_0_20px_rgba(248,113,113,0.25)]"
      >
        🏳️ 放弃本局
      </button>
    </div>
  )
}

export default BottomActions

