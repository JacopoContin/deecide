"use client";

import { Button, Flex } from "@radix-ui/themes";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

type NavFooterProps = {
  onBack?: () => void;
  backLabel?: string;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  // Optional secondary row above the main navigation (e.g. mode switch, skip)
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
    <Flex direction="column" gap="2">
      {extra}
      <Flex gap="3">
        {onBack && (
          <Button size="3" variant="soft" color="gray" onClick={onBack} className="flex-1">
            <ArrowLeftIcon /> {backLabel}
          </Button>
        )}
        {onNext && (
          <Button size="3" onClick={onNext} disabled={nextDisabled} className="flex-1">
            {nextLabel} <ArrowRightIcon />
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
