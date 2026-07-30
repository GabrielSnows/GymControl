import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

type SearchableExercise = {
  source_id: string
  display_name: string
  original_name: string
  aliases: string[] | null
  translated_target: string | null
  translated_body_part: string | null
  translated_equipment: string | null
}

const SEARCH_TERMS = [
  'supino',
  'supino inclinado',
  'agachamento',
  'rosca',
  'desenvolvimento',
  'peitoral',
  'ombro',
  'halter',
  'barra',
]

const RESULT_LIMIT = 10

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`A variável de ambiente ${name} não foi definida.`)
  }

  return value
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function searchableText(exercise: SearchableExercise): string {
  return normalize([
    exercise.display_name,
    exercise.original_name,
    ...(exercise.aliases ?? []),
    exercise.translated_target ?? '',
    exercise.translated_body_part ?? '',
    exercise.translated_equipment ?? '',
  ].join(' '))
}

function scoreExercise(exercise: SearchableExercise, term: string): number {
  const query = normalize(term)
  const displayName = normalize(exercise.display_name)
  const originalName = normalize(exercise.original_name)
  const aliases = (exercise.aliases ?? []).map(normalize)
  const target = normalize(exercise.translated_target ?? '')
  const bodyPart = normalize(exercise.translated_body_part ?? '')
  const equipment = normalize(exercise.translated_equipment ?? '')
  const allText = searchableText(exercise)

  let score = 0

  if (displayName === query) score += 100
  if (displayName.startsWith(query)) score += 60
  if (displayName.includes(query)) score += 40
  if (aliases.includes(query)) score += 50
  if (aliases.some(alias => alias.startsWith(query))) score += 30
  if (aliases.some(alias => alias.includes(query))) score += 20
  if (originalName.includes(query)) score += 15
  if (target.includes(query)) score += 12
  if (bodyPart.includes(query)) score += 10
  if (equipment.includes(query)) score += 10
  if (allText.includes(query)) score += 5

  return score
}

async function main(): Promise<void> {
  const supabaseUrl = requireEnvironmentVariable('SUPABASE_URL')
  const serviceRoleKey = requireEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase
    .from('exercises')
    .select(`
      source_id,
      display_name,
      original_name,
      aliases,
      translated_target,
      translated_body_part,
      translated_equipment
    `)
    .returns<SearchableExercise[]>()

  if (error) {
    throw error
  }

  const exercises = data ?? []

  console.log(`Exercícios carregados do Supabase: ${exercises.length}`)

  if (exercises.length === 0) {
    console.log('Nenhum exercício encontrado na tabela exercises.')
    return
  }

  for (const term of SEARCH_TERMS) {
    const results = exercises
      .map(exercise => ({
        exercise,
        score: scoreExercise(exercise, term),
      }))
      .filter(result => result.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        return left.exercise.display_name.localeCompare(
          right.exercise.display_name,
          'pt-BR',
        )
      })
      .slice(0, RESULT_LIMIT)

    console.log('')
    console.log(`Pesquisa: "${term}"`)
    console.log(`Resultados encontrados: ${results.length}`)

    if (results.length === 0) {
      console.log('  Nenhum resultado.')
      continue
    }

    results.forEach(({ exercise, score }, index) => {
      console.log(
        `  ${index + 1}. [${exercise.source_id}] ${exercise.display_name} ` +
        `(pontuação: ${score})`,
      )
    })
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})