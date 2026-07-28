export type ExerciseSource = 'workoutx'

export type ExerciseTranslationConfidence =
  | 'exact'
  | 'structured'
  | 'fallback'

export type Exercise = {
  id: string
  source: ExerciseSource
  sourceId: string

  name: string
  displayName: string
  originalName: string

  translationConfidence:
    ExerciseTranslationConfidence

  unresolvedNameTerms: string[]

  muscle: string
  bodyPart: string
  equipment: string
  secondaryMuscles: string[]

  originalTarget?: string
  originalBodyPart?: string
  originalEquipment?: string
  originalSecondaryMuscles?: string[]

  description: string
  instructions: string[]

  gifUrl: string
  muscleWikiUrl?: string

  category?: string
  difficulty?: string
  mechanic?: string
  force?: string

  met?: number
  caloriesPerMinute?: number
  isUnilateral?: boolean
  popularityRank?: number

  recommendedSets?: string
  recommendedReps?: string
}

export type WorkoutExercise = {
  id: string
  exercise: Exercise
  series: string
  weight: string
}
