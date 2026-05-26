export function SectionHeading({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-union-gold">
        {eyebrow}
      </p>
      <h2 className="section-title mt-4">{title}</h2>
      <p className="section-copy mt-4">{copy}</p>
    </div>
  );
}
