"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Input from "../../../components/conversations/Input";
import NoMessageContent from "../../../components/conversations/NoMessageContent";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import { Mail, X } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../lib/schemas/api/chat.api";
import { useConversationStore } from "../../../store/useConversation";
import { useAuthStore } from "../../../store/useAuthStore";
import axios from "axios";

const ConversationsPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null);
  const [toolName, setToolName] = useState("");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setPendingMessages } = useConversationStore();
  const { token } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuery(question) {
    if (!question.trim()) return;

    setOriginalQuestion(question);
    setError(null);
    setLoading(true);
    setIsStreaming(false);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setUserInput("");

    try {
      let conversationId = null;
      let finalMessages = [];

      const result = await chatAPI.sendQueryStream({
        question,
        conversationId: undefined,
        onChunk: (chunk, fullText) => {
          if (!fullText.startsWith("{")) {
            setIsStreaming(true);
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
          }
        },
      });

      setLoading(false);

      if (result.isEmailDraft) {
        setEmailDraft(result.emailDraftFromBackend.emailDraft);
        setToolName(result.emailDraftFromBackend.toolName);
        setCurrentConversationId(result.conversationId); // ← save it here
        setEmailModalOpen(true);
        return;
      }

      // Normal RAG
      const freshConversations = await chatAPI.getConversations();
      conversationId = freshConversations?.[0]?.conversationId;

      if (conversationId) {
        setCurrentConversationId(conversationId);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        setPendingMessages({ conversationId, messages: finalMessages });
        router.push(`/conversations/${conversationId}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function changeDraftValues(e) {
    const { name, value } = e.target;
    setEmailDraft((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSendEmail() {
    try {
      const response = await axios.post(
        "https://chatbotbackend-production-dc6c.up.railway.app/chats/sendEmail",
        {
          ...emailDraft,
          question: originalQuestion,
          toolName,
          conversationId: currentConversationId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { reply, conversationId } = response.data;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setEmailModalOpen(false);
      setEmailDraft(null);

      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        router.push(`/conversations/${conversationId}`);
      }
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversations" btnText="+ New Chat" />

      <Modal open={emailModalOpen} onClose={() => setEmailModalOpen(false)}>
        <div className="flex flex-col gap-6 w-full max-sm:min-w-64 min-w-sm lg:min-w-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#E8EDFB] text-[#2D5BE3]">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Review your email
                </h2>
                <p className="text-sm text-gray-500">Edit before sending</p>
              </div>
            </div>
            <button
              onClick={() => setEmailModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">To</label>
              <input
                type="text"
                value={emailDraft?.to || ""}
                name="to"
                onChange={changeDraftValues}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2D5BE3] transition w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={emailDraft?.subject || ""}
                name="subject"
                onChange={changeDraftValues}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2D5BE3] transition w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                rows={5}
                value={emailDraft?.message || ""}
                name="message"
                onChange={changeDraftValues}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2D5BE3] transition w-full resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>Send Email</Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length === 0 ? (
              <NoMessageContent send={sendQuery} />
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 py-2 rounded-xl max-w-[75%] text-md ${msg.role === "user" ? "ml-auto bg-blue-600 text-white leading-relaxed" : "bg-white border border-gray-200 text-gray-800"}`}
                >
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div
                      className="prose max-w-none
                      prose-p:text-md prose-p:leading-7 prose-p:text-gray-800
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900
                      prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800
                      prose-li:text-md prose-li:text-gray-700 prose-li:leading-7
                      prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5
                      prose-strong:font-semibold prose-strong:text-gray-900
                      prose-a:text-blue-600 prose-a:underline
                      prose-code:bg-gray-800 prose-code:text-green-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                      prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-gray-100
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
