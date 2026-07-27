import {
  ArrowLeft,
  Dumbbell,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { ExerciseDetailsSheet } from '../../components/exercise/ExerciseDetailsSheet'
import { ExerciseSearchSheet } from '../../components/exercise/ExerciseSearchSheet'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { WorkoutFormSheet } from '../../components/workout/WorkoutFormSheet'
import { cacheExerciseGif } from '../../services/storage/exerciseMediaCache'
import {
  deleteWorkout,
  getStoredWorkoutExercises,
  getWorkoutDefinition,
  saveWorkoutDefinition,
  saveWorkoutExercises,
} from '../../services/storage/workoutStorage'
import type {
  Exercise,
  WorkoutExercise,
} from '../../types/exercise'
import type { WorkoutDefinition } from '../../types/workout'

type EditorStep = 'closed' | 'search' | 'details'

function generateWorkoutExerciseId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `workout-exercise-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function getInitialSeries(exercise: Exercise) {
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

export function WorkoutEditorPage() {
  const navigate = useNavigate()
  const { workoutId } = useParams()

  const [editorStep, setEditorStep] =
    useState<EditorStep>('closed')

  const [selectedExercise, setSelectedExercise] =
    useState<Exercise | null>(null)

  const [workoutDefinition, setWorkoutDefinition] =
    useState<WorkoutDefinition | null>(null)

  const [workoutExercises, setWorkoutExercises] = useState<
    WorkoutExercise[]
  >([])

  const [isLoadingWorkout, setIsLoadingWorkout] = useState(true)
  const [storageError, setStorageError] = useState(false)
  const [workoutNotFound, setWorkoutNotFound] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadWorkout() {
      if (!workoutId) {
        if (isMounted) {
          setWorkoutNotFound(true)
          setIsLoadingWorkout(false)
        }

        return
      }

      const currentWorkoutId = workoutId

      try {
        const [definition, storedExercises] = await Promise.all([
          getWorkoutDefinition(currentWorkoutId),
          getStoredWorkoutExercises(currentWorkoutId),
        ])

        if (!isMounted) {
          return
        }

        if (!definition) {
          setWorkoutNotFound(true)
          return
        }

        setWorkoutDefinition(definition)
        setWorkoutExercises(storedExercises)
        setStorageError(false)
      } catch (error) {
        console.error(
          'Não foi possível carregar o treino salvo.',
          error,
        )

        if (isMounted) {
          setStorageError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoadingWorkout(false)
        }
      }
    }

    void loadWorkout()

    return () => {
      isMounted = false
    }
  }, [workoutId])

  useEffect(() => {
    if (
      isLoadingWorkout ||
      !workoutId ||
      workoutNotFound
    ) {
      return
    }

    const currentWorkoutId = workoutId

    async function persistWorkout() {
      try {
        await saveWorkoutExercises(
          currentWorkoutId,
          workoutExercises,
        )

        setStorageError(false)
      } catch (error) {
        console.error(
          'Não foi possível salvar as alterações do treino.',
          error,
        )

        setStorageError(true)
      }
    }

    void persistWorkout()
  }, [
    isLoadingWorkout,
    workoutExercises,
    workoutId,
    workoutNotFound,
  ])

  function openSearch() {
    setSelectedExercise(null)
    setEditorStep('search')
  }

  function openExerciseDetails(exercise: Exercise) {
    setSelectedExercise(exercise)
    setEditorStep('details')
  }

  function returnToSearch() {
    setSelectedExercise(null)
    setEditorStep('search')
  }

  function closeExerciseFlow() {
    setSelectedExercise(null)
    setEditorStep('closed')
  }

  function addExercise(exercise: Exercise) {
    const alreadyAdded = workoutExercises.some(
      (workoutExercise) =>
        workoutExercise.exercise.id === exercise.id,
    )

    if (!alreadyAdded) {
      const newWorkoutExercise: WorkoutExercise = {
        id: generateWorkoutExerciseId(),
        exercise,
        series: getInitialSeries(exercise),
        weight: '',
      }

      setWorkoutExercises((currentExercises) => [
        ...currentExercises,
        newWorkoutExercise,
      ])

      if (exercise.gifUrl) {
        void cacheExerciseGif(exercise.gifUrl)
      }
    }

    closeExerciseFlow()
  }

  function removeExercise(workoutExerciseId: string) {
    setWorkoutExercises((currentExercises) =>
      currentExercises.filter(
        (workoutExercise) =>
          workoutExercise.id !== workoutExerciseId,
      ),
    )
  }

  function updateExercise(
    workoutExerciseId: string,
    field: 'series' | 'weight',
    value: string,
  ) {
    setWorkoutExercises((currentExercises) =>
      currentExercises.map((workoutExercise) =>
        workoutExercise.id === workoutExerciseId
          ? {
              ...workoutExercise,
              [field]: value,
            }
          : workoutExercise,
      ),
    )
  }

  async function updateWorkout(values: {
    name: string
    description: string
  }) {
    if (!workoutDefinition) {
      return
    }

    const updatedWorkout: WorkoutDefinition = {
      ...workoutDefinition,
      name: values.name,
      description: values.description,
    }

    await saveWorkoutDefinition(updatedWorkout)

    setWorkoutDefinition(updatedWorkout)
    setIsEditSheetOpen(false)
  }

  async function removeWorkout() {
    if (!workoutDefinition) {
      return
    }

    await deleteWorkout(workoutDefinition.id)

    setIsEditSheetOpen(false)
    navigate('/rotina', { replace: true })
  }

  if (workoutNotFound) {
    return <Navigate to="/rotina" replace />
  }

  return (
    <>
      <Screen
        eyebrow={
          workoutDefinition
            ? `Treino ${workoutDefinition.code}`
            : 'Carregando treino'
        }
        title={workoutDefinition?.name ?? 'Treino'}
        description={
          workoutDefinition?.description ||
          'Adicione e configure os exercícios deste treino.'
        }
        action={
          <div className="workout-editor-actions">
            <button
              type="button"
              className="gc-icon-button"
              aria-label="Voltar para a rotina"
              onClick={() => navigate('/rotina')}
            >
              <ArrowLeft size={21} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="gc-icon-button"
              aria-label="Editar treino"
              disabled={!workoutDefinition}
              onClick={() => setIsEditSheetOpen(true)}
            >
              <Pencil size={19} strokeWidth={2} />
            </button>
          </div>
        }
      >
        {storageError && (
          <div className="workout-storage-warning" role="status">
            Não foi possível acessar o armazenamento local. As
            alterações desta sessão podem não ser preservadas.
          </div>
        )}

        <Card
          variant="subtle"
          className="workout-builder-summary"
        >
          <div>
            <span>Exercícios</span>

            <strong>
              {isLoadingWorkout ? '—' : workoutExercises.length}
            </strong>
          </div>

          <div className="workout-builder-summary__divider" />

          <div>
            <span>Divisão</span>

            <strong>{workoutDefinition?.code ?? '—'}</strong>
          </div>
        </Card>

        {isLoadingWorkout ? (
          <section
            className="workout-builder-loading"
            aria-label="Carregando treino"
          >
            <div className="workout-builder-loading__icon">
              <span />
            </div>

            <div className="workout-builder-loading__content">
              <span />
              <span />
            </div>
          </section>
        ) : workoutExercises.length === 0 ? (
          <section className="workout-builder-empty">
            <div
              className="workout-builder-empty__icon"
              aria-hidden="true"
            >
              <Dumbbell size={31} strokeWidth={1.8} />
            </div>

            <h2>Este treino ainda está vazio</h2>

            <p>
              Adicione o primeiro exercício para começar a montar
              este treino.
            </p>

            <Button
              leadingIcon={
                <Plus size={19} strokeWidth={2.2} />
              }
              onClick={openSearch}
            >
              Adicionar primeiro exercício
            </Button>
          </section>
        ) : (
          <section className="workout-builder-list">
            <header className="workout-builder-list__header">
              <div>
                <h2>Exercícios</h2>

                <p>
                  Configure as séries e a carga de cada exercício.
                </p>
              </div>
            </header>

            <div className="workout-builder-list__content">
              {workoutExercises.map(
                (workoutExercise, index) => (
                  <Card
                    key={workoutExercise.id}
                    className="workout-builder-exercise"
                  >
                    <header className="workout-builder-exercise__header">
                      <div className="workout-builder-exercise__number">
                        {index + 1}
                      </div>

                      <div className="workout-builder-exercise__heading">
                        <h3>
                          {workoutExercise.exercise.name}
                        </h3>

                        <p>
                          {workoutExercise.exercise.muscle}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="workout-builder-exercise__remove"
                        aria-label={`Remover ${workoutExercise.exercise.name}`}
                        onClick={() =>
                          removeExercise(workoutExercise.id)
                        }
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </header>

                    <div className="workout-builder-exercise__fields">
                      <label>
                        <span>Séries e repetições</span>

                        <input
                          type="text"
                          value={workoutExercise.series}
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

                        <div className="workout-weight-field">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={workoutExercise.weight}
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
                  </Card>
                ),
              )}
            </div>

            <Button
              fullWidth
              variant="secondary"
              leadingIcon={
                <Plus size={19} strokeWidth={2.2} />
              }
              onClick={openSearch}
            >
              Adicionar outro exercício
            </Button>
          </section>
        )}
      </Screen>

      {editorStep === 'search' && (
        <ExerciseSearchSheet
          onClose={closeExerciseFlow}
          onSelect={openExerciseDetails}
        />
      )}

      {editorStep === 'details' && selectedExercise && (
        <ExerciseDetailsSheet
          exercise={selectedExercise}
          onBack={returnToSearch}
          onAdd={addExercise}
        />
      )}

      {isEditSheetOpen && workoutDefinition && (
        <WorkoutFormSheet
          workout={workoutDefinition}
          onClose={() => setIsEditSheetOpen(false)}
          onSave={updateWorkout}
          onDelete={removeWorkout}
        />
      )}
    </>
  )
}