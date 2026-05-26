const isDevelopment = process.env.NODE_ENV !== "production";

export function logDevelopmentError(scope: string, error: unknown, details?: unknown) {
  if (!isDevelopment) {
    return;
  }

  console.error(`[${scope}]`, error, details);
}

export function getFriendlySupabaseMessage(options?: {
  action?: string;
  audience?: "public" | "member" | "admin";
}) {
  const action = options?.action ?? "complete this request";
  const audience = options?.audience ?? "public";

  if (audience === "admin") {
    return `We could not ${action} right now. Please try again in a moment or check your Supabase permissions.`;
  }

  if (audience === "member") {
    return `We could not ${action} right now. Please try again in a moment.`;
  }

  return `We could not ${action} right now. Please try again later.`;
}
