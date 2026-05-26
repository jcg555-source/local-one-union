"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setSubmitting(true);
    const result = await signIn(email, password);
    setMessage(result.message);
    setSubmitting(false);

    if (result.ok) {
      router.push("/portal");
    }
  }

  return (
    <div className="card-panel p-8">
      <h1 className="text-3xl font-semibold text-union-navy">Member Login</h1>
      <p className="mt-3 text-sm leading-7 text-union-steel">
        Member portal access requires login and admin approval. Demo accounts
        are included for admin, approved member, and pending member states.
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Email
          </span>
          <input
            name="email"
            type="email"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            placeholder="member@localoneunion.org"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Password
          </span>
          <input
            name="password"
            type="password"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            placeholder="Enter your password"
            required
          />
        </label>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-union-navy transition hover:text-union-gold"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
        >
          {submitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-navy">
          {message}
        </p>
      ) : null}

      <div className="mt-8 rounded-3xl border border-union-slate/70 bg-union-mist p-5 text-sm text-union-steel">
        <p className="font-semibold text-union-navy">Demo access</p>
        <p className="mt-2">Admin: admin@localoneunion.org / Admin123!</p>
        <p>Approved member: member@localoneunion.org / Member123!</p>
        <p>Pending member: pending@localoneunion.org / Pending123!</p>
      </div>

      <p className="mt-6 text-sm text-union-steel">
        Need an account?{" "}
        <Link href="/sign-up" className="font-semibold text-union-navy">
          Create one here
        </Link>
        .
      </p>
    </div>
  );
}
