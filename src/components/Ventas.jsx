
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Ventas() {
  // Guardo los productos disponibles para vender.
  const [productos, setProductos] = useState([]);
  // Guardo el historial de ventas.
  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(true);

  // Controlo el producto seleccionado.
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  // Guardo los productos y cantidades agregados a la venta.
  const [carrito, setCarrito] = useState([]);

  // Controlo el método de pago.
  const [metodoPago, setMetodoPago] = useState("efectivo");

  // Controlo los mensajes y estados de la página.
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  // Consulto los productos activos de Supabase.
  async function consultarProductos() {
    setCargando(true);

    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, categoria")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) {
      setMensaje("Error al consultar productos: " + error.message);
    } else {
      setProductos(data);
    }

    setCargando(false);
  }

  // Consulto las ventas y sus respectivos detalles.
  async function consultarVentas() {
    setCargandoVentas(true);

    const { data, error } = await supabase
      .from("ventas")
      .select(`
        id,
        fecha,
        total,
        metodo_pago,
        estado,
        detalle_ventas (
          id,
          cantidad,
          precio_unitario,
          subtotal,
          productos (
            nombre
          )
        )
      `)
      .order("fecha", { ascending: false });

    if (error) {
      setMensaje("Error al consultar el historial: " + error.message);
    } else {
      setVentas(data || []);
    }

    setCargandoVentas(false);
  }

  // Cargo los productos cuando se abre el módulo.
  useEffect(() => {
    consultarProductos();
    consultarVentas();
  }, []);

  // Agrego un producto al carrito.
  function agregarProducto() {
    const producto = productos.find(
      (item) => item.id === Number(productoSeleccionado)
    );

    if (!producto) {
      setMensaje("Selecciona un producto antes de agregarlo.");
      return;
    }

    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.producto.id === producto.id
      );

      // Si el producto ya está agregado, aumento su cantidad.
      if (existe) {
        return carritoActual.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      // Si es nuevo, lo agrego con cantidad inicial de uno.
      return [
        ...carritoActual,
        {
          producto: producto,
          cantidad: 1,
        },
      ];
    });

    setProductoSeleccionado("");
    setMensaje("");
  }

  // Modifico la cantidad de un producto.
  function cambiarCantidad(id, cantidad) {
    if (cantidad < 1) return;

    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.producto.id === id
          ? { ...item, cantidad: cantidad }
          : item
      )
    );
  }

  // Retiro un producto del carrito.
  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.producto.id !== id)
    );
  }

  // Calculo el total de la venta.
  const total = carrito.reduce(
    (acumulado, item) =>
      acumulado + Number(item.producto.precio) * item.cantidad,
    0
  );

  // Registro la venta y descuento los ingredientes del inventario.
  async function registrarVenta() {
    if (carrito.length === 0) {
      setMensaje("Agrega al menos un producto a la venta.");
      return;
    }

    setRegistrando(true);
    setMensaje("");

    // Preparo los productos para enviarlos a la función SQL.
    const productosVenta = carrito.map((item) => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad,
    }));

    // Ejecuto la función que registra la venta en Supabase.
    const { data, error } = await supabase.rpc("registrar_venta", {
      p_items: productosVenta,
      p_metodo_pago: metodoPago,
    });

    if (error) {
      setMensaje("No se pudo registrar la venta: " + error.message);
    } else {
      setMensaje(
        `¡Venta registrada correctamente! Número de venta: ${data}`
      );

      // Limpio el carrito después de registrar la venta.
      setCarrito([]);
      setProductoSeleccionado("");
      setMetodoPago("efectivo");
      await consultarVentas();
    }

    setRegistrando(false);
  }

  return (
    <main className="container py-5">

      <section className="text-center mb-5">
        <p className="subtitulo-nebula">ADMINISTRACIÓN</p>

        <h1>Registro de ventas</h1>

        <p className="descripcion-nebula">
          Registra las compras de tus clientes en Nebula Cream.
        </p>
      </section>

      {/* Selección de productos. */}
      <section className="ingredientes-formulario mb-5">

        <h3 className="ingredientes-subtitulo">
          Agregar productos
        </h3>

        {cargando ? (
          <p>Consultando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos activos disponibles.</p>
        ) : (
          <div className="row align-items-end">

            <div className="col-md-9 mb-3">
              <label className="form-label">
                Selecciona un producto
              </label>

              <select
                className="form-control"
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar producto...</option>

                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - $
                    {Number(producto.precio).toLocaleString("es-CO")}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <button
                type="button"
                className="btn btn-nebula w-100"
                onClick={agregarProducto}
              >
                Agregar
              </button>
            </div>

          </div>
        )}

      </section>

      {/* Productos agregados a la venta. */}
      <section className="mb-5">

        <h3 className="ingredientes-subtitulo mb-4">
          Detalle de la venta
        </h3>

        {carrito.length === 0 ? (
          <p className="text-center">
            Todavía no has agregado productos a esta venta.
          </p>
        ) : (

          <div className="row g-4">

            {carrito.map((item) => (

              <div className="col-md-6 col-lg-4" key={item.producto.id}>

                <article className="card tarjeta-nebula h-100">

                  <div className="card-body">

                    <h3 className="h5">
                      {item.producto.nombre}
                    </h3>

                    <p>
                      Precio unitario: $
                      {Number(item.producto.precio).toLocaleString("es-CO")}
                    </p>

                    <label className="form-label">
                      Cantidad
                    </label>

                    <div className="d-flex gap-2 align-items-center mb-3">

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          cambiarCantidad(
                            item.producto.id,
                            item.cantidad - 1
                          )
                        }
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>

                      <strong>{item.cantidad}</strong>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          cambiarCantidad(
                            item.producto.id,
                            item.cantidad + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <p>
                      Subtotal:{" "}
                      <strong>
                        $
                        {(
                          Number(item.producto.precio) * item.cantidad
                        ).toLocaleString("es-CO")}
                      </strong>
                    </p>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        eliminarDelCarrito(item.producto.id)
                      }
                    >
                      Quitar producto
                    </button>

                  </div>

                </article>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* Resumen y registro de la venta. */}
      <section className="ingredientes-formulario">

        <h3 className="ingredientes-subtitulo">
          Resumen de la venta
        </h3>

        <div className="mb-3">
          <label className="form-label">
            Método de pago
          </label>

          <select
            className="form-control"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <h3 className="mb-4">
          Total: $
          {total.toLocaleString("es-CO")}
        </h3>

        <button
          type="button"
          className="btn btn-nebula"
          onClick={registrarVenta}
          disabled={registrando || carrito.length === 0}
        >
          {registrando ? "Registrando venta..." : "Registrar venta"}
        </button>

      </section>

      {/* Mensajes de confirmación o error. */}
      
      {/* Historial de ventas registradas. */}
      {mensaje && (
        <div className="mensaje-nebula mt-4">
          {mensaje}
        </div>
      )}

      <section className="mt-5">

        <h3 className="ingredientes-subtitulo mb-4">
          Historial de ventas
        </h3>

        {cargandoVentas ? (
          <p>Consultando historial...</p>
        ) : ventas.length === 0 ? (
          <p>Todavía no hay ventas registradas.</p>
        ) : (

          <div className="row g-4">

            {ventas.map((venta) => (

              <div className="col-12" key={venta.id}>

                <article className="card tarjeta-nebula">

                  <div className="card-body">

                    <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">

                      <h4 className="h5">
                        Venta #{venta.id}
                      </h4>

                      <span>
                        {venta.estado === "completada"
                          ? "Completada"
                          : "Anulada"}
                      </span>

                    </div>

                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(venta.fecha).toLocaleString("es-CO")}
                    </p>

                    <p>
                      <strong>Método de pago:</strong>{" "}
                      {venta.metodo_pago}
                    </p>

                    <h5 className="mt-3">Productos vendidos</h5>

                    {venta.detalle_ventas.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="mb-3"
                      >
                        <strong>
                          {detalle.productos?.nombre || "Producto"}
                        </strong>

                        <div className="d-flex justify-content-between flex-wrap gap-2">
                          <span>Cantidad:</span>
                          <span>{detalle.cantidad} unidades</span>
                        </div>

                        <div className="d-flex justify-content-between flex-wrap gap-2">
                          <span>Precio unitario:</span>
                          <span>
                            ${Number(detalle.precio_unitario).toLocaleString("es-CO")}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between flex-wrap gap-2">
                          <strong>Subtotal:</strong>
                          <strong>
                            ${Number(detalle.subtotal).toLocaleString("es-CO")}
                          </strong>
                        </div>
                      </div>


                    ))}

                    <hr />

                    <div className="text-end">
                      <strong>
                        Total: $
                        {Number(venta.total).toLocaleString("es-CO")}
                      </strong>
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

export default Ventas;
