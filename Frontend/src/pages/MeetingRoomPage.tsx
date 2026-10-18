import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import type { Meeting, ChatMessage } from "../types";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Users,
  MessageSquare,
  Smile,
  PhoneOff,
  Copy,
  Check,
  Lock,
  X,
  Send,
  Hand,
  Grid,
  Info,
  Pin,
  PinOff,
  Circle,
  Square,
  UserPlus,
} from "lucide-react";

export interface RemoteParticipantState {
  id: string;
  name: string;
  email: string;
  image?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
}

interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "recording";
  image?: string;
}

// Optional mock test participants (ONLY added if the host explicitly clicks 'Invite Test Participant')
const TEST_PARTICIPANTS: RemoteParticipantState[] = [
  {
    id: "user_mock_002",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    isSpeaking: true,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
  },
  {
    id: "user_mock_003",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    isSpeaking: false,
    isMuted: true,
    isVideoOff: false,
    isHandRaised: true,
  },
  {
    id: "user_mock_004",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80",
    isSpeaking: false,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
  },
];

export const MeetingRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAppAuth();
  const navigate = useNavigate();

  const [, setMeeting] = useState<Meeting | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("Connectra Meeting");

  // Media States
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Recording State: strictly false (inactive) by default!
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Layout & UI
  const [activeSideDrawer, setActiveSideDrawer] = useState<"none" | "chat" | "participants" | "details">("none");
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [copiedLink, setCopiedLink] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  // Participants: starts with ONLY the host (empty remote participants list)
  // No one enters until and unless the link is shared or invited!
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipantState[]>([]);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Chat: clean initial chat (no dummy messages)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Local Media Stream
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Meeting Elapsed Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const addToast = (toast: Omit<ToastNotification, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Recording toggle handler
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      addToast({
        title: "Recording Started",
        description: "This session is now being recorded.",
        type: "recording",
      });
    } else {
      setIsRecording(false);
      addToast({
        title: "Recording Stopped",
        description: `Saved session recording (${formatTimer(recordingSeconds)}).`,
        type: "success",
      });

      // Persist recording record
      meetingService.createRecording({
        meetingId: roomId || "connectra-session",
        title: `${meetingTitle} - Session Recording`,
        duration: formatTimer(recordingSeconds),
        fileSize: `${Math.max(14, Math.round(recordingSeconds * 0.9))} MB`,
        thumbnail: user.imageUrl || user.image,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        hostName: user.name || "Arvind Sharma",
      });
    }
  };

  // Optional manual test invite for host verification
  const handleInviteTestParticipant = () => {
    const next = TEST_PARTICIPANTS.find(
      (tp) => !remoteParticipants.some((p) => p.id === tp.id)
    );
    if (!next) {
      addToast({
        title: "All Test Participants Added",
        description: "To add real participants, copy and share the meeting link.",
        type: "info",
      });
      return;
    }

    setRemoteParticipants((prev) => [...prev, next]);
    addToast({
      title: `${next.name} joined`,
      description: "Test participant joined the room.",
      image: next.image,
      type: "info",
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        senderId: "system",
        senderName: "System",
        text: `${next.name} joined the meeting`,
        timestamp: "Just now",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystem: true,
      },
    ]);
  };

  // Load meeting data
  useEffect(() => {
    async function load() {
      if (!roomId) return;
      const found = await meetingService.getMeetingById(roomId);
      if (found) {
        setMeeting(found);
        setMeetingTitle(found.title);
      } else {
        setMeetingTitle(`Meeting: ${roomId}`);
      }
    }
    load();
  }, [roomId]);

  // Read preferences if set from Join page
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("connectra_join_prefs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.micEnabled === "boolean") setMicEnabled(parsed.micEnabled);
        if (typeof parsed.cameraEnabled === "boolean") setCameraEnabled(parsed.cameraEnabled);
      }
    } catch {}
  }, []);

  // Elapsed Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start local camera stream
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const vTrack = stream.getVideoTracks()[0];
        if (vTrack) vTrack.enabled = cameraEnabled;
        const aTrack = stream.getAudioTracks()[0];
        if (aTrack) aTrack.enabled = micEnabled;
      } catch (err) {
        console.warn("Could not acquire camera/mic stream in meeting:", err);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Sync mic track
  const toggleMic = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) track.enabled = !micEnabled;
    }
    setMicEnabled(!micEnabled);
  };

  // Sync camera track
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) track.enabled = !cameraEnabled;
    }
    setCameraEnabled(!cameraEnabled);
  };

  // Screen share handler
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        setScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        console.warn("Screen share cancelled or unsupported", err);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenSharing(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addToast({
      title: "Link Copied!",
      description: "Meeting link copied to clipboard. Share it with your invitees.",
      type: "success",
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name || "You",
      text: chatInput.trim(),
      timestamp: "Just now",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isLocal: true,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddReaction = (emoji: string) => {
    const id = Date.now();
    const x = Math.floor(Math.random() * 40) + 30;
    setReactions((prev) => [...prev, { id, emoji, x }]);
    setShowReactionsMenu(false);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);
  };

  const handleLeaveMeeting = () => {
    if (confirm("Are you sure you want to leave this meeting?")) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      navigate("/dashboard");
    }
  };

  // Local user profile photo from Clerk Authentication
  const userProfilePhoto = user.imageUrl || user.image;

  // Local tile descriptor
  const localParticipantData = {
    id: "local_user",
    name: user.name || "Arvind Sharma",
    email: user.email,
    image: userProfilePhoto,
    isSpeaking: false,
    isMuted: !micEnabled,
    isVideoOff: !cameraEnabled,
    isHandRaised: handRaised,
    isLocal: true,
  };

  const allParticipants = [localParticipantData, ...remoteParticipants];
  const totalParticipantsCount = allParticipants.length;

  // Generic Participant Tile Renderer
  const renderParticipantTile = (
    participant: {
      id: string;
      name: string;
      email?: string;
      image?: string;
      isSpeaking: boolean;
      isMuted: boolean;
      isVideoOff: boolean;
      isHandRaised: boolean;
      isLocal?: boolean;
    },
    variant: "two-up" | "multi" | "single" | "spotlight" | "thumbnail" = "multi"
  ) => {
    const isPinned = pinnedParticipantId === participant.id;
    const isSpotlight = variant === "spotlight";
    const isThumbnail = variant === "thumbnail";
    const isTwoUp = variant === "two-up";
    const isSingle = variant === "single";

    // Use Clerk auth photo for local user, or participant's real image
    const photoUrl = participant.isLocal ? userProfilePhoto : participant.image;

    return (
      <div
        key={participant.id}
        className={`relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center transition-all duration-500 group select-none ${
          isThumbnail
            ? "w-44 h-28 shrink-0 rounded-xl"
            : isSpotlight
            ? "w-full h-full max-h-[64vh] aspect-video"
            : isTwoUp
            ? "w-full h-full max-h-[72vh] min-h-[380px] md:min-h-[460px] aspect-[16/10] md:aspect-video"
            : isSingle
            ? "w-full h-full max-h-[70vh] min-h-[380px] md:min-h-[500px] aspect-video"
            : "w-full h-full max-h-[38vh] min-h-[220px] md:min-h-[280px] aspect-video"
        } ${
          participant.isSpeaking
            ? "ring-2 md:ring-3 ring-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            : isPinned
            ? "ring-2 ring-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.25)]"
            : "ring-1 ring-slate-800/90 hover:ring-slate-700/80"
        }`}
      >
        {/* Video / Photo State */}
        {participant.isLocal ? (
          cameraEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              {/* Soft blurred ambient glow using Clerk profile photo */}
              {photoUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none"
                  style={{ backgroundImage: `url(${photoUrl})` }}
                />
              )}

              {/* Real Clerk Profile Picture */}
              <div className="relative z-10">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={participant.name}
                    className={`rounded-full object-cover shadow-2xl ring-4 ring-blue-500/50 ${
                      isSingle || isTwoUp
                        ? "w-28 h-28 md:w-36 md:h-36"
                        : "w-16 h-16 md:w-20 md:h-20"
                    }`}
                  />
                ) : (
                  <div
                    className={`rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shadow-2xl ring-4 ring-slate-800/80 ${
                      isSingle || isTwoUp
                        ? "w-28 h-28 md:w-36 md:h-36 text-4xl md:text-5xl"
                        : "w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl"
                    }`}
                  >
                    {participant.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-sm md:text-base font-bold text-slate-100">{participant.name}</span>
                <span className="text-xs text-slate-400 bg-slate-800/90 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-slate-700/50">
                  <VideoOff className="w-3 h-3 text-slate-400" />
                  <span>Camera Off</span>
                </span>
              </div>
            </div>
          )
        ) : !participant.isVideoOff && participant.image ? (
          <img
            src={participant.image}
            alt={participant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            {participant.image && (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${participant.image})` }}
              />
            )}

            <div className="relative z-10">
              {participant.image ? (
                <img
                  src={participant.image}
                  alt={participant.name}
                  className={`rounded-full object-cover shadow-2xl ring-4 ring-slate-700/80 ${
                    isTwoUp ? "w-28 h-28 md:w-36 md:h-36" : "w-16 h-16 md:w-20 md:h-20"
                  }`}
                />
              ) : (
                <div
                  className={`rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center ring-4 ring-slate-700/80 shadow-2xl ${
                    isTwoUp ? "w-24 h-24 md:w-32 md:h-32 text-3xl md:text-5xl" : "w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl"
                  }`}
                >
                  {participant.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-sm md:text-base font-bold text-slate-100">{participant.name}</span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">Camera Off</span>
            </div>
          </div>
        )}

        {/* Top-Left: Active Speaking Indicator */}
        {participant.isSpeaking && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-blue-600/90 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-in fade-in zoom-in duration-200 z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Speaking</span>
          </div>
        )}

        {/* Top-Right: Hand Raised & Pin Toggle Action */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-2 z-10">
          {participant.isHandRaised && (
            <div className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg animate-bounce">
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hand Raised</span>
            </div>
          )}

          {!isThumbnail && totalParticipantsCount > 1 && (
            <button
              onClick={() => setPinnedParticipantId(isPinned ? null : participant.id)}
              className={`p-1.5 md:p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                isPinned
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100"
              }`}
              title={isPinned ? "Unpin participant" : "Pin participant"}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Pin className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </button>
          )}
        </div>

        {/* Bottom-Left: Name & Mic Audio Status Badge */}
        <div
          className={`absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-semibold text-white flex items-center gap-2 md:gap-2.5 shadow-xl border border-white/10 z-10 max-w-[85%] ${
            isTwoUp || isSingle ? "text-sm sm:text-base md:text-lg" : "text-xs sm:text-sm md:text-base"
          }`}
        >
          {participant.isMuted ? (
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <MicOff className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Mic className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
          )}

          <span className="truncate">
            {participant.name} {participant.isLocal ? "(You)" : ""}
          </span>

          {participant.isSpeaking && (
            <div className="flex items-end gap-0.5 h-3.5 px-0.5 shrink-0" title="Voice detected">
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5 [animation-delay:150ms]" />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 [animation-delay:300ms]" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stage Layout Rendering
  const renderMeetingStage = () => {
    // 1. Screen Sharing Layout
    if (screenSharing) {
      return (
        <div className="w-full h-full flex flex-col gap-3 justify-center items-center max-w-7xl mx-auto">
          <div className="flex-1 w-full max-h-[58vh] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 border-2 border-blue-500/80 shadow-2xl relative aspect-video flex items-center justify-center">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
              <ScreenShare className="w-4 h-4" />
              <span className="font-semibold">You are presenting your screen</span>
            </div>
          </div>

          <div className="w-full h-28 md:h-32 flex gap-3 justify-center items-center overflow-x-auto py-1">
            {allParticipants.map((p) => renderParticipantTile(p, "thumbnail"))}
          </div>
        </div>
      );
    }

    // 2. Speaker View or Pinned Participant Mode
    if (viewMode === "speaker" || pinnedParticipantId) {
      const pinnedUser =
        allParticipants.find((p) => p.id === pinnedParticipantId) ||
        allParticipants.find((p) => p.isSpeaking) ||
        allParticipants[0];

      const otherUsers = allParticipants.filter((p) => p.id !== pinnedUser.id);

      return (
        <div className="w-full h-full flex flex-col gap-3 justify-center items-center max-w-6xl mx-auto">
          <div className="flex-1 w-full max-h-[64vh] flex items-center justify-center">
            {renderParticipantTile(pinnedUser, "spotlight")}
          </div>

          {otherUsers.length > 0 && (
            <div className="w-full h-28 md:h-32 flex gap-3 justify-center items-center overflow-x-auto py-1">
              {otherUsers.map((p) => renderParticipantTile(p, "thumbnail"))}
            </div>
          )}
        </div>
      );
    }

    // 3. Grid Mode: Host alone in the room (Default for new meeting!)
    if (totalParticipantsCount === 1) {
      return (
        <div className="w-full max-w-4xl h-full max-h-[74vh] flex flex-col items-center justify-center gap-4 p-2 relative">
          <div className="w-full h-full max-h-[64vh] flex items-center justify-center">
            {renderParticipantTile(localParticipantData, "single")}
          </div>

          {/* Invitation banner informing the host they are alone and providing the link */}
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <p className="text-xs text-slate-300 truncate">
                Share meeting link to invite others: <span className="font-mono text-blue-400 font-semibold">{roomId}</span>
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      );
    }

    // Case B: 2 People (Large side-by-side cards)
    if (totalParticipantsCount === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full max-w-[1550px] mx-auto h-full max-h-[76vh] items-center justify-center p-2">
          {renderParticipantTile(localParticipantData, "two-up")}
          {renderParticipantTile(remoteParticipants[0], "two-up")}
        </div>
      );
    }

    // Case C: 3 People (2 cards on top, 1 large centered card on bottom)
    if (totalParticipantsCount === 3) {
      return (
        <div className="w-full max-w-6xl mx-auto h-full max-h-[78vh] flex flex-col gap-4 items-center justify-center p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-[36vh] max-h-[38vh]">
            {renderParticipantTile(localParticipantData, "multi")}
            {renderParticipantTile(remoteParticipants[0], "multi")}
          </div>
          <div className="w-full sm:w-[55%] md:w-[48%] h-[36vh] max-h-[38vh] mx-auto">
            {renderParticipantTile(remoteParticipants[1], "multi")}
          </div>
        </div>
      );
    }

    // Case D: 4 People (Clean 2x2 Grid)
    if (totalParticipantsCount === 4) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-6xl mx-auto h-full max-h-[78vh] items-center justify-center p-2">
          {renderParticipantTile(localParticipantData, "multi")}
          {renderParticipantTile(remoteParticipants[0], "multi")}
          {renderParticipantTile(remoteParticipants[1], "multi")}
          {renderParticipantTile(remoteParticipants[2], "multi")}
        </div>
      );
    }

    // Case E: 5 or more People (3 columns, 2 rows)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full max-w-7xl mx-auto h-full max-h-[80vh] items-center justify-center p-2">
        {allParticipants.map((p) => renderParticipantTile(p, "multi"))}
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans relative">
      {/* Top Meeting Header Bar */}
      <header className="h-14 px-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand + Title + Security */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center px-2 py-1 bg-white rounded-lg shadow-xs group">
            <img
              src="/brand_logo.png"
              alt="Connectra."
              className="h-5 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-md">
            {meetingTitle}
          </h2>
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-blue-400" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Center: Elapsed Timer & Recording Badge (Only visible when user starts recording!) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-mono text-rose-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>REC</span>
              <span className="text-rose-400/50">|</span>
              <span>{formatTimer(recordingSeconds)}</span>
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-slate-800/80 text-xs font-mono font-medium text-slate-300">
            {formatTimer(secondsElapsed)}
          </div>
        </div>

        {/* Right: Room ID copy + Layout Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            title="Copy invitation link"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{roomId}</span>
            <span className="sm:hidden">{copiedLink ? "Copied" : "Link"}</span>
          </button>

          <button
            onClick={() => {
              if (pinnedParticipantId) setPinnedParticipantId(null);
              setViewMode(viewMode === "grid" ? "speaker" : "grid");
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid" && !pinnedParticipantId
                ? "bg-blue-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
            title="Toggle Grid / Speaker View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Notifications / Toasts (Top Center) */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`border backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ring-1 ring-white/10 ${
              toast.type === "recording"
                ? "bg-rose-950/90 border-rose-600/50 text-rose-100"
                : toast.type === "success"
                ? "bg-slate-900/95 border-emerald-600/50 text-slate-100"
                : "bg-slate-900/95 border-slate-700/80 text-slate-100"
            }`}
          >
            {toast.image ? (
              <img src={toast.image} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-600" />
            ) : toast.type === "recording" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            )}
            <div>
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-slate-400 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1 rounded-lg ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Center Stage & Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Conference Video Stage */}
        <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-hidden flex flex-col justify-center items-center relative w-full h-[calc(100vh-136px)]">
          {renderMeetingStage()}
        </div>

        {/* In-Meeting Side Drawer (Chat / Participants / Details) */}
        {activeSideDrawer !== "none" && (
          <aside className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeSideDrawer === "chat" && <MessageSquare className="w-4 h-4 text-blue-400" />}
                {activeSideDrawer === "participants" && <Users className="w-4 h-4 text-emerald-400" />}
                {activeSideDrawer === "details" && <Info className="w-4 h-4 text-indigo-400" />}
                <h3 className="text-sm font-bold capitalize text-white">
                  {activeSideDrawer === "chat"
                    ? "In-Call Messages"
                    : activeSideDrawer === "participants"
                    ? `Participants (${totalParticipantsCount})`
                    : "Meeting Details"}
                </h3>
              </div>
              <button
                onClick={() => setActiveSideDrawer("none")}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Drawer Content */}
            {activeSideDrawer === "chat" && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl text-xs text-slate-400 leading-relaxed text-center">
                    Messages can be seen only by people in this call and are deleted when the call ends.
                  </div>

                  {chatMessages.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-xs text-slate-500">No messages yet. Send a message to start the conversation!</p>
                    </div>
                  )}

                  {chatMessages.map((msg) => {
                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-1.5 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{msg.text}</span>
                            <span className="text-[10px] text-slate-500">• {msg.time}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.isLocal ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-200">{msg.senderName}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            msg.isLocal
                              ? "bg-blue-600 text-white rounded-tr-xs"
                              : "bg-slate-800 text-slate-200 rounded-tl-xs"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Send a message to everyone..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Participants Drawer Content */}
            {activeSideDrawer === "participants" && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Meeting Invitation Box */}
                <div className="p-3.5 bg-slate-800/70 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Invite Others</span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {roomId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Anyone with this link can join this meeting.
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Meeting Link"}</span>
                  </button>
                </div>

                {/* Active Participants List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    In this call ({totalParticipantsCount})
                  </span>

                  {/* Local Host User using real Clerk authentication photo */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="flex items-center gap-3">
                      {userProfilePhoto ? (
                        <img
                          src={userProfilePhoto}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-blue-400 font-semibold">(Host, You)</span>
                        </p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                      {cameraEnabled ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>

                  {/* Remote Participants who actually joined via the link */}
                  {remoteParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                        {p.isVideoOff ? <VideoOff className="w-3.5 h-3.5 text-slate-500" /> : <Video className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional test participant joiner for host testing (strictly manual, never automated) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={handleInviteTestParticipant}
                    className="w-full py-1.5 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Test Participant (+)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Meeting Details Drawer */}
            {activeSideDrawer === "details" && (
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Title</span>
                  <p className="text-sm font-bold text-white mt-0.5">{meetingTitle}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Room Code</span>
                  <p className="text-xs font-mono font-semibold text-blue-400 mt-0.5">{roomId}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Invite URL</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/room/${roomId}`}
                      className="w-full text-xs font-mono bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-slate-300"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Enterprise End-to-End Encryption</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Media streams and messages are strictly encrypted using WebRTC DTLS/SRTP protocols.
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Floating Animated Reaction Emojis */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%`, bottom: "100px" }}
            className="absolute text-4xl animate-in fade-in slide-in-from-bottom duration-1000 -translate-y-48 transition-all"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Floating Bottom Control Dock */}
      <footer className="h-20 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 px-4 sm:px-8 flex items-center justify-between shrink-0 z-30">
        {/* Left Side: Meeting Details Quick Trigger */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === "details" ? "none" : "details")}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">{roomId}</span>
          </button>
        </div>

        {/* Center: Essential Conference Controls */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
              micEnabled
                ? "bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-md"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 shadow-md"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraEnabled
                ? "bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-md"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 shadow-md"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? <Video className="w-5 h-5 text-blue-400" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
              screenSharing
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title={screenSharing ? "Stop Sharing Screen" : "Share Screen"}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Raise Hand Button */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`p-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
              handRaised
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title="Raise / Lower Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Recording Button (Off by default, only active when user clicks) */}
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer ${
              isRecording
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400/60 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 fill-white" />
                <span className="text-xs font-semibold hidden md:inline">Stop REC</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Circle className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="text-xs font-semibold hidden lg:inline">Record</span>
              </div>
            )}
          </button>

          {/* Reactions Button with Popup */}
          <div className="relative">
            <button
              onClick={() => setShowReactionsMenu(!showReactionsMenu)}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition-all cursor-pointer"
              title="Emoji Reactions"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showReactionsMenu && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700 flex items-center gap-2 shadow-2xl animate-in zoom-in-95 duration-150">
                {["👍", "👏", "❤️", "😂", "🎉", "🔥"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="p-2 text-xl hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leave Call Button */}
          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer ml-2"
          >
            <PhoneOff className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Right Side: Chat & Participants Toggles */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === "participants" ? "none" : "participants")}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSideDrawer === "participants"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{totalParticipantsCount}</span>
          </button>

          <button
            onClick={() => setActiveSideDrawer(activeSideDrawer === "chat" ? "none" : "chat")}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSideDrawer === "chat"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {chatMessages.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>
        </div>
      </footer>
    </div>
  );
};
