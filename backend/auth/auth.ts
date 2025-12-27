import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { authDB } from "./db";
import { verifyToken } from "./jwt";
import type { AuthData } from "./types";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

function verifySupabaseAuth(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw APIError.unauthenticated("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  return { userId: payload.sub, email: payload.email };
}

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const authResult = verifySupabaseAuth(data.authorization);
    
    const user = await authDB.queryRow`
      SELECT id, email, role, first_name, last_name, is_active, supabase_id
      FROM users 
      WHERE supabase_id = ${authResult.userId} AND is_active = true
    `;

    if (!user) {
      throw APIError.unauthenticated("user not found or inactive");
    }

    return {
      userID: user.supabase_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  }
);

export const gw = new Gateway({ authHandler: auth });
