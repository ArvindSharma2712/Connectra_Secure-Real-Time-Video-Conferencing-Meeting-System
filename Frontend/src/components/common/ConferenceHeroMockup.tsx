import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MessageSquare,
  Smile,
  Disc,
  Users,
  Lock,
  Send,
  Bell,
  Volume2,
  LayoutGrid,
  Columns,
  ShieldCheck,
} from "lucide-react";

export const ConferenceHeroMockup: React.FC = () => {
  // 4-User Grid as the default view
  const [viewMode, setViewMode] = useState<"grid4" | "dual" | "chat">("grid4");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeReactions, setActiveReactions] = useState<string[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatList, setChatList] = useState([
    {
      id: 1,
      sender: "Sarah Chen",
      avatar: "/1.jpg",
      text: "Good morning team! Ready for the sprint roadmap sync 👋",
      time: "10:02 AM",
    },
    {
      id: 2,
      sender: "Alex Rivera",
      avatar: "/4.jpg",
      text: "Audio and video latency are ultra-low on Connectra ⚡",
      time: "10:03 AM",
    },
    {
      id: 3,
      sender: "Elena Rostova",
      avatar: "/3.jpg",
      text: "Screen sharing 1080p fidelity looks incredible! 🚀",
      time: "10:04 AM",
    },
  ]);

  // Meeting timer ticking
  const [secondsElapsed, setSecondsElapsed] = useState(34 * 60 + 12);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatList((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        avatar: "/1.jpg",
        text: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatMessage("");
  };

  const triggerReaction = (emoji: string) => {
    setActiveReactions((prev) => [...prev, emoji]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((e) => e !== emoji));
    }, 2500);
  };

  // The 4 users using ONLY the 4 photos provided in meetup-assets / public
  const users = [
    {
      id: "user-1",
      name: "Sarah Chen (Host)",
      photo: "/1.jpg",
      objectPosition: "object-[center_20%]",
      isSpeaking: true,
      hasRing: true,
      role: "Host",
    },
    {
      id: "user-2",
      name: "Alex Rivera",
      photo: "/4.jpg",
      objectPosition: "object-[center_18%]",
      isSpeaking: false,
      hasRing: false,
      role: "Engineering",
    },
    {
      id: "user-3",
      name: "Elena Rostova",
      photo: "/3.jpg",
      objectPosition: "object-[center_15%]",
      isSpeaking: false,
      hasRing: false,
      role: "Product Design",
    },
    {
      id: "user-4",
      name: "Marcus Vance",
      photo: "/2.jpg",
      objectPosition: "object-[center_22%]",
      isSpeaking: false,
      hasRing: false,
      role: "Architecture",
    },
  ];

  return (
    <div className="relative rounded-3xl p-2 sm:p-3 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-xl">
      {/* Floating Reaction Animation Overlay */}
      <div className="absolute top-16 right-1/3 pointer-events-none z-50 flex gap-2">
        {activeReactions.map((emoji, idx) => (
          <div
            key={idx}
            className="text-4xl animate-bounce drop-shadow-lg"
            style={{ animationDuration: "0.8s" }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="bg-[#0b101b] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        {/* Mockup Window Top Header */}
        <div className="px-4 py-3 bg-[#111726] border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Window Dots & Meeting Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/90 hover:opacity-80 transition-opacity cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-500/90 hover:opacity-80 transition-opacity cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/90 hover:opacity-80 transition-opacity cursor-pointer" />
            </div>

            <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
              Sprint Planning &amp; Roadmap Sync — Connectra HD
            </span>

            <span className="text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {formatTimer(secondsElapsed)}
            </span>
          </div>

          {/* Right: View Switcher & Floating Quick Tools */}
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 p-0.5 rounded-xl text-xs text-slate-300">
              <button
                onClick={() => setViewMode("grid4")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "grid4"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>4-Grid (2x2)</span>
              </button>
              <button
                onClick={() => setViewMode("dual")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "dual"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "hover:text-white"
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Dual (2x)</span>
              </button>
              <button
                onClick={() => setViewMode("chat")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "chat"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "hover:text-white"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>With Chat</span>
              </button>
            </div>

            {/* Quick action pill matching Reference */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 px-2 py-1 rounded-xl text-slate-200">
              <button
                onClick={() => triggerReaction("🔔")}
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="HD Audio"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={() => triggerReaction("🚀")}
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Reactions"
              >
                <Smile className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Encryption Pill */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px]">256-Bit TLS</span>
            </div>
          </div>
        </div>

        {/* VIEW 1 (DEFAULT): PERFECT 4-USER BALANCED 2x2 GRID */}
        {viewMode === "grid4" && (
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-[#0c1220]">
            {users.map((u) => (
              <div
                key={u.id}
                className={`relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-xl group transition-all ${
                  u.hasRing
                    ? "ring-3 ring-blue-500 shadow-blue-500/10"
                    : "ring-1 ring-slate-800 hover:ring-slate-700"
                }`}
              >
                {/* Photo perfectly fitted */}
                <img
                  src={u.photo}
                  alt={u.name}
                  className={`w-full h-full object-cover ${u.objectPosition} group-hover:scale-102 transition-transform duration-300`}
                />

                {/* Speaking Badge for Active Speaker */}
                {u.isSpeaking && (
                  <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Speaking</span>
                  </div>
                )}

                {/* 1080p indicator on host tile */}
                {u.hasRing && (
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>1080p HD</span>
                  </div>
                )}

                {/* Name Tag on bottom-left */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-2 shadow-md">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{u.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: DUAL 2-SPEAKER VIEW (Using Photo 1 and Photo 4) */}
        {viewMode === "dual" && (
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-[#0c1220]">
            {/* Tile 1: Sarah Chen (1.jpg) */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video ring-3 ring-blue-500 shadow-xl group">
              <img
                src="/1.jpg"
                alt="Sarah Chen"
                className="w-full h-full object-cover object-[center_20%] group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Active Speaker
              </div>
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-2 shadow-md">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Sarah Chen (Host)</span>
              </div>
            </div>

            {/* Tile 2: Alex Rivera (4.jpg) */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video ring-1 ring-slate-800 shadow-xl group">
              <img
                src="/4.jpg"
                alt="Alex Rivera"
                className="w-full h-full object-cover object-[center_18%] group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-2 shadow-md">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Alex Rivera</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: 4 USERS + IN-MEETING LIVE CHAT */}
        {viewMode === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#0c1220]">
            {/* Left 8 Cols: 4 Compact Tiles in 2x2 Grid */}
            <div className="lg:col-span-8 p-3 sm:p-4 grid grid-cols-2 gap-2.5">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`relative rounded-xl overflow-hidden bg-slate-900 aspect-video shadow-md ${
                    u.hasRing ? "ring-2 ring-blue-500" : "ring-1 ring-slate-800"
                  }`}
                >
                  <img
                    src={u.photo}
                    alt={u.name}
                    className={`w-full h-full object-cover ${u.objectPosition}`}
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="font-medium truncate max-w-[110px]">{u.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 4 Cols: Live Chat Panel */}
            <div className="lg:col-span-4 bg-[#0e1526] border-t lg:border-t-0 lg:border-l border-slate-800 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Chat</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    4 Online
                  </span>
                </div>

                <div className="space-y-2.5 py-2.5 max-h-[190px] overflow-y-auto">
                  {chatList.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 text-xs">
                      <img
                        src={msg.avatar}
                        alt={msg.sender}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="flex-1 bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                        <span className="font-semibold text-slate-200 text-[10px] block">
                          {msg.sender}
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="pt-2">
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <input
                    type="text"
                    placeholder="Say something..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none px-1"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* In-Call Controls Dock matching Zoom / ZEGOCLOUD reference */}
        <div className="py-3 px-4 bg-[#111726] border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          {/* Room ID */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-blue-400">qwe-rty-uio</span>
          </div>

          {/* Central Controls Dock */}
          <div className="flex items-center gap-2">
            {/* Audio Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isMuted
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? (
                <MicOff className="w-4 h-4 text-rose-400" />
              ) : (
                <Mic className="w-4 h-4 text-emerald-400" />
              )}
              <span className="hidden sm:inline">{isMuted ? "Muted" : "Mute"}</span>
            </button>

            {/* Video Camera Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                !isVideoOn
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
              title={isVideoOn ? "Stop Video" : "Start Video"}
            >
              {isVideoOn ? (
                <Video className="w-4 h-4 text-blue-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-rose-400" />
              )}
              <span className="hidden sm:inline">{isVideoOn ? "Video On" : "Video Off"}</span>
            </button>

            {/* Security Pill */}
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Security</span>
            </div>

            {/* Share Screen (Vibrant Green matching Zoom / Reference) */}
            <button
              onClick={() => triggerReaction("🖥️")}
              className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Share Screen"
            >
              <ScreenShare className="w-4 h-4" />
              <span className="hidden md:inline">Share Screen</span>
            </button>

            {/* Record */}
            <button
              onClick={() => triggerReaction("🔴")}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              title="Record Session"
            >
              <Disc className="w-4 h-4 text-rose-400" />
              <span className="hidden lg:inline">Record</span>
            </button>

            {/* Reactions */}
            <button
              onClick={() => triggerReaction("🎉")}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Send Reaction"
            >
              <Smile className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Reactions</span>
            </button>

            {/* Leave / End Call Button */}
            <div className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1">
              <span>End Meeting</span>
            </div>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Users className="w-4 h-4" />
            <span>4 participants</span>
          </div>
        </div>
      </div>
    </div>
  );
};
