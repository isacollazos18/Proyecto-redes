// usuariosModel.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); 

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

// Función para traer un usuario por ID
async function traerUsuarioPorId(id) {
    const [result] = await connection.query('SELECT * FROM usuarios WHERE Id = ?', [id]);
    return result[0]; // Devolver solo el primer resultado encontrado
}

// Función para validar un usuario por email y contraseña
async function validarUsuario(email, password) {
    const [result] = await connection.query(
        'SELECT * FROM usuarios WHERE Email = ?',
        [email]
    );

    if (result.length === 0) {
        return null;
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.Contraseña);

    if (match) {
        return user;
    } else {
        return null;
    }
}

// Función para crear un usuario nuevo con contraseña hasheada
async function crearUsuario(nombre, email, password, direccion, fotoPerfil, rol = 'Cliente') {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await connection.query(
        'INSERT INTO usuarios (Nombre, Email, Contraseña, Rol, Direccion, FotoPerfil) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol, direccion, fotoPerfil]
    );
    return { id: result.insertId, nombre, email, rol, direccion, fotoPerfil };
}

// Función para actualizar un usuario
async function actualizarUsuario(id, actualizacion) {
    // Preparar los campos y valores para la consulta
    const fields = [];
    const values = [];

    if (actualizacion.nombre) {
        fields.push('Nombre = ?');
        values.push(actualizacion.nombre);
    }
    if (actualizacion.email) {
        fields.push('Email = ?');
        values.push(actualizacion.email);
    }
    if (actualizacion.contraseña) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(actualizacion.contraseña, saltRounds);
        fields.push('Contraseña = ?');
        values.push(hashedPassword);
    }
    if (actualizacion.direccion) {
        fields.push('Direccion = ?');
        values.push(actualizacion.direccion);
    }
    if (actualizacion.fotoPerfil) {
        fields.push('FotoPerfil = ?');
        values.push(actualizacion.fotoPerfil);
    }
    if (actualizacion.rol) {
        fields.push('Rol = ?');
        values.push(actualizacion.rol);
    }

    if (fields.length === 0) {
        return 0; // No hay campos para actualizar
    }

    const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE Id = ?`;
    values.push(id);

    const [result] = await connection.query(sql, values);
    return result.affectedRows;
}

// Función para borrar un usuario
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
