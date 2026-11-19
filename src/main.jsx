
// Estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Estilos propios
import "../css/styles.css";

// Componentes de React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Componente principal
import App from "./App.jsx";

// Mostrar la aplicación en el navegador
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
