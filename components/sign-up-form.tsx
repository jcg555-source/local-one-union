"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { sites } from "@/lib/data";

export function SignUpForm() {
  const { registerMember } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="card-panel p-8">
      <h1 className="text-3xl font-semibold text-union-navy">
        Sign Up For Member Access
      </h1>
      <p className="mt-3 text-sm leading-7 text-union-steel">
        New accounts start as pending approval and become active after an admin
        reviews the request.
      </p>
      <form
        className="mt-8 grid gap-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");

          if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
          }

          setSubmitting(true);
          const result = await registerMember({
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            site: String(formData.get("site") ?? ""),
            password
          });

          if (result.ok) {
            form.reset();
          }

          setMessage(result.message);
          setSubmitting(false);
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            First name
          </span>
          <input
            name="firstName"
            type="text"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Last name
          </span>
          <input
            name="lastName"
            type="text"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Email
          </span>
          <input
            name="email"
            type="email"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Phone number
          </span>
          <input
            name="phone"
            type="tel"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Affiliated site
          </span>
          <select
            name="site"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select your worksite
            </option>
            {sites.map((site) => (
              <option key={site.slug} value={site.name}>
                {site.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Password
          </span>
          <input
            name="password"
            type="password"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-union-navy">
            Confirm password
          </span>
          <input
            name="confirmPassword"
            type="password"
            className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-full bg-union-gold px-5 py-3 text-sm font-semibold text-union-navy"
        >
          {submitting ? "Submitting..." : "Submit For Approval"}
        </button>
      </form>
      {message ? (
        <p className="mt-5 rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-navy">
          {message}
        </p>
      ) : null}
    </div>
  );
}
