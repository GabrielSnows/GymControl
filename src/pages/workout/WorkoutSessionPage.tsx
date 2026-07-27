import {
  ArrowLeft,
  CalendarDays,
  Check,
  ExternalLink,
  History,
  Repeat2,
  Weight,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { ExerciseGif } from '../../components/exercise/ExerciseGif'
import { Button } from '../../components/ui/Button'
import {
  completeWorkout,
  getExerciseHistories,
  getExerciseHistoryId,
  getStoredWorkoutExercises,
  getWorkoutDefinition,
  saveExerciseHistories,
  saveWorkoutExercises,
} from '../../services/storage/workoutStorage'
import type { WorkoutExercise } from '../../types/exercise'
import type { ExerciseHistory } from '../../types/exerciseHistory'
import type { WorkoutDefinition } from '../../types/workout'

function formatRelativeDate(dateValue: string) {
  const completedDate = new Date(dateValue)

  if (Number.isNaN(completedDate.getTime())) {
    return 'Data indisponível'
  }

  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const completedDay = new Date(
    completedDate.getFullYear(),
    completedDate.getMonth(),
    completedDate.getDate(),
  )

  const differenceInDays = Math.floor(
    (today.getTime() - completedDay.getTime()) /
      86_400_000,
  )

  if (differenceInDays <= 0) {
    return 'Hoje'
  }

  if (differenceInDays === 1) {
    return 'Ontem'
  }

  if (differenceInDays < 7) {
    return `há ${differenceInDays} dias`
  }

  if (differenceInDays < 30) {
    const weeks = Math.floor(differenceInDays / 7)

    return weeks === 1
      ? 'há 1 semana'
      : `há ${weeks} semanas`
  }

  return completedDate.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
    },
  )
}

export function WorkoutSessionPage() {
  const navigate = useNavigate()
  const { workoutId } = useParams()

  const [workout, setWorkout] =
    useState<WorkoutDefinition | null>(null)

  const [exercises, setExercises] = useState<
    WorkoutExercise[]
  >([])

  const [exerciseHistories, setExerciseHistories] =
    useState<Record<string, ExerciseHistory>>({})

  const [
    completedExerciseIds,
    setCompletedExerciseIds,
  ] = useState<string[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isFinishing, setIsFinishing] =
    useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadWorkoutSession() {
      if (!workoutId) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      const currentWorkoutId = workoutId

      try {
        const [definition, storedExercises] =
          await Promise.all([
            getWorkoutDefinition(currentWorkoutId),
            getStoredWorkoutExercises(
              currentWorkoutId,
            ),
          ])

        if (!isMounted) {
          return
        }

        if (
          !definition ||
          storedExercises.length === 0
        ) {
          setNotFound(true)
          return
        }

        const histories =
          await getExerciseHistories(
            storedExercises,
          )

        if (!isMounted) {
          return
        }

        const preparedExercises =
          storedExercises.map(
            (workoutExercise) => {
              const historyId =
                getExerciseHistoryId(
                  workoutExercise.exercise,
                )

              const history = histories[historyId]

              if (!history) {
                return workoutExercise
              }

              return {
                ...workoutExercise,
                weight: history.lastWeight,
              }
            },
          )

        setWorkout(definition)
        setExerciseHistories(histories)
        setExercises(preparedExercises)
      } catch (error) {
        console.error(
          'Não foi possível iniciar o treino.',
          error,
        )

        if (isMounted) {
          setNotFound(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadWorkoutSession()

    return () => {
      isMounted = false
    }
  }, [workoutId])

  const completedCount =
    completedExerciseIds.length

  const progressPercentage = useMemo(() => {
    if (exercises.length === 0) {
      return 0
    }

    return Math.round(
      (completedCount / exercises.length) * 100,
    )
  }, [completedCount, exercises.length])

  const allExercisesCompleted =
    exercises.length > 0 &&
    completedCount === exercises.length

  function toggleExercise(
    workoutExerciseId: string,
  ) {
    setCompletedExerciseIds((currentIds) =>
      currentIds.includes(workoutExerciseId)
        ? currentIds.filter(
            (exerciseId) =>
              exerciseId !== workoutExerciseId,
          )
        : [...currentIds, workoutExerciseId],
    )
  }

  function updateExercise(
    workoutExerciseId: string,
    field: 'series' | 'weight',
    value: string,
  ) {
    setExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise,
      ),
    )
  }

  async function finishWorkout() {
    if (!workout || !allExercisesCompleted) {
      return
    }

    try {
      setIsFinishing(true)

      const completedAt =
        new Date().toISOString()

      await saveWorkoutExercises(
        workout.id,
        exercises,
      )

      await saveExerciseHistories(
        exercises,
        completedAt,
      )

      await completeWorkout(
        workout.id,
        completedAt,
      )

      navigate('/treinos', {
        replace: true,
        state: {
          workoutCompleted: true,
          completedWorkoutName: workout.name,
        },
      })
    } catch (error) {
      console.error(
        'Não foi possível concluir o treino.',
        error,
      )

      setIsFinishing(false)
    }
  }

  if (notFound) {
    return <Navigate to="/treinos" replace />
  }

  return (
    <div className="workout-session">
      <header className="workout-session__header">
        <button
          type="button"
          className="gc-icon-button"
          aria-label="Sair do treino"
          onClick={() => navigate('/treinos')}
        >
          <ArrowLeft
            size={21}
            strokeWidth={2}
          />
        </button>

        <div className="workout-session__heading">
          <span>
            {workout
              ? `Treino ${workout.code}`
              : 'Carregando'}
          </span>

          <h1>{workout?.name ?? 'Treino'}</h1>
        </div>

        <div className="workout-session__header-space" />
      </header>

      <section className="workout-session__progress">
        <div className="workout-session__progress-info">
          <span>
            {completedCount} de {exercises.length}{' '}
            concluídos
          </span>

          <strong>{progressPercentage}%</strong>
        </div>

        <div
          className="workout-session__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercentage}
        >
          <span
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </section>

      {isLoading ? (
        <section className="workout-session__loading">
          <span />
          <span />
          <span />
        </section>
      ) : (
        <main className="workout-session__list">
          {exercises.map(
            (workoutExercise, index) => {
              const isCompleted =
                completedExerciseIds.includes(
                  workoutExercise.id,
                )

              const historyId =
                getExerciseHistoryId(
                  workoutExercise.exercise,
                )

              const history =
                exerciseHistories[historyId]

              return (
                <article
                  key={workoutExercise.id}
                  className={
                    isCompleted
                      ? 'workout-session-card workout-session-card--completed'
                      : 'workout-session-card'
                  }
                >
                  <header className="workout-session-card__header">
                    <div className="workout-session-card__number">
                      {index + 1}
                    </div>

                    <div className="workout-session-card__title">
                      <h2>
                        {
                          workoutExercise.exercise
                            .name
                        }
                      </h2>

                      <p>
                        {
                          workoutExercise.exercise
                            .muscle
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      className="workout-session-card__check"
                      aria-label={
                        isCompleted
                          ? `Desmarcar ${workoutExercise.exercise.name}`
                          : `Concluir ${workoutExercise.exercise.name}`
                      }
                      aria-pressed={isCompleted}
                      onClick={() =>
                        toggleExercise(
                          workoutExercise.id,
                        )
                      }
                    >
                      <Check
                        className="workout-session-card__check-icon"
                        size={18}
                        strokeWidth={2.4}
                        aria-hidden="true"
                      />
                    </button>
                  </header>

                  <ExerciseGif
                    exercise={
                      workoutExercise.exercise
                    }
                    className="workout-session-card__media"
                  />

                  {history && (
                    <section className="workout-session-history">
                      <header className="workout-session-history__header">
                        <span>
                          <History
                            size={15}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          Última execução
                        </span>

                        <time
                          dateTime={
                            history.lastCompletedAt
                          }
                        >
                          <CalendarDays
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          {formatRelativeDate(
                            history.lastCompletedAt,
                          )}
                        </time>
                      </header>

                      <div className="workout-session-history__values">
                        <div>
                          <Weight
                            size={17}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          <span>Carga</span>

                          <strong>
                            {history.lastWeight
                              ? `${history.lastWeight} kg`
                              : 'Sem carga'}
                          </strong>
                        </div>

                        <div>
                          <Repeat2
                            size={17}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          <span>Séries</span>

                          <strong>
                            {history.lastSeries ||
                              'Não informado'}
                          </strong>
                        </div>
                      </div>
                    </section>
                  )}

                  <div className="workout-session-card__today">
                    <span>Hoje</span>
                  </div>

                  <div className="workout-session-card__details">
                    <label>
                      <span>
                        Séries e repetições
                      </span>

                      <input
                        type="text"
                        value={
                          workoutExercise.series
                        }
                        placeholder="3x 8-12"
                        onChange={(event) =>
                          updateExercise(
                            workoutExercise.id,
                            'series',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Carga</span>

                      <div>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={
                            workoutExercise.weight
                          }
                          placeholder="0"
                          onChange={(event) =>
                            updateExercise(
                              workoutExercise.id,
                              'weight',
                              event.target.value,
                            )
                          }
                        />

                        <span>kg</span>
                      </div>
                    </label>
                  </div>

                  {workoutExercise.exercise
                    .muscleWikiUrl && (
                    <a
                      className="workout-session-card__guide"
                      href={
                        workoutExercise.exercise
                          .muscleWikiUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ver execução de ${workoutExercise.exercise.name} no MuscleWiki`}
                    >
                      Ver execução

                      <ExternalLink
                        size={17}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </article>
              )
            },
          )}
        </main>
      )}

      <footer className="workout-session__footer">
        <Button
          fullWidth
          disabled={!allExercisesCompleted}
          isLoading={isFinishing}
          onClick={() => void finishWorkout()}
        >
          Concluir treino
        </Button>
      </footer>
    </div>
  )
}