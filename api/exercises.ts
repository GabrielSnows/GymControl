import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

const WORKOUTX_API_URL =
  'https://api.workoutxapp.com/v1'

const MINIMUM_SEARCH_LENGTH = 2
const RESULT_LIMIT = 10

type WorkoutXExercise = {
  id: string
  name: string
  bodyPart?: string
  equipment?: string
  target?: string
  secondaryMuscles?: string[]
  instructions?: string[]
  gifUrl?: string
  category?: string
  difficulty?: string
  mechanic?: string
  force?: string
  met?: number
  caloriesPerMinute?: number
  description?: string
  isUnilateral?: boolean
  popularityRank?: number
  recommendedSets?: string
  recommendedReps?: string
}

type WorkoutXListResponse = {
  total?: number
  count?: number
  data?: WorkoutXExercise[]
}

function getQueryParameter(
  request: VercelRequest,
  parameterName: string,
) {
  const rawValue = request.query[parameterName]

  if (Array.isArray(rawValue)) {
    return rawValue[0]?.trim() ?? ''
  }

  return rawValue?.trim() ?? ''
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')

    return response.status(405).json({
      message: 'Método não permitido.',
    })
  }

  const apiKey = process.env.WORKOUTX_API_KEY

  if (!apiKey) {
    return response.status(500).json({
      message:
        'A chave da WorkoutX não está configurada no servidor.',
    })
  }

  const query = getQueryParameter(request, 'query')

  if (query.length < MINIMUM_SEARCH_LENGTH) {
    return response.status(400).json({
      message:
        'Digite pelo menos dois caracteres para pesquisar.',
    })
  }

  const endpoint =
    `${WORKOUTX_API_URL}/exercises/name/` +
    `${encodeURIComponent(query)}` +
    `?limit=${RESULT_LIMIT}&offset=0`

  try {
    const workoutXResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-WorkoutX-Key': apiKey,
      },
    })

    const rawBody = await workoutXResponse.text()

    if (!workoutXResponse.ok) {
      console.error(
        'Erro retornado pela WorkoutX:',
        workoutXResponse.status,
        rawBody,
      )

      if (workoutXResponse.status === 401) {
        return response.status(401).json({
          message: 'A chave da WorkoutX é inválida.',
        })
      }

      if (workoutXResponse.status === 429) {
        return response.status(429).json({
          message:
            'O limite de consultas da WorkoutX foi atingido.',
        })
      }

      return response.status(workoutXResponse.status).json({
        message:
          'Não foi possível pesquisar os exercícios.',
      })
    }

    const parsedBody = JSON.parse(
      rawBody,
    ) as WorkoutXListResponse

    const exercises = Array.isArray(parsedBody.data)
      ? parsedBody.data
      : []

    return response.status(200).json({
      total: parsedBody.total ?? exercises.length,
      count: parsedBody.count ?? exercises.length,
      exercises,
    })
  } catch (error) {
    console.error(
      'Não foi possível conectar à WorkoutX.',
      error,
    )

    return response.status(500).json({
      message:
        'Não foi possível conectar ao catálogo de exercícios.',
    })
  }
}