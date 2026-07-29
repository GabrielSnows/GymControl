import { openDB, type DBSchema } from 'idb'

import type { Exercise } from '../../types/exercise'
import { normalizeExerciseText } from '../exercise/exerciseTranslationService'

const DATABASE_NAME = 'gymcontrol-exercise-library'
const DATABASE_VERSION = 1
const STORE_NAME = 'exercises'

type StoredExercise = {
  sourceId: string
  exercise: Exercise
  aliases: string[]
  searchableText: string
  savedAt: string
}

interface ExerciseLibraryDatabase extends DBSchema {
  exercises: {
    key: string
    value: StoredExercise
  }
}

const databasePromise = openDB<ExerciseLibraryDatabase>(
  DATABASE_NAME,
  DATABASE_VERSION,
  {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: 'sourceId',
        })
      }
    },
  },
)

function createSearchableText(
  exercise: Exercise,
  aliases: string[],
) {
  return normalizeExerciseText(
    [
      exercise.displayName,
      exercise.originalName,
      exercise.muscle,
      exercise.bodyPart,
      exercise.equipment,
      ...exercise.secondaryMuscles,
      ...aliases,
    ].join(' '),
  )
}

export async function saveExerciseToLibrary(
  exercise: Exercise,
  aliases: string[] = [],
): Promise<void> {
  const database = await databasePromise

  const normalizedAliases = [
    exercise.displayName,
    exercise.originalName,
    ...aliases,
  ]
    .map(normalizeExerciseText)
    .filter(Boolean)

  await database.put(STORE_NAME, {
    sourceId: exercise.sourceId,
    exercise,
    aliases: [...new Set(normalizedAliases)],
    searchableText: createSearchableText(
      exercise,
      normalizedAliases,
    ),
    savedAt: new Date().toISOString(),
  })
}

export async function saveExercisesToLibrary(
  exercises: Exercise[],
): Promise<void> {
  await Promise.all(
    exercises.map((exercise) =>
      saveExerciseToLibrary(exercise),
    ),
  )
}

export async function searchLocalExerciseLibrary(
  query: string,
): Promise<Exercise[]> {
  const normalizedQuery = normalizeExerciseText(query)

  if (!normalizedQuery) {
    return []
  }

  const queryWords = normalizedQuery
    .split(' ')
    .filter(Boolean)

  const database = await databasePromise
  const records = await database.getAll(STORE_NAME)

  return records
    .filter((record) => {
      const exactAlias =
        record.aliases.includes(normalizedQuery)

      const allWords = queryWords.every((word) =>
        record.searchableText.includes(word),
      )

      return exactAlias || allWords
    })
    .sort((first, second) => {
      const firstExact =
        first.aliases.includes(normalizedQuery)
      const secondExact =
        second.aliases.includes(normalizedQuery)

      if (firstExact !== secondExact) {
        return firstExact ? -1 : 1
      }

      return first.exercise.displayName.localeCompare(
        second.exercise.displayName,
        'pt-BR',
      )
    })
    .map((record) => record.exercise)
}
