export function HeroPitch() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div
        className="reveal-fade flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted"
        style={{ ["--delay" as string]: "120ms" }}
      >
        <span
          className="reveal-hairline h-px w-8 bg-foreground/30"
          style={{ ["--delay" as string]: "240ms" }}
          aria-hidden
        />
        <span>A studio by </span>
        <a
          href="https://connorlove.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          Connor Love
        </a>
      </div>

      <h1
        id="clove-pitch"
        className="font-display font-light leading-[1.02] tracking-[-0.028em] text-foreground [font-size:clamp(1.85rem,min(4.2vw,6.8vh),3.75rem)] max-w-[16ch]"
      >
        <Line delay={220}>Considered</Line>
        <Line delay={300}>
          <span className="italic font-normal text-foreground/85">
            product development
          </span>
        </Line>
        <Line delay={380}>for founders who</Line>
        <Line delay={460}>
          <span className="italic font-normal text-foreground/85">sweat</span>{" "}
          the details.
        </Line>
      </h1>

      <p
        className="reveal-fade max-w-[42ch] text-sm leading-relaxed text-foreground/68 md:text-[0.95rem]"
        style={{ ["--delay" as string]: "560ms" }}
      >
        Custom websites and platforms designed to perform, scale, and convert.
      </p>

      <p
        className="reveal-fade font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/38"
        style={{ ["--delay" as string]: "600ms" }}
      >
        For startups and product teams
      </p>
    </div>
  );
}

function Line({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <span
        className="reveal-rise block"
        style={{ ["--delay" as string]: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}
