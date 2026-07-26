import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

const WORKOUTX_API_URL =
  'https://api.workoutxapp.com/v1'

function getExerciseId(request: VercelRequest) {
  const rawId = request.query.id

  if (Array.isArray(rawId)) {
    return rawId[0]?.trim() ?? ''
  }

  return rawId?.trim() ?? ''
}

function isValidExerciseId(exerciseId: string) {
  return /^[a-zA-Z0-9_-]+$/.test(exerciseId)
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

  const exerciseId = getExerciseId(request)

  if (
    !exerciseId ||
    !isValidExerciseId(exerciseId)
  ) {
    return response.status(400).json({
      message: 'Identificador de exercício inválido.',
    })
  }

  try {
    const workoutXResponse = await fetch(
      `${WORKOUTX_API_URL}/gifs/${encodeURIComponent(
        exerciseId,
      )}`,
      {
        method: 'GET',
        headers: {
          Accept: 'image/gif,image/*',
          'X-WorkoutX-Key': apiKey,
        },
      },
    )

    if (!workoutXResponse.ok) {
      console.error(
        'Erro ao carregar GIF da WorkoutX:',
        workoutXResponse.status,
        exerciseId,
      )

      return response.status(workoutXResponse.status).json({
        message: 'GIF do exercício não encontrado.',
      })
    }

    const contentType =
      workoutXResponse.headers.get('content-type') ??
      'image/gif'

    const gifBuffer = Buffer.from(
      await workoutXResponse.arrayBuffer(),
    )

    response.setHeader('Content-Type', contentType)

    response.setHeader(
      'Cache-Control',
      [
        'public',
        'max-age=86400',
        's-maxage=604800',
        'stale-while-revalidate=86400',
      ].join(', '),
    )

    return response.status(200).send(gifBuffer)
  } catch (error) {
    console.error(
      'Não foi possível carregar o GIF da WorkoutX.',
      error,
    )

    return response.status(500).json({
      message: 'Não foi possível carregar o GIF.',
    })
  }
}