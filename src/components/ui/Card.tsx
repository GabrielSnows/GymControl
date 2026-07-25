import type {
  HTMLAttributes,
  ReactNode,
} from 'react'

type CardVariant = 'default' | 'subtle' | 'glass'

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  variant?: CardVariant
  interactive?: boolean
  as?: 'article' | 'section' | 'div'
}

export function Card({
  children,
  variant = 'default',
  interactive = false,
  as: Component = 'article',
  className = '',
  ...props
}: CardProps) {
  const cardClasses = [
    'gc-card',
    `gc-card--${variant}`,
    interactive ? 'gc-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={cardClasses} {...props}>
      {children}
    </Component>
  )
}