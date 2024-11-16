// index.js

const express = require('express');
const ordenesController = require('./Controllers/ordenesController');
const morgan = require('morgan'); 
const app = express();
const PORT = 3003;

app.use(morgan('dev'));
app.use(express.json());

app.use(ordenesController);

app.listen(PORT, () => {
  console.log(`Microservicio de Órdenes escuchando en el puerto ${PORT}`);
});
