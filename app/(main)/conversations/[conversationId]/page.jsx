"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Header from "../../../../components/Header";
import Input from "../../../../components/conversations/Input";

import { useAuthStore } from "../../../../store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../../lib/schemas/api/chat.api";

const SingleConversation = () => {
  const { conversationId } = useParams();
  const { token } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [userInput, setUserInput] = useState("");

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => chatAPI.getConversation(conversationId),
    enabled: !!conversationId && !!token,
  });

  const messages =
    data?.messages?.map((m) => ({
      role: m.role,
      content: m.content,
    })) || [];

  const sendMutation = useMutation({
    mutationFn: chatAPI.sendQuery,

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  function sendQuery(question) {
    if (!question.trim()) return;

    setUserInput("");

    sendMutation.mutate({
      question,
      conversationId,
    });
  }

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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">

            {isLoading ? (
              <p className="text-gray-400 text-sm">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 text-sm">No messages yet</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 py-2 rounded-xl w-fit max-w-[70%] overflow-hidden ${
                    message.role === "user"
                      ? "self-end bg-[#2D5BE3] text-white"
                      : "self-start bg-[#dadada]/50 text-gray-700"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))
            )}

            {/* typing indicator */}
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

export default SingleConversation;