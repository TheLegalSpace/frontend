"use client";

import ProfileCard from "@/app/Components/ProfileCard";
import { useMe } from "@/hooks/useProfile";
import React from "react";

const page = () => {
  const { data: profile, isLoading } = useMe();
  console.log(profile);
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <ProfileCard profile={profile.data} isOwnProfile />{" "}
    </div>
  );
};

export default page;
