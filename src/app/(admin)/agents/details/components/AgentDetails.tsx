'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-hot-toast'
import { formatPrice } from '@/utils/format'

interface AgentDetailsProps {
  agentId: string
}

interface Agent {
  id: string
  name: string
  email: string
  phone: string
  specialty?: string
  specialization?: string
  description?: string
  photo_url?: string
  city?: string
  postal_code?: string
  whatsapp?: string
  linkedin_url?: string
  instagram_url?: string
  properties_count?: number
  experience_years?: number
  rating?: number
}

interface Property {
  id: string
  name: string
  estado: 'disponible' | 'reservada' | 'vendida'
  total_price: number
  address: string
  city: string
}

const AgentDetails = ({ agentId }: AgentDetailsProps) => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAgentAndProperties = async () => {
      try {
        // Cargar detalles del agente
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;
        setAgent(agentData);

        // Cargar propiedades asignadas al agente
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            estado,
            total_price,
            address,
            city
          `)
          .eq('agent_id', agentId);

        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos del agente');
      } finally {
        setLoading(false);
      }
    };

    loadAgentAndProperties();
  }, [agentId]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <Card>
        <CardBody>
          <div className="text-center">
            <IconifyIcon icon="solar:danger-circle-bold" width={50} height={50} />
            <h4 className="mt-2">Agente no encontrado</h4>
            <Link href="/agents/list-view" className="btn btn-primary mt-3">
              Volver al listado
            </Link>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Row>
      {/* Información Principal */}
      <Col lg={4}>
        <Card>
          <CardBody>
            <div className="text-center">
              {agent.photo_url ? (
                <Image
                  src={agent.photo_url}
                  alt={agent.name}
                  width={150}
                  height={150}
                  className="rounded-circle mb-3"
                />
              ) : (
                <div 
                  className="avatar-lg mx-auto rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                >
                  {agent.name.charAt(0)}
                </div>
              )}
              <h4>{agent.name}</h4>
              <p className="text-muted">{agent.specialization || agent.specialty || 'Agente Inmobiliario'}</p>

              <div className="mt-4">
                <Link href={`/agents/details/${agent.id}/edit`} className="btn btn-primary me-2">
                  <IconifyIcon icon="ri:pencil-line" className="me-1" />
                  Editar
                </Link>
                <Link href="/agents/list-view" className="btn btn-light">
                  <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
                  Volver
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="mb-3">Información de Contacto</h5>
              <div className="table-responsive">
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <th scope="row">Email:</th>
                      <td>{agent.email}</td>
                    </tr>
                    <tr>
                      <th scope="row">Teléfono:</th>
                      <td>{agent.phone || '-'}</td>
                    </tr>
                    <tr>
                      <th scope="row">WhatsApp:</th>
                      <td>{agent.whatsapp || '-'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ciudad:</th>
                      <td>{agent.city || '-'}</td>
                    </tr>
                    <tr>
                      <th scope="row">Código Postal:</th>
                      <td>{agent.postal_code || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="mb-3">Redes Sociales</h5>
              {agent.linkedin_url && (
                <a href={agent.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-soft-primary me-2">
                  <IconifyIcon icon="ri:linkedin-fill" />
                </a>
              )}
              {agent.instagram_url && (
                <a href={agent.instagram_url} target="_blank" rel="noopener noreferrer" className="btn btn-soft-danger">
                  <IconifyIcon icon="ri:instagram-fill" />
                </a>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Estadísticas y Propiedades */}
      <Col lg={8}>
        <Row>
          <Col md={4}>
        <Card>
          <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4>{agent.properties_count || 0}</h4>
                    <p className="text-muted mb-0">Propiedades</p>
                    </div>
                  <div className="avatar-sm rounded-circle bg-primary text-white flex-shrink-0 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:home-4-line" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4>{agent.experience_years || 0}</h4>
                    <p className="text-muted mb-0">Años de Experiencia</p>
                  </div>
                  <div className="avatar-sm rounded-circle bg-success text-white flex-shrink-0 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:calendar-line" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4>{agent.rating || 0}</h4>
                    <p className="text-muted mb-0">Calificación</p>
                  </div>
                  <div className="avatar-sm rounded-circle bg-warning text-white flex-shrink-0 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:star-line" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Descripción */}
        {agent.description && (
          <Card>
            <CardBody>
              <h5 className="mb-3">Descripción</h5>
              <p className="text-muted">{agent.description}</p>
          </CardBody>
        </Card>
        )}

        {/* Lista de Propiedades */}
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Propiedades Asignadas ({properties.length})</h5>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Ubicación</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No hay propiedades asignadas
                      </td>
                    </tr>
                  ) : (
                    properties.map((property) => (
                      <tr key={property.id}>
                        <td>{property.name}</td>
                        <td>
                          <span className={`badge bg-${property.estado === 'disponible' ? 'success' : property.estado === 'reservada' ? 'warning' : 'danger'}`}>
                            {property.estado}
                          </span>
                        </td>
                        <td>{formatPrice(property.total_price)}</td>
                        <td>{`${property.address}, ${property.city}`}</td>
                        <td>
                          <Link href={`/property/details?id=${property.id}`} className="btn btn-sm btn-soft-primary">
                            <IconifyIcon icon="ri:eye-line" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AgentDetails