
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function GestionProductos() {
  // Guardo los productos consultados en Supabase.
  const [productos, setProductos] = useState([]);

  // Controlo los datos del formulario.
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "Helados",
  });

  // Identifico si estoy creando o editando un producto.
  const [productoEditando, setProductoEditando] = useState(null);

  // Controlo mensajes y estados de la página.
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Consulto todos los productos registrados.
  async function consultarProductos() {
    setCargando(true);

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setMensaje("Error al consultar productos: " + error.message);
    } else {
      setProductos(data);
    }

    setCargando(false);
  }

  // Cargo los productos cuando se abre la página.
  useEffect(() => {
    consultarProductos();
  }, []);

  // Actualizo los campos del formulario.
  function cambiarCampo(e) {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  // Limpio el formulario y salgo del modo edición.
  function limpiarFormulario() {
    setFormulario({
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "Helados",
    });

    setProductoEditando(null);
  }

  
  // Registro un producto nuevo o actualizo uno existente.
  async function guardarProducto(e) {
    e.preventDefault();

    setGuardando(true);
    setMensaje("");

    const datosProducto = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      precio: Number(formulario.precio),
      categoria: formulario.categoria,
    };

    let resultado;

    if (productoEditando) {
      resultado = await supabase
        .from("productos")
        .update(datosProducto)
        .eq("id", productoEditando.id)
        .select("id");
    } else {
      resultado = await supabase
        .from("productos")
        .insert({
          ...datosProducto,
          activo: true,
        })
        .select("id");
    }

    if (resultado.error) {
      setMensaje("No se pudo guardar: " + resultado.error.message);
    } else if (!resultado.data || resultado.data.length === 0) {
      setMensaje(
        "No se realizaron cambios. Verifica que tengas permisos de administrador."
      );
    } else {
      setMensaje(
        productoEditando
          ? "Producto actualizado correctamente."
          : "Producto registrado correctamente."
      );

      limpiarFormulario();
      await consultarProductos();
    }

    setGuardando(false);
  }


  // Cargo los datos de un producto en el formulario.
  function editarProducto(producto) {
    setProductoEditando(producto);

    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      categoria: producto.categoria || "Helados",
    });

    setMensaje("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Desactivo un producto sin eliminarlo de la base de datos.
  async function desactivarProducto(producto) {
    const confirmar = window.confirm(
      `¿Deseas desactivar ${producto.nombre}?`
    );

    if (!confirmar) return;

    const { data, error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id", producto.id)
      .select("id");

    if (error) {
      setMensaje("No se pudo desactivar: " + error.message);
    } else if (!data || data.length === 0) {
      setMensaje("No tienes permisos para desactivar productos.");
    } else {
      setMensaje("Producto desactivado correctamente.");
      await consultarProductos();
    }
  }
  
  // Reactivar un producto desactivado.
  async function activarProducto(producto) {
    const { data, error } = await supabase
      .from("productos")
      .update({ activo: true })
      .eq("id", producto.id)
      .select("id");

    if (error) {
      setMensaje("No se pudo activar: " + error.message);
    } else if (!data || data.length === 0) {
      setMensaje("No tienes permisos para activar productos.");
    } else {
      setMensaje("Producto activado correctamente.");
      await consultarProductos();
    }
  }


  // Elimino un producto únicamente si no tiene recetas ni ventas asociadas.
  async function eliminarProducto(producto) {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar ${producto.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setMensaje("");

    // Compruebo si el producto tiene ingredientes asociados.
    const { count: recetas, error: errorRecetas } = await supabase
      .from("producto_ingredientes")
      .select("*", { count: "exact", head: true })
      .eq("producto_id", producto.id);

    if (errorRecetas) {
      setMensaje("Error al comprobar recetas: " + errorRecetas.message);
      return;
    }

    // Compruebo si el producto aparece en alguna venta.
    const { count: ventas, error: errorVentas } = await supabase
      .from("detalle_ventas")
      .select("*", { count: "exact", head: true })
      .eq("producto_id", producto.id);

    if (errorVentas) {
      setMensaje("Error al comprobar ventas: " + errorVentas.message);
      return;
    }

    // Evito eliminar productos que tengan información relacionada.
    if (recetas > 0 || ventas > 0) {
      setMensaje(
        "No se puede eliminar este producto porque tiene recetas o ventas relacionadas. Puedes desactivarlo."
      );
      return;
    }

    // Elimino el producto de Supabase.
    const { data, error } = await supabase
      .from("productos")
      .delete()
      .eq("id", producto.id)
      .select("id");

    if (error) {
      setMensaje("No se pudo eliminar: " + error.message);
    } else if (!data || data.length === 0) {
      setMensaje("No se eliminó el producto. Verifica los permisos de administrador.");
    } else {
      setMensaje("Producto eliminado correctamente.");

      // Si estaba editando este producto, limpio el formulario.
      if (productoEditando?.id === producto.id) {
        limpiarFormulario();
      }

      await consultarProductos();
    }
  }


  return (
    <main className="container py-5">

      <section className="text-center mb-5">
        <p className="subtitulo-nebula">ADMINISTRACIÓN</p>

        <h1>Gestión de productos</h1>

        <p className="descripcion-nebula">
          Administra el catálogo de Nebula Cream.
        </p>
      </section>

      {/* Formulario para registrar o editar productos. */}
      <section className="ingredientes-formulario mb-5">

        <h3 className="ingredientes-subtitulo">
          {productoEditando ? "Editar producto" : "Registrar producto"}
        </h3>

        <form onSubmit={guardarProducto}>

          <div className="mb-3">
            <label className="form-label">Nombre del producto</label>

            <input
              type="text"
              name="nombre"
              className="form-control"
              value={formulario.nombre}
              onChange={cambiarCampo}
              placeholder="Ej. Helado de vainilla"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>

            <textarea
              name="descripcion"
              className="form-control"
              value={formulario.descripcion}
              onChange={cambiarCampo}
              placeholder="Describe el producto"
              rows="3"
            />
          </div>

          <div className="row">

            <div className="col-md-6 mb-3">
              <label className="form-label">Precio (COP)</label>

              <input
                type="number"
                name="precio"
                className="form-control"
                value={formulario.precio}
                onChange={cambiarCampo}
                min="1"
                step="1"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Categoría</label>

              <select
                name="categoria"
                className="form-control"
                value={formulario.categoria}
                onChange={cambiarCampo}
                required
              >
                <option value="Helados">Helados</option>
                <option value="Malteadas">Malteadas</option>
                <option value="Postres">Postres</option>
              </select>
            </div>

          </div>

          <div className="d-flex gap-2 flex-wrap">

            <button
              type="submit"
              className="btn btn-nebula"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : productoEditando
                  ? "Actualizar producto"
                  : "Registrar producto"}
            </button>

            {productoEditando && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}

          </div>

        </form>
      </section>

      {/* Mensajes de confirmación o error. */}
      {mensaje && (
        <div className="mensaje-nebula mb-4">
          {mensaje}
        </div>
      )}

      {/* Listado de productos registrados. */}
      <section>

        <h3 className="ingredientes-subtitulo mb-4">
          Productos registrados
        </h3>

        {cargando ? (
          <p>Consultando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (

          <div className="row g-4">

            {productos.map((producto) => (

              <div className="col-md-6 col-lg-4" key={producto.id}>

                <article className="card tarjeta-nebula h-100">

                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <span>
                        {producto.categoria === "Malteadas"
                          ? "🥤"
                          : producto.categoria === "Postres"
                            ? "🍧"
                            : "🍨"}
                      </span>

                      <span>
                        {producto.activo ? "Activo" : "Inactivo"}
                      </span>

                    </div>

                    <h3 className="h5">{producto.nombre}</h3>

                    <p>{producto.descripcion}</p>

                    <strong>
                      ${Number(producto.precio).toLocaleString("es-CO")}
                    </strong>

                    <div className="d-flex gap-2 flex-wrap mt-3">

                      <button
                        type="button"
                        className="btn btn-nebula"
                        onClick={() => editarProducto(producto)}
                      >
                        Editar
                      </button>

                      <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => eliminarProducto(producto)}
                        >
                          Eliminar
                        </button>

                      {producto.activo ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => desactivarProducto(producto)}
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-nebula"
                          onClick={() => activarProducto(producto)}
                        >
                          Reactivar
                        </button>
                      )}

                    </div>

                  </div>

                </article>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default GestionProductos;
