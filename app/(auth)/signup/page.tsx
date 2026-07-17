"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const RESERVED = ["admin", "api", "dashboard", "login", "signup", "static", "www", "app", "store", "settings", "billing"];

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return slug || "your-store";
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(storeName);
  const isReserved = RESERVED.includes(slug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isReserved) {
      setError("That store name is reserved — please choose another.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          store_name: storeName,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // The DB trigger creates the store row automatically.
    // Phase 1: send them to payment instructions, not straight to the dashboard.
    router.push("/signup/payment-instructions");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-white border border-[#e9e5d9] rounded-2xl p-8">
        <h1 className="font-display text-2xl font-black text-ink mb-1">Create your store</h1>
        <p className="text-sm text-[#7d7a70] mb-6">
          Takes about 2 minutes. Your store goes live once payment is verified.
        </p>

        {error && (
          <div className="mb-4 text-sm bg-[#f6e2e2] text-[#c14545] rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Your name</label>
            <input
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Store name</label>
            <input
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Nishaan"
              required
            />
            <p className={`text-xs mt-1.5 ${isReserved ? "text-[#c14545]" : "text-[#7d7a70]"}`}>
              {isReserved
                ? `"${slug}" is reserved — please choose a different name.`
                : <>Your store will be live at yoursaas.com/<b className="text-primary">{slug}</b></>}
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-[#555] block mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-[#e3e0d6] rounded-lg text-sm bg-[#fbfaf7]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || isReserved}
            className="w-full bg-primary text-white font-bold text-sm rounded-lg py-3 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating your store…" : "Continue to payment"}
          </button>
        </form>

        <p className="text-center text-xs text-[#7d7a70] mt-4">
          Already have a store?{" "}
          <a href="/login" className="text-primary font-bold">Log in</a>
        </p>
      </div>
    </div>
  );
}
