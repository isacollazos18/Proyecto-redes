const express = require('express');
const productosController = require('./controllers/productos');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(productosController);
app.listen(3001, () => {

 console.log('backProductos ejecutandose en el puerto 3001');
});