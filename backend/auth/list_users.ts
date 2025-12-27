import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { User } from "./types";

interface ListUsersResponse {
  users: User[];
}

// Lists all users (admin only).
export const listUsers = api<void, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/users" },
  async () => {
    const auth = getAuthData()!;
    
    if (auth.role !== "admin") {
      throw APIError.permissionDenied("only admins can list users");
    }

    const users = await authDB.queryAll`
      SELECT id, email, role, first_name, last_name, is_active, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }))
    };
  }
);
