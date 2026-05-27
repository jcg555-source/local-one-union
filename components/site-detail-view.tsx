import { NotifyForm } from "@/components/notify-form";
import { Site } from "@/lib/data";

type SiteDetailViewProps = {
  site: Site;
  error?: string;
  showHiringAlertForm: boolean;
  hiringAlertMessage?: string;
};

export function SiteDetailView({
  site,
  error,
  showHiringAlertForm,
  hiringAlertMessage
}: SiteDetailViewProps) {
  return (
    <div className="container-shell py-14 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <div className="card-panel p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
              Site Page
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-union-navy">
              {site.name}
            </h1>
            {error ? (
              <p className="mt-4 rounded-2xl border border-union-slate/70 bg-union-mist px-4 py-3 text-sm text-union-steel">
                {error}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-7 text-union-steel">
              {site.intro}
            </p>
          </div>

          <div className="card-panel p-8">
            <h2 className="text-2xl font-semibold text-union-navy">
              {site.visibility === "public" ? "Public Site Information" : "Site Information"}
            </h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-union-navy">Employer</dt>
                <dd className="mt-2 text-sm leading-7 text-union-steel">
                  {site.employer}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-union-navy">
                  Address / Location
                </dt>
                <dd className="mt-2 text-sm leading-7 text-union-steel">
                  {site.address}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-union-navy">
                  Site Representative
                </dt>
                <dd className="mt-2 text-sm leading-7 text-union-steel">
                  {site.representative}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-union-navy">
                  Representative Contact
                </dt>
                <dd className="mt-2 text-sm leading-7 text-union-steel">
                  <a
                    href={`mailto:${site.representativeEmail}`}
                    className="font-semibold text-union-navy underline-offset-4 hover:underline"
                  >
                    {site.representativeEmail}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-6 rounded-3xl bg-union-mist/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
                Public Contract
              </p>
              <p className="mt-3 text-lg font-semibold text-union-navy">
                {site.contractTitle || `${site.name} Contract`}
              </p>
              {site.contractEffectiveDate || site.contractExpirationDate ? (
                <p className="mt-2 text-sm text-union-steel">
                  {site.contractEffectiveDate
                    ? `Effective: ${site.contractEffectiveDate}`
                    : "Effective date unavailable"}
                  {site.contractExpirationDate
                    ? ` • Expires: ${site.contractExpirationDate}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.contractPath}
                className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
              >
                View Contract PDF
              </a>
              <a
                href={site.contractPath}
                download
                className="rounded-full border border-union-slate px-5 py-3 text-sm font-semibold text-union-navy"
              >
                Download Contract
              </a>
            </div>
          </div>
        </div>

        {showHiringAlertForm ? (
          <NotifyForm siteId={site.id ?? null} siteName={site.name} />
        ) : (
          <div className="card-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
              Hiring Alerts
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-union-navy">
              Notify me when this employer is hiring
            </h3>
            <p className="mt-3 text-sm leading-7 text-union-steel">
              {hiringAlertMessage ??
                "Hiring alerts are unavailable for this site right now."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
