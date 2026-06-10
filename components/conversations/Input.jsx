"use client";

import { Send, Mail, CheckCircle } from "lucide-react";
import { memo, useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import axios from "axios";

const Input = ({ input, setInput, send }) => {
  const { token } = useAuthStore();
  const textareaRef = useRef(null);
  const timeoutRef = useRef(null);

  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);

  // Check Gmail connection status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await axios.get(
          `https://chatbotbackend-production-dc6c.up.railway.app/integrations/google/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setGmailConnected(res.data.connected);
      } catch (err) {
        console.error("Failed to check Gmail status", err);
      }
    }

    checkStatus();
  }, []);

  // Check if redirected back from Google OAuth with ?gmail=connected
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGmailConnected(true);
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleConnectGmail() {
  try {
    setGmailLoading(true);

    const res = await axios.get(
      "https://chatbotbackend-production-dc6c.up.railway.app/integrations/google/url",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    window.location.href = res.data.url;
  } catch (err) {
    console.error("Failed to get Gmail auth URL", err);
    setGmailLoading(false);
  }
}

  function handleChange(e) {
    setInput(e.target.value);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
    }, 50);
  }

  function resetTextareaHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
  }

  function handleSend() {
    if (!input.trim()) return;
    send(input);
    setInput("");
    resetTextareaHeight();
  }

  return (
    <div className="w-full bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Gmail Connect Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleConnectGmail}
            disabled={gmailConnected || gmailLoading}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all
              ${
                gmailConnected
                  ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer"
              }`}
          >
            {gmailConnected ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Gmail Connected
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                {gmailLoading ? "Connecting..." : "Connect Gmail"}
              </>
            )}
          </button>
        </div>

        {/* Input Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-end gap-3 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            rows={1}
            placeholder="Ask something..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="
              flex-1
              resize-none
              outline-none
              bg-transparent
              text-sm
              sm:text-base
              overflow-y-auto
              scrollbar-hide
              max-h-65
            "
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl cursor-pointer disabled:cursor-not-allowed ${
              input.trim()
                ? "bg-[#2D5BE3] text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(Input);
