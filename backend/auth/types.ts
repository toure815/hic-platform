export type UserRole = "admin" | "staff" | "client";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthData {
  userID: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
