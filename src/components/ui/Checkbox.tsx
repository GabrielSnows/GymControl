import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      id,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) {
    const generatedId = useId()
    const checkboxId = id ?? generatedId

    const checkboxClasses = [
      'gc-checkbox',
      disabled ? 'gc-checkbox--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <label className={checkboxClasses} htmlFor={checkboxId}>
        <span className="gc-checkbox__control">
          <input
            {...props}
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className="gc-checkbox__input"
          />

          <span className="gc-checkbox__visual" aria-hidden="true">
            <svg
              viewBox="0 0 16 16"
              className="gc-checkbox__check"
              focusable="false"
            >
              <path d="M3.5 8.2 6.7 11.3 12.7 4.9" />
            </svg>
          </span>
        </span>

        <span className="gc-checkbox__label">{label}</span>
      </label>
    )
  },
)