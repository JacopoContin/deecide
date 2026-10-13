"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { STEPS } from "@/lib/decision";
import HowItWorksPanel, { HowItWorksButton } from "./HowItWorks";

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
    <div className="flex h-dvh">
      <div className="flex min-w-0 flex-1 flex-col pt-[var(--safe-top)]">
        <header className={cn("shrink-0", stepIndex === undefined && "border-b")}>
          <div className={cn(container, "pt-4 pb-3")}>
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-heading text-xl font-semibold break-words sm:text-2xl">{title}</h1>
              {stepIndex !== undefined && <HowItWorksButton className="-mr-2 shrink-0" />}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {/* The header divider doubles as the step progress bar */}
          {stepIndex !== undefined && (
            <ProgressPrimitive.Root
              value={((stepIndex + 1) / STEPS.length) * 100}
              aria-label={`Step ${stepIndex + 1} of ${STEPS.length}: ${STEPS[stepIndex]}`}
            >
              <ProgressTrack className="h-0.5 rounded-none bg-border">
                <ProgressIndicator />
              </ProgressTrack>
            </ProgressPrimitive.Root>
          )}
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
      {stepIndex !== undefined && <HowItWorksPanel stepIndex={stepIndex} />}
    </div>
  );
}
