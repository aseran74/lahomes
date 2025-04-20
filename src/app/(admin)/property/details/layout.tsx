import { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Detalles de la Propiedad',
  description: 'Información detallada de la propiedad y el agente inmobiliario'
}

export default function PropertyDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 