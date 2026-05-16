"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Header from "../../../../components/Header";
import Input from "../../../../components/conversations/Input";

import { useQuery } from "@tanstack/react-query";
import { chatAPI } from "../../../../lib/schemas/api/chat.api";
import { useConversationStore } from "../../../../store/useConversation";

const SingleConversation = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const { conversationId } = useParams();
  const router = useRouter();

  const [userInput, setUserInput] = useState("");
  const [tempMessages, setTempMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const { pendingMessages, clearPendingMessages } = useConversationStore();

  // Check if Zustand has messages for this exact conversation
  const hasPending = pendingMessages?.conversationId === conversationId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => chatAPI.getConversation(conversationId),
    enabled: !!conversationId && !hasPending, // skip fetch if we already have messages
  });

  // Once server data is available (e.g. after refresh), clear the pending store
  useEffect(() => {
    if (data && hasPending) {
      clearPendingMessages();
    }
  }, [data]);

  const serverMessages =
    data?.messages
      ?.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      .reverse() || [];

  // Priority: pending store → server → temp
  const baseMessages = hasPending ? pendingMessages.messages : serverMessages;
  const messages = [...baseMessages, ...tempMessages];

  async function sendQuery(question) {
    if (!question.trim()) return;

    setLoading(true);
    setIsStreaming(false);

    // If we navigate here from ConversationsPage and still have pending,
    // clear it now since the user is continuing the conversation
    if (hasPending) {
      clearPendingMessages();
    }

    setTempMessages((prev) => [...prev, { role: "user", content: question }]);
    setUserInput("");

    await chatAPI.sendQueryStream({
      question,
      conversationId,
      onChunk: (chunk, fullText) => {
        setIsStreaming(true);

        setTempMessages((prev) => {
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

    setLoading(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!conversationId) {
    router.push("/conversations");
    return null;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error.message}</p>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversation" btnText="+ New Chat" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">

            {/* Only show loading spinner if no pending messages and server is fetching */}
            {isLoading && !hasPending ? (
              <p>Loading...</p>
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
                    <div className="
                      prose max-w-none
                      prose-p:text-[15px] prose-p:leading-7 prose-p:text-gray-700 prose-p:mb-3
                      prose-headings:text-gray-900 prose-headings:font-bold prose-headings:text-lg prose-headings:mt-4 prose-headings:mb-2
                      prose-h2:text-base prose-h2:font-semibold prose-h2:text-gray-800
                      prose-li:text-[15px] prose-li:text-gray-700 prose-li:leading-7 prose-li:mb-2
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3 prose-ul:space-y-2
                      prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-3 prose-ol:space-y-2
                      prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-100 prose-pre:rounded-lg prose-pre:p-4
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content.replace(/\n/g, "  \n")}
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

export default SingleConversation;