import { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Agregar Propiedad',
  description: 'Formulario para agregar una nueva propiedad'
}

export default function PropertyAddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 