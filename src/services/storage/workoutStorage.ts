import { openDB, type DBSchema } from 'idb'

import type { WorkoutExercise } from '../../types/exercise'
import type { WorkoutDefinition } from '../../types/workout'
import type { WorkoutProgress } from '../../types/workoutSession'

interface GymControlDatabase extends DBSchema {
  workouts: {
    key: string
    value: {
      workoutId: string
      exercises: WorkoutExercise[]
      updatedAt: string
    }
  }

  workoutDefinitions: {
    key: string
    value: WorkoutDefinition
  }

  workoutProgress: {
    key: string
    value: WorkoutProgress & {
      id: string
    }
  }
}

const DATABASE_NAME = 'gymcontrol'
const DATABASE_VERSION = 4

const WORKOUT_STORE_NAME = 'workouts'
const WORKOUT_DEFINITIONS_STORE_NAME = 'workoutDefinitions'
const WORKOUT_PROGRESS_STORE_NAME = 'workoutProgress'

const WORKOUT_PROGRESS_ID = 'current-progress'
const WORKOUT_CODES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const defaultWorkoutDefinitions: WorkoutDefinition[] = [
  {
    id: 'workout-a',
    code: 'A',
    name: 'Peito, ombros e tríceps',
    description: 'Treino de membros superiores com foco em empurrar.',
    order: 1,
  },
  {
    id: 'workout-b',
    code: 'B',
    name: 'Pernas',
    description: 'Treino completo para os membros inferiores.',
    order: 2,
  },
  {
    id: 'workout-c',
    code: 'C',
    name: 'Costas e bíceps',
    description: 'Treino de membros superiores com foco em puxar.',
    order: 3,
  },
]

const databasePromise = openDB<GymControlDatabase>(
  DATABASE_NAME,
  DATABASE_VERSION,
  {
    upgrade(database) {
      if (!database.objectStoreNames.contains(WORKOUT_STORE_NAME)) {
        database.createObjectStore(WORKOUT_STORE_NAME, {
          keyPath: 'workoutId',
        })
      }

      if (
        !database.objectStoreNames.contains(
          WORKOUT_DEFINITIONS_STORE_NAME,
        )
      ) {
        database.createObjectStore(
          WORKOUT_DEFINITIONS_STORE_NAME,
          {
            keyPath: 'id',
          },
        )
      }

      if (
        !database.objectStoreNames.contains(
          WORKOUT_PROGRESS_STORE_NAME,
        )
      ) {
        database.createObjectStore(
          WORKOUT_PROGRESS_STORE_NAME,
          {
            keyPath: 'id',
          },
        )
      }
    },
  },
)

function generateWorkoutId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `workout-${crypto.randomUUID()}`
  }

  return `workout-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function getCodeForIndex(index: number) {
  const code = WORKOUT_CODES[index]

  if (!code) {
    throw new Error('O limite máximo de 26 treinos foi atingido.')
  }

  return code
}

async function ensureDefaultWorkoutDefinitions() {
  const database = await databasePromise
  const storedDefinitions = await database.getAll(
    WORKOUT_DEFINITIONS_STORE_NAME,
  )

  if (storedDefinitions.length > 0) {
    return
  }

  const transaction = database.transaction(
    WORKOUT_DEFINITIONS_STORE_NAME,
    'readwrite',
  )

  for (const definition of defaultWorkoutDefinitions) {
    await transaction.store.put(definition)
  }

  await transaction.done
}

async function normalizeWorkoutDefinitions() {
  const database = await databasePromise

  const definitions = await database.getAll(
    WORKOUT_DEFINITIONS_STORE_NAME,
  )

  const sortedDefinitions = definitions.sort(
    (first, second) => first.order - second.order,
  )

  const transaction = database.transaction(
    WORKOUT_DEFINITIONS_STORE_NAME,
    'readwrite',
  )

  for (const [index, definition] of sortedDefinitions.entries()) {
    await transaction.store.put({
      ...definition,
      code: getCodeForIndex(index),
      order: index + 1,
    })
  }

  await transaction.done
}

export async function getWorkoutDefinitions(): Promise<
  WorkoutDefinition[]
> {
  await ensureDefaultWorkoutDefinitions()

  const database = await databasePromise

  const definitions = await database.getAll(
    WORKOUT_DEFINITIONS_STORE_NAME,
  )

  return definitions.sort(
    (first, second) => first.order - second.order,
  )
}

export async function getWorkoutDefinition(
  workoutId: string,
): Promise<WorkoutDefinition | undefined> {
  await ensureDefaultWorkoutDefinitions()

  const database = await databasePromise

  return database.get(
    WORKOUT_DEFINITIONS_STORE_NAME,
    workoutId,
  )
}

export async function createWorkoutDefinition(
  name: string,
  description: string,
): Promise<WorkoutDefinition> {
  const definitions = await getWorkoutDefinitions()

  if (definitions.length >= WORKOUT_CODES.length) {
    throw new Error('O limite máximo de 26 treinos foi atingido.')
  }

  const newWorkout: WorkoutDefinition = {
    id: generateWorkoutId(),
    code: getCodeForIndex(definitions.length),
    name: name.trim(),
    description: description.trim(),
    order: definitions.length + 1,
  }

  const database = await databasePromise

  await database.put(
    WORKOUT_DEFINITIONS_STORE_NAME,
    newWorkout,
  )

  const progress = await getWorkoutProgress()

  if (!progress.nextWorkoutId) {
    await saveWorkoutProgress({
      ...progress,
      nextWorkoutId: newWorkout.id,
    })
  }

  return newWorkout
}

export async function saveWorkoutDefinition(
  definition: WorkoutDefinition,
): Promise<void> {
  const database = await databasePromise

  await database.put(
    WORKOUT_DEFINITIONS_STORE_NAME,
    definition,
  )
}

export async function deleteWorkout(
  workoutId: string,
): Promise<void> {
  const database = await databasePromise

  const transaction = database.transaction(
    [
      WORKOUT_DEFINITIONS_STORE_NAME,
      WORKOUT_STORE_NAME,
    ],
    'readwrite',
  )

  await transaction
    .objectStore(WORKOUT_DEFINITIONS_STORE_NAME)
    .delete(workoutId)

  await transaction
    .objectStore(WORKOUT_STORE_NAME)
    .delete(workoutId)

  await transaction.done
  await normalizeWorkoutDefinitions()

  const progress = await getWorkoutProgress()

  if (
    progress.nextWorkoutId === workoutId ||
    progress.lastCompletedWorkoutId === workoutId
  ) {
    const remainingWorkouts = await getWorkoutDefinitions()

    await saveWorkoutProgress({
      nextWorkoutId: remainingWorkouts[0]?.id ?? null,
      lastCompletedWorkoutId:
        progress.lastCompletedWorkoutId === workoutId
          ? null
          : progress.lastCompletedWorkoutId,
      lastCompletedAt:
        progress.lastCompletedWorkoutId === workoutId
          ? null
          : progress.lastCompletedAt,
    })
  }
}

export async function getStoredWorkoutExercises(
  workoutId: string,
): Promise<WorkoutExercise[]> {
  const database = await databasePromise

  const storedWorkout = await database.get(
    WORKOUT_STORE_NAME,
    workoutId,
  )

  return storedWorkout?.exercises ?? []
}

export async function saveWorkoutExercises(
  workoutId: string,
  exercises: WorkoutExercise[],
): Promise<void> {
  const database = await databasePromise

  await database.put(WORKOUT_STORE_NAME, {
    workoutId,
    exercises,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearStoredWorkout(
  workoutId: string,
): Promise<void> {
  const database = await databasePromise

  await database.delete(WORKOUT_STORE_NAME, workoutId)
}

export async function getWorkoutProgress(): Promise<WorkoutProgress> {
  const database = await databasePromise

  const storedProgress = await database.get(
    WORKOUT_PROGRESS_STORE_NAME,
    WORKOUT_PROGRESS_ID,
  )

  if (storedProgress) {
    return {
      nextWorkoutId: storedProgress.nextWorkoutId,
      lastCompletedWorkoutId:
        storedProgress.lastCompletedWorkoutId,
      lastCompletedAt: storedProgress.lastCompletedAt,
    }
  }

  const workouts = await getWorkoutDefinitions()

  const initialProgress: WorkoutProgress = {
    nextWorkoutId: workouts[0]?.id ?? null,
    lastCompletedWorkoutId: null,
    lastCompletedAt: null,
  }

  await saveWorkoutProgress(initialProgress)

  return initialProgress
}

export async function saveWorkoutProgress(
  progress: WorkoutProgress,
): Promise<void> {
  const database = await databasePromise

  await database.put(WORKOUT_PROGRESS_STORE_NAME, {
    id: WORKOUT_PROGRESS_ID,
    ...progress,
  })
}

export async function completeWorkout(
  completedWorkoutId: string,
): Promise<WorkoutProgress> {
  const workouts = await getWorkoutDefinitions()

  const currentWorkoutIndex = workouts.findIndex(
    (workout) => workout.id === completedWorkoutId,
  )

  const nextWorkout =
    currentWorkoutIndex >= 0
      ? workouts[(currentWorkoutIndex + 1) % workouts.length]
      : workouts[0]

  const progress: WorkoutProgress = {
    nextWorkoutId: nextWorkout?.id ?? null,
    lastCompletedWorkoutId: completedWorkoutId,
    lastCompletedAt: new Date().toISOString(),
  }

  await saveWorkoutProgress(progress)

  return progress
}