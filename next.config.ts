import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
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
        hostname: "**.supabase.co", // ← Supabase storage
      },
      {
        protocol: "https",
        hostname: "**", // ← Supabase storage
      },
    ],
  },
};

export default nextConfig;
