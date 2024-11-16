// productosController.js

const { Router } = require('express');
const Joi = require('joi');  // Librería para validación
const router = Router();
const productosModel = require('../Models/productosModel');
//const verifyAdmin = require('../middleware/verifyAdmin');
const basicAuth = require('../middleware/authmiddleware'); // Importamos basicAuth

// Esquema de validación de productos usando Joi
const productSchema = Joi.object({
    nombre: Joi.string().max(50).required(),
    precio: Joi.number().positive().required(),
    inventario: Joi.number().integer().min(0).required(),
    imagen: Joi.string().optional()
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
    const userRole = req.user.Rol;

    if (userRole !== 'Admin') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
}

// Obtener todos los productos (público)
router.get('/productos', async (req, res) => {
    try {
        const result = await productosModel.traerProductos();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Obtener un producto por ID (público)
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

// Aplicar autenticación básica a partir de aquí
router.use(basicAuth);

// Rutas protegidas (solo administrador)

// Actualizar un producto (solo administrador)
router.put('/productos/:id', verifyAdmin, validateProduct, async (req, res) => {
    const id = req.params.id;
    const { nombre, precio, inventario, imagen } = req.body;

    try {
        await productosModel.actualizarProducto(id, nombre, precio, inventario, imagen);
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Crear un nuevo producto (solo administrador)
router.post('/productos', verifyAdmin, validateProduct, async (req, res) => {
    const { nombre, precio, inventario, imagen } = req.body;

    try {
        const nuevoProducto = await productosModel.crearProducto(nombre, precio, inventario, imagen);
        res.status(201).json({ message: 'Producto creado', producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// Eliminar un producto por ID (solo administrador)
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
