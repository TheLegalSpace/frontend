// components/profile/ProfileCard.tsx
"use client";

import { MapPin, Phone, Calendar, Clock, Scale, UserPlus, EyeOff, Star, Users } from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  isAnonymous: boolean;
  avgRating: string;
  reviewCount: number;
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  status: string;
  lastActiveAt: string;
  createdAt: string;
  isFollowing: boolean;
  practiceAreas: string[];
}

interface ProfileCardProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProfileCard({ profile, isOwnProfile = false }: ProfileCardProps) {
  const rating = parseFloat(profile.avgRating);

  return (
    <div className="w-full font-sans">
      {/* Cover */}
      <div className="w-full h-44 rounded-t-xl overflow-hidden bg-gray-100">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-sm">No cover photo</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="bg-white border border-t-0 border-gray-100 rounded-b-xl px-5 pb-5">

        {/* Avatar row */}
        <div className="flex items-end justify-between flex-wrap gap-2 -mt-8 mb-3">
          <div className="w-16 h-16 rounded-full border-[3px] border-white bg-gray-100 flex items-center justify-center text-lg font-medium text-gray-500 overflow-hidden shrink-0">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              : getInitials(profile.fullName)
            }
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-9">
            {!isOwnProfile && (
              <>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A56DB] text-white text-xs font-medium hover:bg-[#1648b8] transition-colors border-0">
                  <Scale className="w-3.5 h-3.5" /> Get a lawyer
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </>
            )}
            {isOwnProfile && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors">
                Edit profile
              </button>
            )}
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Toggle anonymous">
              <EyeOff className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-medium">{profile.fullName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
            </span>
            <span className="flex items-center text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />
              {profile.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
          {profile.bio
            ? <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{profile.bio}</p>
            : <p className="text-sm text-gray-300 mt-1.5 italic">No bio yet</p>
          }
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#E1F5EE] text-[#0F6E56] border border-[#5DCAA5]">
            <Scale className="w-3 h-3" /> Get a lawyer
          </span>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#FAEEDA] text-[#633806] border border-[#EF9F27]">
            <Star className="w-3 h-3" /> {rating.toFixed(1)} rating
          </span>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#E6F1FB] text-[#0C447C] border border-[#85B7EB]">
            <Users className="w-3 h-3" /> {profile.connectionCount} connections
          </span>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {[
            { label: "Reviews", value: profile.reviewCount },
            { label: "Connections", value: profile.connectionCount },
            { label: "Followers", value: profile.followerCount },
            { label: "Following", value: profile.followingCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-medium">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Details */}
        <p className="text-xs font-medium mb-2.5">Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { icon: MapPin, text: [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ") || "No location" },
            { icon: Phone, text: profile.phone ?? "No phone added" },
            { icon: Calendar, text: `Joined ${formatDate(profile.createdAt)}` },
            { icon: Clock, text: `Active ${timeAgo(profile.lastActiveAt)}` },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
              <Icon className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}