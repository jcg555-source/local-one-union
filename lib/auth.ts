export type PendingMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  site: string;
  status: "pending" | "approved" | "denied" | "inactive";
  role?: "member" | "admin";
};

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  site: string;
  password: string;
};

export type SessionState = {
  id?: string;
  role: "guest" | "member" | "admin";
  status: "logged_out" | "pending" | "approved" | "denied" | "inactive";
  name?: string;
  firstName?: string;
  lastName?: string;
  site?: string;
  email?: string;
};

export type AuthResult = {
  ok: boolean;
  message: string;
};

export const demoAccounts = [
  {
    email: "admin@localoneunion.org",
    password: "Admin123!",
    role: "admin" as const,
    status: "approved" as const,
    name: "Admin User"
  },
  {
    email: "member@localoneunion.org",
    password: "Member123!",
    role: "member" as const,
    status: "approved" as const,
    name: "Jordan Ellis",
    site: "Metro Plaza"
  },
  {
    email: "pending@localoneunion.org",
    password: "Pending123!",
    role: "member" as const,
    status: "pending" as const,
    name: "Taylor Brooks",
    site: "Harbor Point Terminal"
  }
];

export const pendingMembersStorageKey = "local-one-pending-members";
export const sessionStorageKey = "local-one-session";
