import { create } from 'zustand'

export type GenerateStatus = 'idle' | 'capturing' | 'generating' | 'done' | 'error'

interface GenerateState {
  status: GenerateStatus
  progressLabel: string
  error: string | null
  lastSource: 'heuristic' | 'api' | null

  setStatus: (status: GenerateStatus, label?: string) => void
  setError: (error: string | null) => void
  setLastSource: (source: 'heuristic' | 'api' | null) => void
  reset: () => void
}

export const useGenerateStore = create<GenerateState>((set) => ({
  status: 'idle',
  progressLabel: '',
  error: null,
  lastSource: null,

  setStatus: (status, label) =>
    set({
      status,
      progressLabel: label ?? '',
      error: null,
    }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  setLastSource: (lastSource) => set({ lastSource }),
  reset: () => set({ status: 'idle', progressLabel: '', error: null }),
}))
