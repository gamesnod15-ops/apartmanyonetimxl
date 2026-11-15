"use client";

import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, X } from "lucide-react";
import { initials } from "@/app/lib/selectors";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] bg-white p-5 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

type ButtonVariant =
  | "primary"
  | "blue"
  | "red"
  | "soft"
  | "outline"
  | "ghost"
  | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700",
  blue: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700",
  red: "bg-red-500 text-white hover:bg-red-600",
  soft: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15",
  outline:
    "bg-slate-900/[0.06] text-blue-600 hover:bg-slate-900/10",
  ghost: "text-blue-600 hover:bg-blue-500/10",
  danger: "bg-red-500/10 text-red-600 hover:bg-red-500/15",
};

type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-sm gap-2",
  icon: "h-10 w-10 justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[14px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const fieldClasses =
  "w-full rounded-xl border border-transparent bg-slate-900/[0.05] px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClasses, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldClasses, "resize-none", className)} {...props} />
  );
}

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600"
    >
      <span>{children}</span>
      {hint ? <span className="font-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[10px]"
      />
      <div className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl animate-slide-up sm:max-w-lg sm:rounded-3xl sm:p-6 sm:animate-pop">
        <div className="mx-auto -mt-1 mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-12 text-center shadow-soft">
      {icon ? (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 shadow-sm ring-1 ring-slate-200">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full bg-blue-600 transition-all", barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Avatar({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
        color ?? "bg-slate-500",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = "blue",
}: {
  options: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  tone?: "blue" | "red";
}) {
  return (
    <div className="flex gap-0.5 overflow-x-auto rounded-[11px] bg-slate-900/[0.07] p-0.5 no-scrollbar">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex shrink-0 grow items-center justify-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-xs font-semibold transition",
              active
                ? tone === "red"
                  ? "bg-white text-red-600 shadow-[0_1px_4px_rgb(0_0_0/0.14)]"
                  : "bg-white text-slate-900 shadow-[0_1px_4px_rgb(0_0_0/0.14)]"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  active ? "bg-slate-900/[0.08]" : "bg-slate-900/[0.06] text-slate-500"
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: Array<{ label: string; optional?: boolean }>;
  current: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = Boolean(onStepClick) && done;
        return (
          <li key={step.label} className="relative flex flex-1 flex-col items-center">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 rounded-full transition-colors",
                  index <= current ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            ) : null}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white transition disabled:cursor-default",
                done
                  ? "bg-blue-600 text-white"
                  : active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-200 text-slate-400"
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </button>
            <span
              className={cn(
                "mt-1.5 block px-0.5 text-center text-[10px] font-semibold leading-tight",
                active ? "text-blue-600" : done ? "text-slate-600" : "text-slate-400"
              )}
            >
              {step.label}
              {step.optional ? (
                <span className="block font-normal text-slate-400">opsiyonel</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
