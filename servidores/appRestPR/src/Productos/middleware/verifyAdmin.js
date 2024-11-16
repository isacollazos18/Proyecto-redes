function verifyAdmin(req, res, next) {
    const userRole = req.user.Rol;

    if (userRole !== 'Admin') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
}