'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardBody, Col, Dropdown, Row, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { toast } from 'react-hot-toast'

interface Agent {
  id: string
  name: string
  email: string
  phone?: string
  specialty?: string
  experience_years?: number
  rating?: number
  properties_count?: number
  photo_url?: string
  city?: string
}

const AgentList = () => {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalAgents, setTotalAgents] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calcular índices y filtrar agentes
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.specialty?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (agent.city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const loadAgents = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('agents')
        .select(`
          *,
          properties:properties(count)
        `, { count: 'exact' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error al cargar agentes:', error)
        throw error
      }

      // Procesar el conteo de propiedades
      const agentsWithCounts = data?.map(agent => ({
        ...agent,
        properties_count: agent.properties?.[0]?.count || 0
      })) || []

      setAgents(agentsWithCounts)
      if (count !== null) setTotalAgents(count)
    } catch (error: any) {
      console.error('Error al cargar agentes:', error)
      toast.error('Error al cargar los agentes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [currentPage, searchTerm])

  const handleDelete = async (id: string, agentName: string) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar al agente ${agentName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })

      if (result.isConfirmed) {
        // Verificar si el agente tiene propiedades asociadas directamente en properties
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id')
          .eq('agent_id', id)
          .limit(1)

        if (propertiesError) {
          console.error('Error al verificar propiedades asociadas:', propertiesError)
          throw propertiesError
        }

        if (properties && properties.length > 0) {
          await Swal.fire({
            title: 'No se puede eliminar',
            text: 'Este agente tiene propiedades asociadas. Debes reasignar o eliminar las propiedades primero.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          })
          return
        }

        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', id)

        if (error) throw error

        toast.success('Agente eliminado exitosamente')
        loadAgents()
      }
    } catch (error: any) {
      console.error('Error al eliminar agente:', error)
      toast.error('Error al eliminar el agente')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/agents/edit/${id}`)
  }

  const totalPages = Math.ceil(totalAgents / itemsPerPage)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <Card>
      <CardBody>
        <Row className="mb-3">
          <Col xs={12} md={3}>
            <div className="search-box mb-2">
              <input
                type="text"
                className="form-control search"
                placeholder="Buscar agente..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/agents/add" passHref className="w-100 w-sm-auto">
                <Button 
                  variant="success" 
                  size="sm" 
                  className="w-100 w-sm-auto py-1 px-2"
                  style={{ fontSize: '0.8rem' }}
                >
                  <IconifyIcon icon="ri:add-line" className="me-1" width="14" />
                  Nuevo Agente
                </Button>
              </Link>
              <Button 
                variant="soft-primary" 
                size="sm" 
                className="w-100 w-sm-auto py-1 px-2"
                style={{ fontSize: '0.8rem' }}
              >
                <IconifyIcon icon="ri:filter-3-line" className="me-1" width="14" />
                Filtros
              </Button>
              <Button 
                variant="soft-primary" 
                size="sm" 
                className="w-100 w-sm-auto py-1 px-2"
                style={{ fontSize: '0.8rem' }}
              >
                <IconifyIcon icon="ri:file-download-line" className="me-1" width="14" />
                Exportar
              </Button>
            </div>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table className="table-centered table-hover table-nowrap mb-0">
            <thead>
              <tr>
                <th scope="col">Agente</th>
                <th scope="col" className="d-none d-md-table-cell">Email</th>
                <th scope="col" className="d-none d-md-table-cell">Teléfono</th>
                <th scope="col" className="d-none d-lg-table-cell">Especialidad</th>
                <th scope="col" className="d-none d-lg-table-cell">Ciudad</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    No se encontraron agentes
                  </td>
                </tr>
              ) :
                agents.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {agent.photo_url ? (
                          <Image
                            src={agent.photo_url}
                            alt={agent.name}
                            width={32}
                            height={32}
                            className="rounded-circle me-2"
                          />
                        ) : (
                          <div 
                            className="avatar-xs rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                            style={{ width: '32px', height: '32px' }}
                          >
                            {agent.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h5 className="font-size-14 mb-1">
                            <Link href={`/agents/details/${agent.id}`} className="text-dark">
                              {agent.name}
                            </Link>
                          </h5>
                          <div className="d-md-none">
                            <p className="text-muted mb-1">{agent.email}</p>
                            <p className="text-muted mb-0">{agent.phone || '-'}</p>
                          </div>
                          <p className="text-muted mb-0 d-none d-lg-block">
                            {agent.experience_years ? `${agent.experience_years} años de experiencia` : 'Sin experiencia registrada'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">{agent.email}</td>
                    <td className="d-none d-md-table-cell">{agent.phone || '-'}</td>
                    <td className="d-none d-lg-table-cell">{agent.specialty || '-'}</td>
                    <td className="d-none d-lg-table-cell">{agent.city || '-'}</td>
                    <td>
                      <Dropdown className="d-inline-block">
                        <Dropdown.Toggle variant="light" size="sm" className="btn-icon">
                          <IconifyIcon icon="ri:settings-4-line" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item href={`/agents/details/${agent.id}`}>
                            <IconifyIcon icon="ri:eye-fill" className="me-2" />
                            Ver Detalles
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEdit(agent.id)}>
                            <IconifyIcon icon="ri:pencil-fill" className="me-2" />
                            Editar
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(agent.id, agent.name)} className="text-danger">
                            <IconifyIcon icon="ri:delete-bin-6-line" className="me-2" />
                            Eliminar
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </div>

        {/* Paginación */}
        {!loading && agents.length > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-4">
            <div className="text-muted mb-2 mb-sm-0">
              Mostrando {startIndex + 1} a {Math.min(startIndex + agents.length, totalAgents)} de {totalAgents} agentes
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default AgentList 