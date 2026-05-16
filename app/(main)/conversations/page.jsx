"use client";

import { useState } from "react";

import Header from "../../../components/Header";
import Input from "../../../components/conversations/Input";
import NoMessageContent from "../../../components/conversations/NoMessageContent";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../lib/schemas/api/chat.api";

const ConversationsPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  async function sendQuery(question) {
    if (!question.trim()) return;

    setError(null);
    setLoading(true);
    setIsStreaming(false);

    // Optimistic user message
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setUserInput("");

    try {
      let conversationId = null;

      await chatAPI.sendQueryStream({
        question,
        conversationId: undefined,
        onChunk: (chunk, fullText, meta) => {
          setIsStreaming(true);

          // Capture conversationId from first chunk if your API sends it
          if (meta?.conversationId && !conversationId) {
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

            return copy;
          });
        },
      });

      // After streaming done — silently update URL without remounting
      if (conversationId) {
        window.history.replaceState(null, "", `/conversations/${conversationId}`);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      }
    } catch (err) {
      setError(err.message);
    } finally {
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
                  className={`p-4 rounded-xl max-w-[75%] ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-600 text-white text-sm leading-relaxed"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose max-w-none prose-p:text-[15px] prose-p:leading-7 prose-p:text-gray-700 prose-p:mb-3 prose-headings:text-gray-900 prose-headings:font-bold prose-headings:text-lg prose-headings:mt-4 prose-headings:mb-2 prose-h2:text-base prose-h2:font-semibold prose-h2:text-gray-800 prose-li:text-[15px] prose-li:text-gray-700 prose-li:leading-7 prose-li:mb-2 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3 prose-ul:space-y-2 prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-3 prose-ol:space-y-2 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:rounded-lg prose-pre:p-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content.replace(/\n/g, "  \n")}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Three dots loading — matches SingleConversation */}
            {loading && !isStreaming && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm px-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-75">●</span>
                <span className="animate-pulse delay-150">●</span>
              </div>
            )}

          </div>
        </div>

        <Input input={userInput} setInput={setUserInput} send={sendQuery} />
      </div>
    </div>
  );
};

export default ConversationsPage;