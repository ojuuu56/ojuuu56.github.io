import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealSignal } from "./reveal-signal";


import w1 from "@/assets/works/work-1.jpg.asset.json";
import w2 from "@/assets/works/work-2.jpg.asset.json";
import w3 from "@/assets/works/work-3.jpg.asset.json";
import w4 from "@/assets/works/work-4.jpg.asset.json";
import w5 from "@/assets/works/work-5.jpg.asset.json";
import w6 from "@/assets/works/work-6.jpg.asset.json";
import w7 from "@/assets/works/work-7.jpg.asset.json";
import w8 from "@/assets/works/work-8.jpg.asset.json";
import w9 from "@/assets/works/work-9.jpg.asset.json";
import w10 from "@/assets/works/work-10.jpg.asset.json";

gsap.registerPlugin(ScrollTrigger);

type Work = {
  n: string;
  title: string;
  meta: string;
  src: string;
  align: "left" | "right" | "center";
};

const works: Work[] = [
  { n: "01", title: "Pink Static", meta: "Halftone / Portrait", src: w1.url, align: "left" },
  { n: "02", title: "Stamp for RD", meta: "Tribute / Print", src: w2.url, align: "right" },
  { n: "03", title: "Twenty", meta: "Type over Photo", src: w3.url, align: "left" },
  { n: "04", title: "Two, in blue", meta: "Cover Art", src: w4.url, align: "right" },
  { n: "05", title: "Windows", meta: "Diptych / 35mm", src: w5.url, align: "center" },
  { n: "06", title: "Moonlit", meta: "Render / Study", src: w6.url, align: "left" },
  { n: "07", title: "Red Room", meta: "Grain / Collage", src: w7.url, align: "right" },
  { n: "08", title: "Scream in Violet", meta: "Halftone / Poster", src: w8.url, align: "left" },
  { n: "09", title: "Flashbulb", meta: "Editorial", src: w9.url, align: "right" },
  { n: "10", title: "Sweet Supari", meta: "Packaging Riff", src: w10.url, align: "center" },
];

export default function Overlay() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".intro-reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, filter: "blur(12px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            delay: i * 0.08,
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".work").forEach((el) => {
        const img = el.querySelector<HTMLElement>(".work-img");
        const mask = el.querySelector<HTMLElement>(".work-mask");
        const caption = el.querySelectorAll<HTMLElement>(".work-cap");

        if (mask) {
          gsap.fromTo(
            mask,
            { scaleX: 1 },
            {
              scaleX: 0,
              duration: 1.2,
              ease: "power4.inOut",
              scrollTrigger: {
                trigger: el,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -8, scale: 1.15 },
            {
              yPercent: 8,
              scale: 1.05,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        gsap.fromTo(
          caption,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".outro-reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: { trigger: el, start: "top 80%" },
          },
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* 1 · Silent window — hero */}
      <section className="h-screen w-full" aria-hidden />

      {/* 2–6 · Passing through the glass + settling into clouds */}
      <section className="h-screen w-full" aria-hidden />
      <section className="h-screen w-full" aria-hidden />
      <section className="h-screen w-full" aria-hidden />
      <section className="h-screen w-full" aria-hidden />
      <section className="h-screen w-full" aria-hidden />

      {/* 7 · Intro — arrives once we're in the sky */}
      <section className="relative flex min-h-screen w-full items-center px-6 md:px-16">
        <div className="relative max-w-2xl">
          <div className="absolute -inset-8 -z-10 rounded-2xl bg-black/45 backdrop-blur-md" />
          <p className="intro-reveal font-mono text-[0.65rem] uppercase tracking-[0.5em] text-amber-100/90">
            Hi — a quick hello at 35,000 ft
          </p>
          <h1 className="intro-reveal mt-5 font-serif text-4xl leading-[1.05] tracking-tight text-white md:text-6xl">
            I'm Ojash.
          </h1>
          <p className="intro-reveal mt-6 max-w-xl text-base font-light leading-relaxed text-white/85 md:text-lg">
            I work as a creative director. I make art, and I try to build things
            that hold some value for the people around me.
          </p>
          <p className="intro-reveal mt-4 max-w-xl text-sm font-light leading-relaxed text-white/60">
            Keep scrolling — the plane keeps flying, and the work drifts past
            the window.
          </p>
        </div>
      </section>

      {/* Works */}
      {works.map((w) => (
        <section
          key={w.n}
          className={`work relative flex min-h-screen w-full items-center px-6 py-24 md:px-16 ${
            w.align === "right"
              ? "justify-end"
              : w.align === "center"
                ? "justify-center"
                : "justify-start"
          }`}
        >
          <figure className="relative w-full max-w-[300px] md:max-w-[340px]">
            <div className="relative overflow-hidden rounded-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <img
                  src={w.src}
                  alt={w.title}
                  className="work-img absolute inset-0 h-full w-full object-cover will-change-transform"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
                <div className="work-mask pointer-events-none absolute inset-0 origin-right bg-[#05080d]" />
              </div>
            </div>

            <figcaption className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="work-cap font-mono text-[0.6rem] uppercase tracking-[0.4em] text-amber-100/80">
                  Work {w.n}
                </p>
                <h3 className="work-cap mt-1.5 font-serif text-xl leading-tight text-white md:text-2xl">
                  {w.title}
                </h3>
              </div>
              <p className="work-cap font-mono text-[0.55rem] uppercase tracking-[0.35em] text-white/55">
                {w.meta}
              </p>
            </figcaption>
          </figure>
        </section>
      ))}

      {/* Outro */}
      <section className="relative flex min-h-screen w-full items-center px-6 md:px-16">
        <div className="relative max-w-2xl">
          <div className="absolute -inset-8 -z-10 rounded-2xl bg-black/50 backdrop-blur-md" />
          <p className="outro-reveal font-mono text-[0.65rem] uppercase tracking-[0.5em] text-amber-100/90">
            End of reel
          </p>
          <h2 className="outro-reveal mt-5 font-serif text-3xl leading-[1.05] tracking-tight text-white md:text-5xl">
            Want to make something<br />together?
          </h2>
          <a
            href="mailto:hello@ojash.art"
            className="outro-reveal pointer-events-auto mt-8 inline-flex items-center gap-3 border border-white/50 bg-white/10 px-7 py-3.5 text-[0.65rem] uppercase tracking-[0.4em] text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Say hello
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
