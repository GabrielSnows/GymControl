import {
  ArrowLeft,
  Check,
  Dumbbell,
  ExternalLink,
} from 'lucide-react'

import type { Exercise } from '../../types/exercise'
import { Button } from '../ui/Button'

type ExerciseDetailsSheetProps = {
  exercise: Exercise
  onBack: () => void
  onAdd: (exercise: Exercise) => void
}

export function ExerciseDetailsSheet({
  exercise,
  onBack,
  onAdd,
}: ExerciseDetailsSheetProps) {
  return (
    <div
      className="exercise-sheet-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-details-title"
    >
      <section className="exercise-sheet exercise-details">
        <header className="exercise-details__navigation">
          <button
            type="button"
            className="exercise-sheet__close"
            aria-label="Voltar para a pesquisa"
            onClick={onBack}
          >
            <ArrowLeft size={21} strokeWidth={2.1} />
          </button>

          <span>Detalhes do exercício</span>

          <div className="exercise-details__navigation-space" />
        </header>

        <div className="exercise-details__scroll">
          <div className="exercise-media-placeholder">
            <div
              className="exercise-media-placeholder__animation"
              aria-hidden="true"
            >
              <Dumbbell size={52} strokeWidth={1.55} />
            </div>

            <span>Área reservada para o GIF</span>
          </div>

          <header className="exercise-details__heading">
            <p>{exercise.muscle}</p>

            <h1 id="exercise-details-title">{exercise.name}</h1>

            <span>{exercise.equipment}</span>
          </header>

          <section className="exercise-details__section">
            <h2>Sobre o exercício</h2>

            <p>{exercise.description}</p>
          </section>

          <section className="exercise-details__section">
            <h2>Como executar</h2>

            <ol className="exercise-instructions">
              {exercise.instructions.map((instruction) => (
                <li key={instruction}>
                  <span className="exercise-instructions__check">
                    <Check size={15} strokeWidth={2.5} />
                  </span>

                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="exercise-details__musclewiki">
            <ExternalLink size={19} strokeWidth={2} />

            <div>
              <strong>Guia completo no MuscleWiki</strong>

              <span>
                O link individual será conectado junto à biblioteca final.
              </span>
            </div>
          </div>
        </div>

        <footer className="exercise-details__footer">
          <Button fullWidth onClick={() => onAdd(exercise)}>
            Adicionar ao treino
          </Button>
        </footer>
      </section>
    </div>
  )
}