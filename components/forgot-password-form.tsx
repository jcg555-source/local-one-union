"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logDevelopmentError } from "@/lib/user-facing-errors";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setMessage("Password recovery is temporarily unavailable.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setStatus(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo
    });

    if (error) {
      logDevelopmentError("Password reset request", error, { email: trimmedEmail });
      setStatus("error");
      setMessage("We could not send the password reset email right now.");
      setSubmitting(false);
      return;
    }

    const confirmationResponse = await fetch("/api/password-reset-confirmation-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: trimmedEmail
      })
    });

    if (!confirmationResponse.ok) {
      logDevelopmentError("Password reset confirmation email", null, {
        email: trimmedEmail
      });
    }

    setStatus("success");
    setMessage("If an account exists for that email, a password reset link has been sent.");
    setSubmitting(false);
  }

  return (
    <div className="card-panel p-8">
      <h1 className="text-3xl font-semibold text-union-navy">Forgot Password</h1>
      <p className="mt-3 text-sm leading-7 text-union-steel">
        Enter your email address and Local One will send a secure password reset link.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            placeholder="you@example.com"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {submitting ? "Sending Reset Link..." : "Send Reset Link"}
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
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-union-navy">
          Go back to login
        </Link>
        .
      </p>
    </div>
  );
}
