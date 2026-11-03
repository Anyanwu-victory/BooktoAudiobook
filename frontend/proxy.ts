import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, {
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        }));
      },
    },
  });
  await client.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/library/:path*", "/submit/:path*", "/books/:path*", "/api/books/:path*", "/api/submissions/:path*"],
};
