"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SITE_BUDGET_OPTIONS } from "@/lib/budgetOptions";

const initial = {
  fullName: "",
  phone: "",
  email: "",
  summary: "",
  budget: "",
  description: "",
  likes: "",
  dislikes: "",
  extras: "",
};

const fieldClass =
  "block w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 text-[var(--fg)] shadow-sm placeholder:text-[var(--muted)] focus:border-[var(--fg)] focus:outline-none focus:ring-1 focus:ring-[var(--fg)]";

const inputClass = `mt-2 ${fieldClass} px-4`;

const labelClass = "block text-sm font-medium text-[var(--fg)]";

function SelectChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContactForm() {
  const [values, setValues] = useState(initial);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!consent) {
      setStatus("error");
      setErrorMessage("Отметьте согласие на обработку персональных данных.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          consent: true,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Что-то пошло не так. Попробуйте позже.");
        return;
      }

      setStatus("success");
      setValues(initial);
      setConsent(false);
    } catch {
      setStatus("error");
      setErrorMessage("Нет соединения с сервером. Проверьте сеть и попробуйте снова.");
    }
  }

  if (status === "success") {
    return (
      <div
        id="anketa-form"
        className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center sm:px-10"
      >
        <p className="text-lg font-medium text-[var(--fg)]">Спасибо!</p>
        <p className="mt-3 text-[var(--muted)]">
          Ваша заявка принята.
          <br />
          Я свяжусь с вами в ближайшее время.
        </p>
        <div className="mt-6">
          <a
            href="https://t.me/USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 sm:w-auto"
          >
            Написать в Telegram
          </a>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-10 text-sm font-medium text-[var(--fg)] underline underline-offset-4 hover:text-[var(--muted)]"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form
      id="anketa-form"
      onSubmit={onSubmit}
      className="scroll-mt-24 space-y-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-10 sm:px-10 sm:py-12"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={labelClass}>
            Имя и фамилия <span className="text-red-600">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={values.fullName}
            onChange={(e) =>
              setValues((v) => ({ ...v, fullName: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Телефон <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="summary" className={labelClass}>
            Что нужно сделать? <span className="text-red-600">*</span>
          </label>
          <input
            id="summary"
            name="summary"
            type="text"
            required
            value={values.summary}
            onChange={(e) =>
              setValues((v) => ({ ...v, summary: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="budget" className={labelClass}>
            Бюджет на создание сайта <span className="text-red-600">*</span>
          </label>
          <div className="relative mt-2">
            <select
              id="budget"
              name="budget"
              required
              value={values.budget}
              onChange={(e) =>
                setValues((v) => ({ ...v, budget: e.target.value }))
              }
              className={`${fieldClass} cursor-pointer appearance-none pl-4 pr-11`}
            >
              <option value="" disabled>
                Выберите вариант
              </option>
              {SITE_BUDGET_OPTIONS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--muted)]"
              aria-hidden
            >
              <SelectChevron />
            </span>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Описание задачи / ТЗ <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
            className={`${inputClass} min-h-[9rem] resize-y`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="likes" className={labelClass}>
            Ссылки на сайты, которые нравятся
          </label>
          <textarea
            id="likes"
            name="likes"
            rows={4}
            value={values.likes}
            onChange={(e) => setValues((v) => ({ ...v, likes: e.target.value }))}
            className={`${inputClass} min-h-[6rem] resize-y`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dislikes" className={labelClass}>
            Ссылки на сайты, которые не нравятся
          </label>
          <textarea
            id="dislikes"
            name="dislikes"
            rows={4}
            value={values.dislikes}
            onChange={(e) =>
              setValues((v) => ({ ...v, dislikes: e.target.value }))
            }
            className={`${inputClass} min-h-[6rem] resize-y`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="extras" className={labelClass}>
            Дополнительные пожелания
          </label>
          <textarea
            id="extras"
            name="extras"
            rows={4}
            value={values.extras}
            onChange={(e) => setValues((v) => ({ ...v, extras: e.target.value }))}
            className={`${inputClass} min-h-[6rem] resize-y`}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--fg)] focus:ring-[var(--fg)]"
        />
        <label htmlFor="consent" className="text-sm leading-relaxed text-[var(--fg)]">
          Я согласен(на) на{" "}
          <Link
            href="/privacy"
            className="font-medium underline underline-offset-2 hover:text-[var(--muted)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            обработку персональных данных
          </Link>
        </label>
      </div>

      {status === "error" && errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Отправка…" : "Отправить заявку"}
        </button>
      </div>
    </form>
  );
}
