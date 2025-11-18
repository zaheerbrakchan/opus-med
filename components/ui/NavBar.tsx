"use client";

import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const showUploadLink = pathname === "/results";

  return (
    <header className="bg-white border-b border-[#e6ecf3] shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT SIDE — LOGO + TEXT */}
        <div className="flex items-center gap-3">


          {/* Brand Name */}
          <div className="leading-tight">
            <div className="text-[13px] text-[#6c7b8a]">
             Smart Healthcare Intake & Triage Automation
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — ONLY SHOW ON RESULT PAGE */}
        <nav>
          {showUploadLink && (
            <a
              href="/"
              className="text-[#2563eb] text-sm font-medium hover:text-[#1e4fd5]"
            >
              Upload New Documents →
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
