import jwt from "jsonwebtoken";

export function verifyToken(req: Request) {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization") || "";
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback: try cookie named `token`
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as any;
    const id = decoded?.userId ?? decoded?.id ?? decoded?._id;
    if (!id) return null;
    if (process.env.NODE_ENV === "development") {
      console.debug("verifyToken: token valid for user", id);
    }
    return { id };
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.debug("verifyToken failed:", err);
    return null;
  }
}
