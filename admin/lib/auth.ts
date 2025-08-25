import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  const data = await response.json();
  return data.user;
}

export function logout(): void {
  localStorage.removeItem("user");
}

export function getCurrentUser(): AuthUser | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: AuthUser): void {
  localStorage.setItem("user", JSON.stringify(user));
}
