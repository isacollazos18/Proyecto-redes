const { Router } = require('express');
const Joi = require('joi');  // Librería para validación
const router = Router();
const productosModel = require('../Models/productosModel');

const ADMIN_API_KEY = 'my-secret-admin-key';

// Esquema de validación de productos usando Joi
const productSchema = Joi.object({
    nombre: Joi.string().max(50).required(),
    precio: Joi.number().positive().required(),
    inventario: Joi.number().integer().min(0).required()
});

// Middleware para validar datos de entrada
function validateProduct(req, res, next) {
    const { error } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

// Middleware para verificar si el usuario es administrador
function verifyAdmin(req, res, next) {
    const apiKey = req.headers['x-api-key'];  // Leer la clave API desde el header
    if (apiKey !== ADMIN_API_KEY) {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    next();
}

// Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const result = await productosModel.traerProductos();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await productosModel.traerProducto(id);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Actualizar un producto (nombre, precio, inventario) - solo administrador
router.put('/productos/:id', verifyAdmin, validateProduct, async (req, res) => {
    const id = req.params.id;
    const { nombre, precio, inventario } = req.body;

    try {
        await productosModel.actualizarProducto(id, nombre, precio, inventario);
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Crear un nuevo producto - solo administrador
router.post('/productos', verifyAdmin, validateProduct, async (req, res) => {
    const { nombre, precio, inventario } = req.body;

    try {
        const nuevoProducto = await productosModel.crearProducto(nombre, precio, inventario);
        res.status(201).json({ message: 'Producto creado', producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// Eliminar un producto por ID - solo administrador
router.delete('/productos/:id', verifyAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        await productosModel.borrarProducto(id);
        res.json({ message: 'Producto borrado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al borrar el producto' });
    }
});

module.exports = router;
