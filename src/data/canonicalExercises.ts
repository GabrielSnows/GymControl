export type CanonicalExercise = {
  portugueseName: string
  aliases: string[]

  searchQueries: string[]

  requiredNameTermGroups: string[][]

  target?: string
  bodyPart?: string
  equipment?: string
}

export const canonicalExercises: CanonicalExercise[] = [
  {
    portugueseName: 'Supino reto com barra',
    aliases: [
      'supino reto com barra',
      'supino com barra',
      'supino barra',
    ],
    searchQueries: [
      'bench press',
      'barbell bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['barbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'barbell',
  },
  {
    portugueseName: 'Supino reto com halteres',
    aliases: [
      'supino reto com halteres',
      'supino com halteres',
      'supino halteres',
    ],
    searchQueries: [
      'bench press',
      'dumbbell bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['dumbbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Supino inclinado com barra',
    aliases: [
      'supino inclinado com barra',
      'supino inclinado barra',
    ],
    searchQueries: [
      'incline bench press',
      'barbell bench press',
      'bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['incline', 'inclined'],
      ['barbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'barbell',
  },
  {
    portugueseName: 'Supino inclinado com halteres',
    aliases: [
      'supino inclinado com halteres',
      'supino inclinado halteres',
      'supino superior com halteres',
    ],
    searchQueries: [
      'incline bench press',
      'dumbbell bench press',
      'bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['incline', 'inclined'],
      ['dumbbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Supino declinado com barra',
    aliases: [
      'supino declinado com barra',
      'supino declinado barra',
    ],
    searchQueries: [
      'decline bench press',
      'barbell bench press',
      'bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['decline', 'declined'],
      ['barbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'barbell',
  },
  {
    portugueseName: 'Supino declinado com halteres',
    aliases: [
      'supino declinado com halteres',
      'supino declinado halteres',
    ],
    searchQueries: [
      'decline bench press',
      'dumbbell bench press',
      'bench press',
    ],
    requiredNameTermGroups: [
      ['bench press', 'chest press'],
      ['decline', 'declined'],
      ['dumbbell'],
    ],
    target: 'pectorals',
    bodyPart: 'chest',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Desenvolvimento com barra',
    aliases: [
      'desenvolvimento com barra',
      'desenvolvimento barra',
    ],
    searchQueries: [
      'shoulder press',
      'overhead press',
      'barbell press',
    ],
    requiredNameTermGroups: [
      ['shoulder press', 'overhead press', 'military press'],
      ['barbell'],
    ],
    target: 'delts',
    bodyPart: 'shoulders',
    equipment: 'barbell',
  },
  {
    portugueseName: 'Desenvolvimento com halteres',
    aliases: [
      'desenvolvimento com halteres',
      'desenvolvimento halteres',
    ],
    searchQueries: [
      'shoulder press',
      'overhead press',
      'dumbbell press',
    ],
    requiredNameTermGroups: [
      ['shoulder press', 'overhead press', 'military press'],
      ['dumbbell'],
    ],
    target: 'delts',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Desenvolvimento sentado com halteres',
    aliases: [
      'desenvolvimento sentado com halteres',
      'desenvolvimento sentado halteres',
    ],
    searchQueries: [
      'seated shoulder press',
      'seated dumbbell press',
      'shoulder press',
    ],
    requiredNameTermGroups: [
      ['shoulder press', 'overhead press', 'military press'],
      ['seated', 'sitting'],
      ['dumbbell'],
    ],
    target: 'delts',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Elevação lateral com halteres',
    aliases: [
      'elevacao lateral com halteres',
      'elevação lateral com halteres',
      'elevacao lateral halteres',
    ],
    searchQueries: [
      'lateral raise',
      'dumbbell lateral raise',
    ],
    requiredNameTermGroups: [
      ['lateral raise'],
      ['dumbbell'],
    ],
    target: 'delts',
    bodyPart: 'shoulders',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Elevação lateral no cabo',
    aliases: [
      'elevacao lateral no cabo',
      'elevação lateral no cabo',
      'elevacao lateral polia',
    ],
    searchQueries: [
      'lateral raise',
      'cable lateral raise',
    ],
    requiredNameTermGroups: [
      ['lateral raise'],
      ['cable'],
    ],
    target: 'delts',
    bodyPart: 'shoulders',
    equipment: 'cable',
  },
  {
    portugueseName: 'Remada unilateral com halter',
    aliases: [
      'remada unilateral com halter',
      'remada serrote',
      'serrote',
    ],
    searchQueries: [
      'one arm row',
      'single arm row',
      'dumbbell row',
      'row',
    ],
    requiredNameTermGroups: [
      ['row'],
      ['one arm', 'single arm', 'unilateral'],
      ['dumbbell'],
    ],
    bodyPart: 'back',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Rosca martelo',
    aliases: ['rosca martelo'],
    searchQueries: [
      'hammer curl',
      'curl',
    ],
    requiredNameTermGroups: [
      ['hammer curl', 'hammer'],
      ['curl'],
    ],
    target: 'biceps',
    bodyPart: 'upper arms',
    equipment: 'dumbbell',
  },
  {
    portugueseName: 'Cadeira extensora',
    aliases: [
      'cadeira extensora',
      'extensora',
    ],
    searchQueries: [
      'leg extension',
      'extension',
    ],
    requiredNameTermGroups: [
      ['leg extension'],
    ],
    target: 'quads',
    bodyPart: 'upper legs',
  },
  {
    portugueseName: 'Mesa flexora',
    aliases: ['mesa flexora'],
    searchQueries: [
      'lying leg curl',
      'leg curl',
    ],
    requiredNameTermGroups: [
      ['leg curl'],
      ['lying', 'prone'],
    ],
    target: 'hamstrings',
    bodyPart: 'upper legs',
  },
  {
    portugueseName: 'Cadeira flexora',
    aliases: ['cadeira flexora'],
    searchQueries: [
      'seated leg curl',
      'leg curl',
    ],
    requiredNameTermGroups: [
      ['leg curl'],
      ['seated', 'sitting'],
    ],
    target: 'hamstrings',
    bodyPart: 'upper legs',
  },
]
