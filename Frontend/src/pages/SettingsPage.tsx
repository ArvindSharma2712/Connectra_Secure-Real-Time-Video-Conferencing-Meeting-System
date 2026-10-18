import React, { useState, useEffect } from "react";
import { useAppAuth } from "../context/AuthContext";
import { meetingService } from "../services/meetingService";
import type { UserSettings } from "../types";
import {
  User as UserIcon,
  Video,
  Mic,
  Volume2,
  Bell,
  Shield,
  Check,
  Sparkles,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { user } = useAppAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "media" | "notifications" | "plan">("profile");

  const [settings, setSettings] = useState<UserSettings>({
    blurBackground: false,
    noiseSuppression: true,
    hdVideo: true,
    mirrorCamera: true,
    emailReminders: true,
    browserNotifications: true,
    soundAlerts: true,
    theme: "light",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingSpeaker, setTestingSpeaker] = useState(false);

  // Audio preview simulation state
  const [micLevel, setMicLevel] = useState(45);

  useEffect(() => {
    meetingService.getUserSettings().then(setSettings);
  }, []);

  // Simulating active mic meter
  useEffect(() => {
    const interval = setInterval(() => {
      setMicLevel(Math.floor(Math.random() * 40) + 20);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    await meetingService.saveUserSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const playTestSound = () => {
    setTestingSpeaker(true);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
        setTestingSpeaker(false);
      }, 600);
    } catch {
      setTestingSpeaker(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your account identity, audio/video devices, and alerts
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {saveSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : null}
          <span>{saveSuccess ? "Changes Saved!" : "Save Changes"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "profile"
              ? "bg-blue-50 text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Identity</span>
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "media"
              ? "bg-blue-50 text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Audio & Video</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "notifications"
              ? "bg-blue-50 text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "plan"
              ? "bg-blue-50 text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account & Plan</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              <img
                src={user.image || user.imageUrl}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Clerk Verified Identity</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.name}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Primary Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={user.email}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Identity details are securely synchronized with Clerk Authentication.
            </p>
          </div>
        )}

        {/* Audio & Video Tab */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Camera Options */}
            <div className="space-y-4 pb-6 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Camera Configuration</span>
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">HD 1080p Video Mode</span>
                    <p className="text-xs text-slate-500">Stream at high-resolution when network conditions allow</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hdVideo}
                    onChange={(e) => setSettings({ ...settings, hdVideo: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Mirror My Video</span>
                    <p className="text-xs text-slate-500">Show mirrored self-view in local camera preview</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.mirrorCamera}
                    onChange={(e) => setSettings({ ...settings, mirrorCamera: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Portrait Background Blur</span>
                    <p className="text-xs text-slate-500">Soften background surroundings during conferences</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.blurBackground}
                    onChange={(e) => setSettings({ ...settings, blurBackground: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Audio Options & Live Test */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Microphone & Speaker Diagnostics</span>
              </h3>

              {/* Live Mic Meter */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Microphone Input Level</span>
                  <span className="font-mono text-emerald-600">{micLevel}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Speak into your mic to test active levels</p>
              </div>

              {/* Speaker Test Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Test Speaker Output</span>
                    <p className="text-[11px] text-slate-400">Play an audible chime tone through your default speaker</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={playTestSound}
                  disabled={testingSpeaker}
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {testingSpeaker ? "Playing..." : "Test Audio"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
              Alerts & Meeting Reminders
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-900">Email Reminders</span>
                <p className="text-xs text-slate-500">Receive 15-minute advance reminders for upcoming scheduled syncs</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailReminders}
                onChange={(e) => setSettings({ ...settings, emailReminders: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-900">In-Browser Desktop Notifications</span>
                <p className="text-xs text-slate-500">Show native notifications when participants join your room</p>
              </div>
              <input
                type="checkbox"
                checked={settings.browserNotifications}
                onChange={(e) => setSettings({ ...settings, browserNotifications: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-slate-900">Audible Join/Leave Chimes</span>
                <p className="text-xs text-slate-500">Play pleasant sound effects when teammates enter or exit</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={(e) => setSettings({ ...settings, soundAlerts: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>
        )}

        {/* Account & Plan Tab */}
        {activeTab === "plan" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Current Subscription
                </span>
                <h3 className="text-2xl font-black mt-1">Connectra Pro Unlimited</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Unlimited HD meetings, cloud recording storage, and up to 100 participants per room.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold self-start sm:self-auto">
                Active Tier
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Monthly Usage</span>
                <p className="text-lg font-bold text-slate-900">8 / Unlimited</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500">Max Room Capacity</span>
                <p className="text-lg font-bold text-slate-900">100 Users</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500">Storage Used</span>
                <p className="text-lg font-bold text-slate-900">892 MB / 10 GB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
