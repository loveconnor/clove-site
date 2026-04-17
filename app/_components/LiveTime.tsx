"use client";

import { useSyncExternalStore } from "react";

const FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 30_000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  return FORMATTER.format(new Date()).replace(/\s/g, "");
}

function getServerSnapshot() {
  return "--:--";
}

export function LiveTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <time
      suppressHydrationWarning
      className="tabular-nums"
      aria-label="Local time in Columbus, Ohio"
    >
      {time}
    </time>
  );
}
