import { apiRequest } from "./api";

export const getDashboardStats = async () => {
  return apiRequest("/api/dashboard/stats");
};