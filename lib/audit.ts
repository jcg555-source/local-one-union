import { supabase } from "@/lib/supabase";
import { logDevelopmentError } from "@/lib/user-facing-errors";

export type AuditLogEntry = {
  admin_id: string;
  admin_email: string;
  first_name?: string | null;
  last_name?: string | null;
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, unknown> | null;
};

export type AuditLogRow = {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  first_name: string | null;
  last_name: string | null;
  action: string | null;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string | null;
};

export async function createAuditLog(entry: AuditLogEntry) {
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("audit_logs").insert({
    admin_id: entry.admin_id,
    admin_email: entry.admin_email,
    first_name: entry.first_name ?? null,
    last_name: entry.last_name ?? null,
    action: entry.action,
    target_type: entry.target_type,
    target_id: entry.target_id ?? null,
    details: entry.details ?? null
  });

  if (error) {
    logDevelopmentError("Audit log insert", error, entry);
    return false;
  }

  return true;
}
