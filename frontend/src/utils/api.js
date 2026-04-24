// utils/api.js
// Centralized API helper so we don't repeat fetch logic everywhere

const BASE_URL = "http://localhost:5000/api";

// Generic fetch function that adds the JWT token automatically
async function request(endpoint, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // If response is not OK (e.g., 400, 401, 500), throw the error message
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// ---- AUTH ----
export const authAPI = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

// ---- TRANSACTIONS ----
export const transactionAPI = {
  getAll: (token, filters = {}) => {
    // Build query string from filters object
    const params = new URLSearchParams(filters).toString();
    return request(`/transactions${params ? "?" + params : ""}`, {}, token);
  },
  getSummary: (token, month, year) =>
    request(`/transactions/summary?month=${month}&year=${year}`, {}, token),
  add: (token, body) =>
    request("/transactions", { method: "POST", body: JSON.stringify(body) }, token),
  delete: (token, id) =>
    request(`/transactions/${id}`, { method: "DELETE" }, token),
};

// ---- BUDGETS ----
export const budgetAPI = {
  getAll: (token, month, year) =>
    request(`/budgets?month=${month}&year=${year}`, {}, token),
  save: (token, body) =>
    request("/budgets", { method: "POST", body: JSON.stringify(body) }, token),
  delete: (token, id) =>
    request(`/budgets/${id}`, { method: "DELETE" }, token),
};

// ---- CHAT ----
export const chatAPI = {
  send: (token, body) =>
    request("/chat", { method: "POST", body: JSON.stringify(body) }, token),
};

