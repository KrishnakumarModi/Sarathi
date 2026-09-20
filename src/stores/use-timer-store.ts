import { create } from 'zustand'

/**
 * Ephemeral study/practice timer state.
 *
 * Zustand holds only client-only UI state; the completed session is written
 * to the database through a server action (01_ARCHITECTURE_GUIDE.md §4).
 */
interface TimerState {
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number
  totalTime: number
  elapsedSeconds: number
  topicId: string | null
  questionCount: number
}

interface TimerActions {
  startTimer: (topicId: string, questionCount: number, secondsPerQuestion: number | null) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  reset: () => void
  tick: () => void
}

const INITIAL: TimerState = {
  isRunning: false,
  isPaused: false,
  timeRemaining: 0,
  totalTime: 0,
  elapsedSeconds: 0,
  topicId: null,
  questionCount: 0,
}

export const useTimerStore = create<TimerState & TimerActions>((set) => ({
  ...INITIAL,

  startTimer: (topicId, questionCount, secondsPerQuestion) => {
    // A null secondsPerQuestion means "no limit": count up instead of down.
    const total = secondsPerQuestion === null ? 0 : secondsPerQuestion * questionCount
    set({
      ...INITIAL,
      isRunning: true,
      topicId,
      questionCount,
      totalTime: total,
      timeRemaining: total,
    })
  },

  pauseTimer: () => set({ isPaused: true }),
  resumeTimer: () => set({ isPaused: false }),
  stopTimer: () => set({ isRunning: false, isPaused: false }),
  reset: () => set({ ...INITIAL }),

  tick: () =>
    set((state) => {
      if (!state.isRunning || state.isPaused) return state
      const elapsedSeconds = state.elapsedSeconds + 1
      // Count-up mode has no limit and never auto-stops.
      if (state.totalTime === 0) return { ...state, elapsedSeconds }
      const timeRemaining = Math.max(0, state.timeRemaining - 1)
      return {
        ...state,
        elapsedSeconds,
        timeRemaining,
        isRunning: timeRemaining > 0,
      }
    }),
}))
