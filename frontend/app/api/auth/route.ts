import { contributorClient } from "@/lib/contributor-auth";
import { sameOrigin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const { action, email, password, username } = await request.json();
  if (!["login", "signup"].includes(action) || typeof email !== "string" || typeof password !== "string" ||
      email.length > 254 || password.length < 8 || password.length > 128) {
    return Response.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  const client = await contributorClient();
  if (action === "signup") {
    const cleanUsername = typeof username === "string" ? username.trim() : "";
    if (!/^[A-Za-z][A-Za-z0-9_ ]{2,29}$/.test(cleanUsername)) {
      return Response.json({ error: "Username must be 3 to 30 characters and start with a letter." }, { status: 400 });
    }
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        data: { username: cleanUsername },
      },
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true, confirmationRequired: !data.session });
  }
  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return Response.json({ error: "Incorrect email or password, or email not confirmed." }, { status: 401 });
  return Response.json({ ok: true, confirmationRequired: false });
}
