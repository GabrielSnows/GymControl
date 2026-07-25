import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
  trailingElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      hint,
      error,
      leadingIcon,
      trailingElement,
      className = '',
      id,
      disabled,
      ...props
    },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const messageId = `${inputId}-message`

    const containerClasses = [
      'gc-input',
      error ? 'gc-input--error' : '',
      disabled ? 'gc-input--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={containerClasses}>
        <label className="gc-input__label" htmlFor={inputId}>
          {label}
        </label>

        <div className="gc-input__control">
          {leadingIcon && (
            <span className="gc-input__icon" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            disabled={disabled}
            className="gc-input__field"
            aria-invalid={Boolean(error)}
            aria-describedby={hint || error ? messageId : undefined}
          />

          {trailingElement && (
            <span className="gc-input__trailing">
              {trailingElement}
            </span>
          )}
        </div>

        {(error || hint) && (
          <p
            id={messageId}
            className={
              error
                ? 'gc-input__message gc-input__message--error'
                : 'gc-input__message'
            }
          >
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)