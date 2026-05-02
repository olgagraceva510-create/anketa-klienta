/** Допустимые значения поля «Бюджет на создание сайта» (совпадают с текстом в заявке). */
export const SITE_BUDGET_OPTIONS = [
  "до 30 000 ₽",
  "30 000 – 60 000 ₽",
  "60 000 – 100 000 ₽",
  "100 000 – 200 000 ₽",
  "более 200 000 ₽",
] as const;

export type SiteBudget = (typeof SITE_BUDGET_OPTIONS)[number];

export function isValidSiteBudget(value: string): value is SiteBudget {
  return (SITE_BUDGET_OPTIONS as readonly string[]).includes(value);
}
