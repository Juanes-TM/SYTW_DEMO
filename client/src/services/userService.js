import api from "./api";

export async function getProfile() {
  try {
    const res = await api.get("/api/profile");
    return res.data.user;
  } catch (err) {
    console.error("Error getProfile:", err);
    throw err;
  }
}

export async function updateProfile(data) {
  try {
    const res = await api.put("/api/profile/update", data);
    return { ok: true, user: res.data.user };
  } catch (err) {
    console.error("🔥 ERROR updateProfile COMPLETO:", err);   
    console.error("🔥 RESPONSE:", err.response?.data);        
    return { ok: false, msg: err.response?.data?.msg || "Error desconocido" };
  }
}
