const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'surtiquesosOrdenesDB',
    port: '3306'
});

async function crearOrden(orden) {
    const nombreCliente = orden.nombreCliente;
    const emailCliente = orden.emailCliente;
    const totalCuenta = orden.totalCuenta;
   
    const result = await connection.query('INSERT INTO ordenes VALUES (null, ?, ?, ?, Now())', [nombreCliente, emailCliente, totalCuenta]);
    return result;
}

async function traerOrdenes() {
    const result = await connection.query('SELECT * FROM ordenes');
    return result[0];
}

async function traerOrden(id) {
    const result = await connection.query('SELECT * FROM ordenes WHERE Id = ?', id);
    return result[0];
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

async function verificarOrdenPorUsuario(orderId, userId) {
    const [result] = await connection.query(
        'SELECT * FROM ordenes WHERE Id = ? AND UserId = ?',
        [orderId, userId]
    );
    return result[0];
}

async function actualizarEstadoOrden(id, Estado) {
    const [result] = await connection.query(
        'UPDATE ordenes SET Estado = ? WHERE id = ?',
        [Estado, id]
    );
    return result.affectedRows;
}

async function actualizarOrden(id, orden) {
    const [result] = await connection.query(
        'UPDATE ordenes SET nombreCliente = ?, emailCliente = ?, totalCuenta = ? WHERE id = ?',
        [orden.nombreCliente, orden.emailCliente, orden.totalCuenta, id]
    );
    return result.affectedRows;
}

async function borrarOrden(id) {
    const [result] = await connection.query('DELETE FROM ordenes WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = {
    crearOrden,
    traerOrden,
    traerOrdenes,
    traerOrdenesPorUsuario,
    verificarOrdenPorUsuario,
    actualizarEstadoOrden,
    actualizarOrden,
    borrarOrden
};
