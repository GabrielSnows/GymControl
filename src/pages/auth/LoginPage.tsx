import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '../../components/auth/AuthLayout'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Input } from '../../components/ui/Input'

export function LoginPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [keepConnected, setKeepConnected] = useState(true)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    navigate('/treinos')
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      description="Entre na sua conta para continuar de onde parou."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__fields">
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
            placeholder="Digite sua senha"
            autoComplete="current-password"
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
        </div>

        <Checkbox
          checked={keepConnected}
          onChange={(event) =>
            setKeepConnected(event.target.checked)
          }
          label="Manter conectado"
        />

        <Button type="submit" fullWidth>
          Entrar
        </Button>
      </form>

      <footer className="auth-footer">
        <span>Ainda não tem uma conta?</span>

        <Link className="auth-footer__link" to="/cadastro">
          Criar conta
        </Link>
      </footer>
    </AuthLayout>
  )
}