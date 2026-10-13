"use client";

import { Flex, Spinner, Text } from "@radix-ui/themes";

export default function LoadingIndicator({ label }: { label?: string }) {
  return (
    <Flex align="center" gap="2" py="2">
      <Spinner size="2" />
      {label && (
        <Text size="2" color="gray">
          {label}
        </Text>
      )}
    </Flex>
  );
}
