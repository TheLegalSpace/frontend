<<<<<<< HEAD
/** @type {import('next').NextConfig} */
const nextConfig = {
=======
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
>>>>>>> 6dce097a1a76d945ce252ff47423aa37e78624f8
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ← your actual avatar storage
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ← Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // ← GitHub avatars
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // ← Supabase storage
      },
      {
        protocol: "https",
        hostname: "**", // ← allows any https image in dev
      },
    ],
  },
};

export default nextConfig;