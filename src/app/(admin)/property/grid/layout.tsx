import { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Cuadrícula de Propiedades',
  description: 'Vista en cuadrícula de todas las propiedades disponibles'
}

export default function PropertyGridLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 