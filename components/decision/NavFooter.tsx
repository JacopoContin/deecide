"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ChevronLeftIcon } from "@/lib/icons";

type NavFooterProps = {
  onBack?: () => void;
  backLabel?: string;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  // Optional secondary row above the main navigation (e.g. mode switch)
  extra?: ReactNode;
};

export default function NavFooter({
  onBack,
  backLabel = "Back",
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  extra,
}: NavFooterProps) {
  return (
    <div className="flex flex-col gap-2">
      {extra}
      <div className="flex gap-3">
        {onBack && (
          <Button size="lg" variant="secondary" onClick={onBack} className="flex-1">
            <ChevronLeftIcon data-icon="inline-start" /> {backLabel}
          </Button>
        )}
        {onNext && (
          <Button size="lg" onClick={onNext} disabled={nextDisabled} className="flex-1">
            {nextLabel} <ArrowRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}
