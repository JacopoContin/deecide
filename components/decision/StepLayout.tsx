"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export const STEPS = ["Options", "Criteria", "Evaluate", "Weigh", "Results"] as const;

type StepLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  // 0-based index into STEPS; omit to hide the step indicator
  stepIndex?: number;
  // Content area width: narrow for single-column flows, wide for the results matrix
  width?: "narrow" | "wide";
  // When true the body is not scrollable (the child manages its own scrolling, e.g. chat)
  fixedBody?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

export default function StepLayout({
  title,
  subtitle,
  stepIndex,
  width = "narrow",
  fixedBody = false,
  footer,
  children,
}: StepLayoutProps) {
  const container = cn("mx-auto w-full px-4", width === "wide" ? "max-w-5xl" : "max-w-xl");

  return (
    <div className="flex h-dvh flex-col pt-[var(--safe-top)]">
      <header className="shrink-0 border-b">
        <div className={cn(container, "pt-4 pb-3")}>
          {stepIndex !== undefined && (
            <div className="mb-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex]}
              </p>
              <Progress value={((stepIndex + 1) / STEPS.length) * 100} aria-label="Decision progress" />
            </div>
          )}
          <h1 className="font-heading text-xl font-semibold break-words sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </header>

      <main className={cn("min-h-0 flex-1", fixedBody ? "flex flex-col" : "overflow-y-auto")}>
        <div className={cn(container, fixedBody ? "flex min-h-0 flex-1 flex-col" : "py-4")}>{children}</div>
      </main>

      {footer && (
        <footer className="shrink-0 border-t bg-background pb-[var(--safe-bottom)]">
          <div className={cn(container, "py-3")}>{footer}</div>
        </footer>
      )}
    </div>
  );
}
