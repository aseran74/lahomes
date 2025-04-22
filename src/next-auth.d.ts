import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

// Extender el tipo User por defecto
declare module "next-auth" {
  interface User extends DefaultUser {
    email: string
  }

  // Extender el tipo Session por defecto
  interface Session extends DefaultSession {
    user?: {
      id: string
      email: string
    }
  }
}

// Extender el tipo JWT por defecto
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    email: string
  }
} 