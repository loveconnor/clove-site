"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { BriefModal } from "./BriefModal";

export function StartBriefButton({ delay = 260 }: { delay?: number }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const updatePosition = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--flair-x", `${x}%`);
    el.style.setProperty("--flair-y", `${y}%`);
    return { x, y };
  };

  const handleEnter = (e: ReactPointerEvent<HTMLButtonElement>) => {
    updatePosition(e);
    ref.current?.style.setProperty("--flair-scale", "1");
  };

  const handleMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    updatePosition(e);
  };

  const handleLeave = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    // Bias the exit point slightly past whichever edge the cursor is closest
    // to, so the flair visibly travels out instead of collapsing in place.
    const pos = updatePosition(e);
    if (pos) {
      const { x, y } = pos;
      const ox = x > 90 ? x + 20 : x < 10 ? x - 20 : x;
      const oy = y > 90 ? y + 20 : y < 10 ? y - 20 : y;
      el.style.setProperty("--flair-x", `${ox}%`);
      el.style.setProperty("--flair-y", `${oy}%`);
    }
    el.style.setProperty("--flair-scale", "0");
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={handleEnter}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flair-button reveal-fade cursor-pointer"
        style={{ ["--delay" as string]: `${delay}ms` }}
      >
        <span aria-hidden className="flair-button__flair" />
        <span className="flair-button__label">Start a brief</span>
        <span aria-hidden className="flair-button__arrow">
          ↗
        </span>
      </button>

      <BriefModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
