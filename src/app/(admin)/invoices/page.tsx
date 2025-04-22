'use client'

import { Container, Row, Col, Card } from 'react-bootstrap'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import { useState } from 'react'
import { Invoice } from './types'

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Función para refrescar la lista de facturas
  const refreshInvoices = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Función para editar una factura
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setSelectedInvoice(null)
  }

  return (
    <Container fluid>
      <Row>
        <Col lg={12}>
          <h1 className="header-title mb-3">Gestión de Facturas</h1>
        </Col>
      </Row>

      <Row>
        {/* Formulario de facturas */}
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="header-title">{selectedInvoice ? 'Editar Factura' : 'Nueva Factura'}</h4>
              <InvoiceForm 
                invoice={selectedInvoice}
                onCancel={handleCancelEdit}
                onSuccess={() => {
                  refreshInvoices()
                  setSelectedInvoice(null)
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Lista de facturas */}
        <Col lg={8}>
          <Card>
            <Card.Body>
              <h4 className="header-title mb-3">Listado de Facturas</h4>
              <InvoiceList 
                refreshTrigger={refreshTrigger} 
                onEditInvoice={handleEditInvoice} 
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
} 