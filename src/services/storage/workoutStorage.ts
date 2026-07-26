import { openDB, type DBSchema } from 'idb'

import type { WorkoutExercise } from '../../types/exercise'

interface GymControlDatabase extends DBSchema {
  workouts: {
    key: string
    value: {
      workoutId: string
      exercises: WorkoutExercise[]
      updatedAt: string
    }
  }
}

const DATABASE_NAME = 'gymcontrol'
const DATABASE_VERSION = 1
const WORKOUT_STORE_NAME = 'workouts'

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
    },
  },
)

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