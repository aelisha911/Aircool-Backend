import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "your-secret-key";

export const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, secret());
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Administrator access required" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};
