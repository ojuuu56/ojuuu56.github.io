import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import Overlay from "@/components/cinematic/Overlay";

const Scene = lazy(() => import("@/components/cinematic/Scene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Graphic Work" },
      {
        name: "description",
        content:
          "A cinematic scroll through selected graphic design work — halftones, covers, stamps, packaging.",
      },
      { property: "og:title", content: "Portfolio — Graphic Work" },
      {
        property: "og:description",
        content: "Selected graphic design work, presented in flight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative w-full bg-[#05080d] text-white">
      {/* Sticky 3D stage */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-[#05080d]" />}>
          <Scene />
        </Suspense>
      </div>
      {/* Scrollable overlay defines the page height */}
      <div className="relative z-10">
        <Overlay />
      </div>
    </main>
  );
}
