import { SectionHeading } from "@/components/section-heading";
import { newsItems } from "@/lib/data";

export default function NewsPage() {
  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="News"
        title="Public announcements, bargaining updates, and training notices."
        copy="This area is open to everyone and gives Local One a professional news and announcements hub."
      />
      <div className="mt-10 space-y-6">
        {newsItems.map((item) => (
          <article key={item.slug} className="card-panel p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
                  {item.category}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-union-navy">
                  {item.title}
                </h2>
              </div>
              <p className="text-sm font-medium text-union-steel">{item.date}</p>
            </div>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-union-steel">
              {item.excerpt}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
