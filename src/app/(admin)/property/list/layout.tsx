import { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Lista de Propiedades',
  description: 'Lista detallada de todas las propiedades disponibles'
}

export default function PropertyListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 