import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Config 
const OWNER = "molim-team";
const REPO = "molim-js";
const FILE = "public/scholarships.json";
const GITHUB_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;

const GITHUB_TOKEN   = process.env.GITHUB_TOKEN   ?? "";
const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const NOTIFY_SECRET  = process.env.NOTIFY_SECRET  ?? "";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Rate Limiter (in-memory, per IP, 30 req/min) 
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

// Session token helpers 
function createSessionToken(): string {
  if (!ADMIN_SECRET) throw new Error("ADMIN_SECRET not configured");
  const payload = Buffer.from(JSON.stringify({ iat: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): boolean {
  if (!ADMIN_SECRET || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  const expected = createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");
  const expectedBuf = Buffer.from(expected);
  const actualBuf   = Buffer.from(sig);
  if (expectedBuf.length !== actualBuf.length) return false;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return false;

  try {
    const { iat } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (Date.now() - iat > SESSION_TTL_MS) return false;
  } catch {
    return false;
  }
  return true;
}

// Helpers
function toBase64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64");
}

function decodeBase64Json(content: string): unknown[] {
  const clean = content.replace(/\n/g, "");
  const decoded = Buffer.from(clean, "base64").toString("utf-8");
  return JSON.parse(decoded);
}

function sanitizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim();
}

function sanitizeArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeString).filter(Boolean);
}

function sanitizeScholarship(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id:             sanitizeString(raw.id),
    name:           sanitizeString(raw.name),
    name_en:        sanitizeString(raw.name_en),
    country:        sanitizeString(raw.country),
    flag:           sanitizeString(raw.flag),
    degree:         sanitizeString(raw.degree),
    language:       sanitizeString(raw.language),
    description:    sanitizeString(raw.description),
    benefits:       sanitizeArray(raw.benefits),
    requirements:   sanitizeArray(raw.requirements),
    majors:         sanitizeArray(raw.majors),
    open_date:      sanitizeString(raw.open_date),
    deadline:       sanitizeString(raw.deadline),
    documents: {
      required: sanitizeArray((raw.documents as Record<string, unknown>)?.required),
      optional: sanitizeArray((raw.documents as Record<string, unknown>)?.optional),
    },
    link:           sanitizeString(raw.link),
    open:           raw.open === true,
    notes:          sanitizeString(raw.notes),
    groupLink:      sanitizeString(raw.groupLink),
    discussionLink: sanitizeString(raw.discussionLink),
  };
}

// Main Handler 
export async function POST(req: NextRequest) {
  // 1. Misconfiguration guard
  if (!GITHUB_TOKEN || !ADMIN_SECRET || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Server misconfiguration — contact administrator" },
      { status: 500 }
    );
  }

  // 2. Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — try again in a minute" },
      { status: 429 }
    );
  }

  // 3. Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body;

  // Action: verify-password
  if (action === "verify-password") {
    const { password } = body;
    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "كلمة المرور مطلوبة" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pwdBuf      = Buffer.from(password);
    const expectedBuf = Buffer.from(ADMIN_PASSWORD);
    const match =
      pwdBuf.length === expectedBuf.length &&
      timingSafeEqual(pwdBuf, expectedBuf);

    if (!match) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    return NextResponse.json({ token: createSessionToken() });
  }

  // 4. All other actions require a valid session token
  const sessionToken = req.headers.get("x-session-token") ?? "";
  if (!verifySessionToken(sessionToken)) {
    return NextResponse.json(
      { error: "غير مصرح — يرجى تسجيل الدخول مجدداً" },
      { status: 401 }
    );
  }

  // Action: fetch
  if (action === "fetch") {
    const ghRes = await fetch(GITHUB_API, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Cache-Control": "no-cache",
      },
    });
    if (!ghRes.ok) {
      return NextResponse.json(
        { error: "Failed to reach GitHub — check server token" },
        { status: 502 }
      );
    }
    const data = (await ghRes.json()) as { sha: string; content: string };
    const scholarships = decodeBase64Json(data.content);
    return NextResponse.json({ sha: data.sha, scholarships });
  }

  // Action: save 
  if (action === "save") {
    const { sha, scholarships, commitMessage } = body;

    if (typeof sha !== "string" || !Array.isArray(scholarships)) {
      return NextResponse.json(
        { error: "Missing sha or scholarships array" },
        { status: 400 }
      );
    }
    if (typeof commitMessage !== "string" || !commitMessage.trim()) {
      return NextResponse.json({ error: "Missing commitMessage" }, { status: 400 });
    }

    const sanitized = (scholarships as Record<string, unknown>[]).map(sanitizeScholarship);

    const ghRes = await fetch(GITHUB_API, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: sanitizeString(commitMessage),
        content: toBase64(JSON.stringify(sanitized, null, 2)),
        sha,
      }),
    });

    if (!ghRes.ok) {
      const err = (await ghRes.json()) as { message?: string };
      return NextResponse.json(
        { error: err.message ?? "GitHub save failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  // Action: notify
  if (action === "notify") {
    const { scholarship } = body;
    if (!scholarship || typeof scholarship !== "object") {
      return NextResponse.json({ error: "Missing scholarship object" }, { status: 400 });
    }

    fetch(`${req.nextUrl.origin}/api/notify-scholarship`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-notify-secret": NOTIFY_SECRET,
      },
      body: JSON.stringify({ scholarship }),
    }).catch(console.error);

    return NextResponse.json({ ok: true });
  }
  // Unknown action
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}