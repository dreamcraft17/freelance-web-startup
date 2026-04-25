"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroScenarioSlide = {
  imageSrc: string;
  overlay: string;
};

type HeroScenarioSliderProps = {
  slides: HeroScenarioSlide[];
  ariaLabel: string;
};

const AUTOPLAY_MS = 5500;

export function HeroScenarioSlider({ slides, ariaLabel }: HeroScenarioSliderProps) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const total = slides.length;
  const current = useMemo(() => slides[index] ?? slides[0], [slides, index]);

  useEffect(() => {
    if (hovered || total <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [hovered, total]);

  if (!current) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[5/4] w-full">
        <Image
          key={current.imageSrc}
          src={current.imageSrc}
          alt={current.overlay}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 34rem, (min-width: 768px) 42rem, 100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
        <p className="absolute bottom-4 left-4 right-4 rounded-lg bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white">
          {current.overlay}
        </p>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white transition hover:bg-slate-950/75"
            onClick={() => setIndex((prev) => (prev - 1 + total) % total)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-950/55 text-white transition hover:bg-slate-950/75"
            onClick={() => setIndex((prev) => (prev + 1) % total)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.imageSrc}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={`h-2.5 rounded-full transition ${
                  dotIndex === index ? "w-5 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
