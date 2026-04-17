"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import { CLIENTS } from "../_data/clients";

const COUNT_LABEL = CLIENTS.length.toString().padStart(2, "0");
const PREVIEW_W = 160;
const PREVIEW_H = 90;

type View = "list" | "grid";

export function WorkList() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [view, setView] = useState<View>("list");

  const positionPreview = useCallback(
    (clientX: number, clientY: number) => {
      const wrap = wrapRef.current;
      const preview = previewRef.current;
      if (!wrap || !preview) return;
      const rect = wrap.getBoundingClientRect();
      const y = clientY - rect.top;

      // Preview is pinned to the left gutter (outside the list column, in the
      // empty space next to the hero pitch) so it never covers row content.
      // Only the Y position tracks the cursor — vertically centered on the
      // hovered row, clamped so the preview stays roughly within the list's
      // vertical extent.
      const halfH = PREVIEW_H / 2;
      const maxTy = Math.max(0, rect.height - PREVIEW_H);
      const ty = Math.min(maxTy, Math.max(0, y - halfH));

      preview.style.setProperty("--ty", `${ty}px`);
    },
    [],
  );

  const handleRowEnter = (
    e: PointerEvent<HTMLAnchorElement>,
    i: number,
  ) => {
    if (e.pointerType !== "mouse") return;
    positionPreview(e.clientX, e.clientY);
    setActiveIndex(i);
  };

  const handleRowMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;
    positionPreview(e.clientX, e.clientY);
  };

  const handleRowLeave = () => setActiveIndex(null);

  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col gap-5 md:h-[400px] md:gap-6"
    >
      {/* Header */}
      <div
        className="reveal-fade flex items-baseline justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted"
        style={{ ["--delay" as string]: "300ms" }}
      >
        <h2 className="flex items-baseline gap-1.5">
          <span className="font-display text-[15px] font-normal normal-case tracking-[-0.01em] text-foreground/90 md:text-[16px]">
            All Work
          </span>
          <sup className="font-mono text-[9px] tracking-[0.18em] text-muted">
            [{COUNT_LABEL}]
          </sup>
        </h2>

        <div className="flex items-center gap-3 text-[10px]">
          <ViewToggle label="Grid" active={view === "grid"} onSelect={() => setView("grid")} />
          <span aria-hidden className="text-muted/40">|</span>
          <ViewToggle label="List" active={view === "list"} onSelect={() => setView("list")} />
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <ul className="flex min-h-0 flex-1 flex-col">
          {CLIENTS.map((client, i) => {
            const delay = 520 + i * 50;
            return (
              <li key={client.index}>
                <a
                  href={client.href}
                  onPointerEnter={(e) => handleRowEnter(e, i)}
                  onPointerMove={handleRowMove}
                  onPointerLeave={handleRowLeave}
                  className="group grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-4 border-b border-transparent py-2 font-display text-[14px] font-normal tracking-[-0.005em] text-foreground/55 transition-[color,border-color] duration-300 hover:border-foreground/45 hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground md:gap-5 md:py-2.5 md:text-[15px]"
                  style={{ ["--delay" as string]: `${delay}ms` }}
                >
                  <span
                    className="reveal-fade truncate text-foreground/90 group-hover:text-foreground"
                    style={{ ["--delay" as string]: `${delay}ms` }}
                  >
                    {client.name}
                  </span>
                  <span
                    className="reveal-fade truncate text-foreground/55 group-hover:text-foreground/85"
                    style={{ ["--delay" as string]: `${delay + 40}ms` }}
                  >
                    {client.category}
                  </span>
                  <span
                    className="reveal-fade truncate text-foreground/55 group-hover:text-foreground/85"
                    style={{ ["--delay" as string]: `${delay + 80}ms` }}
                  >
                    {client.role}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/* Grid view — rows of 2 cards; each row fills the whole grid
          viewport so only one row is visible at a time. Scroll snap
          cleanly pages between rows. */}
      {view === "grid" && (
        <ul className="work-grid flex flex-col gap-3 pr-1 md:min-h-0 md:flex-1 md:overflow-y-auto md:gap-4">
          {Array.from({ length: Math.ceil(CLIENTS.length / 2) }).map(
            (_, rowIdx) => {
              const rowClients = CLIENTS.slice(rowIdx * 2, rowIdx * 2 + 2);
              return (
                <li
                  key={rowIdx}
                  className="grid shrink-0 grid-cols-2 items-start gap-3 md:gap-4"
                >
                  {rowClients.map((client, i) => {
                    const delay = 520 + (rowIdx * 2 + i) * 40;
                    return (
                      <a
                        key={client.index}
                        href={client.href}
                        className="reveal-fade group relative block aspect-[16/10] overflow-hidden rounded-md border border-hairline bg-background"
                        style={{ ["--delay" as string]: `${delay}ms` }}
                      >
                        <div className="relative h-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={client.preview}
                            alt=""
                            decoding="async"
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.02]"
                          />
                          <div
                            aria-hidden
                            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                          />
                          <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-3 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 md:inset-x-4 md:bottom-3">
                            <span className="truncate font-display text-[14px] font-normal tracking-[-0.005em] text-foreground md:text-[15px]">
                              {client.name}
                            </span>
                            <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/70">
                              {client.role}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </li>
              );
            },
          )}
        </ul>
      )}

      {/* Cursor-following preview (list view only). Pinned to the LEFT of
          the work column so it floats in the hero's empty gutter space
          instead of covering row text. Only the Y position tracks cursor.
          Hidden on small viewports where columns stack and there is no room
          to the left. */}
      <div
        ref={previewRef}
        aria-hidden
        className="work-preview pointer-events-none absolute top-0 z-10 hidden overflow-hidden rounded-md border border-hairline bg-background shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] md:block"
        data-active={view === "list" && activeIndex !== null}
        style={{
          width: PREVIEW_W,
          height: PREVIEW_H,
          left: -(PREVIEW_W + 28),
        }}
      >
        {CLIENTS.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.index}
            src={c.preview}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out"
            style={{ opacity: activeIndex === i ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}

function ViewToggle({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] underline-offset-[5px] transition-colors duration-200 ${
        active
          ? "text-foreground underline decoration-foreground/70 decoration-1"
          : "text-muted hover:text-foreground/80"
      }`}
    >
      {label}
    </button>
  );
}
