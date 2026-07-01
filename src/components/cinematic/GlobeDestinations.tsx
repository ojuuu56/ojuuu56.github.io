import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import earthGlobe from "@/assets/earth-globe.jpg";

gsap.registerPlugin(ScrollTrigger);

// Positioned as % offsets from globe center (approximate real geo layout)
// x = horizontal (-50..+50 = left..right of globe), y = vertical (- up / + down)
const CITIES: { name: string; x: number; y: number }[] = [
  { name: "Kathmandu",   x:  6,  y: -14 },
  { name: "Pokhara",     x:  2,  y: -13 },
  { name: "Lumbini",     x:  0,  y: -10 },
  { name: "Bhairahawa",  x:  1,  y:  -9 },
  { name: "Bhadrapur",   x: 14,  y: -12 },
  { name: "Biratnagar",  x: 12,  y: -10 },
  { name: "Janakpur",    x:  8,  y: -10 },
  { name: "Bharatpur",   x:  4,  y: -11 },
  { name: "Dhangadhi",   x: -8,  y:  -9 },
  { name: "Nepalgunj",   x: -5,  y:  -9 },
  { name: "Tumlingtar",  x: 11,  y: -13 },
  { name: "Kolkata",     x: 15,  y:  -3 },
];

export default function GlobeDestinations() {
  const wrap = useRef<HTMLDivElement>(null);
  const globe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrap.current) return;
    const ctx = gsap.context(() => {
      // Slow perpetual rotation-light of the globe (via background shift + subtle rotate)
      gsap.to(globe.current, {
        rotate: 360,
        duration: 120,
        ease: "none",
        repeat: -1,
      });

      // Scroll-triggered entrance: globe scales in, then dots + labels stagger in
      gsap.fromTo(
        globe.current,
        { scale: 0.75, opacity: 0, filter: "blur(20px)" },
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        ".globe-city",
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.8)",
          stagger: 0.08,
          delay: 0.8,
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        ".globe-heading > *",
        { y: 30, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.4,
          scrollTrigger: {
            trigger: wrap.current,
            start: "top 70%",
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
      <div className="relative grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* Text */}
        <div className="globe-heading relative">
          <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-black/70 via-black/50 to-black/10 backdrop-blur-md" />
          <p className="mb-4 text-[0.6rem] uppercase tracking-[0.45em] text-amber-100/90 sm:text-[0.7rem]">
            Destinations
          </p>
          <h2 className="mb-6 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            From the Terai to the <span className="italic">Top of the World.</span>
          </h2>
          <p className="mb-6 max-w-md text-sm font-light leading-relaxed text-white/80">
            Twelve cities across Nepal and India, connected daily by Nepal's most trusted
            domestic fleet — from the plains of the Terai to the shadow of Everest.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {CITIES.map((c) => (
              <div
                key={c.name}
                className="border-b border-white/15 pb-1.5 font-serif text-sm text-white/85 sm:text-base"
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Globe */}
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.25),transparent_65%)] blur-2xl" />

          {/* Rotating earth image */}
          <div
            ref={globe}
            className="absolute inset-0 rounded-full bg-cover bg-center shadow-[0_0_120px_-10px_rgba(59,130,246,0.35)] ring-1 ring-white/10"
            style={{ backgroundImage: `url(${earthGlobe})` }}
          />

          {/* Atmosphere rim (counter-rotating light) */}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-sky-300/20" />
          <div
            className="pointer-events-none absolute -inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 55%)",
            }}
          />

          {/* City pins layer — NOT rotated, sits on top */}
          <div className="pointer-events-none absolute inset-0">
            {CITIES.map((c, i) => (
              <div
                key={c.name}
                className="globe-city absolute"
                style={{
                  left: `calc(50% + ${c.x}%)`,
                  top: `calc(50% + ${c.y}%)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/70 blur-[3px]" />
                  <span
                    className="relative block h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,224,71,0.9)]"
                    style={{ animation: `pulse-city 2.4s ${i * 0.15}s ease-in-out infinite` }}
                  />
                  <span className="ml-2 mt-1 hidden text-[0.6rem] uppercase tracking-[0.2em] text-white/85 sm:inline-block">
                    {c.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-city {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.6); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
