import type { Exercise } from '../../types/exercise'
import type {
  WorkoutXErrorResponse,
  WorkoutXExercise,
  WorkoutXSearchResponse,
} from '../../types/workoutX'

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

  return {
    id: `workoutx-${sourceId}`,
    source: 'workoutx',
    sourceId,

    name: workoutXExercise.name,
    originalName: workoutXExercise.name,

    muscle: normalizeValue(workoutXExercise.target),
    bodyPart: normalizeValue(workoutXExercise.bodyPart),
    equipment: normalizeValue(
      workoutXExercise.equipment,
    ),

    secondaryMuscles:
      workoutXExercise.secondaryMuscles ?? [],

    description: createDescription(workoutXExercise),
    instructions: workoutXExercise.instructions ?? [],

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

    isUnilateral: workoutXExercise.isUnilateral,
    popularityRank: workoutXExercise.popularityRank,

    recommendedSets: workoutXExercise.recommendedSets,
    recommendedReps: workoutXExercise.recommendedReps,
  }
}

export async function searchWorkoutXExercises(
  query: string,
  signal?: AbortSignal,
): Promise<Exercise[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const response = await fetch(
    `/api/exercises?query=${encodeURIComponent(
      normalizedQuery,
    )}`,
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