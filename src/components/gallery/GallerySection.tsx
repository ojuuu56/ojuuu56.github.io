import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hangar from "./Hangar";
import Constellation from "./Constellation";
import RipplePond from "./RipplePond";

gsap.registerPlugin(ScrollTrigger);

export default function GallerySection() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrap.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".gal-reveal").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="relative w-full px-4 py-24 sm:px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="gal-reveal font-mono text-[0.65rem] uppercase tracking-[0.5em] text-amber-100/90">
            Interlude · The Hangar
          </p>
          <h2 className="gal-reveal mt-4 font-serif text-3xl leading-[1.05] tracking-tight text-white md:text-5xl">
            A little room to<br />wander in.
          </h2>
          <p className="gal-reveal mt-5 text-sm font-light leading-relaxed text-white/70 md:text-base">
            Six quiet pieces on the walls. Drag to walk around. Below, two small
            games — draw a constellation, or just touch the water and watch it move.
          </p>
        </header>

        <div className="gal-reveal mt-12 h-[70vh] w-full overflow-hidden rounded-sm border border-white/10 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
          <Hangar />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="gal-reveal">
            <Constellation />
          </div>
          <div className="gal-reveal">
            <RipplePond />
          </div>
        </div>
      </div>
    </section>
  );
}
