import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })

type JsonObject = Record<string, unknown>

type Exercise = {
  sourceId: string
  originalName: string
  displayName: string
  aliases: string[]
  target: string
  bodyPart: string
  equipment: string
  secondaryMuscles: string[]
  translatedTarget: string
  translatedBodyPart: string
  translatedEquipment: string
  translatedSecondaryMuscles: string[]
  description: string
  instructions: string[]
  translatedDescription: string | null
  translatedInstructions: string[]
  gifUrl: string
  muscleWikiUrl: string | null
  category: string
  difficulty: string
  mechanic: string
  force: string
  met: number
  caloriesPerMinute: number
  isUnilateral: boolean
  popularityRank: number
  recommendedSets: string
  recommendedReps: string
}

type Catalog = {
  metadata?: JsonObject
  exercises: Exercise[]
}

type DatabaseExercise = {
  source: string
  source_id: string
  original_name: string
  display_name: string
  aliases: string[]
  original_target: string
  original_body_part: string
  original_equipment: string
  original_secondary_muscles: string[]
  translated_target: string
  translated_body_part: string
  translated_equipment: string
  translated_secondary_muscles: string[]
  description: string
  instructions: string[]
  translated_description: string | null
  translated_instructions: string[]
  gif_url: string
  muscle_wiki_url: string | null
  category: string
  difficulty: string
  mechanic: string
  force: string
  met: number
  calories_per_minute: number
  is_unilateral: boolean
  popularity_rank: number
  recommended_sets: string
  recommended_reps: string
}

type ImportReport = {
  status: 'completed' | 'failed' | 'not_started'
  total: number
  inserted: number
  updated: number
  ignored: number
  failed: number
  duration: string
  startedAt: string | null
  finishedAt: string | null
  failedBatch: number | null
  failedSourceId: string | null
  error: string | null
}

const TABLE_NAME = 'exercises'
const CONFLICT_COLUMNS = 'source,source_id'
const SOURCE_NAME = 'workoutx'
const BATCH_SIZE = 100
const EXPECTED_TOTAL = 1327

const DATABASE_COLUMNS: Array<keyof DatabaseExercise> = [
  'source',
  'source_id',
  'original_name',
  'display_name',
  'aliases',
  'original_target',
  'original_body_part',
  'original_equipment',
  'original_secondary_muscles',
  'translated_target',
  'translated_body_part',
  'translated_equipment',
  'translated_secondary_muscles',
  'description',
  'instructions',
  'translated_description',
  'translated_instructions',
  'gif_url',
  'muscle_wiki_url',
  'category',
  'difficulty',
  'mechanic',
  'force',
  'met',
  'calories_per_minute',
  'is_unilateral',
  'popularity_rank',
  'recommended_sets',
  'recommended_reps',
]

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`A variável de ambiente ${name} não foi definida.`)
  }

  return value
}

function assertString(value: unknown, field: string, sourceId: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Exercício ${sourceId}: o campo ${field} está vazio ou inválido.`)
  }
}

function assertStringArray(
  value: unknown,
  field: string,
  sourceId: string,
): asserts value is string[] {
  if (
    !Array.isArray(value) ||
    value.some(item => typeof item !== 'string')
  ) {
    throw new Error(`Exercício ${sourceId}: o campo ${field} não é um array de strings válido.`)
  }
}

function validateExercise(exercise: Exercise, index: number): void {
  const sourceId = typeof exercise.sourceId === 'string'
    ? exercise.sourceId
    : `índice ${index}`

  assertString(exercise.sourceId, 'sourceId', sourceId)
  assertString(exercise.originalName, 'originalName', sourceId)
  assertString(exercise.displayName, 'displayName', sourceId)
  assertString(exercise.target, 'target', sourceId)
  assertString(exercise.bodyPart, 'bodyPart', sourceId)
  assertString(exercise.equipment, 'equipment', sourceId)
  assertString(exercise.translatedTarget, 'translatedTarget', sourceId)
  assertString(exercise.translatedBodyPart, 'translatedBodyPart', sourceId)
  assertString(exercise.translatedEquipment, 'translatedEquipment', sourceId)

  assertStringArray(exercise.aliases, 'aliases', sourceId)
  assertStringArray(exercise.secondaryMuscles, 'secondaryMuscles', sourceId)
  assertStringArray(
    exercise.translatedSecondaryMuscles,
    'translatedSecondaryMuscles',
    sourceId,
  )
  assertStringArray(exercise.instructions, 'instructions', sourceId)
  assertStringArray(exercise.translatedInstructions, 'translatedInstructions', sourceId)

  if (exercise.aliases.length === 0) {
    throw new Error(`Exercício ${sourceId}: aliases está vazio.`)
  }

  if (exercise.secondaryMuscles.length !== exercise.translatedSecondaryMuscles.length) {
    throw new Error(
      `Exercício ${sourceId}: secondaryMuscles e translatedSecondaryMuscles possuem tamanhos diferentes.`,
    )
  }
}

function toDatabaseExercise(exercise: Exercise): DatabaseExercise {
  return {
    source: SOURCE_NAME,
    source_id: exercise.sourceId,
    original_name: exercise.originalName,
    display_name: exercise.displayName,
    aliases: exercise.aliases,
    original_target: exercise.target,
    original_body_part: exercise.bodyPart,
    original_equipment: exercise.equipment,
    original_secondary_muscles: exercise.secondaryMuscles,
    translated_target: exercise.translatedTarget,
    translated_body_part: exercise.translatedBodyPart,
    translated_equipment: exercise.translatedEquipment,
    translated_secondary_muscles: exercise.translatedSecondaryMuscles,
    description: exercise.description,
    instructions: exercise.instructions,
    translated_description: exercise.translatedDescription,
    translated_instructions: exercise.translatedInstructions,
    gif_url: exercise.gifUrl,
    muscle_wiki_url: exercise.muscleWikiUrl,
    category: exercise.category,
    difficulty: exercise.difficulty,
    mechanic: exercise.mechanic,
    force: exercise.force,
    met: exercise.met,
    calories_per_minute: exercise.caloriesPerMinute,
    is_unilateral: exercise.isUnilateral,
    popularity_rank: exercise.popularityRank,
    recommended_sets: exercise.recommendedSets,
    recommended_reps: exercise.recommendedReps,
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size))
  }

  return batches
}

function formatDuration(milliseconds: number): string {
  const seconds = milliseconds / 1000

  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds - minutes * 60
  return `${minutes}m ${remainingSeconds.toFixed(2)}s`
}

async function saveReport(path: string, report: ImportReport): Promise<void> {
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

async function validateDatabaseSchema(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .select(DATABASE_COLUMNS.join(','))
    .limit(1)

  if (error) {
    throw new Error(
      [
        'A estrutura atual da tabela exercises não corresponde ao catálogo.',
        `Detalhes do Supabase: ${error.message}`,
        '',
        'Nenhuma escrita foi realizada.',
        'O script espera a estrutura real informada da tabela exercises, incluindo as colunas original_target, original_body_part, original_equipment e original_secondary_muscles.',
        'Caso a tabela realmente precise de migração, gere e revise o SQL separadamente antes de executá-lo.',
      ].join('\n'),
    )
  }
}

async function loadExistingSourceIds(
  supabase: SupabaseClient,
  sourceIds: string[],
): Promise<Set<string>> {
  const existing = new Set<string>()

  for (const sourceIdBatch of chunk(sourceIds, 500)) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('source_id')
      .eq('source', SOURCE_NAME)
      .in('source_id', sourceIdBatch)

    if (error) {
      throw new Error(
        `Falha ao consultar exercícios existentes: ${error.message}`,
      )
    }

    for (const row of data ?? []) {
      if (typeof row.source_id === 'string') {
        existing.add(row.source_id)
      }
    }
  }

  return existing
}

function describeFailedBatch(
  batch: DatabaseExercise[],
  batchNumber: number,
  errorMessage: string,
): Error {
  const first = batch[0]
  const last = batch[batch.length - 1]

  return new Error(
    [
      `Falha no lote ${batchNumber}.`,
      `Intervalo do lote: ${first?.source_id ?? 'desconhecido'} a ${last?.source_id ?? 'desconhecido'}.`,
      `Erro do Supabase: ${errorMessage}`,
      '',
      'A execução foi interrompida imediatamente.',
      'Nenhuma tentativa individual foi feita, evitando importações parciais adicionais.',
    ].join('\n'),
  )
}

async function main(): Promise<void> {
  const root = resolve(import.meta.dirname, '..')
  const catalogPath = resolve(root, 'catalog', 'exercises-pt.json')
  const reportPath = resolve(root, 'catalog', 'import-report.json')

  const report: ImportReport = {
    status: 'not_started',
    total: 0,
    inserted: 0,
    updated: 0,
    ignored: 0,
    failed: 0,
    duration: '0s',
    startedAt: null,
    finishedAt: null,
    failedBatch: null,
    failedSourceId: null,
    error: null,
  }

  const startedAt = new Date()
  const startedPerformance = performance.now()
  report.startedAt = startedAt.toISOString()

  try {
    const supabaseUrl = requireEnvironmentVariable('SUPABASE_URL')
    const serviceRoleKey =
      process.env.SUPABASE_SECRET_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    if (!serviceRoleKey) {
      throw new Error(
        'Defina SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local.',
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const rawCatalog = await readFile(catalogPath, 'utf8')
    const catalog = JSON.parse(rawCatalog) as Catalog

    if (!Array.isArray(catalog.exercises)) {
      throw new Error('O campo exercises do catálogo não é um array.')
    }

    if (catalog.exercises.length !== EXPECTED_TOTAL) {
      throw new Error(
        `Quantidade inválida: esperado ${EXPECTED_TOTAL}, encontrado ${catalog.exercises.length}.`,
      )
    }

    catalog.exercises.forEach(validateExercise)

    const sourceIds = catalog.exercises.map(exercise => exercise.sourceId)
    const uniqueIds = new Set(sourceIds)

    if (uniqueIds.size !== sourceIds.length) {
      throw new Error('O catálogo possui sourceId duplicado. Importação interrompida.')
    }

    console.log('Validando estrutura da tabela exercises...')
    await validateDatabaseSchema(supabase)
    console.log('Estrutura compatível. Nenhuma escrita foi feita durante a validação.')

    console.log('Consultando registros já existentes...')
    const existingSourceIds = await loadExistingSourceIds(supabase, sourceIds)

    const rows = catalog.exercises.map(toDatabaseExercise)
    const batches = chunk(rows, BATCH_SIZE)

    report.total = rows.length
    report.inserted = rows.filter(row => !existingSourceIds.has(row.source_id)).length
    report.updated = rows.filter(row => existingSourceIds.has(row.source_id)).length

    for (let index = 0; index < batches.length; index += 1) {
      const batch = batches[index]
      const batchNumber = index + 1

      console.log('')
      console.log(`Lote ${batchNumber}/${batches.length}`)
      console.log(`${batch.length} exercícios em processamento...`)

      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(batch, { onConflict: CONFLICT_COLUMNS })

      if (error) {
        report.status = 'failed'
        report.failed = batch.length
        report.failedBatch = batchNumber
        report.error = error.message

        throw describeFailedBatch(batch, batchNumber, error.message)
      }

      console.log(`${batch.length} importados`)
    }

    report.status = 'completed'
    report.failed = 0
    report.finishedAt = new Date().toISOString()
    report.duration = formatDuration(performance.now() - startedPerformance)

    await saveReport(reportPath, report)

    console.log('')
    console.log('Importação concluída.')
    console.log(`Total: ${report.total}`)
    console.log(`Inseridos: ${report.inserted}`)
    console.log(`Atualizados: ${report.updated}`)
    console.log(`Ignorados: ${report.ignored}`)
    console.log(`Falhas: ${report.failed}`)
    console.log(`Tempo: ${report.duration}`)
    console.log(`Relatório: ${reportPath}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    report.status = 'failed'
    report.failed = report.failed || 1
    report.error = message
    report.finishedAt = new Date().toISOString()
    report.duration = formatDuration(performance.now() - startedPerformance)

    await saveReport(reportPath, report)

    console.error('')
    console.error('Importação interrompida.')
    console.error(message)
    console.error(`Relatório: ${reportPath}`)
    process.exitCode = 1
  }
}

main()