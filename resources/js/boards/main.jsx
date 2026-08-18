import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("React is running!");

const root = document.getElementById("board-root");

if (!root) {
  console.error("❌ board-root not found");
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
