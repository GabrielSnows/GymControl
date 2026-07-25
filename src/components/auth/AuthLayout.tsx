import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  description: string
}

export function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <section className="auth-layout">
      <header className="auth-layout__brand">
        <div className="auth-logo" aria-hidden="true">
          <div className="auth-logo__ring">
            <div className="auth-logo__dumbbell">
              <span className="auth-logo__weight auth-logo__weight--small" />
              <span className="auth-logo__weight auth-logo__weight--large" />
              <span className="auth-logo__bar" />
              <span className="auth-logo__weight auth-logo__weight--large" />
              <span className="auth-logo__weight auth-logo__weight--small" />
            </div>
          </div>
        </div>

        <div className="auth-layout__brand-name">
          <strong>Gym</strong>
          <span>Control</span>
        </div>
      </header>

      <div className="auth-layout__heading">
        <h1 className="auth-layout__title">{title}</h1>

        <p className="auth-layout__description">{description}</p>
      </div>

      <div className="auth-layout__content">{children}</div>
    </section>
  )
}