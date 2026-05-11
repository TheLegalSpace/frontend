import React from "react";
import Sidebar from "../Components/Sidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Sidebar />
      {children}
    </div>
  );
};

export default layout;
