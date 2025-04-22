'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Badge, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap'
import { supabase } from '@/lib/supabase'
import { Invoice, Owner, Property } from '../types'
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa'

interface InvoiceListProps {
  refreshTrigger: number
  onEditInvoice: (invoice: Invoice) => void
}

const InvoiceList = ({ refreshTrigger, onEditInvoice }: InvoiceListProps) => {
  // Estados para datos
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [owners, setOwners] = useState<Record<string, Owner>>({})
  const [properties, setProperties] = useState<Record<string, Property>>({})
  
  // Estados para UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    owner_id: '',
    property_id: '',
    invoice_type: '',
    bank_status: '',
    payment_status: '',
    year: new Date().getFullYear().toString(),
    month: ''
  })
  
  // Estado para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Cargar facturas, propietarios y propiedades
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Cargar propietarios
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('id, email, nombre, apellidos')

        if (ownersError) throw ownersError
        
        // Convertir array a objeto indexado por id
        const ownersMap: Record<string, Owner> = {}
        ownersData?.forEach(owner => {
          ownersMap[owner.id] = owner
        })
        setOwners(ownersMap)

        // Cargar propiedades
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, address')

        if (propertiesError) throw propertiesError
        
        // Cargar relaciones property-owner
        const { data: propertyOwnersData, error: propertyOwnersError } = await supabase
          .from('property_shares_owners')
          .select('property_id, owner_id')

        if (propertyOwnersError) throw propertyOwnersError
        
        // Convertir array a objeto indexado por id
        const propertiesMap: Record<string, Property> = {}
        propertiesData?.forEach(property => {
          // Buscar el propietario para esta propiedad
          const ownerRelation = propertyOwnersData?.find(relation => relation.property_id === property.id);
          
          propertiesMap[property.id] = {
            ...property,
            owner_id: ownerRelation?.owner_id || null
          }
        })
        setProperties(propertiesMap)

        // Cargar facturas con filtros
        await loadInvoices()
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshTrigger])

  // Cargar facturas con filtros
  const loadInvoices = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false })
      
      // Aplicar filtros
      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id)
      }
      
      if (filters.property_id) {
        query = query.eq('property_id', filters.property_id)
      }
      
      if (filters.invoice_type) {
        query = query.eq('invoice_type', filters.invoice_type)
      }
      
      if (filters.bank_status) {
        query = query.eq('bank_status', filters.bank_status)
      }
      
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status)
      }
      
      if (filters.year) {
        query = query.eq('invoice_year', parseInt(filters.year))
      }
      
      if (filters.month) {
        query = query.eq('invoice_month', parseInt(filters.month))
      }

      const { data, error } = await query

      if (error) throw error
      setInvoices(data || [])
    } catch (err) {
      console.error('Error loading invoices:', err)
      setError('Error al cargar las facturas')
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Aplicar filtros
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    loadInvoices()
  }

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      owner_id: '',
      property_id: '',
      invoice_type: '',
      bank_status: '',
      payment_status: '',
      year: new Date().getFullYear().toString(),
      month: ''
    })
    
    // Cargar facturas sin filtros después de resetear
    setTimeout(loadInvoices, 0)
  }

  // Abrir modal de confirmación de eliminación
  const confirmDelete = (id: string) => {
    setInvoiceToDelete(id)
    setShowDeleteModal(true)
  }

  // Eliminar factura
  const deleteInvoice = async () => {
    if (!invoiceToDelete) return

    setDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete)

      if (error) throw error

      // Actualizar la lista de facturas
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete))
      setShowDeleteModal(false)
    } catch (err) {
      console.error('Error deleting invoice:', err)
      setError(`Error al eliminar la factura: ${(err as Error).message}`)
    } finally {
      setDeleteLoading(false)
      setInvoiceToDelete(null)
    }
  }

  // Renderizar el estado del banco con badge
  const renderBankStatus = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pendiente</Badge>
      case 'sent':
        return <Badge bg="info">Enviada</Badge>
      case 'returned':
        return <Badge bg="danger">Devuelta</Badge>
      default:
        return <Badge bg="secondary">Desconocido</Badge>
    }
  }

  // Renderizar el estado de pago con badge
  const renderPaymentStatus = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pendiente</Badge>
      case 'paid':
        return <Badge bg="success">Pagada</Badge>
      case 'returned':
        return <Badge bg="danger">Devuelta</Badge>
      default:
        return <Badge bg="secondary">Desconocido</Badge>
    }
  }

  // Renderizar el tipo de factura
  const renderInvoiceType = (type: string) => {
    switch(type) {
      case 'common_expenses':
        return 'Gastos Comunes'
      case 'management_expenses':
        return 'Gastos de Gestión'
      default:
        return 'Desconocido'
    }
  }

  return (
    <>
      {/* Filtros */}
      <Form onSubmit={applyFilters} className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Propietario</Form.Label>
              <Form.Select
                name="owner_id"
                value={filters.owner_id}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {Object.values(owners).map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.nombre} {owner.apellidos}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="invoice_type"
                value={filters.invoice_type}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="common_expenses">Gastos Comunes</option>
                <option value="management_expenses">Gastos de Gestión</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Estado Bancario</Form.Label>
              <Form.Select
                name="bank_status"
                value={filters.bank_status}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="sent">Enviada</option>
                <option value="returned">Devuelta</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Estado Pago</Form.Label>
              <Form.Select
                name="payment_status"
                value={filters.payment_status}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="returned">Devuelta</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Año</Form.Label>
              <Form.Select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Mes</Form.Label>
              <Form.Select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    {new Date(0, i).toLocaleString('es', { month: 'long' }).charAt(0).toUpperCase() + 
                     new Date(0, i).toLocaleString('es', { month: 'long' }).slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={9} className="d-flex align-items-end justify-content-end mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={resetFilters} 
              className="me-2"
              disabled={loading}
            >
              Limpiar Filtros
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner 
                    as="span" 
                    animation="border" 
                    size="sm" 
                    role="status" 
                    aria-hidden="true" 
                    className="me-2"
                  />
                  Cargando...
                </>
              ) : (
                'Filtrar'
              )}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Mensajes de error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla de facturas */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Número</th>
              <th>Propietario</th>
              <th>Propiedad</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Importe</th>
              <th>Estado Bancario</th>
              <th>Estado Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 mb-0">Cargando facturas...</p>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  No se encontraron facturas con los filtros seleccionados
                </td>
              </tr>
            ) : (
              invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_number}</td>
                  <td>
                    {owners[invoice.owner_id] 
                      ? `${owners[invoice.owner_id].nombre} ${owners[invoice.owner_id].apellidos}` 
                      : 'Propietario desconocido'}
                  </td>
                  <td>
                    {properties[invoice.property_id]
                      ? properties[invoice.property_id].name
                      : 'Propiedad desconocida'}
                  </td>
                  <td>
                    {new Date(invoice.invoice_date).toLocaleDateString('es')}
                    <div className="small text-muted">
                      {new Date(0, invoice.invoice_month - 1).toLocaleString('es', { month: 'long' }).charAt(0).toUpperCase() + 
                       new Date(0, invoice.invoice_month - 1).toLocaleString('es', { month: 'long' }).slice(1)}, {invoice.invoice_year}
                    </div>
                  </td>
                  <td>{renderInvoiceType(invoice.invoice_type)}</td>
                  <td className="text-end">{invoice.amount.toFixed(2)} €</td>
                  <td className="text-center">{renderBankStatus(invoice.bank_status)}</td>
                  <td className="text-center">{renderPaymentStatus(invoice.payment_status)}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => onEditInvoice(invoice)}
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => confirmDelete(invoice.id!)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={deleteInvoice} disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default InvoiceList 