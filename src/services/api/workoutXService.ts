import type { Exercise } from '../../types/exercise'
import type {
  WorkoutXErrorResponse,
  WorkoutXExercise,
  WorkoutXSearchResponse,
} from '../../types/workoutX'
import {
  createExerciseSearchPlan,
  type ExerciseSearchPlan,
  type ExerciseSearchRequest,
  type SearchFilter,
} from '../exercise/exerciseSearchParser'
import {
  localizeExercise,
  normalizeExerciseText,
} from '../exercise/exerciseTranslationService'
import {
  getCachedExerciseSearch,
  normalizeExerciseSearchQuery,
  saveExerciseSearch,
} from '../storage/exerciseSearchStorage'

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

  const originalTarget =
    workoutXExercise.target?.trim() ?? ''

  const originalBodyPart =
    workoutXExercise.bodyPart?.trim() ?? ''

  const originalEquipment =
    workoutXExercise.equipment?.trim() ?? ''

  const originalSecondaryMuscles =
    workoutXExercise.secondaryMuscles ?? []

  const exercise: Exercise = {
    id: `workoutx-${sourceId}`,
    source: 'workoutx',
    sourceId,

    name: originalName,
    displayName: originalName,
    originalName,

    translationConfidence: 'fallback',
    unresolvedNameTerms: [],

    muscle: originalTarget || 'Não informado',
    bodyPart: originalBodyPart || 'Não informado',
    equipment:
      originalEquipment || 'Não informado',
    secondaryMuscles:
      originalSecondaryMuscles,

    originalTarget,
    originalBodyPart,
    originalEquipment,
    originalSecondaryMuscles,

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

function normalizeCanonicalValue(value: string) {
  return normalizeExerciseText(value)
}

function nameContainsPhrase(
  exercise: Exercise,
  phrase: string,
) {
  return normalizeCanonicalValue(
    exercise.originalName,
  ).includes(normalizeCanonicalValue(phrase))
}

function matchesCanonicalExercise(
  exercise: Exercise,
  plan: ExerciseSearchPlan,
) {
  const canonical = plan.canonicalExercise

  if (!canonical) {
    return true
  }

  const matchesRequiredGroups =
    canonical.requiredNameTermGroups.every(
      (group) =>
        group.some((phrase) =>
          nameContainsPhrase(exercise, phrase),
        ),
    )

  if (!matchesRequiredGroups) {
    return false
  }

  if (
    canonical.target &&
    normalizeCanonicalValue(
      exercise.originalTarget ?? '',
    ) !== normalizeCanonicalValue(canonical.target)
  ) {
    return false
  }

  if (
    canonical.bodyPart &&
    normalizeCanonicalValue(
      exercise.originalBodyPart ?? '',
    ) !==
      normalizeCanonicalValue(canonical.bodyPart)
  ) {
    return false
  }

  if (
    canonical.equipment &&
    normalizeCanonicalValue(
      exercise.originalEquipment ?? '',
    ) !==
      normalizeCanonicalValue(canonical.equipment)
  ) {
    return false
  }

  return true
}

function matchesTarget(
  exercise: Exercise,
  expectedValue: string,
) {
  const expected =
    normalizeCanonicalValue(expectedValue)

  const values = [
    exercise.originalTarget ?? '',
    ...(exercise.originalSecondaryMuscles ?? []),
  ]

  return values
    .map((value) => normalizeCanonicalValue(value))
    .some((value) => value === expected)
}

function matchesBodyPart(
  exercise: Exercise,
  expectedValue: string,
) {
  return (
    normalizeCanonicalValue(
      exercise.originalBodyPart ?? '',
    ) === normalizeCanonicalValue(expectedValue)
  )
}

function matchesEquipment(
  exercise: Exercise,
  expectedValue: string,
) {
  return (
    normalizeCanonicalValue(
      exercise.originalEquipment ?? '',
    ) === normalizeCanonicalValue(expectedValue)
  )
}

function matchesVariation(
  exercise: Exercise,
  expectedValue: string,
) {
  return nameContainsPhrase(
    exercise,
    expectedValue,
  )
}

function matchesMovementGroup(
  exercise: Exercise,
  plan: ExerciseSearchPlan,
) {
  if (!plan.movementGroup) {
    return true
  }

  return plan.movementGroup.some((phrase) =>
    nameContainsPhrase(exercise, phrase),
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
      return nameContainsPhrase(
        exercise,
        filter.apiValue,
      )

    default:
      return true
  }
}

function filterExercises(
  exercises: Exercise[],
  plan: ExerciseSearchPlan,
) {
  return exercises.filter((exercise) => {
    if (!matchesCanonicalExercise(exercise, plan)) {
      return false
    }

    if (!matchesMovementGroup(exercise, plan)) {
      return false
    }

    return plan.filters.every((filter) =>
      matchesFilter(exercise, filter),
    )
  })
}

function calculateExerciseScore(
  exercise: Exercise,
  plan: ExerciseSearchPlan,
) {
  let score = 0

  if (plan.canonicalExercise) {
    const canonical =
      plan.canonicalExercise

    for (
      let index = 0;
      index <
      canonical.requiredNameTermGroups.length;
      index += 1
    ) {
      const group =
        canonical.requiredNameTermGroups[index]

      if (
        group.some((phrase) =>
          nameContainsPhrase(exercise, phrase),
        )
      ) {
        score += 1_000
      }
    }
  }

  if (matchesMovementGroup(exercise, plan)) {
    score += 500
  }

  for (const filter of plan.filters) {
    if (matchesFilter(exercise, filter)) {
      score += 200
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
      const difference =
        calculateExerciseScore(
          secondExercise,
          plan,
        ) -
        calculateExerciseScore(
          firstExercise,
          plan,
        )

      if (difference !== 0) {
        return difference
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
  request: ExerciseSearchRequest,
  signal?: AbortSignal,
): Promise<Exercise[]> {
  const queryParameters = new URLSearchParams({
    query: request.apiQuery,
    mode: request.mode,
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

async function executeSearchPlan(
  plan: ExerciseSearchPlan,
  signal?: AbortSignal,
) {
  const collectedExercises: Exercise[] = []

  for (const request of plan.requests) {
    if (signal?.aborted) {
      break
    }

    const exercises =
      await requestWorkoutXExercises(
        request,
        signal,
      )

    collectedExercises.push(...exercises)

    const filteredSoFar = filterExercises(
      removeDuplicateExercises(
        collectedExercises,
      ),
      plan,
    )

    if (
      plan.canonicalExercise &&
      filteredSoFar.length > 0
    ) {
      return filteredSoFar
    }
  }

  return filterExercises(
    removeDuplicateExercises(
      collectedExercises,
    ),
    plan,
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

  const searchPlan =
    createExerciseSearchPlan(query)

  const exercises = await executeSearchPlan(
    searchPlan,
    signal,
  )

  const finalExercises = sortExercises(
    removeDuplicateExercises(exercises),
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