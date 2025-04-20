'use client'

import { useEffect, useState } from 'react'
import { Container, Table, Badge, Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatCurrency } from '@/utils'

interface Property {
  id: string
  name: string
  total_price: number
  commission_percentage: number
  commission_status: 'pendiente' | 'pagada'
  agent_id: string | null
  agent: {
    id: string
    name: string
    email: string
  } | null
}

export default function CommissionsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          total_price,
          commission_percentage,
          commission_status,
          agent_id,
          agent:agents(id, name, email)
        `)
        .eq('estado', 'vendida')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('Error al cargar propiedades:', error)
      toast.error('Error al cargar las propiedades')
    } finally {
      setLoading(false)
    }
  }

  const toggleCommissionStatus = async (id: string, currentStatus: 'pendiente' | 'pagada') => {
    try {
      const newStatus = currentStatus === 'pendiente' ? 'pagada' : 'pendiente'
      const { error } = await supabase
        .from('properties')
        .update({ commission_status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast.success(`Comisión marcada como ${newStatus}`)
      loadProperties()
    } catch (error) {
      console.error('Error al actualizar comisión:', error)
      toast.error('Error al actualizar la comisión')
    }
  }

  const calculateCommission = (price: number, percentage: number): number => {
    return (price * percentage) / 100
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Comisiones de Propiedades Vendidas</h2>
      
      {properties.length === 0 ? (
        <p>No hay propiedades vendidas con comisiones.</p>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Propiedad</th>
              <th>Agente</th>
              <th>Precio de Venta</th>
              <th>Porcentaje</th>
              <th>Comisión</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>{property.name}</td>
                <td>
                  {property.agent ? (
                    <div>
                      <div>{property.agent.name}</div>
                      <small className="text-muted">{property.agent.email}</small>
                    </div>
                  ) : (
                    <span className="text-muted">Sin agente asignado</span>
                  )}
                </td>
                <td>{formatCurrency(property.total_price)}</td>
                <td>{property.commission_percentage}%</td>
                <td>{formatCurrency(calculateCommission(property.total_price, property.commission_percentage))}</td>
                <td>
                  <Badge bg={property.commission_status === 'pagada' ? 'success' : 'warning'}>
                    {property.commission_status === 'pagada' ? 'Pagada' : 'Pendiente'}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant={property.commission_status === 'pagada' ? 'warning' : 'success'}
                    size="sm"
                    onClick={() => toggleCommissionStatus(property.id, property.commission_status)}
                  >
                    {property.commission_status === 'pagada' ? 'Marcar como pendiente' : 'Marcar como pagada'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
} 