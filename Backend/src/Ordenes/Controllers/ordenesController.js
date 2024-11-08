const express = require('express');
const router = express.Router();
const Joi = require('joi');  // Importar Joi para validación
const axios = require('axios');
const ordenesModel = require('../Models/ordenesModel');

const ADMIN_API_KEY = 'my-secret-admin-key';

// Middleware para verificar si el usuario es administrador o propietario de la orden
async function verifyOwnerOrAdminForOrder(req, res, next) {
    const apiKey = req.headers['x-api-key']; 
    const authenticatedUserId = parseInt(req.headers['x-user-id']); 
    const orderId = parseInt(req.params.id); 

    // Permitir acceso si es administrador
    if (apiKey === ADMIN_API_KEY) {
        return next();
    }

    try {
        // Hacer una solicitud al servicio de usuarios para obtener el correo electrónico del usuario autenticado
        const response = await axios.get(`http://localhost:3001/usuarios/${authenticatedUserId}`);
        console.log(response);
        const authenticatedUserEmail = response.data.email; 

        // Consultar en la base de datos para obtener los detalles de la orden
        const order = await ordenesModel.traerOrden(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Verificar si el email del usuario autenticado coincide con el emailCliente de la orden
        if (order.emailCliente === authenticatedUserEmail) {
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
    usuario: Joi.string().required(),
    items: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            cantidad: Joi.number().integer().positive().required()
        })
    ).min(1).required()
});

// Esquema de validación para actualizar una orden
const actualizarOrdenSchema = Joi.object({
    NombreCliente: Joi.string().max(40).required(),
    EmailCliente: Joi.string().email().max(30).required(),
    TotalCuenta: Joi.number().positive().required()
});

// Esquema de validación para cambiar el estado de una orden
const cambiarEstadoSchema = Joi.object({
    Estado: Joi.string().valid('Pendiente', 'Procesada', 'Cancelada', 'Completada').required()
});

// Obtener todas las órdenes
router.get('/ordenes', verifyOwnerOrAdminForOrder, async (req, res) => {
    try {
        const result = await ordenesModel.traerOrdenes();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
});

// Obtener una orden por ID (solo propietario o administrador)
router.get('/ordenes/:id', verifyOwnerOrAdminForOrder, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await ordenesModel.traerOrden(id);
        if (!result) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la orden' });
    }
});

router.get('/ordenes/usuario/:emailCliente', async (req, res) => {
    const emailCliente = req.params.emailCliente;
    try {
        const result = await ordenesModel.traerOrdenesPorUsuario(emailCliente);
        if (result.length === 0) {
            return res.status(404).json({ error: 'No se encontraron órdenes para este usuario' });
        }
        res.json(result);
    } catch (error) {
        console.error("Error en el controlador al obtener las órdenes del usuario:", error.message);
        res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
    }
});

// Crear una nueva orden con validación
router.post('/ordenes', async (req, res) => {
    const { error } = crearOrdenSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const usuario = req.body.usuario;
    const items = req.body.items;

    const totalCuenta = await calcularTotal(items);
    if (totalCuenta <= 0) {
        return res.json({ error: 'Total de la orden no válido' });
    }

    const disponibilidad = await verificarDisponibilidad(items);
    if (!disponibilidad) {
        return res.json({ error: 'No hay disponibilidad de productos' });
    }

    const response = await axios.get(`http://localhost:3001/usuarios/${usuario}`);
    const nombreCliente = response.data.nombre;
    const emailCliente = response.data.email;
    const orden = { nombreCliente, emailCliente, totalCuenta };

    try {
        await ordenesModel.crearOrden(orden);
        await actualizarInventario(items);
        res.json({ message: 'Orden creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la orden' });
    }
});

// Editar una orden con validación (solo propietario o administrador)
router.put('/ordenes/:id', verifyOwnerOrAdminForOrder, async (req, res) => {
    const { error } = actualizarOrdenSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const id = req.params.id;
    const { nombreCliente, emailCliente, totalCuenta } = req.body;

    try {
        const filasAfectadas = await ordenesModel.actualizarOrden(id, { nombreCliente, emailCliente, totalCuenta });
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json({ message: 'Orden actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la orden' });
    }
});

// Cambiar el estado de una orden (solo administrador) con validación
router.put('/ordenes/:id/estado', verifyOwnerOrAdminForOrder, async (req, res) => {
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
        res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
    }
});

// Eliminar una orden (solo propietario o administrador)
router.delete('/ordenes/:id', verifyOwnerOrAdminForOrder, async (req, res) => {
    const id = req.params.id;

    try {
        const filasAfectadas = await ordenesModel.borrarOrden(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json({ message: 'Orden eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la orden' });
    }
});

// Función para calcular el total de la orden
async function calcularTotal(items) {
    let ordenTotal = 0;
    for (const producto of items) {
        const response = await axios.get(`http://localhost:3002/productos/${producto.id}`);
        ordenTotal += response.data.precio * producto.cantidad;
    }
    return ordenTotal;
}

// Función para verificar si hay suficientes unidades de los productos para realizar la orden
async function verificarDisponibilidad(items) {
    let disponibilidad = true;
    for (const producto of items) {
        const response = await axios.get(`http://localhost:3002/productos/${producto.id}`);
        if (response.data.inventario < producto.cantidad) {
            disponibilidad = false;
            break;
        }
    }
    return disponibilidad;
}

// Función para disminuir la cantidad de unidades de los productos
async function actualizarInventario(items) {
    for (const producto of items) {
        const response = await axios.get(`http://localhost:3002/productos/${producto.id}`);
        const inventarioActual = response.data.inventario;
        const inv = inventarioActual - producto.cantidad;
        await axios.put(`http://localhost:3002/productos/${producto.id}`, {
            inventario: inv
        });
    }
}

module.exports = router;