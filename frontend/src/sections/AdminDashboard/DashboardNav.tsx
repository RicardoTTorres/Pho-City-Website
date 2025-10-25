import StarIcon from "@/assets/Star.svg";
import MenuIcon from "@/assets/Coffee.svg";
import UserIcon from "@/assets/About.svg";
import PhoneIcon from "@/assets/ContactPhone.svg";
import SettingsIcon from "@/assets/GearIcon.svg";

interface DashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const tabs = [
    { name: "Hero Section", key: "hero", icon: StarIcon, colorClass: "bg-brand-red" },
    { name: "Menu", key: "menu", icon: MenuIcon, colorClass: "bg-brand-gold" },
    { name: "About Us", key: "about", icon: UserIcon, colorClass: "bg-brand-green" },
    { name: "Contact Info", key: "contact", icon: PhoneIcon, colorClass: "bg-brand-blue" },
    { name: "Settings", key: "settings", icon: SettingsIcon, colorClass: "bg-brand-purple" },
  ];

  return (
    <nav className="w-full mt-6 px-6">
      <div className="w-full bg-white rounded-2xl shadow-md flex justify-between items-center px-8 py-2 border border-neutral-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 rounded-full w-[230px] h-[35px]
                ${
                  isActive
                    ? `${tab.colorClass} text-white`
                    : "text-brand-charcoal hover:text-brand-red hover:bg-neutral-100"
                }`}
            >
              <img
                src={tab.icon}
                alt={tab.name}
                className={`w-4 h-4 transition-all duration-200 ${
                  isActive ? "brightness-0 invert" : "brightness-0"
                }`}
              />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
