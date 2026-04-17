"use client";

import dynamic from "next/dynamic";

const LoadingSkeleton = () => (
  <div className="flex min-h-0 flex-1 items-center justify-center">
    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
      composing…
    </span>
  </div>
);

const NoiseField = dynamic(
  () => import("./variants/NoiseField").then((m) => m.NoiseField),
  { ssr: false, loading: LoadingSkeleton },
);

export function FillSlot() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NoiseField />
    </div>
  );
}
