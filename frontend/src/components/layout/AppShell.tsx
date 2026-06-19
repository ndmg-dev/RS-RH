import React from "react";
import { Navbar } from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 mt-14 py-6 px-4 max-w-6xl w-full mx-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
};
