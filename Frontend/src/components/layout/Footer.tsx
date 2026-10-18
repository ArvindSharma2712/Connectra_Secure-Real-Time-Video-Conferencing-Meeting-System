import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center px-3 py-1.5 bg-white rounded-xl mb-5 shadow-sm group">
              <img
                src="/brand_logo.png"
                alt="Connectra."
                className="h-6 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              Ultra-low latency, crystal-clear HD video conferencing designed for modern teams, distributed companies, and seamless collaboration.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
              All systems operational (99.99% uptime)
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/join" className="hover:text-white transition-colors">Join Meeting</Link></li>
              <li><Link to="/schedule" className="hover:text-white transition-colors">Schedule Meeting</Link></li>
              <li><Link to="/recordings" className="hover:text-white transition-colors">Cloud Recordings</Link></li>
              <li><a href="#features" className="hover:text-white transition-colors">HD Video & Audio</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Screen Sharing</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#solutions" className="hover:text-white transition-colors">Engineering Teams</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Product Reviews</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Enterprise Security</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Remote Work</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Education & Webinars</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><span className="text-slate-500 cursor-not-allowed">WebRTC SDK</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">REST API</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Privacy & Security</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Status Page</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Connectra Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
