"use client";

import type { ReactNode } from "react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input";
import { TypingIndicator } from "@/components/ai/shimmer";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  // Rendered above the composer (e.g. quick replies)
  quickReplies?: ReactNode;
};

export default function ChatInterface({
  onSendMessage,
  messages,
  placeholder,
  isLoading = false,
  disabled = false,
  quickReplies,
}: ChatInterfaceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation density="compact" className="-mx-4">
        <ConversationContent>
          {messages.map((message, index) => (
            <Message key={index} from={message.role}>
              <MessageContent className="whitespace-pre-wrap">{message.content}</MessageContent>
            </Message>
          ))}
          {isLoading && (
            <Message from="assistant">
              <MessageContent>
                <TypingIndicator />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex shrink-0 flex-col gap-2 pb-3">
        {quickReplies}
        <PromptInput
          status={isLoading ? "submitted" : "ready"}
          onSubmit={({ text }) => {
            if (!disabled) onSendMessage(text);
          }}
        >
          <PromptInputTextarea placeholder={placeholder} disabled={disabled} />
          <PromptInputToolbar className="pt-0">
            <PromptInputTools />
            <PromptInputSubmit {...(disabled ? { disabled: true } : {})} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
