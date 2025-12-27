import jwt from "jsonwebtoken";
import { APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

// ✅ Match the name you already have in Encore secrets
const jwtSecret = secret("JWTSecret");

export function verifyToken(token: string) {
  const secretValue = jwtSecret();
  if (!secretValue) {
    throw APIError.internal("Missing JWT secret");
  }

  try {
    return jwt.verify(token, secretValue) as {
      sub: string;
      email?: string;
      [key: string]: any;
    };
  } catch (err) {
    throw APIError.unauthenticated("Invalid or expired token");
  }
}

