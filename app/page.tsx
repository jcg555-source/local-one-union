import { BrandLockup } from "@/components/brand-lockup";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomePortalCallout } from "@/components/home-portal-callout";
import type { Route } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { leaders, newsItems, sites } from "@/lib/data";

export default function HomePage() {
  const homepageCards: Array<{
    href: Route;
    label: string;
    value: number;
  }> = [
    {
      href: "/sites-map",
      label: "Public Sites",
      value: sites.length
    },
    {
      href: "/leadership",
      label: "Leadership",
      value: leaders.length
    },
    {
      href: "/news",
      label: "News Updates",
      value: newsItems.length
    }
  ];

  const heroSlides = [
    {
      image: "/gallery/Local1basketball.jpeg",
      title: "Community-first union power built around real people.",
      subtitle:
        "Local One protects jobs, builds leadership, and keeps represented officers connected across every shift."
    },
    {
      image: "/gallery/night-out.svg",
      title: "A stronger public presence for a serious security organization.",
      subtitle:
        "Public contracts, site pages, and leadership access make Local One visible and credible to members, families, and employers."
    },
    {
      image: "/gallery/training-workshop.svg",
      title: "Training, standards, and solidarity are part of the mission.",
      subtitle:
        "This site reinforces professional identity while keeping internal resources protected for approved members."
    }
  ];

  return (
    <div>
      <section className="section-band pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="container-shell relative z-10 py-8 sm:py-12">
          <HomeHeroCarousel slides={heroSlides} minimal>
            <div className="flex h-full flex-col justify-between p-6 sm:p-10 lg:p-14">
              <div className="flex justify-start">
                <div className="union-badge border-white/20 bg-white/12 text-white backdrop-blur-sm">
                  Security Officers. Strong Contracts. Higher Standards.
                </div>
              </div>

              <div className="max-w-4xl space-y-7 pb-6 sm:pb-10">
                <BrandLockup inverted />
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">
                 You Protect People, We Protect You.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/80">
                  Local One stands with security officers through public contract
                  visibility, organized representation, and protected member access.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/sites-map"
                    className="rounded-full bg-union-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-union-navy shadow-lg shadow-black/20 transition hover:translate-y-[-1px]"
                  >
                    Explore Sites Map
                  </Link>
                </div>
              </div>
            </div>
          </HomeHeroCarousel>
        </div>
      </section>

      <section className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {homepageCards.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="card-panel gold-ring group block cursor-pointer p-6 transition duration-200 hover:-translate-y-1 hover:border-union-gold/50 hover:shadow-[0_20px_45px_rgba(16,42,67,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-union-gold focus-visible:ring-offset-2"
                aria-label={`Go to ${item.label}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-union-gold">
                  {item.label}
                </p>
                <p className="mt-3 text-4xl font-semibold text-union-navy">
                  {item.value}
                </p>
                <p className="mt-3 text-sm font-medium text-union-steel transition group-hover:text-union-navy">
                  Explore section
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <div className="security-panel mesh-pattern overflow-hidden rounded-[2rem] border border-white/8 p-8 text-white lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
                  Built For Public Trust
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-union-navy">
                  A union website that feels grounded in security work, not
                  generic corporate marketing.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Every represented site has a public page and contract access.",
                  "Leadership information is visible and easy to contact.",
                  "Internal member resources stay behind login and approval."
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 text-md leading-7 text-union-steel backdrop-blur-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <div className="card-panel gold-ring grid gap-6 p-8 lg:grid-cols-[1fr,auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
                Join Our Union
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-union-navy">
                Organizing a site or group of workers?
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-union-steel">
                Local One welcomes outreach from workers interested in organizing,
                union representation, and building stronger workplace standards.
              </p>
            </div>
            <Link
              href="/contact#organize-with-us"
              className="rounded-full bg-union-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:translate-y-[-1px]"
            >
              Organize With Us
            </Link>
          </div>
        </div>
      </section>

      <section className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <HomePortalCallout />
        </div>
      </section>

      <section className="section-band pt-0">
        <div className="container-shell relative z-10">
        <SectionHeading
          eyebrow="Latest News"
          title="Announcements that reflect the union’s day-to-day work."
          copy="The public news feed gives Local One a central place to share bargaining updates, training opportunities, leadership announcements, and community activity."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {newsItems.map((item) => (
            <article
              key={item.slug}
              className="card-panel gold-ring relative overflow-hidden p-6"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-union-gold" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
                {item.category}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-union-navy">
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-medium text-union-steel">
                {item.date}
              </p>
              <p className="mt-4 text-sm leading-7 text-union-steel">
                {item.excerpt}
              </p>
            </article>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
