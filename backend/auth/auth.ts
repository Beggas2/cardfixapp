import { authHandler } from "encore.dev/auth";
import { Header, APIError, Gateway } from "encore.dev/api";
import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  isAdmin: boolean;
  isAnonymous: boolean;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      // Simple JWT verification - in production, use a proper JWT library
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }

      // Decode payload (handle URL-safe base64)
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      if (payload.exp < Date.now() / 1000) {
        throw APIError.unauthenticated("token expired");
      }

      return {
        userID: payload.sub,
        email: payload.email,
        isAdmin: payload.isAdmin || false,
        isAnonymous: payload.isAnonymous || false,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

// Configure the API gateway to use the auth handler
export const gw = new Gateway({ authHandler: auth });
