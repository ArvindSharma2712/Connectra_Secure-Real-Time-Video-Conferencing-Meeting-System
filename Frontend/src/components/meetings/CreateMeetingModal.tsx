import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Video,
  Copy,
  Check,
  MicOff,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { meetingService } from "../../services/meetingService";
import { useAppAuth } from "../../context/AuthContext";
import type { Meeting } from "../../types";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated?: (meeting: Meeting) => void;
  initialType?: "instant" | "schedule";
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated,
  initialType = "instant",
}) => {
  const { user } = useAppAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"instant" | "schedule">(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("45");
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!createdMeeting) return;
    const link = `${window.location.origin}/room/${createdMeeting.meetingId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateInstant = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const meeting = await meetingService.createMeeting({
        title: title.trim() || `${user.firstName || user.name}'s Instant Meeting`,
        description: description.trim(),
        duration: 45,
        waitingRoom,
        muteOnEntry,
        hostUser: user,
      });

      setCreatedMeeting(meeting);
      onMeetingCreated?.(meeting);
    } catch (err) {
      setError("Failed to create meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a meeting title");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const scheduledDate = new Date(date);
      if (isNaN(scheduledDate.getTime())) {
        setError("Invalid date and time selected");
        setIsSubmitting(false);
        return;
      }

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
      onMeetingCreated?.(meeting);
    } catch (err) {
      setError("Failed to schedule meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCreatedMeeting(null);
    setTitle("");
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Video className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {createdMeeting
                  ? "Meeting Ready"
                  : activeTab === "instant"
                  ? "Start Instant Meeting"
                  : "Schedule a Meeting"}
              </h3>
              <p className="text-xs text-slate-500">
                {createdMeeting
                  ? "Share invitation details or join directly"
                  : "Set your meeting agenda and security settings"}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdMeeting ? (
          <div className="p-6 flex flex-col gap-5">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-emerald-900">
                  Meeting Successfully Created!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {createdMeeting.status === "scheduled"
                    ? `Scheduled for ${new Date(createdMeeting.scheduledFor || "").toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Your room is live and ready for participants to connect."}
                </p>
              </div>
            </div>

            {/* Room Info Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-medium">Meeting Title</span>
                <p className="text-sm font-bold text-slate-900">{createdMeeting.title}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Meeting Room ID</span>
                <p className="font-mono text-sm font-semibold text-blue-600">
                  {createdMeeting.meetingId}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Invitation URL</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/room/${createdMeeting.meetingId}`}
                    className="w-full text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-700 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetAndClose}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(`/room/${createdMeeting.meetingId}`);
                  resetAndClose();
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Join Room Now
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="p-6 flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("instant")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "instant"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Instant Meeting
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === "schedule"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Schedule for Later
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={activeTab === "instant" ? (e) => { e.preventDefault(); handleCreateInstant(); } : handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === "instant"
                      ? `${user.firstName || user.name}'s Quick Sync`
                      : "e.g., Weekly Product Architecture Review"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>

              {activeTab === "schedule" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Date & Time
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Description / Agenda (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Outline topics, agenda, or key outcomes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"
                    />
                  </div>
                </>
              )}

              {/* Security & Access Settings */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Access & Security
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">Waiting Room</span>
                      <span className="text-[11px] text-slate-400">Host must admit participants before they join</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={waitingRoom}
                    onChange={(e) => setWaitingRoom(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <MicOff className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">Mute on Entry</span>
                      <span className="text-[11px] text-slate-400">Microphone automatically muted upon joining</span>
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : activeTab === "instant" ? (
                    <>
                      <span>Start Instant Meeting</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Save & Schedule</span>
                      <Calendar className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
