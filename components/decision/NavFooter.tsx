"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
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

const noSubscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export default function NavFooter({
  onBack,
  backLabel = "Back",
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  extra,
}: NavFooterProps) {
  const apple = useSyncExternalStore(noSubscribe, isApple, () => true);

  // ⌘/Ctrl + Enter moves to the next step from anywhere on the page
  const next = useRef({ onNext, nextDisabled });
  useEffect(() => {
    next.current = { onNext, nextDisabled };
  }, [onNext, nextDisabled]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey) || e.repeat || e.isComposing) return;
      const { onNext, nextDisabled } = next.current;
      if (!onNext || nextDisabled) return;
      e.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          <Button
            size="lg"
            onClick={onNext}
            disabled={nextDisabled}
            aria-keyshortcuts={apple ? "Meta+Enter" : "Control+Enter"}
            className="flex-1"
          >
            {nextLabel} <ArrowRightIcon data-icon="inline-end" />
            <Kbd className="hidden bg-primary-foreground/20 text-primary-foreground pointer-fine:inline-flex">
              {apple ? "⌘" : "Ctrl"} ↵
            </Kbd>
          </Button>
        )}
      </div>
    </div>
  );
}
