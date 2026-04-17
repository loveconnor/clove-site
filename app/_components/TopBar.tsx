import Link from "next/link";

import { CloveMark } from "./CloveMark";
import { LiveTime } from "./LiveTime";
import { StartBriefButton } from "./StartBriefButton";

export function TopBar() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-6 py-5 md:px-12 md:py-6">
        <Link
          href="/"
          aria-label="clove — home"
          className="reveal-fade group inline-flex items-center gap-1 font-display text-[18px] font-medium leading-none tracking-[-0.025em] text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          style={{ ["--delay" as string]: "0ms" }}
        >
          <CloveMark
            className="h-[1.15em] w-[1.15em] text-foreground/85 transition-colors duration-500 group-hover:text-foreground"
          />
          <span>clove</span>
        </Link>

        <div
          className="reveal-fade hidden items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted md:flex"
          style={{ ["--delay" as string]: "140ms" }}
        >
          <span className="text-foreground/55">Columbus, OH</span>
          <LiveTime />
        </div>

        <StartBriefButton />
      </div>
    </header>
  );
}
