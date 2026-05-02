import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isValidSiteBudget } from "@/lib/budgetOptions";
import {
  formatSubmissionMessage,
  type SubmissionPayload,
} from "@/lib/formatSubmission";

const MAX_LEN = 4000;
const MAX_SHORT = 500;

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

function telegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
}

async function sendEmail(subject: string, text: string): Promise<void> {
  const port = Number(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.EMAIL_TO,
    subject,
    text,
  });
}

async function sendTelegram(text: string): Promise<void> {
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
    },
  );

  if (!res.ok) {
    throw new Error("telegram_send_failed");
  }
}

export async function POST(request: Request) {
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
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
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

  const errors: string[] = [];

  if (hasEmail) {
    try {
      await sendEmail(subject, message);
    } catch {
      errors.push("email");
    }
  }

  if (hasTg) {
    try {
      await sendTelegram(message);
    } catch {
      errors.push("telegram");
    }
  }

  const needEmail = hasEmail;
  const needTg = hasTg;
  const emailOk = !needEmail || !errors.includes("email");
  const tgOk = !needTg || !errors.includes("telegram");

  if (!emailOk && !tgOk) {
    return NextResponse.json(
      { error: "Не удалось отправить заявку. Попробуйте позже." },
      { status: 502 },
    );
  }

  if (needEmail && !emailOk) {
    return NextResponse.json(
      { error: "Не удалось отправить заявку на email. Попробуйте позже." },
      { status: 502 },
    );
  }

  if (needTg && !tgOk) {
    return NextResponse.json(
      { error: "Не удалось отправить заявку в Telegram. Попробуйте позже." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
