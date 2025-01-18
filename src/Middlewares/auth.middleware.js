import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  
    const tokenData = req.header('Authorization');
    const token = tokenData.replace("Bearer", "").trim();
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        next(err)
    }
};

export default authMiddleware;