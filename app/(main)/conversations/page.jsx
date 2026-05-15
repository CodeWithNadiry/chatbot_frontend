"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Input from "../../../components/conversations/Input";
import NoMessageContent from "../../../components/conversations/NoMessageContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useConversationStore } from "../../../store/useConversation";
import { useAuthStore } from "../../../store/useAuthStore";

const ConversationsPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const { triggerRefresh } = useConversationStore();
  const router = useRouter();

  async function sendQuery(question) {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://chatbotbackend-production-dc6c.up.railway.app/chats/query",
        {
          method: "POST",
          body: JSON.stringify({
            question,
            conversationId: undefined,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to send query");

      const data = await res.json();

      triggerRefresh();

      router.replace(`/conversations/${data.conversationId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversations" btnText="+ New Chat" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length === 0 && !isLoading ? (
              <NoMessageContent send={sendQuery} />
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className="p-3 py-2 rounded-xl w-fit max-w-[70%] self-end bg-[#2D5BE3] text-white overflow-hidden"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))
            )}

            {isLoading && (
              <p className="text-sm text-gray-400 animate-pulse">Thinking...</p>
            )}
          </div>
        </div>

        <Input input={userInput} setInput={setUserInput} send={sendQuery} />
      </div>
    </div>
  );
};

export default ConversationsPage;
