"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GalleryItem } from "@/lib/data";

type GalleryShowcaseProps = {
  items: GalleryItem[];
};

export function GalleryShowcase({ items }: GalleryShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? 0 : (current - 1 + items.length) % items.length
        );
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? 0 : (current + 1) % items.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const currentIndex = activeIndex ?? 0;

  function showPrevious() {
    setActiveIndex((current) =>
      current === null ? 0 : (current - 1 + items.length) % items.length
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === null ? 0 : (current + 1) % items.length
    );
  }

  return (
    <>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="card-panel group relative overflow-hidden text-left"
          >
            <div className="relative h-72 w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/90 via-[#102A43]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/82">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#081522]/80 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-union-navy shadow"
              aria-label="Close gallery modal"
            >
              Close
            </button>

            <div className="grid max-h-[90vh] md:grid-cols-[minmax(0,1fr),320px]">
              <div className="relative min-h-[320px] bg-union-navy sm:min-h-[440px]">
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 70vw"
                  priority
                />
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-xl font-semibold text-union-navy shadow transition hover:bg-white"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-xl font-semibold text-union-navy shadow transition hover:bg-white"
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>

              <div className="flex flex-col justify-between bg-union-mist p-6 sm:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-union-gold">
                    Gallery Highlight
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold text-union-navy">
                    {activeItem.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-union-steel">
                    {activeItem.subtitle}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="rounded-full border border-union-slate bg-white px-4 py-3 text-sm font-semibold text-union-navy transition hover:border-union-gold"
                  >
                    Previous
                  </button>
                  <p className="text-sm font-medium text-union-steel">
                    {currentIndex + 1} / {items.length}
                  </p>
                  <button
                    type="button"
                    onClick={showNext}
                    className="rounded-full bg-union-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173a5b]"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
