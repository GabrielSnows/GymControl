import {
  ArrowRight,
  Dumbbell,
  Eye,
  Mail,
  Plus,
  Settings,
} from 'lucide-react'

import { Screen } from '../components/layout/Screen'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function DesignSystemPage() {
  return (
    <Screen
      eyebrow="GymControl"
      title="Design System"
      description="Fundação visual mobile da versão 1.0."
      action={
        <button
          type="button"
          className="gc-icon-button"
          aria-label="Abrir ajustes"
        >
          <Settings size={21} strokeWidth={2} />
        </button>
      }
    >
      <section className="design-section">
        <div className="design-section__header">
          <h2 className="design-section__title">Botões</h2>
          <p className="design-section__description">
            Estados principais usados em todo o aplicativo.
          </p>
        </div>

        <div className="design-stack">
          <Button
            fullWidth
            trailingIcon={<ArrowRight size={19} />}
          >
            Iniciar treino
          </Button>

          <Button
            fullWidth
            variant="secondary"
            leadingIcon={<Plus size={19} />}
          >
            Adicionar exercício
          </Button>

          <Button fullWidth variant="ghost">
            Ver guia completo
          </Button>
        </div>
      </section>

      <section className="design-section">
        <div className="design-section__header">
          <h2 className="design-section__title">Campos</h2>
          <p className="design-section__description">
            Inputs preparados para toque e teclado mobile.
          </p>
        </div>

        <div className="design-stack">
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            leadingIcon={<Mail size={19} />}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            trailingElement={
              <button
                type="button"
                className="gc-input-action"
                aria-label="Mostrar senha"
              >
                <Eye size={19} />
              </button>
            }
          />

          <Input
            label="Carga"
            type="number"
            inputMode="decimal"
            placeholder="80"
            hint="Peso utilizado no exercício, em quilogramas."
          />
        </div>
      </section>

      <section className="design-section">
        <div className="design-section__header">
          <h2 className="design-section__title">Cards</h2>
          <p className="design-section__description">
            Superfícies para treinos, exercícios e informações.
          </p>
        </div>

        <div className="design-stack">
          <Card interactive className="design-workout-card">
            <div className="design-workout-card__icon">
              <Dumbbell size={25} strokeWidth={2} />
            </div>

            <div className="design-workout-card__content">
              <span className="design-workout-card__eyebrow">
                Próximo treino
              </span>

              <h3 className="design-workout-card__title">
                Treino C
              </h3>

              <p className="design-workout-card__description">
                Pernas · 6 exercícios
              </p>
            </div>

            <ArrowRight
              className="design-workout-card__arrow"
              size={21}
            />
          </Card>

          <Card variant="subtle">
            <p className="design-card-label">Séries</p>
            <strong className="design-card-value">3x 8–12</strong>
          </Card>

          <Card variant="glass">
            <p className="design-card-label">Progresso</p>
            <strong className="design-card-value">
              2 de 6 concluídos
            </strong>
          </Card>
        </div>
      </section>
    </Screen>
  )
}