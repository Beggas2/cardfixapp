export type UserPlan = "FREE" | "PRO" | "PREMIUM";

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  isAnonymous: boolean;
  plan: UserPlan;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name?: string;
  isAnonymous?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AnonymousLoginResponse {
  token: string;
  user: User;
}
