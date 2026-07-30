import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

type Exercise = Record<string, unknown> & {
  sourceId?: unknown
  originalName?: unknown
  displayName?: unknown
  aliases?: unknown
  target?: unknown
  translatedTarget?: unknown
  bodyPart?: unknown
  translatedBodyPart?: unknown
  equipment?: unknown
  translatedEquipment?: unknown
  secondaryMuscles?: unknown
  translatedSecondaryMuscles?: unknown
}

type Catalog = {
  metadata?: Record<string, unknown>
  exercises?: unknown
}

type DuplicateGroup = {
  value: string
  sourceIds: string[]
}

type TranslationIssue = {
  sourceId: string
  field: string
  value: string
  reason: string
}

const EXPECTED_TOTAL = 1327
const REQUIRED_FIELDS = [
  'sourceId',
  'originalName',
  'displayName',
  'aliases',
  'target',
  'bodyPart',
  'equipment',
] as const

const muscleTranslations: Record<string, string> = {
  Abdominals: 'Abdômen', Abductors: 'Abdutores', Abs: 'Abdômen',
  Adductors: 'Adutores', 'Ankle Stabilizers': 'Estabilizadores do tornozelo',
  Ankles: 'Tornozelos', Back: 'Costas', Biceps: 'Bíceps', Brachialis: 'Braquial',
  Calves: 'Panturrilhas', 'Cardiovascular System': 'Sistema cardiovascular',
  Chest: 'Peitoral', Core: 'Core', Deltoids: 'Deltoides', Delts: 'Deltoides',
  Feet: 'Pés', Forearms: 'Antebraços', Glutes: 'Glúteos',
  'Grip Muscles': 'Músculos da pegada', Groin: 'Virilha',
  Hamstrings: 'Posteriores de coxa', Hands: 'Mãos',
  'Hip Flexors': 'Flexores do quadril', 'Inner Thighs': 'Parte interna das coxas',
  Lats: 'Dorsais', 'Latissimus Dorsi': 'Latíssimo do dorso',
  'Levator Scapulae': 'Elevador da escápula', 'Lower Abs': 'Abdômen inferior',
  'Lower Back': 'Lombar', Obliques: 'Oblíquos', Pectorals: 'Peitoral',
  Quadriceps: 'Quadríceps', Quads: 'Quadríceps',
  'Rear Deltoids': 'Deltoides posteriores', Rhomboids: 'Romboides',
  'Rotator Cuff': 'Manguito rotador', 'Serratus Anterior': 'Serrátil anterior',
  Shins: 'Tibiais', Shoulders: 'Ombros', Soleus: 'Sóleo', Spine: 'Coluna',
  Sternocleidomastoid: 'Esternocleidomastoideo', Trapezius: 'Trapézio',
  Traps: 'Trapézio', Triceps: 'Tríceps',
  'Upper Back': 'Parte superior das costas', 'Upper Chest': 'Peitoral superior',
  'Wrist Extensors': 'Extensores do punho', 'Wrist Flexors': 'Flexores do punho',
  Wrists: 'Punhos',
}

const bodyPartTranslations: Record<string, string> = {
  Back: 'Costas', Cardio: 'Cardio', Chest: 'Peitoral',
  'Lower Arms': 'Antebraços', 'Lower Legs': 'Pernas', Neck: 'Pescoço',
  Shoulders: 'Ombros', 'Upper Arms': 'Braços', 'Upper Legs': 'Pernas',
  Waist: 'Abdômen',
}

const equipmentTranslations: Record<string, string> = {
  Assisted: 'Assistido', 'Assisted (towel)': 'Assistido com toalha',
  Band: 'Faixa elástica', Barbell: 'Barra', 'Body Weight': 'Peso corporal',
  'Body Weight (with Resistance Band)': 'Peso corporal com faixa elástica',
  'Bosu Ball': 'Bosu', Cable: 'Cabo', Dumbbell: 'Halter',
  'Dumbbell (used As Handles For Deeper Range)': 'Halteres usados como apoio para maior amplitude',
  'Dumbbell, Exercise Ball': 'Halter e bola suíça',
  'Dumbbell, Exercise Ball, Tennis Ball': 'Halter, bola suíça e bola de tênis',
  'Elliptical Machine': 'Elíptico', 'Exercise Ball': 'Bola suíça',
  'Ez Barbell': 'Barra W', 'EZ Barbell': 'Barra W',
  'Ez Barbell, Exercise Ball': 'Barra W e bola suíça', Hammer: 'Martelo',
  Kettlebell: 'Kettlebell', 'Leverage Machine': 'Máquina',
  'Medicine Ball': 'Medicine ball', 'Olympic Barbell': 'Barra olímpica',
  'Resistance Band': 'Faixa elástica', Roller: 'Rolo', Rope: 'Corda',
  'Sledge Hammer': 'Marreta', 'Skierg Machine': 'Ergômetro de esqui',
  'Sled Machine': 'Trenó', 'Smith Machine': 'Smith',
  'Stability Ball': 'Bola suíça', 'Stationary Bike': 'Bicicleta ergométrica',
  'Stepmill Machine': 'Escada ergométrica', Tire: 'Pneu',
  'Trap Bar': 'Barra hexagonal', Treadmill: 'Esteira',
  'Upper Body Ergometer': 'Ergômetro de braços', Weighted: 'Peso adicional',
  'Wheel Roller': 'Roda abdominal',
}

const ACCEPTED_TECHNICAL_TERMS = new Set([
  'smith', 'kettlebell', 'bosu', 'core', 'medicine ball', 'zercher',
  'pallof', 'clean', 'snatch', 'landmine',
])

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalized(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
}

function sourceIdOf(exercise: Exercise, index: number): string {
  return asTrimmedString(exercise.sourceId) || `index:${index}`
}

function findDuplicateGroups(
  exercises: Exercise[],
  selector: (exercise: Exercise) => string,
): DuplicateGroup[] {
  const groups = new Map<string, { value: string; sourceIds: string[] }>()

  exercises.forEach((exercise, index) => {
    const value = selector(exercise)
    if (!value) return
    const key = normalized(value)
    const current = groups.get(key) ?? { value, sourceIds: [] }
    current.sourceIds.push(sourceIdOf(exercise, index))
    groups.set(key, current)
  })

  return [...groups.values()]
    .filter(group => group.sourceIds.length > 1)
    .sort((a, b) => a.value.localeCompare(b.value, 'pt-BR'))
}

function validTranslationValues(dictionary: Record<string, string>): Set<string> {
  return new Set(Object.values(dictionary).map(normalized))
}

const VALID_MUSCLE_TRANSLATIONS = validTranslationValues(muscleTranslations)
const VALID_BODY_PART_TRANSLATIONS = validTranslationValues(bodyPartTranslations)
const VALID_EQUIPMENT_TRANSLATIONS = validTranslationValues(equipmentTranslations)

function validateTranslation(
  sourceId: string,
  field: string,
  rawValue: unknown,
  validValues: Set<string>,
  issues: TranslationIssue[],
): void {
  const value = asTrimmedString(rawValue)
  if (!value) {
    issues.push({ sourceId, field, value, reason: 'tradução vazia ou ausente' })
    return
  }

  const key = normalized(value)
  if (validValues.has(key) || ACCEPTED_TECHNICAL_TERMS.has(key)) return

  issues.push({
    sourceId,
    field,
    value,
    reason: 'valor não corresponde aos dicionários de tradução nem à lista de termos técnicos aceitos',
  })
}

async function main(): Promise<void> {
  const root = resolve(import.meta.dirname, '..')
  const catalogPath = resolve(root, 'catalog', 'exercises-pt.json')
  const reportPath = resolve(root, 'catalog', 'catalog-validation-report.json')

  const raw = await readFile(catalogPath, 'utf8')
  const catalog = JSON.parse(raw) as Catalog

  if (!Array.isArray(catalog.exercises)) {
    throw new Error('O campo "exercises" não é um array.')
  }

  const exercises = catalog.exercises as Exercise[]
  const duplicateIds = findDuplicateGroups(exercises, exercise => asTrimmedString(exercise.sourceId))
  const duplicateDisplayNames = findDuplicateGroups(
    exercises,
    exercise => asTrimmedString(exercise.displayName),
  )

  const missingIds: Array<{ index: number; reason: string }> = []
  const missingDisplayNames: Array<{ sourceId: string; reason: string }> = []
  const missingAliases: Array<{ sourceId: string; reason: string }> = []
  const duplicateAliases: Array<{ sourceId: string; aliases: string[] }> = []
  const globalAliasOwners = new Map<string, Set<string>>()
  const englishTranslations: TranslationIssue[] = []
  const errors: string[] = []
  const warnings: string[] = []

  exercises.forEach((exercise, index) => {
    const sourceId = sourceIdOf(exercise, index)
    const rawId = asTrimmedString(exercise.sourceId)

    if (!rawId) {
      missingIds.push({ index, reason: 'sourceId vazio ou ausente' })
    } else if (!/^\d+$/.test(rawId)) {
      errors.push(`O exercício ${sourceId} possui sourceId não numérico.`)
    }

    for (const field of REQUIRED_FIELDS) {
      const value = exercise[field]
      const missing = value === undefined || value === null ||
        (typeof value === 'string' && value.trim() === '')
      if (missing) {
        errors.push(`O exercício ${sourceId} não possui o campo obrigatório ${field}.`)
      }
    }

    if (!asTrimmedString(exercise.displayName)) {
      missingDisplayNames.push({ sourceId, reason: 'displayName vazio ou ausente' })
    }

    if (!Array.isArray(exercise.aliases) || exercise.aliases.length === 0) {
      missingAliases.push({ sourceId, reason: 'aliases vazio, ausente ou inválido' })
    } else {
      const localAliases = new Map<string, string[]>()
      for (const aliasValue of exercise.aliases) {
        if (typeof aliasValue !== 'string' || !aliasValue.trim()) {
          warnings.push(`O exercício ${sourceId} possui alias vazio ou inválido.`)
          continue
        }
        const alias = aliasValue.trim()
        const key = normalized(alias)
        const occurrences = localAliases.get(key) ?? []
        occurrences.push(alias)
        localAliases.set(key, occurrences)

        const owners = globalAliasOwners.get(key) ?? new Set<string>()
        owners.add(sourceId)
        globalAliasOwners.set(key, owners)
      }

      const repeated = [...localAliases.values()]
        .filter(values => values.length > 1)
        .flat()
      if (repeated.length > 0) duplicateAliases.push({ sourceId, aliases: repeated })
    }

    validateTranslation(
      sourceId,
      'translatedTarget',
      exercise.translatedTarget,
      VALID_MUSCLE_TRANSLATIONS,
      englishTranslations,
    )
    validateTranslation(
      sourceId,
      'translatedBodyPart',
      exercise.translatedBodyPart,
      VALID_BODY_PART_TRANSLATIONS,
      englishTranslations,
    )
    validateTranslation(
      sourceId,
      'translatedEquipment',
      exercise.translatedEquipment,
      VALID_EQUIPMENT_TRANSLATIONS,
      englishTranslations,
    )

    if (!Array.isArray(exercise.translatedSecondaryMuscles)) {
      englishTranslations.push({
        sourceId,
        field: 'translatedSecondaryMuscles',
        value: '',
        reason: 'campo ausente ou não é um array',
      })
    } else {
      exercise.translatedSecondaryMuscles.forEach((rawValue, muscleIndex) => {
        validateTranslation(
          sourceId,
          `translatedSecondaryMuscles[${muscleIndex}]`,
          rawValue,
          VALID_MUSCLE_TRANSLATIONS,
          englishTranslations,
        )
      })

      const translatedNormalized = exercise.translatedSecondaryMuscles
        .filter((value): value is string => typeof value === 'string')
        .map(normalized)
      if (new Set(translatedNormalized).size !== translatedNormalized.length) {
        errors.push(`O exercício ${sourceId} possui traduções secundárias duplicadas.`)
      }
    }
  })

  const aliasesSharedAcrossExercises = [...globalAliasOwners.entries()]
    .filter(([, owners]) => owners.size > 1)
    .map(([alias, owners]) => ({ alias, sourceIds: [...owners].sort() }))
    .sort((a, b) => a.alias.localeCompare(b.alias, 'pt-BR'))

  if (exercises.length !== EXPECTED_TOTAL) {
    errors.push(`Quantidade total inválida: esperado ${EXPECTED_TOTAL}, encontrado ${exercises.length}.`)
  }
  if (duplicateIds.length > 0) errors.push(`${duplicateIds.length} sourceIds duplicados encontrados.`)
  if (missingIds.length > 0) errors.push(`${missingIds.length} exercícios sem sourceId válido.`)
  if (missingDisplayNames.length > 0) errors.push(`${missingDisplayNames.length} exercícios sem displayName.`)
  if (missingAliases.length > 0) errors.push(`${missingAliases.length} exercícios sem aliases.`)
  if (duplicateAliases.length > 0) errors.push(`${duplicateAliases.length} exercícios possuem aliases repetidos internamente.`)
  if (englishTranslations.length > 0) errors.push(`${englishTranslations.length} traduções vazias ou inválidas encontradas.`)

  const orderedIds = exercises
    .map(exercise => asTrimmedString(exercise.sourceId))
    .filter(id => /^\d+$/.test(id))
    .map(Number)
  const isSorted = orderedIds.every((id, index) => index === 0 || orderedIds[index - 1] <= id)
  if (!isSorted) warnings.push('Os exercícios não estão ordenados numericamente por sourceId.')

  if (duplicateDisplayNames.length > 0) {
    warnings.push(
      `${duplicateDisplayNames.length} nomes de exibição são compartilhados por exercícios diferentes; consulte duplicateDisplayNames.`,
    )
  }
  if (aliasesSharedAcrossExercises.length > 0) {
    warnings.push(
      `${aliasesSharedAcrossExercises.length} aliases são compartilhados por exercícios diferentes; consulte aliasesSharedAcrossExercises.`,
    )
  }

  const report = {
    totalExercises: exercises.length,
    expectedTotalExercises: EXPECTED_TOTAL,
    duplicateIds,
    missingIds,
    duplicateDisplayNames,
    missingDisplayNames,
    englishTranslations,
    missingAliases,
    duplicateAliases,
    aliasesSharedAcrossExercises,
    errors,
    warnings,
  }

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`Catálogo validado: ${exercises.length} exercícios.`)
  console.log(`Relatório: ${reportPath}`)
  console.log(`IDs duplicados: ${duplicateIds.length}`)
  console.log(`DisplayNames duplicados (aviso): ${duplicateDisplayNames.length}`)
  console.log(`Traduções vazias ou inválidas: ${englishTranslations.length}`)
  console.log(`Erros: ${errors.length}`)
  console.log(`Avisos: ${warnings.length}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
