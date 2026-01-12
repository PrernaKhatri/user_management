function getUrl(req, relativePath) {
    if (!relativePath) return null;
    return `${req.protocol}://${req.get("host")}/${relativePath}`;
  }
  
  module.exports = { getUrl };
  