import {
  bodyPartTranslations,
  categoryTranslations,
  difficultyTranslations,
  equipmentTranslations,
  exerciseNameTranslations,
  exerciseSearchTranslations,
  forceTranslations,
  mechanicTranslations,
  muscleTranslations,
} from '../../data/exerciseTranslations.js'
import type { Exercise } from '../../types/exercise.js'

type MovementRule = {
  phrases: string[]
  translation: string
  gender: 'masculine' | 'feminine'
}

type DetectedModifier = {
  phrase: string
  translation: string
}

const movementRules: MovementRule[] = [
  {
    phrases: ['bench press', 'chest press'],
    translation: 'Supino',
    gender: 'masculine',
  },
  {
    phrases: ['shoulder press', 'overhead press'],
    translation: 'Desenvolvimento',
    gender: 'masculine',
  },
  {
    phrases: ['triceps pushdown', 'tricep pushdown'],
    translation: 'Tríceps na polia',
    gender: 'masculine',
  },
  {
    phrases: ['lat pulldown'],
    translation: 'Puxada alta',
    gender: 'feminine',
  },
  {
    phrases: ['straight arm pulldown'],
    translation: 'Pulldown com braços estendidos',
    gender: 'masculine',
  },
  {
    phrases: ['pulldown'],
    translation: 'Puxada',
    gender: 'feminine',
  },
  {
    phrases: ['leg extension'],
    translation: 'Cadeira extensora',
    gender: 'feminine',
  },
  {
    phrases: ['leg curl'],
    translation: 'Flexora',
    gender: 'feminine',
  },
  {
    phrases: ['hip thrust'],
    translation: 'Elevação pélvica',
    gender: 'feminine',
  },
  {
    phrases: ['glute bridge'],
    translation: 'Ponte de glúteos',
    gender: 'feminine',
  },
  {
    phrases: ['calf raise'],
    translation: 'Elevação de panturrilhas',
    gender: 'feminine',
  },
  {
    phrases: ['lateral raise'],
    translation: 'Elevação lateral',
    gender: 'feminine',
  },
  {
    phrases: ['front raise'],
    translation: 'Elevação frontal',
    gender: 'feminine',
  },
  {
    phrases: ['rear delt fly', 'reverse fly'],
    translation: 'Crucifixo invertido',
    gender: 'masculine',
  },
  {
    phrases: ['chest fly', 'fly'],
    translation: 'Crucifixo',
    gender: 'masculine',
  },
  {
    phrases: ['preacher curl'],
    translation: 'Rosca Scott',
    gender: 'feminine',
  },
  {
    phrases: ['hammer curl'],
    translation: 'Rosca martelo',
    gender: 'feminine',
  },
  {
    phrases: [
      'biceps curl',
      'bicep curl',
      'arm curl',
      'curl',
    ],
    translation: 'Rosca',
    gender: 'feminine',
  },
  {
    phrases: [
      'triceps extension',
      'tricep extension',
    ],
    translation: 'Extensão de tríceps',
    gender: 'feminine',
  },
  {
    phrases: ['leg press'],
    translation: 'Leg press',
    gender: 'masculine',
  },
  {
    phrases: ['split squat'],
    translation: 'Agachamento unilateral',
    gender: 'masculine',
  },
  {
    phrases: ['squat'],
    translation: 'Agachamento',
    gender: 'masculine',
  },
  {
    phrases: ['romanian deadlift'],
    translation: 'Levantamento terra romeno',
    gender: 'masculine',
  },
  {
    phrases: ['stiff leg deadlift'],
    translation: 'Stiff',
    gender: 'masculine',
  },
  {
    phrases: ['deadlift'],
    translation: 'Levantamento terra',
    gender: 'masculine',
  },
  {
    phrases: ['t bar row', 't-bar row'],
    translation: 'Remada cavalinho',
    gender: 'feminine',
  },
  {
    phrases: ['upright row'],
    translation: 'Remada alta',
    gender: 'feminine',
  },
  {
    phrases: ['row'],
    translation: 'Remada',
    gender: 'feminine',
  },
  {
    phrases: ['lunge'],
    translation: 'Afundo',
    gender: 'masculine',
  },
  {
    phrases: ['shrug'],
    translation: 'Encolhimento de ombros',
    gender: 'masculine',
  },
  {
    phrases: ['pullover'],
    translation: 'Pullover',
    gender: 'masculine',
  },
  {
    phrases: ['face pull'],
    translation: 'Face pull',
    gender: 'masculine',
  },
  {
    phrases: ['push up', 'push-up'],
    translation: 'Flexão de braços',
    gender: 'feminine',
  },
  {
    phrases: ['pull up', 'pull-up'],
    translation: 'Barra fixa',
    gender: 'feminine',
  },
  {
    phrases: ['chin up', 'chin-up'],
    translation: 'Barra fixa supinada',
    gender: 'feminine',
  },
  {
    phrases: ['dip'],
    translation: 'Mergulho',
    gender: 'masculine',
  },
  {
    phrases: ['crunch'],
    translation: 'Abdominal',
    gender: 'masculine',
  },
  {
    phrases: ['leg raise'],
    translation: 'Elevação de pernas',
    gender: 'feminine',
  },
  {
    phrases: ['plank'],
    translation: 'Prancha',
    gender: 'feminine',
  },
]

const equipmentModifiers: DetectedModifier[] = [
  {
    phrase: 'smith machine',
    translation: 'no Smith',
  },
  {
    phrase: 'smith',
    translation: 'no Smith',
  },
  {
    phrase: 'leverage machine',
    translation: 'na máquina',
  },
  {
    phrase: 'hammer machine',
    translation: 'na máquina articulada',
  },
  {
    phrase: 'machine',
    translation: 'na máquina',
  },
  {
    phrase: 'ez barbell',
    translation: 'com barra W',
  },
  {
    phrase: 'ez bar',
    translation: 'com barra W',
  },
  {
    phrase: 'trap bar',
    translation: 'com barra hexagonal',
  },
  {
    phrase: 'barbell',
    translation: 'com barra',
  },
  {
    phrase: 'dumbbells',
    translation: 'com halteres',
  },
  {
    phrase: 'dumbbell',
    translation: 'com halter',
  },
  {
    phrase: 'kettlebell',
    translation: 'com kettlebell',
  },
  {
    phrase: 'cable',
    translation: 'no cabo',
  },
  {
    phrase: 'rope',
    translation: 'com corda',
  },
  {
    phrase: 'resistance band',
    translation: 'com faixa elástica',
  },
  {
    phrase: 'band',
    translation: 'com faixa elástica',
  },
  {
    phrase: 'body weight',
    translation: 'com peso corporal',
  },
  {
    phrase: 'bodyweight',
    translation: 'com peso corporal',
  },
  {
    phrase: 'weighted',
    translation: 'com peso',
  },
]

const gripModifiers: DetectedModifier[] = [
  {
    phrase: 'reverse grip',
    translation: 'com pegada supinada',
  },
  {
    phrase: 'underhand grip',
    translation: 'com pegada supinada',
  },
  {
    phrase: 'pronated grip',
    translation: 'com pegada pronada',
  },
  {
    phrase: 'overhand grip',
    translation: 'com pegada pronada',
  },
  {
    phrase: 'neutral grip',
    translation: 'com pegada neutra',
  },
  {
    phrase: 'wide grip',
    translation: 'com pegada aberta',
  },
  {
    phrase: 'close grip',
    translation: 'com pegada fechada',
  },
  {
    phrase: 'narrow grip',
    translation: 'com pegada fechada',
  },
]

const positionModifiers: DetectedModifier[] = [
  {
    phrase: 'seated',
    translation: 'sentado',
  },
  {
    phrase: 'standing',
    translation: 'em pé',
  },
  {
    phrase: 'lying',
    translation: 'deitado',
  },
  {
    phrase: 'kneeling',
    translation: 'ajoelhado',
  },
  {
    phrase: 'bent over',
    translation: 'curvado',
  },
  {
    phrase: 'hanging',
    translation: 'suspenso',
  },
]

const lateralityModifiers: DetectedModifier[] = [
  {
    phrase: 'single arm',
    translation: 'unilateral',
  },
  {
    phrase: 'one arm',
    translation: 'unilateral',
  },
  {
    phrase: 'single leg',
    translation: 'unilateral',
  },
  {
    phrase: 'one leg',
    translation: 'unilateral',
  },
  {
    phrase: 'alternating',
    translation: 'alternado',
  },
]

const variationModifiers: DetectedModifier[] = [
  {
    phrase: 'front',
    translation: 'frontal',
  },
  {
    phrase: 'rear',
    translation: 'posterior',
  },
  {
    phrase: 'walking',
    translation: 'caminhando',
  },
  {
    phrase: 'assisted',
    translation: 'assistido',
  },
  {
    phrase: 'decline',
    translation: 'declinado',
  },
  {
    phrase: 'incline',
    translation: 'inclinado',
  },
]

export function normalizeExerciseText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function capitalizeFirstLetter(value: string) {
  if (!value) {
    return value
  }

  return (
    value.charAt(0).toLocaleUpperCase('pt-BR') +
    value.slice(1)
  )
}

function findTranslation(
  translations: Record<string, string>,
  value?: string,
) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    return undefined
  }

  const normalizedKey =
    normalizeExerciseText(normalizedValue)

  for (const [key, translation] of Object.entries(
    translations,
  )) {
    if (
      normalizeExerciseText(key) === normalizedKey
    ) {
      return translation
    }
  }

  return undefined
}

function containsPhrase(
  normalizedName: string,
  phrase: string,
) {
  const normalizedPhrase =
    normalizeExerciseText(phrase)

  return normalizedName.includes(normalizedPhrase)
}

function removePhrase(
  normalizedName: string,
  phrase: string,
) {
  const normalizedPhrase =
    normalizeExerciseText(phrase)

  return normalizedName
    .replace(normalizedPhrase, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findMovement(normalizedName: string) {
  const orderedRules = [...movementRules].sort(
    (first, second) => {
      const firstLength = Math.max(
        ...first.phrases.map(
          (phrase) => phrase.length,
        ),
      )

      const secondLength = Math.max(
        ...second.phrases.map(
          (phrase) => phrase.length,
        ),
      )

      return secondLength - firstLength
    },
  )

  for (const rule of orderedRules) {
    const orderedPhrases = [...rule.phrases].sort(
      (first, second) =>
        second.length - first.length,
    )

    for (const phrase of orderedPhrases) {
      if (containsPhrase(normalizedName, phrase)) {
        return {
          rule,
          phrase,
        }
      }
    }
  }

  return null
}

function findAllModifiers(
  normalizedName: string,
  modifiers: DetectedModifier[],
) {
  const matches: DetectedModifier[] = []
  let remainingName = normalizedName

  const orderedModifiers = [...modifiers].sort(
    (first, second) =>
      second.phrase.length - first.phrase.length,
  )

  for (const modifier of orderedModifiers) {
    if (
      containsPhrase(
        remainingName,
        modifier.phrase,
      )
    ) {
      matches.push(modifier)

      remainingName = removePhrase(
        remainingName,
        modifier.phrase,
      )
    }
  }

  return {
    matches,
    remainingName,
  }
}

function adjustGender(
  translation: string,
  gender: MovementRule['gender'],
) {
  if (gender === 'feminine') {
    const feminineTranslations: Record<
      string,
      string
    > = {
      inclinado: 'inclinada',
      declinado: 'declinada',
      alternado: 'alternada',
      assistido: 'assistida',
      sentado: 'sentada',
      deitado: 'deitada',
      ajoelhado: 'ajoelhada',
      curvado: 'curvada',
      suspenso: 'suspensa',
    }

    return (
      feminineTranslations[translation] ??
      translation
    )
  }

  return translation
}

function translateRemainingWords(value: string) {
  const wordTranslations: Record<string, string> = {
    front: 'frontal',
    rear: 'posterior',
    upper: 'superior',
    lower: 'inferior',
    inner: 'interno',
    outer: 'externo',
    horizontal: 'horizontal',
    vertical: 'vertical',
    decline: 'declinado',
    incline: 'inclinado',
    reverse: 'invertido',
    alternating: 'alternado',
    assisted: 'assistido',
    explosive: 'explosivo',
    iso: 'isométrico',
    isometric: 'isométrico',
    dynamic: 'dinâmico',
    floor: 'no chão',
    bench: 'no banco',
    high: 'alto',
    low: 'baixo',
    middle: 'médio',
    overhead: 'acima da cabeça',
    straight: 'estendido',
    bent: 'flexionado',
    extended: 'estendido',
  }

  const translatedWords = value
    .split(' ')
    .filter(Boolean)
    .map(
      (word) =>
        wordTranslations[word] ?? '',
    )
    .filter(Boolean)

  return translatedWords.join(' ')
}

function translateExerciseNameStructurally(
  originalName: string,
) {
  const normalizedName =
    normalizeExerciseText(originalName)

  const movement = findMovement(normalizedName)

  if (!movement) {
    const translatedWords =
      translateRemainingWords(normalizedName)

    return translatedWords
      ? capitalizeFirstLetter(translatedWords)
      : originalName.trim()
  }

  let remainingName = removePhrase(
    normalizedName,
    movement.phrase,
  )

  const gripResult = findAllModifiers(
    remainingName,
    gripModifiers,
  )

  remainingName = gripResult.remainingName

  const equipmentResult = findAllModifiers(
    remainingName,
    equipmentModifiers,
  )

  remainingName = equipmentResult.remainingName

  const lateralityResult = findAllModifiers(
    remainingName,
    lateralityModifiers,
  )

  remainingName = lateralityResult.remainingName

  const positionResult = findAllModifiers(
    remainingName,
    positionModifiers,
  )

  remainingName = positionResult.remainingName

  const variationResult = findAllModifiers(
    remainingName,
    variationModifiers,
  )

  remainingName = variationResult.remainingName

  const parts: string[] = [
    movement.rule.translation,
  ]

  for (const modifier of variationResult.matches) {
    parts.push(
      adjustGender(
        modifier.translation,
        movement.rule.gender,
      ),
    )
  }

  for (const modifier of lateralityResult.matches) {
    parts.push(
      adjustGender(
        modifier.translation,
        movement.rule.gender,
      ),
    )
  }

  for (const modifier of positionResult.matches) {
    parts.push(
      adjustGender(
        modifier.translation,
        movement.rule.gender,
      ),
    )
  }

  for (const modifier of equipmentResult.matches) {
    parts.push(modifier.translation)
  }

  for (const modifier of gripResult.matches) {
    parts.push(modifier.translation)
  }

  const unresolvedTerms = remainingName
    .split(' ')
    .filter(Boolean)

  const remainingTranslation =
    translateRemainingWords(remainingName)

  if (
    unresolvedTerms.length > 0 &&
    !remainingTranslation
  ) {
    return originalName.trim()
  }

  return capitalizeFirstLetter(
    parts
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

export function translateExerciseName(
  originalName: string,
) {
  const exactTranslation = findTranslation(
    exerciseNameTranslations,
    originalName,
  )

  if (exactTranslation) {
    return exactTranslation
  }

  return translateExerciseNameStructurally(
    originalName,
  )
}

export function translateExerciseSearchQuery(
  query: string,
) {
  const normalizedQuery =
    normalizeExerciseText(query)

  const exactTranslation = findTranslation(
    exerciseSearchTranslations,
    normalizedQuery,
  )

  if (exactTranslation) {
    return exactTranslation
  }

  const orderedTranslations = Object.entries(
    exerciseSearchTranslations,
  ).sort(
    ([firstPhrase], [secondPhrase]) =>
      secondPhrase.length - firstPhrase.length,
  )

  let translatedQuery = normalizedQuery

  for (const [
    portuguesePhrase,
    englishPhrase,
  ] of orderedTranslations) {
    const normalizedPortuguesePhrase =
      normalizeExerciseText(portuguesePhrase)

    if (
      translatedQuery.includes(
        normalizedPortuguesePhrase,
      )
    ) {
      translatedQuery = translatedQuery.replace(
        normalizedPortuguesePhrase,
        englishPhrase,
      )
    }
  }

  return translatedQuery
}

export function translateMuscle(value?: string) {
  return (
    findTranslation(muscleTranslations, value) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateBodyPart(value?: string) {
  return (
    findTranslation(
      bodyPartTranslations,
      value,
    ) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateEquipment(value?: string) {
  return (
    findTranslation(
      equipmentTranslations,
      value,
    ) ??
    value?.trim() ??
    'Não informado'
  )
}

export function translateDifficulty(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(
      difficultyTranslations,
      value,
    ) ?? value.trim()
  )
}

export function translateMechanic(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(
      mechanicTranslations,
      value,
    ) ?? value.trim()
  )
}

export function translateForce(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(forceTranslations, value) ??
    value.trim()
  )
}

export function translateCategory(value?: string) {
  if (!value) {
    return undefined
  }

  return (
    findTranslation(
      categoryTranslations,
      value,
    ) ?? value.trim()
  )
}

export function translateMuscleList(
  muscles: string[],
) {
  return muscles.map((muscle) =>
    translateMuscle(muscle),
  )
}

export function localizeExercise(
  exercise: Exercise,
): Exercise {
  const originalName =
    exercise.originalName?.trim() ||
    exercise.name.trim()

  const exactTranslation = findTranslation(
    exerciseNameTranslations,
    originalName,
  )

  const displayName =
    exactTranslation ??
    translateExerciseNameStructurally(originalName)

  const translationConfidence =
    exactTranslation
      ? 'exact'
      : displayName === originalName
        ? 'fallback'
        : 'structured'

  return {
    ...exercise,

    name: displayName,
    displayName,
    originalName,

    translationConfidence,
    unresolvedNameTerms:
      translationConfidence === 'fallback'
        ? normalizeExerciseText(originalName)
            .split(' ')
            .filter(Boolean)
        : [],

    muscle: translateMuscle(exercise.muscle),

    bodyPart: translateBodyPart(
      exercise.bodyPart,
    ),

    equipment: translateEquipment(
      exercise.equipment,
    ),

    secondaryMuscles: translateMuscleList(
      exercise.secondaryMuscles ?? [],
    ),

    category: translateCategory(
      exercise.category,
    ),

    difficulty: translateDifficulty(
      exercise.difficulty,
    ),

    mechanic: translateMechanic(
      exercise.mechanic,
    ),

    force: translateForce(exercise.force),
  }
}