const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    user: 'root',
    password: 'root',
    database: 'surtiquesosUsuariosDB',
    port: '3306'
});

// Función para traer todos los usuarios
async function traerUsuarios() {
    const [result] = await connection.query('SELECT * FROM usuarios');
    return result;
}

async function traerUsuarioPorId(id) {
    const [result] = await connection.query('SELECT * FROM usuarios WHERE Id = ?', [id]);
    return result[0]; // Devolver solo el primer resultado encontrado
}

// Función para validar un usuario por email y contraseña
async function validarUsuario(email, password) {
    const [result] = await connection.query(
        'SELECT * FROM usuarios WHERE Email = ? AND Contraseña = ?',
        [email, password]
    );
    return result[0]; // Devolver solo el primer resultado encontrado si coincide
}

// Función para crear un usuario nuevo
async function crearUsuario(nombre, email, password, direccion, fotoPerfil) {
    const [result] = await connection.query(
        'INSERT INTO usuarios (Nombre, Email, Contraseña, Rol, Direccion, FotoPerfil) VALUES (?, ?, ?, "Cliente", ?, ?)',
        [nombre, email, password, direccion, fotoPerfil]
    );
    return { id: result.insertId, nombre, email, rol: "Cliente", direccion, fotoPerfil };
}

// Función para actualizar un usuario 
async function actualizarUsuario(id, actualizacion) {
    const fields = Object.keys(actualizacion).map(field => `${field} = ?`).join(", ");
    const values = Object.values(actualizacion);
    const [result] = await connection.query(
        `UPDATE usuarios SET ${fields} WHERE Id = ?`,
        [...values, id]
    );
    return result.affectedRows;
}

// Borrar un usuario
async function borrarUsuario(id) {
    const [result] = await connection.query('DELETE FROM usuarios WHERE Id = ?', [id]);
    return result.affectedRows;
}

module.exports = {
    traerUsuarios,
    traerUsuarioPorId,
    validarUsuario,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario,
};
