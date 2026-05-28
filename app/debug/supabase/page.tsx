import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type DebugSiteRow = {
  id: string | null;
  slug: string | null;
  visibility: string | null;
  is_active: boolean | null;
  archived: boolean | null;
  lat: number | null;
  lng: number | null;
};

export default async function SupabaseDebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabaseUrl = Boolean(supabaseUrl);
  const hasSupabaseAnonKey = Boolean(supabaseAnonKey);

  let siteCount = 0;
  let siteError: string | null = null;
  let sampleSites: DebugSiteRow[] = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data, error } = await supabase
      .from("sites")
      .select("id, slug, visibility, is_active, archived, lat, lng")
      .order("slug", { ascending: true });

    if (error) {
      siteError = error.message;
    } else {
      const rows = (data as DebugSiteRow[] | null) ?? [];
      siteCount = rows.length;
      sampleSites = rows.slice(0, 3);
    }
  } else {
    siteError = "Supabase environment variables are missing.";
  }

  return (
    <div className="container-shell py-14 sm:py-20">
      <div className="card-panel p-8">
        <h1 className="text-3xl font-semibold text-union-navy">
          Supabase Debug
        </h1>
        <p className="mt-3 text-sm leading-7 text-union-steel">
          Temporary production debug page for validating live Supabase site
          access.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-union-mist p-4">
            <dt className="text-sm font-semibold text-union-navy">
              `NEXT_PUBLIC_SUPABASE_URL` present
            </dt>
            <dd className="mt-2 text-sm text-union-steel">
              {hasSupabaseUrl ? "Yes" : "No"}
            </dd>
          </div>
          <div className="rounded-2xl bg-union-mist p-4">
            <dt className="text-sm font-semibold text-union-navy">
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` present
            </dt>
            <dd className="mt-2 text-sm text-union-steel">
              {hasSupabaseAnonKey ? "Yes" : "No"}
            </dd>
          </div>
          <div className="rounded-2xl bg-union-mist p-4">
            <dt className="text-sm font-semibold text-union-navy">
              Sites returned
            </dt>
            <dd className="mt-2 text-sm text-union-steel">{siteCount}</dd>
          </div>
          <div className="rounded-2xl bg-union-mist p-4">
            <dt className="text-sm font-semibold text-union-navy">
              Supabase error
            </dt>
            <dd className="mt-2 text-sm text-union-steel">
              {siteError ?? "None"}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-union-navy">
            First 3 site rows
          </h2>
          {sampleSites.length === 0 ? (
            <p className="mt-3 text-sm text-union-steel">
              No site rows available to display.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-union-slate/70 text-left text-sm">
                <thead className="bg-union-mist text-union-navy">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Slug</th>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Visibility</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold">Archived</th>
                    <th className="px-4 py-3 font-semibold">Lat</th>
                    <th className="px-4 py-3 font-semibold">Lng</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleSites.map((site, index) => (
                    <tr
                      key={`${site.id ?? "site"}-${index}`}
                      className="bg-white text-union-steel"
                    >
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.slug ?? "null"}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.id ?? "null"}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.visibility ?? "null"}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.is_active === null ? "null" : String(site.is_active)}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.archived === null ? "null" : String(site.archived)}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.lat === null ? "null" : site.lat}
                      </td>
                      <td className="border-t border-union-slate/70 px-4 py-3">
                        {site.lng === null ? "null" : site.lng}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
