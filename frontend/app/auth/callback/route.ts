import { NextResponse } from "next/server";
import { contributorClient } from "@/lib/contributor-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=confirmation", url.origin));
  const { error } = await (await contributorClient()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(error ? "/login?error=confirmation" : "/library", url.origin));
}
