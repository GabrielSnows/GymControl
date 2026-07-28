import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

const WORKOUTX_API_URL =
  'https://api.workoutxapp.com/v1'

const MINIMUM_SEARCH_LENGTH = 2
const RESULT_LIMIT = 10

type SearchMode =
  | 'name'
  | 'target'
  | 'bodyPart'
  | 'equipment'

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

function isSearchMode(value: string): value is SearchMode {
  return [
    'name',
    'target',
    'bodyPart',
    'equipment',
  ].includes(value)
}

function createWorkoutXEndpoint(
  mode: SearchMode,
  query: string,
) {
  const encodedQuery = encodeURIComponent(query)

  const endpointByMode: Record<SearchMode, string> = {
    name:
      `${WORKOUTX_API_URL}/exercises/name/` +
      encodedQuery,

    target:
      `${WORKOUTX_API_URL}/exercises/target/` +
      encodedQuery,

    bodyPart:
      `${WORKOUTX_API_URL}/exercises/bodyPart/` +
      encodedQuery,

    equipment:
      `${WORKOUTX_API_URL}/exercises/equipment/` +
      encodedQuery,
  }

  return (
    `${endpointByMode[mode]}` +
    `?limit=${RESULT_LIMIT}&offset=0`
  )
}

function parseWorkoutXResponse(
  parsedBody:
    | WorkoutXExercise[]
    | WorkoutXListResponse,
) {
  if (Array.isArray(parsedBody)) {
    return parsedBody
  }

  return Array.isArray(parsedBody.data)
    ? parsedBody.data
    : []
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
  const rawMode = getQueryParameter(request, 'mode')

  if (query.length < MINIMUM_SEARCH_LENGTH) {
    return response.status(400).json({
      message:
        'Digite pelo menos dois caracteres para pesquisar.',
    })
  }

  if (!isSearchMode(rawMode)) {
    return response.status(400).json({
      message: 'Tipo de pesquisa inválido.',
    })
  }

  const endpoint = createWorkoutXEndpoint(
    rawMode,
    query,
  )

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

      if (workoutXResponse.status === 403) {
        return response.status(403).json({
          message:
            'Esta pesquisa não está disponível no plano atual.',
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

    const parsedBody = JSON.parse(rawBody) as
      | WorkoutXExercise[]
      | WorkoutXListResponse

    const exercises =
      parseWorkoutXResponse(parsedBody)

    return response.status(200).json({
      total:
        Array.isArray(parsedBody)
          ? exercises.length
          : parsedBody.total ?? exercises.length,

      count:
        Array.isArray(parsedBody)
          ? exercises.length
          : parsedBody.count ?? exercises.length,

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