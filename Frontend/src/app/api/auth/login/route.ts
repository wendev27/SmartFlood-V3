import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sanitizeAppUser } from "@/lib/appUserMapping";
import { supabaseServer } from "@/lib/supabaseServer";

const maxFailedAttempts = 3;
const lockMinutes = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    const { data: user, error } = await supabaseServer
      .from("app_users")
      .select("id,first_name,last_name,email,mobile_number,address,profile_image,created_at,updated_at,barangay,sex,role_id,barangay_id,status,password_hash,failed_login_attempts,locked_until,last_login_at")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const status = String(user.status ?? "inactive").toLowerCase();
    if (status === "inactive" || status === "blocked") {
      return NextResponse.json({ success: false, error: "Access denied. This account is not active." }, { status: 403 });
    }

    const lockedUntil = user.locked_until ? new Date(String(user.locked_until)) : null;
    if (lockedUntil && lockedUntil.getTime() > Date.now()) {
      return NextResponse.json({ success: false, error: "Access denied. This account is temporarily locked." }, { status: 403 });
    }

    const passwordHash = String(user.password_hash ?? "");
    const passwordMatches = passwordHash ? await bcrypt.compare(password, passwordHash) : false;

    if (!passwordMatches) {
      const failedAttempts = Number(user.failed_login_attempts ?? 0) + 1;
      const lockUntil = failedAttempts >= maxFailedAttempts ? new Date(Date.now() + lockMinutes * 60 * 1000).toISOString() : null;
      await supabaseServer
        .from("app_users")
        .update({
          failed_login_attempts: failedAttempts,
          locked_until: lockUntil,
          status: failedAttempts >= maxFailedAttempts ? "blocked" : status,
        })
        .eq("id", user.id);

      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    await supabaseServer
      .from("app_users")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    const safeUser = sanitizeAppUser(user);
    return NextResponse.json({
      success: true,
      data: {
        id: safeUser.id,
        full_name: [safeUser.first_name, safeUser.last_name].filter(Boolean).join(" "),
        email: safeUser.email,
        role_id: safeUser.role_id,
        role_name: safeUser.role_name,
        barangay_id: safeUser.barangay_id,
        barangay_name: safeUser.barangay_name,
        status: safeUser.status,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
