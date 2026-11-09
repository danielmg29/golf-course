"use client";

type ImageLoaderProps = { src: string; width: number; quality?: number };

// Unsplash's CDN resizes photos on request, so they skip the Next.js image optimizer.
// Local files are served as they are, so size them sensibly when real photos arrive.
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  return `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 72}`;
}
