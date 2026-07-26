export type Exercise = {
  id: string
  name: string
  muscle: string
  equipment: string
  description: string
  instructions: string[]
  gifUrl?: string
  muscleWikiUrl?: string
}

export type WorkoutExercise = {
  id: string
  exercise: Exercise
  series: string
  weight: string
}