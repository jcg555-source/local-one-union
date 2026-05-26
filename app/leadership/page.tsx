import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { getPublicLeadership } from "@/lib/leadership";

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const { leaders, source, error } = await getPublicLeadership();

  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="Leadership"
        title="Meet the Local One officers leading organizing, bargaining, and member advocacy."
        copy="Leadership details are public so members, families, and represented employers know who to contact and who is responsible for day-to-day union guidance."
      />
      {source === "fallback" ? (
        <p className="mt-6 rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
          {error ?? "Fallback leadership data is being shown right now."}
        </p>
      ) : null}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {leaders.map((leader) => (
          <article key={leader.email} className="card-panel p-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-union-gold/25 bg-union-slate">
              <Image
                src={leader.image}
                alt={leader.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-union-navy">
              {leader.name}
            </h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
              {leader.title}
            </p>
            <p className="mt-4 text-sm leading-7 text-union-steel">{leader.bio}</p>
            <a
              href={`mailto:${leader.email}`}
              className="mt-5 inline-flex text-sm font-semibold text-union-navy underline-offset-4 hover:underline"
            >
              {leader.email}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
