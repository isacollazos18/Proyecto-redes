// ordenesController.js

const express = require('express');
const router = express.Router();
const Joi = require('joi');  // Importar Joi para validación
const axios = require('axios');
const ordenesModel = require('../Models/ordenesModel');
const auth = require('basic-auth');

// Middleware de autenticación básica
async function basicAuth(req, res, next) {
    const credentials = auth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
        res.set('WWW-Authenticate', 'Basic realm="Ordenes"');
        return res.status(401).json({ error: 'Credenciales requeridas' });
    }

    try {
        // Hacer una solicitud al endpoint /login del microservicio de usuarios
        const response = await axios.get('http://192.168.100.2:3001/usuarios/login', {
            auth: {
                username: credentials.name,
                password: credentials.pass,
            },
        });

        req.user = response.data.usuario;
        next();
    } catch (error) {
        console.error('Error al autenticar:', error.response ? error.response.data : error.message);
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
}

// Middleware para verificar si el usuario es administrador
function verifyAdmin(req, res, next) {
    const userRole = req.user.Rol;

    if (userRole !== 'Admin') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
}

// Middleware para verificar si el usuario es el propietario de la orden o administrador
async function verifyOwnerOrAdminForOrder(req, res, next) {
    const orderId = parseInt(req.params.id);
    const userRole = req.user.Rol;

    // Permitir acceso si es administrador
    if (userRole === 'Admin') {
        return next();
    }

    try {
        // Consultar en la base de datos para obtener los detalles de la orden
        const order = await ordenesModel.traerOrden(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Verificar si el email del usuario autenticado coincide con el EmailCliente de la orden
        if (order.EmailCliente === req.user.Email) {
            return next();
        }

        // Si no coincide o no tiene permisos, se retorna un error
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    } catch (error) {
        console.error("Error al verificar permisos de acceso:", error);
        return res.status(500).json({ error: 'Error al verificar permisos de acceso' });
    }
}

// Esquema de validación para crear una orden
const crearOrdenSchema = Joi.object({
    direccionCliente: Joi.string().max(40).required(),
    items: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            cantidad: Joi.number().integer().positive().required()
        })
    ).min(1).required()
});

// Esquema de validación para cambiar el estado de una orden
const cambiarEstadoSchema = Joi.object({
    Estado: Joi.string().valid('Pendiente', 'Procesada', 'Cancelada', 'Completada').required()
});

// Aplicar autenticación básica a partir de aquí
router.use(basicAuth);

// Obtener todas las órdenes (solo administrador)
router.get('/ordenes', verifyAdmin, async (req, res) => {
    try {
        const result = await ordenesModel.traerOrdenes();
        res.json(result);
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
});

// Obtener una orden por ID (propietario o administrador)
router.get('/ordenes/:id', verifyOwnerOrAdminForOrder, async (req, res) => {
    const id = req.params.id;
    try {
        const order = await ordenesModel.traerOrden(id);
        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error al obtener la orden:', error);
        res.status(500).json({ error: 'Error al obtener la orden' });
    }
});

// Obtener las órdenes del usuario autenticado
router.get('/mis-ordenes', async (req, res) => {
    const emailCliente = req.user.Email;
    try {
        const result = await ordenesModel.traerOrdenesPorUsuario(emailCliente);
        if (result.length === 0) {
            return res.status(404).json({ error: 'No se encontraron órdenes para este usuario' });
        }
        res.json(result);
    } catch (error) {
        console.error("Error al obtener las órdenes del usuario:", error.message);
        res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
    }
});

// Crear una nueva orden con validación
router.post('/ordenes', async (req, res) => {
    const { error } = crearOrdenSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const items = req.body.items;
    const direccionCliente = req.body.direccionCliente;

    try {
        const precioTotal = await calcularTotal(items);
        if (precioTotal <= 0) {
            return res.status(400).json({ error: 'Total de la orden no válido' });
        }

        const disponibilidad = await verificarDisponibilidad(items);
        if (!disponibilidad) {
            return res.status(400).json({ error: 'No hay disponibilidad de productos' });
        }

        const nombreCliente = req.user.Nombre;
        const emailCliente = req.user.Email;
        const orden = { nombreCliente, emailCliente, direccionCliente, precioTotal };

        await ordenesModel.crearOrden(orden);
        await actualizarInventario(items);
        res.status(201).json({ message: 'Orden creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).json({ error: 'Error al crear la orden' });
    }
});

// Cambiar el estado de una orden (solo administrador) con validación
router.put('/ordenes/:id/estado', verifyAdmin, async (req, res) => {
    const { error } = cambiarEstadoSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const id = req.params.id;
    const { Estado } = req.body;

    try {
        const filasAfectadas = await ordenesModel.actualizarEstadoOrden(id, Estado);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json({ message: 'Estado de la orden actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
    }
});

// Eliminar una orden (propietario o administrador)
router.delete('/ordenes/:id', verifyOwnerOrAdminForOrder, async (req, res) => {
    const id = req.params.id;

    try {
        const filasAfectadas = await ordenesModel.borrarOrden(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json({ message: 'Orden eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la orden:', error);
        res.status(500).json({ error: 'Error al eliminar la orden' });
    }
});

// Función para calcular el total de la orden
async function calcularTotal(items) {
    let ordenTotal = 0;
    for (const producto of items) {
        const response = await axios.get(`http://192.168.100.2:3002/productos/${producto.id}`);
        ordenTotal += response.data.precio * producto.cantidad;
    }
    return ordenTotal;
}

// Función para verificar si hay suficientes unidades de los productos para realizar la orden
async function verificarDisponibilidad(items) {
    for (const producto of items) {
        const response = await axios.get(`http://192.168.100.2:3002/productos/${producto.id}`);
        if (response.data.inventario < producto.cantidad) {
            return false;
        }
    }
    return true;
}

// Función para disminuir la cantidad de unidades de los productos
async function actualizarInventario(items) {
    for (const producto of items) {
        const response = await axios.get(`http://192.168.100.2:3002/productos/${producto.id}`);
        const inventarioActual = response.data.inventario;
        const nuevoInventario = inventarioActual - producto.cantidad;

        // Actualizar el producto en el microservicio de productos
        await axios.put(`http://192.168.100.2:3002/productos/${producto.id}`, {
            nombre: response.data.nombre,
            precio: response.data.precio,
            inventario: nuevoInventario,
            imagen: response.data.imagen
        }, {
            auth: {
                username: 'juanes@example.com', // Credenciales de administrador
                password: 'juan123'
            }
        });
    }
}

module.exports = router;
