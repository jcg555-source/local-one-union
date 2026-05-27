"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import {
  AuthResult,
  demoAccounts,
  PendingMember,
  pendingMembersStorageKey,
  RegistrationInput,
  sessionStorageKey,
  SessionState
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type AuthContextValue = {
  session: SessionState;
  pendingMembers: PendingMember[];
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  registerMember: (member: RegistrationInput) => Promise<AuthResult>;
  updateMemberStatus: (
    id: string,
    status: "approved" | "denied" | "inactive"
  ) => Promise<void>;
};

const defaultSession: SessionState = { role: "guest", status: "logged_out" };

const AuthContext = createContext<AuthContextValue | null>(null);

type SupabaseProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  affiliated_site: string | null;
  status: "pending" | "approved" | "denied" | "inactive" | null;
  role: "member" | "admin" | null;
};

type ResolvedProfileSession = {
  profile: SupabaseProfileRow | null;
  session: SessionState;
  errorMessage?: string;
};

function mapProfileToPendingMember(profile: SupabaseProfileRow): PendingMember {
  return {
    id: profile.id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    site: profile.affiliated_site ?? "",
    status: profile.status ?? "pending",
    role: profile.role ?? "member"
  };
}

function logAuthDebug(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Local One Auth] ${message}`, details);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(defaultSession);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);

  function persistSession(nextSession: SessionState) {
    setSession(nextSession);
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
  }

  function persistPending(nextMembers: PendingMember[]) {
    setPendingMembers(nextMembers);
    window.localStorage.setItem(
      pendingMembersStorageKey,
      JSON.stringify(nextMembers)
    );
  }

  const loadPendingMembersFromSupabase = useCallback(async () => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, affiliated_site, status, role")
      .eq("status", "pending")
      .order("last_name", { ascending: true });

    if (error || !data) {
      return null;
    }

    const nextMembers = (data as SupabaseProfileRow[]).map(mapProfileToPendingMember);
    persistPending(nextMembers);
    return nextMembers;
  }, []);

  const hydrateSessionFromSupabase = useCallback(async (
    userId: string,
    email?: string | null
  ): Promise<ResolvedProfileSession> => {
    if (!supabase) {
      return {
        profile: null,
        session: defaultSession
      };
    }

    logAuthDebug("hydrate session requested", {
      authUserId: userId,
      authEmail: email ?? null
    });

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, affiliated_site, status, role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      logAuthDebug("profile fetch error", {
        authUserId: userId,
        authEmail: email ?? null,
        error
      });
      logDevelopmentError("Local One Auth profile fetch", error, { userId });
      persistSession(defaultSession);
      return {
        profile: null,
        session: defaultSession,
        errorMessage: getFriendlySupabaseMessage({
          action: "load your member profile",
          audience: "member"
        })
      };
    }

    if (!data) {
      logAuthDebug("profile fetch returned no row", {
        authUserId: userId,
        authEmail: email ?? null
      });
      const noProfileMessage =
        "No profile row was found for this authenticated user id. Check the profiles insert flow.";

      persistSession(defaultSession);
      return {
        profile: null,
        session: defaultSession,
        errorMessage: noProfileMessage
      };
    }

    const profile = data as SupabaseProfileRow;
    logAuthDebug("profile fetch succeeded", {
      authUserId: userId,
      profile
    });
    const role = profile.role === "admin" ? "admin" : "member";
    const nextSession: SessionState = {
      id: profile.id,
      role,
      status:
        profile.status === "approved"
          ? "approved"
          : profile.status === "denied"
            ? "denied"
            : profile.status === "inactive"
              ? "inactive"
            : "pending",
      name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || undefined,
      firstName: profile.first_name ?? undefined,
      lastName: profile.last_name ?? undefined,
      site: profile.affiliated_site ?? undefined,
      email: profile.email ?? email ?? undefined
    };

    persistSession(nextSession);

    if (role === "admin") {
      await loadPendingMembersFromSupabase();
    }

    return {
      profile,
      session: nextSession
    };
  }, [loadPendingMembersFromSupabase]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const storedPending = window.localStorage.getItem(pendingMembersStorageKey);

      if (!supabase) {
        const storedSession = window.localStorage.getItem(sessionStorageKey);
        if (storedSession && mounted) {
          setSession(JSON.parse(storedSession) as SessionState);
        }
      } else if (mounted) {
        setSession(defaultSession);
        window.localStorage.setItem(sessionStorageKey, JSON.stringify(defaultSession));
      }

      if (storedPending && mounted) {
        setPendingMembers(JSON.parse(storedPending) as PendingMember[]);
      } else if (!supabase) {
        window.localStorage.setItem(pendingMembersStorageKey, JSON.stringify([]));
      }

      if (!supabase) {
        return;
      }

      const {
        data: { session: activeSession }
      } = await supabase.auth.getSession();

      if (activeSession?.user && mounted) {
        await hydrateSessionFromSupabase(activeSession.user.id, activeSession.user.email);
      }

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) {
          return;
        }

        if (!nextSession?.user) {
          persistSession(defaultSession);
          return;
        }

        void hydrateSessionFromSupabase(
          nextSession.user.id,
          nextSession.user.email
        );
      });

      return () => subscription.unsubscribe();
    }

    let unsubscribe: (() => void) | undefined;
    void initializeAuth().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [hydrateSessionFromSupabase]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      logAuthDebug("sign in response", {
        requestedEmail: normalizedEmail,
        authUserId: data.user?.id ?? null,
        authUserEmail: data.user?.email ?? null,
        authError: error ?? null
      });

      if (error || !data.user) {
        logDevelopmentError("Local One sign in", error, { email: normalizedEmail });
        return {
          ok: false,
          message: "Invalid email or password."
        };
      }

      const {
        profile,
        session: nextSession,
        errorMessage
      } = await hydrateSessionFromSupabase(
        data.user.id,
        data.user.email
      );

      if (!profile) {
        logAuthDebug("sign in profile hydration failed", {
          requestedEmail: email,
          authUserId: data.user.id,
          errorMessage: errorMessage ?? null
        });
        await supabase.auth.signOut();
        persistSession(defaultSession);
        return {
          ok: false,
          message:
            errorMessage ??
            "We could not load your member profile. Please contact Local One."
        };
      }

      return {
        ok: true,
        message:
          nextSession.status === "denied"
            ? "Your account was denied. Please contact Local One."
            : nextSession.status === "inactive"
              ? "Your account is inactive. Please contact Local One."
            : nextSession.status === "pending"
            ? "Your account is pending admin approval."
            : "Login successful."
      };
    }

    const account = demoAccounts.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (account) {
      persistSession({
        role: account.role,
        status: account.status,
        name: account.name,
        site: account.site,
        email: account.email
      });
      return {
        ok: true,
        message:
          account.status === "pending"
            ? "Your account is pending admin approval."
            : "Login successful."
      };
    }

    const registered = pendingMembers.find((member) => member.email === normalizedEmail);
    if (registered && registered.status === "pending") {
      persistSession({
        role: "member",
        status: "pending",
        name: `${registered.firstName} ${registered.lastName}`,
        site: registered.site,
        email: registered.email
      });
      return {
        ok: true,
        message: "Your account is still pending admin approval."
      };
    }

    if (registered && registered.status === "denied") {
      persistSession({
        role: "member",
        status: "denied",
        name: `${registered.firstName} ${registered.lastName}`,
        site: registered.site,
        email: registered.email
      });
      return {
        ok: true,
        message: "Your account was denied. Please contact Local One."
      };
    }

    if (registered && registered.status === "inactive") {
      persistSession({
        role: "member",
        status: "inactive",
        name: `${registered.firstName} ${registered.lastName}`,
        site: registered.site,
        email: registered.email
      });
      return {
        ok: true,
        message: "Your account is inactive. Please contact Local One."
      };
    }

    if (registered && registered.status === "approved") {
      persistSession({
        role: "member",
        status: "approved",
        name: `${registered.firstName} ${registered.lastName}`,
        site: registered.site,
        email: registered.email
      });
      return { ok: true, message: "Login successful." };
    }

    return { ok: false, message: "Invalid email or password." };
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    persistSession(defaultSession);
  }

  async function registerMember(
    member: RegistrationInput
  ): Promise<AuthResult> {
    if (supabase) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: member.email,
        password: member.password,
        options: {
          data: {
            first_name: member.firstName,
            last_name: member.lastName,
            phone: member.phone,
            affiliated_site: member.site
          }
        }
      });

      if (!error && authData.user) {
        const profilePayload = {
          id: authData.user.id,
          first_name: member.firstName,
          last_name: member.lastName,
          email: member.email,
          phone: member.phone,
          affiliated_site: member.site,
          status: "pending",
          role: "member"
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .insert(profilePayload);

        if (!profileError) {
          await supabase.auth.signOut();
          persistSession(defaultSession);

          return {
            ok: true,
            message: "Your account has been submitted for admin approval."
          };
        }

        logDevelopmentError("Local One profile insert", profileError, profilePayload);
        await supabase.auth.signOut();
        persistSession(defaultSession);
        return {
          ok: false,
          message: getFriendlySupabaseMessage({
            action: "save your account profile",
            audience: "member"
          })
        };
      }

      logDevelopmentError("Local One auth sign up", error, { email: member.email });
      return {
        ok: false,
        message:
          "We could not submit your account right now. Please try again."
      };
    }

    return {
      ok: false,
      message: "Sign up is temporarily unavailable right now."
    };
  }

  async function updateMemberStatus(
    id: string,
    status: "approved" | "denied" | "inactive"
  ) {
    if (supabase) {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", id);

      if (!error) {
        await loadPendingMembersFromSupabase();
        return;
      }
    }

    const nextMembers = pendingMembers.map((member) =>
      member.id === id ? { ...member, status } : member
    );
    persistPending(nextMembers.filter((member) => member.status === "pending"));
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        pendingMembers,
        signIn,
        signOut,
        registerMember,
        updateMemberStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
