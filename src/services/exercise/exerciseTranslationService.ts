import {
  bodyPartTranslations,
  categoryTranslations,
  difficultyTranslations,
  equipmentTranslations,
  exerciseNameTranslations,
  exerciseSearchTranslations,
  forceTranslations,
  mechanicTranslations,
  muscleTranslations,
} from '../../data/exerciseTranslations'
import type { Exercise } from '../../types/exercise'

function normalizeTranslationKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function findTranslation(
  translations: Record<string, string>,
  value?: string,
) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    return undefined
  }

  const normalizedKey =
    normalizeTranslationKey(normalizedValue)

  const translatedEntry = Object.entries(
    translations,
  ).find(
    ([translationKey]) =>
      normalizeTranslationKey(translationKey) ===
      normalizedKey,
  )

  return translatedEntry?.[1]
}

export function translateExerciseName(
  originalName: string,
) {
  return (
    findTranslation(
      exerciseNameTranslations,
      originalName,
    ) ?? originalName.trim()
  )
}

export function translateExerciseSearchQuery(
  query: string,
) {
  const normalizedQuery =
    normalizeTranslationKey(query)

  const exactTranslation = findTranslation(
    exerciseSearchTranslations,
    normalizedQuery,
  )

  if (exactTranslation) {
    return exactTranslation
  }

  const orderedTranslations = Object.entries(
    exerciseSearchTranslations,
  ).sort(
    ([firstPhrase], [secondPhrase]) =>
      secondPhrase.length - firstPhrase.length,
  )

  let translatedQuery = normalizedQuery

  for (const [
    portuguesePhrase,
    englishPhrase,
  ] of orderedTranslations) {
    const normalizedPortuguesePhrase =
      normalizeTranslationKey(portuguesePhrase)

    if (
      translatedQuery.includes(
        normalizedPortuguesePhrase,
      )
    ) {
      translatedQuery = translatedQuery.replace(
        normalizedPortuguesePhrase,
        englishPhrase,
      )
    }
  }

  return translatedQuery
}

export function translateMuscle(value?: string) {
  return (
    findTranslation(muscleTranslations, value) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateBodyPart(value?: string) {
  return (
    findTranslation(bodyPartTranslations, value) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateEquipment(value?: string) {
  return (
    findTranslation(equipmentTranslations, value) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateDifficulty(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(difficultyTranslations, value) ??
    value.trim()
  )
}

export function translateMechanic(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(mechanicTranslations, value) ??
    value.trim()
  )
}

export function translateForce(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(forceTranslations, value) ??
    value.trim()
  )
}

export function translateCategory(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(categoryTranslations, value) ??
    value.trim()
  )
}

export function translateMuscleList(
  muscles: string[],
) {
  return muscles.map((muscle) =>
    translateMuscle(muscle),
  )
}

export function localizeExercise(
  exercise: Exercise,
): Exercise {
  const originalName =
    exercise.originalName?.trim() ||
    exercise.name.trim()

  const displayName =
    translateExerciseName(originalName)

  return {
    ...exercise,

    /*
     * name continua sendo o nome usado pela interface atual.
     * originalName preserva o nome oficial da WorkoutX.
     * displayName deixa explícito qual nome deve ser mostrado.
     */
    name: displayName,
    displayName,
    originalName,

    muscle: translateMuscle(exercise.muscle),

    bodyPart: translateBodyPart(
      exercise.bodyPart,
    ),

    equipment: translateEquipment(
      exercise.equipment,
    ),

    secondaryMuscles: translateMuscleList(
      exercise.secondaryMuscles ?? [],
    ),

    category: translateCategory(
      exercise.category,
    ),

    difficulty: translateDifficulty(
      exercise.difficulty,
    ),

    mechanic: translateMechanic(
      exercise.mechanic,
    ),

    force: translateForce(exercise.force),
  }
}