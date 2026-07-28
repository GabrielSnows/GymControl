import {
  exerciseSemanticSearchTerms,
  type ExerciseSearchCategory,
} from '../../data/exerciseTranslations'
import type { Exercise } from '../../types/exercise'
import type {
  WorkoutXErrorResponse,
  WorkoutXExercise,
  WorkoutXSearchResponse,
} from '../../types/workoutX'
import {
  localizeExercise,
  normalizeExerciseText,
} from '../exercise/exerciseTranslationService'
import {
  getCachedExerciseSearch,
  normalizeExerciseSearchQuery,
  saveExerciseSearch,
} from '../storage/exerciseSearchStorage'

type SearchMode =
  | 'name'
  | 'target'
  | 'bodyPart'
  | 'equipment'

type SearchFilter = {
  category: ExerciseSearchCategory
  apiValue: string
  matchedText: string
}

type ExerciseSearchPlan = {
  mode: SearchMode
  apiQuery: string
  filters: SearchFilter[]
  requestedName: string | null
}

function normalizeValue(
  value: string | undefined,
  fallback = 'Não informado',
) {
  const normalizedValue = value?.trim()

  return normalizedValue || fallback
}

function createDescription(
  workoutXExercise: WorkoutXExercise,
) {
  if (workoutXExercise.description?.trim()) {
    return workoutXExercise.description.trim()
  }

  const target = normalizeValue(
    workoutXExercise.target,
    'o músculo-alvo',
  )

  const bodyPart = normalizeValue(
    workoutXExercise.bodyPart,
    'a região corporal indicada',
  )

  const equipment = normalizeValue(
    workoutXExercise.equipment,
    'o equipamento indicado',
  )

  return (
    `Exercício direcionado para ${target}, na região ` +
    `${bodyPart}, utilizando ${equipment}.`
  )
}

function mapWorkoutXExercise(
  workoutXExercise: WorkoutXExercise,
): Exercise {
  const sourceId = workoutXExercise.id
  const originalName = workoutXExercise.name.trim()

  const exercise: Exercise = {
    id: `workoutx-${sourceId}`,
    source: 'workoutx',
    sourceId,

    name: originalName,
    displayName: originalName,
    originalName,

    translationConfidence: 'fallback',
    unresolvedNameTerms: [],

    muscle: normalizeValue(
      workoutXExercise.target,
    ),

    bodyPart: normalizeValue(
      workoutXExercise.bodyPart,
    ),

    equipment: normalizeValue(
      workoutXExercise.equipment,
    ),

    secondaryMuscles:
      workoutXExercise.secondaryMuscles ?? [],

    description: createDescription(
      workoutXExercise,
    ),

    instructions:
      workoutXExercise.instructions ?? [],

    gifUrl: `/api/exercise-gif?id=${encodeURIComponent(
      sourceId,
    )}`,

    category: workoutXExercise.category,
    difficulty: workoutXExercise.difficulty,
    mechanic: workoutXExercise.mechanic,
    force: workoutXExercise.force,

    met: workoutXExercise.met,
    caloriesPerMinute:
      workoutXExercise.caloriesPerMinute,

    isUnilateral:
      workoutXExercise.isUnilateral,

    popularityRank:
      workoutXExercise.popularityRank,

    recommendedSets:
      workoutXExercise.recommendedSets,

    recommendedReps:
      workoutXExercise.recommendedReps,
  }

  return localizeExercise(exercise)
}

function findSemanticMatches(query: string) {
  const normalizedQuery = normalizeExerciseText(query)

  const matches: SearchFilter[] = []

  for (const term of exerciseSemanticSearchTerms) {
    const orderedPortugueseTerms = [
      ...term.portuguese,
    ].sort(
      (first, second) =>
        second.length - first.length,
    )

    const matchedTerm =
      orderedPortugueseTerms.find((portugueseTerm) =>
        normalizedQuery.includes(
          normalizeExerciseText(portugueseTerm),
        ),
      )

    if (!matchedTerm) {
      continue
    }

    const alreadyAdded = matches.some(
      (match) =>
        match.category === term.category &&
        match.apiValue === term.apiValue,
    )

    if (!alreadyAdded) {
      matches.push({
        category: term.category,
        apiValue: term.apiValue,
        matchedText: matchedTerm,
      })
    }
  }

  return matches
}

function chooseMostSpecificMatch(
  matches: SearchFilter[],
  category: ExerciseSearchCategory,
) {
  return matches
    .filter((match) => match.category === category)
    .sort(
      (first, second) =>
        second.matchedText.length -
        first.matchedText.length,
    )[0]
}

function createSearchPlan(
  userQuery: string,
): ExerciseSearchPlan {
  const matches = findSemanticMatches(userQuery)

  const movement = chooseMostSpecificMatch(
    matches,
    'movement',
  )

  const target = chooseMostSpecificMatch(
    matches,
    'target',
  )

  const bodyPart = chooseMostSpecificMatch(
    matches,
    'bodyPart',
  )

  const equipment = chooseMostSpecificMatch(
    matches,
    'equipment',
  )

  if (movement) {
    return {
      mode: 'name',
      apiQuery: movement.apiValue,
      filters: matches.filter(
        (match) => match !== movement,
      ),
      requestedName: movement.apiValue,
    }
  }

  if (target) {
    return {
      mode: 'target',
      apiQuery: target.apiValue,
      filters: matches.filter(
        (match) => match !== target,
      ),
      requestedName: null,
    }
  }

  if (bodyPart) {
    return {
      mode: 'bodyPart',
      apiQuery: bodyPart.apiValue,
      filters: matches.filter(
        (match) => match !== bodyPart,
      ),
      requestedName: null,
    }
  }

  if (equipment) {
    return {
      mode: 'equipment',
      apiQuery: equipment.apiValue,
      filters: matches.filter(
        (match) => match !== equipment,
      ),
      requestedName: null,
    }
  }

  return {
    mode: 'name',
    apiQuery: userQuery.trim(),
    filters: [],
    requestedName: userQuery.trim(),
  }
}

function matchesTarget(
  exercise: Exercise,
  expectedValue: string,
) {
  const expected = normalizeExerciseText(expectedValue)

  const values = [
    exercise.muscle,
    exercise.bodyPart,
    ...exercise.secondaryMuscles,
  ].map(normalizeExerciseText)

  const originalValues = [
    exercise.originalName,
    exercise.muscle,
    exercise.bodyPart,
    exercise.equipment,
  ].map(normalizeExerciseText)

  const aliasesByTarget: Record<string, string[]> = {
    pectorals: ['pectorals', 'peitoral', 'chest'],
    delts: ['delts', 'deltoides', 'shoulders'],
    biceps: ['biceps', 'bíceps'],
    triceps: ['triceps', 'tríceps'],
    quads: ['quads', 'quadríceps'],
    hamstrings: [
      'hamstrings',
      'posteriores de coxa',
    ],
    lats: ['lats', 'dorsais', 'back'],
    glutes: ['glutes', 'glúteos'],
    calves: ['calves', 'panturrilhas'],
  }

  const acceptedValues =
    aliasesByTarget[expected] ?? [expected]

  return acceptedValues.some((acceptedValue) => {
    const normalizedAccepted =
      normalizeExerciseText(acceptedValue)

    return [...values, ...originalValues].some(
      (value) => value.includes(normalizedAccepted),
    )
  })
}

function matchesBodyPart(
  exercise: Exercise,
  expectedValue: string,
) {
  const expected = normalizeExerciseText(expectedValue)

  const aliases: Record<string, string[]> = {
    shoulders: ['shoulders', 'ombros', 'deltoides'],
    back: ['back', 'costas', 'dorsais'],
    chest: ['chest', 'peitoral', 'pectorals'],
    'upper arms': ['upper arms', 'braços'],
    'upper legs': ['upper legs', 'pernas'],
    waist: ['waist', 'abdômen'],
  }

  const acceptedValues = aliases[expected] ?? [expected]

  const exerciseValues = [
    exercise.bodyPart,
    exercise.muscle,
    ...exercise.secondaryMuscles,
  ].map(normalizeExerciseText)

  return acceptedValues.some((acceptedValue) => {
    const normalizedAccepted =
      normalizeExerciseText(acceptedValue)

    return exerciseValues.some((value) =>
      value.includes(normalizedAccepted),
    )
  })
}

function matchesEquipment(
  exercise: Exercise,
  expectedValue: string,
) {
  const equipment =
    normalizeExerciseText(exercise.equipment)

  const originalEquipment =
    normalizeExerciseText(
      exercise.originalName,
    )

  const expected =
    normalizeExerciseText(expectedValue)

  const aliases: Record<string, string[]> = {
    dumbbell: ['dumbbell', 'halter', 'halteres'],
    barbell: ['barbell', 'barra'],
    cable: ['cable', 'cabo', 'polia'],
    'smith machine': ['smith'],
    'leverage machine': ['machine', 'máquina'],
    'body weight': ['body weight', 'peso corporal'],
  }

  return (aliases[expected] ?? [expected]).some(
    (acceptedValue) => {
      const normalizedAccepted =
        normalizeExerciseText(acceptedValue)

      return (
        equipment.includes(normalizedAccepted) ||
        originalEquipment.includes(normalizedAccepted)
      )
    },
  )
}

function matchesVariation(
  exercise: Exercise,
  expectedValue: string,
) {
  const originalName =
    normalizeExerciseText(exercise.originalName)

  return originalName.includes(
    normalizeExerciseText(expectedValue),
  )
}

function matchesFilter(
  exercise: Exercise,
  filter: SearchFilter,
) {
  switch (filter.category) {
    case 'target':
      return matchesTarget(exercise, filter.apiValue)

    case 'bodyPart':
      return matchesBodyPart(
        exercise,
        filter.apiValue,
      )

    case 'equipment':
      return matchesEquipment(
        exercise,
        filter.apiValue,
      )

    case 'variation':
      return matchesVariation(
        exercise,
        filter.apiValue,
      )

    case 'movement':
      return normalizeExerciseText(
        exercise.originalName,
      ).includes(
        normalizeExerciseText(filter.apiValue),
      )

    default:
      return true
  }
}

function filterExercises(
  exercises: Exercise[],
  filters: SearchFilter[],
) {
  if (filters.length === 0) {
    return exercises
  }

  return exercises.filter((exercise) =>
    filters.every((filter) =>
      matchesFilter(exercise, filter),
    ),
  )
}

function calculateExerciseScore(
  exercise: Exercise,
  plan: ExerciseSearchPlan,
) {
  let score = 0

  const originalName =
    normalizeExerciseText(exercise.originalName)

  const displayName =
    normalizeExerciseText(exercise.displayName)

  const requestedName = plan.requestedName
    ? normalizeExerciseText(plan.requestedName)
    : ''

  if (requestedName) {
    if (originalName === requestedName) {
      score += 1000
    } else if (displayName === requestedName) {
      score += 950
    } else if (originalName.startsWith(requestedName)) {
      score += 700
    } else if (originalName.includes(requestedName)) {
      score += 500
    }
  }

  for (const filter of plan.filters) {
    if (matchesFilter(exercise, filter)) {
      score += 100
    }
  }

  if (exercise.translationConfidence === 'exact') {
    score += 20
  }

  score -= exercise.popularityRank ?? 0

  return score
}

function sortExercises(
  exercises: Exercise[],
  plan: ExerciseSearchPlan,
) {
  return [...exercises].sort(
    (firstExercise, secondExercise) => {
      const scoreDifference =
        calculateExerciseScore(
          secondExercise,
          plan,
        ) -
        calculateExerciseScore(
          firstExercise,
          plan,
        )

      if (scoreDifference !== 0) {
        return scoreDifference
      }

      return firstExercise.displayName.localeCompare(
        secondExercise.displayName,
        'pt-BR',
      )
    },
  )
}

function removeDuplicateExercises(
  exercises: Exercise[],
) {
  const uniqueExercises = new Map<
    string,
    Exercise
  >()

  for (const exercise of exercises) {
    if (!uniqueExercises.has(exercise.sourceId)) {
      uniqueExercises.set(
        exercise.sourceId,
        exercise,
      )
    }
  }

  return [...uniqueExercises.values()]
}

async function requestWorkoutXExercises(
  plan: ExerciseSearchPlan,
  signal?: AbortSignal,
): Promise<Exercise[]> {
  const queryParameters = new URLSearchParams({
    query: plan.apiQuery,
    mode: plan.mode,
  })

  const response = await fetch(
    `/api/exercises?${queryParameters.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  )

  const responseBody = (await response.json()) as
    | WorkoutXSearchResponse
    | WorkoutXErrorResponse

  if (!response.ok) {
    const errorMessage =
      'message' in responseBody
        ? responseBody.message
        : undefined

    throw new Error(
      errorMessage ||
        'Não foi possível pesquisar exercícios.',
    )
  }

  if (!('exercises' in responseBody)) {
    return []
  }

  return responseBody.exercises.map(
    mapWorkoutXExercise,
  )
}

export async function searchWorkoutXExercises(
  query: string,
  signal?: AbortSignal,
): Promise<Exercise[]> {
  const userSearchKey =
    normalizeExerciseSearchQuery(query)

  if (userSearchKey.length < 2) {
    return []
  }

  const cachedExercises =
    await getCachedExerciseSearch(userSearchKey)

  if (
    cachedExercises &&
    cachedExercises.length > 0
  ) {
    return cachedExercises.map(localizeExercise)
  }

  const searchPlan = createSearchPlan(query)

  const requestedExercises =
    await requestWorkoutXExercises(
      searchPlan,
      signal,
    )

  const filteredExercises = filterExercises(
    requestedExercises,
    searchPlan.filters,
  )

  const finalExercises = sortExercises(
    removeDuplicateExercises(filteredExercises),
    searchPlan,
  )

  if (
    !signal?.aborted &&
    finalExercises.length > 0
  ) {
    await saveExerciseSearch(
      userSearchKey,
      finalExercises,
    )
  }
  
  return finalExercises
}