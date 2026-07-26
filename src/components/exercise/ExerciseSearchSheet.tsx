import {
  ChevronRight,
  Search,
  WifiOff,
  X,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { searchWorkoutXExercises } from '../../services/api/workoutXService'
import type { Exercise } from '../../types/exercise'

type ExerciseSearchSheetProps = {
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

const MINIMUM_SEARCH_LENGTH = 2
const SEARCH_DELAY = 500

export function ExerciseSearchSheet({
  onClose,
  onSelect,
}: ExerciseSearchSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Exercise[]>([])

  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 250)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
  }, [])

  useEffect(() => {
    const normalizedSearch = search.trim()

    if (
      normalizedSearch.length <
      MINIMUM_SEARCH_LENGTH
    ) {
      setResults([])
      setError('')
      setIsSearching(false)

      return
    }

    const abortController = new AbortController()

    const searchTimer = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        setError('')

        const exercises =
          await searchWorkoutXExercises(
            normalizedSearch,
            abortController.signal,
          )

        if (!abortController.signal.aborted) {
          setResults(exercises)
        }
      } catch (searchError) {
        if (abortController.signal.aborted) {
          return
        }

        console.error(
          'Não foi possível pesquisar exercícios.',
          searchError,
        )

        setResults([])

        setError(
          searchError instanceof Error
            ? searchError.message
            : 'Não foi possível pesquisar exercícios.',
        )
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, SEARCH_DELAY)

    return () => {
      abortController.abort()
      window.clearTimeout(searchTimer)
    }
  }, [search])

  function clearSearch() {
    setSearch('')
    setResults([])
    setError('')
    inputRef.current?.focus()
  }

  const normalizedSearch = search.trim()

  return (
    <div
      className="exercise-sheet-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-search-title"
    >
      <section className="exercise-sheet exercise-search-sheet">
        <header className="exercise-sheet__header">
          <div>
            <p className="exercise-sheet__eyebrow">
              WorkoutX
            </p>

            <h1
              id="exercise-search-title"
              className="exercise-sheet__title"
            >
              Adicionar exercício
            </h1>
          </div>

          <button
            type="button"
            className="exercise-sheet__close"
            aria-label="Fechar pesquisa"
            onClick={onClose}
          >
            <X size={21} strokeWidth={2.1} />
          </button>
        </header>

        <div className="exercise-search">
          <Search
            className="exercise-search__icon"
            size={20}
            strokeWidth={2}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            className="exercise-search__input"
            type="search"
            value={search}
            placeholder="Ex.: bench press"
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="exercise-search__clear"
              aria-label="Limpar pesquisa"
              onClick={clearSearch}
            >
              <X size={17} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="exercise-search__content">
          {!normalizedSearch && (
            <div className="exercise-search__empty">
              <div
                className="exercise-search__empty-icon"
                aria-hidden="true"
              >
                <Search size={26} strokeWidth={1.8} />
              </div>

              <h2>Qual exercício deseja adicionar?</h2>

              <p>
                Pesquise pelo nome em inglês. A tradução será
                adicionada em uma etapa posterior.
              </p>
            </div>
          )}

          {normalizedSearch.length === 1 && (
            <div className="exercise-search__empty">
              <h2>Continue digitando</h2>

              <p>
                Digite pelo menos dois caracteres para iniciar a
                pesquisa.
              </p>
            </div>
          )}

          {isSearching && (
            <div
              className="exercise-search-loading"
              aria-label="Pesquisando exercícios"
            >
              <span />
              <span />
              <span />
            </div>
          )}

          {!isSearching && error && (
            <div className="exercise-search__empty">
              <div
                className="exercise-search__empty-icon"
                aria-hidden="true"
              >
                <WifiOff size={26} strokeWidth={1.8} />
              </div>

              <h2>Pesquisa indisponível</h2>

              <p>{error}</p>
            </div>
          )}

          {!isSearching &&
            !error &&
            normalizedSearch.length >=
              MINIMUM_SEARCH_LENGTH &&
            results.length === 0 && (
              <div className="exercise-search__empty">
                <h2>Nenhum exercício encontrado</h2>

                <p>
                  Tente pesquisar usando outro nome em inglês.
                </p>
              </div>
            )}

          {!isSearching &&
            !error &&
            results.length > 0 && (
              <div className="exercise-results">
                <p className="exercise-results__count">
                  {results.length}{' '}
                  {results.length === 1
                    ? 'resultado'
                    : 'resultados'}
                </p>

                <div className="exercise-results__list">
                  {results.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      className="exercise-result"
                      onClick={() => onSelect(exercise)}
                    >
                      <span className="exercise-result__content">
                        <strong>{exercise.name}</strong>

                        <span>
                          {exercise.muscle} ·{' '}
                          {exercise.equipment}
                        </span>
                      </span>

                      <ChevronRight
                        className="exercise-result__arrow"
                        size={20}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  )
}