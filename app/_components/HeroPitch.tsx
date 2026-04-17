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
        <span>A studio by Connor Love</span>
      </div>

      <h1
        id="clove-pitch"
        className="font-display font-light leading-[1.02] tracking-[-0.028em] text-foreground [font-size:clamp(1.85rem,min(4.2vw,6.8vh),3.75rem)] max-w-[16ch]"
      >
        <Line delay={220}>Considered</Line>
        <Line delay={300}>
          <span className="italic font-normal text-foreground/85">
            web development
          </span>
        </Line>
        <Line delay={380}>for founders who</Line>
        <Line delay={460}>
          <span className="italic font-normal text-foreground/85">sweat</span>{" "}
          the details.
        </Line>
      </h1>

      <div
        className="reveal-fade flex items-center gap-3 pt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted"
        style={{ ["--delay" as string]: "620ms" }}
      >
        <span className="pulse-dot text-emerald-400" aria-hidden />
        <span>Booking Q3 ’26 — taking on two per quarter</span>
      </div>
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
