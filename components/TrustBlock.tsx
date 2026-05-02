export function TrustBlock() {
  return (
    <div
      className="rounded-2xl border px-5 py-6 sm:px-8 sm:py-8"
      style={{
        backgroundColor: "var(--trust-bg)",
        borderColor: "var(--trust-border)",
      }}
    >
      <p className="text-center text-base leading-relaxed text-[var(--fg)] sm:text-lg">
        <span className="font-medium">Ваши персональные данные защищены.</span>
        <br />
        <span className="mt-2 inline-block text-[var(--muted)]">
          Они не публикуются в свободном доступе, не передаются третьим лицам и
          используются только для обработки вашей заявки.
        </span>
      </p>
    </div>
  );
}
