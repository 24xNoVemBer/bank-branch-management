"use client";

import React, { createContext, useContext, useState } from "react";

export type Role = "Quản lý" | "Kinh doanh" | "Giao dịch viên";

interface RoleContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("Quản lý");

  React.useEffect(() => {
    const saved = localStorage.getItem("system_role");
    if (saved) setCurrentRole(saved as Role);
  }, []);

  const handleSetRole = (role: Role) => {
    setCurrentRole(role);
    localStorage.setItem("system_role", role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: handleSetRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
