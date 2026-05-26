"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

type Slide = {
  image: string;
  title: string;
  subtitle: string;
};

export function HomeHeroCarousel({
  slides,
  children,
  minimal = false
}: {
  slides: Slide[];
  children?: ReactNode;
  minimal?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-union-navy shadow-[0_25px_80px_rgba(7,21,34,0.45)]">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-end p-4 sm:p-6">
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={clsx(
                "h-2.5 rounded-full transition",
                activeIndex === index ? "w-8 bg-union-gold" : "w-2.5 bg-white/50"
              )}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div
        className={clsx(
          "relative",
          minimal ? "h-[580px] sm:h-[720px]" : "h-[420px] sm:h-[520px]"
        )}
      >
        <Image
          src={activeSlide.image}
          alt={activeSlide.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div
          className={clsx(
            "absolute inset-0",
            minimal
              ? "bg-[linear-gradient(180deg,rgba(8,21,34,0.30)_0%,rgba(8,21,34,0.52)_42%,rgba(8,21,34,0.88)_100%)]"
              : "bg-[linear-gradient(180deg,rgba(8,21,34,0.15)_0%,rgba(8,21,34,0.45)_45%,rgba(8,21,34,0.92)_100%)]"
          )}
        />
        {children ? (
          <div className="absolute inset-0 z-10">{children}</div>
        ) : null}
        {!minimal ? (
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="max-w-xl rounded-[1.75rem] border border-white/10 bg-[#081522]/72 p-6 text-white backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-union-gold">
                {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                {activeSlide.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                {activeSlide.subtitle}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3 sm:pl-4">
        <button
          type="button"
          onClick={() =>
            setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
          }
          className={clsx(
            "flex items-center justify-center rounded-full border border-white/15 bg-white/88 text-xl font-semibold text-union-navy shadow-lg transition hover:bg-white",
            minimal ? "h-12 w-12" : "h-11 w-11"
          )}
          aria-label="Previous slide"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 sm:pr-4">
        <button
          type="button"
          onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
          className={clsx(
            "flex items-center justify-center rounded-full border border-white/15 bg-white/88 text-xl font-semibold text-union-navy shadow-lg transition hover:bg-white",
            minimal ? "h-12 w-12" : "h-11 w-11"
          )}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </div>
  );
}
