import React from "react";
import Sidebar from "../Components/Sidebar";
import { Providers } from "../providers";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Sidebar />
      <Providers>{children}</Providers>
    </div>
  );
};

export default layout;
