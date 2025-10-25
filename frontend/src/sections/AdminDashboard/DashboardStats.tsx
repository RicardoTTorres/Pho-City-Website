import { dashboardData } from "@/sections/AdminDashboard/dashboard.data";
import CoffeeIcon from "@/assets/Coffee.svg";
import DocumentIcon from "@/assets/Document.svg";
import GraphIcon from "@/assets/Graph.svg";
import TimeIcon from "@/assets/Time.svg";

//This is for the Dashboard Stats Such as "Website Statis", "Menu Items", "Categories", "Last Updated" Under the Admin Header/Navbar
export function DashboardStats() {
  const stats = [
    {
      //values
      label: "Website Status",
      value: dashboardData.websiteStatus,
      icon: GraphIcon,

      //Styling
      bg: "bg-[linear-gradient(180deg,#FFF_0%,#FEF1F0_100%)]",
      borderColor: "border-[#FEE2E1]",
      labelColor: "text-[#FD160D]",
      circleBg: "bg-[#FEE2E1]",
    },
    {
      //values
      label: "Menu Items",
      value: dashboardData.menuItems,
      icon: CoffeeIcon,

      //styling
      bg: "bg-[linear-gradient(180deg,#FFF_0%,#FEFDF8_100%)]",
      borderColor: "border-[#FCF1D0]",
      labelColor: "text-[#A17F1E]",
      circleBg: "bg-[#FEF9ED]",
    },
    {
      //values
      label: "Categories",
      value: dashboardData.categories,
      icon: DocumentIcon,

      //styling
      bg: "bg-[linear-gradient(135deg,#FFF_0%,#F0FDF4_100%)]",
      borderColor: "border-[#B9F8CF]",
      labelColor: "text-[#008236]",
      circleBg: "bg-[#DCFCE7]",
    },
    {
      //values
      label: "Last Updated",
      value: dashboardData.lastUpdated,
      icon: TimeIcon,

      //styling
      bg: "bg-[linear-gradient(135deg,#FFF_0%,#EFF6FF_100%)]",
      borderColor: "border-[#BEDBFF]",
      labelColor: "text-[#1447E6]",
      circleBg: "bg-[#DBEAFE]",
    },
  ];

  return (
    <section className="w-full bg-transparent py-8 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`
              relative
              ${stat.bg}
              ${stat.borderColor}
              border-2 
              rounded-2xl 
              shadow-sm 
              p-6 
              flex flex-col 
              justify-center 
              transition 
              hover:shadow-md
            `}
          >
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${stat.labelColor}`}>
                {stat.label}
              </h3>
              <p className="text-xl font-semibold text-brand-charcoal">
                {stat.value}
              </p>
            </div>

            <div
              className={`absolute top-1/2 -translate-y-1/2 right-6 flex items-center justify-center w-10 h-10 rounded-full ${stat.circleBg}`}
            >
              <img
                src={stat.icon}
                alt={stat.label}
                className="w-4 h-4 opacity-90"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
