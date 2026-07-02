import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "@/assets/buddha-logo-clean.png.asset.json";
import BookingDialog from "./BookingDialog";
import GlobeDestinations from "./GlobeDestinations";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "721K", label: "Total Flights" },
  { value: "27M", label: "Happy Passengers" },
  { value: "60%", label: "Market Share" },
  { value: "16", label: "Aircraft" },
];

const fleet = [
  {
    name: "ATR 72-500",
    spec: "Twin-turboprop · 70 seats",
    note: "The workhorse of the Himalayan skies, optimised for short STOL runways and high-altitude airfields.",
  },
  {
    name: "ATR 42-320",
    spec: "Twin-turboprop · 46 seats",
    note: "Agile regional craft used for our scenic mountain flights along the Annapurna and Everest ranges.",
  },
  {
    name: "Beechcraft 1900D",
    spec: "Twin-turboprop · 18 seats",
    note: "Pressurised, weather-tolerant — built for the most demanding corners of Nepal's geography.",
  },
];

export default function Overlay() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".chapter-slow").forEach((el) => {
        const els = el.querySelectorAll(".reveal");
        gsap.fromTo(
          els,
          { y: 60, opacity: 0, filter: "blur(14px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 2.2,
            ease: "power3.out",
            stagger: 0.42,
            scrollTrigger: {
              trigger: el,
              start: "top 40%",
              end: "bottom 30%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);


  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="relative max-w-2xl">
      <div className="absolute -inset-5 -z-10 rounded-2xl bg-gradient-to-br from-black/70 via-black/50 to-black/20 backdrop-blur-md md:-inset-8" />
      {children}
    </div>
  );

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Hero: PURE window view — no text, no logo */}
      <section className="h-screen w-full" aria-hidden />

      {/* About — slow cinematic reveal (clouds → plane → then text) */}
      <section className="chapter-slow relative flex min-h-screen w-full items-end px-5 pb-16 sm:px-8 md:px-16 md:pb-24">
        <Card>
          <img
            src={logo.url}
            alt="Buddha Air"
            className="reveal mb-6 h-10 w-auto md:h-14"
            loading="lazy"
          />
          <p className="reveal text-[0.6rem] uppercase tracking-[0.45em] text-amber-100/90 sm:text-[0.7rem]">
            Nepal · Since 1997
          </p>
          <h2 className="reveal mt-4 font-serif text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-6xl">
            Care, comfort, and safety —
            <br className="hidden sm:block" />
            <span className="italic text-amber-100/90"> above the Himalayas.</span>
          </h2>
          <p className="reveal mt-5 max-w-lg text-sm font-light leading-relaxed text-white/85 sm:text-base">
            For nearly three decades, Buddha Air has connected the valleys, plains and peaks
            of Nepal — and beyond — with the country's largest and most trusted domestic fleet.
          </p>
          <div className="reveal pt-6">
            <BookingDialog>
              <button className="pointer-events-auto inline-flex items-center gap-3 border border-white/50 bg-white/10 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white backdrop-blur-md transition hover:bg-white/20">
                Book
              </button>
            </BookingDialog>
          </div>

        </Card>
      </section>

      {/* Stats */}
      <section className="chapter-slow relative flex min-h-screen w-full items-center px-5 sm:px-8 md:px-16">
        <Card>
          <p className="reveal mb-4 text-[0.6rem] uppercase tracking-[0.45em] text-amber-100/90 sm:text-[0.7rem]">
            By the numbers
          </p>
          <h2 className="reveal mb-8 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            A scale built on trust.
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="reveal">
                <div className="font-serif text-3xl text-white sm:text-4xl md:text-5xl">{s.value}</div>
                <div className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/65 sm:text-xs">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Fleet */}
      <section className="chapter-slow relative flex min-h-screen w-full items-center px-5 py-20 sm:px-8 md:px-16">
        <Card>
          <p className="reveal mb-4 text-[0.6rem] uppercase tracking-[0.45em] text-amber-100/90 sm:text-[0.7rem]">
            The Fleet
          </p>
          <h2 className="reveal mb-8 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            Sixteen aircraft. One standard.
          </h2>
          <div className="space-y-5">
            {fleet.map((f) => (
              <div key={f.name} className="reveal border-l border-white/25 pl-5">
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <h3 className="font-serif text-xl text-white sm:text-2xl">{f.name}</h3>
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-100/70 sm:text-xs">
                    {f.spec}
                  </span>
                </div>
                <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-white/80">
                  {f.note}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Destinations — rotating globe */}
      <GlobeDestinations />

      {/* Mountain flight + CTA */}
      <section className="chapter-slow relative flex min-h-screen w-full items-end px-5 pb-16 sm:px-8 md:px-16 md:pb-24">
        <Card>
          <p className="reveal mb-4 text-[0.6rem] uppercase tracking-[0.45em] text-amber-100/90 sm:text-[0.7rem]">
            The Everest Experience
          </p>
          <h2 className="reveal font-serif text-3xl leading-[1.05] text-white sm:text-4xl md:text-6xl">
            One hour. <span className="italic">Eight thousand metres.</span>
          </h2>
          <p className="reveal mt-5 max-w-lg text-sm font-light leading-relaxed text-white/85 sm:text-base">
            Every passenger receives a window seat for our signature mountain flight —
            a sunrise pass along the Himalayan crown, ending at Everest itself.
          </p>
          <div className="reveal pt-8">
            <BookingDialog>
              <button className="pointer-events-auto inline-flex items-center gap-3 border border-white/50 bg-white/10 px-6 py-3.5 text-[0.65rem] uppercase tracking-[0.4em] text-white backdrop-blur-md transition hover:bg-white/20 sm:px-8 sm:py-4 sm:text-[0.7rem]">
                Book with Buddha Air <span aria-hidden>→</span>
              </button>
            </BookingDialog>
          </div>
          <p className="reveal mt-6 text-[0.65rem] uppercase tracking-[0.35em] text-white/45">
            Buddha Air Pvt. Ltd. · Jawalakhel, Lalitpur, Nepal · +977 98-2931-7970
          </p>
        </Card>
      </section>
    </div>
  );
}
