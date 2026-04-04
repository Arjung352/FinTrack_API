const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log(req.user);
      return res.status(403).json({
        message: "Forbidden: You do not have access to this resource",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
