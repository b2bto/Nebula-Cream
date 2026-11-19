
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function RutaProtegida({ children }) {
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarAcceso() {
      const { data: sesion } = await supabase.auth.getSession();

      if (!sesion.session) {
        setRol("sin_sesion");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", sesion.session.user.id)
        .single();

      if (error) {
        setRol("sin_permiso");
      } else {
        setRol(data.rol);
      }

      setCargando(false);
    }

    verificarAcceso();
  }, []);

  if (cargando) {
    return <p className="text-center mt-5">Verificando permisos...</p>;
  }

  if (rol === "sin_sesion") {
    return <Navigate to="/login" replace />;
  }

  if (rol !== "administrador") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;
