"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Suggestion, Suggestions } from "@/components/ai/suggestions";
import { Shimmer } from "@/components/ai/shimmer";
import { AddIcon, CheckIcon, CloseIcon, SparkleIcon } from "@/lib/icons";

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
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <InputGroup className="h-11">
          <InputGroupInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="default" size="icon-sm" disabled={!input.trim()} aria-label="Add">
              <AddIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      {(isLoadingSuggestions || suggestions.length > 0) && (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SparkleIcon className="size-3.5 text-primary" />
            {isLoadingSuggestions ? <Shimmer>Thinking of ideas…</Shimmer> : "Suggestions · tap to add"}
          </p>
          {!isLoadingSuggestions && (
            <Suggestions>
              {suggestions.map((suggestion) => {
                const isAdded = items.includes(suggestion);
                return (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onSelect={onAdd}
                    disabled={isAdded}
                    className={
                      isAdded
                        ? "h-auto min-h-7 border-primary/40 bg-primary/10 py-1 text-left whitespace-normal text-primary disabled:opacity-100"
                        : "h-auto min-h-7 py-1 text-left whitespace-normal"
                    }
                  >
                    {isAdded ? <CheckIcon data-icon="inline-start" /> : <AddIcon data-icon="inline-start" />}
                    {suggestion}
                  </Suggestion>
                );
              })}
            </Suggestions>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <Empty className="border border-dashed py-8">
          <EmptyHeader>
            <EmptyDescription>{emptyText}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <Card size="sm" className="flex-row items-center gap-3 px-3">
                <Badge variant="secondary" className="tabular-nums">
                  {index + 1}
                </Badge>
                <span className="min-w-0 flex-1 text-sm break-words">{item}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${item}`}
                  className="text-muted-foreground"
                >
                  <CloseIcon />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
