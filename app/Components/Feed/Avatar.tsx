// Avatar.tsx
"use client";

import Image from "next/image";

interface AvatarProps {
  initials: string;
  avatarUrl?: string;
  size?: number;
}

export default function Avatar({
  initials,
  avatarUrl,
  size = 44,
}: AvatarProps) {
  const colors: Record<string, string> = {
    TI: "#1a4a8a",
    AO: "#2d6a4f",
    OA: "#7b2d8b",
  };

  const bg = colors[initials] ?? "#374151";

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: avatarUrl ? "transparent" : bg,
        fontSize: size * 0.35,
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={initials}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}