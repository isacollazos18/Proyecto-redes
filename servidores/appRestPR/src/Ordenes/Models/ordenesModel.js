// ordenesModel.js

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'surtiquesosOrdenesDB',
    port: '3306'
});

async function crearOrden(orden) {
    const { nombreCliente, emailCliente, direccionCliente, precioTotal } = orden;

    const [result] = await connection.query(
        'INSERT INTO ordenes (NombreCliente, EmailCliente, DireccionCliente, PrecioTotal, Estado) VALUES (?, ?, ?, ?, ?)',
        [nombreCliente, emailCliente, direccionCliente, precioTotal, 'Pendiente']
    );
    return { id: result.insertId, ...orden };
}

async function traerOrdenes() {
    const [result] = await connection.query('SELECT * FROM ordenes');
    return result;
}

async function traerOrden(id) {
    const [result] = await connection.query('SELECT * FROM ordenes WHERE Id = ?', [id]);
    return result[0]; // Devolver solo el primer resultado
}

async function traerOrdenesPorUsuario(emailCliente) {
    try {
        const [result] = await connection.query(
            'SELECT * FROM ordenes WHERE EmailCliente = ?',
            [emailCliente]
        );
        return result;
    } catch (error) {
        console.error(`Error al traer órdenes para el usuario con email ${emailCliente}:`, error.message);
        throw new Error("Error al obtener las órdenes del usuario en la base de datos");
    }
}

async function actualizarEstadoOrden(id, Estado) {
    const [result] = await connection.query(
        'UPDATE ordenes SET Estado = ? WHERE Id = ?',
        [Estado, id]
    );
    return result.affectedRows;
}

async function actualizarOrden(id, orden) {
    const { precioTotal } = orden;
    const [result] = await connection.query(
        'UPDATE ordenes SET PrecioTotal = ? WHERE Id = ?',
        [precioTotal, id]
    );
    return result.affectedRows;
}

async function borrarOrden(id) {
    const [result] = await connection.query('DELETE FROM ordenes WHERE Id = ?', [id]);
    return result.affectedRows;
}

module.exports = {
    crearOrden,
    traerOrden,
    traerOrdenes,
    traerOrdenesPorUsuario,
    actualizarEstadoOrden,
    actualizarOrden,
    borrarOrden
};
