"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

export function NotifyForm({
  siteId,
  siteName
}: {
  siteId: string | null;
  siteName: string;
}) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatusType("error");
      setStatusMessage("Please enter your email address.");
      return;
    }

    if (!supabase) {
      setStatusType("error");
      setStatusMessage("Hiring alerts are temporarily unavailable.");
      return;
    }

    if (!siteId) {
      setStatusType("error");
      setStatusMessage(
        "This site is missing its live record id, so hiring alerts are temporarily unavailable."
      );
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    const { error } = await supabase
      .from("hiring_alert_signups")
      .insert({
        site_id: siteId,
        email: trimmedEmail
      });

    if (error) {
      logDevelopmentError("Hiring alert signup", error, {
        siteId,
        email: trimmedEmail
      });
      setStatusType("error");
      setStatusMessage(
        getFriendlySupabaseMessage({
          action: "save your hiring alert signup"
        })
      );
      setSubmitting(false);
      return;
    }

    const emailResponse = await fetch("/api/hiring-alert-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: trimmedEmail,
        siteName
      })
    });

    if (!emailResponse.ok) {
      const emailPayload = (await emailResponse.json()) as { error?: string };
      setStatusType("error");
      setStatusMessage(
        emailPayload.error ||
          "Your signup was saved, but we could not send the confirmation email."
      );
      setEmail("");
      setSubmitting(false);
      return;
    }

    setStatusType("success");
    setStatusMessage(`You are signed up for ${siteName} hiring alerts.`);
    setEmail("");
    setSubmitting(false);
  }

  return (
    <div className="card-panel p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
        Hiring Alerts
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-union-navy">
        Notify me when this employer is hiring
      </h3>
      <p className="mt-3 text-sm leading-7 text-union-steel">
        Enter your email to receive openings and hiring notices connected to{" "}
        {siteName}.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Email address
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm text-union-navy outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-union-gold px-5 py-3 text-sm font-semibold text-union-navy transition hover:scale-[1.02]"
        >
          {submitting ? "Submitting..." : "Request Hiring Alerts"}
        </button>
      </form>
      {statusMessage ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            statusType === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "bg-union-mist text-union-navy"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
