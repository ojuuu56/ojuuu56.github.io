import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import Overlay from "@/components/cinematic/Overlay";

const Scene = lazy(() => import("@/components/cinematic/Scene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Étoile — A reverie at altitude" },
      {
        name: "description",
        content:
          "A cinematic, scroll-driven flight through the cabin window into a luxurious sky.",
      },
      { property: "og:title", content: "Étoile — A reverie at altitude" },
      {
        property: "og:description",
        content: "A cinematic, scroll-driven flight through the cabin window.",
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
