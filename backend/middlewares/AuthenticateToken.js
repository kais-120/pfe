const jwt = require("jsonwebtoken");

module.exports = async (req,res,next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWTKEY);
        req.userId = decoded.sub;
        next();
      } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
}