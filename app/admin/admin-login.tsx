"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not sign in.");
        setBusy(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
      setBusy(false);
    }
  }

  return (
    <main className="adminLogin">
      <form method="post" onSubmit={submit}>
        <h1>Portfolio CMS</h1>

        <p>Sign in to edit case studies.</p>

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            disabled={!hydrated || busy}
            required
          />
        </label>

        <button type="submit" disabled={!hydrated || busy}>
          {!hydrated
            ? "Loading…"
            : busy
              ? "Signing in…"
              : "Sign in"}
        </button>

        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}