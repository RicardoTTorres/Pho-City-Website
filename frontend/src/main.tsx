
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import React from "react"
import ReactDOM from "react-dom/client"
import { ContentProvider } from "./components/ContentContext"
import './styles/global.css'



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </React.StrictMode>
);


//createRoot(document.getElementById("root")!).render(<App />);
