import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <div className="container-shell py-14 sm:py-20">
      <SectionHeading
        eyebrow="About Local One"
        title="A security union focused on trust, visibility, and practical member support."
        copy="Local One Security Union represents officers across commercial, healthcare, educational, and mixed-use worksites. Designed to make leadership information and site contracts easy to access while protecting internal member operations behind approval-based portal access."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Transparent public information",
            copy: "Every site page is open to the public and includes contract access, a location overview, and a representative contact."
          },
          {
            title: "Approval-based member access",
            copy: "Members create an account, wait for admin approval, and then access internal resources, private documents, and announcements."
          },
          {
            title: "Union operations in one place",
            copy: "Leadership profiles, gallery updates, employer sites, and public announcements can all be managed from the admin dashboard."
          }
        ].map((item) => (
          <div key={item.title} className="card-panel p-6">
            <h2 className="text-2xl font-semibold text-union-navy">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-union-steel">{item.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
