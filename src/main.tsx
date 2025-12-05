import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Overlay } from "./windows/Overlay";

const windowLabel = getCurrentWindow().label;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        {windowLabel === "overlay" ? <Overlay /> : <App />}
    </React.StrictMode>,
);
