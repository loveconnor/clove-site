import { Resend } from "resend";
import {
  renderBriefEmailHtml,
  renderBriefEmailText,
  type BriefPayload,
} from "@/app/_email/BriefEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IS_PROD = process.env.NODE_ENV === "production";

type RawBody = Partial<Record<keyof BriefPayload, unknown>>;

const MAX_LEN: Record<keyof BriefPayload, number> = {
  projectType: 120,
  budget: 60,
  name: 120,
  company: 160,
  email: 200,
  location: 160,
  timeline: 120,
  material: 500,
  description: 5000,
  submittedAt: 64,
};

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function POST(request: Request) {
  let body: RawBody;
  try {
    body = (await request.json()) as RawBody;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const payload: BriefPayload = {
    projectType: clean(body.projectType, MAX_LEN.projectType),
    budget: clean(body.budget, MAX_LEN.budget),
    name: clean(body.name, MAX_LEN.name),
    company: clean(body.company, MAX_LEN.company),
    email: clean(body.email, MAX_LEN.email),
    location: clean(body.location, MAX_LEN.location),
    timeline: clean(body.timeline, MAX_LEN.timeline),
    material: clean(body.material, MAX_LEN.material),
    description: clean(body.description, MAX_LEN.description),
    submittedAt: new Date().toISOString(),
  };

  const missing: string[] = [];
  if (!payload.projectType) missing.push("projectType");
  if (!payload.budget) missing.push("budget");
  if (!payload.name) missing.push("name");
  if (!payload.email) missing.push("email");
  if (!payload.timeline) missing.push("timeline");
  if (!payload.description) missing.push("description");
  if (missing.length > 0) {
    return Response.json(
      { ok: false, error: `Missing required fields: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }

  if (!isEmail(payload.email)) {
    return Response.json(
      { ok: false, error: "Please provide a valid email." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO ?? "hello@clove.studio";
  const from = process.env.RESEND_FROM ?? (IS_PROD
    ? "clove briefs <briefs@clove.studio>"
    : "clove studio <onboarding@resend.dev>");

  if (!apiKey) {
    console.error("[brief] RESEND_API_KEY is not set");
    return Response.json(
      { ok: false, error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  const subject = `New brief — ${payload.name} · ${payload.projectType}`;
  const html = renderBriefEmailHtml(payload);
  const text = renderBriefEmailText(payload);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      replyTo: payload.email,
      subject,
      html,
      text,
      headers: {
        "X-Entity-Ref-ID": `brief-${Date.now()}`,
      },
    });

    if (error) {
      console.error("[brief] Resend error", error);

      const details = [error.name, error.message].filter(Boolean).join(": ");
      return Response.json(
        {
          ok: false,
          error: IS_PROD
            ? "Could not send the brief. Please try again."
            : `Could not send the brief. ${details || "Check RESEND_FROM / RESEND_TO and domain verification."}`,
        },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[brief] unexpected error", err);
    return Response.json(
      { ok: false, error: "Unexpected error while sending." },
      { status: 500 },
    );
  }
}
