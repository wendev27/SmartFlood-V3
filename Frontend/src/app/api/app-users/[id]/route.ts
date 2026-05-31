import { NextRequest, NextResponse } from "next/server";
import { pickAppUserPayload, sanitizeAppUser } from "@/lib/appUserMapping";
import { supabaseServer } from "@/lib/supabaseServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedPatchFields = new Set([
  "first_name",
  "last_name",
  "email",
  "mobile_number",
  "address",
  "sex",
  "role_id",
  "barangay_id",
  "status",
]);

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const allowedBody = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedPatchFields.has(key)),
    );
    const payload = pickAppUserPayload(allowedBody);

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: false, error: "No allowed fields to update." }, { status: 400 });
    }

    if (Number(payload.role_id) === 4 && (payload.barangay_id == null || payload.barangay_id === "")) {
      return NextResponse.json({ success: false, error: "Barangay is required for Barangay Official accounts." }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("app_users")
      .update(payload)
      .eq("id", id)
      .select("id,first_name,last_name,email,mobile_number,address,profile_image,created_at,updated_at,barangay,sex,role_id,barangay_id,status,failed_login_attempts,locked_until,last_login_at")
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: sanitizeAppUser(data) });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
