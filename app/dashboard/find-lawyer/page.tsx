"use client";
import AccessRestricted from "@/app/Components/Accessrestricted";
import FindALawyer from "@/app/Components/FindALawyer";
import { useAuth } from "@/app/context/AuthContext";
import { UserRole } from "@/app/types/types";
import Link from "next/link";

import React from "react";

const page = () => {
  const { user } = useAuth();
  const role: UserRole = (user?.role as UserRole) ?? "USER";

  return role === "USER" ? <FindALawyer /> : <AccessRestricted />;
};

export default page;
