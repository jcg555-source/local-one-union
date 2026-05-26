import type { Route } from "next";

export type Site = {
  id?: string;
  slug: string;
  name: string;
  employer: string;
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  intro: string;
  representative: string;
  representativeEmail: string;
  contractPath: string;
  contractTitle?: string;
  contractEffectiveDate?: string;
  contractExpirationDate?: string;
  isActive?: boolean;
  latitude: number;
  longitude: number;
  coordinates: {
    top: string;
    left: string;
  };
};

export type Leader = {
  name: string;
  title: string;
  bio: string;
  email: string;
  image: string;
};

export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
};

export type GalleryItem = {
  title: string;
  subtitle: string;
  image: string;
};

export type NavLink = {
  href: Route;
  label: string;
};

export const sites: Site[] = [
  {
    slug: "new-york-university",
    name: "New York University",
    employer: "New York University",
    address: "7 Washington Place, New York, NY 10003",
    intro:
      "New York University officers protect a high-traffic mixed-use properties with strong community relations and visible public service 24/7.",
    representative: "David Rosado",
    representativeEmail: "newyorkuniversity@localoneunion.org",
    contractPath: "/contracts/Local-1.pdf",
    latitude: 40.7295,
    longitude: -73.9965,
    coordinates: { top: "28%", left: "64%" }
  },
  {
    slug: "manhattan-college",
    name: "Manhattan College",
    employer: "Manhattan College",
    address: "4513 Manhattan College Parkway, Bronx, NY 10471",
    intro:
      "Manhattan College officers ensure safety and security across campus, providing a visible presence and rapid response capabilities.",
    representative: "Derrick Coleman",
    representativeEmail: "manhattancollege@localoneunion.org",
    contractPath: "/contracts/manhattan-college-contract.pdf",
    latitude: 40.9008,
    longitude: -73.9029,
    coordinates: { top: "56%", left: "43%" }
  },
  {
    slug: "wagner-college",
    name: "Wagner College",
    employer: "Wagner College",
    address: "1 Campus Rd, Staten Island, NY 10301",
    intro:
      "Wagner College officers support campus safety, emergency response coordination, and community engagement initiatives.",
    representative: "Angela Ruiz",
    representativeEmail: "wagnercollege@localoneunion.org",
    contractPath: "/contracts/wagner-college-contract.pdf",
    latitude: 40.6186,
    longitude: -74.0894,
    coordinates: { top: "38%", left: "26%" }
  },
  {
    slug: "nyu-langone",
    name: "NYU Langone Health",
    employer: "NYU Langone Health",
    address: "550 First Avenue, New York, NY 10016",
    intro:
      "NYU Langone officers provide security and support services across a major medical campus, ensuring patient and staff safety.",
    representative: "John Smith",
    representativeEmail: "nyulangone@localoneunion.org",
    contractPath: "/contracts/nyu-langone-contract.pdf",
    latitude: 40.742,
    longitude: -73.9748,
    coordinates: { top: "45%", left: "60%" }
  },
  {
    slug: "nyu-brooklyn",
    name: "NYU Brooklyn",
    employer: "NYU Brooklyn",
    address: "550 First Avenue, Brooklyn, NY 11201",
    intro:
      "NYU Brooklyn officers provide security and support services across a major medical campus, ensuring patient and staff safety.",
    representative: "John Smith",
    representativeEmail: "nyubrooklyn@localoneunion.org",
    contractPath: "/contracts/nyu-brooklyn-contract.pdf",
    latitude: 40.6943,
    longitude: -73.9866,
    coordinates: { top: "45%", left: "60%" }
  },
  {
    slug: "staten-island-university-hospital",
    name: "Staten Island University Hospital",
    employer: "Staten Island University Hospital",
    address: "475 Seaview Avenue, Staten Island, NY 10305",
    intro:
      "Staten Island University Hospital officers provide comprehensive security services across a large medical campus, ensuring the safety of patients and staff.",
    representative: "Jane Doe",
    representativeEmail: "statenisland@localoneunion.org",
    contractPath: "/contracts/staten-island-university-hospital-contract.pdf",
    latitude: 40.5843,
    longitude: -74.087,
    coordinates: { top: "50%", left: "70%" }
  },
  {
    slug: "whitney-museum",
    name: "Whitney Museum",
    employer: "Whitney Museum",
    address: "99 Gansevoort St, New York, NY 10014",
    intro:
      "Whitney Museum officers provide security and support services across a major cultural institution, ensuring the safety of visitors and staff.",
    representative: "Emily Johnson",
    representativeEmail: "whitneymuseum@localoneunion.org",
    contractPath: "/contracts/whitney-museum-contract.pdf",
    latitude: 40.7396,
    longitude: -74.0089,
    coordinates: { top: "55%", left: "75%" }
  },
  {
    slug: "snug-harbor-cultural-center",
    name: "Snug Harbor Cultural Center",
    employer: "Snug Harbor Cultural Center",
    address: "1000 Richmond Terrace, Staten Island, NY 10301",
    intro:
      "Snug Harbor Cultural Center officers provide security and support services across a major cultural institution, ensuring the safety of visitors and staff.",
    representative: "Michael Brown",
    representativeEmail: "snughabor@localoneunion.org",
    contractPath: "/contracts/snug-harbor-cultural-center-contract.pdf",
    latitude: 40.6434,
    longitude: -74.1014,
    coordinates: { top: "60%", left: "80%" }
  }
];

export const leaders: Leader[] = [
  {
    name: "Mike Pidoto",
    title: "President",
    bio: "Mike leads bargaining strategy, cross-site organizing, and member advocacy with more than 18 years in security operations.",
    email: "mpidoto@localoneunion.org",
    image: "/leadership/mp.jpg"
  },
  {
    name: "Colin Campbell",
    title: "Vice President",
    bio: "Colin focuses on training pipelines, steward development, and improving communication between worksites and union leadership.",
    email: "ccampbell@localoneunion.org",
    image: "/leadership/cc.jpg"
  },
  {
    name: "Christopher Gerakoulis",
    title: "Recording Secretary",
    bio: "Christopher manages internal communications, meeting documentation, and member outreach initiatives to keep everyone informed and engaged.",
    email: "cgerakoulis@localoneunion.org",
    image: "/leadership/cg.jpg"
  },
  {
    name: "Lyndell Clarke",
    title: "Treasurer",
    bio: "Lyndell oversees the local's financial health, budget planning, and resource allocation to support member initiatives.",
    email: "lclarke@localoneunion.org",
    image: "/leadership/lc.png"
  },
  {
    name: "Anthony Barbato",
    title: "Trustee",
    bio: "Anthony focuses on member engagement, community outreach, and strengthening the union's presence in the workplace.",
    email: "abarbato@localoneunion.org",
    image: "/leadership/abb.png"
  },
  {
    name: "Vincent Pidoto",
    title: "Trustee",
    bio: "Vincent focuses on member engagement, community outreach, and strengthening the union's presence in the workplace.",
    email: "vpidoto@localoneunion.org",
    image: "/leadership/vp.jpg"
  },
  {
    name: "Jonathan Poe",
    title: "Trustee",
    bio: "Jonathan focuses on member engagement, community outreach, and strengthening the union's presence in the workplace.",
    email: "jpoe@localoneunion.org",
    image: "/leadership/jp.png"
  },
  {
    name: "Fernando Rivera",
    title: "Trustee",
    bio: "Fernando focuses on member engagement, community outreach, and strengthening the union's presence in the workplace.",
    email: "frivera@localoneunion.org",
    image: "/leadership/fr.jpg"
  },
  {
    name: "Joshua Santiago",
    title: "Trustee",
    bio: "Joshua focuses on member engagement, community outreach, and strengthening the union's presence in the workplace.",
    email: "jsantiago@localoneunion.org",
    image: "/leadership/joshua-santiago.svg"
  },
  {
    name: "Timothy Rodriguez",
    title: "Communications Manager",
    bio: "Timothy manages the local's public communications, social media presence, and member outreach campaigns to keep everyone connected and informed.",
    email: "timothy.rodriguez@localonesou.org",
    image: "/leadership/timothy-rodriguez.svg"
  }
];

export const newsItems: NewsItem[] = [
  {
    slug: "contract-visibility-launch",
    title: "Local One launches public contract library for every represented site",
    date: "May 22, 2026",
    excerpt:
      "Visitors can now review site-specific agreements, contact representatives, and track where Local One members are active across the region.",
    category: "Announcement"
  },
  {
    slug: "summer-safety-training",
    title: "Summer safety training series opens for all represented officers",
    date: "May 15, 2026",
    excerpt:
      "Upcoming workshops will cover report writing, de-escalation, emergency medical response, and client communication.",
    category: "Training"
  },
  {
    slug: "new-steward-cohort",
    title: "New steward cohort begins leadership development program",
    date: "April 30, 2026",
    excerpt:
      "The program pairs new worksite leaders with experienced mentors to strengthen day-to-day member support on every shift.",
    category: "Leadership"
  }
];

export const galleryItems: GalleryItem[] = [
  {
    title: "Local One Basketball Tournament",
    subtitle: "Union members competing in a friendly basketball tournament to promote camaraderie and wellness.",
    image: "/gallery/Local1basketball.jpeg"
  },
  {
    title: "A Night Out With Local One",
    subtitle: "Union members enjoying a night at the ballpark together.",
    image: "/gallery/night-out.png"
  },
  {
    title: "Community Outreach",
    subtitle: "Union volunteers supporting neighborhood outreach and local events.",
    image: "/gallery/community-outreach.png"
  },
  {
    title: "Training Workshop",
    subtitle: "Hands-on professional development focused on safety and readiness.",
    image: "/gallery/training-workshop.svg"
  },
  {
    title: "Annual Family Day",
    subtitle: "A day of fun and connection for members and their families.",
    image: "/gallery/annual-family-day.png"
  },
  {
    title: "Manhattan Safety Fair",
    subtitle: "A community event focused on safety resources and education.",
    image: "/gallery/manhattan-safety.jpg"
  },
  {
    title: "Langone Security & Safety Week",
    subtitle: "A week-long series of events focused on security and safety training.",
    image: "/gallery/langone-security-week.jpeg"
  }

];

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sites-map", label: "Sites Map" },
  { href: "/contact", label: "Contact" }
];

export const memberResources = [
  "Private bargaining updates and strategy memos",
  "Members-only announcements and meeting materials",
  "Internal document library and downloadable forms",
  "Profile settings and contact preference management"
];
