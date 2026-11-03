"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ContributorLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [action, setAction] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(params.get("error") ? "Confirmation failed. Please sign in or try again." : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          username: data.get("username"),
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      if (result.confirmationRequired) {
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        router.push("/library");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="form-panel login-panel">
    <div className="auth-choice" role="group" aria-label="Account action">
      <button type="button" className={action === "login" ? "active" : ""} onClick={() => { setAction("login"); setMessage(""); }}>Sign in</button>
      <button type="button" className={action === "signup" ? "active" : ""} onClick={() => { setAction("signup"); setMessage(""); }}>Create account</button>
    </div>
    <form className="auth-form" onSubmit={submit}>
      {action === "signup" && <label>Username
        <input name="username" minLength={3} maxLength={30} pattern="[A-Za-z][A-Za-z0-9_ ]{2,29}" autoComplete="username" required placeholder="How people will know you" />
        <small>3–30 characters. Start with a letter.</small>
      </label>}
      <label>Email <input name="email" type="email" autoComplete="email" required /></label>
      <label>Password <input name="password" type="password" minLength={8} autoComplete={action === "signup" ? "new-password" : "current-password"} required /></label>
      {message && <p className="form-error" role="status">{message}</p>}
      <button className="button button-primary" disabled={busy} type="submit">{busy ? "Please wait…" : action === "login" ? "Sign in" : "Create account"}</button>
    </form>
  </div>;
}
