import React, { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { CreateMeetingModal } from "../meetings/CreateMeetingModal";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Disc,
  Settings,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { isClerkConfigured, useAppAuth, ClerkUserButton } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export const DashboardLayout: React.FC = () => {
  const { user } = useAppAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sessions", href: "/meetings", icon: Clock },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Recordings", href: "/recordings", icon: Disc },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[url('/layout_bg.png')] bg-cover bg-top bg-no-repeat text-slate-900 selection:bg-blue-600/10 selection:text-blue-700">
      {/* Floating Top Navbar matching MeetUp reference */}
      <header className="sticky top-3 z-40 max-w-7xl mx-auto w-[94%] sm:w-full px-4 sm:px-6 py-2.5 sm:py-3 mt-3 sm:mt-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center group">
            <img
              src="/brand_logo.png"
              alt="Connectra."
              className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-slate-100/90 text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Welcome, Great Stack + UserButton */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Meeting</span>
          </button>

          <span className="text-xs font-semibold text-slate-700 hidden md:inline">
            Welcome, {user.name}
          </span>

          <div className="flex items-center">
            {isClerkConfigured ? (
              <ClerkUserButton />
            ) : (
              <Link to="/settings" title="Profile">
                <img
                  src={user.image || user.imageUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-blue-500/20 object-cover"
                />
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 lg:hidden rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto w-[94%] mt-2 p-3 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-xl space-y-1 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Global Meeting Creation Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onMeetingCreated={() => {
          window.dispatchEvent(new Event("connectra-meetings-updated"));
        }}
      />
    </div>
  );
};
