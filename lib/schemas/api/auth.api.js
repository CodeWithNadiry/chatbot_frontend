import api from "./apiClient";

export const authAPI = {
  login: async (payload) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
  },

  signup: async (payload) => {
    const res = await api.post("/auth/signup", payload);
    return res.data;
  },
};



// await api.put(
//   "/users/123", // req.params on backend
//   { // req.body 
//     name: "Usman",
//     age: 18,
//   },
//   {
//     params: { // req.query
//       notify: true,
//     },
//   }
// );