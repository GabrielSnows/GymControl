export type WorkoutXExercise = {
  id: string
  name: string

  bodyPart?: string
  equipment?: string
  target?: string
  secondaryMuscles?: string[]

  instructions?: string[]
  gifUrl?: string
  description?: string

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

export type WorkoutXSearchResponse = {
  total: number
  count: number
  exercises: WorkoutXExercise[]
}

export type WorkoutXErrorResponse = {
  message?: string
}