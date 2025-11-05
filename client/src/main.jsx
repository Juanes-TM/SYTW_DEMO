import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import store from "./redux/store";
import { loginSuccess } from "./redux/userSlice";
import "./index.css";

// Restaurar sesión si existe
const savedUser = localStorage.getItem("fisioUser");
if (savedUser) {
  store.dispatch(loginSuccess(JSON.parse(savedUser)));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
