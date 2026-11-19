
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  // Guardo los datos que escribe el usuario.
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  // Controlo los mensajes y el estado del formulario.
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Inicio sesión utilizando Supabase Auth.
  async function iniciarSesion(e) {
    e.preventDefault();

    setCargando(true);
    setMensaje("");

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (error) {
      setMensaje("No fue posible iniciar sesión: " + error.message);
    } else {
      setMensaje("¡Bienvenido a Nebula Cream!");
      navigate("/");
    }

    setCargando(false);
  }

  return (
    <main className="container py-5">
      <section className="text-center mb-4">
        <p className="subtitulo-nebula">NEBULA CREAM</p>
        <h1>Iniciar sesión</h1>
        <p className="descripcion-nebula">
          Ingresa para acceder al sistema.
        </p>
      </section>

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card tarjeta-nebula p-4">
            <form onSubmit={iniciarSesion}>
              <div className="mb-3">
                <label className="form-label">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Contraseña
                </label>

                <input
                  type="password"
                  className="form-control"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>

              {mensaje && (
                <p className="mensaje-nebula">
                  {mensaje}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-nebula w-100"
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
