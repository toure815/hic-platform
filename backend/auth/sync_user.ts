import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { User } from "./types";

interface SyncUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "staff" | "client";
}

// Syncs or creates a user record from Supabase authentication.
export const syncUser = api<SyncUserRequest, User>(
  { auth: true, expose: true, method: "POST", path: "/auth/sync-user" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user already exists
    const existingUser = await authDB.queryRow`
      SELECT id, email, role, first_name, last_name, is_active, created_at, updated_at, supabase_id
      FROM users 
      WHERE supabase_id = ${auth.userID}
    `;

    if (existingUser) {
      // Update existing user with latest info from Supabase
      const updatedUser = await authDB.queryRow`
        UPDATE users 
        SET 
          email = ${req.email.toLowerCase()},
          first_name = ${req.firstName || existingUser.first_name},
          last_name = ${req.lastName || existingUser.last_name},
          updated_at = NOW()
        WHERE supabase_id = ${auth.userID}
        RETURNING id, email, role, first_name, last_name, is_active, created_at, updated_at
      `;

      if (!updatedUser) {
        throw APIError.internal("failed to update user");
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      };
    }

    // Create new user record
    const defaultRole = req.role || "client";
    const newUser = await authDB.queryRow`
      INSERT INTO users (supabase_id, email, role, first_name, last_name, password_hash)
      VALUES (${auth.userID}, ${req.email.toLowerCase()}, ${defaultRole}, ${req.firstName || ""}, ${req.lastName || ""}, 'supabase-managed')
      RETURNING id, email, role, first_name, last_name, is_active, created_at, updated_at
    `;

    if (!newUser) {
      throw APIError.internal("failed to create user");
    }

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      isActive: newUser.is_active,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
    };
  }
);
