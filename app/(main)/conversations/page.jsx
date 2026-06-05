"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Input from "../../../components/conversations/Input";
import NoMessageContent from "../../../components/conversations/NoMessageContent";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../lib/schemas/api/chat.api";
import { useConversationStore } from "../../../store/useConversation";
import remarkBreaks from "remark-breaks";

const ConversationsPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setPendingMessages } = useConversationStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuery(question) {
    if (!question.trim()) return;

    setError(null);
    setLoading(true);
    setIsStreaming(false);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setUserInput("");

    try {
      // FIX: Only use sendQueryStream (no conversationId = backend creates a new one).
      // Previously sendQuery + sendQueryStream were BOTH called, saving two answers to DB.
      let conversationId = null;
      let finalMessages = [];

      await chatAPI.sendQueryStream({
        question,
        conversationId: undefined,
        onChunk: (chunk, fullText, meta) => {
          setIsStreaming(true);

          // Capture conversationId from first chunk metadata if your API sends it,
          // otherwise it will be set after the stream via the return value below.
          if (meta?.conversationId) {
            conversationId = meta.conversationId;
          }

          setMessages((prev) => {
            const copy = [...prev];
            const lastIndex = copy.length - 1;

            if (copy[lastIndex]?.role === "assistant") {
              copy[lastIndex].content = fullText;
            } else {
              copy.push({ role: "assistant", content: fullText });
            }

            finalMessages = copy;
            return copy;
          });
        },
        onDone: (meta) => {
          // Capture conversationId from stream completion metadata
          if (meta?.conversationId) {
            conversationId = meta.conversationId;
          }
        },
      });

      setLoading(false);

      // If your sendQueryStream doesn't return conversationId via callbacks,
      // fall back to a fresh fetch of conversations to get the latest one
      if (!conversationId) {
        const freshConversations = await chatAPI.getConversations();
        conversationId = freshConversations?.[0]?.conversationId;
      }

      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        setPendingMessages({
          conversationId,
          messages: finalMessages,
        });

        router.push(`/conversations/${conversationId}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversations" btnText="+ New Chat" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length === 0 ? (
              <NoMessageContent send={sendQuery} />
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 py-2 rounded-xl max-w-[75%] text-md ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-600 text-white leading-relaxed"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div
                                          className="prose max-w-none
                      prose-p:text-md prose-p:leading-7 prose-p:text-gray-800
                      prose-h1:text-4xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-3 prose-h1:mt-5
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mb-2 prose-h2:mt-4
                      prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mb-2 prose-h3:mt-3
                      prose-li:text-md prose-li:text-gray-700 prose-li:leading-7
                      prose-ul:my-2 prose-ul:pl-5
                      prose-ol:my-2 prose-ol:pl-5
                      prose-strong:font-semibold prose-strong:text-gray-900
                      prose-a:text-blue-600 prose-a:underline
                      prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-100 prose-pre:rounded-lg prose-pre:p-4
                    "
                                        >
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            components={{
                                              p: ({ children }) => (
                                                <p className="mb-3 leading-7 text-[15px] text-gray-800">
                                                  {children}
                                                </p>
                                              ),
                                            }}
                                          >
                                            {msg.content}
                                          </ReactMarkdown>
                                        </div>
                  )}
                </div>
              ))
            )}

            {loading && !isStreaming && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm px-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-75">●</span>
                <span className="animate-pulse delay-150">●</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <Input input={userInput} setInput={setUserInput} send={sendQuery} />
      </div>
    </div>
  );
};

export default ConversationsPage;