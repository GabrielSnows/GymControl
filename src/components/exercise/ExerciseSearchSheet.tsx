import { ChevronRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { exercises } from '../../data/exercises'
import type { Exercise } from '../../types/exercise'

type ExerciseSearchSheetProps = {
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function ExerciseSearchSheet({
  onClose,
  onSelect,
}: ExerciseSearchSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 250)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTimer)
    }
  }, [])

  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeText(search)

    if (!normalizedSearch) {
      return []
    }

    return exercises.filter((exercise) => {
      const searchableContent = normalizeText(
        `${exercise.name} ${exercise.muscle} ${exercise.equipment}`,
      )

      return searchableContent.includes(normalizedSearch)
    })
  }, [search])

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
            <p className="exercise-sheet__eyebrow">Biblioteca</p>

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
            placeholder="Pesquise pelo nome ou músculo"
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="exercise-search__clear"
              aria-label="Limpar pesquisa"
              onClick={() => {
                setSearch('')
                inputRef.current?.focus()
              }}
            >
              <X size={17} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="exercise-search__content">
          {!search && (
            <div className="exercise-search__empty">
              <div
                className="exercise-search__empty-icon"
                aria-hidden="true"
              >
                <Search size={26} strokeWidth={1.8} />
              </div>

              <h2>Qual exercício deseja adicionar?</h2>

              <p>
                Digite o nome do exercício ou o grupo muscular que deseja
                treinar.
              </p>
            </div>
          )}

          {search && filteredExercises.length === 0 && (
            <div className="exercise-search__empty">
              <h2>Nenhum exercício encontrado</h2>

              <p>
                Tente pesquisar usando outro nome ou o grupo muscular.
              </p>
            </div>
          )}

          {filteredExercises.length > 0 && (
            <div className="exercise-results">
              <p className="exercise-results__count">
                {filteredExercises.length}{' '}
                {filteredExercises.length === 1
                  ? 'resultado'
                  : 'resultados'}
              </p>

              <div className="exercise-results__list">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    className="exercise-result"
                    onClick={() => onSelect(exercise)}
                  >
                    <span className="exercise-result__content">
                      <strong>{exercise.name}</strong>

                      <span>
                        {exercise.muscle} · {exercise.equipment}
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