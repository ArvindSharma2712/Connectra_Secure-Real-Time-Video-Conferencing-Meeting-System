import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { meetingService } from "../services/meetingService";
import { CreateMeetingModal } from "../components/meetings/CreateMeetingModal";
import type { Meeting } from "../types";
import {
  Video,
  Search,
  Clock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Plus,
} from "lucide-react";

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "previous" | "all">("upcoming");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadMeetings = async () => {
    setLoading(true);
    const data = await meetingService.getMeetings();
    setMeetings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMeetings();
    const handleUpdate = () => loadMeetings();
    window.addEventListener("connectra-meetings-updated", handleUpdate);
    return () => window.removeEventListener("connectra-meetings-updated", handleUpdate);
  }, []);

  const handleCopy = (meetingId: string) => {
    const link = `${window.location.origin}/room/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm("Delete this meeting from your schedule?")) {
      await meetingService.deleteMeeting(id);
      loadMeetings();
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.meetingId.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "upcoming") {
      return m.status === "scheduled" || m.status === "active";
    }
    if (activeTab === "previous") {
      return m.status === "ended";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Meetings Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse upcoming video conferences, past history, and meeting credentials
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming & Live
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "previous"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Meetings
          </button>
        </div>

        <div className="relative px-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Meetings Found</h3>
          <p className="text-xs text-slate-500">
            {search
              ? "No meetings match your search query."
              : activeTab === "upcoming"
              ? "You have no upcoming meetings scheduled."
              : "No previous meetings recorded."}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Create a New Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    m.status === "active"
                      ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200 animate-pulse"
                      : m.status === "scheduled"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Video className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    {m.status === "active" ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                        Live Now
                      </span>
                    ) : m.status === "scheduled" ? (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Ended
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">{m.description || "No agenda specified"}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1 text-slate-600 font-sans">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(m.scheduledFor || m.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>Room: {m.meetingId}</span>
                    <span className="font-sans flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {m.participants?.length || 1} participant{m.participants?.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-sans text-slate-500">
                      Host: {m.host?.name || "Alex Rivera"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleCopy(m.meetingId)}
                  title="Copy Invitation Link"
                  className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  {copiedId === m.meetingId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleDelete(m.id)}
                  title="Delete Meeting"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/room/${m.meetingId}`)}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{m.status === "ended" ? "Rejoin" : "Start Meeting"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onMeetingCreated={() => loadMeetings()}
      />
    </div>
  );
};
