// Feature: dashboard — quick stats and recent meetings. Full customization (widgets, layout)
// is future scope; this is the real, permanent dashboard for what the product needs today.
// Public API of this feature. Other code may import only from here.
export { getDashboardData } from "./services/get-dashboard-data";
export { DashboardStats } from "./components/dashboard-stats";
export { RecentMeetings } from "./components/recent-meetings";
