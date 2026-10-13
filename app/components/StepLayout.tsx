"use client";

import { Box, Flex, Heading, Progress, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

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
  const maxWidth = width === "wide" ? "max-w-[960px]" : "max-w-[560px]";

  return (
    <div className="h-dvh flex flex-col safe-top">
      <header className="flex-shrink-0 border-b border-[var(--gray-a4)]">
        <div className={`${maxWidth} mx-auto w-full px-4 pt-4 pb-3`}>
          {stepIndex !== undefined && (
            <Flex direction="column" gap="2" mb="3">
              <Text size="1" color="gray" weight="medium">
                Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex]}
              </Text>
              <Progress
                value={((stepIndex + 1) / STEPS.length) * 100}
                size="1"
                aria-label="Decision progress"
              />
            </Flex>
          )}
          <Heading as="h1" size={{ initial: "5", sm: "6" }} className="break-words">
            {title}
          </Heading>
          {subtitle && (
            <Text as="p" size="2" color="gray" mt="1">
              {subtitle}
            </Text>
          )}
        </div>
      </header>

      <main className={`flex-1 min-h-0 ${fixedBody ? "flex flex-col" : "overflow-y-auto"}`}>
        <Box
          className={`${maxWidth} mx-auto w-full px-4 ${fixedBody ? "flex-1 min-h-0 flex flex-col" : "py-4"}`}
        >
          {children}
        </Box>
      </main>

      {footer && (
        <footer className="flex-shrink-0 border-t border-[var(--gray-a4)] bg-[var(--gray-1)] safe-bottom">
          <div className={`${maxWidth} mx-auto w-full px-4 py-3`}>{footer}</div>
        </footer>
      )}
    </div>
  );
}
