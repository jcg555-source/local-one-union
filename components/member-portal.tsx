"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type MemberResource = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  file_url: string | null;
  is_active: boolean | null;
};

type ResourceWithAccessUrl = MemberResource & {
  accessUrl: string | null;
};

const memberResourcesStorageBucket = "member-resources";

function isExternalUrl(value: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function MemberPortal() {
  const { session, signOut } = useAuth();
  const [resources, setResources] = useState<ResourceWithAccessUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLoadResources =
    session.status === "approved" &&
    (session.role === "member" || session.role === "admin");

  useEffect(() => {
    if (!canLoadResources) {
      return;
    }

    let active = true;

    async function loadResources() {
      if (!supabase) {
        if (active) {
          setError(
            getFriendlySupabaseMessage({
              action: "load member resources",
              audience: "member"
            })
          );
          setLoading(false);
        }
        return;
      }

      const supabaseClient = supabase;

      setLoading(true);
      setError(null);

      const { data, error: resourceError } = await supabaseClient
        .from("member_resources")
        .select("id, title, description, category, file_url, is_active")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("title", { ascending: true });

      if (!active) {
        return;
      }

      if (resourceError) {
        logDevelopmentError("Member resources load", resourceError);
        setError(
          getFriendlySupabaseMessage({
            action: "load member resources",
            audience: "member"
          })
        );
        setLoading(false);
        return;
      }

      const rows = ((data as MemberResource[] | null) ?? []);
      const resolvedResources = await Promise.all(
        rows.map(async (resource) => {
          if (!resource.file_url) {
            return { ...resource, accessUrl: null };
          }

          if (isExternalUrl(resource.file_url)) {
            return { ...resource, accessUrl: resource.file_url };
          }

          const { data: signedData, error: signedError } = await supabaseClient.storage
            .from(memberResourcesStorageBucket)
            .createSignedUrl(resource.file_url, 60 * 60);

          if (signedError) {
            return { ...resource, accessUrl: null };
          }

          return { ...resource, accessUrl: signedData.signedUrl };
        })
      );

      if (!active) {
        return;
      }

      setResources(resolvedResources);
      setLoading(false);
    }

    void loadResources();

    return () => {
      active = false;
    };
  }, [canLoadResources]);

  if (session.role === "guest") {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">Member Portal</h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          This area is reserved for approved members. Please log in to access
          internal resources, private documents, member announcements, and
          profile settings.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
        >
          Go To Login
        </Link>
      </div>
    );
  }

  if (session.status === "pending") {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">
          Approval Pending
        </h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Hi {session.name}. Your account is waiting for admin approval. Once it
          is approved, this portal will unlock internal resources and private
          member updates for {session.site}.
        </p>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="mt-6 rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (session.status === "denied") {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">
          Access Denied
        </h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Your account was denied.{" "}
          <a
            href="mailto:info@localoneunion.org"
            className="font-semibold text-union-navy underline decoration-union-gold/60 underline-offset-4 transition hover:text-union-gold hover:decoration-union-gold"
          >
            Please contact Local One.
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="mt-6 rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (session.status === "inactive") {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">
          Account Inactive
        </h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Your account is inactive.{" "}
          <a
            href="mailto:info@localoneunion.org"
            className="font-semibold text-union-navy underline decoration-union-gold/60 underline-offset-4 transition hover:text-union-gold hover:decoration-union-gold"
          >
            Please contact Local One.
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="mt-6 rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card-panel p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
              Approved Member Access
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-union-navy">
              Welcome, {session.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-union-steel">
              This portal is for internal resources, private documents, member
              announcements, and profile settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
          >
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          Loading member resources...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!loading && !error && resources.length === 0 ? (
        <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
          No active member resources are available right now.
        </p>
      ) : null}

      {!loading && !error && resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <div key={resource.id} className="card-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
                {resource.category || "Member Resource"}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-union-navy">
                {resource.title || "Untitled Resource"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-union-steel">
                {resource.description || "No description provided."}
              </p>
              {resource.accessUrl ? (
                <a
                  href={resource.accessUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173a5b]"
                >
                  Open Resource
                </a>
              ) : (
                <p className="mt-6 text-sm font-medium text-union-steel">
                  File access is currently unavailable for this resource.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
