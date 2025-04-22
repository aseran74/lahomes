import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase'

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          // Intentar iniciar sesión con Supabase
          const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            throw error
          }

          if (!user || !session) {
            return null
          }

          // Almacenar el token de acceso en localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('supabase.auth.token', session.access_token)
          }

          return {
            id: user.id,
            email: user.email!,
            name: user.email!.split('@')[0],
          }
        } catch (error) {
          console.error('Error de autenticación:', error)
          throw new Error(error instanceof Error ? error.message : 'Error de autenticación')
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user }) {
      return !!user
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'signIn' && user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string

        // Verificar y actualizar la sesión de Supabase
        const { data: { session: supabaseSession } } = await supabase.auth.getSession()
        if (!supabaseSession) {
          await supabase.auth.refreshSession()
        }
      }
      return session
    },
  },
}
