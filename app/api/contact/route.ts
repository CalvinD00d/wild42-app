import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function clean(value: unknown, maximumLength: number) {
  return String(value ?? "").trim().slice(0, maximumLength);
}

async function resolveSmtpAddress() {
  const response = await fetch(
    "https://cloudflare-dns.com/dns-query?name=smtp.gmail.com&type=A",
    {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error("Could not resolve the mail server.");

  const result = (await response.json()) as {
    Answer?: Array<{ type?: number; data?: string }>;
  };
  const address = result.Answer?.find(
    (answer) => answer.type === 1 && typeof answer.data === "string",
  )?.data;

  if (!address) throw new Error("Could not resolve the mail server.");
  return address;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequest;
    const name = clean(body.name, 120);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 60);
    const message = clean(body.message, 10_000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const gmailUser = requiredEnvironmentVariable("GMAIL_USER");
    const gmailAppPassword = requiredEnvironmentVariable("GMAIL_APP_PASSWORD");
    const contactTo = requiredEnvironmentVariable("CONTACT_TO");
    const mailFrom = process.env.MAIL_FROM || gmailUser;
    const smtpAddress = await resolveSmtpAddress();

    const transporter = nodemailer.createTransport({
      host: smtpAddress,
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailAppPassword },
      tls: { servername: "smtp.gmail.com" },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });

    await transporter.sendMail({
      from: mailFrom,
      to: contactTo,
      replyTo: email,
      subject: `Portfolio contact${name ? ` — ${name}` : ""}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form delivery failed:", error);
    return NextResponse.json(
      { ok: false, error: "The message could not be sent. Please try again." },
      { status: 500 },
    );
  }
}
