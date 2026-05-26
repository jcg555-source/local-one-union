"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

export function OrganizeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedDescription = siteDescription.trim();

    if (!trimmedName || !trimmedEmail || !trimmedDescription) {
      setStatusType("error");
      setStatusMessage("Please complete all fields before submitting.");
      return;
    }

    if (!supabase) {
      setStatusType("error");
      setStatusMessage("Organizing inquiries are temporarily unavailable.");
      return;
    }

    setSubmitting(true);
    setStatusType(null);
    setStatusMessage(null);

    const { error } = await supabase.from("organizing_inquiries").insert({
      name: trimmedName,
      email: trimmedEmail,
      site_description: trimmedDescription
    });

    if (error) {
      logDevelopmentError("Organizing inquiry", error, {
        email: trimmedEmail
      });
      setStatusType("error");
      setStatusMessage(
        getFriendlySupabaseMessage({
          action: "save your organizing inquiry"
        })
      );
      setSubmitting(false);
      return;
    }

    const emailResponse = await fetch("/api/organizing-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        siteDescription: trimmedDescription
      })
    });

    if (!emailResponse.ok) {
      const emailPayload = (await emailResponse.json()) as { error?: string };
      setStatusType("error");
      setStatusMessage(
        emailPayload.error ||
          "Your inquiry was saved, but we could not send the email notification."
      );
      setName("");
      setEmail("");
      setSiteDescription("");
      setSubmitting(false);
      return;
    }

    setStatusType("success");
    setStatusMessage("Your organizing inquiry has been sent to Local One.");
    setName("");
    setEmail("");
    setSiteDescription("");
    setSubmitting(false);
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-union-navy">
          Name
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-union-navy">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
          required
        />
      </label>

      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-medium text-union-navy">
          Describe your site
        </span>
        <textarea
          rows={7}
          value={siteDescription}
          onChange={(event) => setSiteDescription(event.target.value)}
          placeholder="Describe your site, field, interests, estimated amount of workers, etc."
          className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
          required
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-union-gold px-5 py-3 text-sm font-semibold text-union-navy transition hover:translate-y-[-1px] md:col-span-2 md:w-fit disabled:opacity-70"
      >
        {submitting ? "Submitting..." : "Contact Local One About Organizing"}
      </button>

      {statusMessage ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm md:col-span-2 ${
            statusType === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "bg-union-mist text-union-navy"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
