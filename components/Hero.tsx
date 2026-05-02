export function Hero() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-[var(--fg)] sm:text-4xl">
        Заявка на разработку сайта
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-pretty text-lg leading-relaxed text-[var(--muted)]">
        Заполните короткую анкету, чтобы я могла понять задачу и подготовить
        предложение.
      </p>
      <div className="mt-10">
        <a
          href="#anketa-form"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Заполнить анкету
        </a>
      </div>
    </section>
  );
}
