"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { AddIcon, CloseIcon } from "@/lib/icons";

type ListBuilderProps = {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  emptyText: string;
};

export default function ListBuilder({
  items,
  onAdd,
  onRemove,
  placeholder,
  emptyText,
}: ListBuilderProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const value = input.trim();
    if (value && !items.includes(value)) {
      onAdd(value);
    }
    setInput("");
    // Stay in the field (even after tapping +) so several items can be typed in a row
    inputRef.current?.focus();
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
            ref={inputRef}
            autoFocus
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
