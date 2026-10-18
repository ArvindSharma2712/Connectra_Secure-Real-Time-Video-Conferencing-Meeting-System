import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CreateMeetingModal } from "../components/meetings/CreateMeetingModal";
import { AnalogClock } from "../components/common/AnalogClock";
import { ConferenceHeroMockup } from "../components/common/ConferenceHeroMockup";
import {
  Video,
  Radio,
  Calendar,
  Share2,
  ShieldCheck,
  Zap,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"instant" | "schedule">("instant");
  const [joinCode, setJoinCode] = useState("");

  const handleOpenModal = (type: "instant" | "schedule") => {
    setModalType(type);
    setCreateModalOpen(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const clean = joinCode.trim().replace(/^https?:\/\/[^/]+\/room\//i, "");
    navigate(`/join?id=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-600/10 selection:text-blue-700">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,76,255,0.15),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 2-Column Hero: Left content, Right Analog Clock */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 sm:mb-24 lg:mb-28">
            {/* Left Column: Headlines & Meeting Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs animate-in fade-in duration-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Next-Generation Video Collaboration</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Connect teams instantly.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                  Collaborate effortlessly.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                High-definition video conferences, instantaneous screen sharing, real-time interactive chat, and intelligent meeting scheduling — all with zero friction.
              </p>

              {/* Primary & Secondary Call to Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => handleOpenModal("instant")}
                  className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Video className="w-5 h-5 stroke-[2.2]" />
                  <span>Start a Meeting</span>
                </button>

                <button
                  onClick={() => handleOpenModal("schedule")}
                  className="px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300/80 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Schedule a Meeting</span>
                </button>
              </div>

              {/* Inline Quick Join Input */}
              <div className="pt-1">
                <form
                  onSubmit={handleJoinSubmit}
                  className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-shadow max-w-md w-full"
                >
                  <div className="pl-3 text-slate-400">
                    <Radio className="w-4 h-4 text-emerald-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter meeting code (e.g. qwe-rty-uio)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 font-mono placeholder:font-sans placeholder:text-slate-400 px-2"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    Join
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Social Trust Highlights */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free up to 100 participants
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No download required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> End-to-end encrypted
                </span>
              </div>
            </div>

            {/* Right Column: Analog Clock matching reference image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm sm:max-w-md">
                <AnalogClock />
              </div>
            </div>
          </div>

          {/* Interactive Conference Hero Mockup with generous breathing room */}
          <div className="pt-8 sm:pt-14 pb-4 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Video Conference Interface
              </span>
            </div>
            <ConferenceHeroMockup />
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">99.99%</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Uptime Guarantee</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">&lt; 50ms</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Global WebRTC Latency</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">10M+</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Minutes Streamed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">100%</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Browser Native (No Plugins)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
              Built for Modern Distributed Teams
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need for productive, high-impact meetings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Crystal-Clear HD Video</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adaptive bitrate streaming guarantees fluid 1080p video and studio-grade noise suppression, even on spotty internet connections.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Screen Sharing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share full screens, single application windows, or browser tabs with 60 FPS motion fidelity and synchronized system audio.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time In-Meeting Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share links, send live messages, and trigger interactive emoji reactions without disrupting the speaker’s flow.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Seamless Calendar Sync</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schedule recurring meetings, invite teammates with auto-generated links, and visualize your entire day on the intuitive calendar.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise-Grade Security</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Encrypted signaling, waiting room approval, host mute controls, and meeting passcodes keep your discussions private and safe.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cloud Recording & Playback</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Record important discussions, generate downloadable MP4s, and review past presentations directly in the cloud dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                Tailored Solutions
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
                Engineered for teams that demand velocity
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Engineering & Agile Standups</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Share terminal windows, review pull requests, and debug live code together with crystal clarity.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Product Demos & Client Walkthroughs</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Deliver seamless presentations with zero awkward install prompts for external guests.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Executive & Board Briefings</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Strict participant verification, waiting rooms, and meeting passcodes protect confidential deliberations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual preview banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/login_bg.png"
                alt="Connectra visual"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-1">
                  Connectra Experience
                </span>
                <h4 className="text-2xl font-bold mb-2">Simplicity at Scale</h4>
                <p className="text-sm text-slate-200 max-w-md">
                  Empowering thousands of organizations with instantaneous connections and zero latency bottlenecks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Start free, upgrade as your team expands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Starter Free</h3>
                <p className="text-xs text-slate-500 mt-1">For casual meetings and small teams</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 ml-1">/ month forever</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 50 participants</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 40 minutes per meeting</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> HD video & screen sharing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> In-meeting chat</li>
                </ul>
              </div>
              <Link
                to="/sign-up"
                className="mt-8 w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border-2 border-blue-600 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Connectra Pro</h3>
                <p className="text-xs text-slate-500 mt-1">For growing teams and fast startups</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">$12</span>
                  <span className="text-xs text-slate-500 ml-1">/ user / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Up to 150 participants</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Unlimited meeting duration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Cloud recording & transcripts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Custom branding & URLs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Priority 24/7 support</li>
                </ul>
              </div>
              <Link
                to="/sign-up"
                className="mt-8 w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">For large organizations & compliance</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">$29</span>
                  <span className="text-xs text-slate-500 ml-1">/ user / month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 500 participants</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SSO & SAML enforcement</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SOC2 Type II compliance</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dedicated account manager</li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenModal("schedule")}
                className="mt-8 w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to experience frictionless video conferencing?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create your account today or jump into an instant meeting room in under 5 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleOpenModal("instant")}
              className="px-8 py-3 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
            >
              Start Instant Meeting
            </button>
            <Link
              to="/join"
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors border border-blue-500/50"
            >
              Join with Code
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Meeting Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialType={modalType}
      />
    </div>
  );
};
