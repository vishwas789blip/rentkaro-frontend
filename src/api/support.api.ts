import apiClient from "./axios";

export const supportAPI = {
  create: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => apiClient.post("/support", data),

  getAll: () =>
    apiClient.get("/support"),

  reply: (
    id: string,
    data: { message: string }
  ) => apiClient.patch(`/support/${id}/reply`, data),

  getUserTickets: () =>
    apiClient.get("/support/my-tickets"),
};