"use client";

import { useState } from "react";
import { Badge, Box, Card, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { CheckIcon, Cross2Icon, MagicWandIcon, PlusIcon } from "@radix-ui/react-icons";
import LoadingIndicator from "./LoadingIndicator";

type ListBuilderProps = {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  emptyText: string;
  suggestions: string[];
  isLoadingSuggestions: boolean;
};

export default function ListBuilder({
  items,
  onAdd,
  onRemove,
  placeholder,
  emptyText,
  suggestions,
  isLoadingSuggestions,
}: ListBuilderProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const value = input.trim();
    if (value && !items.includes(value)) {
      onAdd(value);
    }
    setInput("");
  };

  return (
    <Flex direction="column" gap="4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <TextField.Root
          size="3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        >
          <TextField.Slot side="right">
            <IconButton type="submit" size="2" disabled={!input.trim()} aria-label="Add">
              <PlusIcon />
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
      </form>

      {(isLoadingSuggestions || suggestions.length > 0) && (
        <Box>
          <Flex align="center" gap="1" mb="2">
            <MagicWandIcon color="var(--accent-11)" />
            <Text size="1" color="gray" weight="medium">
              Suggestions · tap to add
            </Text>
          </Flex>
          {isLoadingSuggestions ? (
            <LoadingIndicator label="Thinking of ideas…" />
          ) : (
            <Flex wrap="wrap" gap="2">
              {suggestions.map((suggestion) => {
                const isAdded = items.includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onAdd(suggestion)}
                    disabled={isAdded}
                    className="text-left disabled:cursor-default"
                  >
                    <Badge
                      size="2"
                      radius="full"
                      variant={isAdded ? "solid" : "soft"}
                      className="!whitespace-normal"
                    >
                      {isAdded ? <CheckIcon /> : <PlusIcon />}
                      {suggestion}
                    </Badge>
                  </button>
                );
              })}
            </Flex>
          )}
        </Box>
      )}

      <Flex direction="column" gap="2">
        {items.length === 0 ? (
          <Text size="2" color="gray" align="center" className="py-6">
            {emptyText}
          </Text>
        ) : (
          items.map((item, index) => (
            <Card key={`${item}-${index}`} size="1">
              <Flex align="center" justify="between" gap="3">
                <Flex align="center" gap="3" className="min-w-0">
                  <Badge variant="soft" color="gray" radius="full">
                    {index + 1}
                  </Badge>
                  <Text size="2" className="break-words min-w-0">
                    {item}
                  </Text>
                </Flex>
                <IconButton
                  size="1"
                  variant="ghost"
                  color="gray"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${item}`}
                >
                  <Cross2Icon />
                </IconButton>
              </Flex>
            </Card>
          ))
        )}
      </Flex>
    </Flex>
  );
}
