type InlineToastProps = {
  message: string
}

const InlineToast = ({ message }: InlineToastProps) => {
  return (
    <div className="relative mx-auto mt-4 w-full max-w-md px-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900/90 px-4 py-3 text-center text-slate-200 shadow">
        {message}
      </div>
    </div>
  )
}

export default InlineToast

