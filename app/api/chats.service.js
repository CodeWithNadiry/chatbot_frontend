import { apiClient } from "./apiClient";

export const sendQuery = async (data) => {
  const response = await apiClient.post("/chats/query", data);
  return response.data;
};
