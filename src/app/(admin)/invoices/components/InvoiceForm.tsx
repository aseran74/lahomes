'use client'

import { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import { supabase } from '@/lib/supabase'
import { Invoice, Owner, Property, InvoiceType, InvoiceBankStatus, InvoicePaymentStatus } from '../types'

interface InvoiceFormProps {
  invoice: Invoice | null
  onSuccess: () => void
  onCancel: () => void
}

const InvoiceForm = ({ invoice, onSuccess, onCancel }: InvoiceFormProps) => {
  // Estado para almacenar propietarios y propiedades
  const [owners, setOwners] = useState<Owner[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])

  // Estado para el formulario
  const [formData, setFormData] = useState<Invoice>({
    owner_id: '',
    property_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_month: new Date().getMonth() + 1,
    invoice_year: new Date().getFullYear(),
    amount: 0,
    invoice_type: 'common_expenses',
    bank_status: 'pending',
    payment_status: 'pending',
    invoice_number: ''
  })

  // Estado para la UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar propietarios y propiedades al inicio
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Cargar propietarios
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('id, email, nombre, apellidos')
          .order('nombre')

        if (ownersError) throw ownersError
        setOwners(ownersData || [])

        // Cargar propiedades - sin owner_id porque no existe en la tabla properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, name, address')
          .order('name')

        if (propertiesError) throw propertiesError
        setProperties(propertiesData || [])

        // Cargar relaciones property-owner para saber qué propiedades pertenecen a qué propietarios
        const { data: propertyOwnersData, error: propertyOwnersError } = await supabase
          .from('property_shares_owners')
          .select('property_id, owner_id')

        if (propertyOwnersError) throw propertyOwnersError

        // Agregar la propiedad owner_id a cada propiedad basado en las relaciones
        const propertiesWithOwners = propertiesData?.map(property => {
          const ownerRelation = propertyOwnersData?.find(relation => relation.property_id === property.id);
          return {
            ...property,
            owner_id: ownerRelation?.owner_id || null
          };
        }) || [];

        setProperties(propertiesWithOwners);
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Error al cargar los datos necesarios')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Inicializar el formulario si estamos editando
  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
    }
  }, [invoice])

  // Filtrar propiedades por propietario
  useEffect(() => {
    if (formData.owner_id) {
      const filtered = properties.filter(property => property.owner_id === formData.owner_id)
      setFilteredProperties(filtered)

      // Si no hay propiedad seleccionada o la seleccionada no pertenece al propietario, seleccionar la primera
      if (filtered.length > 0 && (!formData.property_id || !filtered.some(p => p.id === formData.property_id))) {
        setFormData(prev => ({
          ...prev,
          property_id: filtered[0].id
        }))
      }
    } else {
      setFilteredProperties([])
    }
  }, [formData.owner_id, properties])

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Convertir valores numéricos
    if (name === 'amount' || name === 'invoice_month' || name === 'invoice_year') {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) : parseInt(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (
        !formData.owner_id || 
        !formData.property_id || 
        !formData.invoice_date || 
        !formData.invoice_number || 
        formData.amount <= 0
      ) {
        throw new Error('Por favor complete todos los campos obligatorios')
      }

      // Generar número de factura si no existe
      if (!formData.invoice_number) {
        const timestamp = new Date().getTime()
        const randomNum = Math.floor(Math.random() * 1000)
        formData.invoice_number = `INV-${formData.invoice_year}${formData.invoice_month.toString().padStart(2, '0')}-${timestamp}-${randomNum}`
      }

      // Crear o actualizar factura
      if (invoice?.id) {
        // Actualizar
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id)

        if (updateError) throw updateError
        setSuccess('Factura actualizada correctamente')
      } else {
        // Crear
        const { error: insertError } = await supabase
          .from('invoices')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (insertError) throw insertError
        setSuccess('Factura creada correctamente')
      }

      // Resetear formulario
      setFormData({
        owner_id: '',
        property_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_month: new Date().getMonth() + 1,
        invoice_year: new Date().getFullYear(),
        amount: 0,
        invoice_type: 'common_expenses',
        bank_status: 'pending',
        payment_status: 'pending',
        invoice_number: ''
      })

      onSuccess()
    } catch (err) {
      console.error('Error saving invoice:', err)
      setError(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group controlId="owner_id">
            <Form.Label>Propietario*</Form.Label>
            <Form.Select
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">Seleccione un propietario</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.nombre} {owner.apellidos} ({owner.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group controlId="property_id">
            <Form.Label>Propiedad*</Form.Label>
            <Form.Select
              name="property_id"
              value={formData.property_id}
              onChange={handleChange}
              disabled={loading || !formData.owner_id}
              required
            >
              <option value="">Seleccione una propiedad</option>
              {filteredProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} {property.address ? `(${property.address})` : ''}
                </option>
              ))}
            </Form.Select>
            {!formData.owner_id && (
              <Form.Text className="text-muted">
                Seleccione primero un propietario
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="invoice_type">
            <Form.Label>Tipo de Factura*</Form.Label>
            <Form.Select
              name="invoice_type"
              value={formData.invoice_type}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="common_expenses">Gastos Comunes</option>
              <option value="management_expenses">Gastos de Gestión</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="invoice_number">
            <Form.Label>Número de Factura*</Form.Label>
            <Form.Control
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="Se generará automáticamente si se deja vacío"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="invoice_date">
            <Form.Label>Fecha de Factura*</Form.Label>
            <Form.Control
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="invoice_month">
            <Form.Label>Mes*</Form.Label>
            <Form.Select
              name="invoice_month"
              value={formData.invoice_month}
              onChange={handleChange}
              disabled={loading}
              required
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('es', { month: 'long' }).charAt(0).toUpperCase() + 
                   new Date(0, i).toLocaleString('es', { month: 'long' }).slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="invoice_year">
            <Form.Label>Año*</Form.Label>
            <Form.Control
              type="number"
              name="invoice_year"
              value={formData.invoice_year}
              onChange={handleChange}
              disabled={loading}
              required
              min={2000}
              max={2100}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="amount">
            <Form.Label>Importe (€)*</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={loading}
              required
              min={0}
              step={0.01}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="bank_status">
            <Form.Label>Estado Bancario*</Form.Label>
            <Form.Select
              name="bank_status"
              value={formData.bank_status}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="pending">Pendiente</option>
              <option value="sent">Enviada</option>
              <option value="returned">Devuelta</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="payment_status">
            <Form.Label>Estado de Pago*</Form.Label>
            <Form.Select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagada</option>
              <option value="returned">Devuelta</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="notes">
        <Form.Label>Notas</Form.Label>
        <Form.Control
          as="textarea"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          disabled={loading}
          rows={3}
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
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
              Guardando...
            </>
          ) : (
            <>{invoice?.id ? 'Actualizar' : 'Crear'} Factura</>
          )}
        </Button>
      </div>
    </Form>
  )
}

export default InvoiceForm 