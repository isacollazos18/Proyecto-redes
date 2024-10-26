import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UserPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const logo = "path/to/logo.png"; // Cambia esta ruta al logo real

    useEffect(() => {
        // Simulación de carga de productos de queso
        const mockProducts = [
            { id: 1, name: 'Queso Mozzarella', img: 'path/to/mozzarella.png', price: '$12.00', weight: '250g', description: 'Queso fresco y suave' },
            { id: 2, name: 'Queso Parmesano', img: 'path/to/parmesano.png', price: '$15.00', weight: '200g', description: 'Queso madurado y fuerte' },
            { id: 3, name: 'Queso Cheddar', img: 'path/to/cheddar.png', price: '$10.00', weight: '300g', description: 'Queso amarillo y delicioso' },
        ];
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
    }, []);

    const handleSearch = (query) => {
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    return (
        <div className="userPage">
            <header>
                <nav className="navbar">
                    <Link to='/'>
                        <img src={logo} alt="Logo Surtiquesos" className="logo" />
                    </Link>
                    <SearchProduct onSearch={handleSearch} className="search-bar" />
                    <a href="#productos">Productos</a>
                    <a href="#contact">Contactanos</a>
                    <button className='login'>Ingresar</button>
                    <button className='carrito'><img src="" alt="" /></button>
                </nav>
            </header>
            <div className="card-group">
                {filteredProducts.map((product) => (
                    <div className="card" key={product.id}>
                        <h2>{product.name}</h2>
                        <img 
                            src={product.img} 
                            alt={product.name} 
                            onError={(e) => { 
                                console.error("Image not loaded", e); 
                                e.target.style.display = 'none'; 
                            }} 
                        />
                        <p><b>Precio:</b> {product.price}</p>
                        <p><b>Peso:</b> {product.weight}</p>
                        <p><b>Descripción:</b> {product.description}</p>
                    </div>
                ))}  
            </div>
        </div>
    );
}

function SearchProduct({ onSearch, className }) {
    const [query, setQuery] = useState('');

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onSearch(newQuery);
    };

    return (
        <input
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={handleInputChange}
            className={className}
        />
    );
}

export default UserPage;
