// authMiddleware.js

const auth = require('basic-auth');
const axios = require('axios');

async function basicAuth(req, res, next) {
    const credentials = auth(req);

    if (!credentials || !credentials.name || !credentials.pass) {
        res.set('WWW-Authenticate', 'Basic realm="Productos"');
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

module.exports = basicAuth;
