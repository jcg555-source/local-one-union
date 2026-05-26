"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logDevelopmentError } from "@/lib/user-facing-errors";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const isSupabaseAvailable = Boolean(supabase);

  useEffect(() => {
    const supabaseClient = supabase!;

    if (!isSupabaseAvailable || !supabaseClient) {
      return;
    }

    async function loadSession() {
      const {
        data: { session }
      } = await supabaseClient.auth.getSession();

      if (session) {
        setReady(true);
        return;
      }

      setStatus("error");
      setMessage("Your password reset link is invalid or has expired. Please request a new one.");
    }

    void loadSession();
  }, [isSupabaseAvailable]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseAvailable || !supabase) {
      setStatus("error");
      setMessage("Password reset is temporarily unavailable.");
      return;
    }

    if (!password || !confirmPassword) {
      setStatus("error");
      setMessage("Please complete both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters for your new password.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setStatus(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      logDevelopmentError("Password reset update", error);
      setStatus("error");
      setMessage("We could not update your password right now.");
      setSubmitting(false);
      return;
    }

    setStatus("success");
    setMessage("Your password has been updated. Redirecting you to login...");
    setSubmitting(false);

    window.setTimeout(() => {
      router.push("/login");
    }, 1400);
  }

  return (
    <div className="card-panel p-8">
      <h1 className="text-3xl font-semibold text-union-navy">Reset Password</h1>
      <p className="mt-3 text-sm leading-7 text-union-steel">
        Choose a new password for your Local One account.
      </p>

      {!isSupabaseAvailable ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Password reset is temporarily unavailable.
        </p>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            New password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            placeholder="Enter a new password"
            required
            disabled={!isSupabaseAvailable || !ready || submitting}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Confirm new password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            placeholder="Re-enter your new password"
            required
            disabled={!isSupabaseAvailable || !ready || submitting}
          />
        </label>

        <button
          type="submit"
          disabled={!isSupabaseAvailable || !ready || submitting}
          className="w-full rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {submitting ? "Updating Password..." : "Update Password"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            status === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "bg-union-mist text-union-navy"
          }`}
        >
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-union-steel">
        Need a fresh link?{" "}
        <Link href="/forgot-password" className="font-semibold text-union-navy">
          Request another reset email
        </Link>
        .
      </p>
    </div>
  );
}
