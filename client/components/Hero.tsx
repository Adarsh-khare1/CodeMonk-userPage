"use client";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const visited = localStorage.getItem("visitedBefore");

    // delay autoplay to avoid router / hydration interruption
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      videoRef.current.muted = !!visited;
      setSoundOn(!visited);

      videoRef.current
        .play()
        .catch(() => {
          videoRef.current!.muted = true;
          setSoundOn(false);
        });

      localStorage.setItem("visitedBefore", "true");
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = soundOn;
    setSoundOn(!soundOn);
    videoRef.current.play();
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden text-white">
      {/* HARD BLACK BASE (important) */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* VIDEO */}
      <video
        ref={videoRef}
        loop
        autoPlay
        playsInline
        preload="auto"
        className="
          absolute inset-0
          w-[80%] h-[97%]
          object-contain
          translate-x-[35%]
          translate-y-[-10px]
          scale-90
          z-10
          pointer-events-none
        "
      >
        <source src="/newAn2.mp4" type="video/mp4" />
        <source src="/newAn2.webm" type="video/webm" />
        <source src="/newAn2.ogg" type="video/ogg" />
      </video>

      {/* OVERLAY (same as old) */}
      <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-30 flex min-h-screen flex-col justify-center max-w-xl px-8 pt-32 translate-y-[-8px]">
        <h2 className="text-[4rem] font-semibold leading-[1.2]">
          Master Coding <br />One Problem at a Time
        </h2>

        <p className="mt-6 text-gray-400 max-w-md">
          Practice DSA, algorithms, and real interview problems.
        </p>

        <button
          onClick={toggleSound}
          className="mt-6 px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
        >
          {soundOn ? "Mute Sound" : "Play Sound"}
        </button>
      </div>
    </section>
  );
}
