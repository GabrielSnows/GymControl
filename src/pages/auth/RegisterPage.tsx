import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function RegisterPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    navigate('/treinos')
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      description="Organize seus treinos e mantenha suas cargas sempre disponíveis."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__fields">
          <Input
            label="Nome de usuário"
            name="username"
            type="text"
            placeholder="Como podemos chamar você?"
            autoComplete="username"
            required
            leadingIcon={<UserRound size={19} strokeWidth={2} />}
          />

          <Input
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            leadingIcon={<Mail size={19} strokeWidth={2} />}
          />

          <Input
            label="Senha"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            minLength={6}
            required
            leadingIcon={<LockKeyhole size={19} strokeWidth={2} />}
            trailingElement={
              <button
                type="button"
                className="gc-input-action"
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff size={19} strokeWidth={2} />
                ) : (
                  <Eye size={19} strokeWidth={2} />
                )}
              </button>
            }
          />

          <Input
            label="Confirmar senha"
            name="passwordConfirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            placeholder="Digite novamente"
            autoComplete="new-password"
            minLength={6}
            required
            leadingIcon={<LockKeyhole size={19} strokeWidth={2} />}
            trailingElement={
              <button
                type="button"
                className="gc-input-action"
                aria-label={
                  showPasswordConfirmation
                    ? 'Ocultar confirmação de senha'
                    : 'Mostrar confirmação de senha'
                }
                aria-pressed={showPasswordConfirmation}
                onClick={() =>
                  setShowPasswordConfirmation((current) => !current)
                }
              >
                {showPasswordConfirmation ? (
                  <EyeOff size={19} strokeWidth={2} />
                ) : (
                  <Eye size={19} strokeWidth={2} />
                )}
              </button>
            }
          />
        </div>

        <Button type="submit" fullWidth>
          Criar conta
        </Button>
      </form>

      <footer className="auth-footer">
        <span>Já possui uma conta?</span>

        <Link className="auth-footer__link" to="/login">
          Entrar
        </Link>
      </footer>
    </AuthLayout>
  )
}