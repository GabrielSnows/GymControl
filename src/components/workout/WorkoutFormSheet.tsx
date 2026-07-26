import {
  AlertTriangle,
  Dumbbell,
  Trash2,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import type { WorkoutDefinition } from '../../types/workout'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type WorkoutFormSheetProps = {
  workout?: WorkoutDefinition | null
  onClose: () => void
  onSave: (values: {
    name: string
    description: string
  }) => Promise<void>
  onDelete?: () => Promise<void>
}

export function WorkoutFormSheet({
  workout,
  onClose,
  onSave,
  onDelete,
}: WorkoutFormSheetProps) {
  const [name, setName] = useState(workout?.name ?? '')
  const [description, setDescription] = useState(
    workout?.description ?? '',
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false)
  const [error, setError] = useState('')

  const isEditing = Boolean(workout)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedName = name.trim()

    if (!normalizedName) {
      setError('Informe um nome para o treino.')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      await onSave({
        name: normalizedName,
        description: description.trim(),
      })
    } catch (submitError) {
      console.error(
        'Não foi possível salvar o treino.',
        submitError,
      )

      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar o treino.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) {
      return
    }

    try {
      setIsDeleting(true)
      setError('')

      await onDelete()
    } catch (deleteError) {
      console.error(
        'Não foi possível excluir o treino.',
        deleteError,
      )

      setError('Não foi possível excluir o treino.')
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="workout-form-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-form-title"
    >
      <section className="workout-form-sheet">
        <header className="workout-form-sheet__header">
          <div>
            <p className="workout-form-sheet__eyebrow">
              {isEditing
                ? `Treino ${workout?.code}`
                : 'Nova divisão'}
            </p>

            <h1 id="workout-form-title">
              {isEditing ? 'Editar treino' : 'Criar treino'}
            </h1>
          </div>

          <button
            type="button"
            className="workout-form-sheet__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            <X size={21} strokeWidth={2.1} />
          </button>
        </header>

        <div className="workout-form-sheet__content">
          <div className="workout-form-sheet__symbol">
            <Dumbbell size={30} strokeWidth={1.8} />

            <div>
              <strong>
                {isEditing
                  ? `Treino ${workout?.code}`
                  : 'Próximo treino'}
              </strong>

              <span>
                {isEditing
                  ? 'A letra é definida pela ordem da rotina.'
                  : 'A próxima letra será criada automaticamente.'}
              </span>
            </div>
          </div>

          <form
            className="workout-form"
            onSubmit={handleSubmit}
          >
            <div className="workout-form__fields">
              <Input
                label="Nome do treino"
                value={name}
                placeholder="Ex.: Peito e tríceps"
                autoFocus
                maxLength={60}
                required
                onChange={(event) => {
                  setName(event.target.value)

                  if (error) {
                    setError('')
                  }
                }}
              />

              <div className="workout-form__textarea-field">
                <label htmlFor="workout-description">
                  Descrição
                </label>

                <textarea
                  id="workout-description"
                  value={description}
                  placeholder="Descreva brevemente o foco deste treino."
                  maxLength={140}
                  rows={4}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

                <span>{description.length}/140</span>
              </div>
            </div>

            {error && (
              <div className="workout-form__error" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isSaving}
              disabled={isDeleting}
            >
              {isEditing ? 'Salvar alterações' : 'Criar treino'}
            </Button>
          </form>

          {isEditing && onDelete && (
            <section className="workout-form-danger">
              {!showDeleteConfirmation ? (
                <button
                  type="button"
                  className="workout-form-danger__trigger"
                  onClick={() =>
                    setShowDeleteConfirmation(true)
                  }
                >
                  <Trash2 size={18} strokeWidth={2} />
                  Excluir treino
                </button>
              ) : (
                <div className="workout-form-danger__confirmation">
                  <div className="workout-form-danger__message">
                    <AlertTriangle
                      size={20}
                      strokeWidth={2}
                    />

                    <div>
                      <strong>Excluir este treino?</strong>

                      <p>
                        Os exercícios e cargas registrados nele
                        também serão apagados.
                      </p>
                    </div>
                  </div>

                  <div className="workout-form-danger__actions">
                    <Button
                      variant="secondary"
                      fullWidth
                      disabled={isDeleting}
                      onClick={() =>
                        setShowDeleteConfirmation(false)
                      }
                    >
                      Cancelar
                    </Button>

                    <Button
                      variant="danger"
                      fullWidth
                      isLoading={isDeleting}
                      onClick={() => void handleDelete()}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </div>
  )
}