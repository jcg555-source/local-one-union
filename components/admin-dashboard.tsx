"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createAuditLog } from "@/lib/audit";
import { galleryItems, leaders, newsItems, sites as fallbackSites } from "@/lib/data";
import { composeSiteAddress, slugifySiteName } from "@/lib/site-utils";
import { supabase } from "@/lib/supabase";
import {
  getFriendlySupabaseMessage,
  logDevelopmentError
} from "@/lib/user-facing-errors";

type ProfileStatus = "pending" | "approved" | "denied" | "inactive";
type ProfileRole = "member" | "admin";

type AdminSectionKey =
  | "approved-users"
  | "pending-users"
  | "inactive-users"
  | "denied-users"
  | "site-management"
  | "hiring-alert-signups"
  | "organizing-inquiries"
  | "contract-management"
  | "gallery-management"
  | "leadership-management"
  | "member-resource-management";

type AdminProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  affiliated_site: string | null;
  status: ProfileStatus;
  role: ProfileRole;
  created_at: string | null;
};

type HiringAlertSignup = {
  id: string;
  site_id: string | null;
  email: string | null;
  created_at: string | null;
};

type OrganizingInquiry = {
  id: string;
  name: string | null;
  email: string | null;
  site_description: string | null;
  created_at: string | null;
};

type AdminSite = {
  id: string;
  name: string | null;
  slug: string | null;
  employer: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  intro: string | null;
  representative: string | null;
  lat: number | null;
  lng: number | null;
  archived: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
};

type AdminContract = {
  id: string;
  site_id: string | null;
  title: string | null;
  file_url: string | null;
  effective_date: string | null;
  expiration_date: string | null;
  created_at: string | null;
};

type AdminGalleryItem = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

type AdminLeadershipMember = {
  id: string;
  name: string | null;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

type AdminMemberResource = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  file_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type SiteFormValues = {
  name: string;
  slug: string;
  employer: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  intro: string;
  representative: string;
  lat: string;
  lng: string;
};

type ContractFormValues = {
  site_id: string;
  title: string;
  file_url: string;
  effective_date: string;
  expiration_date: string;
};

type GalleryFormValues = {
  title: string;
  subtitle: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

type LeadershipFormValues = {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

type MemberResourceFormValues = {
  title: string;
  description: string;
  category: string;
  file_url: string;
  is_active: boolean;
};

const emptySiteForm: SiteFormValues = {
  name: "",
  slug: "",
  employer: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
  intro: "",
  representative: "",
  lat: "",
  lng: ""
};

const emptyContractForm: ContractFormValues = {
  site_id: "",
  title: "",
  file_url: "",
  effective_date: "",
  expiration_date: ""
};

const emptyGalleryForm: GalleryFormValues = {
  title: "",
  subtitle: "",
  image_url: "",
  display_order: "0",
  is_active: true
};

const emptyLeadershipForm: LeadershipFormValues = {
  name: "",
  role: "",
  bio: "",
  image_url: "",
  display_order: "0",
  is_active: true
};

const emptyMemberResourceForm: MemberResourceFormValues = {
  title: "",
  description: "",
  category: "",
  file_url: "",
  is_active: true
};

const contractStorageBucket = "contracts";
const galleryStorageBucket = "gallery";
const leadershipStorageBucket = "leadership";
const memberResourcesStorageBucket = "member-resources";
const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const sectionLabels: Record<AdminSectionKey, string> = {
  "approved-users": "Approved Users",
  "pending-users": "Pending Users",
  "inactive-users": "Inactive Users",
  "denied-users": "Denied Users",
  "site-management": "Site Page Management",
  "hiring-alert-signups": "Hiring Alert Signups",
  "organizing-inquiries": "Organizing Inquiries",
  "contract-management": "Contract Management",
  "gallery-management": "Gallery Management",
  "leadership-management": "Leadership Management",
  "member-resource-management": "Member Resource Management"
};

function formatCreatedDate(createdAt: string | null) {
  if (!createdAt) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(createdAt));
}

function hasAllowedImageExtension(fileName: string) {
  const normalizedFileName = fileName.trim().toLowerCase();
  return allowedImageExtensions.some((extension) =>
    normalizedFileName.endsWith(extension)
  );
}

function isAllowedImageFile(file: File) {
  if (allowedImageMimeTypes.includes(file.type)) {
    return true;
  }

  return hasAllowedImageExtension(file.name);
}

function normalizeUploadedFileName(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const extensionMatch = trimmed.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1] ?? "";
  const nameWithoutExtension = extension
    ? trimmed.slice(0, -extension.length)
    : trimmed;
  const normalizedBase = nameWithoutExtension
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeBase = normalizedBase || "upload";

  return `${Date.now()}-${safeBase}${extension}`;
}

function SectionMenuButton({
  active,
  badgeCount,
  description,
  label,
  onClick
}: {
  active: boolean;
  badgeCount?: number;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card-panel rounded-3xl p-5 text-left transition ${
        active
          ? "border-union-gold bg-union-mist/90 shadow-card"
          : "hover:-translate-y-0.5 hover:border-union-gold/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
            Admin Section
          </p>
          <h3 className="mt-3 text-xl font-semibold text-union-navy">{label}</h3>
        </div>
        {badgeCount && badgeCount > 0 ? (
          <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            {badgeCount}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-union-steel">{description}</p>
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-medium text-union-navy">{children}</span>;
}

function StatusMessage({
  message,
  tone = "success"
}: {
  message: string | null;
  tone?: "success" | "error" | "info";
}) {
  if (!message) {
    return null;
  }

  const classes =
    tone === "error"
      ? "border border-red-200 bg-red-50 text-red-700"
      : tone === "info"
        ? "border border-union-slate/70 bg-union-mist text-union-steel"
        : "bg-union-mist text-union-navy";

  return <p className={`rounded-2xl px-4 py-3 text-sm ${classes}`}>{message}</p>;
}

export function AdminDashboard() {
  const { session, signOut } = useAuth();
  const isApprovedAdmin = session.role === "admin" && session.status === "approved";
  const [selectedSection, setSelectedSection] =
    useState<AdminSectionKey>("pending-users");

  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [hiringAlertSignups, setHiringAlertSignups] = useState<HiringAlertSignup[]>([]);
  const [organizingInquiries, setOrganizingInquiries] = useState<OrganizingInquiry[]>([]);
  const [adminSites, setAdminSites] = useState<AdminSite[]>([]);
  const [adminContracts, setAdminContracts] = useState<AdminContract[]>([]);
  const [adminGalleryItems, setAdminGalleryItems] = useState<AdminGalleryItem[]>([]);
  const [adminLeadershipMembers, setAdminLeadershipMembers] = useState<
    AdminLeadershipMember[]
  >([]);
  const [adminMemberResources, setAdminMemberResources] = useState<
    AdminMemberResource[]
  >([]);

  const [profilesLoading, setProfilesLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [leadershipLoading, setLeadershipLoading] = useState(true);
  const [memberResourcesLoading, setMemberResourcesLoading] = useState(true);

  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [leadershipError, setLeadershipError] = useState<string | null>(null);
  const [memberResourcesError, setMemberResourcesError] = useState<string | null>(
    null
  );

  const [sitesSuccess, setSitesSuccess] = useState<string | null>(null);
  const [contractsSuccess, setContractsSuccess] = useState<string | null>(null);
  const [gallerySuccess, setGallerySuccess] = useState<string | null>(null);
  const [leadershipSuccess, setLeadershipSuccess] = useState<string | null>(null);
  const [memberResourcesSuccess, setMemberResourcesSuccess] = useState<string | null>(
    null
  );
  const [siteGeoMessage, setSiteGeoMessage] = useState<string | null>(null);

  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);
  const [savingSite, setSavingSite] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [savingGalleryItem, setSavingGalleryItem] = useState(false);
  const [savingLeadershipMember, setSavingLeadershipMember] = useState(false);
  const [savingMemberResource, setSavingMemberResource] = useState(false);
  const [isGeocodingSite, setIsGeocodingSite] = useState(false);

  const [uploadingContractFile, setUploadingContractFile] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [uploadingLeadershipImage, setUploadingLeadershipImage] = useState(false);
  const [uploadingMemberResourceFile, setUploadingMemberResourceFile] =
    useState(false);

  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState<string | null>(null);
  const [editingLeadershipMemberId, setEditingLeadershipMemberId] = useState<
    string | null
  >(null);
  const [editingMemberResourceId, setEditingMemberResourceId] = useState<
    string | null
  >(null);
  const [siteSlugEdited, setSiteSlugEdited] = useState(false);
  const [lastAutoGeocodeQuery, setLastAutoGeocodeQuery] = useState<string | null>(null);

  const [siteForm, setSiteForm] = useState<SiteFormValues>(emptySiteForm);
  const [contractForm, setContractForm] = useState<ContractFormValues>(
    emptyContractForm
  );
  const [galleryForm, setGalleryForm] = useState<GalleryFormValues>(emptyGalleryForm);
  const [leadershipForm, setLeadershipForm] = useState<LeadershipFormValues>(
    emptyLeadershipForm
  );
  const [memberResourceForm, setMemberResourceForm] =
    useState<MemberResourceFormValues>(emptyMemberResourceForm);

  const [contractPdfFile, setContractPdfFile] = useState<File | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [leadershipImageFile, setLeadershipImageFile] = useState<File | null>(null);
  const [memberResourceFile, setMemberResourceFile] = useState<File | null>(null);

  const groupedProfiles = useMemo(
    () => ({
      pending: profiles.filter((profile) => profile.status === "pending"),
      approved: profiles.filter((profile) => profile.status === "approved"),
      inactive: profiles.filter((profile) => profile.status === "inactive"),
      denied: profiles.filter((profile) => profile.status === "denied")
    }),
    [profiles]
  );

  const adminCount = useMemo(
    () => profiles.filter((profile) => profile.role === "admin").length,
    [profiles]
  );

  const groupedAdminSites = useMemo(
    () => ({
      active: adminSites.filter(
        (site) => !site.archived && site.is_active !== false
      ),
      archived: adminSites.filter(
        (site) => Boolean(site.archived) || site.is_active === false
      )
    }),
    [adminSites]
  );

  const siteAddressPreview = useMemo(
    () =>
      composeSiteAddress({
        address: siteForm.address,
        city: siteForm.city,
        state: siteForm.state,
        zipcode: siteForm.zipcode
      }),
    [siteForm.address, siteForm.city, siteForm.state, siteForm.zipcode]
  );

  const displayedSiteGeoMessage = useMemo(() => {
    if (siteGeoMessage) {
      return siteGeoMessage;
    }

    if (!siteAddressPreview) {
      return "New sites are added active by default.";
    }

    if (siteForm.lat && siteForm.lng) {
      return "Coordinates are ready. New sites are added active by default.";
    }

    if (
      !siteForm.address.trim() ||
      !siteForm.city.trim() ||
      !siteForm.state.trim() ||
      !siteForm.zipcode.trim()
    ) {
      return "Enter address, city, state, and zipcode to generate coordinates, or enter them manually.";
    }

    return "Coordinates will generate automatically when the address is complete, or you can use the manual button.";
  }, [
    siteAddressPreview,
    siteForm.address,
    siteForm.city,
    siteForm.lat,
    siteForm.lng,
    siteForm.state,
    siteForm.zipcode,
    siteGeoMessage
  ]);

  function requireApprovedAdmin(
    setError: (message: string | null) => void,
    action: string
  ) {
    if (isApprovedAdmin) {
      return true;
    }

    setError(
      `Only approved admins can ${action}.`
    );
    return false;
  }

  async function writeAuditLog({
    action,
    targetType,
    targetId,
    details
  }: {
    action: string;
    targetType: string;
    targetId?: string | null;
    details?: Record<string, unknown> | null;
  }) {
    if (!isApprovedAdmin || !session.id || !session.email) {
      return;
    }

    await createAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      first_name: session.firstName ?? null,
      last_name: session.lastName ?? null,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? null
    });
  }

  async function geocodeSiteAddress(addressQuery: string, mode: "auto" | "manual") {
    const normalizedQuery = addressQuery.trim();

    if (!normalizedQuery) {
      setSiteGeoMessage("Enter the full address before generating coordinates.");
      return;
    }

    try {
      setIsGeocodingSite(true);
      setSiteGeoMessage(
        mode === "manual"
          ? "Looking up coordinates from the address you entered..."
          : "Checking geocoding data for this address..."
      );

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(normalizedQuery)}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding request failed with status ${response.status}.`);
      }

      const results = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
      }>;

      const match = results[0];

      if (!match?.lat || !match?.lon) {
        setSiteGeoMessage(
          "No coordinates were found for this address yet. Enter latitude and longitude manually."
        );
        return;
      }

      setSiteForm((current) => ({
        ...current,
        lat: match.lat ?? current.lat,
        lng: match.lon ?? current.lng
      }));
      setSiteGeoMessage(
        "Coordinates were generated from the site address. Review them before saving."
      );
      setLastAutoGeocodeQuery(normalizedQuery);
    } catch (_error) {
      setSiteGeoMessage(
        "Live geocoding is unavailable right now. Enter latitude and longitude manually."
      );
    } finally {
      setIsGeocodingSite(false);
    }
  }

  useEffect(() => {
    if (
      !siteAddressPreview ||
      siteForm.lat ||
      siteForm.lng ||
      !siteForm.address.trim() ||
      !siteForm.city.trim() ||
      !siteForm.state.trim() ||
      !siteForm.zipcode.trim()
    ) {
      return;
    }

    if (lastAutoGeocodeQuery === siteAddressPreview || isGeocodingSite) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void geocodeSiteAddress(siteAddressPreview, "auto");
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    isGeocodingSite,
    lastAutoGeocodeQuery,
    siteAddressPreview,
    siteForm.address,
    siteForm.city,
    siteForm.lat,
    siteForm.lng,
    siteForm.state,
    siteForm.zipcode
  ]);

  async function refreshProfiles() {
    if (!supabase) {
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "load member profiles",
          audience: "admin"
        })
      );
      setProfilesLoading(false);
      return;
    }

    setProfilesLoading(true);
    setProfilesError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, phone, affiliated_site, status, role, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      logDevelopmentError("Admin profiles load", error);
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "load member profiles",
          audience: "admin"
        })
      );
      setProfilesLoading(false);
      return;
    }

    setProfiles((data as AdminProfile[]) ?? []);
    setProfilesLoading(false);
  }

  async function refreshSubmissions() {
    if (!supabase) {
      setSubmissionsError(
        getFriendlySupabaseMessage({
          action: "load public form submissions",
          audience: "admin"
        })
      );
      setSubmissionsLoading(false);
      return;
    }

    setSubmissionsLoading(true);
    setSubmissionsError(null);

    const [
      { data: hiringData, error: hiringError },
      { data: organizingData, error: organizingError }
    ] = await Promise.all([
      supabase
        .from("hiring_alert_signups")
        .select("id, site_id, email, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("organizing_inquiries")
        .select("id, name, email, site_description, created_at")
        .order("created_at", { ascending: false })
    ]);

    if (hiringError || organizingError) {
      logDevelopmentError("Admin submissions load", hiringError ?? organizingError);
      setSubmissionsError(
        getFriendlySupabaseMessage({
          action: "load public form submissions",
          audience: "admin"
        })
      );
      setSubmissionsLoading(false);
      return;
    }

    setHiringAlertSignups((hiringData as HiringAlertSignup[]) ?? []);
    setOrganizingInquiries((organizingData as OrganizingInquiry[]) ?? []);
    setSubmissionsLoading(false);
  }

  async function refreshSites() {
    if (!supabase) {
      setSitesError(
        getFriendlySupabaseMessage({
          action: "load site records",
          audience: "admin"
        })
      );
      setSitesLoading(false);
      return;
    }

    setSitesLoading(true);
    setSitesError(null);

    const { data, error } = await supabase
      .from("sites")
      .select(
        "id, name, slug, employer, address, city, state, zipcode, intro, representative, lat, lng, archived, is_active, created_at"
      )
      .order("name", { ascending: true });

    if (error) {
      logDevelopmentError("Admin sites load", error);
      setSitesError(
        getFriendlySupabaseMessage({
          action: "load site records",
          audience: "admin"
        })
      );
      setSitesLoading(false);
      return;
    }

    setAdminSites((data as AdminSite[]) ?? []);
    setSitesLoading(false);
  }

  async function refreshContracts() {
    if (!supabase) {
      setContractsError(
        getFriendlySupabaseMessage({
          action: "load contract records",
          audience: "admin"
        })
      );
      setContractsLoading(false);
      return;
    }

    setContractsLoading(true);
    setContractsError(null);

    const { data, error } = await supabase
      .from("contracts")
      .select(
        "id, site_id, title, file_url, effective_date, expiration_date, created_at"
      )
      .order("effective_date", { ascending: false });

    if (error) {
      logDevelopmentError("Admin contracts load", error);
      setContractsError(
        getFriendlySupabaseMessage({
          action: "load contract records",
          audience: "admin"
        })
      );
      setContractsLoading(false);
      return;
    }

    setAdminContracts((data as AdminContract[]) ?? []);
    setContractsLoading(false);
  }

  async function refreshGalleryItems() {
    if (!supabase) {
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "load gallery items",
          audience: "admin"
        })
      );
      setGalleryLoading(false);
      return;
    }

    setGalleryLoading(true);
    setGalleryError(null);

    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, title, subtitle, image_url, display_order, is_active, created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      logDevelopmentError("Admin gallery load", error);
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "load gallery items",
          audience: "admin"
        })
      );
      setGalleryLoading(false);
      return;
    }

    setAdminGalleryItems((data as AdminGalleryItem[]) ?? []);
    setGalleryLoading(false);
  }

  async function refreshLeadershipMembers() {
    if (!supabase) {
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "load leadership records",
          audience: "admin"
        })
      );
      setLeadershipLoading(false);
      return;
    }

    setLeadershipLoading(true);
    setLeadershipError(null);

    const { data, error } = await supabase
      .from("leadership")
      .select("id, name, role, bio, image_url, display_order, is_active, created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      logDevelopmentError("Admin leadership load", error);
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "load leadership records",
          audience: "admin"
        })
      );
      setLeadershipLoading(false);
      return;
    }

    setAdminLeadershipMembers((data as AdminLeadershipMember[]) ?? []);
    setLeadershipLoading(false);
  }

  async function refreshMemberResources() {
    if (!supabase) {
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "load member resources",
          audience: "admin"
        })
      );
      setMemberResourcesLoading(false);
      return;
    }

    setMemberResourcesLoading(true);
    setMemberResourcesError(null);

    const { data, error } = await supabase
      .from("member_resources")
      .select("id, title, description, category, file_url, is_active, created_at")
      .order("category", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      logDevelopmentError("Admin member resources load", error);
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "load member resources",
          audience: "admin"
        })
      );
      setMemberResourcesLoading(false);
      return;
    }

    setAdminMemberResources((data as AdminMemberResource[]) ?? []);
    setMemberResourcesLoading(false);
  }

  useEffect(() => {
    if (session.role !== "admin" || session.status !== "approved") {
      return;
    }

    async function loadAdminDashboardData() {
      await Promise.all([
        refreshProfiles(),
        refreshSubmissions(),
        refreshSites(),
        refreshContracts(),
        refreshGalleryItems(),
        refreshLeadershipMembers(),
        refreshMemberResources()
      ]);
    }

    void loadAdminDashboardData();
  }, [session.role, session.status]);

  function resetSiteForm() {
    setEditingSiteId(null);
    setSiteForm(emptySiteForm);
    setSiteSlugEdited(false);
    setSiteGeoMessage("New sites are added active by default.");
    setLastAutoGeocodeQuery(null);
  }

  function resetContractForm() {
    setEditingContractId(null);
    setContractForm(emptyContractForm);
    setContractPdfFile(null);
  }

  function resetGalleryForm() {
    setEditingGalleryItemId(null);
    setGalleryForm(emptyGalleryForm);
    setGalleryImageFile(null);
  }

  function resetLeadershipForm() {
    setEditingLeadershipMemberId(null);
    setLeadershipForm(emptyLeadershipForm);
    setLeadershipImageFile(null);
  }

  function resetMemberResourceForm() {
    setEditingMemberResourceId(null);
    setMemberResourceForm(emptyMemberResourceForm);
    setMemberResourceFile(null);
  }

  function updateSiteAddressField(
    field: "address" | "city" | "state" | "zipcode",
    value: string
  ) {
    setLastAutoGeocodeQuery(null);
    setSiteGeoMessage(
      "Address updated. Coordinates will refresh automatically, or you can generate them manually."
    );
    setSiteForm((current) => ({
      ...current,
      [field]: value,
      lat: "",
      lng: ""
    }));
  }

  function updateSiteName(value: string) {
    setSiteForm((current) => ({
      ...current,
      name: value,
      slug: siteSlugEdited ? current.slug : slugifySiteName(value)
    }));
  }

  function startEditingSite(site: AdminSite) {
    setSitesSuccess(null);
    setSitesError(null);
    setSiteGeoMessage("Update the address to refresh the suggested coordinates.");
    setEditingSiteId(site.id);
    setSiteSlugEdited(true);
    setLastAutoGeocodeQuery(null);
    setSiteForm({
      name: site.name ?? "",
      slug: site.slug ?? "",
      employer: site.employer ?? "",
      address: site.address ?? "",
      city: site.city ?? "",
      state: site.state ?? "",
      zipcode: site.zipcode ?? "",
      intro: site.intro ?? "",
      representative: site.representative ?? "",
      lat: site.lat?.toString() ?? "",
      lng: site.lng?.toString() ?? ""
    });
  }

  function startEditingContract(contract: AdminContract) {
    setContractsSuccess(null);
    setContractsError(null);
    setEditingContractId(contract.id);
    setContractForm({
      site_id: contract.site_id ?? "",
      title: contract.title ?? "",
      file_url: contract.file_url ?? "",
      effective_date: contract.effective_date ?? "",
      expiration_date: contract.expiration_date ?? ""
    });
    setContractPdfFile(null);
  }

  function startEditingGalleryItem(item: AdminGalleryItem) {
    setGallerySuccess(null);
    setGalleryError(null);
    setEditingGalleryItemId(item.id);
    setGalleryForm({
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      image_url: item.image_url ?? "",
      display_order: item.display_order?.toString() ?? "0",
      is_active: item.is_active ?? true
    });
    setGalleryImageFile(null);
  }

  function startEditingLeadershipMember(member: AdminLeadershipMember) {
    setLeadershipSuccess(null);
    setLeadershipError(null);
    setEditingLeadershipMemberId(member.id);
    setLeadershipForm({
      name: member.name ?? "",
      role: member.role ?? "",
      bio: member.bio ?? "",
      image_url: member.image_url ?? "",
      display_order: member.display_order?.toString() ?? "0",
      is_active: member.is_active ?? true
    });
    setLeadershipImageFile(null);
  }

  function startEditingMemberResource(resource: AdminMemberResource) {
    setMemberResourcesSuccess(null);
    setMemberResourcesError(null);
    setEditingMemberResourceId(resource.id);
    setMemberResourceForm({
      title: resource.title ?? "",
      description: resource.description ?? "",
      category: resource.category ?? "",
      file_url: resource.file_url ?? "",
      is_active: resource.is_active ?? true
    });
    setMemberResourceFile(null);
  }

  async function handleStatusUpdate(id: string, status: ProfileStatus) {
    if (!supabase) {
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "update account status",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setProfilesError, "update account status")) {
      return;
    }

    setProfilesError(null);
    setUpdatingProfileId(id);

    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);

    if (error) {
      logDevelopmentError("Admin status update", error, { id, status });
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "update account status",
          audience: "admin"
        })
      );
      setUpdatingProfileId(null);
      return;
    }

    const targetProfile = profiles.find((profile) => profile.id === id);
    const action =
      status === "approved"
        ? targetProfile?.status === "inactive"
          ? "reactivate_user"
          : "approve_user"
        : status === "denied"
          ? "deny_user"
          : status === "pending"
            ? "review_user"
            : "deactivate_user";

    await writeAuditLog({
      action,
      targetType: "user",
      targetId: id,
      details: {
        previous_status: targetProfile?.status ?? null,
        next_status: status,
        member_email: targetProfile?.email ?? null
      }
    });

    if (status === "approved" && targetProfile?.email) {
      const approvalResponse = await fetch("/api/account-approval-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: targetProfile.email,
          name:
            [targetProfile.first_name, targetProfile.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() || targetProfile.email
        })
      });

      if (!approvalResponse.ok) {
        logDevelopmentError("Account approval email", null, {
          memberId: id,
          email: targetProfile.email
        });
      }
    }

    await refreshProfiles();
    setUpdatingProfileId(null);
  }

  async function handleRoleUpdate(id: string, role: ProfileRole) {
    if (!supabase) {
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "update account roles",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setProfilesError, "update account roles")) {
      return;
    }

    const targetProfile = profiles.find((profile) => profile.id === id);
    const isSelf = session.id === id;
    const isLastAdmin =
      targetProfile?.role === "admin" && adminCount === 1 && role === "member";

    if (isSelf && isLastAdmin) {
      setProfilesError("You cannot demote your own account while you are the only admin.");
      return;
    }

    setProfilesError(null);
    setUpdatingProfileId(id);

    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

    if (error) {
      logDevelopmentError("Admin role update", error, { id, role });
      setProfilesError(
        getFriendlySupabaseMessage({
          action: "update account roles",
          audience: "admin"
        })
      );
      setUpdatingProfileId(null);
      return;
    }

    await writeAuditLog({
      action: role === "admin" ? "promote_admin" : "demote_admin",
      targetType: "user",
      targetId: id,
      details: {
        previous_role: targetProfile?.role ?? null,
        next_role: role,
        member_email: targetProfile?.email ?? null
      }
    });
    await refreshProfiles();
    setUpdatingProfileId(null);
  }

  async function handleSiteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setSitesError(
        getFriendlySupabaseMessage({
          action: "save site records",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setSitesError, "edit site records")) {
      return;
    }

    const payload = {
      name: siteForm.name.trim(),
      slug: slugifySiteName(siteForm.slug),
      employer: siteForm.employer.trim(),
      address: siteForm.address.trim(),
      city: siteForm.city.trim(),
      state: siteForm.state.trim().toUpperCase(),
      zipcode: siteForm.zipcode.trim(),
      intro: siteForm.intro.trim(),
      representative: siteForm.representative.trim(),
      lat: Number(siteForm.lat),
      lng: Number(siteForm.lng)
    };

    if (
      !payload.name ||
      !payload.slug ||
      !payload.employer ||
      !payload.address ||
      !payload.city ||
      !payload.state ||
      !payload.zipcode ||
      !payload.intro ||
      !payload.representative ||
      Number.isNaN(payload.lat) ||
      Number.isNaN(payload.lng)
    ) {
      setSitesSuccess(null);
      setSitesError(
        "Complete all site fields, including city, state, zipcode, and valid latitude and longitude."
      );
      return;
    }

    setSavingSite(true);
    setSitesError(null);
    setSitesSuccess(null);

    const query = editingSiteId
      ? supabase.from("sites").update(payload).eq("id", editingSiteId)
      : supabase
          .from("sites")
          .insert({ ...payload, archived: false, is_active: true });

    const { error } = await query;

    if (error) {
      logDevelopmentError("Admin site submit", error, payload);
      setSitesError(
        getFriendlySupabaseMessage({
          action: "save site records",
          audience: "admin"
        })
      );
      setSavingSite(false);
      return;
    }

    await writeAuditLog({
      action: editingSiteId ? "edit_site" : "create_site",
      targetType: "site",
      targetId: editingSiteId ?? payload.slug,
      details: {
        slug: payload.slug,
        name: payload.name,
        employer: payload.employer,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zipcode: payload.zipcode
      }
    });
    await refreshSites();
    setSitesSuccess(
      editingSiteId ? "Site details were updated successfully." : "New site added successfully."
    );
    setSavingSite(false);
    resetSiteForm();
  }

  async function handleArchiveSite(id: string, archived: boolean) {
    if (!supabase) {
      setSitesError(
        getFriendlySupabaseMessage({
          action: "archive site records",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setSitesError, "manage site records")) {
      return;
    }

    setSitesError(null);
    setSitesSuccess(null);

    const { error } = await supabase
      .from("sites")
      .update({ archived, is_active: !archived })
      .eq("id", id);

    if (error) {
      logDevelopmentError("Admin site archive", error, { id, archived });
      setSitesError(
        getFriendlySupabaseMessage({
          action: "archive site records",
          audience: "admin"
        })
      );
      return;
    }

    const targetSite = adminSites.find((site) => site.id === id);
    await writeAuditLog({
      action: archived ? "archive_site" : "restore_site",
      targetType: "site",
      targetId: id,
      details: {
        site_name: targetSite?.name ?? null,
        slug: targetSite?.slug ?? null
      }
    });
    await refreshSites();
    setSitesSuccess(archived ? "Site archived successfully." : "Site restored successfully.");
  }

  async function handleContractSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setContractsError(
        getFriendlySupabaseMessage({
          action: "save contract records",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setContractsError, "manage contract records")) {
      return;
    }

    const trimmedSiteId = contractForm.site_id.trim();
    const trimmedTitle = contractForm.title.trim();
    const trimmedManualFileUrl = contractForm.file_url.trim();

    if (!trimmedSiteId || !trimmedTitle || (!trimmedManualFileUrl && !contractPdfFile)) {
      setContractsSuccess(null);
      setContractsError("Site, title, and either a PDF upload or file URL are required.");
      return;
    }

    if (contractPdfFile && contractPdfFile.type !== "application/pdf") {
      setContractsSuccess(null);
      setContractsError("Only PDF files can be uploaded for contracts.");
      return;
    }

    let resolvedFileUrl = trimmedManualFileUrl;

    if (contractPdfFile) {
      setUploadingContractFile(true);
      const safeFileName = contractPdfFile.name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
      const filePath = `${trimmedSiteId}/${Date.now()}-${safeFileName}`;
      const uploadContext = {
        bucketName: contractStorageBucket,
        fileName: contractPdfFile.name,
        normalizedFilePath: filePath,
        fileType: contractPdfFile.type,
        authenticatedUserId: session.id ?? null,
        adminProfileRole: session.role,
        adminProfileStatus: session.status
      };

      const { error: uploadError } = await supabase.storage
        .from(contractStorageBucket)
        .upload(filePath, contractPdfFile, {
          cacheControl: "3600",
          contentType: "application/pdf",
          upsert: false
        });

      if (uploadError) {
        logDevelopmentError("Admin contract upload", uploadError, uploadContext);
        setContractsError(
          process.env.NODE_ENV !== "production"
            ? `Contract upload failed: ${uploadError.message}`
            : getFriendlySupabaseMessage({
                action: "upload the contract file",
                audience: "admin"
              })
        );
        setUploadingContractFile(false);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(contractStorageBucket).getPublicUrl(filePath);

      resolvedFileUrl = publicUrl;
      setUploadingContractFile(false);
    }

    const payload = {
      site_id: trimmedSiteId,
      title: trimmedTitle,
      file_url: resolvedFileUrl,
      effective_date: contractForm.effective_date || null,
      expiration_date: contractForm.expiration_date || null
    };

    setSavingContract(true);
    setContractsError(null);
    setContractsSuccess(null);

    const query = editingContractId
      ? supabase.from("contracts").update(payload).eq("id", editingContractId)
      : supabase.from("contracts").insert(payload);

    const { error } = await query;

    if (error) {
      logDevelopmentError("Admin contract submit", error, payload);
      setContractsError(
        getFriendlySupabaseMessage({
          action: "save contract records",
          audience: "admin"
        })
      );
      setSavingContract(false);
      return;
    }

    await writeAuditLog({
      action: editingContractId ? "edit_contract" : "upload_contract",
      targetType: "contract",
      targetId: editingContractId ?? trimmedSiteId,
      details: {
        site_id: trimmedSiteId,
        title: trimmedTitle,
        effective_date: payload.effective_date,
        expiration_date: payload.expiration_date
      }
    });
    await refreshContracts();
    setContractsSuccess(
      editingContractId
        ? "Contract record updated successfully."
        : "Contract record added successfully."
    );
    setSavingContract(false);
    resetContractForm();
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "save gallery items",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setGalleryError, "manage gallery items")) {
      return;
    }

    const trimmedTitle = galleryForm.title.trim();
    const trimmedSubtitle = galleryForm.subtitle.trim();
    const trimmedImageUrl = galleryForm.image_url.trim();
    const parsedDisplayOrder = Number(galleryForm.display_order);

    if (
      !trimmedTitle ||
      !trimmedSubtitle ||
      (!trimmedImageUrl && !galleryImageFile) ||
      Number.isNaN(parsedDisplayOrder)
    ) {
      setGallerySuccess(null);
      setGalleryError(
        "Title, subtitle, display order, and either an image upload or image URL are required."
      );
      return;
    }

    if (galleryImageFile && !isAllowedImageFile(galleryImageFile)) {
      setGallerySuccess(null);
      setGalleryError("Only JPG, JPEG, PNG, and WEBP images can be uploaded.");
      return;
    }

    let resolvedImageUrl = trimmedImageUrl;
    setGalleryError(null);
    setGallerySuccess(null);
    setSavingGalleryItem(true);

    try {
      if (galleryImageFile) {
        setUploadingGalleryImage(true);
        const normalizedFileName = normalizeUploadedFileName(galleryImageFile.name);

        const { error: uploadError } = await supabase.storage
          .from(galleryStorageBucket)
          .upload(normalizedFileName, galleryImageFile, {
            cacheControl: "3600",
            contentType: galleryImageFile.type || "image/jpeg",
            upsert: false
          });

        if (uploadError) {
          logDevelopmentError("Admin gallery upload", uploadError, {
            fileName: galleryImageFile.name
          });
          setGalleryError(
            getFriendlySupabaseMessage({
              action: "upload the gallery image",
              audience: "admin"
            })
          );
          return;
        }

        const {
          data: { publicUrl }
        } = supabase.storage.from(galleryStorageBucket).getPublicUrl(normalizedFileName);

        resolvedImageUrl = publicUrl;
      }

      const payload = {
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        image_url: resolvedImageUrl,
        display_order: parsedDisplayOrder,
        is_active: galleryForm.is_active
      };

      const query = editingGalleryItemId
        ? supabase.from("gallery_items").update(payload).eq("id", editingGalleryItemId)
        : supabase.from("gallery_items").insert(payload);

      const { error } = await query;

      if (error) {
        logDevelopmentError("Admin gallery submit", error, payload);
        setGalleryError(
          getFriendlySupabaseMessage({
            action: "save gallery items",
            audience: "admin"
          })
        );
        return;
      }

      await writeAuditLog({
        action: editingGalleryItemId ? "edit_gallery_item" : "upload_gallery_item",
        targetType: "gallery_item",
        targetId: editingGalleryItemId ?? trimmedTitle,
        details: {
          title: trimmedTitle,
          subtitle: trimmedSubtitle,
          display_order: parsedDisplayOrder,
          is_active: galleryForm.is_active
        }
      });
      await refreshGalleryItems();
      setGallerySuccess(
        editingGalleryItemId
          ? "Gallery item updated successfully."
          : "Gallery item added successfully."
      );
      resetGalleryForm();
    } catch (error) {
      logDevelopmentError("Admin gallery submit unexpected", error);
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "save gallery items",
          audience: "admin"
        })
      );
    } finally {
      setUploadingGalleryImage(false);
      setSavingGalleryItem(false);
    }
  }

  async function handleGalleryActiveChange(id: string, isActive: boolean) {
    if (!supabase) {
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "update gallery items",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setGalleryError, "manage gallery items")) {
      return;
    }

    setGalleryError(null);
    setGallerySuccess(null);

    const { error } = await supabase
      .from("gallery_items")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      logDevelopmentError("Admin gallery status change", error, { id, isActive });
      setGalleryError(
        getFriendlySupabaseMessage({
          action: "update gallery items",
          audience: "admin"
        })
      );
      return;
    }

    const targetItem = adminGalleryItems.find((item) => item.id === id);
    await writeAuditLog({
      action: isActive ? "restore_gallery_item" : "archive_gallery_item",
      targetType: "gallery_item",
      targetId: id,
      details: {
        title: targetItem?.title ?? null
      }
    });
    await refreshGalleryItems();
    setGallerySuccess(
      isActive
        ? "Gallery item restored successfully."
        : "Gallery item archived successfully."
    );
  }

  async function handleLeadershipSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "save leadership records",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setLeadershipError, "manage leadership records")) {
      return;
    }

    const trimmedName = leadershipForm.name.trim();
    const trimmedRole = leadershipForm.role.trim();
    const trimmedBio = leadershipForm.bio.trim();
    const trimmedImageUrl = leadershipForm.image_url.trim();
    const parsedDisplayOrder = Number(leadershipForm.display_order);

    if (
      !trimmedName ||
      !trimmedRole ||
      !trimmedBio ||
      (!trimmedImageUrl && !leadershipImageFile) ||
      Number.isNaN(parsedDisplayOrder)
    ) {
      setLeadershipSuccess(null);
      setLeadershipError(
        "Name, role, bio, display order, and either an image upload or image URL are required."
      );
      return;
    }

    if (
      leadershipImageFile &&
      !["image/jpeg", "image/png", "image/webp"].includes(leadershipImageFile.type)
    ) {
      setLeadershipSuccess(null);
      setLeadershipError("Only JPG, JPEG, PNG, and WEBP images can be uploaded.");
      return;
    }

    let resolvedImageUrl = trimmedImageUrl;

    if (leadershipImageFile) {
      setUploadingLeadershipImage(true);
      const safeFileName = leadershipImageFile.name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
      const filePath = `${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(leadershipStorageBucket)
        .upload(filePath, leadershipImageFile, {
          cacheControl: "3600",
          contentType: leadershipImageFile.type,
          upsert: false
        });

      if (uploadError) {
        logDevelopmentError("Admin leadership upload", uploadError, {
          fileName: leadershipImageFile.name
        });
        setLeadershipError(
          getFriendlySupabaseMessage({
            action: "upload the leadership image",
            audience: "admin"
          })
        );
        setUploadingLeadershipImage(false);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(leadershipStorageBucket).getPublicUrl(filePath);

      resolvedImageUrl = publicUrl;
      setUploadingLeadershipImage(false);
    }

    const payload = {
      name: trimmedName,
      role: trimmedRole,
      bio: trimmedBio,
      image_url: resolvedImageUrl,
      display_order: parsedDisplayOrder,
      is_active: leadershipForm.is_active
    };

    setSavingLeadershipMember(true);
    setLeadershipError(null);
    setLeadershipSuccess(null);

    const query = editingLeadershipMemberId
      ? supabase.from("leadership").update(payload).eq("id", editingLeadershipMemberId)
      : supabase.from("leadership").insert(payload);

    const { error } = await query;

    if (error) {
      logDevelopmentError("Admin leadership submit", error, payload);
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "save leadership records",
          audience: "admin"
        })
      );
      setSavingLeadershipMember(false);
      return;
    }

    await writeAuditLog({
      action: editingLeadershipMemberId ? "edit_leadership_entry" : "upload_leadership_entry",
      targetType: "leadership",
      targetId: editingLeadershipMemberId ?? trimmedName,
      details: {
        name: trimmedName,
        role: trimmedRole,
        display_order: parsedDisplayOrder,
        is_active: leadershipForm.is_active
      }
    });
    await refreshLeadershipMembers();
    setLeadershipSuccess(
      editingLeadershipMemberId
        ? "Leadership member updated successfully."
        : "Leadership member added successfully."
    );
    setSavingLeadershipMember(false);
    resetLeadershipForm();
  }

  async function handleLeadershipActiveChange(id: string, isActive: boolean) {
    if (!supabase) {
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "update leadership records",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setLeadershipError, "manage leadership records")) {
      return;
    }

    setLeadershipError(null);
    setLeadershipSuccess(null);

    const { error } = await supabase
      .from("leadership")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      logDevelopmentError("Admin leadership status change", error, { id, isActive });
      setLeadershipError(
        getFriendlySupabaseMessage({
          action: "update leadership records",
          audience: "admin"
        })
      );
      return;
    }

    const targetMember = adminLeadershipMembers.find((member) => member.id === id);
    await writeAuditLog({
      action: isActive ? "restore_leadership_entry" : "archive_leadership_entry",
      targetType: "leadership",
      targetId: id,
      details: {
        name: targetMember?.name ?? null
      }
    });
    await refreshLeadershipMembers();
    setLeadershipSuccess(
      isActive
        ? "Leadership member restored successfully."
        : "Leadership member archived successfully."
    );
  }

  async function handleMemberResourceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "save member resources",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setMemberResourcesError, "manage member resources")) {
      return;
    }

    const trimmedTitle = memberResourceForm.title.trim();
    const trimmedDescription = memberResourceForm.description.trim();
    const trimmedCategory = memberResourceForm.category.trim();
    const trimmedFileUrl = memberResourceForm.file_url.trim();

    if (
      !trimmedTitle ||
      !trimmedDescription ||
      !trimmedCategory ||
      (!trimmedFileUrl && !memberResourceFile)
    ) {
      setMemberResourcesSuccess(null);
      setMemberResourcesError(
        "Title, description, category, and either a file upload or file URL are required."
      );
      return;
    }

    let resolvedFileUrl = trimmedFileUrl;

    if (memberResourceFile) {
      setUploadingMemberResourceFile(true);
      const safeFileName = memberResourceFile.name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
      const filePath = `${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(memberResourcesStorageBucket)
        .upload(filePath, memberResourceFile, {
          cacheControl: "3600",
          contentType: memberResourceFile.type || "application/octet-stream",
          upsert: false
        });

      if (uploadError) {
        logDevelopmentError("Admin member resource upload", uploadError, {
          fileName: memberResourceFile.name
        });
        setMemberResourcesError(
          getFriendlySupabaseMessage({
            action: "upload the resource file",
            audience: "admin"
          })
        );
        setUploadingMemberResourceFile(false);
        return;
      }

      resolvedFileUrl = filePath;
      setUploadingMemberResourceFile(false);
    }

    const payload = {
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
      file_url: resolvedFileUrl,
      is_active: memberResourceForm.is_active
    };

    setSavingMemberResource(true);
    setMemberResourcesError(null);
    setMemberResourcesSuccess(null);

    const query = editingMemberResourceId
      ? supabase.from("member_resources").update(payload).eq("id", editingMemberResourceId)
      : supabase.from("member_resources").insert(payload);

    const { error } = await query;

    if (error) {
      logDevelopmentError("Admin member resource submit", error, payload);
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "save member resources",
          audience: "admin"
        })
      );
      setSavingMemberResource(false);
      return;
    }

    await writeAuditLog({
      action: editingMemberResourceId
        ? "edit_member_resource"
        : "upload_member_resource",
      targetType: "member_resource",
      targetId: editingMemberResourceId ?? trimmedTitle,
      details: {
        title: trimmedTitle,
        category: trimmedCategory,
        is_active: memberResourceForm.is_active
      }
    });
    await refreshMemberResources();
    setMemberResourcesSuccess(
      editingMemberResourceId
        ? "Member resource updated successfully."
        : "Member resource added successfully."
    );
    setSavingMemberResource(false);
    resetMemberResourceForm();
  }

  async function handleMemberResourceActiveChange(id: string, isActive: boolean) {
    if (!supabase) {
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "update member resources",
          audience: "admin"
        })
      );
      return;
    }

    if (!requireApprovedAdmin(setMemberResourcesError, "manage member resources")) {
      return;
    }

    setMemberResourcesError(null);
    setMemberResourcesSuccess(null);

    const { error } = await supabase
      .from("member_resources")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      logDevelopmentError("Admin member resource status change", error, {
        id,
        isActive
      });
      setMemberResourcesError(
        getFriendlySupabaseMessage({
          action: "update member resources",
          audience: "admin"
        })
      );
      return;
    }

    const targetResource = adminMemberResources.find((resource) => resource.id === id);
    await writeAuditLog({
      action: isActive ? "restore_member_resource" : "archive_member_resource",
      targetType: "member_resource",
      targetId: id,
      details: {
        title: targetResource?.title ?? null
      }
    });
    await refreshMemberResources();
    setMemberResourcesSuccess(
      isActive
        ? "Member resource restored successfully."
        : "Member resource archived successfully."
    );
  }

  function resolveSiteName(siteId: string | null) {
    if (!siteId) {
      return "Unknown site";
    }

    return (
      adminSites.find((site) => site.id === siteId)?.name ??
      adminSites.find((site) => site.slug === siteId)?.name ??
      fallbackSites.find((site) => site.slug === siteId)?.name ??
      siteId
    );
  }

  function canDemoteAdmin(member: AdminProfile) {
    return !(member.id === session.id && member.role === "admin" && adminCount === 1);
  }

  function renderUserCards(items: AdminProfile[], statusKey: ProfileStatus) {
    if (!profilesLoading && items.length === 0) {
      return (
        <StatusMessage
          message={`No ${statusKey} users right now.`}
          tone="info"
        />
      );
    }

    return (
      <div className="space-y-4">
        {items.map((member) => (
          <div key={member.id} className="rounded-3xl border border-union-slate/70 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-union-navy">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-union-steel">
                  {member.email || "No email"} • {member.phone || "No phone"}
                </p>
                <p className="text-sm text-union-steel">
                  Affiliated site: {member.affiliated_site || "Not provided"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-union-steel">
                  <p>
                    <span className="font-semibold text-union-navy">Status:</span>{" "}
                    {member.status}
                  </p>
                  <p>
                    <span className="font-semibold text-union-navy">Role:</span>{" "}
                    {member.role}
                  </p>
                  <p>
                    <span className="font-semibold text-union-navy">Created:</span>{" "}
                    {formatCreatedDate(member.created_at)}
                  </p>
                </div>
              </div>

              {statusKey === "pending" ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleStatusUpdate(member.id, "approved");
                    }}
                    disabled={updatingProfileId === member.id}
                    className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleStatusUpdate(member.id, "denied");
                    }}
                    disabled={updatingProfileId === member.id}
                    className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Deny
                  </button>
                </div>
              ) : null}

              {statusKey === "approved" ? (
                <div className="flex flex-col items-start gap-4 md:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-union-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-union-navy">
                      Role control
                    </span>
                    {member.role === "admin" ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handleRoleUpdate(member.id, "member");
                        }}
                        disabled={
                          updatingProfileId === member.id || !canDemoteAdmin(member)
                        }
                        className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Set as Member
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void handleRoleUpdate(member.id, "admin");
                        }}
                        disabled={updatingProfileId === member.id}
                        className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Promote to Admin
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleStatusUpdate(member.id, "inactive");
                    }}
                    disabled={updatingProfileId === member.id}
                    className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark Inactive
                  </button>
                </div>
              ) : null}

              {statusKey === "inactive" ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleStatusUpdate(member.id, "approved");
                    }}
                    disabled={updatingProfileId === member.id}
                    className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reactivate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleStatusUpdate(member.id, "pending");
                    }}
                    disabled={updatingProfileId === member.id}
                    className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Review
                  </button>
                </div>
              ) : null}

              {statusKey === "denied" ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleStatusUpdate(member.id, "pending");
                  }}
                  disabled={updatingProfileId === member.id}
                  className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reopen Review
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderSelectedSection() {
    switch (selectedSection) {
      case "approved-users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Approved Users
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Members and admins who currently have access to protected Local One pages.
              </p>
            </div>
            <StatusMessage message={profilesError} tone="error" />
            {profilesLoading ? (
              <StatusMessage message="Loading approved users..." tone="info" />
            ) : null}
            {renderUserCards(groupedProfiles.approved, "approved")}
          </div>
        );
      case "pending-users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Pending Users
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Applications waiting for admin review and approval.
              </p>
            </div>
            <StatusMessage message={profilesError} tone="error" />
            {profilesLoading ? (
              <StatusMessage message="Loading pending users..." tone="info" />
            ) : null}
            {renderUserCards(groupedProfiles.pending, "pending")}
          </div>
        );
      case "inactive-users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Inactive Users
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Accounts that have been deactivated without being deleted.
              </p>
            </div>
            <StatusMessage message={profilesError} tone="error" />
            {profilesLoading ? (
              <StatusMessage message="Loading inactive users..." tone="info" />
            ) : null}
            {renderUserCards(groupedProfiles.inactive, "inactive")}
          </div>
        );
      case "denied-users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Denied Users
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Applications that were denied and can be reopened for review.
              </p>
            </div>
            <StatusMessage message={profilesError} tone="error" />
            {profilesLoading ? (
              <StatusMessage message="Loading denied users..." tone="info" />
            ) : null}
            {renderUserCards(groupedProfiles.denied, "denied")}
          </div>
        );
      case "hiring-alert-signups":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Hiring Alert Signups
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Public email signups requesting hiring alerts for represented employers.
              </p>
            </div>
            <StatusMessage message={submissionsError} tone="error" />
            {submissionsLoading ? (
              <StatusMessage message="Loading hiring alert signups..." tone="info" />
            ) : null}
            {!submissionsLoading && !submissionsError && hiringAlertSignups.length === 0 ? (
              <StatusMessage message="No hiring alert signups yet." tone="info" />
            ) : null}
            {!submissionsLoading && !submissionsError && hiringAlertSignups.length > 0 ? (
              <div className="space-y-4">
                {hiringAlertSignups.map((signup) => (
                  <div
                    key={signup.id}
                    className="rounded-3xl border border-union-slate/70 p-5"
                  >
                    <p className="text-sm font-semibold text-union-navy">
                      {signup.email || "No email"}
                    </p>
                    <p className="mt-2 text-sm text-union-steel">
                      Site: {resolveSiteName(signup.site_id)}
                    </p>
                    <p className="mt-1 text-sm text-union-steel">
                      Created: {formatCreatedDate(signup.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "organizing-inquiries":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Organizing Inquiries
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Public outreach from workers and sites interested in organizing with Local One.
              </p>
            </div>
            <StatusMessage message={submissionsError} tone="error" />
            {submissionsLoading ? (
              <StatusMessage message="Loading organizing inquiries..." tone="info" />
            ) : null}
            {!submissionsLoading && !submissionsError && organizingInquiries.length === 0 ? (
              <StatusMessage message="No organizing inquiries yet." tone="info" />
            ) : null}
            {!submissionsLoading && !submissionsError && organizingInquiries.length > 0 ? (
              <div className="space-y-4">
                {organizingInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="rounded-3xl border border-union-slate/70 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-union-navy">
                          {inquiry.name || "Unnamed inquiry"}
                        </p>
                        <p className="text-sm text-union-steel">
                          {inquiry.email || "No email provided"}
                        </p>
                        <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm leading-7 text-union-steel">
                          {inquiry.site_description || "No site description provided."}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-union-steel">
                        {formatCreatedDate(inquiry.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "site-management":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Site Page Management
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Create and edit represented sites with auto-slug behavior, address parts, and coordinates.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleSiteSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Name</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.name}
                    onChange={(event) => updateSiteName(event.target.value)}
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Slug</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.slug}
                    onChange={(event) => {
                      setSiteSlugEdited(true);
                      setSiteForm((current) => ({
                        ...current,
                        slug: slugifySiteName(event.target.value)
                      }));
                    }}
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-union-steel">
                    <span>Generated automatically from the site name, but still editable.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSiteSlugEdited(false);
                        setSiteForm((current) => ({
                          ...current,
                          slug: slugifySiteName(current.name)
                        }));
                      }}
                      className="font-semibold text-union-navy transition hover:text-union-gold"
                    >
                      Reset from name
                    </button>
                  </div>
                </label>
                <label className="block">
                  <FieldLabel>Employer</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.employer}
                    onChange={(event) =>
                      setSiteForm((current) => ({
                        ...current,
                        employer: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Representative</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.representative}
                    onChange={(event) =>
                      setSiteForm((current) => ({
                        ...current,
                        representative: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="block xl:col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.address}
                    onChange={(event) =>
                      updateSiteAddressField("address", event.target.value)
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>City</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.city}
                    onChange={(event) =>
                      updateSiteAddressField("city", event.target.value)
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>State</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.state}
                    onChange={(event) =>
                      updateSiteAddressField("state", event.target.value)
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Zipcode</FieldLabel>
                  <input
                    type="text"
                    value={siteForm.zipcode}
                    onChange={(event) =>
                      updateSiteAddressField("zipcode", event.target.value)
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <StatusMessage
                message={siteAddressPreview ? `Display address: ${siteAddressPreview}` : null}
                tone="info"
              />

              <label className="block">
                <FieldLabel>Intro</FieldLabel>
                <textarea
                  rows={5}
                  value={siteForm.intro}
                  onChange={(event) =>
                    setSiteForm((current) => ({ ...current, intro: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Lat</FieldLabel>
                  <input
                    type="number"
                    step="any"
                    value={siteForm.lat}
                    onChange={(event) => {
                      setSiteGeoMessage("Manual coordinates entered. Review before saving.");
                      setSiteForm((current) => ({ ...current, lat: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Lng</FieldLabel>
                  <input
                    type="number"
                    step="any"
                    value={siteForm.lng}
                    onChange={(event) => {
                      setSiteGeoMessage("Manual coordinates entered. Review before saving.");
                      setSiteForm((current) => ({ ...current, lng: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <StatusMessage message={displayedSiteGeoMessage} tone="info" />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!siteAddressPreview || isGeocodingSite}
                  onClick={() => {
                    void geocodeSiteAddress(siteAddressPreview, "manual");
                  }}
                  className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGeocodingSite ? "Generating Coordinates..." : "Generate Coordinates"}
                </button>
                <button
                  type="submit"
                  disabled={savingSite || isGeocodingSite}
                  className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingSite
                    ? "Saving..."
                    : editingSiteId
                      ? "Save Site Changes"
                      : "Add New Site"}
                </button>
                {editingSiteId ? (
                  <button
                    type="button"
                    onClick={resetSiteForm}
                    className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-union-gold">
                New sites are saved active by default.
              </p>

              <StatusMessage message={sitesSuccess} tone="success" />
              <StatusMessage message={sitesError} tone="error" />
            </form>

            {sitesLoading ? (
              <StatusMessage message="Loading sites from Supabase..." tone="info" />
            ) : null}

            {!sitesLoading && groupedAdminSites.active.length === 0 && groupedAdminSites.archived.length === 0 ? (
              <StatusMessage
                message="No sites found in the Supabase `sites` table yet."
                tone="info"
              />
            ) : null}

            {!sitesLoading ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-union-navy">Active Sites</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-union-gold">
                      {groupedAdminSites.active.length} listed
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {groupedAdminSites.active.map((site) => (
                      <div
                        key={site.id}
                        className="rounded-3xl border border-union-slate/70 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-union-navy">
                              {site.name || "Untitled site"}
                            </p>
                            <p className="text-sm text-union-steel">
                              {site.employer || "No employer"} • {site.slug || "No slug"}
                            </p>
                            <p className="text-sm text-union-steel">
                              {composeSiteAddress(site) || "No address"}
                            </p>
                            <p className="text-sm text-union-steel">
                              Representative: {site.representative || "Not provided"}
                            </p>
                            <p className="text-sm text-union-steel">
                              Lat/Lng: {site.lat ?? "N/A"}, {site.lng ?? "N/A"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startEditingSite(site)}
                              className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleArchiveSite(site.id, true);
                              }}
                              className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-union-navy">Archived Sites</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-union-gold">
                      {groupedAdminSites.archived.length} archived
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {groupedAdminSites.archived.length === 0 ? (
                      <StatusMessage message="No archived sites right now." tone="info" />
                    ) : null}
                    {groupedAdminSites.archived.map((site) => (
                      <div
                        key={site.id}
                        className="rounded-3xl border border-union-slate/70 bg-union-mist/40 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-union-navy">
                              {site.name || "Untitled site"}
                            </p>
                            <p className="text-sm text-union-steel">
                              {site.employer || "No employer"} • {site.slug || "No slug"}
                            </p>
                            <p className="text-sm text-union-steel">
                              {composeSiteAddress(site) || "No address"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => startEditingSite(site)}
                              className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleArchiveSite(site.id, false);
                              }}
                              className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90"
                            >
                              Restore
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      case "contract-management":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Contract Management
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Add and edit public contract records tied to a represented site.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleContractSubmit}>
              <label className="block">
                <FieldLabel>Site</FieldLabel>
                <select
                  value={contractForm.site_id}
                  onChange={(event) =>
                    setContractForm((current) => ({
                      ...current,
                      site_id: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                >
                  <option value="">Select a site</option>
                  {groupedAdminSites.active.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name || site.slug || site.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Title</FieldLabel>
                  <input
                    type="text"
                    value={contractForm.title}
                    onChange={(event) =>
                      setContractForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>File URL</FieldLabel>
                  <input
                    type="url"
                    value={contractForm.file_url}
                    onChange={(event) =>
                      setContractForm((current) => ({
                        ...current,
                        file_url: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Upload PDF</FieldLabel>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    setContractsSuccess(null);
                    setContractsError(null);
                    setContractPdfFile(event.target.files?.[0] ?? null);
                  }}
                  className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm text-union-steel outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-union-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-union-navy focus:border-union-gold"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Effective Date</FieldLabel>
                  <input
                    type="date"
                    value={contractForm.effective_date}
                    onChange={(event) =>
                      setContractForm((current) => ({
                        ...current,
                        effective_date: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Expiration Date</FieldLabel>
                  <input
                    type="date"
                    value={contractForm.expiration_date}
                    onChange={(event) =>
                      setContractForm((current) => ({
                        ...current,
                        expiration_date: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingContract || uploadingContractFile}
                  className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingContractFile
                    ? "Uploading PDF..."
                    : savingContract
                      ? "Saving..."
                      : editingContractId
                        ? "Save Contract Changes"
                        : "Add Contract"}
                </button>
                {editingContractId ? (
                  <button
                    type="button"
                    onClick={resetContractForm}
                    className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <StatusMessage message={contractsSuccess} tone="success" />
              <StatusMessage message={contractsError} tone="error" />
            </form>

            {contractsLoading ? (
              <StatusMessage message="Loading contract records..." tone="info" />
            ) : null}
            {!contractsLoading && adminContracts.length === 0 ? (
              <StatusMessage message="No contract records are in Supabase yet." tone="info" />
            ) : null}
            {!contractsLoading && adminContracts.length > 0 ? (
              <div className="space-y-3">
                {adminContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="rounded-3xl border border-union-slate/70 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-union-navy">
                          {contract.title || "Untitled contract"}
                        </p>
                        <p className="text-sm text-union-steel">
                          Site: {resolveSiteName(contract.site_id)}
                        </p>
                        <a
                          href={contract.file_url || "#"}
                          className="text-sm font-semibold text-union-navy underline-offset-4 hover:text-union-gold hover:underline"
                        >
                          {contract.file_url || "No file URL"}
                        </a>
                        <p className="text-sm text-union-steel">
                          Effective: {contract.effective_date || "N/A"} • Expires:{" "}
                          {contract.expiration_date || "N/A"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditingContract(contract)}
                        className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                      >
                        Edit Contract
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "gallery-management":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Gallery Management
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Upload, reorder, edit, and archive public gallery items.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleGallerySubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Title</FieldLabel>
                  <input
                    type="text"
                    value={galleryForm.title}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, title: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Display Order</FieldLabel>
                  <input
                    type="number"
                    value={galleryForm.display_order}
                    onChange={(event) =>
                      setGalleryForm((current) => ({
                        ...current,
                        display_order: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Subtitle</FieldLabel>
                <textarea
                  rows={4}
                  value={galleryForm.subtitle}
                  onChange={(event) =>
                    setGalleryForm((current) => ({
                      ...current,
                      subtitle: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <label className="block">
                <FieldLabel>Image URL</FieldLabel>
                <input
                  type="url"
                  value={galleryForm.image_url}
                  onChange={(event) =>
                    setGalleryForm((current) => ({
                      ...current,
                      image_url: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <label className="block">
                <FieldLabel>Upload Image</FieldLabel>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    setGallerySuccess(null);
                    setGalleryError(null);
                    setGalleryImageFile(event.target.files?.[0] ?? null);
                  }}
                  className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm text-union-steel outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-union-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-union-navy focus:border-union-gold"
                />
              </label>

              <label className="inline-flex items-center gap-3 rounded-2xl bg-union-mist px-4 py-3 text-sm font-medium text-union-navy">
                <input
                  type="checkbox"
                  checked={galleryForm.is_active}
                  onChange={(event) =>
                    setGalleryForm((current) => ({
                      ...current,
                      is_active: event.target.checked
                    }))
                  }
                  className="h-4 w-4 rounded border-union-slate text-union-navy focus:ring-union-gold"
                />
                Active on public gallery
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={uploadingGalleryImage}
                  className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingGalleryImage
                    ? "Uploading Image..."
                    : savingGalleryItem
                      ? "Saving..."
                      : editingGalleryItemId
                        ? "Save Gallery Changes"
                        : "Add Gallery Item"}
                </button>
                {editingGalleryItemId ? (
                  <button
                    type="button"
                    onClick={resetGalleryForm}
                    className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <StatusMessage message={gallerySuccess} tone="success" />
              <StatusMessage message={galleryError} tone="error" />
            </form>

            {galleryLoading ? (
              <StatusMessage message="Loading gallery items..." tone="info" />
            ) : null}
            {!galleryLoading && adminGalleryItems.length === 0 ? (
              <StatusMessage message="No gallery items are in Supabase yet." tone="info" />
            ) : null}
            {!galleryLoading && adminGalleryItems.length > 0 ? (
              <div className="space-y-3">
                {adminGalleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-union-slate/70 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-union-navy">
                          {item.title || "Untitled gallery item"}
                        </p>
                        <p className="text-sm text-union-steel">
                          Order: {item.display_order ?? 0} • Status:{" "}
                          {item.is_active ? "active" : "archived"}
                        </p>
                        <p className="text-sm text-union-steel">
                          {item.subtitle || "No subtitle provided"}
                        </p>
                        <a
                          href={item.image_url || "#"}
                          className="text-sm font-semibold text-union-navy underline-offset-4 hover:text-union-gold hover:underline"
                        >
                          {item.image_url || "No image URL"}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingGalleryItem(item)}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleGalleryActiveChange(item.id, !(item.is_active ?? true));
                          }}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          {item.is_active ? "Archive" : "Restore"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "leadership-management":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Leadership Management
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Add, edit, and archive public leadership profiles.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleLeadershipSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Name</FieldLabel>
                  <input
                    type="text"
                    value={leadershipForm.name}
                    onChange={(event) =>
                      setLeadershipForm((current) => ({
                        ...current,
                        name: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Role</FieldLabel>
                  <input
                    type="text"
                    value={leadershipForm.role}
                    onChange={(event) =>
                      setLeadershipForm((current) => ({
                        ...current,
                        role: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Bio</FieldLabel>
                <textarea
                  rows={5}
                  value={leadershipForm.bio}
                  onChange={(event) =>
                    setLeadershipForm((current) => ({
                      ...current,
                      bio: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Image URL</FieldLabel>
                  <input
                    type="url"
                    value={leadershipForm.image_url}
                    onChange={(event) =>
                      setLeadershipForm((current) => ({
                        ...current,
                        image_url: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Display Order</FieldLabel>
                  <input
                    type="number"
                    value={leadershipForm.display_order}
                    onChange={(event) =>
                      setLeadershipForm((current) => ({
                        ...current,
                        display_order: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Upload Profile Image</FieldLabel>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    setLeadershipSuccess(null);
                    setLeadershipError(null);
                    setLeadershipImageFile(event.target.files?.[0] ?? null);
                  }}
                  className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm text-union-steel outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-union-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-union-navy focus:border-union-gold"
                />
              </label>

              <label className="inline-flex items-center gap-3 rounded-2xl bg-union-mist px-4 py-3 text-sm font-medium text-union-navy">
                <input
                  type="checkbox"
                  checked={leadershipForm.is_active}
                  onChange={(event) =>
                    setLeadershipForm((current) => ({
                      ...current,
                      is_active: event.target.checked
                    }))
                  }
                  className="h-4 w-4 rounded border-union-slate text-union-navy focus:ring-union-gold"
                />
                Active on public leadership page
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingLeadershipMember || uploadingLeadershipImage}
                  className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingLeadershipImage
                    ? "Uploading Image..."
                    : savingLeadershipMember
                      ? "Saving..."
                      : editingLeadershipMemberId
                        ? "Save Leadership Changes"
                        : "Add Leadership Member"}
                </button>
                {editingLeadershipMemberId ? (
                  <button
                    type="button"
                    onClick={resetLeadershipForm}
                    className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <StatusMessage message={leadershipSuccess} tone="success" />
              <StatusMessage message={leadershipError} tone="error" />
            </form>

            {leadershipLoading ? (
              <StatusMessage message="Loading leadership members..." tone="info" />
            ) : null}
            {!leadershipLoading && adminLeadershipMembers.length === 0 ? (
              <StatusMessage
                message="No leadership members are in Supabase yet."
                tone="info"
              />
            ) : null}
            {!leadershipLoading && adminLeadershipMembers.length > 0 ? (
              <div className="space-y-3">
                {adminLeadershipMembers.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-3xl border border-union-slate/70 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-union-navy">
                          {member.name || "Unnamed leader"}
                        </p>
                        <p className="text-sm text-union-steel">
                          Role: {member.role || "No role"} • Order:{" "}
                          {member.display_order ?? 0} • Status:{" "}
                          {member.is_active ? "active" : "archived"}
                        </p>
                        <p className="text-sm text-union-steel">
                          {member.bio || "No bio provided"}
                        </p>
                        <a
                          href={member.image_url || "#"}
                          className="text-sm font-semibold text-union-navy underline-offset-4 hover:text-union-gold hover:underline"
                        >
                          {member.image_url || "No image URL"}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingLeadershipMember(member)}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleLeadershipActiveChange(
                              member.id,
                              !(member.is_active ?? true)
                            );
                          }}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          {member.is_active ? "Archive" : "Restore"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      case "member-resource-management":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                Member Resource Management
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                Manage the private resources shown inside the approved member portal.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handleMemberResourceSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Title</FieldLabel>
                  <input
                    type="text"
                    value={memberResourceForm.title}
                    onChange={(event) =>
                      setMemberResourceForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Category</FieldLabel>
                  <input
                    type="text"
                    value={memberResourceForm.category}
                    onChange={(event) =>
                      setMemberResourceForm((current) => ({
                        ...current,
                        category: event.target.value
                      }))
                    }
                    className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                  />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  rows={4}
                  value={memberResourceForm.description}
                  onChange={(event) =>
                    setMemberResourceForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <label className="block">
                <FieldLabel>File URL or Stored Path</FieldLabel>
                <input
                  type="text"
                  value={memberResourceForm.file_url}
                  onChange={(event) =>
                    setMemberResourceForm((current) => ({
                      ...current,
                      file_url: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
                />
              </label>

              <label className="block">
                <FieldLabel>Upload File</FieldLabel>
                <input
                  type="file"
                  onChange={(event) => {
                    setMemberResourcesSuccess(null);
                    setMemberResourcesError(null);
                    setMemberResourceFile(event.target.files?.[0] ?? null);
                  }}
                  className="w-full rounded-2xl border border-union-slate bg-white px-4 py-3 text-sm text-union-steel outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-union-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-union-navy focus:border-union-gold"
                />
              </label>

              <label className="inline-flex items-center gap-3 rounded-2xl bg-union-mist px-4 py-3 text-sm font-medium text-union-navy">
                <input
                  type="checkbox"
                  checked={memberResourceForm.is_active}
                  onChange={(event) =>
                    setMemberResourceForm((current) => ({
                      ...current,
                      is_active: event.target.checked
                    }))
                  }
                  className="h-4 w-4 rounded border-union-slate text-union-navy focus:ring-union-gold"
                />
                Active in member portal
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingMemberResource || uploadingMemberResourceFile}
                  className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingMemberResourceFile
                    ? "Uploading File..."
                    : savingMemberResource
                      ? "Saving..."
                      : editingMemberResourceId
                        ? "Save Resource Changes"
                        : "Add Member Resource"}
                </button>
                {editingMemberResourceId ? (
                  <button
                    type="button"
                    onClick={resetMemberResourceForm}
                    className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <StatusMessage message={memberResourcesSuccess} tone="success" />
              <StatusMessage message={memberResourcesError} tone="error" />
            </form>

            {memberResourcesLoading ? (
              <StatusMessage message="Loading member resources..." tone="info" />
            ) : null}
            {!memberResourcesLoading && adminMemberResources.length === 0 ? (
              <StatusMessage
                message="No member resources are in Supabase yet."
                tone="info"
              />
            ) : null}
            {!memberResourcesLoading && adminMemberResources.length > 0 ? (
              <div className="space-y-3">
                {adminMemberResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-3xl border border-union-slate/70 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-union-navy">
                          {resource.title || "Untitled resource"}
                        </p>
                        <p className="text-sm text-union-steel">
                          Category: {resource.category || "Uncategorized"} • Status:{" "}
                          {resource.is_active ? "active" : "archived"}
                        </p>
                        <p className="text-sm text-union-steel">
                          {resource.description || "No description provided"}
                        </p>
                        <p className="text-sm font-medium text-union-navy">
                          {resource.file_url || "No file path"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingMemberResource(resource)}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleMemberResourceActiveChange(
                              resource.id,
                              !(resource.is_active ?? true)
                            );
                          }}
                          className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                        >
                          {resource.is_active ? "Archive" : "Restore"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-union-navy">
                {sectionLabels[selectedSection]}
              </h2>
              <p className="mt-2 text-sm text-union-steel">
                This section is available in the Local One admin workflow.
              </p>
            </div>
            <StatusMessage
              message="This section layout is active, and its content remains connected to the existing Supabase-backed workflows."
              tone="info"
            />
            <div className="grid gap-4">
              <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
                Seed leadership fallback entries: {leaders.length}
              </p>
              <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
                Seed gallery fallback entries: {galleryItems.length}
              </p>
              <p className="rounded-2xl bg-union-mist px-4 py-3 text-sm text-union-steel">
                News posts: {newsItems.length}
              </p>
            </div>
          </div>
        );
    }
  }

  if (session.role !== "admin" || session.status !== "approved") {
    return (
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Approved admin access is required to review member applications, manage
          public forms, maintain site pages, contracts, leadership information,
          gallery content, and private member resources.
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
              Admin Console
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-union-navy">
              Manage Local One
            </h1>
            <p className="mt-3 text-sm leading-7 text-union-steel">
              Navigate by section to review member activity, manage content, and
              update public-facing union information without a long scrolling dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/audit-logs"
              className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-union-navy/90"
            >
              View Audit Logs
            </Link>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionMenuButton
          active={selectedSection === "approved-users"}
          label="Approved Users"
          description="Manage approved member and admin accounts."
          onClick={() => setSelectedSection("approved-users")}
        />
        <SectionMenuButton
          active={selectedSection === "pending-users"}
          label="Pending Users"
          description="Review account requests waiting for approval."
          badgeCount={groupedProfiles.pending.length}
          onClick={() => setSelectedSection("pending-users")}
        />
        <SectionMenuButton
          active={selectedSection === "inactive-users"}
          label="Inactive Users"
          description="Restore or review accounts that have been deactivated."
          onClick={() => setSelectedSection("inactive-users")}
        />
        <SectionMenuButton
          active={selectedSection === "denied-users"}
          label="Denied Users"
          description="Reopen denied applications when needed."
          onClick={() => setSelectedSection("denied-users")}
        />
        <SectionMenuButton
          active={selectedSection === "site-management"}
          label="Site Page Management"
          description="Create, edit, archive, and geocode represented sites."
          onClick={() => setSelectedSection("site-management")}
        />
        <SectionMenuButton
          active={selectedSection === "hiring-alert-signups"}
          label="Hiring Alert Signups"
          description="Review public hiring alert requests by site."
          onClick={() => setSelectedSection("hiring-alert-signups")}
        />
        <SectionMenuButton
          active={selectedSection === "organizing-inquiries"}
          label="Organizing Inquiries"
          description="Read outreach from workers interested in organizing."
          onClick={() => setSelectedSection("organizing-inquiries")}
        />
        <SectionMenuButton
          active={selectedSection === "contract-management"}
          label="Contract Management"
          description="Upload and maintain public contract records."
          onClick={() => setSelectedSection("contract-management")}
        />
        <SectionMenuButton
          active={selectedSection === "gallery-management"}
          label="Gallery Management"
          description="Manage public gallery highlights and ordering."
          onClick={() => setSelectedSection("gallery-management")}
        />
        <SectionMenuButton
          active={selectedSection === "leadership-management"}
          label="Leadership Management"
          description="Maintain active leadership profiles and images."
          onClick={() => setSelectedSection("leadership-management")}
        />
        <SectionMenuButton
          active={selectedSection === "member-resource-management"}
          label="Member Resource Management"
          description="Manage the private resources shown in the member portal."
          onClick={() => setSelectedSection("member-resource-management")}
        />
      </div>

      <div className="card-panel p-6 sm:p-8">{renderSelectedSection()}</div>
    </div>
  );
}
