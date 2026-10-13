"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Flex, IconButton, Spinner, Text, TextField } from "@radix-ui/themes";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  onSendMessage: (message: string) => void;
  messages: Message[];
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  // Rendered between the messages and the input (e.g. quick-reply buttons)
  quickReplies?: React.ReactNode;
};

export default function ChatInterface({
  onSendMessage,
  messages,
  placeholder = "Type your response...",
  isLoading = false,
  disabled = false,
  quickReplies,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <Flex direction="column" className="flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto py-4" aria-live="polite">
        <Flex direction="column" gap="3">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <Flex key={index} justify={isUser ? "end" : "start"}>
                <Box
                  className={`max-w-[85%] rounded-[var(--radius-4)] px-4 py-3 ${
                    isUser
                      ? "bg-[var(--accent-9)] text-[var(--accent-contrast)] rounded-br-[var(--radius-1)]"
                      : "bg-[var(--gray-a3)] rounded-bl-[var(--radius-1)]"
                  }`}
                >
                  <Text as="p" size="2" className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </Text>
                </Box>
              </Flex>
            );
          })}
          {isLoading && (
            <Flex justify="start">
              <Box className="rounded-[var(--radius-4)] px-4 py-3 bg-[var(--gray-a3)]">
                <Spinner size="2" />
              </Box>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </Flex>
      </div>

      <Flex direction="column" gap="2" pb="3" className="flex-shrink-0">
        {quickReplies}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <TextField.Root
            size="3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            aria-label={placeholder}
          >
            <TextField.Slot side="right">
              <IconButton
                type="submit"
                size="2"
                disabled={!input.trim() || isLoading || disabled}
                aria-label="Send"
              >
                <PaperPlaneIcon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </form>
      </Flex>
    </Flex>
  );
}
