import { createClient } from '@supabase/supabase-js'
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  localizeExercise,
  normalizeExerciseText,
} from '../src/services/exercise/exerciseTranslationService.js'

import type { Exercise } from '../src/types/exercise.js'

const BATCH_SIZE = Number(
  process.env.EXERCISE_ENRICH_BATCH_SIZE ?? 10,
)

const MAX_BATCHES = Number(
  process.env.EXERCISE_ENRICH_MAX_BATCHES ?? 1,
)

const CHECKPOINT_PATH = resolve(
  process.cwd(),
  'scripts/.exercise-enrich-checkpoint.json',
)

type ExerciseRow = {
  id: string
  source: 'workoutx'
  source_id: string

  original_name: string
  display_name: string
  aliases: string[]

  original_target: string | null
  original_body_part: string | null
  original_equipment: string | null
  original_secondary_muscles: string[]

  translated_target: string | null
  translated_body_part: string | null
  translated_equipment: string | null
  translated_secondary_muscles: string[]

  description: string | null
  instructions: string[]

  translated_description: string | null
  translated_instructions: string[]

  gif_url: string | null
  muscle_wiki_url: string | null

  category: string | null
  difficulty: string | null
  mechanic: string | null
  force: string | null

  met: number | null
  calories_per_minute: number | null
  is_unilateral: boolean | null
  popularity_rank: number | null

  recommended_sets: string | null
  recommended_reps: string | null
}

type EnrichmentCheckpoint = {
  offset: number
  processed: number
  finished: boolean
  updatedAt?: string
}

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `A variável ${name} não está configurada.`,
    )
  }

  return value
}

function loadCheckpoint(): EnrichmentCheckpoint {
  if (!existsSync(CHECKPOINT_PATH)) {
    return {
      offset: 0,
      processed: 0,
      finished: false,
    }
  }

  try {
    const checkpoint = JSON.parse(
      readFileSync(CHECKPOINT_PATH, 'utf8'),
    ) as Partial<EnrichmentCheckpoint>

    return {
      offset:
        typeof checkpoint.offset === 'number'
          ? checkpoint.offset
          : 0,

      processed:
        typeof checkpoint.processed === 'number'
          ? checkpoint.processed
          : 0,

      finished: checkpoint.finished === true,

      updatedAt: checkpoint.updatedAt,
    }
  } catch {
    return {
      offset: 0,
      processed: 0,
      finished: false,
    }
  }
}

async function saveCheckpoint(
  checkpoint: EnrichmentCheckpoint,
) {
  await mkdir(dirname(CHECKPOINT_PATH), {
    recursive: true,
  })

  writeFileSync(
    CHECKPOINT_PATH,
    JSON.stringify(checkpoint, null, 2),
    'utf8',
  )
}

function mapRowToExercise(
  row: ExerciseRow,
): Exercise {
  return {
    id: `workoutx-${row.source_id}`,
    source: 'workoutx',
    sourceId: row.source_id,

    name: row.original_name,
    displayName: row.original_name,
    originalName: row.original_name,

    translationConfidence: 'fallback',
    unresolvedNameTerms: [],

    muscle:
      row.original_target ?? 'Não informado',

    bodyPart:
      row.original_body_part ?? 'Não informado',

    equipment:
      row.original_equipment ?? 'Não informado',

    secondaryMuscles:
      row.original_secondary_muscles ?? [],

    originalTarget:
      row.original_target ?? '',

    originalBodyPart:
      row.original_body_part ?? '',

    originalEquipment:
      row.original_equipment ?? '',

    originalSecondaryMuscles:
      row.original_secondary_muscles ?? [],

    description: row.description ?? '',

    instructions: row.instructions ?? [],

    gifUrl:
      row.gif_url ??
      `/api/exercise-gif?id=${encodeURIComponent(
        row.source_id,
      )}`,

    muscleWikiUrl:
      row.muscle_wiki_url ?? undefined,

    category: row.category ?? undefined,
    difficulty: row.difficulty ?? undefined,
    mechanic: row.mechanic ?? undefined,
    force: row.force ?? undefined,

    met: row.met ?? undefined,

    caloriesPerMinute:
      row.calories_per_minute ?? undefined,

    isUnilateral:
      row.is_unilateral ?? undefined,

    popularityRank:
      row.popularity_rank ?? undefined,

    recommendedSets:
      row.recommended_sets ?? undefined,

    recommendedReps:
      row.recommended_reps ?? undefined,
  }
}

function createAliases(exercise: Exercise) {
  const aliases = new Set<string>()

  const addAlias = (value?: string) => {
    const normalized = value
      ? normalizeExerciseText(value)
      : ''

    if (normalized.length >= 2) {
      aliases.add(normalized)
    }
  }

  addAlias(exercise.displayName)
  addAlias(exercise.originalName)
  addAlias(exercise.muscle)
  addAlias(exercise.bodyPart)
  addAlias(exercise.equipment)

    const displayWords: string[] =
        normalizeExerciseText(exercise.displayName)
            .split(' ')
            .filter((word: string) => word.length >= 3)

  for (
    let index = 1;
    index <= displayWords.length;
    index += 1
  ) {
    addAlias(
      displayWords.slice(0, index).join(' '),
    )
  }

  return [...aliases]
}

function createUpdate(row: ExerciseRow) {
  const localizedExercise = localizeExercise(
    mapRowToExercise(row),
  )

  /*
   * Se o tradutor não reconhecer o nome com segurança,
   * preservamos o original para não perder informações.
   */
  const displayName =
    localizedExercise.translationConfidence ===
    'fallback'
      ? row.original_name
      : localizedExercise.displayName

  const exerciseWithFinalName: Exercise = {
    ...localizedExercise,
    name: displayName,
    displayName,
  }

  return {
    id: row.id,

    display_name: displayName,

    aliases: createAliases(
      exerciseWithFinalName,
    ),

    translated_target:
      localizedExercise.muscle ===
      'Não informado'
        ? null
        : localizedExercise.muscle,

    translated_body_part:
      localizedExercise.bodyPart ===
      'Não informado'
        ? null
        : localizedExercise.bodyPart,

    translated_equipment:
      localizedExercise.equipment ===
      'Não informado'
        ? null
        : localizedExercise.equipment,

    translated_secondary_muscles:
      localizedExercise.secondaryMuscles,

    updated_at: new Date().toISOString(),
  }
}

async function main() {
  if (
    !Number.isInteger(BATCH_SIZE) ||
    BATCH_SIZE < 1
  ) {
    throw new Error(
      'EXERCISE_ENRICH_BATCH_SIZE deve ser um inteiro positivo.',
    )
  }

  if (
    !Number.isInteger(MAX_BATCHES) ||
    MAX_BATCHES < 1
  ) {
    throw new Error(
      'EXERCISE_ENRICH_MAX_BATCHES deve ser um inteiro positivo.',
    )
  }

  const supabaseUrl =
    requireEnvironmentVariable('SUPABASE_URL')

  const supabaseSecretKey =
    requireEnvironmentVariable(
      'SUPABASE_SECRET_KEY',
    )

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
    console.log(
      'O enriquecimento já foi concluído segundo o checkpoint.',
    )

    console.log(
      `Apague ${CHECKPOINT_PATH} somente se quiser reiniciar.`,
    )

    return
  }

  let offset = checkpoint.offset
  let processed = checkpoint.processed
  let batchesProcessed = 0

  console.log('Enriquecimento do catálogo')
  console.log({
    batchSize: BATCH_SIZE,
    maxBatches: MAX_BATCHES,
    startingOffset: offset,
    alreadyProcessed: processed,
  })

  while (batchesProcessed < MAX_BATCHES) {
    const from = offset
    const to = offset + BATCH_SIZE - 1

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('source_id', {
        ascending: true,
      })
      .range(from, to)

    if (error) {
      throw new Error(
        `Erro ao ler o Supabase: ${error.message}`,
      )
    }

    const rows = (data ?? []) as ExerciseRow[]

    if (rows.length === 0) {
      await saveCheckpoint({
        offset,
        processed,
        finished: true,
        updatedAt: new Date().toISOString(),
      })

      console.log(
        '\nNenhum registro adicional. Enriquecimento concluído.',
      )

      return
    }

    const updates = rows.map(createUpdate)

    const updateResults = await Promise.all(
        updates.map(async (update) => {
            const {
            id,
            ...updatedFields
            } = update

            const { error } = await supabase
            .from('exercises')
            .update(updatedFields)
            .eq('id', id)

            return error
        }),
    )

    const updateError = updateResults.find(
        (error) => error !== null,
        )

        if (updateError) {
        throw new Error(
            `Erro ao atualizar o Supabase: ${updateError.message}`,
        )
    }

    offset += rows.length
    processed += rows.length
    batchesProcessed += 1

    const finished = rows.length < BATCH_SIZE

    await saveCheckpoint({
      offset,
      processed,
      finished,
      updatedAt: new Date().toISOString(),
    })

    console.log({
      batch: batchesProcessed,
      updated: rows.length,
      nextOffset: offset,
      totalProcessed: processed,
    })

    if (finished) {
      console.log(
        '\nEnriquecimento concluído.',
      )

      return
    }
  }

  console.log(
    `\nExecução encerrada após ${MAX_BATCHES} lote(s).`,
  )

  console.log(
    `Execute novamente para continuar do offset ${offset}.`,
  )
}

main().catch((error) => {
  console.error('\nFalha no enriquecimento:')
  console.error(error)
  process.exitCode = 1
})