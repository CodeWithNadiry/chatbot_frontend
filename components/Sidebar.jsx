"use client";

import Image from "next/image";
import NavLink from "./NavLink";
import { FileText, MessageSquare, X, House } from "lucide-react";
import { useEffect, useState } from "react";
import { useConversationStore } from "../store/useConversation";
import { useRouter, usePathname } from "next/navigation";
import { useSidebarStore } from "../store/useSidebar";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {token} = useAuthStore();

  const { isOpen, closeSidebar } = useSidebarStore();
  const { refreshChats } = useConversationStore();

  const [conversations, setConversations] = useState([]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("https://chatbotbackend-production-dc6c.up.railway.app/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
  }, [refreshChats]);

  function handleChangeRoute(id) {
    router.push(`/conversations/${id}`);
    closeSidebar();
  }

  const activeId = pathname?.split("/").pop();

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div
        className={`
          fixed md:static top-0 left-0 z-50
          w-64 h-screen bg-white border-r border-gray-200
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* HEADER (fixed height) */}
        <div className="border-b border-gray-200 flex items-center justify-between p-5 shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              router.push("/");
              closeSidebar();
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E8EDFB]">
              <Image
                src="/images/favicon.svg"
                alt="logo"
                width={22}
                height={22}
              />
            </div>

            <div className="flex flex-col leading-tight">
              <p className="font-semibold text-gray-900 text-sm">IntelliChat</p>
              <p className="text-xs text-gray-500">AI Knowledge Base</p>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {/* NAV LINKS (DO NOT TOUCH STYLES) */}
          <div className="flex flex-col gap-2">
            <NavLink href="/" onClick={closeSidebar}>
              <House size={18} />
              <span className="text-sm">Home</span>
            </NavLink>

            <NavLink href="/documents" onClick={closeSidebar}>
              <FileText size={18} />
              <span className="text-sm">Documents</span>
            </NavLink>

            <NavLink href="/conversations" onClick={closeSidebar}>
              <MessageSquare size={18} />
              <span className="text-sm">New Chat</span>
            </NavLink>
          </div>

          {/* RECENTS LABEL */}
          <p className="text-sm text-gray-400 mt-6 ml-4 font-semibold">
            Recents
          </p>

          {/* CONVERSATIONS */}
          <div className="mt-2 flex flex-col gap-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-2">
                No recent chats yet
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  onClick={() => handleChangeRoute(conv.conversationId)}
                  className={`
                    px-3 py-2 rounded-md cursor-pointer text-sm
                    ${
                      activeId === conv.conversationId
                        ? "bg-gray-100 text-black"
                        : "hover:bg-gray-100"
                    }
                  `}
                >
                  {conv.title}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
