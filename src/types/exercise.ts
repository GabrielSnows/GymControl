export type ExerciseSource = 'workoutx'

export type Exercise = {
  id: string
  source: ExerciseSource
  sourceId: string

  /*
   * name é mantido como nome principal da interface
   * para compatibilidade com os componentes existentes.
   */
  name: string

  /*
   * Nome explicitamente apresentado ao usuário.
   */
  displayName: string

  /*
   * Nome original retornado pela WorkoutX.
   */
  originalName: string

  muscle: string
  bodyPart: string
  equipment: string
  secondaryMuscles: string[]

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