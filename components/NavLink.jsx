"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "../store/useSidebar";

const NavLink = ({ href, children, variant = "default" }) => {
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const pathname = usePathname();

  const isActive = pathname === href;

  const baseStyles =
    "flex items-center gap-2 rounded-lg transition-all font-medium";

  const variants = {
    default:
      isActive
        ? "bg-[#E8EDFB] text-[#2D5BE3] px-3 py-2"
        : "text-gray-500 hover:bg-gray-100 px-3 py-2",

    cta:
      "px-5 py-3 bg-[#E8EDFB] text-[#2D5BE3] active:scale-95 ",
  };

  return (
    <Link
      href={href}
      onClick={closeSidebar}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;