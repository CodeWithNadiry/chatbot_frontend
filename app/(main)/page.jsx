'use client';

import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import NavLink from "../../components/NavLink";
import { FileText, MessageSquare, UploadCloud } from "lucide-react";

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">

      {/* HEADER */}
      <Header
        title="Home"
        btnText="Upload"
        onClick={() => router.push('/documents')}
      />

      {/* CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">

        <div className="max-w-4xl mx-auto flex flex-col gap-10">

          {/* HERO */}
          <div className="text-center flex flex-col gap-4">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-xl bg-[#E8EDFB] text-[#2D5BE3]">
              <UploadCloud size={26} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Build your AI knowledge base
            </h1>

            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              Upload documents, process them into smart chunks, and start chatting
              with your data instantly.
            </p>

            <div className="flex gap-3 justify-center mt-2">
              <NavLink href="/documents" variant="cta">
                <UploadCloud size={18} />
                <span>Upload Documents</span>
              </NavLink>

              <NavLink href="/conversations" variant="cta">
                <MessageSquare size={18} />
                <span>Start Conversation</span>
              </NavLink>
            </div>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8EDFB] flex items-center justify-center text-[#2D5BE3]">
                  <FileText size={18} />
                </div>
                <h3 className="font-medium text-gray-900">
                  Smart Document Processing
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Automatically chunk and embed your documents for fast semantic search.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8EDFB] flex items-center justify-center text-[#2D5BE3]">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-medium text-gray-900">
                  AI Conversations
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Ask questions in natural language and get answers from your documents.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Page;