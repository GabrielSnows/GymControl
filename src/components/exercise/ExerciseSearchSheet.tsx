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
  type FormEvent,
} from 'react'

import { searchWorkoutXExercises } from '../../services/api/workoutXService'
import type { Exercise } from '../../types/exercise'

type ExerciseSearchSheetProps = {
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

const MINIMUM_SEARCH_LENGTH = 2

export function ExerciseSearchSheet({
  onClose,
  onSelect,
}: ExerciseSearchSheetProps) {
  const inputRef =
    useRef<HTMLInputElement>(null)

  const activeRequestRef =
    useRef<AbortController | null>(null)

  const [search, setSearch] = useState('')

  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState('')

  const [results, setResults] = useState<
    Exercise[]
  >([])

  const [isSearching, setIsSearching] =
    useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 250)

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.clearTimeout(focusTimer)
      activeRequestRef.current?.abort()
    }
  }, [])

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedSearch = search.trim()

    if (
      normalizedSearch.length <
      MINIMUM_SEARCH_LENGTH
    ) {
      setSubmittedSearch('')
      setResults([])

      setError(
        `Digite pelo menos ${MINIMUM_SEARCH_LENGTH} caracteres.`,
      )

      inputRef.current?.focus()
      return
    }

    activeRequestRef.current?.abort()

    const abortController =
      new AbortController()

    activeRequestRef.current =
      abortController

    try {
      setSubmittedSearch(normalizedSearch)
      setIsSearching(true)
      setError('')
      setResults([])

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
  }

  function clearSearch() {
    activeRequestRef.current?.abort()
    activeRequestRef.current = null

    setSearch('')
    setSubmittedSearch('')
    setResults([])
    setError('')
    setIsSearching(false)

    inputRef.current?.focus()
  }

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
              Catálogo de exercícios
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

        <form
          className="exercise-search"
          onSubmit={handleSearch}
        >
          <Search
            className="exercise-search__icon"
            size={20}
            strokeWidth={2}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            className="exercise-search__input"
            type="text"
            inputMode="search"
            value={search}
            placeholder="Ex.: supino peito com halteres"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Pesquisar exercício"
            onChange={(event) => {
              setSearch(event.target.value)

              if (error) {
                setError('')
              }
            }}
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
        </form>

        <div className="exercise-search__content">
          {!submittedSearch &&
            !isSearching &&
            !error && (
              <div className="exercise-search__empty">
                <div
                  className="exercise-search__empty-icon"
                  aria-hidden="true"
                >
                  <Search
                    size={26}
                    strokeWidth={1.8}
                  />
                </div>

                <h2>
                  Qual exercício deseja adicionar?
                </h2>

                <p>
                  Combine movimento, músculo e equipamento. Por
                  exemplo: “supino peito com halteres”.
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
                <WifiOff
                  size={26}
                  strokeWidth={1.8}
                />
              </div>

              <h2>Pesquisa indisponível</h2>

              <p>{error}</p>
            </div>
          )}

          {!isSearching &&
            !error &&
            submittedSearch &&
            results.length === 0 && (
              <div className="exercise-search__empty">
                <h2>
                  Nenhum exercício encontrado
                </h2>

                <p>
                  Tente remover um dos filtros ou pesquisar por
                  um nome mais geral.
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
                    : 'resultados'}{' '}
                  para “{submittedSearch}”
                </p>

                <div className="exercise-results__list">
                  {results.map((exercise) => {
                    const showOriginalName =
                      exercise.translationConfidence !==
                        'exact' &&
                      exercise.displayName
                        .toLocaleLowerCase('pt-BR') !==
                        exercise.originalName
                          .toLocaleLowerCase('en-US')

                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        className="exercise-result"
                        onClick={() =>
                          onSelect(exercise)
                        }
                      >
                        <span className="exercise-result__content">
                          <strong>
                            {exercise.displayName}
                          </strong>

                          {showOriginalName && (
                            <small className="exercise-result__original-name">
                              {exercise.originalName}
                            </small>
                          )}

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
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  )
}