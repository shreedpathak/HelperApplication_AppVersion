import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  console.log("Token:");
  const token = req.headers.authorization?.split('Bearer ')[1];
console.log("Token:", token);
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, "yourSecretKey");
    req.user = decoded; // you can access user id/email in route handlers
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
