
function Productos() {
  // Lista inicial de productos de Nebula Cream
  const productos = [
    {
      id: 1,
      nombre: "Copa Vainilla Deluxe",
      descripcion: "Helado de vainilla con crema y chocolate.",
      precio: 5000,
      icono: "🍨",
    },
    {
      id: 2,
      nombre: "Copa ChocoFresa",
      descripcion: "Una deliciosa combinación de chocolate y fresa.",
      precio: 6000,
      icono: "🍓",
    },
    {
      id: 3,
      nombre: "Malteada Oreo",
      descripcion: "Cremosa malteada con galletas Oreo.",
      precio: 7500,
      icono: "🥤",
    },
  ];

  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <p className="subtitulo-nebula">NUESTRO CATÁLOGO</p>
        <h1>Explora nuestros sabores</h1>
        <p className="descripcion-nebula">
          Descubre las delicias que tenemos preparadas para ti.
        </p>
      </section>

      <div className="row g-4">
        {productos.map((producto) => (
          <div className="col-md-4" key={producto.id}>
            <article className="card tarjeta-nebula h-100">
              <div className="card-body text-center">
                <div className="display-1 mb-3">
                  {producto.icono}
                </div>

                <h3 className="h5">{producto.nombre}</h3>

                <p>{producto.descripcion}</p>

                <strong>
                  ${producto.precio.toLocaleString("es-CO")}
                </strong>
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Productos;
