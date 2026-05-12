"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Header from "../../../../components/Header";
import Input from "../../../../components/conversations/Input";
import { useAuthStore } from "../../../../store/useAuthStore";

const SingleConversation = () => {
  const { conversationId } = useParams();
  const { user, token } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function getMessages() {
      try {
        setHasLoaded(false);

        console.log("TOKEN FROM STORE:", token);
        const res = await fetch(
          `https://chatbotbackend-production-dc6c.up.railway.app/chats/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();

        setMessages(
          [...data.messages].reverse().map((m) => ({
            role: m.role,
            content: m.content,
          })),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setHasLoaded(true);
      }
    }

    if (conversationId) getMessages();
  }, [conversationId, token]);

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
            userId: user.userId,
            conversationId,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        },
      );

      if (!res.ok) throw new Error("Failed to send query");

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversation" btnText="+ New Chat" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">
            {!hasLoaded ? null : messages.length === 0 && !isLoading ? (
              <p className="text-gray-400 text-sm">No messages yet</p>
            ) : (
              messages.map((message, index) => (
                <p
                  key={index}
                  className={`p-3 py-2 rounded-xl w-fit max-w-[70%] transition-all duration-200 ${
                    message.role === "user"
                      ? "self-end bg-[#2D5BE3] text-white"
                      : "self-start bg-[#dadada]/50 text-gray-600"
                  }`}
                >
                  {message.content}
                </p>
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

export default SingleConversation;
