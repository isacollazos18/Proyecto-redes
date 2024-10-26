import React from 'react';

function Home() {
  return (
    <div className="home-container">
      <header>
        <h1>Surtiquesos</h1>
        <input type="text" placeholder="Buscar productos..." />
      </header>
      <section className="categories">
        <h2>Categorías</h2>
        {/* Agrega botones o enlaces de categorías aquí */}
      </section>
      <section className="product-list">
        {/* Aquí renderiza el componente ProductCard */}
      </section>
    </div>
  );
}

export default Home;

