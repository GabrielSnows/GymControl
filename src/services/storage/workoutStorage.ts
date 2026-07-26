import { openDB, type DBSchema } from 'idb'

import type { WorkoutExercise } from '../../types/exercise'
import type { WorkoutDefinition } from '../../types/workout'

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
}

const DATABASE_NAME = 'gymcontrol'
const DATABASE_VERSION = 2

const WORKOUT_STORE_NAME = 'workouts'
const WORKOUT_DEFINITIONS_STORE_NAME = 'workoutDefinitions'

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
    name: 'Costas e bíceps',
    description: 'Treino de membros superiores com foco em puxar.',
    order: 2,
  },
  {
    id: 'workout-c',
    code: 'C',
    name: 'Pernas',
    description: 'Treino completo para os membros inferiores.',
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
    },
  },
)

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

  await Promise.all([
    ...defaultWorkoutDefinitions.map((definition) =>
      transaction.store.put(definition),
    ),
    transaction.done,
  ])
}

export async function getWorkoutDefinitions(): Promise<
  WorkoutDefinition[]
> {
  await ensureDefaultWorkoutDefinitions()

  const database = await databasePromise
  const definitions = await database.getAll(
    WORKOUT_DEFINITIONS_STORE_NAME,
  )

  return definitions.sort((first, second) => first.order - second.order)
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

export async function saveWorkoutDefinition(
  definition: WorkoutDefinition,
): Promise<void> {
  const database = await databasePromise

  await database.put(
    WORKOUT_DEFINITIONS_STORE_NAME,
    definition,
  )
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