import { BrandLockup } from "@/components/brand-lockup";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomePortalCallout } from "@/components/home-portal-callout";
import { HomeSiteAccess, HomeSiteHeroButton } from "@/components/home-site-access";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { leaders, newsItems, sites } from "@/lib/data";

export default function HomePage() {
  const publicSites = sites.filter((site) => site.visibility === "public");

  const heroSlides = [
    {
      image: "/gallery/ballpark.jpg",
      title: "Take Me Out To The Ballgame",
      subtitle: "Local One members enjoying a day at the ballpark together."
    },
    {
      image: "/gallery/mdi.jpg",
      title: "Happy Workers, Happy Union",
      subtitle:
        "This site reinforces professional identity while keeping internal resources protected for approved members."
    },
    {
      image: "/gallery/Local1basketball.jpeg",
      title: "Community-first union power built around real people.",
      subtitle:
        "Local One protects jobs, builds leadership, and keeps represented officers connected across every shift."
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
                <HomeSiteHeroButton />
              </div>
            </div>
          </HomeHeroCarousel>
        </div>
      </section>

      <section className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <HomeSiteAccess
            leadersCount={leaders.length}
            newsCount={newsItems.length}
            publicSitesCount={publicSites.length}
            totalSitesCount={sites.length}
          />
        </div>
      </section>

      <section id="public-sites" className="section-band pt-0 pb-10 sm:pb-12">
        <div className="container-shell relative z-10">
          <SectionHeading
            eyebrow="Public Site Pages"
            title="Two represented sites remain publicly visible."
            copy="Public visitors can review these site pages and contracts without opening the full member-only sites map."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {publicSites.map((site) => (
              <article key={site.slug} className="card-panel flex h-full flex-col p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
                  {site.employer}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-union-navy">
                  {site.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-union-steel">{site.address}</p>
                <p className="mt-4 flex-1 text-sm leading-7 text-union-steel">
                  {site.intro}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/sites/${site.slug}`}
                    className="rounded-full bg-union-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173a5b]"
                  >
                    View Site Page
                  </Link>
                  <a
                    href={site.contractPath}
                    className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    View Contract
                  </a>
                </div>
              </article>
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
