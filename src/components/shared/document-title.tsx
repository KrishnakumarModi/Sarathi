import { useEffect } from 'react'

import { APP_NAME } from '@/lib/constants'

/**
 * The replacement for the App Router's `metadata` export.
 *
 * Same template: "Page · AI Career OS", with the bare app name on the root.
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
    return () => {
      document.title = APP_NAME
    }
  }, [title])
}
