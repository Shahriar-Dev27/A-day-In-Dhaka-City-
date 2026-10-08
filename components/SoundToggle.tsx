"use client";

import { useEffect, useRef, useState } from "react";
import { VoiceDirector } from "@/lib/audio";
import { readVisibleCues } from "@/lib/captions";
import { VOICE_CLIPS } from "@/lib/voice";
import { AudioEngine } from "@/lib/webaudio";

const TICK_MS = 60;
const JAM = 3;

/** Clip ids for a scene and the one after it, fetched ahead so a line starts the moment its caption does. */
const upcoming = (scene: number) => VOICE_CLIPS.filter((clip) => clip.scene === scene || clip.scene === scene + 1).map((clip) => clip.id);

/** 0..1 swell across the jam scene (quiet at the edges, loudest mid-scene) for the traffic bed. */
function jamIntensity(scene: number): number {
  if (scene !== JAM) return 0;
  const slot = document.getElementById(`scene-${JAM}`);
  if (!slot) return 0;
  const rect = slot.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, (window.innerHeight / 2 - rect.top) / Math.max(rect.height, 1)));
  return Math.sin(Math.PI * progress) ** 0.7;
}

export default function SoundToggle({ ready }: { ready: boolean }) {
  const [sound, setSound] = useState(false);
  const [voice, setVoice] = useState(true);
  const [failed, setFailed] = useState(false);
  const engine = useRef<AudioEngine | null>(null);
  const director = useRef<VoiceDirector | null>(null);
  const scene = useRef(-1);
  const voiceOn = useRef(true);

  useEffect(() => {
    if (!sound || !ready) return;
    const audio = engine.current;
    const speaker = director.current;
    if (!audio || !speaker) return;
    scene.current = -1;
    const tick = () => {
      const current = Number(document.documentElement.dataset.scene ?? 0);
      if (current !== scene.current) {
        scene.current = current;
        audio.ambience.setScene(current);
        audio.preload(upcoming(current));
      }
      audio.ambience.setIntensity(jamIntensity(current));
      if (voiceOn.current) speaker.update(readVisibleCues(), performance.now());
    };
    tick();
    const timer = window.setInterval(tick, TICK_MS);
    // A hidden tab stops all sound; coming back replays the caption that is still on screen.
    const visibility = () => {
      if (document.hidden) {
        speaker.interrupt();
        void audio.suspend();
      } else {
        speaker.interrupt(true);
        void audio.resume();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      speaker.setEnabled(false);
      audio.ambience.stop();
    };
  }, [sound, ready]);

  useEffect(() => () => {
    void engine.current?.close();
    engine.current = null;
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setFailed(false);
    if (next) {
      try {
        // Created inside the click so the browser allows playback.
        if (!engine.current) {
          engine.current = new AudioEngine();
          director.current = new VoiceDirector(engine.current);
        }
        void engine.current.resume();
        director.current?.setEnabled(voiceOn.current);
      } catch {
        setFailed(true);
        return;
      }
    } else director.current?.setEnabled(false);
    setSound(next);
  };

  const toggleVoice = () => {
    const next = !voice;
    voiceOn.current = next;
    setVoice(next);
    director.current?.setEnabled(next);
  };

  if (!ready) return null;
  const button = "flex min-h-11 items-center gap-2 rounded-[2px] bg-(--slip-bg) px-3 py-2 font-sans text-label text-(--slip-fg) shadow-[2px_2px_0_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--slip-bg)";
  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-40 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2">
      <button
        type="button"
        aria-label="City sound"
        aria-pressed={sound}
        onClick={toggleSound}
        title={sound ? "Turn city sound off" : "Turn city sound on"}
        className={button}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          {sound ? <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /> : <path d="m16 9 5 6m0-6-5 6" />}
        </svg>
        <span>Sound {sound ? "on" : "off"}</span>
      </button>
      {sound && (
        <button
          type="button"
          aria-label="Bangla voices"
          aria-pressed={voice}
          onClick={toggleVoice}
          title={voice ? "Turn Bangla voices off" : "Turn Bangla voices on"}
          className={button}
        >
          <span>Voices {voice ? "on" : "off"}</span>
        </button>
      )}
      <p role="status" className={failed ? "max-w-52 rounded-[2px] bg-(--slip-bg) p-2 text-sm text-(--slip-fg)" : "sr-only"}>
        {failed ? "Audio could not start in this browser." : ""}
      </p>
    </div>
  );
}
