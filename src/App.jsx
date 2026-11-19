
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Inicio from "./components/Inicio.jsx";
import Productos from "./components/Productos.jsx";
import IngredientesCRUD from "./components/IngredientesCRUD.jsx";
import Ventas from "./components/Ventas.jsx";
import Login from "./components/Login.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ingredientes" element={<IngredientesCRUD />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
