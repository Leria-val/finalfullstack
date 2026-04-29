const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env,JWT_EXPIRES_IN

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET nao definido no .env');
}

const generatorToken = ({ id, name, role }) => {
    return jwt.sign({ id, name, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

const generatorRandomToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

module.export = { generatorToken, verifyToken, generatorRandomToken};