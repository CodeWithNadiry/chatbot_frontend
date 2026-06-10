"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Header from "../../../../components/Header";
import Input from "../../../../components/conversations/Input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatAPI } from "../../../../lib/schemas/api/chat.api";
import { useConversationStore } from "../../../../store/useConversation";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import { Mail, X } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../../../store/useAuthStore";

const SingleConversation = () => {
  const queryClient = useQueryClient();
  const [emailDraft, setEmailDraft] = useState(null);
  const [toolName, setToolName] = useState("");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { conversationId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [userInput, setUserInput] = useState("");
  const [tempMessages, setTempMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { pendingMessages, clearPendingMessages } = useConversationStore();
  const hasPending = pendingMessages?.conversationId === conversationId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => chatAPI.getConversation(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (data) {
      clearPendingMessages();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempMessages([]);
    }
  }, [data, clearPendingMessages]);

  const serverMessages = data?.messages?.map((m) => ({
    role: m.role,
    content: m.content,
  })).reverse() || [];

  const baseMessages = data
    ? serverMessages
    : hasPending
    ? pendingMessages.messages
    : serverMessages;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = [...baseMessages, ...tempMessages];

  async function sendQuery(question) {
    console.log(question)
    if (!question.trim()) return;

    setOriginalQuestion(question); // save question before clearing
    setLoading(true);
    setIsStreaming(false);
    setTempMessages((prev) => [...prev, { role: "user", content: question }]);
    setUserInput("");

    const result = await chatAPI.sendQueryStream({
      question,
      conversationId,
      onChunk: (chunk, fullText) => {
        // only update UI if it's not an email draft
        if (!fullText.startsWith("{")) {
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
        }
      },
    });

    if (result.isEmailDraft) {
      // open modal with draft — don't show anything in chat yet
      setEmailDraft(result.emailDraftFromBackend.emailDraft);
      setToolName(result.emailDraftFromBackend.toolName);
      setEmailModalOpen(true);
    } else {
      // normal RAG — already shown via onChunk
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    setLoading(false);
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
          conversationId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { reply } = response.data;

      // show reply in chat
      setTempMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);

      setEmailModalOpen(false);
      setEmailDraft(null);

      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!conversationId) {
    router.push("/conversations");
    return null;
  }

  if (error) return <p className="p-4 text-red-500">{error.message}</p>;

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <Header title="Conversation" btnText="+ New Chat" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pt-10">

          <Modal open={emailModalOpen} onClose={() => setEmailModalOpen(false)}>
            <div className="flex flex-col gap-6 w-full max-sm:min-w-64 min-w-sm lg:min-w-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#E8EDFB] text-[#2D5BE3]">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Review your email</h2>
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
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={emailDraft?.subject || ""}
                    name="subject"
                    onChange={changeDraftValues}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2D5BE3] transition w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Message</label>
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
                <Button variant="secondary" onClick={() => setEmailModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>Send Email</Button>
              </div>
            </div>
          </Modal>

          <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-4">
            {messages.length > 0 ? (
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
                    <div className="prose max-w-none
                      prose-p:text-md prose-p:leading-7 prose-p:text-gray-800
                      prose-h1:text-4xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-3 prose-h1:mt-5
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mb-2 prose-h2:mt-4
                      prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mb-2 prose-h3:mt-3
                      prose-li:text-md prose-li:text-gray-700 prose-li:leading-7
                      prose-ul:my-2 prose-ul:pl-5
                      prose-ol:my-2 prose-ol:pl-5
                      prose-strong:font-semibold prose-strong:text-gray-900
                      prose-a:text-blue-600 prose-a:underline
                      prose-code:bg-gray-800 prose-code:text-green-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                      prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-gray-100
                    ">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 leading-7 text-[15px] text-gray-800">{children}</p>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))
            ) : isLoading ? (
              <p>Loading...</p>
            ) : null}

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