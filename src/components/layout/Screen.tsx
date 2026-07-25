import type { ReactNode } from 'react'

type ScreenProps = {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function Screen({
  children,
  title,
  eyebrow,
  description,
  action,
  className = '',
}: ScreenProps) {
  const screenClasses = ['gc-screen', className]
    .filter(Boolean)
    .join(' ')

  const hasHeader = title || eyebrow || description || action

  return (
    <section className={screenClasses}>
      {hasHeader && (
        <header className="gc-screen__header">
          <div className="gc-screen__heading">
            {eyebrow && (
              <p className="gc-screen__eyebrow">{eyebrow}</p>
            )}

            {title && <h1 className="gc-screen__title">{title}</h1>}

            {description && (
              <p className="gc-screen__description">{description}</p>
            )}
          </div>

          {action && (
            <div className="gc-screen__action">{action}</div>
          )}
        </header>
      )}

      <div className="gc-screen__content">{children}</div>
    </section>
  )
}