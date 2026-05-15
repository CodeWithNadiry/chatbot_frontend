"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Input from "../../../components/conversations/Input";
import NoMessageContent from "../../../components/conversations/NoMessageContent";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../lib/api/chat.api";

const ConversationsPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: chatAPI.sendQuery,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      router.replace(`/conversations/${data.conversationId}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function sendQuery(question) {
    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    setUserInput("");

    sendMutation.mutate({
      question,
      conversationId: undefined,
    });
  }

  if (error) return <p className="p-4 text-red-500">{error}</p>;

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
                  className="p-3 py-2 rounded-xl w-fit max-w-[70%] self-end bg-[#2D5BE3] text-white overflow-hidden"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))
            )}

            {sendMutation.isPending && (
              <p className="text-sm text-gray-400 animate-pulse">
                Thinking...
              </p>
            )}
          </div>
        </div>

        <Input
          input={userInput}
          setInput={setUserInput}
          send={sendQuery}
        />
      </div>
    </div>
  );
};

export default ConversationsPage;