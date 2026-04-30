"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Login failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm glass-strong rounded-2xl p-8 space-y-4"
    >
      <div>
        <div className="font-display text-2xl font-bold text-white">Admin login</div>
        <p className="text-sm text-brand-200/70 mt-1">
          Only the boss has the password.
        </p>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-[0.2em] text-brand-200/70">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1 w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-brand-400 outline-none text-white"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="text-sm text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 transition text-ink font-bold uppercase tracking-widest text-sm"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
