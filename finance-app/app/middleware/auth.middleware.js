const jwt = require("jsonwebtoken");

// Middleware для проверки JWT токена
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "Токен не предоставлен"
    });
  }

  // Удаляем "Bearer " если он есть
  const tokenValue = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(tokenValue, process.env.JWT_SECRET || "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Неверный токен"
      });
    }

    req.userId = decoded.id;
    req.username = decoded.username;
    req.isAdmin = decoded.isAdmin;
    next();
  });
};

// Middleware для опциональной проверки JWT токена
const optionalVerifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return next();
  }

  const tokenValue = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(tokenValue, process.env.JWT_SECRET || "your-secret-key", (err, decoded) => {
    if (!err) {
      req.userId = decoded.id;
      req.username = decoded.username;
    }
    next();
  });
};

module.exports = {
  verifyToken,
  optionalVerifyToken
};
