import React, { useState } from "react";
import { DashboardHeader } from "@/sections/AdminDashboard/DashboardHeader";
import { DashboardStats } from "@/sections/AdminDashboard/DashboardStats";
import { DashboardNav } from "@/sections/AdminDashboard/DashboardNav";
import { HeroSectionEditor } from "@/sections/AdminDashboard/HeroSectionEditor";
import { MenuSectionEditor } from "@/sections/AdminDashboard/MenuSectionEditor";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("hero");

  const renderContent = () => {
    switch (activeTab) {
      case "hero":
        return <HeroSectionEditor />;
      case "menu":
        return <MenuSectionEditor />;
      //what to add in future, gonna have to do these in segments
      // case "about":
      //   return <AboutSectionEditor />;
      // case "contact":
      //   return <ContactSectionEditor />;
      // case "settings":
      //   return <SettingsSectionEditor />;
      default:
        return <HeroSectionEditor />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100">
      <header className="w-full fixed top-0 left-0 z-50">
        <DashboardHeader />
      </header>

      <main className="pt-24 px-6">
        <DashboardStats />
        <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderContent()}</div>
      </main>
    </div>
  );
}
