"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import McpToolsList from "./mcp-tools-list";
import McpApproval from "./mcp-approval";
import { Item, McpApprovalRequestItem } from "@/lib/assistant";
import LoadingMessage from "./loading-message";
import useConversationStore from "@/stores/useConversationStore";
import { Brain, Paperclip, X } from "lucide-react";
import { INITIAL_MESSAGE } from "@/config/constants";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string, file?: File) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
}

const Chat: React.FC<ChatProps> = ({
  items,
  onSendMessage,
  onApprovalResponse,
}) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputMessageText, setinputMessageText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // This state is used to provide better user experience for non-English IMEs such as Japanese
  const [isComposing, setIsComposing] = useState(false);
  const { isAssistantLoading } = useConversationStore();

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        onSendMessage(inputMessageText, selectedFile || undefined);
        setinputMessageText("");
        setSelectedFile(null);
      }
    },
    [onSendMessage, inputMessageText, isComposing, selectedFile]
  );

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  return (
    <div className="flex justify-center items-center size-full">
      <div className="flex grow flex-col h-full max-w-[1100px] gap-2">
        <div className="flex-1 overflow-y-auto px-4 md:px-10 flex flex-col">
          {items.length === 0 && !isAssistantLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-700">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <Brain size={36} className="text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">TacticDev GenTel™</h2>
              <p className="text-muted-foreground max-w-[400px]">
                {INITIAL_MESSAGE}
              </p>
            </div>
          )}
          <div className="mt-auto space-y-5 pt-4 pb-4">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.type === "tool_call" ? (
                  <ToolCall toolCall={item} />
                ) : item.type === "message" ? (
                  <div className="flex flex-col gap-1">
                    <Message 
                      message={item} 
                      onActionClick={(action) => onSendMessage(action)}
                    />
                    {item.content &&
                      item.content.length > 0 &&
                      item.content[0].annotations &&
                      item.content[0].annotations.length > 0 && (
                        <Annotations
                          annotations={item.content[0].annotations}
                        />
                      )}
                  </div>
                ) : item.type === "mcp_list_tools" ? (
                  <McpToolsList item={item} />
                ) : item.type === "mcp_approval_request" ? (
                  <McpApproval
                    item={item as McpApprovalRequestItem}
                    onRespond={onApprovalResponse}
                  />
                ) : null}
              </React.Fragment>
            ))}
            {isAssistantLoading && <LoadingMessage />}
            <div ref={itemsEndRef} />
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="relative max-w-3xl mx-auto">
            {selectedFile && (
              <div className="absolute -top-12 left-0 flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border animate-in slide-in-from-bottom-2">
                <Paperclip size={14} className="text-primary" />
                <span className="text-xs font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              <textarea
                value={inputMessageText}
                onChange={(e) => {
                  setinputMessageText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Message GenTel..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-1 text-sm min-h-[44px] max-h-[200px]"
                rows={1}
              />
              
              <button
                onClick={() => {
                  onSendMessage(inputMessageText, selectedFile || undefined);
                  setinputMessageText("");
                  setSelectedFile(null);
                }}
                disabled={!inputMessageText.trim() && !selectedFile}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:grayscale transition-all hover:opacity-90"
              >
                <Brain size={20} />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              GenTel™ can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
