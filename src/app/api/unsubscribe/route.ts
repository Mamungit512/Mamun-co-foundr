import { NextRequest, NextResponse } from "next/server";
import { readUnsubscribeParams, unsubscribeEmail } from "@/lib/email/unsubscribe";

/**
 * RFC 8058 one-click unsubscribe. Mail apps (Gmail, Apple Mail, Outlook) POST
 * here when someone taps their built-in Unsubscribe button; the address and
 * its signature come from the List-Unsubscribe header's URL.
 *
 * Only POST unsubscribes (mail apps, and the /unsubscribe page from the
 * browser). A GET (e.g. a link scanner) is sent to the /unsubscribe page
 * instead, so prefetching a link never opts anyone out.
 */
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = readUnsubscribeParams(searchParams.get("e"), searchParams.get("t"));
  if (!email) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }
  const ok = await unsubscribeEmail(email);
  return ok
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Could not unsubscribe" }, { status: 500 });
}

export function GET(req: NextRequest) {
  const url = new URL("/unsubscribe", req.nextUrl.origin);
  url.search = req.nextUrl.search;
  return NextResponse.redirect(url);
}
