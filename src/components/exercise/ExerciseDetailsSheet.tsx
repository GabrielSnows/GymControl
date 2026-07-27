import {
  Activity,
  ArrowLeft,
  Check,
  Dumbbell,
  ExternalLink,
  Gauge,
  Layers3,
  Repeat2,
  Target,
} from 'lucide-react'

import type { Exercise } from '../../types/exercise'
import { Button } from '../ui/Button'
import { ExerciseGif } from './ExerciseGif'

type ExerciseDetailsSheetProps = {
  exercise: Exercise
  onBack: () => void
  onAdd: (exercise: Exercise) => void
}

function formatMetadataValue(value?: string) {
  const normalizedValue = value?.trim()

  if (!normalizedValue || normalizedValue === 'Não informado') {
    return 'Não informado'
  }

  return normalizedValue
}

function formatExerciseMechanic(mechanic?: string) {
  const normalizedMechanic = mechanic?.trim().toLowerCase()

  if (normalizedMechanic === 'compound') {
    return 'Composto'
  }

  if (normalizedMechanic === 'isolation') {
    return 'Isolado'
  }

  return formatMetadataValue(mechanic)
}

function formatDifficulty(difficulty?: string) {
  const normalizedDifficulty = difficulty?.trim().toLowerCase()

  if (normalizedDifficulty === 'beginner') {
    return 'Iniciante'
  }

  if (normalizedDifficulty === 'intermediate') {
    return 'Intermediário'
  }

  if (normalizedDifficulty === 'advanced') {
    return 'Avançado'
  }

  return formatMetadataValue(difficulty)
}

function getRecommendedSeries(exercise: Exercise) {
  const recommendedSets = exercise.recommendedSets?.trim()
  const recommendedReps = exercise.recommendedReps?.trim()

  if (recommendedSets && recommendedReps) {
    return `${recommendedSets}x ${recommendedReps}`
  }

  if (recommendedSets) {
    return `${recommendedSets}x 8-12`
  }

  if (recommendedReps) {
    return `3x ${recommendedReps}`
  }

  return '3x 8-12'
}

export function ExerciseDetailsSheet({
  exercise,
  onBack,
  onAdd,
}: ExerciseDetailsSheetProps) {
  const recommendedSeries = getRecommendedSeries(exercise)

  const metadata = [
    {
      label: 'Músculo',
      value: formatMetadataValue(exercise.muscle),
      icon: Target,
    },
    {
      label: 'Equipamento',
      value: formatMetadataValue(exercise.equipment),
      icon: Dumbbell,
    },
    {
      label: 'Região',
      value: formatMetadataValue(exercise.bodyPart),
      icon: Activity,
    },
    {
      label: 'Dificuldade',
      value: formatDifficulty(exercise.difficulty),
      icon: Gauge,
    },
    {
      label: 'Tipo',
      value: formatExerciseMechanic(exercise.mechanic),
      icon: Layers3,
    },
    {
      label: 'Sugestão',
      value: recommendedSeries,
      icon: Repeat2,
    },
  ]

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
          <ExerciseGif
            exercise={exercise}
            className="exercise-details__media"
            fallbackLabel="Não foi possível carregar o GIF"
          />

          <header className="exercise-details__heading">
            <p>{exercise.muscle}</p>

            <h1 id="exercise-details-title">
              {exercise.name}
            </h1>

            <span>{exercise.equipment}</span>
          </header>

          <section
            className="exercise-details-metadata"
            aria-label="Informações do exercício"
          >
            {metadata.map((item) => {
              const Icon = item.icon

              return (
                <article
                  key={item.label}
                  className="exercise-details-metadata__item"
                >
                  <div className="exercise-details-metadata__icon">
                    <Icon
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </article>
              )
            })}
          </section>

          <aside className="exercise-details-recommendation">
            <div className="exercise-details-recommendation__icon">
              <Repeat2
                size={21}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            <div>
              <span>Sugestão inicial da WorkoutX</span>

              <strong>{recommendedSeries}</strong>

              <p>
                Você poderá editar livremente as séries e
                repetições depois de adicionar o exercício.
              </p>
            </div>
          </aside>

          <section className="exercise-details__section">
            <h2>Sobre o exercício</h2>

            <p>{exercise.description}</p>
          </section>

          <section className="exercise-details__section">
            <h2>Como executar</h2>

            {exercise.instructions.length > 0 ? (
              <ol className="exercise-instructions">
                {exercise.instructions.map(
                  (instruction, index) => (
                    <li key={`${index}-${instruction}`}>
                      <span className="exercise-instructions__check">
                        <Check
                          size={15}
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </span>

                      <p>{instruction}</p>
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p>
                A WorkoutX ainda não forneceu instruções detalhadas
                para este exercício.
              </p>
            )}
          </section>

          {exercise.secondaryMuscles.length > 0 && (
            <section className="exercise-details__section">
              <h2>Músculos secundários</h2>

              <div className="exercise-secondary-muscles">
                {exercise.secondaryMuscles.map((muscle) => (
                  <span key={muscle}>{muscle}</span>
                ))}
              </div>
            </section>
          )}

          {exercise.muscleWikiUrl && (
            <a
              className="exercise-details__musclewiki"
              href={exercise.muscleWikiUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir ${exercise.name} no MuscleWiki`}
            >
              <ExternalLink
                size={19}
                strokeWidth={2}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Ver execução no MuscleWiki
                </strong>

                <span>
                  Abrir o guia complementar deste exercício.
                </span>
              </div>
            </a>
          )}
        </div>

        <footer className="exercise-details__footer">
          <Button
            fullWidth
            onClick={() => onAdd(exercise)}
          >
            Adicionar ao treino
          </Button>
        </footer>
      </section>
    </div>
  )
}