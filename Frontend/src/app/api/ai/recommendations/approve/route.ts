import { NextResponse } from "next/server";

const APPROVAL_ERROR = "Failed to approve AI recommendations through deployed AI backend.";

function aiBackendUrl() {
  return (process.env.AI_BACKEND_URL ?? process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "").replace(/\/+$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const backendUrl = aiBackendUrl();
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: `${APPROVAL_ERROR} AI_BACKEND_URL is not configured.` },
        { status: 500 },
      );
    }

    const response = await fetch(`${backendUrl}/api/ai/recommendations/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null) as { success?: boolean; data?: unknown; error?: string } | null;

    if (!response.ok || result?.success === false) {
      return NextResponse.json(
        { success: false, error: result?.error ? `${APPROVAL_ERROR} ${result.error}` : APPROVAL_ERROR },
        { status: response.ok ? 502 : response.status },
      );
    }

    return NextResponse.json(result ?? { success: true, data: [] });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown backend request error.";
    return NextResponse.json({ success: false, error: `${APPROVAL_ERROR} ${details}` }, { status: 502 });
  }
}
