import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { ContentProvider } from "@/app/providers/ContentContext";
import { BrowserRouter } from 'react-router-dom'
import "./styles/global.css";
import { PageViewTracker } from "@/app/analytics/PageViewTracker";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <PageViewTracker />
        <App />
      </ContentProvider>
    </BrowserRouter>
  </React.StrictMode>
);
