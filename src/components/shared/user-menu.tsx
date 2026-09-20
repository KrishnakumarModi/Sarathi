import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRouter } from '@/hooks/use-navigation'
import { logout } from '@/features/settings/api'

interface UserMenuProps {
  displayName: string | null
  email: string
}

export function UserMenu({ displayName, email }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await logout()
    router.push('/login')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu" id="account-menu">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{displayName ?? 'Your account'}</DialogTitle>
          <DialogDescription>{email}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" asChild onClick={() => setOpen(false)}>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleSignOut} disabled={signingOut} id="sign-out">
            <LogOut className="h-4 w-4" />
            {signingOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
