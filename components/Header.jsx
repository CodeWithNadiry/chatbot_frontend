'use client';

import { Menu } from "lucide-react";
import Button from "./Button";
import { useSidebarStore } from "../store/useSidebar";

const Header = ({ title, btnText, onClick }) => {
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  return (
    <div className="h-20 px-5 flex items-center justify-between border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        {/* MENU BUTTON */}
        <button
          onClick={openSidebar}
          className="md:hidden cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition"
        >
          <Menu size={18} />
        </button>

        {/* TITLE */}
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      {/* ACTION BUTTON */}
      {btnText && (
        <Button variant="secondary" onClick={onClick}>
          {btnText}
        </Button>
      )}
    </div>
  );
};

export default Header;