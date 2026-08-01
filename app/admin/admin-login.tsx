"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Could not sign in."); setBusy(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return <main className="adminLogin"><form onSubmit={submit}><h1>Portfolio CMS</h1><p>Sign in to edit case studies.</p><label>Password<input name="password" type="password" autoFocus required /></label><button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{error && <p role="alert">{error}</p>}</form></main>;
}
