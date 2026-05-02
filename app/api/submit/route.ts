import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isValidSiteBudget } from "@/lib/budgetOptions";
import {
  formatSubmissionMessage,
  type SubmissionPayload,
} from "@/lib/formatSubmission";

/** Node runtime: nodemailer и полный TCP к SMTP на Edge недоступны */
export const runtime = "nodejs";

const MAX_LEN = 4000;
const MAX_SHORT = 500;

/** SMTP: короткие таймауты, чтобы не ждать платформенный обрыв ~30 с на Vercel */
const SMTP_CONNECTION_MS = 8000;
const SMTP_GREETING_MS = 8000;
const SMTP_SOCKET_MS = 10_000;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function emailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_TO &&
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function isGmailHost(host: string): boolean {
  return host.toLowerCase().includes("gmail.com");
}

function telegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
}

function logError(prefix: string, err: unknown): void {
  if (err instanceof Error) {
    console.error(prefix, err.message, err.stack ? `\n${err.stack}` : "");
  } else {
    console.error(prefix, String(err));
  }
}

async function sendEmail(
  subject: string,
  text: string,
  replyTo: string,
): Promise<void> {
  try {
    const host = process.env.SMTP_HOST!.trim();
    const port = Number(process.env.SMTP_PORT || "587");
    const secure =
      process.env.SMTP_SECURE === "true" || port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: SMTP_CONNECTION_MS,
      greetingTimeout: SMTP_GREETING_MS,
      socketTimeout: SMTP_SOCKET_MS,
      ...(isGmailHost(host) && !secure ? { requireTLS: true } : {}),
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO,
      replyTo,
      subject,
      text,
    });
  } catch (err) {
    logError("[api/submit] SMTP send failed:", err);
    throw err;
  }
}

async function sendTelegram(text: string): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    const chatId = process.env.TELEGRAM_CHAT_ID!;
    const body = text.length > 4090 ? `${text.slice(0, 4087)}...` : text;

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: body,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      );
    }
  } catch (err) {
    logError("[api/submit] Telegram send failed:", err);
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const hasEmail = emailConfigured();
    const hasTg = telegramConfigured();

    if (!hasEmail && !hasTg) {
      return NextResponse.json(
        { error: "Приём заявок не настроен." },
        { status: 503 },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch (parseErr) {
      logError("[api/submit] request.json failed:", parseErr);
      return NextResponse.json(
        { error: "Некорректный запрос." },
        { status: 400 },
      );
    }

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "Некорректный запрос." },
        { status: 400 },
      );
    }

    const body = json as Record<string, unknown>;

    if (body.consent !== true) {
      return NextResponse.json(
        { error: "Нужно согласие на обработку персональных данных." },
        { status: 400 },
      );
    }

    const fullName = trimStr(body.fullName, MAX_SHORT);
    const phone = trimStr(body.phone, MAX_SHORT);
    const email = trimStr(body.email, MAX_SHORT);
    const summary = trimStr(body.summary, MAX_LEN);
    const budgetRaw = trimStr(body.budget, MAX_SHORT);
    const description = trimStr(body.description, MAX_LEN);
    const likes = trimStr(body.likes, MAX_LEN);
    const dislikes = trimStr(body.dislikes, MAX_LEN);
    const extras = trimStr(body.extras, MAX_LEN);

    if (!fullName || !phone || !email || !summary || !description) {
      return NextResponse.json(
        { error: "Заполните обязательные поля формы." },
        { status: 400 },
      );
    }

    if (!isValidSiteBudget(budgetRaw)) {
      return NextResponse.json(
        { error: "Выберите бюджет из списка." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Укажите корректный email." },
        { status: 400 },
      );
    }

    const payload: SubmissionPayload = {
      fullName,
      phone,
      email,
      summary,
      budget: budgetRaw,
      description,
      likes,
      dislikes,
      extras,
    };

    const message = formatSubmissionMessage(payload);
    const subject = "Новая заявка с сайта";

    try {
      const settled = await Promise.allSettled([
        hasEmail ? sendEmail(subject, message, email) : Promise.resolve(),
        hasTg ? sendTelegram(message) : Promise.resolve(),
      ]);

      const emailRejected =
        hasEmail && settled[0]?.status === "rejected";
      const telegramRejected =
        hasTg && settled[1]?.status === "rejected";

      const emailOk = !hasEmail || !emailRejected;
      const tgOk = !hasTg || !telegramRejected;

      if (!emailOk && !tgOk) {
        return NextResponse.json(
          { error: "Не удалось отправить заявку. Попробуйте позже." },
          { status: 502 },
        );
      }

      if (hasEmail && !emailOk) {
        return NextResponse.json(
          { error: "Не удалось отправить заявку на email. Попробуйте позже." },
          { status: 502 },
        );
      }

      if (hasTg && !tgOk) {
        return NextResponse.json(
          {
            error:
              "Не удалось отправить заявку в Telegram. Попробуйте позже.",
          },
          { status: 502 },
        );
      }

      return NextResponse.json({ ok: true });
    } catch (deliveryErr) {
      logError("[api/submit] delivery pipeline error:", deliveryErr);
      return NextResponse.json(
        { error: "Не удалось отправить заявку. Попробуйте позже." },
        { status: 502 },
      );
    }
  } catch (err) {
    logError("[api/submit] unhandled error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера. Попробуйте позже." },
      { status: 500 },
    );
  }
}
