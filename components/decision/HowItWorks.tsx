"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HelpIcon } from "@/lib/icons";
import { STEPS } from "@/lib/decision";

// One entry per STEPS item, in the same order
const GUIDE: { what: string; why: string }[] = [
  {
    what: "List the alternatives you're choosing between.",
    why: "Writing them down side by side stops you from comparing a vivid favourite against a vague “something else”.",
  },
  {
    what: "Name the things that matter, like cost, time or how it feels.",
    why: "Agreeing on criteria up front means every option is judged by the same yardstick, not by whatever you happen to think of first.",
  },
  {
    what: "Rate each option against each criterion, from −1 (works against it) to +2 (excels at it).",
    why: "Scoring one criterion at a time breaks a big, fuzzy choice into small judgements that are much easier to make honestly.",
  },
  {
    what: "Say how important each criterion is, from 1 (not important) to 5 (critical).",
    why: "Not everything matters equally. Weights let a deal-breaker count for more than a nice-to-have.",
  },
  {
    what: "Each score is multiplied by its criterion's weight and the results are added up. The highest total wins.",
    why: "You see the ranking and exactly where each option gained or lost points, so you can check whether the outcome matches your gut, and why if it doesn't.",
  },
];

type HowItWorksProps = {
  // 0-based index into STEPS, highlighted as the current step
  stepIndex?: number;
  className?: string;
};

export default function HowItWorks({ stepIndex, className }: HowItWorksProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="sm" className={cn("text-muted-foreground", className)} />}
      >
        <HelpIcon data-icon="inline-start" /> How it works
      </SheetTrigger>
      <SheetContent className="w-[88%] gap-0 overflow-y-auto">
        <SheetHeader className="pr-12">
          <SheetTitle className="text-lg font-semibold">How it works</SheetTitle>
          <SheetDescription>
            Deecide is built on the weighted decision matrix: a simple, proven way to compare options when no single
            one wins on everything.
          </SheetDescription>
        </SheetHeader>

        <ol className="flex flex-col gap-2 px-4 pb-4">
          {STEPS.map((step, index) => {
            const current = index === stepIndex;
            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className={cn("flex gap-3 rounded-xl p-3", current ? "bg-muted" : "")}
              >
                <Badge
                  variant={current ? "default" : "secondary"}
                  className="mt-0.5 size-6 shrink-0 rounded-full tabular-nums"
                >
                  {index + 1}
                </Badge>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    {step}
                    {current && <span className="text-xs font-normal text-muted-foreground">You are here</span>}
                  </p>
                  <p>{GUIDE[index].what}</p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Why: </span>
                    {GUIDE[index].why}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mx-4 mb-4 flex flex-col gap-1 rounded-xl border p-3">
          <p className="font-medium text-foreground">A tip</p>
          <p className="text-muted-foreground">
            The matrix is a thinking tool, not an oracle. If the winner feels wrong, that&rsquo;s useful too: it usually
            means a criterion is missing or a weight is off. Go back, adjust, and see what changes.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
