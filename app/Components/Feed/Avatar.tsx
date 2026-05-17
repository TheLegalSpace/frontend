// Avatar.tsx
"use client";

import Image from "next/image";

interface AvatarProps {
  initials: string;
  avatarUrl?: string | null;
  size?: number;
}

// ✅ Only allow known image hosts
const ALLOWED_HOSTS = [
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "images.unsplash.com",
];

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export default function Avatar({ initials, avatarUrl, size = 40 }: AvatarProps) {
  const colors: Record<string, string> = {
    TI: "#1a4a8a",
    AO: "#2d6a4f",
    OA: "#7b2d8b",
  };

  const bg = colors[initials] ?? "#374151";
  const showImage = isValidImageUrl(avatarUrl);

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: showImage ? "transparent" : bg,
        fontSize: size * 0.35,
      }}
    >
      {showImage ? (
        <Image
          src={avatarUrl as string}
          alt={initials}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}