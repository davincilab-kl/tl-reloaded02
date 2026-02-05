'use client';

import { useEffect } from 'react';

export function SchoolMap() {
  useEffect(() => {
    (window as any).enableMapInteraction = () => {
      const iframe = document.getElementById('school-map-frame') as HTMLIFrameElement;
      const overlay = document.getElementById('map-overlay');
      if (iframe && overlay) {
        iframe.style.pointerEvents = 'all';
        (overlay as HTMLElement).style.opacity = '0';
        (overlay as HTMLElement).style.pointerEvents = 'none';
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-on-scroll relative">
      <div id="school-map" className="relative w-full h-[600px]">
        <iframe
          id="school-map-frame"
          src="https://talentslounge.com/wp-content/uploads/2025/11/my_map.html"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none', pointerEvents: 'none' }}
          allowFullScreen
          loading="lazy"
        />
        <div
          id="map-overlay"
          className="absolute inset-0 bg-black/10 flex items-center justify-center cursor-pointer transition-opacity duration-300 hover:bg-black/5 z-10"
          onClick={() => (window as any).enableMapInteraction()}
        >
          <span className="bg-white text-[#4182FF] px-6 py-3 rounded-full font-bold shadow-lg transform transition hover:scale-105 flex items-center gap-2">
            Karte aktivieren
          </span>
        </div>
      </div>
    </div>
  );
}
