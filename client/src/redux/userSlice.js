import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      // Guardar sesión en localStorage (persistencia)
      localStorage.setItem("fisioUser", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      // Eliminar sesión persistida
      localStorage.removeItem("fisioUser");
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;
export default userSlice.reducer;
