"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const password = new FormData(event.currentTarget).get("password");
    try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not sign in."); router.push("/admin"); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not sign in."); }
    finally { setBusy(false); }
  }
  return <form className="form-panel login-panel" onSubmit={submit}><label>Admin password <input type="password" name="password" autoComplete="current-password" required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>;
}
