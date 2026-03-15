import { useState, useCallback, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundEngine } from "@/lib/soundEngine";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(soundEngine.enabled);
  const [volume, setVolume] = useState(soundEngine.volume);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    // Preload sounds on first user interaction
    const handleInteraction = () => {
      soundEngine.preload();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const toggle = useCallback(() => {
    const newState = soundEngine.toggle();
    setEnabled(newState);
    if (newState) {
      soundEngine.play("ui_click");
    }
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      soundEngine.setVolume(v);
      setVolume(v);
      if (!soundEngine.enabled) {
        soundEngine.setEnabled(true);
        setEnabled(true);
      }
    },
    []
  );

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={toggle}
        className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
        title={enabled ? "Mute sounds" : "Unmute sounds"}
        aria-label={enabled ? "Mute sounds" : "Unmute sounds"}
      >
        {enabled ? (
          <Volume2 className="w-5 h-5 text-purple-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {showSlider && (
        <div className="absolute right-full mr-2 flex items-center gap-2 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 shadow-lg">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 accent-purple-500 cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
