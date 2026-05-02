import type { SiteBudget } from "@/lib/budgetOptions";

export type SubmissionPayload = {
  fullName: string;
  phone: string;
  email: string;
  summary: string;
  budget: SiteBudget;
  description: string;
  likes: string;
  dislikes: string;
  extras: string;
};

export function formatSubmissionMessage(data: SubmissionPayload): string {
  const line = (label: string, value: string) =>
    `${label}\n${value.trim() || "—"}`;

  return [
    "Новая заявка с сайта",
    "",
    line("Имя:", data.fullName),
    "",
    line("Телефон:", data.phone),
    "",
    line("Email:", data.email),
    "",
    line("Что нужно сделать:", data.summary),
    "",
    line("Бюджет на создание сайта:", data.budget),
    "",
    line("Описание задачи:", data.description),
    "",
    line("Сайты которые нравятся:", data.likes),
    "",
    line("Сайты которые не нравятся:", data.dislikes),
    "",
    line("Дополнительные пожелания:", data.extras),
  ].join("\n");
}
