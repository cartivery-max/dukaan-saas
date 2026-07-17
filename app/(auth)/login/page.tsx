"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-white border border-[#e9e5d9] rounded-2xl p-8">
        <h1 className="font-display text-2xl font-black text-ink mb-1">Log in</h1>
        <p className="text-sm text-[#7d7a70] mb-6">
          Welcome back — manage your store from your dashboard.
        </p>

        {error && (
          <div className="mb-4 text-sm bg-[#f6e2e2] text-[#c14545] rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold text-sm rounded-lg py-3 mt-2 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#7d7a70] mt-4">
          Don&apos;t have a store yet?{" "}
          <a href="/signup" className="text-primary font-bold">Create one</a>
        </p>
      </div>
    </div>
  );
}
