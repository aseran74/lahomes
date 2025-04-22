import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"

export default withAuth(
  // `withAuth` extiende tu objeto `Request` con el token del usuario.
  function middleware(req) {
    // console.log("Token:", req.nextauth.token)

    // Eliminamos la redirección de la raíz para permitir que la landing page funcione
    // if (req.nextUrl.pathname === '/') {
    //     return NextResponse.redirect(new URL('/dashboards/analytics', req.url))
    // }

    // Lógica adicional si necesitas verificar roles basados en req.nextauth.token?.role
    // if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "Admin") {
    //   return NextResponse.rewrite(
    //     new URL("/auth/sign-in?message=You Are Not Authorized!", req.url)
    //   )
    // }

    // Si no hay redirecciones o reescrituras, continúa normalmente
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Si hay un token, el usuario está autorizado
    },
    pages: {
        signIn: '/auth/sign-in', // Página a la que redirigir si no está autorizado
        // error: '/auth/error', // Página de error opcional
    }
  }
)

// Modificamos el matcher para excluir la raíz '/' y rutas públicas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que empiezan por:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo favicon)
     * - auth (rutas de autenticación)
     * - $ (probablemente para carpetas especiales internas)
     * También excluye cualquier ruta que contenga un punto (archivos estáticos en public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|$).*)',
    // Eliminamos la raíz para que no se aplique la autenticación
    // '/', 
  ],
}
