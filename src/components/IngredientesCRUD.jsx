
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function IngredientesCRUD() {

  // Aquí guardamos los ingredientes consultados en Supabase.
  const [ingredientes, setIngredientes] = useState([]);

  // Aquí guardamos los datos escritos en el formulario.
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    precio: ""
  });

  // Identifica si estamos creando o editando un ingrediente.
  const [editando, setEditando] = useState(null);

  // Controla los mensajes que mostramos al usuario.
  const [mensaje, setMensaje] = useState("");

  // Indica cuándo estamos consultando o guardando información.
  const [cargando, setCargando] = useState(false);

  // CONSULTAR INGREDIENTES
  async function consultarIngredientes() {
    setCargando(true);

    const { data, error } = await supabase
      .from("ingredientes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setMensaje("Error al consultar: " + error.message);
    } else {
      setIngredientes(data);
    }

    setCargando(false);
  }

  // Ejecutamos la consulta cuando se carga el componente.
  useEffect(() => {
    consultarIngredientes();
  }, []);

  // CAPTURAR LOS CAMBIOS DEL FORMULARIO
  function cambiarCampo(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  // LIMPIAR EL FORMULARIO
  function limpiarFormulario() {
    setForm({
      nombre: "",
      cantidad: "",
      unidad: "",
      precio: ""
    });

    setEditando(null);
  }

  
// REGISTRAR O ACTUALIZAR INGREDIENTES
async function guardarIngrediente(e) {
  e.preventDefault();
  setMensaje("");

  if (!form.nombre.trim() || !form.unidad.trim()) {
    setMensaje("Debes ingresar el nombre y la unidad.");
    return;
  }

  if (Number(form.cantidad) <= 0 || Number(form.precio) < 0) {
    setMensaje("La cantidad debe ser mayor que cero y el precio no puede ser negativo.");
    return;
  }

  const ingrediente = {
    nombre: form.nombre.trim(),
    cantidad: Number(form.cantidad),
    unidad: form.unidad.trim(),
    precio: Number(form.precio)
  };

  setCargando(true);

  let resultado;

  if (editando !== null) {
    // Actualizamos el ingrediente seleccionado.
    resultado = await supabase
      .from("ingredientes")
      .update(ingrediente)
      .eq("id", editando)
      .select("id");
  } else {
    // Registramos un nuevo ingrediente.
    resultado = await supabase
      .from("ingredientes")
      .insert([ingrediente])
      .select("id");
  }

  if (resultado.error) {
    setMensaje("Error al guardar: " + resultado.error.message);

  } else if (!resultado.data || resultado.data.length === 0) {
    setMensaje(
      "No se realizaron cambios. Verifica que tengas permisos de administrador."
    );

  } else {
    setMensaje(
      editando !== null
        ? "Ingrediente actualizado correctamente."
        : "Ingrediente registrado correctamente."
    );

    limpiarFormulario();
    await consultarIngredientes();
  }

  setCargando(false);
}


  // CARGAR LOS DATOS PARA EDITAR
  function editarIngrediente(ingrediente) {
    setForm({
      nombre: ingrediente.nombre,
      cantidad: ingrediente.cantidad,
      unidad: ingrediente.unidad,
      precio: ingrediente.precio
    });

    setEditando(ingrediente.id);
    setMensaje("");
  }

  // ELIMINAR INGREDIENTES
async function eliminarIngrediente(id) {
  const confirmar = window.confirm(
    "¿Estás seguro de eliminar este ingrediente?"
  );

  if (!confirmar) return;

  setCargando(true);
  setMensaje("");

  // Verificamos si el ingrediente está asociado a alguna receta.
  const { count, error: errorConsulta } = await supabase
    .from("producto_ingredientes")
    .select("id", { count: "exact", head: true })
    .eq("ingrediente_id", id);

  if (errorConsulta) {
    setMensaje("Error al verificar el ingrediente: " + errorConsulta.message);
    setCargando(false);
    return;
  }

  if (count > 0) {
    setMensaje(
      "No se puede eliminar este ingrediente porque está asociado a una o varias recetas."
    );
    setCargando(false);
    return;
  }

  // Si no está asociado, procedemos a eliminarlo.
  const { error } = await supabase
    .from("ingredientes")
    .delete()
    .eq("id", id);

  if (error) {
    setMensaje("Error al eliminar: " + error.message);
  } else {
    setMensaje("Ingrediente eliminado correctamente.");
    await consultarIngredientes();
  }

  setCargando(false);
}

return (
  <main className="ingredientes-contenedor">

    <h1 className="ingredientes-titulo">
      Gestión de ingredientes
    </h1>

    <p className="ingredientes-descripcion">
      Administra los ingredientes de Nebula Cream.
    </p>

    {/* FORMULARIO */}
    <div className="ingredientes-formulario">

      <h3 className="ingredientes-subtitulo">
        {editando !== null
          ? "Editar ingrediente"
          : "Registrar ingrediente"}
      </h3>

      <form onSubmit={guardarIngrediente}>

        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={form.nombre}
            onChange={cambiarCampo}
            placeholder="Ejemplo: Leche"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            className="form-control"
            value={form.cantidad}
            onChange={cambiarCampo}
            min="0.01"
            step="any"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Unidad</label>
          <input
            type="text"
            name="unidad"
            className="form-control"
            value={form.unidad}
            onChange={cambiarCampo}
            placeholder="Ejemplo: Litros"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio</label>
          <input
            type="number"
            name="precio"
            className="form-control"
            value={form.precio}
            onChange={cambiarCampo}
            min="0"
            step="any"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-nebula me-2"
          disabled={cargando}
        >
          {cargando
            ? "Procesando..."
            : editando !== null
              ? "Actualizar ingrediente"
              : "Guardar ingrediente"}
        </button>

        {editando !== null && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={limpiarFormulario}
          >
            Cancelar
          </button>
        )}

      </form>
    </div>

    {/* MENSAJES */}
    {mensaje && (
      <div className="mensaje-nebula">
        {mensaje}
      </div>
    )}

    {/* LISTADO DE INGREDIENTES */}
    <h3 className="ingredientes-subtitulo">
      Ingredientes registrados
    </h3>

    {cargando && <p>Procesando información...</p>}

    {!cargando && ingredientes.length === 0 && (
      <p>Todavía no hay ingredientes registrados.</p>
    )}

    <div className="row">

      {ingredientes.map((ingrediente) => (

        <div className="col-md-6 col-lg-4 mb-3" key={ingrediente.id}>

          <div className="ingrediente-card">

            <h5>{ingrediente.nombre}</h5>

            <p className="mb-1">
              Cantidad: {ingrediente.cantidad} {ingrediente.unidad}
            </p>

            <p>
              Precio: ${Number(ingrediente.precio).toLocaleString("es-CO")}
            </p>

            <div>
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => editarIngrediente(ingrediente)}
              >
                Editar
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => eliminarIngrediente(ingrediente.id)}
              >
                Eliminar
              </button>
            </div>

          </div>

        </div>

      ))}

    </div>

  </main>
);

}

export default IngredientesCRUD;
