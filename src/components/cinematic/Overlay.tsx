import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Hero (first viewport) intentionally has NO text — just the window.
// Chapters begin after the camera has passed through the glass.
const sections = [
  {
    eyebrow: "Chapter I",
    title: "Through the glass.",
    body: "The cabin dissolves. Light folds around you.",
  },
  {
    eyebrow: "Chapter II",
    title: "A choreography of clouds.",
    body: "Volumes drift past with patient gravity.",
  },
  {
    eyebrow: "Chapter III",
    title: "Crossings.",
    body: "Other travelers, other altitudes — silent companions.",
  },
  {
    eyebrow: "Arrival",
    title: "The horizon, kept.",
    body: "Reserve your seat by the window.",
  },
];

export default function Overlay() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".chapter").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".reveal"),
          { y: 50, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.14,
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "bottom 30%",
              toggleActions: "play reverse play reverse",
            },
          },
        );

        // Subtle parallax lift of the text card as the section scrolls through
        gsap.fromTo(
          el.querySelector(".chapter-card"),
          { y: 60 },
          {
            y: -60,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Hero spacer — pure window, no UI on first screen */}
      <section className="h-screen w-full" aria-hidden />

      {sections.map((s, i) => (
        <section
          key={i}
          className="chapter relative flex h-screen w-full items-end px-6 pb-20 md:px-16 md:pb-28"
        >
          <div className="chapter-card relative max-w-xl">
            {/* Soft frosted slate so text never blends with clouds */}
            <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-black/60 via-black/40 to-black/10 backdrop-blur-md md:-inset-8" />
            <p className="reveal mb-5 text-[0.65rem] uppercase tracking-[0.5em] text-amber-100/90">
              {s.eyebrow}
            </p>
            <h2 className="reveal font-serif text-4xl leading-[1.02] tracking-tight text-white md:text-6xl whitespace-pre-line drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
              {s.title}
            </h2>
            <p className="reveal mt-5 max-w-md text-sm font-light tracking-wide text-white/85 md:text-base">
              {s.body}
            </p>
            {i === sections.length - 1 && (
              <button className="reveal pointer-events-auto mt-9 inline-flex items-center gap-3 border border-white/50 bg-white/10 px-8 py-4 text-[0.7rem] uppercase tracking-[0.4em] text-white backdrop-blur-md transition hover:bg-white/20">
                Reserve a window seat
                <span aria-hidden>→</span>
              </button>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
