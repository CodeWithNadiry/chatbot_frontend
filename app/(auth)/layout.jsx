"use client";

import Image from "next/image";

const AuthLayout = ({children }) => {
  return (
  <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">

    <div className="w-full max-w-md">

      {/* CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#E8EDFB] flex items-center justify-center">
            <Image
              src="/images/favicon.svg"
              alt="logo"
              width={24}
              height={24}
            />
          </div>

          <h1 className="mt-3 text-lg font-semibold text-gray-900">
            IntelliChat
          </h1>
          <p className="text-xs text-gray-500">
            AI Knowledge Base
          </p>
        </div>

        {children}

      </div>

    </div>
  </div>
);
};

export default AuthLayout;