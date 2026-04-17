"use client";

import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

type ProjectType = {
  id: string;
  title: string;
  description: string;
};

type BudgetOption = {
  id: string;
  label: string;
  hint: string;
};

const PROJECT_TYPES: ProjectType[] = [
  {
    id: "landing",
    title: "Landing Page",
    description:
      "High-impact, single-page sites built to convert for product launches, waitlists, or specific campaigns.",
  },
  {
    id: "marketing",
    title: "Marketing Site",
    description:
      "Multi-page websites designed to clearly explain your product, build brand trust, and capture leads.",
  },
  {
    id: "webapp",
    title: "Web App / Platform",
    description:
      "Custom software, SaaS interfaces, user dashboards, and interactive digital products.",
  },
  {
    id: "portfolio",
    title: "Portfolio / Editorial",
    description:
      "Highly visual, interaction-heavy sites to showcase case studies, creative work, or digital lookbooks.",
  },
  {
    id: "retainer",
    title: "Retained Partnership",
    description:
      "Ongoing, fractional design and development for continuous iteration and scaling teams.",
  },
  {
    id: "other",
    title: "Other",
    description:
      "Something else. Tell us more on the final step.",
  },
];

const BUDGETS_BY_PROJECT: Record<string, BudgetOption[]> = {
  landing: [
    { id: "landing-tier-1", label: "$2,500 — $4,000", hint: "Standard waitlist or launch page" },
    { id: "landing-tier-2", label: "$4,000 — $7,000", hint: "Interactive & animation-heavy" },
    { id: "landing-tier-3", label: "$7,000 — $10,000", hint: "Complex integrations or multi-variant" },
    { id: "landing-tier-4", label: "$10,000+", hint: "Bespoke 3D / WebGL experiences" },
  ],
  
  marketing: [
    { id: "marketing-tier-1", label: "$5,000 — $8,000", hint: "Essential pages (1-4 pages)" },
    { id: "marketing-tier-2", label: "$8,000 — $15,000", hint: "CMS-driven & fully scalable" },
    { id: "marketing-tier-3", label: "$15,000 — $25,000", hint: "Large-scale / bespoke interactions" },
    { id: "marketing-tier-4", label: "$25,000+", hint: "Enterprise architecture / multi-region" },
  ],
  
  webapp: [
    { id: "webapp-tier-1", label: "$10,000 — $15,000", hint: "Core MVP & foundational UX" },
    { id: "webapp-tier-2", label: "$15,000 — $30,000", hint: "Complex logic & custom dashboards" },
    { id: "webapp-tier-3", label: "$30,000 — $50,000", hint: "Enterprise scale / heavy API architecture" },
    { id: "webapp-tier-4", label: "$50,000+", hint: "Multi-quarter engagement & rollout" },
  ],
  
  portfolio: [
    { id: "portfolio-tier-1", label: "$3,000 — $6,000", hint: "Clean, minimalist gallery" },
    { id: "portfolio-tier-2", label: "$6,000 — $10,000", hint: "Award-winning interactions" },
    { id: "portfolio-tier-3", label: "$10,000 — $15,000", hint: "Immersive editorial platform" },
    { id: "portfolio-tier-4", label: "$15,000+", hint: "Highly experimental / WebGL focused" },
  ],

  retainer: [
    { id: "retainer-tier-1", label: "$1,500 — $3,000 / mo", hint: "Maintenance & iterative improvements" },
    { id: "retainer-tier-2", label: "$3,000 — $5,000 / mo", hint: "Dedicated feature sprints" },
    { id: "retainer-tier-3", label: "$5,000 — $8,000 / mo", hint: "Fractional engineering support" },
    { id: "retainer-tier-4", label: "$8,000+ / mo", hint: "Half-time embedded technical partner" },
  ],
  
  other: [
    { id: "other-tier-1", label: "$2,500 — $5,000", hint: "Small scoped engagement" },
    { id: "other-tier-2", label: "$5,000 — $10,000", hint: "Standard bespoke project" },
    { id: "other-tier-3", label: "$10,000 — $20,000", hint: "Advanced custom requirements" },
    { id: "other-tier-4", label: "$20,000+", hint: "Extensive platform architecture" },
  ],
};

const ALL_BUDGETS = Object.values(BUDGETS_BY_PROJECT).flat();

type Step = 0 | 1 | 2;

type FormData = {
  name: string;
  company: string;
  email: string;
  location: string;
  material: string;
  description: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  company: "",
  email: "",
  location: "",
  material: "",
  description: "",
};

const STEP_TITLES: Array<{ eyebrow: string; head: string; italic: string }> = [
  { eyebrow: "01 · Project", head: "Hey there…", italic: "what will we build?" },
  { eyebrow: "02 · Budget", head: "How much is", italic: "your budget?" },
  { eyebrow: "03 · Details", head: "A few more", italic: "details." },
];

export function BriefModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [projectType, setProjectType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(-1);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setDirection(1);
    setProjectType(null);
    setBudget(null);
    setForm(EMPTY_FORM);
    setSubmitted(false);
    setSending(false);
    setSubmitError(null);
    setFocusIdx(-1);
  }, []);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  // Lock scroll + keyboard handlers while open.
  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      style.overflow = prevOverflow;
      previousFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, close]);

  // Reset after close transition settles.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => reset(), 420);
    return () => window.clearTimeout(t);
  }, [open, reset]);

  // ---- Open / close panel animation ----
  useLayoutEffect(() => {
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    if (!scrim || !panel) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set([scrim, panel], { pointerEvents: "auto" });
        gsap.fromTo(
          scrim,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.38, ease: "power2.out" },
        );
        gsap.fromTo(
          panel,
          { y: 36, scale: 0.985, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.75,
            ease: "power3.out",
            onComplete: () => {
              panel.focus({ preventScroll: true });
            },
          },
        );
      } else {
        gsap.to(panel, {
          y: 18,
          scale: 0.99,
          autoAlpha: 0,
          duration: 0.32,
          ease: "power2.in",
        });
        gsap.to(scrim, {
          autoAlpha: 0,
          duration: 0.28,
          ease: "power2.in",
          onComplete: () => {
            gsap.set([scrim, panel], { pointerEvents: "none" });
          },
        });
      }
    });

    return () => ctx.revert();
  }, [open]);

  // ---- Step transition animation (GSAP slide + stagger) ----
  useLayoutEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const rows = stage.querySelectorAll("[data-stagger]");

      gsap.set(stage, { x: direction * 48, autoAlpha: 0 });
      gsap.set(rows, { y: 22, autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(stage, {
        x: 0,
        autoAlpha: 1,
        duration: 0.72,
      });
      tl.to(
        rows,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.055,
        },
        "-=0.5",
      );
    }, stageRef);

    return () => ctx.revert();
  }, [step, direction, open, submitted]);

  // ---- Progress bar animation ----
  // Step 1 → 1/3, Step 2 → 2/3, Step 3 → 3/3 (submitted also → 3/3).
  useLayoutEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;

    if (!open) {
      // Snap back to 0 while hidden so the next open animates from empty.
      gsap.set(bar, { scaleX: 0 });
      return;
    }

    const pct = submitted ? 1 : (step + 1) / STEP_TITLES.length;
    gsap.to(bar, {
      scaleX: pct,
      duration: 1.05,
      ease: "power2.inOut",
      delay: 0.12,
      overwrite: "auto",
    });
  }, [step, submitted, open]);

  // ---- Keyboard: arrow keys + number shortcuts on option steps ----
  useEffect(() => {
    if (!open || submitted || step === 2) return;
    const budgetOptions = projectType
      ? (BUDGETS_BY_PROJECT[projectType] ?? BUDGETS_BY_PROJECT.other)
      : BUDGETS_BY_PROJECT.other;
    const options = step === 0 ? PROJECT_TYPES : budgetOptions;

    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing inside inputs.
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => (i < 0 ? 0 : (i + 1) % options.length));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) =>
          i < 0 ? options.length - 1 : (i - 1 + options.length) % options.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusIdx < 0) return;
        const sel = options[focusIdx];
        if (!sel) return;
        if (step === 0) handleSelectType(sel.id);
        else handleSelectBudget(sel.id);
      } else if (/^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < options.length) {
          e.preventDefault();
          setFocusIdx(n);
          const sel = options[n];
          if (step === 0) handleSelectType(sel.id);
          else handleSelectBudget(sel.id);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, focusIdx, submitted, projectType]);

  // Reset focus index when step changes (nothing pre-highlighted).
  useEffect(() => {
    setFocusIdx(-1);
  }, [step]);

  const stepMeta = STEP_TITLES[step];

  const currentBudgetOptions = useMemo(() => {
    if (!projectType) return BUDGETS_BY_PROJECT.other;
    return BUDGETS_BY_PROJECT[projectType] ?? BUDGETS_BY_PROJECT.other;
  }, [projectType]);

  const shortcutMax = step === 0 ? PROJECT_TYPES.length : currentBudgetOptions.length;

  const selections = useMemo(() => {
    const list: Array<{ key: string; label: string }> = [];
    if (projectType) {
      const p = PROJECT_TYPES.find((t) => t.id === projectType);
      if (p) list.push({ key: "type", label: p.title });
    }
    if (budget) {
      const b = ALL_BUDGETS.find((x) => x.id === budget);
      if (b) list.push({ key: "budget", label: b.label });
    }
    return list;
  }, [projectType, budget]);

  const handleSelectType = (id: string) => {
    setBudget(null);
    setProjectType(id);
    setDirection(1);
    setStep(1);
  };

  const handleSelectBudget = (id: string) => {
    setBudget(id);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const selectedType =
      PROJECT_TYPES.find((p) => p.id === projectType)?.title ?? "";
    const selectedBudget =
      ALL_BUDGETS.find((b) => b.id === budget)?.label ?? "";

    setSending(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: selectedType,
          budget: selectedBudget,
          name: form.name,
          company: form.company,
          email: form.email,
          location: form.location,
          material: form.material,
          description: form.description,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(
          data.error ?? "Couldn't send the brief. Please try again.",
        );
      }

      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="brief-modal" aria-hidden={!open}>
      <button
        ref={scrimRef}
        type="button"
        aria-label="Close brief"
        tabIndex={open ? 0 : -1}
        onClick={close}
        className="brief-modal__scrim"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-title"
        tabIndex={-1}
        ref={panelRef}
        className="brief-modal__panel"
      >
        {/* ------- Header: step meta + controls ------- */}
        <div className="brief-modal__header">
          <div className="brief-modal__eyebrow">
            <span className="brief-modal__step">
              {submitted ? "Sent" : stepMeta.eyebrow}
            </span>
            {selections.length > 0 && !submitted && (
              <div className="brief-chips">
                {selections.map((s) => (
                  <span key={s.key} className="brief-chip">
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="brief-modal__controls">
            {step > 0 && !submitted && (
              <button
                type="button"
                onClick={handleBack}
                className="brief-back"
              >
                <span aria-hidden className="brief-back__arrow">
                  ←
                </span>
                <span>Return</span>
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="brief-pill brief-pill--icon"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>
        </div>

        {/* ------- Animated step stage ------- */}
        <div
          className={`brief-modal__body ${step === 0 ? "brief-modal__body--project" : ""} ${submitted ? "brief-modal__body--submitted" : ""}`}
        >
          <div
            ref={stageRef}
            key={`step-${step}-${submitted ? "done" : ""}`}
            className={`brief-modal__stage ${step === 0 ? "brief-modal__stage--project" : ""} ${submitted ? "brief-modal__stage--submitted" : ""}`}
          >
            {submitted ? (
              <SubmittedView />
            ) : (
              <>
                <h2
                  id="brief-title"
                  data-stagger
                  className={`brief-modal__title ${step === 0 ? "brief-modal__title--project" : ""}`}
                >
                  <span>{stepMeta.head} </span>
                  <span className="italic font-normal text-foreground/90">
                    {stepMeta.italic}
                  </span>
                </h2>

                {step === 0 && (
                  <ul
                    className="brief-list brief-list--project"
                    onMouseLeave={() => setFocusIdx(-1)}
                  >
                    {PROJECT_TYPES.map((p, i) => (
                      <li key={p.id} data-stagger>
                        <BriefOption
                          index={i + 1}
                          title={p.title}
                          description={p.description}
                          selected={projectType === p.id}
                          focused={focusIdx === i}
                          onSelect={() => handleSelectType(p.id)}
                          onHover={() => setFocusIdx(i)}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {step === 1 && (
                  <ul
                    className="brief-list"
                    onMouseLeave={() => setFocusIdx(-1)}
                  >
                    {currentBudgetOptions.map((b, i) => (
                      <li key={b.id} data-stagger>
                        <BriefOption
                          index={i + 1}
                          title={b.label}
                          hint={b.hint}
                          selected={budget === b.id}
                          focused={focusIdx === i}
                          onSelect={() => handleSelectBudget(b.id)}
                          onHover={() => setFocusIdx(i)}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="brief-form">
                    <div data-stagger className="brief-form__pair">
                      <FormRow
                        label="Name"
                        value={form.name}
                        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                        placeholder="Your name"
                        required
                      />
                      <FormRow
                        label="Company"
                        value={form.company}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, company: v }))
                        }
                        placeholder="Your company"
                      />
                    </div>

                    <div data-stagger className="brief-form__pair">
                      <FormRow
                        label="E-mail"
                        type="email"
                        value={form.email}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, email: v }))
                        }
                        placeholder="Your e-mail"
                        required
                      />
                      <FormRow
                        label="Location"
                        value={form.location}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, location: v }))
                        }
                        placeholder="City, country"
                      />
                    </div>

                    <FormRow
                      label="Material"
                      value={form.material}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, material: v }))
                      }
                      placeholder="Link to Figma, deck, brief, etc."
                      stagger
                    />

                    <label data-stagger className="brief-field brief-field--textarea">
                      <span className="brief-field__label">Project</span>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your project…"
                        rows={3}
                        className="brief-field__input brief-field__input--textarea"
                      />
                    </label>

                    {submitError && (
                      <div
                        data-stagger
                        role="alert"
                        className="brief-error"
                      >
                        {submitError}
                      </div>
                    )}

                    <button
                      data-stagger
                      type="submit"
                      disabled={sending}
                      aria-busy={sending}
                      className="brief-submit"
                    >
                      <span>{sending ? "Sending…" : "Send message"}</span>
                      <span aria-hidden>{sending ? "…" : "↗"}</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* ------- Footer: progress + hint ------- */}
        <div className="brief-modal__footer">
          <div className="brief-progress" aria-hidden>
            <span ref={progressRef} className="brief-progress__fill" />
          </div>

          <div className="brief-modal__foot-meta">
            <span className="brief-modal__hint">
              {submitted
                ? "Brief delivered"
                : sending
                  ? "Sending your brief…"
                  : step === 2
                    ? "Return, or send when ready"
                        : `Select with 1-${shortcutMax}, or return with Esc`}
            </span>
            <span className="brief-modal__count">
              {submitted
                ? "Thanks"
                : `${String(step + 1).padStart(2, "0")} / ${String(STEP_TITLES.length).padStart(2, "0")}`}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BriefOption({
  index,
  title,
  description,
  hint,
  selected,
  focused,
  onSelect,
  onHover,
}: {
  index: number;
  title: string;
  description?: string;
  hint?: string;
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-pressed={selected}
      data-focused={focused ? "true" : undefined}
      className={`brief-option ${
        description ? "brief-option--full" : "brief-option--compact"
      } ${selected ? "is-selected" : ""}`}
    >
      <span className="brief-option__index" aria-hidden>
        {String(index).padStart(2, "0")}
      </span>

      <span className="brief-option__title">{title}</span>

      {description && (
        <span className="brief-option__desc">{description}</span>
      )}
      {!description && hint && (
        <span className="brief-option__desc">{hint}</span>
      )}

      <span className="brief-option__arrow" aria-hidden>
        ↗
      </span>
    </button>
  );
}

function FormRow({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  stagger,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email";
  required?: boolean;
  stagger?: boolean;
}) {
  return (
    <label data-stagger={stagger ? "" : undefined} className="brief-field">
      <span className="brief-field__label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="brief-field__input"
      />
    </label>
  );
}

function SubmittedView() {
  return (
    <div className="brief-success" data-stagger>
      <h2 className="brief-modal__title">
        <span>Brief received. </span>
        <span className="italic font-normal text-foreground/90">
          Talk soon.
        </span>
      </h2>
      <p className="brief-success__copy">
        Your brief just landed in our inbox. We&rsquo;ll read it carefully
        and reply within two business days. If anything urgent comes up,{" "}
        <a
          href="mailto:hello@clove.studio"
          className="underline decoration-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          email hello@clove.studio
        </a>{" "}
        directly.
      </p>
    </div>
  );
}
