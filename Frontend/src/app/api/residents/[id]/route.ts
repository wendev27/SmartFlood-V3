import { NextRequest, NextResponse } from "next/server";
import { pickResidentPayload } from "@/lib/residentPayload";
import { supabaseServer } from "@/lib/supabaseServer";

const allowedPatchFields = new Set([
  "last_name",
  "first_name",
  "middle_name",
  "suffix",
  "age",
  "sex",
  "contact_number",
  "complete_address",
  "street",
  "barangay_id",
  "barangay_name",
  "is_family_head",
  "family_id",
  "status",
]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const allowedBody = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedPatchFields.has(key)),
    );
    const payload = pickResidentPayload(allowedBody);

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: false, error: "No allowed fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("residents_v3")
      .update(payload)
      .eq("resident_id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await supabaseServer
      .from("residents_v3")
      .update({ status: "inactive" })
      .eq("resident_id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
