import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import type { ProfileRow, UserSettingsRow } from '@/types/database.types'
import { updateUserSettings } from '../api'

interface SettingsFormProps {
  profile: ProfileRow
  settings: UserSettingsRow
}

export function SettingsForm({ profile, settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [timezone, setTimezone] = useState(profile.timezone)
  const [timelineWeeks, setTimelineWeeks] = useState(
    profile.target_timeline_weeks?.toString() ?? ''
  )
  const [weeklyHours, setWeeklyHours] = useState(
    (settings.weekly_capacity_minutes / 60).toFixed(1)
  )
  const [planningDays, setPlanningDays] = useState(String(settings.planning_days_per_week))
  const [maxDailyHours, setMaxDailyHours] = useState((settings.max_daily_minutes / 60).toFixed(1))
  const [dsaTarget, setDsaTarget] = useState(String(settings.dsa_weekly_target))
  const [applicationTarget, setApplicationTarget] = useState(
    String(settings.application_daily_target)
  )
  const [notifications, setNotifications] = useState(settings.notifications_enabled)

  function handleSave() {
    setErrors({})
    startTransition(async () => {
      const result = await updateUserSettings({
        display_name: displayName,
        timezone,
        target_timeline_weeks: timelineWeeks === '' ? null : Number(timelineWeeks),
        weekly_capacity_minutes: Math.round(Number(weeklyHours) * 60),
        planning_days_per_week: Number(planningDays),
        max_daily_minutes: Math.round(Number(maxDailyHours) * 60),
        dsa_weekly_target: Number(dsaTarget),
        application_daily_target: Number(applicationTarget),
        notifications_enabled: notifications,
      })

      if ('error' in result) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error('Could not save settings', result.error)
        return
      }
      toast.success('Settings saved', 'Future plans will use the new capacity.')
    })
  }

  const dailyMinutes = Math.floor((Number(weeklyHours) * 60) / Math.max(1, Number(planningDays)))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            {errors.display_name ? (
              <p className="text-xs text-destructive">{errors.display_name[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-timezone">Timezone</Label>
            <Input
              id="settings-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Capacity</CardTitle>
          <CardDescription>
            The planner allocates against these numbers. Changing them re-balances future days
            only — completed work is never rewritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="settings-hours">Hours per week</Label>
              <Input
                id="settings-hours"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
              {errors.weekly_capacity_minutes ? (
                <p className="text-xs text-destructive">{errors.weekly_capacity_minutes[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-days">Study days per week</Label>
              <Select value={planningDays} onValueChange={setPlanningDays}>
                <SelectTrigger id="settings-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-max-daily">Max hours in one day</Label>
              <Input
                id="settings-max-daily"
                type="number"
                min={0.25}
                max={16}
                step={0.5}
                value={maxDailyHours}
                onChange={(e) => setMaxDailyHours(e.target.value)}
              />
            </div>
          </div>

          <p className="rounded-md bg-muted p-3 text-sm">
            About <span className="font-medium tabular-nums">{dailyMinutes} minutes</span> planned
            per study day.
          </p>

          <div className="space-y-2">
            <Label htmlFor="settings-timeline">Target timeline (weeks)</Label>
            <Input
              id="settings-timeline"
              type="number"
              min={1}
              max={104}
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-dsa">DSA problems per week</Label>
              <Input
                id="settings-dsa"
                type="number"
                min={0}
                max={100}
                value={dsaTarget}
                onChange={(e) => setDsaTarget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-applications">Applications per day</Label>
              <Input
                id="settings-applications"
                type="number"
                min={0}
                max={50}
                value={applicationTarget}
                onChange={(e) => setApplicationTarget(e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="settings-notifications" className="flex items-center gap-3 text-sm">
            <Switch
              id="settings-notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            In-app reminders
          </label>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isPending} id="save-settings">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save settings
      </Button>
    </div>
  )
}
