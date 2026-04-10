const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided.' });

  try {
    const bearerToken = token.split(' ')[1] || token;
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
