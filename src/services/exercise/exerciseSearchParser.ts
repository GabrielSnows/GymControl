import {
  canonicalExercises,
  type CanonicalExercise,
} from '../../data/canonicalExercises'
import {
  exerciseSemanticSearchTerms,
  type ExerciseSearchCategory,
} from '../../data/exerciseTranslations'
import { normalizeExerciseText } from './exerciseTranslationService'

export type SearchMode =
  | 'name'
  | 'target'
  | 'bodyPart'
  | 'equipment'

export type SearchFilter = {
  category: ExerciseSearchCategory
  apiValue: string
  matchedText: string
}

export type ExerciseSearchRequest = {
  mode: SearchMode
  apiQuery: string
}

export type ExerciseSearchPlan = {
  requests: ExerciseSearchRequest[]
  filters: SearchFilter[]
  canonicalExercise: CanonicalExercise | null
  movementGroup: string[] | null
}

const movementGroups: Record<string, string[]> = {
  'bench press': [
    'bench press',
    'chest press',
  ],

  'shoulder press': [
    'shoulder press',
    'overhead press',
    'military press',
    'arnold press',
  ],

  squat: [
    'squat',
  ],

  row: [
    'row',
  ],

  curl: [
    'curl',
  ],

  'lateral raise': [
    'lateral raise',
  ],

  'leg extension': [
    'leg extension',
  ],

  'leg curl': [
    'leg curl',
  ],

  'hip thrust': [
    'hip thrust',
    'glute bridge',
  ],
}

function findCanonicalExercise(
  query: string,
): CanonicalExercise | null {
  const normalizedQuery = normalizeExerciseText(query)

  return (
    canonicalExercises.find((exercise) => {
      const searchableNames = [
        exercise.portugueseName,
        ...exercise.aliases,
      ]

      return searchableNames.some(
        (searchableName) =>
          normalizeExerciseText(searchableName) ===
          normalizedQuery,
      )
    }) ?? null
  )
}

function findSemanticMatches(query: string) {
  const normalizedQuery = normalizeExerciseText(query)
  const matches: SearchFilter[] = []

  for (const term of exerciseSemanticSearchTerms) {
    const matchedText = [...term.portuguese]
      .sort(
        (first, second) =>
          second.length - first.length,
      )
      .find((portugueseTerm) =>
        normalizedQuery.includes(
          normalizeExerciseText(portugueseTerm),
        ),
      )

    if (!matchedText) {
      continue
    }

    matches.push({
      category: term.category,
      apiValue: term.apiValue,
      matchedText,
    })
  }

  return matches
}

function chooseMostSpecificMatch(
  matches: SearchFilter[],
  category: ExerciseSearchCategory,
) {
  return matches
    .filter((match) => match.category === category)
    .sort(
      (first, second) =>
        second.matchedText.length -
        first.matchedText.length,
    )[0]
}

function deduplicateRequests(
  requests: ExerciseSearchRequest[],
) {
  const seen = new Set<string>()

  return requests.filter((request) => {
    const key = `${request.mode}:${request.apiQuery}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export function createExerciseSearchPlan(
  userQuery: string,
): ExerciseSearchPlan {
  const canonicalExercise =
    findCanonicalExercise(userQuery)

  if (canonicalExercise) {
    return {
      requests: canonicalExercise.searchQueries.map(
        (apiQuery) => ({
          mode: 'name',
          apiQuery,
        }),
      ),
      filters: [],
      canonicalExercise,
      movementGroup: null,
    }
  }

  const matches = findSemanticMatches(userQuery)

  const movement = chooseMostSpecificMatch(
    matches,
    'movement',
  )

  const target = chooseMostSpecificMatch(
    matches,
    'target',
  )

  const bodyPart = chooseMostSpecificMatch(
    matches,
    'bodyPart',
  )

  const equipment = chooseMostSpecificMatch(
    matches,
    'equipment',
  )

  const variation = chooseMostSpecificMatch(
    matches,
    'variation',
  )

  const selectedMatches = [
    movement,
    target,
    bodyPart,
    equipment,
    variation,
  ].filter(
    (match): match is SearchFilter => Boolean(match),
  )

  if (movement) {
    const movementGroup =
      movementGroups[movement.apiValue] ?? [
        movement.apiValue,
      ]

    const requests: ExerciseSearchRequest[] = [
      {
        mode: 'name',
        apiQuery: movement.apiValue,
      },
    ]

    if (target) {
      requests.push({
        mode: 'target',
        apiQuery: target.apiValue,
      })
    }

    if (bodyPart) {
      requests.push({
        mode: 'bodyPart',
        apiQuery: bodyPart.apiValue,
      })
    }

    if (equipment) {
      requests.push({
        mode: 'equipment',
        apiQuery: equipment.apiValue,
      })
    }

    return {
      requests: deduplicateRequests(requests),
      filters: selectedMatches.filter(
        (match) => match !== movement,
      ),
      canonicalExercise: null,
      movementGroup,
    }
  }

  if (target) {
    return {
      requests: [
        {
          mode: 'target',
          apiQuery: target.apiValue,
        },
      ],
      filters: selectedMatches.filter(
        (match) => match !== target,
      ),
      canonicalExercise: null,
      movementGroup: null,
    }
  }

  if (bodyPart) {
    return {
      requests: [
        {
          mode: 'bodyPart',
          apiQuery: bodyPart.apiValue,
        },
      ],
      filters: selectedMatches.filter(
        (match) => match !== bodyPart,
      ),
      canonicalExercise: null,
      movementGroup: null,
    }
  }

  if (equipment) {
    return {
      requests: [
        {
          mode: 'equipment',
          apiQuery: equipment.apiValue,
        },
      ],
      filters: selectedMatches.filter(
        (match) => match !== equipment,
      ),
      canonicalExercise: null,
      movementGroup: null,
    }
  }

  return {
    requests: [
      {
        mode: 'name',
        apiQuery: userQuery.trim(),
      },
    ],
    filters: [],
    canonicalExercise: null,
    movementGroup: null,
  }
}
