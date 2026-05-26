"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export function HomePortalCallout() {
  const { session } = useAuth();
  const isApprovedAdmin =
    session.role === "admin" && session.status === "approved";
  const isApprovedMember =
    session.role === "member" && session.status === "approved";

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
      <div className="card-panel overflow-hidden p-0">
        <div className="security-panel p-8 text-white lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
            Member Portal
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Approval-based access keeps internal resources protected.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            Approved members can access private documents, internal
            announcements, and profile settings. New registrations begin in a
            pending state until they are reviewed by an administrator.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={isApprovedMember || isApprovedAdmin ? "/portal" : "/login"}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-union-navy"
            >
              {isApprovedMember || isApprovedAdmin ? "Member Portal" : "Member Login"}
            </Link>
            {isApprovedAdmin ? (
              <Link
                href="/admin"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white"
              >
                Admin Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "Private internal resources",
          "Members-only announcements",
          "Secure document library",
          "Profile settings"
        ].map((item, index) => (
          <div key={item} className="card-panel gold-ring p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-union-gold">
              0{index + 1}
            </p>
            <p className="mt-4 text-lg font-semibold text-union-navy">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
