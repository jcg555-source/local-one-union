import { OrganizeForm } from "@/components/organize-form";

export default function ContactPage() {
  return (
    <div className="container-shell py-14 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="card-panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-union-navy">
            Reach Local One
          </h1>
          <p className="mt-4 text-sm leading-7 text-union-steel">
            Public contact details help workers, employers, and community
            partners connect with the union quickly.
          </p>
          <div className="mt-8 space-y-4 text-sm text-union-steel">
            <p>
              <span className="font-semibold text-union-navy">Office:</span> 233 Irving Place 9th Floor
              New York, NY 10003
            </p>
            <p>
              <span className="font-semibold text-union-navy">Email:</span>{" "}
              info@localoneunion.org
            </p>
            <p>
              <span className="font-semibold text-union-navy">Phone:</span>{" "}
              (212) 277-8017
            </p>
          </div>
        </div>

        <div className="card-panel p-8">
          <h2 className="text-2xl font-semibold text-union-navy">
            General Contact Form
          </h2>
          <form className="mt-6 grid gap-5 md:grid-cols-2">
            <input
              type="text"
              placeholder="First name"
              className="rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            />
            <input
              type="text"
              placeholder="Last name"
              className="rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold"
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold md:col-span-2"
            />
            <textarea
              placeholder="How can Local One help?"
              rows={6}
              className="rounded-2xl border border-union-slate px-4 py-3 text-sm outline-none transition focus:border-union-gold md:col-span-2"
            />
            <button
              type="button"
              className="rounded-full bg-union-navy px-5 py-3 text-sm font-semibold text-white md:col-span-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div id="organize-with-us" className="mt-10">
        <div className="card-panel overflow-hidden p-0">
          <div className="security-panel p-8 text-white lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
              Organize With Us
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Interested in joining Local One?
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
              If your site, department, or group of workers is interested in
              organizing with Local One Security Union, send us a message. We
              welcome outreach from workers who want representation, stronger
              standards, and a real voice on the job.
            </p>
          </div>

          <div className="bg-white p-8 lg:p-10">
            <OrganizeForm />
          </div>
        </div>
      </div>
    </div>
  );
}
