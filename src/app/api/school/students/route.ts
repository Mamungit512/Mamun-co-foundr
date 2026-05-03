import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const { sessionClaims } = await auth();

  const orgId = sessionClaims?.metadata?.organization_id;
  const isSchoolAdmin = sessionClaims?.metadata?.is_school_admin;

  if (!orgId || !isSchoolAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: students, error } = await supabase
    .from("profiles")
    .select(
      "user_id, first_name, last_name, title, education, city, country, is_technical, created_at, deleted_at",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }

  return NextResponse.json({ students: students ?? [] });
}
