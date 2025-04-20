'use client'

import React, { useEffect, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface AgentDetailsProps {
  propertyId: string
}

interface Agent {
  id: string
  name: string
  email: string
  phone: string
}

const AgentDetails = ({ propertyId }: AgentDetailsProps) => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAgent = async () => {
      try {
        // Primero obtenemos el agent_id de la propiedad
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('agent_id')
          .eq('id', propertyId)
          .single()

        if (propertyError) throw propertyError
        if (!propertyData?.agent_id) {
          setAgent(null)
          return
        }

        // Luego obtenemos los detalles del agente
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select(`
            id,
            name,
            email,
            phone
          `)
          .eq('id', propertyData.agent_id)
          .single()

        if (agentError) throw agentError

        setAgent(agentData)
      } catch (error) {
        console.error('Error loading agent:', error)
        toast.error('Error al cargar la información del agente')
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [propertyId])

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    )
  }

  if (!agent) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">
            <p className="text-muted mb-0">No hay agente asignado a esta propiedad</p>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-start">
          <div 
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: '64px', height: '64px' }}
          >
            {agent.name.charAt(0)}
          </div>
          <div className="ms-3">
            <h5 className="mb-1">Agente Inmobiliario</h5>
            <p className="text-muted mb-0">{agent.name}</p>
          </div>
        </div>

        <div className="mt-3">
          <h5 className="fs-16 mb-3">Información de Contacto</h5>
          <Row>
            <Col xl={6}>
              <div className="d-flex align-items-center mb-2">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:mail-line" className="text-muted fs-20 me-1" />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">{agent.email}</p>
                </div>
              </div>
            </Col>
            <Col xl={6}>
              <div className="d-flex align-items-center mb-2">
                <div className="flex-shrink-0">
                  <IconifyIcon icon="ri:phone-line" className="text-muted fs-20 me-1" />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">{agent.phone}</p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  )
}

export default AgentDetails 