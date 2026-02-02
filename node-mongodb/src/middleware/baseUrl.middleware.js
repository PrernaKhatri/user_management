module.exports = (req, res, next) => {
    req.baseUrlFull = `${req.protocol}://${req.get("host")}`;
    next();
  };