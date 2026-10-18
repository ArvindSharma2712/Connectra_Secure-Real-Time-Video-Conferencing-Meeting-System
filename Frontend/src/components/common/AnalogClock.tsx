import React, { useState, useEffect } from "react";
import { MoreVertical, Check } from "lucide-react";

interface AnalogClockProps {
  className?: string;
  showCardWrapper?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  className = "",
  showCardWrapper = true,
}) => {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [smoothSweep, setSmoothSweep] = useState(true);
  const [showDigitalBadge, setShowDigitalBadge] = useState(true);

  // Update time with requestAnimationFrame for smooth sweeping or setInterval for ticking
  useEffect(() => {
    let animationFrameId: number;
    let intervalId: any;

    if (smoothSweep) {
      const update = () => {
        setTime(new Date());
        animationFrameId = requestAnimationFrame(update);
      };
      animationFrameId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      intervalId = setInterval(() => {
        setTime(new Date());
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [smoothSweep]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  // Hand rotation degrees (with smooth sub-second precision if enabled)
  const secondFrac = smoothSweep ? seconds + milliseconds / 1000 : seconds;
  const minuteFrac = minutes + secondFrac / 60;
  const hourFrac = (hours % 12) + minuteFrac / 60;

  const secondDeg = secondFrac * 6; // 360 / 60
  const minuteDeg = minuteFrac * 6; // 360 / 60
  const hourDeg = hourFrac * 30; // 360 / 12

  // Format Timezone label dynamically (e.g. "India Standard Time" for IST or user's local zone)
  const getTimeZoneLabel = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
        return "India Standard Time";
      }
      // Formatted long timezone name
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "long",
      });
      const parts = formatter.formatToParts(time);
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      if (tzPart && tzPart.value) {
        return tzPart.value;
      }
      return tz.replace(/_/g, " ");
    } catch {
      return "India Standard Time";
    }
  };

  // Formatted date matching exactly "Sat, 17 Oct"
  const dayName = time.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = time.toLocaleDateString("en-US", { month: "short" });
  const dayNum = time.getDate();
  const formattedDate = `${dayName}, ${dayNum} ${monthName}`;

  // Digital time readout for optional pill
  const formattedDigital = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Clock dial layout numbers (1 to 12)
  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const cx = 160;
  const cy = 160;
  const numRadius = 104;

  // 60 tick marks
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const angleRad = (i * 6 - 90) * (Math.PI / 180);
    const outerR = 138;
    const innerR = isHour ? 124 : 131;

    return {
      x1: cx + innerR * Math.cos(angleRad),
      y1: cy + innerR * Math.sin(angleRad),
      x2: cx + outerR * Math.cos(angleRad),
      y2: cy + outerR * Math.sin(angleRad),
      isHour,
      key: i,
    };
  });

  const clockCore = (
    <div className="flex flex-col items-center select-none">
      {/* Three Dots Menu on top-right */}
      <div className="w-full flex items-center justify-between pb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Live Global Time
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            title="Clock options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-2 text-xs text-slate-700 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setSmoothSweep(!smoothSweep);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left font-medium cursor-pointer"
              >
                <span>Smooth Hand Motion</span>
                {smoothSweep && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setShowDigitalBadge(!showDigitalBadge);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left font-medium cursor-pointer"
              >
                <span>Show Digital Badge</span>
                {showDigitalBadge && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clock Face Circle with Neumorphic Drop Shadow */}
      <div className="relative p-2 flex items-center justify-center">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-white shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.04)] ring-8 sm:ring-10 ring-white/95 border border-slate-100 flex items-center justify-center transition-transform hover:scale-[1.01]">
          <svg
            viewBox="0 0 320 320"
            className="w-full h-full drop-shadow-xs"
          >
            {/* Ambient Radial Gradient on Dial */}
            <defs>
              <radialGradient id="dialGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="90%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </radialGradient>
            </defs>

            {/* Dial background circle */}
            <circle
              cx={cx}
              cy={cy}
              r={148}
              fill="url(#dialGradient)"
            />

            {/* 60 Minute & Hour Tick Marks */}
            {ticks.map((t) => (
              <line
                key={t.key}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isHour ? "#0f172a" : "#cbd5e1"}
                strokeWidth={t.isHour ? 2.4 : 1.2}
                strokeLinecap="round"
              />
            ))}

            {/* 12 Hour Numbers */}
            {numbers.map((num) => {
              const angleRad = (num * 30 - 90) * (Math.PI / 180);
              const x = cx + numRadius * Math.cos(angleRad);
              const y = cy + numRadius * Math.sin(angleRad);
              return (
                <text
                  key={num}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-bold text-slate-900 select-none"
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    fontFamily:
                      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fill: "#0f172a",
                  }}
                >
                  {num}
                </text>
              );
            })}

            {/* Hour Hand */}
            <g transform={`rotate(${hourDeg} ${cx} ${cy})`}>
              {/* Subtle shadow line */}
              <line
                x1={cx + 1}
                y1={cy + 7}
                x2={cx + 1}
                y2={cy - 67}
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={7.5}
                strokeLinecap="round"
              />
              <line
                x1={cx}
                y1={cy + 6}
                x2={cx}
                y2={cy - 68}
                stroke="#0f172a"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </g>

            {/* Minute Hand */}
            <g transform={`rotate(${minuteDeg} ${cx} ${cy})`}>
              {/* Subtle shadow line */}
              <line
                x1={cx + 1}
                y1={cy + 9}
                x2={cx + 1}
                y2={cy - 103}
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={5.5}
                strokeLinecap="round"
              />
              <line
                x1={cx}
                y1={cy + 8}
                x2={cx}
                y2={cy - 104}
                stroke="#1e293b"
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>

            {/* Second Hand (Electric Blue with Tail & Open Pivot Ring) */}
            <g transform={`rotate(${secondDeg} ${cx} ${cy})`}>
              {/* Counter-balance tail */}
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy + 24}
                stroke="#0057ff"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              {/* Forward needle */}
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - 124}
                stroke="#0057ff"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
              {/* Center Ring Pivot matching user reference */}
              <circle
                cx={cx}
                cy={cy}
                r={5.5}
                fill="#ffffff"
                stroke="#0057ff"
                strokeWidth={2.5}
              />
              {/* Center Inner Dot */}
              <circle cx={cx} cy={cy} r={1.5} fill="#0057ff" />
            </g>
          </svg>
        </div>
      </div>

      {/* Subtext underneath the clock exactly matching reference: India Standard Time | Sat, 17 Oct */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-slate-500 tracking-tight flex items-center justify-center gap-1.5">
          <span>{getTimeZoneLabel()}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold">{formattedDate}</span>
        </p>

        {/* Dynamic Digital Badge */}
        {showDigitalBadge && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50/80 border border-blue-100 rounded-full text-xs font-mono font-bold text-blue-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            <span>{formattedDigital}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{clockCore}</div>;
  }

  return (
    <div
      className={`relative bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/5 ${className}`}
    >
      {/* Decorative subtle ambient backdrop glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {clockCore}
    </div>
  );
};
