import { apiRequest } from "./api";

export const createTicket = async (ticketData) => {
  return apiRequest("/api/tickets/", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });
};

export const getTickets = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  category = "",
  priority = "",
} = {}) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("page_size", pageSize);

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (status) {
    params.append("status", status);
  }

  if (category) {
    params.append("category", category);
  }

  if (priority) {
    params.append("priority", priority);
  }

  return apiRequest(`/api/tickets/?${params.toString()}`);
};

export const getTicketById = async (id) => {
  return apiRequest(`/api/tickets/${id}`);
};

export const updateTicketStatus = async (id, status, remark) => {
  return apiRequest(`/api/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      remark,
    }),
  });
};
export const exportTicketsCsv = async ({
  search = "",
  status = "",
  category = "",
  priority = "",
} = {}) => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const params = new URLSearchParams();

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (status) {
    params.append("status", status);
  }

  if (category) {
    params.append("category", category);
  }

  if (priority) {
    params.append("priority", priority);
  }

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/api/tickets/export/csv?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || "Failed to export tickets"
    );
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "tickets.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};