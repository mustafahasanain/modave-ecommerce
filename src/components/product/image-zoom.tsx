"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { ZoomIn } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

/**
 * Hover-to-zoom image component.
 * On mouse move over the image, a magnified portion is shown in the same container
 * using background-position trickery (no external libs).
 */
export function ImageZoom({ src, alt, sizes, priority }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  return (
    <div
      ref={containerRef}
      className="group/zoom relative h-full w-full cursor-zoom-in overflow-hidden"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      {/* Base image */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-opacity duration-200 ${
          zoom ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Zoomed background image */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: zoom ? 1 : 0,
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "220%",
          backgroundPosition: `${pos.x}% ${pos.y}%`,
        }}
      />
      {/* Zoom hint badge */}
      <div
        className={`pointer-events-none absolute bottom-3 end-3 flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur transition-opacity duration-200 ${
          zoom ? "opacity-0" : "opacity-100"
        }`}
      >
        <ZoomIn className="h-3 w-3" />
        <span>Hover to zoom</span>
      </div>
    </div>
  );
}
