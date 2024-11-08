const { Router } = require('express');
const Joi = require('joi');  // Importar Joi para validación
const router = Router();
const usuariosModel = require('../Models/usuariosModel');

const ADMIN_API_KEY = 'my-secret-admin-key';  

// Middleware para verificar si el usuario es administrador o propietario
async function verifyOwnerOrAdmin(req, res, next) {
    const apiKey = req.headers['x-api-key']; 
    const userId = parseInt(req.params.id);   
    console.log(userId);
    const authenticatedUserId = parseInt(req.headers['x-user-id']);  
    console.log(authenticatedUserId);

    // Permitir acceso si es administrador
    if (apiKey === ADMIN_API_KEY) {
        console.log("Access granted: Admin key detected");
        return next();
    }

    // Si authenticatedUserId es válido y coincide con userId, permitir acceso
    if (authenticatedUserId && authenticatedUserId === userId) {
        console.log("Access granted: User is owner");
        return next();
    }

    // Si no coincide o no existe, se retorna un error
    console.log("Access denied: User is not owner or admin");
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
}

// Obtener todos los usuarios 
router.get('/usuarios', verifyOwnerOrAdmin, async (req, res) => {
    try {
        const result = await usuariosModel.traerUsuarios();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

router.get('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await usuariosModel.traerUsuarioPorId(id);
        if (!result) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

// Validar usuario por email y contraseña
router.get('/usuarios/:email/:password', async (req, res) => {
    const email = req.params.email;
    const password = req.params.password;
    try {
        const result = await usuariosModel.validarUsuario(email, password);
        if (!result) {
            return res.status(404).json({ error: 'Credenciales incorrectas' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al validar el usuario' });
    }
});

// Crear un nuevo usuario (disponible para todos los usuarios)
router.post('/usuarios', async (req, res) => {
    const { nombre, email, contraseña, direccion, fotoPerfil, rol } = req.body;
    try {
        const nuevoUsuario = await usuariosModel.crearUsuario(nombre, email, contraseña, direccion, fotoPerfil, rol || 'Cliente');
        res.status(201).json({ message: 'Usuario creado', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// Actualizar un usuario (propietario o administrador)
router.put('/usuarios/:id', verifyOwnerOrAdmin, async (req, res) => {
    const id = req.params.id;
    const { nombre, email, contraseña, direccion, fotoPerfil, rol } = req.body;

    // Si el rol es cliente, no permitir actualizar la columna `rol`
    const actualizacion = req.user && req.user.rol === 'Cliente'
        ? { nombre, email, contraseña, direccion, fotoPerfil }  // Excluir rol si es cliente
        : { nombre, email, contraseña, direccion, fotoPerfil, rol };  // Incluir rol si es administrador

    try {
        const filasAfectadas = await usuariosModel.actualizarUsuario(id, actualizacion);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

// Eliminar un usuario (propietario o administrador)
router.delete('/usuarios/:id', verifyOwnerOrAdmin, async (req, res) => {
    const id = req.params.id;

    try {
        const filasAfectadas = await usuariosModel.borrarUsuario(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

module.exports = router;
