const express = require('express');
const usuariosController = require('./Controllers/usuariosController');
const morgan = require('morgan'); 
const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());

app.use(usuariosController);

app.listen(PORT, () => {
  console.log(`Microservicio de Usuarios escuchando en el puerto ${PORT}`);
});
