import { NextRequest, NextResponse } from "next/server";
import { allowedAccountStatuses, normalizeAccountStatus } from "@/lib/appUserMapping";
import { supabaseServer } from "@/lib/supabaseServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = normalizeAccountStatus(body.status);

    if (!allowedAccountStatuses.has(status)) {
      return NextResponse.json({ success: false, error: "Status must be active, inactive, or blocked." }, { status: 400 });
    }

    const payload: Record<string, unknown> = { status };
    if (status === "active") {
      payload.locked_until = null;
      payload.failed_login_attempts = 0;
    }

    const { error } = await supabaseServer
      .from("app_users")
      .update(payload)
      .eq("id", id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: { id, status } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
