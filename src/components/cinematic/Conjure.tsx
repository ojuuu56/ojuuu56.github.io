import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Search, X, Loader2 } from "lucide-react";
import { streamImage } from "@/lib/streamImage";

/**
 * A single, quiet search icon that expands into a prompt bar.
 * On submit, it streams a photoreal image from the AI gateway and
 * unfurls it with a grand 3D reveal (rotateY sweep + parallax float).
 */
export default function Conjure() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [src, setSrc] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const floatRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Subtle parallax float once an image is on stage
  useEffect(() => {
    if (!src || !imgRef.current) return;
    floatRef.current?.kill();
    floatRef.current = gsap.to(imgRef.current, {
      y: "-=10",
      rotateX: "+=1.2",
      rotateY: "-=1.2",
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      floatRef.current?.kill();
    };
  }, [src]);

  // Cursor-driven 3D tilt on the stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(stage, {
        "--rx": `${-ny * 10}deg`,
        "--ry": `${nx * 14}deg`,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onLeave = () =>
      gsap.to(stage, {
        "--rx": "0deg",
        "--ry": "0deg",
        duration: 0.9,
        ease: "power3.out",
      });
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, [src]);

  // Grand reveal when the first frame lands
  useEffect(() => {
    if (!src || !imgRef.current) return;
    gsap.fromTo(
      imgRef.current,
      { opacity: 0, rotateY: -70, z: -300, scale: 0.85, filter: "blur(24px)" },
      {
        opacity: 1,
        rotateY: 0,
        z: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.4,
        ease: "expo.out",
      },
    );
  }, [src && !final ? "partial" : "none"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = prompt.trim();
    if (!p || busy) return;
    setBusy(true);
    setErr(null);
    setSrc(null);
    setFinal(false);
    try {
      await streamImage("/api/generate-image", p, (dataUrl, isFinal) => {
        setSrc(dataUrl);
        if (isFinal) setFinal(true);
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went sideways.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center gap-10 px-6 py-24 md:px-16">
      {/* Intro whisper */}
      <div className="relative max-w-xl text-center">
        <div className="absolute -inset-8 -z-10 rounded-2xl bg-black/45 backdrop-blur-md" />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.5em] text-amber-100/80">
          Interlude · Conjure
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-[1.1] tracking-tight text-white md:text-5xl">
          Whisper a picture.<br />Watch it arrive.
        </h2>
      </div>

      {/* The search — one small icon that grows into a bar */}
      <div className="relative w-full max-w-xl">
        {!open ? (
          <button
            type="button"
            aria-label="Conjure an image"
            onClick={() => setOpen(true)}
            className="group mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur-md transition hover:scale-105 hover:border-amber-100/60 hover:bg-white/10"
          >
            <Search className="h-5 w-5 text-white/80 transition group-hover:text-amber-100" />
          </button>
        ) : (
          <form
            onSubmit={submit}
            className="relative flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-4 py-2 backdrop-blur-md"
          >
            <Search className="h-4 w-4 shrink-0 text-amber-100/80" />
            <input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="a lone monk on a snow ridge at dawn…"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 font-serif text-sm text-white placeholder:text-white/40 focus:outline-none md:text-base"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !prompt.trim()}
              className="shrink-0 rounded-full bg-amber-100/90 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-black transition hover:bg-amber-100 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Conjure"}
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setOpen(false);
                setPrompt("");
              }}
              className="shrink-0 rounded-full p-2 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}
        {err && (
          <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.3em] text-red-300/80">
            {err}
          </p>
        )}
      </div>

      {/* Stage — 3D perspective viewport for the arriving image */}
      <div
        ref={stageRef}
        className="relative w-full max-w-[520px]"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative aspect-square w-full"
          style={{
            transform:
              "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
            transformStyle: "preserve-3d",
            transition: "transform 0.1s linear",
          }}
        >
          {/* Ambient halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(255,214,160,0.28), transparent 70%)",
            }}
          />
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt={prompt || "Conjured image"}
              className={`absolute inset-0 h-full w-full rounded-sm object-cover shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-[filter] duration-700 ${
                final ? "blur-0" : "blur-md"
              }`}
              style={{ transformStyle: "preserve-3d" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-sm border border-dashed border-white/15 bg-white/[0.02]">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-white/40">
                {busy ? "conjuring…" : "empty frame"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
