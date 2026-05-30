import { NextRequest, NextResponse } from "next/server";
import { fullName, familyVulnerabilityPayload, pickResidentPayload } from "@/lib/residentPayload";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer.from('residents_v3').select('*');
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.last_name || !body.first_name || !body.barangay_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (body.is_family_head) {
      const { data: resident, error: residentError } = await supabaseServer
        .from("residents_v3")
        .insert([{ ...pickResidentPayload(body, null), status: body.status ?? "active" }])
        .select()
        .single();

      if (residentError) return NextResponse.json({ success: false, error: residentError.message }, { status: 500 });

      const family_name = `${body.last_name} Family`;
      const { data: family, error: familyError } = await supabaseServer
        .from("families")
        .insert([{
          family_name,
          barangay_id: body.barangay_id,
          barangay_name: body.barangay_name,
          complete_address: body.complete_address,
          street: body.street,
          created_by: body.created_by ?? null,
          ...familyVulnerabilityPayload(body),
        }])
        .select()
        .single();

      if (familyError) return NextResponse.json({ success: false, error: familyError.message }, { status: 500 });

      const familyHeadName = fullName(body);
      const { error: familyUpdateError } = await supabaseServer
        .from("families")
        .update({ family_head_id: resident.id, family_head_name: familyHeadName })
        .eq("id", family.id);

      if (familyUpdateError) return NextResponse.json({ success: false, error: familyUpdateError.message }, { status: 500 });

      const { error: residentUpdateError } = await supabaseServer
        .from("residents_v3")
        .update({ family_id: family.id })
        .eq("id", resident.id);

      if (residentUpdateError) return NextResponse.json({ success: false, error: residentUpdateError.message }, { status: 500 });

      return NextResponse.json({ success: true, data: { resident: { ...resident, family_id: family.id }, family } }, { status: 201 });
    }

    const familyId = body.selected_family_id ?? body.family_id;

    if (!familyId) {
      return NextResponse.json({ success: false, error: "selected_family_id or family_id is required for non-family-head" }, { status: 400 });
    }

    const { data: resident, error: residentError } = await supabaseServer
      .from("residents_v3")
      .insert([{ ...pickResidentPayload(body, familyId), status: body.status ?? "active" }])
      .select()
      .single();

    if (residentError) return NextResponse.json({ success: false, error: residentError.message }, { status: 500 });

    return NextResponse.json({ success: true, data: { resident } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
