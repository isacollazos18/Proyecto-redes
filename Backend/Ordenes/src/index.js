const express = require('express');
const ordenesController = require('./ordenController/ordenesController');
const morgan = require('morgan'); 
const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use(ordenesController);

app.listen(3001, () => {
  console.log('Microservicio de ordenes escuchando en el puerto 3001');
});
