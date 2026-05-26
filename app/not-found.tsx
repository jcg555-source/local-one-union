import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell py-24">
      <div className="card-panel mx-auto max-w-2xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
          Not Found
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-union-navy">
          That page could not be located.
        </h1>
        <p className="mt-4 text-sm leading-7 text-union-steel">
          Try returning to the public site map or homepage.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
