
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-nebula">
      <div className="container">

        {/* Logo y nombre de la heladería */}
        <NavLink to="/" className="navbar-brand logo-nebula">
          🍦 Nebula <span>Cream</span>
        </NavLink>

        {/* Enlaces de navegación */}
        <div className="navbar-nav ms-auto flex-row flex-wrap">

          <NavLink to="/" end className={({ isActive }) =>
            isActive ? "nav-link link-nebula activo" : "nav-link link-nebula"
          }>
            Inicio
          </NavLink>

          <NavLink to="/productos" className={({ isActive }) =>
            isActive ? "nav-link link-nebula activo" : "nav-link link-nebula"
          }>
            Productos
          </NavLink>

          <NavLink to="/ingredientes" className={({ isActive }) =>
            isActive ? "nav-link link-nebula activo" : "nav-link link-nebula"
          }>
            Ingredientes
          </NavLink>

          <NavLink to="/ventas" className={({ isActive }) =>
            isActive ? "nav-link link-nebula activo" : "nav-link link-nebula"
          }>
            Ventas
          </NavLink>

          <NavLink to="/login" className={({ isActive }) =>
            isActive ? "nav-link link-nebula activo" : "nav-link link-nebula"
          }>
            Iniciar sesión
          </NavLink>

        </div>
      </div>
    </nav>
  );
}
export default Navbar;
