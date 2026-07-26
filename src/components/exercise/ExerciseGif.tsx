import { Dumbbell } from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import { getExerciseGifObjectUrl } from '../../services/storage/exerciseMediaCache'
import type { Exercise } from '../../types/exercise'

type ExerciseGifProps = {
  exercise: Exercise
  className?: string
  fallbackLabel?: string
}

export function ExerciseGif({
  exercise,
  className = '',
  fallbackLabel = 'GIF em preparação',
}: ExerciseGifProps) {
  const [gifSource, setGifSource] =
    useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(
    Boolean(exercise.gifUrl),
  )

  const [hasFailed, setHasFailed] = useState(false)

  useEffect(() => {
    let isMounted = true
    let generatedObjectUrl: string | null = null

    async function loadGif() {
      if (!exercise.gifUrl) {
        setGifSource(null)
        setIsLoading(false)
        setHasFailed(false)
        return
      }

      setIsLoading(true)
      setHasFailed(false)

      const objectUrl =
        await getExerciseGifObjectUrl(
          exercise.gifUrl,
        )

      if (!isMounted) {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }

        return
      }

      if (!objectUrl) {
        setGifSource(null)
        setHasFailed(true)
        setIsLoading(false)
        return
      }

      generatedObjectUrl = objectUrl
      setGifSource(objectUrl)
      setIsLoading(false)
    }

    void loadGif()

    return () => {
      isMounted = false

      if (generatedObjectUrl) {
        URL.revokeObjectURL(generatedObjectUrl)
      }
    }
  }, [exercise.gifUrl])

  const containerClasses = [
    'exercise-gif',
    isLoading ? 'exercise-gif--loading' : '',
    hasFailed ? 'exercise-gif--failed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {gifSource && !hasFailed ? (
        <img
          src={gifSource}
          alt={`Execução do exercício ${exercise.name}`}
          onError={() => {
            setHasFailed(true)
            setGifSource(null)
          }}
        />
      ) : isLoading ? (
        <div
          className="exercise-gif__loading"
          aria-label={`Carregando execução de ${exercise.name}`}
        >
          <span aria-hidden="true" />
          <p>Carregando exercício</p>
        </div>
      ) : (
        <div className="exercise-gif__fallback">
          <Dumbbell
            size={42}
            strokeWidth={1.55}
            aria-hidden="true"
          />

          <span>{fallbackLabel}</span>
        </div>
      )}
    </div>
  )
}