import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    eyebrow: "Étoile Atelier",
    title: "Above the world,\nstillness becomes a place.",
    body: "A passenger reverie at thirty-eight thousand feet.",
  },
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
          { y: 40, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              end: "bottom 30%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <nav className="pointer-events-auto fixed left-0 right-0 top-0 z-20 flex items-center justify-between px-8 py-6 mix-blend-difference">
        <span className="text-overlay text-[0.7rem] uppercase tracking-[0.4em]">Étoile · Reverie 001</span>
        <span className="text-overlay text-[0.7rem] uppercase tracking-[0.4em]">Scroll to begin</span>
      </nav>

      {sections.map((s, i) => (
        <section
          key={i}
          className="chapter relative flex h-screen w-full items-end px-8 pb-24 md:px-16 md:pb-32"
        >
          <div className="max-w-2xl">
            <p className="reveal text-overlay mb-6 text-[0.7rem] uppercase tracking-[0.45em]">
              {s.eyebrow}
            </p>
            <h2 className="reveal text-overlay font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl whitespace-pre-line">
              {s.title}
            </h2>
            <p className="reveal text-overlay/80 mt-6 text-base md:text-lg font-light tracking-wide">
              {s.body}
            </p>
            {i === sections.length - 1 && (
              <button className="reveal pointer-events-auto mt-10 inline-flex items-center gap-3 border border-white/40 bg-white/5 px-8 py-4 text-[0.7rem] uppercase tracking-[0.4em] text-white backdrop-blur-sm transition hover:bg-white/15">
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
