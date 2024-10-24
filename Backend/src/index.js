const express = require('express'); //se indica que se requiere express
const app = express(); // se inicia express y se instancia en una constante de nombre app.
const morgan = require('morgan'); //se indica que se requiere morgan
const mysql = require('mysql2/promise');
// settings
app.set('port', 3000); //se define el puerto en el cual va a funcionar el servidor
// Utilities
app.use(morgan('dev')); //se indica que se va a usar morgan en modo dev
app.use(express.json()); //se indica que se va a usar la funcionalidad para manejo de json de express
// Conexión a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'surtiquesosDB'
});

// Rutas para productos
app.get('/productos', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM productos');
    conn.release();
    res.json(rows);
});
app.get('/productos/:id', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    conn.release();
    if (rows.length === 0) return res.status(404).send('Producto no nencontrado');
        res.json(rows[0]);
});
app.post('/productos', async (req, res) => {
    const conn = await pool.getConnection();
    const [result] = await conn.query('INSERT INTO productos VALUES (null, ?, ?,?)', [req.body.nombre, req.body.precio,  req.body.inventario]);
    conn.release();
    res.send('Producto creado');
});
app.put('/productos/:id', async (req, res) => {
    const conn = await pool.getConnection();
    const [result] = await conn.query('UPDATE productos SET nombre=?, precio=?, inventario=? WHERE id=?', [ req.body.nombre, req.body.precio, req.body.inventario, req.params.id]);
    conn.release();
    res.send('Producto actualizado');
});
app.delete('/productos/:id', async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    conn.release();
    res.send("Producto borrado");
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log("Servidor funcionando");
}); //se inicia el servidor en el puerto definido y se pone un mensaje en la consola
