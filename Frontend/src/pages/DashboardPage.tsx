import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import { CreateMeetingModal } from "../components/meetings/CreateMeetingModal";
import type { Meeting, MeetingStats } from "../types";
import {
  Video,
  Calendar,
  Radio,
  Disc,
  Clock,
  Users,
  Copy,
  Check,
  Search,
  ExternalLink,
  Trash2,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  ShieldCheck,
  Keyboard,
  ArrowRight,
  Plus,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAppAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "scheduled" | "ended">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"instant" | "schedule">("instant");
  const [quickMeetingCode, setQuickMeetingCode] = useState("");

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsData, statsData] = await Promise.all([
        meetingService.getMeetings(),
        meetingService.getStats(),
      ]);
      setMeetings(meetingsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to updates from other tabs/modals
    const handleUpdate = () => loadData();
    window.addEventListener("connectra-meetings-updated", handleUpdate);
    return () => window.removeEventListener("connectra-meetings-updated", handleUpdate);
  }, []);

  const handleCopyLink = (meetingId: string) => {
    const link = `${window.location.origin}/room/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteMeeting = async (id: number | string) => {
    if (confirm("Are you sure you want to remove this meeting?")) {
      await meetingService.deleteMeeting(id);
      loadData();
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMeetingCode.trim()) return;
    const clean = quickMeetingCode.trim().replace(/^https?:\/\/[^/]+\/room\//i, "");
    navigate(`/join?id=${encodeURIComponent(clean)}`);
  };

  const upcomingMeetings = meetings.filter(
    (m) => m.status === "scheduled" || m.status === "active"
  );
  const recentMeetings = meetings.filter((m) => m.status === "ended");

  const filteredUpcoming = upcomingMeetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meetingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Section matching MeetUp Reference Screenshot */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-10 pt-4 pb-6">
        {/* Left Column: Headline & Action Bar */}
        <div className="w-full lg:w-3/5 space-y-5">
          {/* Encryption Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-slate-200/70 text-slate-700 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Secure Peer-to-Peer Encryption</span>
          </div>

          {/* Bold Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            High quality video calls.
            <br />
            <span className="text-[#004cff]">Built for everyone.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
            Connect, collaborate, and celebrate from anywhere with ultra-low
            latency video, screen sharing, and real-time chat.
          </p>

          {/* Action Row: New Meeting + Input + Join */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Primary Blue '+ New Meeting' button */}
            <button
              onClick={() => {
                setModalType("instant");
                setModalOpen(true);
              }}
              className="px-6 py-3 text-sm font-bold text-white bg-[#004cff] hover:bg-[#0033ad] active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Meeting</span>
            </button>

            {/* Input with Keyboard icon & Join Button */}
            <form onSubmit={handleJoinByCode} className="flex items-center gap-2.5 flex-1 max-w-md">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/95 border border-slate-200/80 rounded-xl shadow-xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all flex-1">
                <Keyboard className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter meeting code (e.g. abc-def-ghi)"
                  value={quickMeetingCode}
                  onChange={(e) => setQuickMeetingCode(e.target.value)}
                  className="outline-none bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 w-full font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!quickMeetingCode.trim()}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-500 hover:bg-slate-600 active:bg-slate-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <span>Join</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Glassmorphism Live Digital Clock Card */}
        <div className="w-full lg:w-2/5 max-w-md bg-white/75 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 space-y-6">
          <div className="text-base font-semibold text-slate-800">
            Hi, {user.firstName || user.name}
          </div>

          {/* Clock Display */}
          <div className="text-center py-2 space-y-1">
            <div className="text-5xl sm:text-6xl font-normal text-slate-900 tracking-tight font-sans">
              {formattedTime}
            </div>
            <div className="text-sm font-medium text-slate-500">
              {formattedDate}
            </div>
          </div>

          {/* Logged in as + Tier badge */}
          <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200/70">
            <span className="text-slate-600 truncate max-w-[210px]">
              Logged in as:{" "}
              <span className="font-semibold text-slate-900">{user.email}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#004cff] text-white font-bold text-[10px] uppercase tracking-wider shrink-0">
              PREMIUM
            </span>
          </div>

          {/* Monthly Meetings Pill */}
          <div className="p-3 bg-blue-50/70 border border-blue-100/80 rounded-2xl flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Monthly Meetings</span>
            <span className="font-mono text-slate-700 font-semibold">
              {meetings.length} Created (Unlimited)
            </span>
          </div>
        </div>
      </section>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: New Meeting */}
        <div
          onClick={() => {
            setModalType("instant");
            setModalOpen(true);
          }}
          className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Video className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Instant Meeting
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Start a live video call and invite participants immediately
          </p>
        </div>

        {/* Card 2: Schedule */}
        <div
          onClick={() => {
            setModalType("schedule");
            setModalOpen(true);
          }}
          className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Schedule Meeting
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Plan future discussions with agenda, date & duration
          </p>
        </div>

        {/* Card 3: Join Meeting */}
        <div
          onClick={() => navigate("/join")}
          className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Radio className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            Join with Code
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pre-flight audio & video check before joining a room
          </p>
        </div>

        {/* Card 4: Recordings */}
        <div
          onClick={() => navigate("/recordings")}
          className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Disc className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
            Cloud Recordings
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Replay and download past recorded team sessions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Meetings Hosted</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.monthlyCount || meetings.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Minutes</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.totalMinutes || 1420}m
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            HD streaming time
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Plan</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 capitalize">
            {stats?.plan || "Premium"}
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            Unlimited participants
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Sessions</span>
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {meetings.filter((m) => m.status === "active").length}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Rooms in session
          </p>
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming & Active Meetings</h2>
            <p className="text-xs text-slate-500">
              Scheduled calls, standing syncs, and currently active rooms
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all w-40 sm:w-52"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-slate-600 font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="scheduled">Scheduled Only</option>
            </select>
          </div>
        </div>

        {/* Meeting List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading meetings...</p>
          </div>
        ) : filteredUpcoming.length === 0 ? (
          <div className="py-12 text-center max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Upcoming Meetings</h4>
            <p className="text-xs text-slate-500">
              You have no meetings scheduled that match your current filter. Create a new instant meeting or plan ahead.
            </p>
            <button
              onClick={() => {
                setModalType("schedule");
                setModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
            >
              Schedule a Meeting
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUpcoming.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Meeting Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      meeting.status === "active"
                        ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200 animate-pulse"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Video className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {meeting.title}
                      </h4>
                      {meeting.status === "active" ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                          Live Now
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                          Scheduled
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {meeting.description || "Team discussion and collaborative session"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1 text-slate-600 font-sans">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(meeting.scheduledFor || meeting.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>ID: {meeting.meetingId}</span>
                      <span className="font-sans flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {meeting.participants?.length || 1} participant{meeting.participants?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleCopyLink(meeting.meetingId)}
                    title="Copy Invitation Link"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/70 transition-colors cursor-pointer"
                  >
                    {copiedId === meeting.meetingId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    title="Delete Meeting"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/70 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/room/${meeting.meetingId}`)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{meeting.status === "active" ? "Join Call" : "Start"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Meeting History */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Meeting Sessions</h2>
            <p className="text-xs text-slate-500">Previous conferences and completed calls</p>
          </div>
          <Link
            to="/meetings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all history <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentMeetings.slice(0, 3).map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{meeting.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>
                      {new Date(meeting.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>Duration: {meeting.duration || 45} mins</span>
                    <span>•</span>
                    <span>{meeting.participants?.length || 1} attended</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  Ended
                </span>
                <button
                  onClick={() => navigate(`/room/${meeting.meetingId}`)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Rejoin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateMeetingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
        onMeetingCreated={() => loadData()}
      />
    </div>
  );
};
