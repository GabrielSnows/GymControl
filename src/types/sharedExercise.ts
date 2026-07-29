import type { Exercise } from './exercise'

export type SharedExerciseRow = {
  id: string
  source: 'workoutx'
  source_id: string
  original_name: string
  display_name: string
  aliases: string[]
  original_target: string | null
  original_body_part: string | null
  original_equipment: string | null
  original_secondary_muscles: string[]
  translated_target: string | null
  translated_body_part: string | null
  translated_equipment: string | null
  translated_secondary_muscles: string[]
  description: string | null
  instructions: string[]
  translated_description: string | null
  translated_instructions: string[]
  gif_url: string | null
  muscle_wiki_url: string | null
  category: string | null
  difficulty: string | null
  mechanic: string | null
  force: string | null
  met: number | null
  calories_per_minute: number | null
  is_unilateral: boolean | null
  popularity_rank: number | null
  recommended_sets: string | null
  recommended_reps: string | null
}

export type SharedExerciseSearchResponse = {
  exercises: SharedExerciseRow[]
}

export type SharedExerciseUpsertResponse = {
  exercise: SharedExerciseRow
}

export type SharedExercisePayload = {
  exercise: Exercise
  aliases?: string[]
}
