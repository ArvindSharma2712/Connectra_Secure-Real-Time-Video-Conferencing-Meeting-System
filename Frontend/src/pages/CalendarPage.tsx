import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { meetingService } from "../services/meetingService";
import { CreateMeetingModal } from "../components/meetings/CreateMeetingModal";
import type { Meeting } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await meetingService.getMeetings();
      setMeetings(data);
    }
    load();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleCopyLink = (meetingId: string) => {
    const link = `${window.location.origin}/room/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Find meetings on selected day
  const meetingsOnSelectedDay = meetings.filter((m) => {
    const mDate = new Date(m.scheduledFor || m.createdAt);
    return (
      mDate.getDate() === selectedDate.getDate() &&
      mDate.getMonth() === selectedDate.getMonth() &&
      mDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Meeting Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan, coordinate, and review team conferencing schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-slate-800 font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid View (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-100 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl" />;
              }

              const isSelected =
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear();

              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              const dayMeetings = meetings.filter((m) => {
                const mDate = new Date(m.scheduledFor || m.createdAt);
                return (
                  mDate.getDate() === day.getDate() &&
                  mDate.getMonth() === day.getMonth() &&
                  mDate.getFullYear() === day.getFullYear()
                );
              });

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : isSelected
                          ? "text-blue-600 font-extrabold"
                          : "text-slate-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {dayMeetings.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.2 rounded-full">
                        {dayMeetings.length}
                      </span>
                    )}
                  </div>

                  {/* Meeting Pills */}
                  <div className="space-y-1 overflow-hidden">
                    {dayMeetings.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800"
                      >
                        {m.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{dayMeetings.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Pane (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected Day
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDate.toLocaleDateString([], {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                title="Add Meeting"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {meetingsOnSelectedDay.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No meetings on this day</p>
                <p className="text-xs text-slate-400">Your calendar is completely open</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Schedule Sync
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetingsOnSelectedDay.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {m.meetingId}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
                        {m.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(m.scheduledFor || m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span>{m.duration || 45} mins</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                      <button
                        onClick={() => handleCopyLink(m.meetingId)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === m.meetingId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === m.meetingId ? "Copied" : "Copy Link"}</span>
                      </button>

                      <button
                        onClick={() => navigate(`/room/${m.meetingId}`)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateMeetingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType="schedule"
        onMeetingCreated={() => {
          meetingService.getMeetings().then(setMeetings);
        }}
      />
    </div>
  );
};
