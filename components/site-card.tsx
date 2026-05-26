import Link from "next/link";
import { Site } from "@/lib/data";

export function SiteCard({ site }: { site: Site }) {
  return (
    <article className="card-panel flex h-full flex-col p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
        {site.employer}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-union-navy">{site.name}</h3>
      <p className="mt-3 text-sm leading-6 text-union-steel">{site.address}</p>
      <p className="mt-4 flex-1 text-sm leading-7 text-union-steel">{site.intro}</p>
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
  );
}
