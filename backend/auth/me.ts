import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { User } from "./types";
import { authDB } from "./db";

// Gets the current user's information.
export const me = api<void, User>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()!;
    
    const user = await authDB.queryRow`
      SELECT id, email, role, first_name, last_name, is_active, created_at, updated_at
      FROM users 
      WHERE supabase_id = ${auth.userID}
    `;

    if (!user) {
      throw new Error("user not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
);
