const jwt = require('jsonwebtoken');
const fs = require('fs');

const configPath = './backend_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const JWT_SECRET = config.JWT_SECRET;

module.exports = function (req, res, next) {
	const authHeader = req.headers['authorization'] || req.headers['Authorization'];
	if (!authHeader) return res.status(401).json({ msg: 'Token no proporcionado' });

	const parts = authHeader.split(' ');
	if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ msg: 'Formato de token invalido' });

	const token = parts[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.userId = payload.id;
		req.userRole = payload.rol;
		next();
	} catch (err) {
		return res.status(401).json({ msg: 'Token inválido o caducado' }); 
	}
};
