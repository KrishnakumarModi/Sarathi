import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

/**
 * Tracks navigator.onLine. Mutations are disabled while offline and the user
 * is told when connectivity returns (realtime/README.md).
 */
export function useOnlineStatus() {
  // Always start optimistic so server and client markup agree; the effect
  // corrects it immediately after mount.
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOnline() {
      setIsOnline(true)
      toast.success('Back online', 'Syncing your latest changes.')
    }
    function handleOffline() {
      setIsOnline(false)
      toast.warning('You are offline', 'Changes will sync when you reconnect.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
