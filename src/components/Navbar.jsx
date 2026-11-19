
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);

  // Consultamos el rol del usuario que inició sesión.
  async function consultarRol(session) {
    if (!session) {
      setUsuario(null);
      setRol(null);
      return;
    }

    setUsuario(session.user);

    const { data, error } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error al consultar el rol:", error.message);
      setRol(null);
    } else {
      setRol(data.rol);
    }
  }

  // Detectamos el inicio y cierre de sesión.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      consultarRol(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        consultarRol(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cerramos la sesión actual.
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  }

  const claseNav = ({ isActive }) =>
    isActive
      ? "nav-link link-nebula activo"
      : "nav-link link-nebula";

  return (
    <nav className="navbar navbar-expand-lg navbar-nebula">
      <div className="container">

        <NavLink to="/" className="navbar-brand logo-nebula">
          🍦 Nebula <span>Cream</span>
        </NavLink>

        <div className="navbar-nav ms-auto flex-row flex-wrap">

          <NavLink to="/" end className={claseNav}>
            Inicio
          </NavLink>

          <NavLink to="/productos" className={claseNav}>
            Productos
          </NavLink>

          {/* Estas opciones solamente aparecen para el administrador. */}
          {rol === "administrador" && (
            <>
              <NavLink to="/gestionar-productos" className={claseNav}>
                Gestión de productos
              </NavLink>

              <NavLink to="/ingredientes" className={claseNav}>
                Ingredientes
              </NavLink>
            </>
          )}

          {usuario && (
            <NavLink to="/ventas" className={claseNav}>
              Ventas
            </NavLink>
          )}

          {!usuario ? (
            <NavLink to="/login" className={claseNav}>
              Iniciar sesión
            </NavLink>
          ) : (
            <button
              className="nav-link link-nebula border-0 bg-transparent"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
