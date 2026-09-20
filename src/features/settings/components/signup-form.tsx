import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/hooks/use-navigation'
import { signup } from '@/features/settings/api'
import { signupSchema } from '@/features/settings/validators'

export function SignupForm() {
  const router = useRouter()
  const [values, setValues] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function update(field: keyof typeof values) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const parsed = signupSchema.safeParse(values)
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

    const result = await signup(parsed.data)

    if ('error' in result) {
      setFormError(result.error)
      setPending(false)
      return
    }

    // With email confirmation enabled there is no session yet; the profile
    // already exists, so first login just works.
    if (result.data && 'confirmationRequired' in result.data) {
      setPending(false)
      setFormError('Check your email to confirm your account, then log in.')
      return
    }

    router.push('/onboarding')
  }

  const fields = [
    { id: 'displayName', label: 'Name', type: 'text', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { id: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
    {
      id: 'confirmPassword',
      label: 'Confirm password',
      type: 'password',
      autoComplete: 'new-password',
    },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Set up your plan in a couple of minutes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {fields.map(({ id, label, type, autoComplete }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                name={id}
                type={type}
                autoComplete={autoComplete}
                value={values[id]}
                onChange={update(id)}
                aria-invalid={Boolean(errors[id])}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
                required
              />
              {errors[id] ? (
                <p id={`${id}-error`} className="text-xs text-destructive">
                  {errors[id]}
                </p>
              ) : null}
            </div>
          ))}

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending} id="signup-submit">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
