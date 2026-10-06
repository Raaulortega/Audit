import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}

/** Large title, the way Apple apps open a top-level screen. */
export function PageHeader({ icon: Icon, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-1 flex items-center gap-1.5 text-footnote font-semibold text-tint">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="font-display text-large-title font-bold tracking-tight text-label">{title}</h1>
        <p className="mt-2 text-body text-label-2 lg:text-callout">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Opaque content surface in the inset grouped style. Glass never goes here. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 className="text-headline font-semibold text-label">{children}</h2>
      {hint && <span className="text-footnote text-label-2">{hint}</span>}
    </div>
  );
}

/** Section header above an inset grouped list. */
export function SectionHeader({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2 px-4 text-footnote font-semibold text-label-2">
      {children}
    </h2>
  );
}

const BUTTON_STYLES = {
  // One prominent (filled) button per view; everything else stays gray.
  primary: 'bg-tint text-on-tint hover:brightness-110 active:brightness-95',
  secondary: 'bg-fill text-tint hover:bg-fill-strong',
  danger: 'bg-critical-soft text-critical hover:brightness-95',
};

const BUTTON_BASE =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-subhead font-semibold transition-[filter,background-color] lg:min-h-9';

/** Class list for links that look like buttons. */
export const buttonClass = (variant: keyof typeof BUTTON_STYLES = 'secondary') => `${BUTTON_BASE} ${BUTTON_STYLES[variant]}`;

/** Capsule button. 44 px tall on touch layouts, 36 px with a pointer. */
export function Button({
  children,
  onClick,
  variant = 'secondary',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: keyof typeof BUTTON_STYLES;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass(variant)} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/** Segmented control: mutually exclusive choices of the same kind. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ id: T; label: ReactNode; ariaLabel?: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="scroll-row flex max-w-full overflow-x-auto rounded-[10px] bg-fill p-0.5">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.id)}
            className={`min-h-9 shrink-0 grow whitespace-nowrap rounded-[8px] px-3 text-footnote font-medium transition-colors lg:min-h-7 ${
              selected ? 'bg-surface-raised text-label shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-label-2 hover:text-label'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle chip for filters that can be combined. */
export function Chip({ children, pressed, onClick }: { children: ReactNode; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-footnote font-medium transition-colors lg:min-h-8 ${
        pressed ? 'bg-label text-bg' : 'bg-fill text-label-2 hover:text-label'
      }`}
    >
      {children}
    </button>
  );
}

/** iOS-style switch. The whole row is the hit target. */
export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-subhead text-label"
    >
      <span className="min-w-0 break-words">{label}</span>
      <span
        aria-hidden="true"
        className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-tint' : 'bg-fill-strong'}`}
      >
        <span
          className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-[left] duration-200 ease-spring ${
            checked ? 'left-[22px]' : 'left-[2px]'
          }`}
        />
      </span>
    </button>
  );
}
