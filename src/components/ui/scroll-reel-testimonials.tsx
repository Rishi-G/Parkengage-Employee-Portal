"use client";

import * as React from "react";

/* ----------------------------------------------------------------
 * ScrollReelTestimonials
 *
 * Counter-rotating scroll reel + per-character text rise.
 * The middle column is a real vertical list of portraits that
 * translates by one "pitch" per step; the outer columns counter-
 * rotate the opposite way. Text animates in character-by-character
 * with a stagger; the old block exits as a whole before the new
 * characters rise in sequence.
 * ---------------------------------------------------------------- */

export interface ScrollReelTestimonial {
  /** The quote text */
  quote: string;
  /** Author name shown below the quote */
  author: string;
  /** Portrait image URL for the featured tile */
  image: string;
  /** Optional alt text for the portrait */
  alt?: string;
}

export interface ScrollReelTestimonialsProps {
  /** Testimonials to cycle through (one featured tile is generated per entry) */
  testimonials: ScrollReelTestimonial[];
  /** Per-character stagger in ms (default 6) */
  charStaggerMs?: number;
  /** Extra classes for the outer container */
  className?: string;
}

/* Geometry — middle column pitch between portrait centers:
 * 3 * (cell 121.33px + gap 8px) = 388px */
const CELL = 121.33;
const GAP = 8;
const STEP = 3 * (CELL + GAP);

const EXIT_MS = 240; // old text removed / new text mounted
const SLIDE_MS = 800; // column slide duration + interaction lock

const EASE_INOUT = "cubic-bezier(0.65,0,0.35,1)";

const QUOTE_CLASSES =
  "m-0 text-lg font-medium leading-[1.3] tracking-[-0.02em] text-slate-800 dark:text-zinc-200 sm:text-[22px]";
const AUTHOR_CLASSES =
  "m-0 text-sm font-semibold leading-[1.3] text-brand dark:text-indigo-400";

const FEATURED_SHADOW =
  "0 1.008px 0.705px -0.563px rgba(0,0,0,0.18), 0 2.389px 1.672px -1.125px rgba(0,0,0,0.17), 0 4.357px 3.05px -1.688px rgba(0,0,0,0.17), 0 7.244px 5.07px -2.25px rgba(0,0,0,0.16), 0 11.698px 8.188px -2.813px rgba(0,0,0,0.15), 0 19.148px 13.404px -3.375px rgba(0,0,0,0.13), 0 32.972px 23.08px -3.938px rgba(0,0,0,0.09), 0 60px 42px -4.5px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.6)";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* Blurred placeholder cell */
function Cell() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-b from-indigo-50/10 to-white dark:from-zinc-950 dark:to-zinc-900 blur-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_2px_0_rgba(255,255,255,1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{ width: CELL, height: CELL }}
    />
  );
}

/* Featured portrait tile with desaturation + gradient sheen overlays */
function Featured({ src, alt }: { src: string; alt?: string; key?: React.Key }) {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-950 dark:ring-1 dark:ring-white/10"
      style={{ width: CELL, height: CELL, boxShadow: FEATURED_SHADOW }}
    >
      {!imgFailed && src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-slate-800 text-white font-display font-bold text-xl">
          {(alt || "PE").slice(0, 2).toUpperCase()}
        </div>
      )}
      {/* desaturate via saturation blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-white mix-blend-saturation opacity-20"
      />
      {/* diagonal gradient sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] blur-[6px] mix-blend-overlay"
        style={{
          background:
            "linear-gradient(220.99deg, rgba(108,92,255,0) 32%, rgb(108,92,255) 41%, rgb(173,177,255) 47%, rgba(130,189,237,0.57) 54%, rgba(130,189,237,0) 65%)",
        }}
      />
    </div>
  );
}

/* Per-character split. Spaces live between word spans as plain text
 * nodes so natural line-wrapping is preserved. Each char rises in
 * with an inline animation-delay; while the block is exiting, the
 * char animation is removed so in-flight rises are killed. */
function Chars({
  text,
  startIndex,
  staggerMs,
}: {
  text: string;
  startIndex: number;
  staggerMs: number;
}) {
  let idx = startIndex;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => {
        const wordSpan = (
          <span className="inline-block whitespace-nowrap" key={wi}>
            {Array.from(word).map((ch, ci) => {
              const delay = idx * staggerMs;
              idx++;
              return (
                <span
                  key={ci}
                  className="scroll-reel-char"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
         );
        if (wi < words.length - 1) idx++;
        return (
          <React.Fragment key={wi}>
            {wordSpan}
            {wi < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function ScrollReelTestimonials({
  testimonials,
  charStaggerMs = 6,
  className,
}: ScrollReelTestimonialsProps) {
  /* Navigation state vs display state are kept separate so the
   * exiting block and the entering block never render together. */
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const animating = React.useRef(false);
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = testimonials.length;

  React.useEffect(() => {
    /* Enable column transitions only after first paint so the reel
     * appears at its starting offset without a slide-in. */
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true))
    );
    return () => {
      cancelAnimationFrame(raf);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (dir: 1 | -1) => {
      if (animating.current) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      animating.current = true;

      setIndex(next);
      setExiting(true);

      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS)
      );
      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS)
      );
    },
    [index, count]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      paginate(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      paginate(-1);
    }
  };

  /* Middle column: 3 leading cells, then featured + 2 cells between
   * each testimonial, then 3 trailing cells. */
  const middleItems = React.useMemo(() => {
    const items: Array<{ type: "cell" } | { type: "featured"; i: number }> = [];
    for (let i = 0; i < 3; i++) items.push({ type: "cell" });
    testimonials.forEach((_, i) => {
      items.push({ type: "featured", i });
      if (i < count - 1) {
        items.push({ type: "cell" }, { type: "cell" });
      }
    });
    for (let i = 0; i < 3; i++) items.push({ type: "cell" });
    return items;
  }, [testimonials, count]);

  const sideCellCount = 4 + 2 * count;
  const centerIdx = (count - 1) / 2;
  const middleY = (centerIdx - index) * STEP;
  const sideY = -middleY;

  const colStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_INOUT}` : "none",
  });

  const current = testimonials[displayIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full flex-col items-stretch gap-2.5 overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-br from-indigo-50/10 to-white dark:from-zinc-900/30 dark:to-zinc-900 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:min-h-[280px] md:flex-row pb-6 md:pb-0",
        className
      )}
    >
      {/* Reel section */}
      <div
        aria-hidden="true"
        className="relative h-44 w-full shrink-0 self-stretch overflow-hidden md:h-auto md:w-[320px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {/* Left column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>

          {/* Middle column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(middleY)}
          >
            {middleItems.map((item, i) =>
              item.type === "featured" ? (
                <Featured
                  key={i}
                  src={testimonials[item.i].image}
                  alt={testimonials[item.i].alt}
                />
              ) : (
                <Cell key={i} />
              )
            )}
          </div>

          {/* Right column */}
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-6 py-6 md:py-8">
        <div className="flex flex-col gap-[9px]">
          {/* Celebrating icon overlay */}
          <div className="inline-flex">
            <span className="text-[9px] font-black tracking-widest text-brand dark:text-indigo-400 uppercase font-mono bg-brand-light dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-brand/10 dark:border-indigo-900/30">
              Happy Birthday! 🎉
            </span>
          </div>

          {/* Text stage */}
          <div
            className="relative w-full max-w-[390px] overflow-hidden"
            aria-live="polite"
          >
            {/* Invisible in-flow copy sizes the stage to the current
              * quote at any viewport width, so wrapped text never clips. */}
            <div
              aria-hidden="true"
              className="invisible flex min-h-[100px] flex-col gap-[12px]"
            >
              <p className={QUOTE_CLASSES}>{current.quote}</p>
              <p className={AUTHOR_CLASSES}>{current.author}</p>
            </div>
            <div
              key={displayIndex}
              className={cn(
                "absolute inset-x-0 top-0 flex flex-col gap-[12px] will-change-[transform,opacity]",
                exiting && "scroll-reel-exit"
              )}
            >
              <p className={QUOTE_CLASSES}>
                <Chars
                  text={current.quote}
                  startIndex={0}
                  staggerMs={charStaggerMs}
                />
              </p>
              <p className={AUTHOR_CLASSES}>
                <Chars
                  text={current.author}
                  startIndex={current.quote.length + 6}
                  staggerMs={charStaggerMs}
                />
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => paginate(-1)}
            disabled={index === 0}
            aria-label="Previous birthday record"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition-[opacity,transform] duration-200 hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.5 2.5 3.5 6l4 3.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            disabled={index === count - 1}
            aria-label="Next birthday record"
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition-[opacity,transform] duration-200 hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4.5 2.5 4 3.5-4 3.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScrollReelTestimonials;
