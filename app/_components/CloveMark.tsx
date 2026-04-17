type CloveMarkProps = {
  className?: string;
  title?: string;
};

export function CloveMark({ className, title }: CloveMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <g
        transform="translate(60, 60)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M 5 -5 Q 22 -2 38 -5 A 33 33 0 0 0 5 -38 Q 2 -22 5 -5 Z" />
        <path d="M 5 5 Q 22 2 38 5 A 33 33 0 0 1 5 38 Q 2 22 5 5 Z" />
        <path d="M -5 5 Q -22 2 -38 5 A 33 33 0 0 0 -5 38 Q -2 22 -5 5 Z" />
        <path d="M -5 -5 Q -22 -2 -38 -5 A 33 33 0 0 1 -5 -38 Q -2 -22 -5 -5 Z" />
      </g>
    </svg>
  );
}
