import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const WORKOUTX_BASE_URL = 'https://api.workoutxapp.com/v1'
const PAGE_SIZE = Number(process.env.WORKOUTX_IMPORT_PAGE_SIZE ?? 10)
const MAX_REQUESTS = Number(process.env.WORKOUTX_IMPORT_MAX_REQUESTS ?? 1)
const REQUEST_DELAY_MS = Number(process.env.WORKOUTX_IMPORT_DELAY_MS ?? 2200)
const START_OFFSET = Number(process.env.WORKOUTX_IMPORT_START_OFFSET ?? 0)

const CHECKPOINT_PATH = resolve(
  process.cwd(),
  'scripts/.workoutx-import-checkpoint.json',
)

function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`A variável ${name} não está configurada.`)
  }

  return value
}

function parseWorkoutXResponse(body) {
  if (Array.isArray(body)) {
    return { total: body.length, exercises: body }
  }

  return {
    total:
      typeof body.total === 'number'
        ? body.total
        : Array.isArray(body.data)
          ? body.data.length
          : 0,
    exercises: Array.isArray(body.data) ? body.data : [],
  }
}

function loadCheckpoint() {
  if (!existsSync(CHECKPOINT_PATH)) {
    return { nextOffset: START_OFFSET, imported: 0, finished: false }
  }

  try {
    const checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8'))

    return {
      nextOffset:
        typeof checkpoint.nextOffset === 'number'
          ? checkpoint.nextOffset
          : START_OFFSET,
      imported:
        typeof checkpoint.imported === 'number'
          ? checkpoint.imported
          : 0,
      finished: checkpoint.finished === true,
    }
  } catch {
    return { nextOffset: START_OFFSET, imported: 0, finished: false }
  }
}

async function saveCheckpoint(checkpoint) {
  await mkdir(dirname(CHECKPOINT_PATH), { recursive: true })
  writeFileSync(
    CHECKPOINT_PATH,
    JSON.stringify(checkpoint, null, 2),
    'utf8',
  )
}

function wait(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds)
  })
}

function nullableText(value) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || null
}

function mapExercise(exercise) {
  const sourceId = String(exercise.id ?? '').trim()
  const originalName = String(exercise.name ?? '').trim()

  if (!sourceId || !originalName) {
    return null
  }

  return {
    source: 'workoutx',
    source_id: sourceId,
    original_name: originalName,
    display_name: originalName,
    aliases: [originalName.toLocaleLowerCase('en-US')],
    original_target: nullableText(exercise.target),
    original_body_part: nullableText(exercise.bodyPart),
    original_equipment: nullableText(exercise.equipment),
    original_secondary_muscles: Array.isArray(exercise.secondaryMuscles)
      ? exercise.secondaryMuscles
      : [],
    translated_target: null,
    translated_body_part: null,
    translated_equipment: null,
    translated_secondary_muscles: [],
    description: nullableText(exercise.description),
    instructions: Array.isArray(exercise.instructions)
      ? exercise.instructions
      : [],
    translated_description: null,
    translated_instructions: [],
    gif_url: nullableText(exercise.gifUrl),
    muscle_wiki_url: null,
    category: nullableText(exercise.category),
    difficulty: nullableText(exercise.difficulty),
    mechanic: nullableText(exercise.mechanic),
    force: nullableText(exercise.force),
    met: typeof exercise.met === 'number' ? exercise.met : null,
    calories_per_minute:
      typeof exercise.caloriesPerMinute === 'number'
        ? exercise.caloriesPerMinute
        : null,
    is_unilateral:
      typeof exercise.isUnilateral === 'boolean'
        ? exercise.isUnilateral
        : null,
    popularity_rank:
      typeof exercise.popularityRank === 'number'
        ? exercise.popularityRank
        : null,
    recommended_sets: nullableText(exercise.recommendedSets),
    recommended_reps: nullableText(exercise.recommendedReps),
    updated_at: new Date().toISOString(),
  }
}

async function fetchWorkoutXPage(apiKey, offset) {
  const url = new URL(`${WORKOUTX_BASE_URL}/exercises`)
  url.searchParams.set('limit', String(PAGE_SIZE))
  url.searchParams.set('offset', String(offset))

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-WorkoutX-Key': apiKey,
    },
  })

  const rawBody = await response.text()

  if (!response.ok) {
    throw new Error(
      `WorkoutX respondeu ${response.status}: ${rawBody}`,
    )
  }

  return parseWorkoutXResponse(JSON.parse(rawBody))
}

async function main() {
  if (!Number.isInteger(PAGE_SIZE) || PAGE_SIZE < 1) {
    throw new Error(
      'WORKOUTX_IMPORT_PAGE_SIZE deve ser um inteiro positivo.',
    )
  }

  if (!Number.isInteger(MAX_REQUESTS) || MAX_REQUESTS < 1) {
    throw new Error(
      'WORKOUTX_IMPORT_MAX_REQUESTS deve ser um inteiro positivo.',
    )
  }

  const workoutXApiKey = requireEnvironmentVariable('WORKOUTX_API_KEY')
  const supabaseUrl = requireEnvironmentVariable('SUPABASE_URL')
  const supabaseSecretKey =
    requireEnvironmentVariable('SUPABASE_SECRET_KEY')

  const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )

  const checkpoint = loadCheckpoint()

  if (checkpoint.finished) {
    console.log('A importação já foi concluída segundo o checkpoint.')
    console.log(`Apague ${CHECKPOINT_PATH} somente se quiser reiniciar.`)
    return
  }

  let offset = checkpoint.nextOffset
  let imported = checkpoint.imported
  let requestsMade = 0
  let knownTotal = null

  console.log('Importação WorkoutX → Supabase')
  console.log({
    pageSize: PAGE_SIZE,
    maxRequests: MAX_REQUESTS,
    startingOffset: offset,
    alreadyImported: imported,
  })

  while (requestsMade < MAX_REQUESTS) {
    console.log(`\nBuscando offset ${offset}...`)

    const page = await fetchWorkoutXPage(workoutXApiKey, offset)

    requestsMade += 1
    knownTotal = page.total

    const rows = page.exercises.map(mapExercise).filter(Boolean)

    console.log({
      request: requestsMade,
      received: page.exercises.length,
      validRows: rows.length,
      total: page.total,
    })

    if (rows.length === 0) {
      await saveCheckpoint({
        nextOffset: offset,
        imported,
        finished: true,
        total: knownTotal,
        updatedAt: new Date().toISOString(),
      })

      console.log(
        '\nNenhum exercício adicional retornado. Importação concluída.',
      )
      return
    }

    const { error } = await supabase
      .from('exercises')
      .upsert(rows, {
        onConflict: 'source,source_id',
      })

    if (error) {
      throw new Error(
        `Erro ao salvar no Supabase: ${error.message}`,
      )
    }

    offset += page.exercises.length
    imported += rows.length

    const finished =
      page.exercises.length < PAGE_SIZE ||
      (knownTotal !== null && offset >= knownTotal)

    await saveCheckpoint({
      nextOffset: offset,
      imported,
      finished,
      total: knownTotal,
      requestsMadeInLastRun: requestsMade,
      updatedAt: new Date().toISOString(),
    })

    console.log(`Salvos. Próximo offset: ${offset}.`)

    if (finished) {
      console.log(
        `\nImportação concluída: ${imported} exercícios processados.`,
      )
      return
    }

    if (requestsMade < MAX_REQUESTS) {
      await wait(REQUEST_DELAY_MS)
    }
  }

  console.log(
    `\nExecução encerrada pelo limite de ${MAX_REQUESTS} requisição(ões).`,
  )
  console.log(`Execute novamente para continuar do offset ${offset}.`)
}

main().catch((error) => {
  console.error('\nFalha na importação:')
  console.error(error)
  process.exitCode = 1
})
