import api from "./api";

export async function getProfile() {
  const res = await api.get("/api/profile");
  return res.data.user;
}
