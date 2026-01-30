'use client';

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<"login" | "signup">("login");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="w-full mx-auto px-8 relative z-30 bg-black/30 backdrop-blur-sm">
        <header className="flex justify-between items-center py-4 px-20">
          <Link href="/problems">
            <h1 className="text-[2.8rem] font-light text-white">
              Code<span className="text-yellow-500">Monk</span>
            </h1>
          </Link>

          <nav className="flex items-center gap-12">
            <Link
              href="/problems"
              className={`text-base tracking-[0.1rem] transition-colors duration-200 ease-in-out hover:text-yellow-500 ${
                pathname.startsWith("/problems") ? "text-yellow-500" : "text-white"
              }`}
            >
              Problems
            </Link>

            {!loading && user && (
              <Link
                href="/dashboard"
                className={`text-base tracking-[0.1rem] transition-colors duration-200 ease-in-out hover:text-yellow-500 ${
                  pathname.startsWith("/dashboard") ? "text-yellow-500" : "text-white"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {!loading && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-[#a7a7a7] text-black py-[0.4rem] px-6 rounded-[50px] text-base font-medium transition hover:bg-yellow-500"
              >
                <Avatar username={user.username} size="sm" />
                <span>{user.username}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-black border border-gray-700 rounded-xl overflow-hidden">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginModalMode("login");
                setLoginModalOpen(true);
              }}
              className="bg-[#a7a7a7] text-black py-[0.6rem] px-7 rounded-[50px] text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer hover:bg-yellow-500 z-50"
            >
              Sign In
            </button>
          )}
        </header>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultMode={loginModalMode}
      />
    </>
  );
}
