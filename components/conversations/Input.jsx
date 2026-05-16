"use client";

import { Send } from "lucide-react";
import { memo, useRef } from "react";

const Input = ({ input, setInput, send }) => {
  const textareaRef = useRef(null);

  const timeoutRef = useRef(null);

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