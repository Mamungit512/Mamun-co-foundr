import type { NextRequest } from "next/server";
import { handleRespond } from "@/features/meetups/server/respond";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRespond(params, "declined");
}
