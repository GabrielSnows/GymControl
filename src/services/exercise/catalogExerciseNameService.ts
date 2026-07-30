export type CatalogNameConfidence =
  | 'exact'
  | 'generated'
  | 'fallback'

export type CatalogNameResult = {
  displayName: string
  confidence: CatalogNameConfidence
  unresolvedTerms: string[]
}

type ParsedExerciseName = {
  movement: string | null
  equipment: string[]
  position: string[]
  variation: string[]
  grip: string[]
  support: string[]
  assistance: string[]
  unresolvedTerms: string[]
}

type PhraseRule = {
  phrases: string[]
  value: string
}

const exactNames: Record<string, string> = {
  '3 4 sit up': 'Abdominal 3/4',
  '45 degree side bend':
    'Flexão lateral do tronco a 45 graus',
  'air bike': 'Abdominal bicicleta',
  'alternate heel touchers':
    'Toque alternado nos calcanhares',
  'alternate lateral pulldown':
    'Puxada lateral alternada',
  'assisted chest dip kneeling':
    'Mergulho assistido para peitoral ajoelhado',
  'assisted hanging knee raise':
    'Elevação de joelhos suspenso assistida',
  'assisted pull up': 'Barra fixa assistida',
  'assisted triceps dip kneeling':
    'Mergulho assistido para tríceps ajoelhado',
  'balance board': 'Prancha de equilíbrio',
  'barbell alternate biceps curl':
    'Rosca alternada com barra',
  'barbell bench front squat':
    'Agachamento frontal no banco com barra',
  'barbell bench press': 'Supino reto com barra',
  'barbell bench squat':
    'Agachamento no banco com barra',
  'barbell bent over row':
    'Remada curvada com barra',
  'barbell clean and press':
    'Clean and press com barra',
  'barbell clean grip front squat':
    'Agachamento frontal com pegada de clean',
  'barbell close grip bench press':
    'Supino com barra com pegada fechada',
  'barbell curl': 'Rosca com barra',
  'barbell deadlift':
    'Levantamento terra com barra',
  'barbell decline bench press':
    'Supino declinado com barra',
  'barbell drag curl':
    'Rosca arrastada com barra',
  'barbell front chest squat':
    'Agachamento frontal com barra',
  'barbell front raise':
    'Elevação frontal com barra',
  'barbell front squat':
    'Agachamento frontal com barra',
  'barbell full squat':
    'Agachamento completo com barra',
  'barbell good morning':
    'Good morning com barra',
  'barbell guillotine bench press':
    'Supino guilhotina com barra',
  'barbell hack squat':
    'Agachamento hack com barra',
  'barbell incline bench press':
    'Supino inclinado com barra',
  'barbell incline reverse grip press':
    'Supino inclinado com barra com pegada supinada',
  'barbell incline row':
    'Remada inclinada com barra',
  'barbell jefferson squat':
    'Agachamento Jefferson com barra',
  'barbell jm bench press':
    'Supino JM com barra',
  'barbell jump squat':
    'Agachamento com salto e barra',
  'barbell lunge': 'Afundo com barra',
  'barbell pullover to press':
    'Pullover com barra seguido de supino',
  'barbell reverse grip bench press':
    'Supino com barra com pegada supinada',
  'barbell romanian deadlift':
    'Levantamento terra romeno com barra',
  'barbell shoulder press':
    'Desenvolvimento com barra',
  'barbell shrug':
    'Encolhimento de ombros com barra',
  'barbell stiff leg deadlift':
    'Stiff com barra',
  'barbell sumo deadlift':
    'Levantamento terra sumô com barra',
  'barbell wide grip bench press':
    'Supino com barra com pegada aberta',
  'cable crossover': 'Crossover no cabo',
  'cable lateral raise':
    'Elevação lateral no cabo',
  'cable rope triceps pushdown':
    'Tríceps na polia com corda',
  'cable triceps pushdown':
    'Tríceps na polia',
  'close grip lat pulldown':
    'Puxada alta com pegada fechada',
  'concentration curl':
    'Rosca concentrada',
  'decline barbell bench press':
    'Supino declinado com barra',
  'decline dumbbell bench press':
    'Supino declinado com halteres',
  'dumbbell bench press':
    'Supino reto com halteres',
  'dumbbell curl': 'Rosca com halteres',
  'dumbbell front raise':
    'Elevação frontal com halteres',
  'dumbbell lateral raise':
    'Elevação lateral com halteres',
  'dumbbell shoulder press':
    'Desenvolvimento com halteres',
  'front squat': 'Agachamento frontal',
  'hack squat': 'Agachamento hack',
  'hammer curl': 'Rosca martelo',
  'hip thrust': 'Elevação pélvica',
  'incline barbell bench press':
    'Supino inclinado com barra',
  'incline dumbbell bench press':
    'Supino inclinado com halteres',
  'lat pulldown': 'Puxada alta',
  'leg extension': 'Cadeira extensora',
  'leg press': 'Leg press',
  'lying leg curl': 'Mesa flexora',
  'machine chest press':
    'Supino na máquina',
  'one arm dumbbell row':
    'Remada unilateral com halter',
  'preacher curl': 'Rosca Scott',
  'reverse grip lat pulldown':
    'Puxada alta com pegada supinada',
  'romanian deadlift':
    'Levantamento terra romeno',
  'rope triceps pushdown':
    'Tríceps na polia com corda',
  'seated cable row':
    'Remada baixa no cabo',
  'seated dumbbell shoulder press':
    'Desenvolvimento sentado com halteres',
  'seated leg curl': 'Cadeira flexora',
  'smith machine bench press':
    'Supino reto no Smith',
  't bar row': 'Remada cavalinho',
  'wide grip lat pulldown':
    'Puxada alta com pegada aberta',
}

const movementRules: PhraseRule[] = [
  {
    phrases: [
      'clean and press',
      'clean press',
    ],
    value: 'Clean and press',
  },
  {
    phrases: [
      'bench press',
      'chest press',
      'jm bench press',
      'guillotine bench press',
    ],
    value: 'Supino',
  },
  {
    phrases: [
      'shoulder press',
      'overhead press',
      'military press',
      'arnold press',
    ],
    value: 'Desenvolvimento',
  },
  {
    phrases: [
      'triceps pushdown',
      'tricep pushdown',
    ],
    value: 'Tríceps na polia',
  },
  {
    phrases: [
      'lat pulldown',
      'lateral pulldown',
    ],
    value: 'Puxada alta',
  },
  {
    phrases: [
      'straight arm pulldown',
      'straight arm pull down',
    ],
    value: 'Pulldown com braços estendidos',
  },
  {
    phrases: ['pulldown', 'pull down'],
    value: 'Puxada',
  },
  {
    phrases: ['leg extension'],
    value: 'Cadeira extensora',
  },
  {
    phrases: ['lying leg curl'],
    value: 'Mesa flexora',
  },
  {
    phrases: ['seated leg curl'],
    value: 'Cadeira flexora',
  },
  {
    phrases: ['leg curl'],
    value: 'Flexora',
  },
  {
    phrases: ['hip thrust'],
    value: 'Elevação pélvica',
  },
  {
    phrases: ['glute bridge'],
    value: 'Ponte de glúteos',
  },
  {
    phrases: ['calf raise'],
    value: 'Elevação de panturrilhas',
  },
  {
    phrases: ['lateral raise'],
    value: 'Elevação lateral',
  },
  {
    phrases: ['front raise'],
    value: 'Elevação frontal',
  },
  {
    phrases: [
      'rear delt fly',
      'reverse fly',
    ],
    value: 'Crucifixo invertido',
  },
  {
    phrases: [
      'chest fly',
      'dumbbell fly',
      'fly',
    ],
    value: 'Crucifixo',
  },
  {
    phrases: ['preacher curl'],
    value: 'Rosca Scott',
  },
  {
    phrases: ['hammer curl'],
    value: 'Rosca martelo',
  },
  {
    phrases: ['drag curl'],
    value: 'Rosca arrastada',
  },
  {
    phrases: [
      'biceps curl',
      'bicep curl',
      'curl',
    ],
    value: 'Rosca',
  },
  {
    phrases: [
      'triceps extension',
      'tricep extension',
    ],
    value: 'Extensão de tríceps',
  },
  {
    phrases: ['leg press'],
    value: 'Leg press',
  },
  {
    phrases: ['split squat'],
    value: 'Agachamento unilateral',
  },
  {
    phrases: ['front squat'],
    value: 'Agachamento frontal',
  },
  {
    phrases: ['hack squat'],
    value: 'Agachamento hack',
  },
  {
    phrases: ['jump squat'],
    value: 'Agachamento com salto',
  },
  {
    phrases: ['squat'],
    value: 'Agachamento',
  },
  {
    phrases: ['romanian deadlift'],
    value: 'Levantamento terra romeno',
  },
  {
    phrases: ['stiff leg deadlift'],
    value: 'Stiff',
  },
  {
    phrases: ['sumo deadlift'],
    value: 'Levantamento terra sumô',
  },
  {
    phrases: ['deadlift'],
    value: 'Levantamento terra',
  },
  {
    phrases: [
      't bar row',
      't-bar row',
    ],
    value: 'Remada cavalinho',
  },
  {
    phrases: ['upright row'],
    value: 'Remada alta',
  },
  {
    phrases: ['bent over row'],
    value: 'Remada curvada',
  },
  {
    phrases: ['row'],
    value: 'Remada',
  },
  {
    phrases: ['lunge'],
    value: 'Afundo',
  },
  {
    phrases: ['shrug'],
    value: 'Encolhimento de ombros',
  },
  {
    phrases: ['pullover'],
    value: 'Pullover',
  },
  {
    phrases: ['face pull'],
    value: 'Face pull',
  },
  {
    phrases: [
      'push up',
      'push-up',
    ],
    value: 'Flexão de braços',
  },
  {
    phrases: [
      'pull up',
      'pull-up',
    ],
    value: 'Barra fixa',
  },
  {
    phrases: [
      'chin up',
      'chin-up',
    ],
    value: 'Barra fixa supinada',
  },
  {
    phrases: ['dip'],
    value: 'Mergulho',
  },
  {
    phrases: ['sit up', 'sit-up'],
    value: 'Abdominal',
  },
  {
    phrases: ['crunch'],
    value: 'Abdominal',
  },
  {
    phrases: ['leg raise'],
    value: 'Elevação de pernas',
  },
  {
    phrases: ['knee raise'],
    value: 'Elevação de joelhos',
  },
  {
    phrases: ['side bend'],
    value: 'Flexão lateral do tronco',
  },
  {
    phrases: ['russian twist'],
    value: 'Abdominal russo',
  },
  {
    phrases: ['heel touchers'],
    value: 'Toque nos calcanhares',
  },
  {
    phrases: ['plank'],
    value: 'Prancha',
  },
]

const equipmentRules: PhraseRule[] = [
  {
    phrases: ['smith machine', 'smith'],
    value: 'no Smith',
  },
  {
    phrases: [
      'leverage machine',
      'lever machine',
      'leverage',
      'lever',
    ],
    value: 'na máquina',
  },
  {
    phrases: [
      'medicine ball',
      'weighted ball',
    ],
    value: 'com medicine ball',
  },
  {
    phrases: [
      'stability ball',
      'exercise ball',
      'swiss ball',
    ],
    value: 'na bola suíça',
  },
  {
    phrases: ['bosu ball', 'bosu'],
    value: 'no Bosu',
  },
  {
    phrases: ['barbell'],
    value: 'com barra',
  },
  {
    phrases: ['dumbbells'],
    value: 'com halteres',
  },
  {
    phrases: ['dumbbell'],
    value: 'com halter',
  },
  {
    phrases: ['ez barbell', 'ez bar'],
    value: 'com barra W',
  },
  {
    phrases: ['cable'],
    value: 'no cabo',
  },
  {
    phrases: ['rope'],
    value: 'com corda',
  },
  {
    phrases: ['kettlebell'],
    value: 'com kettlebell',
  },
  {
    phrases: [
      'resistance band',
      'band',
    ],
    value: 'com faixa elástica',
  },
  {
    phrases: [
      'body weight',
      'bodyweight',
    ],
    value: 'com peso corporal',
  },
  {
    phrases: ['bench'],
    value: 'no banco',
  },
]

const positionRules: PhraseRule[] = [
  {
    phrases: ['incline', 'inclined'],
    value: 'inclinado',
  },
  {
    phrases: ['decline', 'declined'],
    value: 'declinado',
  },
  {
    phrases: ['flat'],
    value: 'reto',
  },
  {
    phrases: ['seated', 'sitting', 'sit'],
    value: 'sentado',
  },
  {
    phrases: ['standing'],
    value: 'em pé',
  },
  {
    phrases: ['lying'],
    value: 'deitado',
  },
  {
    phrases: ['prone'],
    value: 'deitado de bruços',
  },
  {
    phrases: ['supine'],
    value: 'deitado de costas',
  },
  {
    phrases: ['kneeling'],
    value: 'ajoelhado',
  },
  {
    phrases: ['hanging'],
    value: 'suspenso',
  },
  {
    phrases: ['bent over'],
    value: 'curvado',
  },
  {
    phrases: ['on floor', 'floor'],
    value: 'no chão',
  },
]

const variationRules: PhraseRule[] = [
  {
    phrases: [
      'single arm',
      'one arm',
    ],
    value: 'unilateral',
  },
  {
    phrases: [
      'single leg',
      'one leg',
    ],
    value: 'unilateral',
  },
  {
    phrases: [
      'alternating',
      'alternate',
    ],
    value: 'alternado',
  },
  {
    phrases: ['assisted'],
    value: 'assistido',
  },
  {
    phrases: ['weighted'],
    value: 'com peso adicional',
  },
  {
    phrases: ['full'],
    value: 'completo',
  },
  {
    phrases: ['jump'],
    value: 'com salto',
  },
  {
    phrases: ['walking'],
    value: 'caminhando',
  },
  {
    phrases: ['rear'],
    value: 'posterior',
  },
  {
    phrases: ['front'],
    value: 'frontal',
  },
]

const gripRules: PhraseRule[] = [
  {
    phrases: [
      'reverse grip',
      'underhand grip',
    ],
    value: 'com pegada supinada',
  },
  {
    phrases: [
      'overhand grip',
      'pronated grip',
    ],
    value: 'com pegada pronada',
  },
  {
    phrases: ['neutral grip'],
    value: 'com pegada neutra',
  },
  {
    phrases: ['wide grip'],
    value: 'com pegada aberta',
  },
  {
    phrases: [
      'close grip',
      'narrow grip',
    ],
    value: 'com pegada fechada',
  },
  {
    phrases: ['clean grip'],
    value: 'com pegada de clean',
  },
]

const supportRules: PhraseRule[] = [
  {
    phrases: ['parallel'],
    value: 'nas paralelas',
  },
  {
    phrases: ['with towel', 'towel'],
    value: 'com toalha',
  },
  {
    phrases: ['with throw down', 'throw down'],
    value: 'com impulso para baixo',
  },
  {
    phrases: [
      'with lateral throw down',
      'lateral throw down',
    ],
    value: 'com impulso lateral para baixo',
  },
]

const ignoredTerms = new Set([
  'exercise',
  'version',
  'variation',
  'with',
  'to',
  'and',
  'on',
  'of',
  'the',
  's',
  'v',
  '2',
  '3',
  '4',
])

export function normalizeCatalogName(
  value: string,
) {
  return value
    .trim()
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/]+/g, ' ')
    .replace(/[(),]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
}

function removePhrase(
  value: string,
  phrase: string,
) {
  const normalizedPhrase =
    normalizeCatalogName(phrase)

  return value
    .replace(normalizedPhrase, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sortRules(rules: PhraseRule[]) {
  return [...rules].sort(
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
}

function extractRules(
  originalValue: string,
  rules: PhraseRule[],
) {
  let remainingValue = originalValue
  const values: string[] = []

  for (const rule of sortRules(rules)) {
    const phrase = [...rule.phrases]
      .sort(
        (first, second) =>
          second.length - first.length,
      )
      .find((candidate) =>
        remainingValue.includes(
          normalizeCatalogName(candidate),
        ),
      )

    if (!phrase) {
      continue
    }

    values.push(rule.value)

    remainingValue = removePhrase(
      remainingValue,
      phrase,
    )
  }

  return {
    values: [...new Set(values)],
    remainingValue,
  }
}

function extractMovement(
  originalValue: string,
) {
  for (const rule of sortRules(
    movementRules,
  )) {
    const phrase = [...rule.phrases]
      .sort(
        (first, second) =>
          second.length - first.length,
      )
      .find((candidate) =>
        originalValue.includes(
          normalizeCatalogName(candidate),
        ),
      )

    if (!phrase) {
      continue
    }

    return {
      movement: rule.value,
      remainingValue: removePhrase(
        originalValue,
        phrase,
      ),
    }
  }

  return {
    movement: null,
    remainingValue: originalValue,
  }
}

function parseExerciseName(
  originalName: string,
): ParsedExerciseName {
  let remainingValue =
    normalizeCatalogName(originalName)

  const movementResult =
    extractMovement(remainingValue)

  remainingValue =
    movementResult.remainingValue

  const equipmentResult =
    extractRules(
      remainingValue,
      equipmentRules,
    )

  remainingValue =
    equipmentResult.remainingValue

  const gripResult =
    extractRules(
      remainingValue,
      gripRules,
    )

  remainingValue =
    gripResult.remainingValue

  const positionResult =
    extractRules(
      remainingValue,
      positionRules,
    )

  remainingValue =
    positionResult.remainingValue

  const variationResult =
    extractRules(
      remainingValue,
      variationRules,
    )

  remainingValue =
    variationResult.remainingValue

  const supportResult =
    extractRules(
      remainingValue,
      supportRules,
    )

  remainingValue =
    supportResult.remainingValue

  const unresolvedTerms = remainingValue
    .split(' ')
    .filter(Boolean)
    .filter(
      (term) => !ignoredTerms.has(term),
    )

  return {
    movement: movementResult.movement,
    equipment: equipmentResult.values,
    grip: gripResult.values,
    position: positionResult.values,
    variation: variationResult.values,
    support: supportResult.values,
    assistance: [],
    unresolvedTerms,
  }
}

function buildDisplayName(
  parsed: ParsedExerciseName,
) {
  if (!parsed.movement) {
    return null
  }

  return [
    parsed.movement,
    ...parsed.position,
    ...parsed.variation,
    ...parsed.equipment,
    ...parsed.grip,
    ...parsed.support,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function generateCatalogExerciseName(
  originalName: string,
): CatalogNameResult {
  const normalizedName =
    normalizeCatalogName(originalName)

  const exactName =
    exactNames[normalizedName]

  if (exactName) {
    return {
      displayName: exactName,
      confidence: 'exact',
      unresolvedTerms: [],
    }
  }

  const parsed =
    parseExerciseName(originalName)

  const displayName =
    buildDisplayName(parsed)

  if (
    !displayName ||
    parsed.unresolvedTerms.length > 0
  ) {
    return {
      displayName: originalName.trim(),
      confidence: 'fallback',
      unresolvedTerms:
        parsed.unresolvedTerms.length > 0
          ? parsed.unresolvedTerms
          : normalizedName
              .split(' ')
              .filter(Boolean),
    }
  }

  return {
    displayName,
    confidence: 'generated',
    unresolvedTerms: [],
  }
}
