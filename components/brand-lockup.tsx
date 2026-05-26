import Image from "next/image";
import clsx from "clsx";

export function BrandLockup({
  compact = false,
  inverted = false
}: {
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          "flex items-center justify-center overflow-hidden rounded-2xl border",
          compact ? "h-12 w-12" : "h-20 w-20",
          inverted
            ? "border-white/20 bg-white/10"
            : "border-union-slate/80 bg-white shadow-sm"
        )}
      >
        <Image
          src="/images/local1-logo.png"
          alt="Local One Security Union logo"
          width={compact ? 40 : 68}
          height={compact ? 40 : 68}
          className="h-auto w-auto object-contain"
          priority={compact}
        />
      </div>
      <div>
        <p className={clsx("font-semibold uppercase tracking-[0.28em] text-union-gold", compact ? "text-[11px]" : "text-sm")}>
          Local One
        </p>
        <p
          className={clsx(
            "font-semibold",
            compact ? "text-base" : "text-2xl",
            inverted ? "text-white" : "text-union-navy"
          )}
        >
          Security Officers Union
        </p>
      </div>
    </div>
  );
}
