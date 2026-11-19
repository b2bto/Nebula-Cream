
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Productos() {
  // Aquí guardo los productos que llegan desde Supabase.
  const [productos, setProductos] = useState([]);

  // Controlo el estado de carga de la consulta.
  const [cargando, setCargando] = useState(true);

  // Guardo los posibles errores de conexión.
  const [error, setError] = useState("");

  // Consulto los productos cuando se carga el componente.
  useEffect(() => {
    async function consultarProductos() {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, descripcion, precio, categoria")
        .eq("activo", true)
        .order("id", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setProductos(data);
      }

      setCargando(false);
    }

    consultarProductos();
  }, []);

  // Asigno un icono según la categoría del producto.
  function obtenerIcono(categoria) {
    if (categoria === "Malteadas") return "🥤";
    if (categoria === "Postres") return "🍧";
    return "🍨";
  }

  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <p className="subtitulo-nebula">NUESTRO CATÁLOGO</p>

        <h1>Explora nuestros sabores</h1>

        <p className="descripcion-nebula">
          Descubre las delicias que tenemos preparadas para ti.
        </p>
      </section>

      {/* Muestro un mensaje mientras llegan los productos. */}
      {cargando && (
        <p className="text-center">
          Cargando nuestros sabores...
        </p>
      )}

      {/* Muestro el error si ocurre un problema con Supabase. */}
      {error && (
        <p className="text-center">
          No fue posible cargar los productos: {error}
        </p>
      )}

      {/* Muestro las tarjetas cuando ya tengo los productos. */}
      {!cargando && !error && (
        <div className="row g-4">
          {productos.map((producto) => (
            <div className="col-md-4" key={producto.id}>
              <article className="card tarjeta-nebula h-100">
                <div className="card-body text-center">
                  <div className="display-1 mb-3">
                    {obtenerIcono(producto.categoria)}
                  </div>

                  <h3 className="h5">
                    {producto.nombre}
                  </h3>

                  <p>
                    {producto.descripcion}
                  </p>

                  <strong>
                    ${Number(producto.precio).toLocaleString("es-CO")}
                  </strong>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {/* Aviso cuando todavía no existen productos activos. */}
      {!cargando && !error && productos.length === 0 && (
        <p className="text-center">
          Todavía no hay productos disponibles.
        </p>
      )}
    </main>
  );
}

export default Productos;
