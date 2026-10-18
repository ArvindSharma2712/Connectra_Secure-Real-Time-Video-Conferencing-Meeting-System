import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isClerkConfigured, ClerkSignIn } from "../context/AuthContext";
import { ShieldCheck, ArrowRight, KeyRound } from "lucide-react";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-900 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="/login_bg.png"
          alt="Connectra visual background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <Link to="/" className="px-3 py-1.5 bg-white rounded-xl shadow-md group">
          <img
            src="/brand_logo.png"
            alt="Connectra."
            className="h-6 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        <Link
          to="/join"
          className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Join with Code
        </Link>
      </header>

      {/* Center Auth Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isClerkConfigured ? (
            <div className="flex justify-center">
              <ClerkSignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
              />
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-7 h-7 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Sign in to Connectra
                </h2>
                <p className="text-xs text-slate-500">
                  Secured with official Clerk Authentication
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <KeyRound className="w-4 h-4" />
                  <span>Clerk SDK Integration Active</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Provide your <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code> to activate live authentication.
                </p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Dashboard Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-xs text-slate-500">
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-blue-600 font-bold hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Connectra Inc. • Enterprise Video Conferencing
      </footer>
    </div>
  );
};
