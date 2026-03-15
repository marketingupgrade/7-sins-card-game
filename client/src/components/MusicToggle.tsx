import { useState, useCallback } from "react";
import { musicEngine } from "../lib/musicEngine";

/**
 * MusicToggle — Separate music volume control from SFX.
 * Shows a music note icon with hover-reveal volume slider.
 */
export function MusicToggle({ className = "" }: { className?: string }) {
  const [muted, setMuted] = useState(musicEngine.isMuted());
  const [volume, setVolume] = useState(musicEngine.getVolume());
  const [hovered, setHovered] = useState(false);

  const handleToggle = useCallback(() => {
    const newMuted = musicEngine.toggleMute();
    setMuted(newMuted);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      musicEngine.setVolume(val);
      setVolume(val);
      if (muted && val > 0) {
        musicEngine.toggleMute();
        setMuted(false);
      }
    },
    [muted]
  );

  return (
    <div
      className={`relative flex items-center gap-1 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Volume slider — slides out on hover */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          hovered ? "w-20 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-full h-1 accent-purple-400 cursor-pointer"
          title={`Music: ${Math.round((muted ? 0 : volume) * 100)}%`}
        />
      </div>

      {/* Music icon button */}
      <button
        onClick={handleToggle}
        className="p-1.5 rounded-md transition-all duration-200 hover:bg-white/10 text-white/70 hover:text-white"
        title={muted ? "Unmute music" : "Mute music"}
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? (
          // Music off icon (note with X)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
            <line
              x1="3"
              y1="3"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="2.5"
              opacity="0.8"
            />
          </svg>
        ) : (
          // Music on icon (note)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
            style={{ animationDuration: "3s" }}
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
