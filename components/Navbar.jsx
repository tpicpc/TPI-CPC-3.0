"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { navLink } from "@/lib/assets";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  DiamondPlus,
  Facebook,
  FolderGit2,
  LayoutDashboard,
  PenSquare,
  Github,
  Instagram,
  Linkedin,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const { darkMode, setDarkMode } = useTheme();
  const { loading, userData, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    setMobileOpen(false);
    router.push("/login");
  };

  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`relative transition-all duration-300 ${
        scrolled
          ? "bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      {scrolled && (
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200/80 dark:via-white/10 to-transparent" />
      )}

      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 container mx-auto">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <img
            className="w-[80px] sm:w-[100px] h-[36px] sm:h-[44px] object-contain transition-transform group-hover:scale-105"
            src="/tpicpc_logo.png"
            alt="TPI CPC"
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-1 rounded-full px-1.5 py-1.5 bg-gray-100/60 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 backdrop-blur-md">
          {navLink.map((link) => {
            const active = isActive(link.path);
            return (
              <li key={link.id} className="relative">
                <Link
                  href={link.path}
                  className={`relative block px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                    active
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition relative overflow-hidden"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={darkMode ? "sun" : "moon"}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {loading ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <LoaderCircle className="animate-spin h-5 w-5 text-gray-500" />
            </div>
          ) : userData ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                onClick={() => setProfileDropdown(!profileDropdown)}
              >
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white dark:ring-gray-800">
                    {userData.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 hidden sm:block ${
                    profileDropdown ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl rounded-xl z-50 border border-gray-200/60 dark:border-white/10 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userData.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData.email}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition font-medium"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <LayoutDashboard size={15} className="text-indigo-500" /> My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <User size={15} className="text-gray-500" /> Profile
                      </Link>
                      <Link
                        href="/add-review"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <DiamondPlus size={15} className="text-gray-500" /> Add Review
                      </Link>
                      <Link
                        href="/submit-blog"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <PenSquare size={15} className="text-gray-500" /> Write a Blog
                      </Link>
                      <Link
                        href="/submit-project"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <FolderGit2 size={15} className="text-gray-500" /> Submit Project
                      </Link>
                    </div>
                    <div className="p-1 border-t border-gray-100 dark:border-white/5">
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/signup")}
              className="hidden sm:inline-flex h-9 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white shadow-md shadow-indigo-500/20"
            >
              Join Us
            </Button>
          )}

          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 w-[88%] max-w-sm h-[100dvh] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl shadow-2xl flex flex-col z-50 border-l border-gray-200/60 dark:border-white/10 lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
                <img
                  className="w-[90px] h-[40px] object-contain"
                  src="/tpicpc_logo.png"
                  alt="TPI CPC"
                />
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="text-gray-700 dark:text-gray-200" size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {userData && (
                  <div className="px-5 py-4 mx-3 mt-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-3">
                      {userData.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt={userData.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-900">
                          {userData.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {userData.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-3 pt-4 pb-2">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Menu
                  </p>
                  <ul className="flex flex-col gap-1">
                    {navLink.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={link.path}
                          className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                            isActive(link.path)
                              ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-[0.98]"
                          }`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {userData && (
                  <div className="px-3 pt-2 pb-2">
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                      Account
                    </p>
                    <ul className="flex flex-col gap-1">
                      <li>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        >
                          <User size={16} className="text-gray-500" /> Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/add-review"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                        >
                          <DiamondPlus size={16} className="text-gray-500" /> Add Review
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="px-3 pt-2 pb-2">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Preferences
                  </p>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-3">
                      {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                      {darkMode ? "Light mode" : "Dark mode"}
                    </span>
                    <span className={`relative inline-flex h-5 w-9 rounded-full transition ${darkMode ? "bg-indigo-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 ${darkMode ? "right-0.5" : "left-0.5"} h-4 w-4 rounded-full bg-white shadow transition-all`} />
                    </span>
                  </button>
                </div>

                <div className="px-3 pt-4 pb-4 border-t border-gray-100 dark:border-white/5 mt-2">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    Connect
                  </p>
                  <div className="flex items-center gap-2 px-3">
                    {[
                      { href: "https://web.facebook.com/groups/tpicpc", Icon: Facebook, label: "Facebook" },
                      { href: "https://github.com/tpicpc", Icon: Github, label: "GitHub" },
                      { href: "https://www.linkedin.com/company/tpicpc", Icon: Linkedin, label: "LinkedIn" },
                      { href: "https://www.youtube.com/@tpicpc", Icon: Youtube, label: "YouTube" },
                      { href: "https://www.instagram.com/tpicpc", Icon: Instagram, label: "Instagram" },
                    ].map(({ href, Icon, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-indigo-500 hover:text-white transition"
                      >
                        <Icon size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-4 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20">
                {userData ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-red-200 dark:border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => router.push("/signup")}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white shadow-md shadow-indigo-500/20"
                    >
                      Join Us
                    </Button>
                    <Button
                      onClick={() => router.push("/login")}
                      variant="outline"
                      className="w-full h-11 rounded-xl"
                    >
                      <LogIn size={16} className="mr-2" /> Sign in
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
