import { useGenerateStore } from '../store/useGenerateStore'

export function GenerateOverlay() {
  const status = useGenerateStore((s) => s.status)
  const progressLabel = useGenerateStore((s) => s.progressLabel)
  const error = useGenerateStore((s) => s.error)
  const reset = useGenerateStore((s) => s.reset)

  if (status === 'idle' || status === 'done') return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div
        className="w-72 rounded-xl border px-6 py-5 text-center shadow-2xl"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        {status === 'error' ? (
          <>
            <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>
              Generation failed
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {error || 'Unknown error'}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-md px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: 'var(--accent)' }}
            >
              Dismiss
            </button>
          </>
        ) : (
          <>
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
              {progressLabel || 'Working…'}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Sketch → polished mockup
            </p>
          </>
        )}
      </div>
    </div>
  )
}
