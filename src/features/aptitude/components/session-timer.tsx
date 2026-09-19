import { useEffect } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimerStore } from '@/stores/use-timer-store'

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function SessionTimer({ onStop }: { onStop: (elapsedSeconds: number) => void }) {
  const { isRunning, isPaused, timeRemaining, totalTime, elapsedSeconds, questionCount, tick, pauseTimer, resumeTimer, stopTimer } =
    useTimerStore()

  useEffect(() => {
    if (!isRunning || isPaused) return
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [isRunning, isPaused, tick])

  // A countdown that reaches zero ends the session and opens the log form.
  useEffect(() => {
    if (totalTime > 0 && timeRemaining === 0 && !isRunning) {
      onStop(elapsedSeconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isRunning, totalTime])

  const isCountdown = totalTime > 0
  const display = isCountdown ? timeRemaining : elapsedSeconds

  return (
    <div className="space-y-4 text-center">
      <div>
        <div className="text-5xl font-bold tabular-nums" role="timer" aria-live="off">
          {formatClock(display)}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {isCountdown
            ? `${questionCount} questions · ${Math.round(totalTime / questionCount)}s each`
            : `${questionCount} questions · no time limit`}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {isPaused ? (
          <Button variant="outline" onClick={resumeTimer}>
            <Play className="h-4 w-4" />
            Resume
          </Button>
        ) : (
          <Button variant="outline" onClick={pauseTimer} disabled={!isRunning}>
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        <Button
          onClick={() => {
            stopTimer()
            onStop(elapsedSeconds)
          }}
        >
          <Square className="h-4 w-4" />
          Stop and log
        </Button>
      </div>
    </div>
  )
}
