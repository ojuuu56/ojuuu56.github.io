import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealSignal } from "./reveal-signal";
import Conjure from "./Conjure";


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
import w11 from "@/assets/works/work-11.jpg.asset.json";
import w12 from "@/assets/works/work-12.jpg.asset.json";
import w13 from "@/assets/works/work-13.jpg.asset.json";
import w14 from "@/assets/works/work-14.jpg.asset.json";
import w15 from "@/assets/works/work-15.jpg.asset.json";
import w16 from "@/assets/works/work-16.jpg.asset.json";
import w17 from "@/assets/works/work-17.jpg.asset.json";
import w18 from "@/assets/works/work-18.jpg.asset.json";
import w19 from "@/assets/works/work-19.jpg.asset.json";
import w20 from "@/assets/works/work-20.jpg.asset.json";


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
  { n: "11", title: "Red Hoodie", meta: "Garment / Print", src: w11.url, align: "left" },
  { n: "12", title: "Lolita", meta: "Denim / Applique", src: w12.url, align: "right" },
  { n: "13", title: "Big Ben, Small Fox", meta: "Shirt / Airbrush", src: w13.url, align: "left" },
  { n: "14", title: "Eye Trousers", meta: "Pants / Hand-drawn", src: w14.url, align: "center" },
  { n: "15", title: "Cross Track", meta: "Jacket / Tribal", src: w15.url, align: "right" },
  { n: "16", title: "White Lace", meta: "Outerwear / Study", src: w16.url, align: "left" },
  { n: "17", title: "Trench, Navy", meta: "Illustration", src: w17.url, align: "right" },
  { n: "18", title: "Rust Bomber", meta: "Figure / Colored Pencil", src: w18.url, align: "left" },
  { n: "19", title: "Sketch, No.1", meta: "Line / Graphite", src: w19.url, align: "center" },
  { n: "20", title: "Tri-Colour Wrap", meta: "Editorial Sketch", src: w20.url, align: "right" },
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

      gsap.utils.toArray<HTMLElement>(".work").forEach((el, idx) => {
        const img = el.querySelector<HTMLElement>(".work-img");
        const mask = el.querySelector<HTMLElement>(".work-mask");
        const caption = el.querySelectorAll<HTMLElement>(".work-cap");
        const card = el.querySelector<HTMLElement>(".work-card");

        // First card waits until we're deeper in the sky so the plane
        // has time to pass through the window and the clouds settle.
        const start = idx === 0 ? "top 55%" : "top 72%";

        if (mask) {
          gsap.fromTo(
            mask,
            { scaleX: 1 },
            {
              scaleX: 0,
              duration: 1.35,
              ease: "power4.inOut",
              scrollTrigger: {
                trigger: el,
                start,
                toggleActions: "play none none reverse",
                onEnter: () => gsap.to(revealSignal, { target: 1, duration: 0.6, overwrite: true }),
                onEnterBack: () => gsap.to(revealSignal, { target: 1, duration: 0.6, overwrite: true }),
                onLeave: () => gsap.to(revealSignal, { target: 0, duration: 1.2, overwrite: true }),
                onLeaveBack: () => gsap.to(revealSignal, { target: 0, duration: 1.2, overwrite: true }),
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
              start: idx === 0 ? "top 50%" : "top 65%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Premium hover / focus: parallax tilt + glow, driven by CSS vars
        if (card) {
          const setVar = (k: string, v: string) => card.style.setProperty(k, v);
          const onMove = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, {
              "--rx": `${-ny * 8}deg`,
              "--ry": `${nx * 10}deg`,
              "--px": `${nx * 12}px`,
              "--py": `${ny * 12}px`,
              "--gx": `${(nx + 0.5) * 100}%`,
              "--gy": `${(ny + 0.5) * 100}%`,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          };
          const onLeave = () => {
            gsap.to(card, {
              "--rx": "0deg",
              "--ry": "0deg",
              "--px": "0px",
              "--py": "0px",
              "--glow": "0",
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            });
          };
          const onEnter = () => {
            setVar("--glow", "1");
          };
          const onFocus = () => setVar("--glow", "1");
          const onBlur = () => onLeave();
          card.addEventListener("pointermove", onMove);
          card.addEventListener("pointerenter", onEnter);
          card.addEventListener("pointerleave", onLeave);
          card.addEventListener("focus", onFocus);
          card.addEventListener("blur", onBlur);
        }
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

      {/* Breather · lets the plane finish gliding and clouds settle before card 01 */}
      <section className="h-[70vh] w-full" aria-hidden />

      {/* Works */}
      {works.map((w, i) => (
        <div key={w.n} className="contents">
          <section
            className={`work relative flex min-h-screen w-full items-center px-4 py-20 sm:px-6 md:px-16 ${
              w.align === "right"
                ? "justify-end"
                : w.align === "center"
                  ? "justify-center"
                  : "justify-start"
            }`}
          >
            <figure
              tabIndex={0}
              className="work-card group relative w-full max-w-[280px] outline-none sm:max-w-[340px] md:max-w-[420px]"
              style={{
                transform:
                  "perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translate3d(var(--px,0),var(--py,0),0)",
                transformStyle: "preserve-3d",
                transition: "box-shadow 0.6s ease",
              }}
            >
              {/* Ambient glow that lights up on hover/focus */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-[calc(var(--glow,0)*0.9)] blur-2xl transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(60% 50% at var(--gx,50%) var(--gy,50%), rgba(255,214,160,0.35), transparent 70%)",
                }}
              />
              <div className="relative overflow-hidden rounded-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
                <div className="relative w-full overflow-hidden bg-black">
                  <img
                    src={w.src}
                    alt={w.title}
                    className="work-img block h-auto w-full will-change-transform"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
                  {/* Specular sheen that tracks the cursor */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 mix-blend-screen opacity-[calc(var(--glow,0)*0.55)] transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(35% 30% at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.55), transparent 70%)",
                    }}
                  />
                  <div className="work-mask pointer-events-none absolute inset-0 origin-right bg-[#05080d]" />
                </div>
              </div>

              <figcaption className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="work-cap font-mono text-[0.6rem] uppercase tracking-[0.4em] text-amber-100/80">
                    Work {w.n}
                  </p>
                  <h3 className="work-cap mt-1.5 font-serif text-lg leading-tight text-white sm:text-xl md:text-2xl">
                    {w.title}
                  </h3>
                </div>
                <p className="work-cap font-mono text-[0.55rem] uppercase tracking-[0.35em] text-white/55">
                  {w.meta}
                </p>
              </figcaption>
            </figure>
          </section>
          {i === 9 && <Conjure key="conjure" />}
        </>
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
