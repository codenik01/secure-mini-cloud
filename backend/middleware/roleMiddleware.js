const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized user.' });
    }
    
    // Admin has access to everything
    if (req.user.role === 'Admin') {
      return next();
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions.' });
    }
    next();
  };
};

module.exports = roleMiddleware;
