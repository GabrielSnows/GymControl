import { createClient } from '@supabase/supabase-js'
import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

type IncomingPayload = {
  exercise?: Record<string, unknown>
  aliases?: string[]
}

function createServerClient() {
  const url = process.env.SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    throw new Error(
      'As variáveis do Supabase não estão configuradas.',
    )
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function queryValue(
  request: VercelRequest,
  name: string,
) {
  const value = request.query[name]

  return Array.isArray(value)
    ? value[0]?.trim() ?? ''
    : value?.trim() ?? ''
}

async function search(
  request: VercelRequest,
  response: VercelResponse,
) {
  const query = queryValue(request, 'query')

  if (query.length < 2) {
    return response.status(200).json({
      exercises: [],
    })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .or(
      [
        `display_name.ilike.%${query}%`,
        `original_name.ilike.%${query}%`,
        `translated_target.ilike.%${query}%`,
        `translated_body_part.ilike.%${query}%`,
        `translated_equipment.ilike.%${query}%`,
      ].join(','),
    )
    .limit(20)

  if (error) {
    console.error(error)

    return response.status(500).json({
      message:
        'Não foi possível consultar a biblioteca.',
    })
  }

  return response.status(200).json({
    exercises: data ?? [],
  })
}

async function upsert(
  request: VercelRequest,
  response: VercelResponse,
) {
  const payload = request.body as IncomingPayload
  const exercise = payload.exercise as any

  if (
    !exercise?.sourceId ||
    !exercise?.originalName ||
    !exercise?.displayName
  ) {
    return response.status(400).json({
      message: 'Dados incompletos.',
    })
  }

  const aliases = [
    exercise.displayName,
    exercise.originalName,
    ...(payload.aliases ?? []),
  ]
    .map(normalize)
    .filter(Boolean)

  const row = {
    source: exercise.source ?? 'workoutx',
    source_id: exercise.sourceId,
    original_name: exercise.originalName,
    display_name: exercise.displayName,
    aliases: [...new Set(aliases)],
    original_target:
      exercise.originalTarget || null,
    original_body_part:
      exercise.originalBodyPart || null,
    original_equipment:
      exercise.originalEquipment || null,
    original_secondary_muscles:
      exercise.originalSecondaryMuscles ?? [],
    translated_target: exercise.muscle || null,
    translated_body_part:
      exercise.bodyPart || null,
    translated_equipment:
      exercise.equipment || null,
    translated_secondary_muscles:
      exercise.secondaryMuscles ?? [],
    description: exercise.description || null,
    instructions: exercise.instructions ?? [],
    translated_description: null,
    translated_instructions: [],
    gif_url: exercise.gifUrl || null,
    muscle_wiki_url:
      exercise.muscleWikiUrl || null,
    category: exercise.category || null,
    difficulty: exercise.difficulty || null,
    mechanic: exercise.mechanic || null,
    force: exercise.force || null,
    met: exercise.met ?? null,
    calories_per_minute:
      exercise.caloriesPerMinute ?? null,
    is_unilateral:
      exercise.isUnilateral ?? null,
    popularity_rank:
      exercise.popularityRank ?? null,
    recommended_sets:
      exercise.recommendedSets || null,
    recommended_reps:
      exercise.recommendedReps || null,
    updated_at: new Date().toISOString(),
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('exercises')
    .upsert(row, {
      onConflict: 'source,source_id',
    })
    .select('*')
    .single()

  if (error) {
    console.error(error)

    return response.status(500).json({
      message:
        'Não foi possível salvar o exercício.',
    })
  }

  return response.status(200).json({
    exercise: data,
  })
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method === 'GET') {
      return await search(request, response)
    }

    if (request.method === 'POST') {
      return await upsert(request, response)
    }

    response.setHeader('Allow', 'GET, POST')

    return response.status(405).json({
      message: 'Método não permitido.',
    })
  } catch (error) {
    console.error(error)

    return response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : 'Erro inesperado.',
    })
  }
}
