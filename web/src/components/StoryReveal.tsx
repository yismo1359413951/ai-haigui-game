type StoryRevealProps = {
  bottom: string
}

const StoryReveal = ({ bottom }: StoryRevealProps) => {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h2 className="text-xl font-bold text-amber-400">汤底揭晓</h2>
      <p className="mt-3 whitespace-pre-wrap text-slate-200">{bottom}</p>
    </section>
  )
}

export default StoryReveal
