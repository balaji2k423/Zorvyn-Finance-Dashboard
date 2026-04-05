import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content - This fixes the gap */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}
      >
        <Navbar />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}