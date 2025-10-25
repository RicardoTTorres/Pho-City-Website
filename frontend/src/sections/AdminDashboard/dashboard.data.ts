// Temporary static data for Admin Dashboard (will be replaced by /API backend later)
export interface DashboardData {
  websiteStatus: string;
  menuItems: number;
  categories: number;
  lastUpdated: string;
}

export const dashboardData: DashboardData = {
  websiteStatus: "Live",
  menuItems: 7,
  categories: 3,
  lastUpdated: "Today",
};
