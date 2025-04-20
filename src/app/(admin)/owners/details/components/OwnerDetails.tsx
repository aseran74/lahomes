'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import defaultAvatar from '@/assets/images/users/avatar-1.jpg'
import { format } from 'date-fns'

interface Owner {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  dni: string
  direccion?: string
  ciudad?: string
  codigo_postal?: string
  fecha_nacimiento?: string
  ocupacion?: string
  notas?: string
  created_at?: string
  updated_at?: string
}

interface OwnerDetailsProps {
  ownerId: string
}

const OwnerDetails = ({ ownerId }: OwnerDetailsProps) => {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOwner = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', ownerId)
          .single()

        if (error) throw error

        setOwner(data)
      } catch (error: any) {
        console.error('Error loading owner:', error)
        toast.error('Error al cargar los datos del propietario')
      } finally {
        setLoading(false)
      }
    }

    loadOwner()
  }, [ownerId])

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="text-center">Cargando datos del propietario...</div>
        </CardBody>
      </Card>
    )
  }

  if (!owner) {
    return (
      <Card>
        <CardBody>
          <div className="text-center">No se encontró el propietario</div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Col lg={12} className="mb-4">
            <div className="d-flex align-items-center">
              <Image
                src={defaultAvatar}
                alt={`${owner.nombre} ${owner.apellidos}`}
                width={100}
                height={100}
                className="rounded-circle"
              />
              <div className="ms-3">
                <h4 className="mb-1">{owner.nombre} {owner.apellidos}</h4>
                <p className="text-muted mb-0">DNI: {owner.dni}</p>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <h5 className="mb-3">Información Personal</h5>
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th scope="row" style={{ width: '25%' }}>Email:</th>
                    <td>{owner.email}</td>
                  </tr>
                  <tr>
                    <th scope="row">Teléfono:</th>
                    <td>{owner.telefono}</td>
                  </tr>
                  {owner.fecha_nacimiento && (
                    <tr>
                      <th scope="row">Fecha de Nacimiento:</th>
                      <td>{format(new Date(owner.fecha_nacimiento), 'dd/MM/yyyy')}</td>
                    </tr>
                  )}
                  {owner.ocupacion && (
                    <tr>
                      <th scope="row">Ocupación:</th>
                      <td>{owner.ocupacion}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Col>

          <Col lg={6}>
            <h5 className="mb-3">Dirección</h5>
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <tbody>
                  {owner.direccion && (
                    <tr>
                      <th scope="row" style={{ width: '25%' }}>Dirección:</th>
                      <td>{owner.direccion}</td>
                    </tr>
                  )}
                  {owner.ciudad && (
                    <tr>
                      <th scope="row">Ciudad:</th>
                      <td>{owner.ciudad}</td>
                    </tr>
                  )}
                  {owner.codigo_postal && (
                    <tr>
                      <th scope="row">Código Postal:</th>
                      <td>{owner.codigo_postal}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Col>

          {owner.notas && (
            <Col lg={12} className="mt-4">
              <h5 className="mb-3">Notas</h5>
              <p className="text-muted mb-0">{owner.notas}</p>
            </Col>
          )}

          <Col lg={12} className="mt-4">
            <h5 className="mb-3">Información del Sistema</h5>
            <div className="table-responsive">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th scope="row" style={{ width: '25%' }}>Fecha de Registro:</th>
                    <td>{owner.created_at ? format(new Date(owner.created_at), 'dd/MM/yyyy HH:mm') : '-'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Última Actualización:</th>
                    <td>{owner.updated_at ? format(new Date(owner.updated_at), 'dd/MM/yyyy HH:mm') : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default OwnerDetails 