import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const newPassword = String(body.new_password ?? "").trim();

    if (!newPassword) {
      return NextResponse.json({ success: false, error: "New password is required." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabaseServer
      .from("app_users")
      .update({
        password_hash: passwordHash,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
