"use client";

import { Badge, Callout, Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { SCORE_SCALE, formatSigned } from "../lib/decision";

export default function ScoreLegend() {
  return (
    <Callout.Root size="1" variant="surface" color="gray">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Flex direction="column" gap="2">
        <Text size="2">Score how each option affects a criterion:</Text>
        <Flex direction="column" gap="1">
          {SCORE_SCALE.map((level) => (
            <Flex key={level.value} align="center" gap="2">
              <Badge color={level.color} variant="soft" className="w-8 justify-center">
                {formatSigned(level.value)}
              </Badge>
              <Text size="1" color="gray">
                <Text weight="medium" highContrast>
                  {level.label}
                </Text>{" "}
                · {level.description.toLowerCase()}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Callout.Root>
  );
}
