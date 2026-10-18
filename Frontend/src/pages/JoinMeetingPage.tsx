import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export const JoinMeetingPage: React.FC = () => {
  const { user } = useAppAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [meetingIdInput, setMeetingIdInput] = useState(() => searchParams.get("id") || "");
  const [displayName, setDisplayName] = useState(user.name || "Alex Rivera");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup preview camera stream
  useEffect(() => {
    let active = true;

    async function initPreviewMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not access camera/mic for preview:", err);
      }
    }

    initPreviewMedia();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle camera toggle
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
    setCameraEnabled(!cameraEnabled);
  };

  // Handle mic toggle
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
      }
    }
    setMicEnabled(!micEnabled);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanId = meetingIdInput.trim();
    if (!cleanId) {
      setError("Please provide a valid meeting ID or invitation link");
      return;
    }

    // If user pasted a full URL
    if (cleanId.includes("/room/")) {
      cleanId = cleanId.split("/room/")[1].split("?")[0];
    } else if (cleanId.includes("http")) {
      const parts = cleanId.split("/");
      cleanId = parts[parts.length - 1];
    }

    cleanId = cleanId.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    if (cleanId.length < 3) {
      setError("Invalid meeting code format. Example: qwe-rty-uio");
      return;
    }

    setIsJoining(true);

    try {
      // Check if meeting exists or join directly
      await meetingService.getMeetingById(cleanId);
      // Pass media states via query or session
      sessionStorage.setItem(
        "connectra_join_prefs",
        JSON.stringify({
          displayName,
          cameraEnabled,
          micEnabled,
        })
      );

      // Stop local preview tracks before entering room
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      navigate(`/room/${cleanId}`);
    } catch (err) {
      setError("Could not connect to meeting room. Please check the code.");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600/10 selection:text-blue-700">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
            Back to Dashboard
          </span>
        </Link>
        <div className="flex items-center">
          <img
            src="/brand_logo.png"
            alt="Connectra."
            className="h-6 sm:h-7 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Join Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Column: Live Audio/Video Device Preview */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center ring-1 ring-slate-800">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white">
                    <VideoOff className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="text-xs font-semibold">Camera is turned off</span>
                </div>
              )}

              {/* In-Preview Name Tag */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                {micEnabled ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="font-medium truncate max-w-[120px]">{displayName || "You"}</span>
              </div>

              {/* Controls floating on preview */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all cursor-pointer ${
                    micEnabled
                      ? "bg-slate-800/80 hover:bg-slate-700/80"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-full backdrop-blur-md text-white transition-all cursor-pointer ${
                    cameraEnabled
                      ? "bg-slate-800/80 hover:bg-slate-700/80"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                  title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 font-medium">
              Check your hair, lighting, and audio before joining the call
            </p>
          </div>

          {/* Right Column: Join Credentials Form */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Ready to Join
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Enter Meeting Room
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your room code or full invitation link to enter
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meeting Code or Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. qwe-rty-uio or https://..."
                  value={meetingIdInput}
                  onChange={(e) => setMeetingIdInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                  required
                />
              </div>

              {/* Suggested Active Room Pills */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Suggested demo rooms:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["qwe-rty-uio", "zxc-vbn-mas", "abc-def-ghi"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setMeetingIdInput(code)}
                      className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full mt-4 py-3.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to room...</span>
                  </>
                ) : (
                  <>
                    <span>Join Meeting</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        Connectra Secure WebRTC Conferencing • End-to-End Encrypted
      </footer>
    </div>
  );
};
