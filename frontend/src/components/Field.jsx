import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons'

// Labelled input with an icon, an error message and an optional password toggle
export default function Field({ label, icon, error, hint, type = 'text', ltr = false, ...inputProps }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <div className={`field__control${error ? ' field__control--error' : ''}`}>
        <span className="field__icon">{icon}</span>
        <input
          id={id}
          className={`field__input${ltr ? ' field__input--ltr' : ''}`}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        <span className="field__focus-sweep" aria-hidden="true" />
      </div>
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      {error && <p id={errorId} className="field__error" role="alert">{error}</p>}
    </div>
  )
}
