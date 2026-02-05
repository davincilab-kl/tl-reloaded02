'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export function HeroVideoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const thumbnail = thumbnailRef.current;
    const overlay = overlayRef.current;

    if (!container || !video || !thumbnail || !overlay) return;

    const handleClick = () => {
      overlay.classList.add('hidden');
      thumbnail.classList.add('hidden');
      video.classList.remove('hidden');
      video.play().catch(() => {
        // Handle autoplay failure gracefully
      });
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md lg:max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow group cursor-pointer relative"
    >
      <div ref={thumbnailRef} className="absolute inset-0">
        <Image
          src="https://talentslounge.com/wp-content/uploads/2025/11/TalentsLounge-Digitale-Grundbildung-Coding-1.jpg"
          alt="TalentsLounge Erklärvideo"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all"
      >
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
            </svg>
          </div>
          <p className="text-white font-semibold">TalentsLounge im Einsatz sehen</p>
        </div>
      </div>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover hidden"
        src="https://talentslounge.com/wp-content/uploads/2024/04/Talentslounge-Digitale-Grundbildung.mp4"
        controls
        preload="none"
      />
    </div>
  );
}
