import type { Exercise } from '../../types/exercise'
import type {
  SharedExercisePayload,
  SharedExerciseRow,
  SharedExerciseSearchResponse,
  SharedExerciseUpsertResponse,
} from '../../types/sharedExercise'
import { localizeExercise } from '../exercise/exerciseTranslationService'
import { saveExercisesToLibrary } from '../storage/exerciseLibraryStorage'

function mapRow(row: SharedExerciseRow): Exercise {
  return localizeExercise({
    id: `workoutx-${row.source_id}`,
    source: 'workoutx',
    sourceId: row.source_id,
    name: row.display_name,
    displayName: row.display_name,
    originalName: row.original_name,
    translationConfidence: 'exact',
    unresolvedNameTerms: [],
    muscle:
      row.translated_target ??
      row.original_target ??
      'Não informado',
    bodyPart:
      row.translated_body_part ??
      row.original_body_part ??
      'Não informado',
    equipment:
      row.translated_equipment ??
      row.original_equipment ??
      'Não informado',
    secondaryMuscles:
      row.translated_secondary_muscles.length > 0
        ? row.translated_secondary_muscles
        : row.original_secondary_muscles,
    originalTarget: row.original_target ?? '',
    originalBodyPart: row.original_body_part ?? '',
    originalEquipment: row.original_equipment ?? '',
    originalSecondaryMuscles:
      row.original_secondary_muscles,
    description:
      row.translated_description ??
      row.description ??
      '',
    instructions:
      row.translated_instructions.length > 0
        ? row.translated_instructions
        : row.instructions,
    gifUrl:
      row.gif_url ??
      `/api/exercise-gif?id=${encodeURIComponent(
        row.source_id,
      )}`,
    muscleWikiUrl:
      row.muscle_wiki_url ?? undefined,
    category: row.category ?? undefined,
    difficulty: row.difficulty ?? undefined,
    mechanic: row.mechanic ?? undefined,
    force: row.force ?? undefined,
    met: row.met ?? undefined,
    caloriesPerMinute:
      row.calories_per_minute ?? undefined,
    isUnilateral: row.is_unilateral ?? undefined,
    popularityRank:
      row.popularity_rank ?? undefined,
    recommendedSets:
      row.recommended_sets ?? undefined,
    recommendedReps:
      row.recommended_reps ?? undefined,
  })
}

export async function searchSharedExercises(
  query: string,
  signal?: AbortSignal,
): Promise<Exercise[]> {
  const parameters = new URLSearchParams({
    query: query.trim(),
  })

  const response = await fetch(
    `/api/shared-exercises?${parameters.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  )

  if (!response.ok) {
    return []
  }

  const body =
    (await response.json()) as SharedExerciseSearchResponse

  const exercises = body.exercises.map(mapRow)

  await saveExercisesToLibrary(exercises)

  return exercises
}

export async function saveSharedExercise(
  exercise: Exercise,
  aliases: string[] = [],
): Promise<void> {
  const payload: SharedExercisePayload = {
    exercise,
    aliases,
  }

  const response = await fetch('/api/shared-exercises', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return
  }

  const body =
    (await response.json()) as SharedExerciseUpsertResponse

  await saveExercisesToLibrary([
    mapRow(body.exercise),
  ])
}

export async function saveSharedExercises(
  exercises: Exercise[],
): Promise<void> {
  await Promise.allSettled(
    exercises.map((exercise) =>
      saveSharedExercise(exercise),
    ),
  )
}
