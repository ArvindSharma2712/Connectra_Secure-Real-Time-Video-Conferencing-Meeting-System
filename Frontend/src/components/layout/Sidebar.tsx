import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Calendar,
  Disc,
  Settings,
  Plus,
  Radio,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAppAuth, isClerkConfigured, ClerkUserButton } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

interface SidebarProps {
  onOpenCreateModal: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateModal, onCloseMobile }) => {
  const { user, signOut } = useAppAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Meetings", href: "/meetings", icon: Video },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Recordings", href: "/recordings", icon: Disc },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
      {/* Top Branding & Main Action */}
      <div className="p-5 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center group">
            <img
              src="/brand_logo.png"
              alt="Connectra."
              className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </NavLink>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
            Pro
          </span>
        </div>

        {/* Primary "+ New Meeting" Action Button */}
        <button
          onClick={() => {
            onOpenCreateModal();
            onCloseMobile?.();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Meeting</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-blue-50/80 text-blue-600 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-blue-600 stroke-[2.2]"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Usage */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
        {/* Instant Join Quick Pill */}
        <div
          onClick={() => {
            navigate("/join");
            onCloseMobile?.();
          }}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/80 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">Join with code</span>
              <span className="text-[10px] text-slate-400">Enter meeting ID</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 overflow-hidden">
            {isClerkConfigured ? (
              <ClerkUserButton />
            ) : (
              <img
                src={user.image || user.imageUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 object-cover shrink-0"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
