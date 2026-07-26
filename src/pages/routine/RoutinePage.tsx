import {
  ChevronRight,
  Dumbbell,
  Layers3,
  Plus,
} from 'lucide-react'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { WorkoutFormSheet } from '../../components/workout/WorkoutFormSheet'
import {
  createWorkoutDefinition,
  getStoredWorkoutExercises,
  getWorkoutDefinitions,
} from '../../services/storage/workoutStorage'
import type { WorkoutDefinition } from '../../types/workout'

type WorkoutSummary = WorkoutDefinition & {
  exerciseCount: number
}

export function RoutinePage() {
  const navigate = useNavigate()

  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadRoutine = useCallback(async () => {
    try {
      setIsLoading(true)

      const definitions = await getWorkoutDefinitions()

      const summaries = await Promise.all(
        definitions.map(async (definition) => {
          const exercises = await getStoredWorkoutExercises(
            definition.id,
          )

          return {
            ...definition,
            exerciseCount: exercises.length,
          }
        }),
      )

      setWorkouts(summaries)
      setHasError(false)
    } catch (error) {
      console.error(
        'Não foi possível carregar a rotina.',
        error,
      )

      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRoutine()
  }, [loadRoutine])

  function openCreateForm() {
    setIsFormOpen(true)
  }

  function closeCreateForm() {
    setIsFormOpen(false)
  }

  async function createWorkout(values: {
    name: string
    description: string
  }) {
    const newWorkout = await createWorkoutDefinition(
      values.name,
      values.description,
    )

    closeCreateForm()

    navigate(`/rotina/${newWorkout.id}`)
  }

  return (
    <>
      <Screen
        eyebrow="Sua organização"
        title="Rotina"
        description="Monte seus treinos e siga a sequência no seu próprio ritmo."
        action={
          <button
            type="button"
            className="gc-icon-button"
            aria-label="Criar novo treino"
            onClick={openCreateForm}
          >
            <Plus size={21} strokeWidth={2.1} />
          </button>
        }
      >
        {hasError && (
          <div className="workout-storage-warning" role="status">
            Não foi possível carregar os treinos salvos neste
            aparelho.
          </div>
        )}

        {isLoading ? (
          <div
            className="routine-loading"
            aria-label="Carregando rotina"
          >
            {[1, 2, 3].map((item) => (
              <div className="routine-loading__card" key={item}>
                <span className="routine-loading__icon" />

                <div className="routine-loading__content">
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <section className="routine-empty">
            <div
              className="routine-empty__icon"
              aria-hidden="true"
            >
              <Layers3 size={31} strokeWidth={1.8} />
            </div>

            <h2>Crie seu primeiro treino</h2>

            <p>
              Organize sua divisão e adicione os exercícios que fará
              na academia.
            </p>

            <Button
              leadingIcon={
                <Plus size={19} strokeWidth={2.2} />
              }
              onClick={openCreateForm}
            >
              Criar treino
            </Button>
          </section>
        ) : (
          <div className="routine-list">
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                interactive
                className="routine-workout-card"
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/rotina/${workout.id}`)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault()
                    navigate(`/rotina/${workout.id}`)
                  }
                }}
              >
                <div className="routine-workout-card__code">
                  {workout.code}
                </div>

                <div className="routine-workout-card__content">
                  <p className="routine-workout-card__eyebrow">
                    Treino {workout.code}
                  </p>

                  <h2>{workout.name}</h2>

                  <div className="routine-workout-card__meta">
                    <span>
                      <Dumbbell size={15} strokeWidth={2} />

                      {workout.exerciseCount}{' '}
                      {workout.exerciseCount === 1
                        ? 'exercício'
                        : 'exercícios'}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className="routine-workout-card__arrow"
                  size={21}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Card>
            ))}
          </div>
        )}

        {workouts.length > 0 && (
          <Card
            variant="subtle"
            className="routine-sequence-card"
          >
            <div className="routine-sequence-card__icon">
              <Layers3 size={22} strokeWidth={2} />
            </div>

            <div>
              <h2>Sequência dos treinos</h2>

              <p>
                O GymControl seguirá os treinos em ordem, sem
                prendê-los aos dias da semana.
              </p>
            </div>
          </Card>
        )}
      </Screen>

      {isFormOpen && (
        <WorkoutFormSheet
          onClose={closeCreateForm}
          onSave={createWorkout}
        />
      )}
    </>
  )
}