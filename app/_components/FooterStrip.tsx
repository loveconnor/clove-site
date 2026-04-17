const SOCIALS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "X", href: "https://x.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Behance", href: "https://www.behance.net/" },
];

export function FooterStrip() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full">
      <div
        className="reveal-fade mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-6 py-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/75 md:px-12 md:py-6"
        style={{ ["--delay" as string]: "900ms" }}
      >
        <nav aria-label="Social links" className="flex items-center gap-5 md:gap-7">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <span className="tracking-[0.08em] normal-case">
          {year} Clove
        </span>
      </div>
    </footer>
  );
}
