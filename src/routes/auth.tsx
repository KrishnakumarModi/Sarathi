import { useDocumentTitle } from '@/components/shared/document-title'
import { LoginForm } from '@/features/settings/components/login-form'
import { SignupForm } from '@/features/settings/components/signup-form'

export function LoginPage() {
  useDocumentTitle('Log in')
  return <LoginForm />
}

export function SignupPage() {
  useDocumentTitle('Create account')
  return <SignupForm />
}
