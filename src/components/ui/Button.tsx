import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'compact'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  isLoading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  leadingIcon,
  trailingIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const buttonClasses = [
    'gc-button',
    `gc-button--${variant}`,
    `gc-button--${size}`,
    fullWidth ? 'gc-button--full-width' : '',
    isLoading ? 'gc-button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="gc-button__spinner" aria-hidden="true" />
          <span>Carregando</span>
        </>
      ) : (
        <>
          {leadingIcon && (
            <span className="gc-button__icon" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <span className="gc-button__label">{children}</span>

          {trailingIcon && (
            <span className="gc-button__icon" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
}