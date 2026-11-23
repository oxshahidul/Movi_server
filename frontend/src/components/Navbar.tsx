"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, Search, User, LogOut, Shield, Heart, Bookmark, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, openAuthModal, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies" },
    { name: "South Indian", href: "/movies?genre=south-indian" },
    { name: "TV Series", href: "/series" },
    { name: "My Library", href: "/library" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-cinema-950/90 backdrop-blur-md border-b border-cinema-700/40 shadow-xl"
          : "bg-gradient-to-b from-cinema-950/90 via-cinema-950/40 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cinema-red to-rose-700 flex items-center justify-center shadow-lg shadow-cinema-red/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-white">
                SCREEN<span className="text-cinema-red">BOX</span>
              </span>
              <span className="text-[10px] text-cinema-muted -mt-1 tracking-widest font-semibold uppercase">
                BDIX Cinema
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive ? "text-white font-semibold" : "text-cinema-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search Bar & User Authentication */}
        <div className="flex items-center space-x-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Titles, actors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cinema-900/80 border border-cinema-700/60 text-xs text-white placeholder-cinema-muted rounded-full pl-9 pr-4 py-2 w-48 lg:w-64 focus:outline-none focus:border-cinema-red focus:w-72 transition-all duration-300"
            />
            <Search className="w-4 h-4 text-cinema-muted absolute left-3 top-2.5" />
          </form>

          {/* User Account State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-cinema-850 border border-transparent hover:border-cinema-700 transition"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-cinema-red/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cinema-800 text-cinema-red flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-white hidden lg:inline-block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-cinema-muted" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-cinema-900/95 backdrop-blur-lg border border-cinema-700/60 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-cinema-800"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-cinema-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cinema-red/20 text-cinema-red">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-cinema-800/60 transition"
                    >
                      <User className="w-4 h-4 text-cinema-red" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-cinema-800/60 transition"
                    >
                      <Bookmark className="w-4 h-4 text-cinema-cyan" />
                      <span>Watchlist</span>
                    </Link>
                    <Link
                      href="/library?tab=favorites"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-cinema-800/60 transition"
                    >
                      <Heart className="w-4 h-4 text-cinema-red" />
                      <span>Favorites</span>
                    </Link>
                    {(user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "CONTENT_MANAGER") && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-cinema-800/60 transition"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Portal</span>
                      </Link>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-cinema-800/60 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="bg-cinema-red hover:bg-cinema-red-hover text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-cinema-red/30 transition transform hover:scale-105"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-cinema-muted hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cinema-900 border-b border-cinema-700 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cinema-950 border border-cinema-700 text-sm text-white placeholder-cinema-muted rounded-lg pl-9 pr-4 py-2.5"
            />
            <Search className="w-4 h-4 text-cinema-muted absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-cinema-800"
              >
                {link.name}
              </Link>
            ))}
            {user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-cinema-800"
              >
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
