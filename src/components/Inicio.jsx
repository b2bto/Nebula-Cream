
function Inicio() {
  return (
    <main className="container py-5">

      {/* Presentación principal */}
      <section className="inicio-nebula text-center">

        <p className="subtitulo-nebula">
          ✨ EL UNIVERSO DEL SABOR ✨
        </p>

        <h1>
          Bienvenido a <span className="texto-neon">Nebula Cream</span>
        </h1>

        <p className="descripcion-nebula">
          Descubre un universo de sabores donde cada helado
          es una experiencia diferente.
        </p>

        <a href="/productos" className="btn btn-nebula mt-3">
          Explorar nuestros sabores
        </a>

      </section>

      {/* Productos destacados */}
      <section className="mt-5">

        <h2 className="text-center mb-4">
          Nuestros favoritos
        </h2>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card tarjeta-nebula h-100">
              <div className="card-body text-center">
                <div className="fs-1">🍨</div>
                <h5>Copa Vainilla Deluxe</h5>
                <p>Helado de vainilla con crema y chocolate.</p>
                <strong>$5.000</strong>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card tarjeta-nebula h-100">
              <div className="card-body text-center">
                <div className="fs-1">🍓</div>
                <h5>Copa ChocoFresa</h5>
                <p>Una combinación deliciosa de chocolate y fresa.</p>
                <strong>$6.000</strong>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card tarjeta-nebula h-100">
              <div className="card-body text-center">
                <div className="fs-1">🥤</div>
                <h5>Malteada Oreo</h5>
                <p>Cremosa malteada con galletas Oreo.</p>
                <strong>$7.500</strong>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Inicio;
