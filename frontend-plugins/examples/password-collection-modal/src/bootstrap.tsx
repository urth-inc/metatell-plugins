import React from "react";
import { type Container, createRoot } from "react-dom/client";

import App from "./App";

const remoteElement = document.getElementById("root");
const root = createRoot(remoteElement as Container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
