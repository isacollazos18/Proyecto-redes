const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'surtiquesosProductosDB',
    port: '3306'
});

// Traer todos los productos
async function traerProductos() {
    try {
        const [result] = await connection.query('SELECT * FROM productos');
        return result;
    } catch (error) {
        console.error("Error al traer productos:", error);
        throw new Error("Error al obtener los productos de la base de datos");
    }
}

// Traer un producto específico por ID
async function traerProducto(id) {
    try {
        const [result] = await connection.query('SELECT * FROM productos WHERE id = ?', [id]);
        return result;
    } catch (error) {
        console.error(`Error al traer producto con ID ${id}:`, error);
        throw new Error("Error al obtener el producto de la base de datos");
    }
}

// Actualizar un producto
async function actualizarProducto(id, nombre, precio, inventario, imagen) {
    try {
        const [result] = await connection.query(
            'UPDATE productos SET nombre = ?, precio = ?, inventario = ?, imagen = ? WHERE id = ?',
            [nombre, precio, inventario, imagen, id]
        );
        if (result.affectedRows === 0) {
            throw new Error("Producto no encontrado para actualizar");
        }
        return { message: "Producto actualizado exitosamente" };
    } catch (error) {
        console.error(`Error al actualizar producto con ID ${id}:`, error);
        throw new Error("Error al actualizar el producto en la base de datos");
    }
}

// Crear un nuevo producto
async function crearProducto(nombre, precio, inventario, imagen) {
    try {
        const [result] = await connection.query(
            'INSERT INTO productos (nombre, precio, inventario, imagen) VALUES (?, ?, ?, ?)',
            [nombre, precio, inventario, imagen]
        );
        return { id: result.insertId, nombre, precio, inventario, imagen };
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw new Error("Error al crear el producto en la base de datos");
    }
}

// Borrar un producto
async function borrarProducto(id) {
    try {
        const [result] = await connection.query('DELETE FROM productos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            throw new Error("Producto no encontrado para eliminar");
        }
        return { message: "Producto eliminado exitosamente" };
    } catch (error) {
        console.error(`Error al borrar producto con ID ${id}:`, error);
        throw new Error("Error al eliminar el producto de la base de datos");
    }
}

module.exports = {
    traerProductos,
    traerProducto,
    actualizarProducto,
    crearProducto,
    borrarProducto
};
