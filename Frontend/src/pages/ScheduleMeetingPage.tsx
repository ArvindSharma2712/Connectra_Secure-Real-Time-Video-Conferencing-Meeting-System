import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import type { Meeting } from "../types";
import {
  Calendar,
  Copy,
  Check,
  MicOff,
  UserCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export const ScheduleMeetingPage: React.FC = () => {
  const { user } = useAppAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("45");
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyLink = () => {
    if (!createdMeeting) return;
    const link = `${window.location.origin}/room/${createdMeeting.meetingId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a meeting title");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const scheduledDate = new Date(date);
      const meeting = await meetingService.createMeeting({
        title: title.trim(),
        description: description.trim(),
        scheduledFor: scheduledDate.toISOString(),
        duration: parseInt(duration, 10) || 45,
        waitingRoom,
        muteOnEntry,
        hostUser: user,
      });

      setCreatedMeeting(meeting);
    } catch (err) {
      setError("Failed to schedule meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
        {createdMeeting ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Meeting Scheduled!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your meeting has been added to the calendar. Share the link below with your invitees.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400">Title</span>
                <p className="text-sm font-bold text-slate-900">{createdMeeting.title}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Scheduled Date & Time</span>
                <p className="text-xs font-semibold text-slate-800">
                  {new Date(createdMeeting.scheduledFor || "").toLocaleString([], {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Room Code</span>
                <p className="text-sm font-mono font-bold text-blue-600">{createdMeeting.meetingId}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400">Invitation Link</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/room/${createdMeeting.meetingId}`}
                    className="w-full text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setCreatedMeeting(null);
                  setTitle("");
                  setDescription("");
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Schedule Another Meeting
              </button>
              <button
                onClick={() => navigate(`/room/${createdMeeting.meetingId}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Start Meeting Room
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Plan Ahead</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Schedule a New Meeting
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your meeting agenda, timing, and security settings
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Architecture Review & Roadmap"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Agenda & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly outline topics to cover..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Security & Access Controls
                </span>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Waiting Room</span>
                      <p className="text-[11px] text-slate-400">Host approves attendees before they can enter</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={waitingRoom}
                    onChange={(e) => setWaitingRoom(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <MicOff className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Mute Participants on Entry</span>
                      <p className="text-[11px] text-slate-400">Attendee microphones are disabled automatically</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={muteOnEntry}
                    onChange={(e) => setMuteOnEntry(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scheduling meeting...</span>
                </>
              ) : (
                <>
                  <span>Save & Generate Invitation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
