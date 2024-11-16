// usuariosController.js

const { Router } = require('express');
const router = Router();
const usuariosModel = require('../usuariosModels/usuariosModel');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs'); // Cambiado de 'bcrypt' a 'bcryptjs'

// Middleware de autenticación básica
async function basicAuth(req, res, next) {
    const credentials = auth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).json({ error: 'Credenciales requeridas' });
    }

    try {
        const user = await usuariosModel.validarUsuario(credentials.name, credentials.pass);

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Agregar el usuario a la solicitud para usarlo posteriormente
        req.user = user;
        next();
    } catch (error) {
        console.error('Error al autenticar:', error);
        res.status(500).json({ error: 'Error al autenticar' });
    }
}

async function basicAuth(req, res, next) {
    const credentials = auth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).json({ error: 'Credenciales requeridas' });
    }

    try {
        const user = await usuariosModel.validarUsuario(credentials.name, credentials.pass);

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Agregar el usuario a la solicitud para usarlo posteriormente
        req.user = user;
        next();
    } catch (error) {
        console.error('Error al autenticar:', error);
        res.status(500).json({ error: 'Error al autenticar' });
    }
}

router.get('/usuarios/login', basicAuth, (req, res) => {
    // Si llegamos aquí, es porque las credenciales son válidas
    res.json({ message: 'Inicio de sesión exitoso', usuario: req.user });
});

// Middleware para verificar si el usuario es administrador o propietario
function verifyOwnerOrAdmin(req, res, next) {
    const userId = parseInt(req.params.id);
    const authenticatedUserId = req.user.Id; // Suponiendo que el campo es 'Id' en la base de datos
    const userRole = req.user.Rol;

    // Permitir acceso si es administrador
    if (userRole === 'Admin') {
        return next();
    }

    // Si es el propietario del recurso, permitir acceso
    if (authenticatedUserId === userId) {
        return next();
    }

    // Si no coincide o no existe, se retorna un error
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
}

// Ruta pública para crear un nuevo usuario
router.post('/usuarios', async (req, res) => {
    const { nombre, email, contraseña, direccion, fotoPerfil, rol } = req.body;
    try {
        const nuevoUsuario = await usuariosModel.crearUsuario(
            nombre,
            email,
            contraseña,
            direccion,
            fotoPerfil,
            rol || 'Cliente'
        );
        res.status(201).json({ message: 'Usuario creado', usuario: nuevoUsuario });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// Aplicar autenticación básica a partir de aquí
router.use(basicAuth);

// Obtener todos los usuarios (solo administradores)
router.get('/usuarios', async (req, res) => {
    if (req.user.Rol !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
    }
    try {
        const result = await usuariosModel.traerUsuarios();
        res.json(result);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Obtener un usuario por ID (propietario o administrador)
router.get('/usuarios/:id', verifyOwnerOrAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await usuariosModel.traerUsuarioPorId(id);
        if (!result) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

// Actualizar un usuario (propietario o administrador)
router.put('/usuarios/:id', verifyOwnerOrAdmin, async (req, res) => {
    const id = req.params.id;
    const { nombre, email, contraseña, direccion, fotoPerfil, rol } = req.body;

    // Si el usuario es cliente, no permitir actualizar el rol
    const actualizacion = req.user.Rol === 'Cliente'
        ? { nombre, email, contraseña, direccion, fotoPerfil }
        : { nombre, email, contraseña, direccion, fotoPerfil, rol };

    try {
        const filasAfectadas = await usuariosModel.actualizarUsuario(id, actualizacion);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
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
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

module.exports = router;
