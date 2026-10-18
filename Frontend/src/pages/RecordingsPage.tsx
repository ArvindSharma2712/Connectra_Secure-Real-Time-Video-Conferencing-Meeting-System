import React, { useState, useEffect } from "react";
import { meetingService } from "../services/meetingService";
import type { Recording } from "../types";
import {
  Disc,
  Play,
  Download,
  Share2,
  Trash2,
  Clock,
  HardDrive,
  Eye,
  X,
  Search,
  Check,
} from "lucide-react";

export const RecordingsPage: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState<Recording | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await meetingService.getRecordings();
      setRecordings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleShare = (rec: Recording) => {
    navigator.clipboard.writeText(rec.videoUrl);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (rec: Recording) => {
    alert(`Downloading "${rec.title}.mp4" (${rec.fileSize}). Cloud recording storage placeholder.`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this cloud recording permanently?")) {
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filtered = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.meetingId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cloud Recordings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Replay, download, and share high-definition recorded conferences
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recordings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Recordings Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading recordings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Disc className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Recordings Available</h3>
          <p className="text-xs text-slate-500">
            {search
              ? "No recordings match your search query."
              : "When you record in-meeting sessions, your processed files will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setActiveVideo(rec)}>
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{rec.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span>{rec.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <HardDrive className="w-3 h-3" /> {rec.fileSize}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> {rec.views} views
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(rec)}
                      title="Copy Share Link"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === rec.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDownload(rec)}
                      title="Download Recording"
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold truncate max-w-md">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3 font-mono">
                <span>Recorded: {activeVideo.date}</span>
                <span>•</span>
                <span>File size: {activeVideo.fileSize}</span>
              </div>
              <button
                onClick={() => handleDownload(activeVideo)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
