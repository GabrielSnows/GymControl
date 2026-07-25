type FoundationPageProps = {
  eyebrow: string
  title: string
  description: string
}

export function FoundationPage({
  eyebrow,
  title,
  description,
}: FoundationPageProps) {
  return (
    <section className="foundation-page">
      <header className="foundation-page__header">
        <p className="foundation-page__eyebrow">{eyebrow}</p>

        <h1 className="foundation-page__title">{title}</h1>

        <p className="foundation-page__description">{description}</p>
      </header>

      <article className="foundation-card">
        <div className="foundation-card__icon" aria-hidden="true">
          <span />
        </div>

        <div>
          <h2 className="foundation-card__title">
            Fundação configurada
          </h2>

          <p className="foundation-card__description">
            React, Tailwind, rotas, PWA, safe areas e navegação mobile
            estão preparados.
          </p>
        </div>
      </article>
    </section>
  )
}