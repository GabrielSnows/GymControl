import { openDB, type DBSchema } from 'idb'

import type { Exercise } from '../../types/exercise'

const DATABASE_NAME = 'gymcontrol-exercise-search'
const DATABASE_VERSION = 1
const STORE_NAME = 'searchResults'

const SEARCH_CACHE_DURATION =
  30 * 24 * 60 * 60 * 1000

type StoredExerciseSearch = {
  query: string
  exercises: Exercise[]
  cachedAt: string
}

interface ExerciseSearchDatabase extends DBSchema {
  searchResults: {
    key: string
    value: StoredExerciseSearch
  }
}

const databasePromise = openDB<ExerciseSearchDatabase>(
  DATABASE_NAME,
  DATABASE_VERSION,
  {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, {
          keyPath: 'query',
        })
      }
    },
  },
)

export function normalizeExerciseSearchQuery(
  query: string,
) {
  return query
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function isSearchCacheExpired(cachedAt: string) {
  const cachedTimestamp = new Date(cachedAt).getTime()

  if (Number.isNaN(cachedTimestamp)) {
    return true
  }

  return (
    Date.now() - cachedTimestamp >
    SEARCH_CACHE_DURATION
  )
}

export async function getCachedExerciseSearch(
  query: string,
): Promise<Exercise[] | null> {
  const normalizedQuery =
    normalizeExerciseSearchQuery(query)

  if (!normalizedQuery) {
    return null
  }

  try {
    const database = await databasePromise

    const storedSearch = await database.get(
      STORE_NAME,
      normalizedQuery,
    )

    if (!storedSearch) {
      return null
    }

    const isInvalidCache =
      !Array.isArray(storedSearch.exercises) ||
      storedSearch.exercises.length === 0

    if (
      isInvalidCache ||
      isSearchCacheExpired(storedSearch.cachedAt)
    ) {
      await database.delete(
        STORE_NAME,
        normalizedQuery,
      )

      return null
    }

    return storedSearch.exercises
  } catch (error) {
    console.warn(
      'Não foi possível consultar as pesquisas salvas.',
      error,
    )

    return null
  }
}

export async function saveExerciseSearch(
  query: string,
  exercises: Exercise[],
): Promise<void> {
  const normalizedQuery =
    normalizeExerciseSearchQuery(query)

  if (
    !normalizedQuery ||
    exercises.length === 0
  ) {
    return
  }

  try {
    const database = await databasePromise

    await database.put(STORE_NAME, {
      query: normalizedQuery,
      exercises,
      cachedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.warn(
      'Não foi possível salvar os resultados da pesquisa.',
      error,
    )
  }
}

export async function removeCachedExerciseSearch(
  query: string,
): Promise<void> {
  const normalizedQuery =
    normalizeExerciseSearchQuery(query)

  if (!normalizedQuery) {
    return
  }

  try {
    const database = await databasePromise

    await database.delete(
      STORE_NAME,
      normalizedQuery,
    )
  } catch (error) {
    console.warn(
      'Não foi possível remover a pesquisa salva.',
      error,
    )
  }
}

export async function clearExerciseSearchCache(): Promise<void> {
  try {
    const database = await databasePromise

    await database.clear(STORE_NAME)
  } catch (error) {
    console.warn(
      'Não foi possível limpar as pesquisas salvas.',
      error,
    )
  }
}