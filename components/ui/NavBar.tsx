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

          {/* Logo Icon Box */}
          <div className="w-9 h-9 rounded-lg bg-[#e8f2ff] border border-[#d3e3f8] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h16M12 4v16"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Brand Name */}
          <div className="leading-tight">
            <div className="text-[17px] font-semibold text-[#103b73]">
              Opus-Med
            </div>
            <div className="text-[13px] text-[#6c7b8a]">
              AI Medical Document Analysis
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
