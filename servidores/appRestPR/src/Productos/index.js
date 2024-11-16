const express = require('express');
const productosController = require('./Controllers/productosController');
const morgan = require('morgan'); 
const app = express();
const PORT = 3002;

app.use(morgan('dev'));
app.use(express.json());

app.use(productosController);

app.listen(PORT, () => {
  console.log(`Microservicio de Productos escuchando en el puerto ${PORT}`);
});