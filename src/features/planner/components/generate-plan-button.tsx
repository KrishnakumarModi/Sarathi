import { useState, useTransition } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { generateDailyPlanAction } from '../api'

const ENERGY_LABELS: Record<string, string> = {
  '1': 'Running on empty',
  '2': 'Low',
  '3': 'Normal',
  '4': 'Good',
  '5': 'Sharp',
}

export function GeneratePlanButton({ hasPlan }: { hasPlan: boolean }) {
  const [open, setOpen] = useState(false)
  const [energy, setEnergy] = useState('3')
  const [focus, setFocus] = useState('3')
  const [isPending, startTransition] = useTransition()
  const { isOnline } = useOnlineStatus()

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateDailyPlanAction({
        energy_level: Number(energy),
        focus_level: Number(focus),
      })

      if ('error' in result) {
        toast.error('Could not generate a plan', result.error)
        return
      }

      const data = result.data
      setOpen(false)
      toast.success(
        `${data?.taskCount ?? 0} tasks planned`,
        data?.backlogSize
          ? `${data.backlogSize} item${data.backlogSize === 1 ? '' : 's'} still in your backlog.`
          : undefined
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="generate-plan" disabled={!isOnline}>
          <Sparkles className="h-4 w-4" />
          {hasPlan ? 'Regenerate plan' : 'Generate plan'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan today</DialogTitle>
          <DialogDescription>
            How you feel changes what gets scheduled. On a low-energy day the harder work is held
            back rather than set up to fail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="energy-level">Energy</Label>
            <Select value={energy} onValueChange={setEnergy}>
              <SelectTrigger id="energy-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENERGY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {value} · {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus-level">Focus</Label>
            <Select value={focus} onValueChange={setFocus}>
              <SelectTrigger id="focus-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['1', '2', '3', '4', '5'].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasPlan ? (
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Regenerating keeps anything you have already started or finished today.
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? 'Planning...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
