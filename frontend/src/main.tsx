import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ContentProvider } from "@/context/ContentContext";
import { BrowserRouter } from 'react-router-dom'
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContentProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContentProvider>
  </React.StrictMode>
);
