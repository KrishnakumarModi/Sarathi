import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from '@/hooks/use-navigation'
import { login } from '@/features/settings/api'
import { loginSchema } from '@/features/settings/validators'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setPending(true)

    const result = await login(parsed.data)

    if ('error' in result) {
      // Deliberately generic: do not reveal whether the account exists.
      setFormError('Invalid email or password.')
      setPending(false)
      return
    }

    // Land wherever the user was headed, or wherever onboarding says to go.
    const next = searchParams.get('next') ?? result.data?.post_auth_redirect ?? '/dashboard'
    router.push(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />
            {errors.email ? (
              <p id="email-error" className="text-xs text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              required
            />
            {errors.password ? (
              <p id="password-error" className="text-xs text-destructive">
                {errors.password}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending} id="login-submit">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
