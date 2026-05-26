"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuditLogRow } from "@/lib/audit";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

function formatAuditDate(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getAdminDisplayName(log: AuditLogRow) {
  const fullName = [log.first_name, log.last_name].filter(Boolean).join(" ").trim();
  return fullName || log.admin_email || "Unknown admin";
}

function formatDetails(details: Record<string, unknown> | null) {
  if (!details) {
    return "No extra details recorded.";
  }

  const entries = Object.entries(details).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return "No extra details recorded.";
  }

  return entries
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" • ");
}

export function AdminAuditLogs() {
  const { session } = useAuth();
  const isApprovedAdmin = session.role === "admin" && session.status === "approved";
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminFilter, setAdminFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");

  useEffect(() => {
    if (!isApprovedAdmin) {
      return;
    }

    let active = true;

    async function loadAuditLogs() {
      if (!supabase) {
        if (active) {
          setError(
            getFriendlySupabaseMessage({
              action: "load audit logs",
              audience: "admin"
            })
          );
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          "id, admin_id, admin_email, first_name, last_name, action, target_type, target_id, details, created_at"
        )
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (error) {
        logDevelopmentError("Audit logs load", error);
        setError(
          getFriendlySupabaseMessage({
            action: "load audit logs",
            audience: "admin"
          })
        );
        setLoading(false);
        return;
      }

      setLogs((data as AuditLogRow[] | null) ?? []);
      setLoading(false);
    }

    void loadAuditLogs();

    return () => {
      active = false;
    };
  }, [isApprovedAdmin]);

  const actionOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort(),
    [logs]
  );

  const targetTypeOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((log) => log.target_type).filter(Boolean))).sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const adminDisplayName = getAdminDisplayName(log).toLowerCase();
      const adminEmail = (log.admin_email ?? "").toLowerCase();
      const matchesAdmin = adminFilter
        ? adminDisplayName.includes(adminFilter.toLowerCase()) ||
          adminEmail.includes(adminFilter.toLowerCase())
        : true;
      const matchesAction = actionFilter ? log.action === actionFilter : true;
      const matchesTargetType = targetTypeFilter
        ? log.target_type === targetTypeFilter
        : true;

      return matchesAdmin && matchesAction && matchesTargetType;
    });
  }, [actionFilter, adminFilter, logs, targetTypeFilter]);

  if (!isApprovedAdmin) {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">Admin Audit Logs</h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Approved admin access is required to view audit log history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card-panel p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
              Admin Audit Logs
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-union-navy">
              Track admin changes across Local One
            </h1>
            <p className="mt-3 text-sm leading-7 text-union-steel">
              Review status changes, role changes, uploads, edits, and content management activity.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
          >
            Back To Admin Dashboard
          </Link>
        </div>
      </div>

      <div className="card-panel p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-union-navy">
              Filter by admin
            </span>
            <input
              type="text"
              value={adminFilter}
              onChange={(event) => setAdminFilter(event.target.value)}
              placeholder="Name or admin@localoneunion.org"
              className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-union-navy">
              Filter by action
            </span>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            >
              <option value="">All actions</option>
              {actionOptions.map((action) => (
                <option key={action} value={action ?? ""}>
                  {action}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-union-navy">
              Filter by target type
            </span>
            <select
              value={targetTypeFilter}
              onChange={(event) => setTargetTypeFilter(event.target.value)}
              className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            >
              <option value="">All target types</option>
              {targetTypeOptions.map((targetType) => (
                <option key={targetType} value={targetType ?? ""}>
                  {targetType}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          Loading audit logs...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!loading && !error && filteredLogs.length === 0 ? (
        <p className="rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          No audit logs matched your current filters.
        </p>
      ) : null}

      {!loading && !error && filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <article
              key={log.id}
              className="card-panel border border-union-slate/70 p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-union-navy">
                    {log.action ?? "unknown_action"}
                  </p>
                  <p className="text-sm text-union-steel">
                    Admin: {getAdminDisplayName(log)}
                  </p>
                  <p className="text-sm text-union-steel">
                    Email: {log.admin_email ?? "No email recorded"}
                  </p>
                  <p className="text-sm text-union-steel">
                    Target: {log.target_type ?? "unknown"}{" "}
                    {log.target_id ? `• ${log.target_id}` : ""}
                  </p>
                  <p className="text-sm leading-7 text-union-steel">
                    {formatDetails(log.details)}
                  </p>
                </div>
                <p className="text-sm font-medium text-union-steel">
                  {formatAuditDate(log.created_at)}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
