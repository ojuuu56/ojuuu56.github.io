import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import earthGlobe from "@/assets/earth-globe.jpg";

gsap.registerPlugin(ScrollTrigger);

const CITIES: string[] = [
  "Kathmandu", "Pokhara", "Lumbini", "Bhairahawa",
  "Bhadrapur", "Biratnagar", "Janakpur", "Bharatpur",
  "Dhangadhi", "Nepalgunj", "Tumlingtar", "Kolkata",
];

export default function GlobeDestinations() {
  const wrap = useRef<HTMLDivElement>(null);
  const globe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrap.current) return;
    const ctx = gsap.context(() => {
      gsap.to(globe.current, {
        rotate: 360,
        duration: 180,
        ease: "none",
        repeat: -1,
      });

      gsap.fromTo(
        globe.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 65%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        ".globe-heading > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.18,
          delay: 0.3,
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 65%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrap}
      className="chapter relative flex min-h-screen w-full items-center justify-center px-5 py-20 sm:px-8 md:px-16"
    >
      <div className="relative grid w-full max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="globe-heading relative">
          <p className="mb-4 text-[0.6rem] uppercase tracking-[0.45em] text-white/60 sm:text-[0.7rem]">
            Destinations
          </p>
          <h2 className="mb-6 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            From the Terai to the <span className="italic">Top of the World.</span>
          </h2>
          <p className="mb-8 max-w-md text-sm font-light leading-relaxed text-white/70">
            Twelve cities across Nepal and India, connected daily by Nepal's most trusted
            domestic fleet.
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {CITIES.map((c) => (
              <div
                key={c}
                className="font-serif text-sm text-white/80 sm:text-base"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div
            ref={globe}
            className="absolute inset-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${earthGlobe})` }}
          />
        </div>
      </div>
    </section>
  );
}
