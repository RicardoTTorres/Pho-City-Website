import { Button } from "@/components/ui/button";
import ChefIcon from "@/assets/ChefIcon.svg";
import HomeIcon from "@/assets/Home.svg";
import SaveIcon from "@/assets/Save.svg";
import LogoutIcon from "@/assets/Logout.svg";

//admin header shows the status, home button, save changes, and logout button
export function DashboardHeader() {
  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between w-full px-8 py-2
                 border-b-[4px] border-[rgba(212,175,55,0.20)]
                 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]
                 bg-[rgba(255,255,255,0.95)] backdrop-blur-sm"
    >
      {/*Left side of header — Logo and Title*/}
      <div className="flex items-center gap-3">
        <div className="bg-brand-red rounded-2xl p-2.5 flex items-center justify-center">
          <img
            src={ChefIcon}
            alt="Chef Icon"
            className="w-5 h-5 brightness-0 invert"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-brand-charcoal leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-brand-charcoal/70 leading-snug">
            Content Management System
          </p>
        </div>
      </div>

      {/*right side — Status + Buttons*/}
      <div className="flex items-center gap-3 mt-3 md:mt-0">
        {/*Online status*/}
        <span className="flex items-center bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Online
        </span>

        {/*View Website Button*/}
        <Button
          className="flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.30)]
                     bg-brand-cream text-brand-charcoal text-[14px] font-arimo px-4 py-1.5
                     transition-all duration-200 hover:bg-brand-gold/10"
        >
          <img src={HomeIcon} alt="Home" className="w-4 h-4" />
          View Website
        </Button>

        {/*Save Changes Button*/}
        <Button
          className="flex items-center gap-2 text-white text-[14px] font-arimo px-4 py-1.5 rounded-lg
                     shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]
                     transition-all duration-200
                     bg-[linear-gradient(180deg,#D4AF37_0%,#C19B28_100%)]
                     hover:bg-[linear-gradient(180deg,#C9A233_0%,#AF8C22_100%)]"
        >
          <img src={SaveIcon} alt="Save" className="w-4 h-4" />
          Save Changes
        </Button>

        {/*Logout Button*/}
        <Button
          className="flex items-center gap-2 rounded-lg border border-[#FECAC8]
                     bg-brand-cream text-[#FD160D] text-[14px] font-arimo px-4 py-1.5
                     transition-all duration-200 hover:bg-[#FFF2F2]"
        >
          <img src={LogoutIcon} alt="Logout" className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

