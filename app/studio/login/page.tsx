"use client";
import { useState } from "react";

export default function OwnerLoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      window.location.href = "/studio";
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Sign-in is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main">
      <section className="section utility-section">
        <div className="container narrow">
          <span className="eyebrow">OWNER ACCESS</span>
          <h1>Sign in to the enquiry inbox.</h1>
          <p>
            This workspace is available to the site owner only. Enter the owner
            password to continue.
          </p>
          <form className="inline-form" onSubmit={submit}>
            <label>
              Owner password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={200}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p>
            <a href="/">Back to the website</a>
          </p>
        </div>
      </section>
    </main>
  );
}
