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