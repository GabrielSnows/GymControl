import type { ReactNode } from 'react'

type MobileAppShellProps = {
  children: ReactNode
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  return (
    <div className="mobile-viewport">
      <main className="mobile-app">{children}</main>
    </div>
  )
}