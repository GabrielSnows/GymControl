import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Layers3,
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
import {
  getStoredWorkoutExercises,
  getWorkoutDefinitions,
  getWorkoutProgress,
} from '../../services/storage/workoutStorage'
import type { WorkoutDefinition } from '../../types/workout'

type NextWorkout = WorkoutDefinition & {
  exerciseCount: number
}

export function WorkoutsPage() {
  const navigate = useNavigate()

  const [nextWorkout, setNextWorkout] =
    useState<NextWorkout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadNextWorkout = useCallback(async () => {
    try {
      setIsLoading(true)

      const [workouts, progress] = await Promise.all([
        getWorkoutDefinitions(),
        getWorkoutProgress(),
      ])

      const selectedWorkout =
        workouts.find(
          (workout) => workout.id === progress.nextWorkoutId,
        ) ?? workouts[0]

      if (!selectedWorkout) {
        setNextWorkout(null)
        setHasError(false)
        return
      }

      const exercises = await getStoredWorkoutExercises(
        selectedWorkout.id,
      )

      setNextWorkout({
        ...selectedWorkout,
        exerciseCount: exercises.length,
      })

      setHasError(false)
    } catch (error) {
      console.error(
        'Não foi possível carregar o próximo treino.',
        error,
      )

      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNextWorkout()
  }, [loadNextWorkout])

  return (
    <Screen
      eyebrow="Seu treino"
      title="Vamos treinar?"
      description="Continue sua sequência de onde parou."
    >
      {hasError && (
        <div className="workout-storage-warning" role="status">
          Não foi possível carregar o próximo treino.
        </div>
      )}

      {isLoading ? (
        <section
          className="workouts-home-loading"
          aria-label="Carregando próximo treino"
        >
          <span />
          <span />
          <span />
        </section>
      ) : !nextWorkout ? (
        <section className="workouts-home-empty">
          <div
            className="workouts-home-empty__icon"
            aria-hidden="true"
          >
            <Layers3 size={31} strokeWidth={1.8} />
          </div>

          <h2>Você ainda não possui treinos</h2>

          <p>
            Crie sua rotina antes de iniciar um treino na academia.
          </p>

          <Button onClick={() => navigate('/rotina')}>
            Criar rotina
          </Button>
        </section>
      ) : (
        <>
          <Card className="next-workout-card">
            <div className="next-workout-card__top">
              <div className="next-workout-card__code">
                {nextWorkout.code}
              </div>

              <span className="next-workout-card__status">
                Próximo treino
              </span>
            </div>

            <div className="next-workout-card__content">
              <p>Treino {nextWorkout.code}</p>

              <h2>{nextWorkout.name}</h2>

              <span>
                <Dumbbell size={16} strokeWidth={2} />

                {nextWorkout.exerciseCount}{' '}
                {nextWorkout.exerciseCount === 1
                  ? 'exercício'
                  : 'exercícios'}
              </span>
            </div>

            <Button
              fullWidth
              trailingIcon={
                <ArrowRight size={19} strokeWidth={2.2} />
              }
              disabled={nextWorkout.exerciseCount === 0}
              onClick={() =>
                navigate(`/treinos/${nextWorkout.id}/executar`)
              }
            >
              Iniciar treino
            </Button>

            {nextWorkout.exerciseCount === 0 && (
              <button
                type="button"
                className="next-workout-card__configure"
                onClick={() =>
                  navigate(`/rotina/${nextWorkout.id}`)
                }
              >
                Adicionar exercícios a este treino
              </button>
            )}
          </Card>

          <Card
            variant="subtle"
            className="workouts-home-sequence"
          >
            <CheckCircle2 size={22} strokeWidth={2} />

            <div>
              <h2>Sequência automática</h2>

              <p>
                Ao concluir este treino, o próximo da rotina será
                selecionado automaticamente.
              </p>
            </div>
          </Card>
        </>
      )}
    </Screen>
  )
}