'use client'

import React from 'react';
import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row, Container } from 'react-bootstrap'
import PropertyAdd from './components/PropertyAdd'
import PropertyAddCard from './components/PropertyAddCard'
import { useState } from 'react'

interface FormData {
  nombre: string;
  tipo: string;
  precio: number;
  habitaciones: number;
  banos: number;
  area: number;
  direccion: string;
  codigoPostal: string;
  copropiedad: number;
  estado: string;
  pisos: number;
}

export default function AddPropertyPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'Residencial',
    precio: 0,
    habitaciones: 0,
    banos: 0,
    area: 0,
    direccion: '',
    codigoPostal: '',
    copropiedad: 1,
    estado: 'Disponible',
    pisos: 1
  });

  const handleFormChange = (newData: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Agregar Nueva Propiedad</h2>
      <Row>
        <Col xl={3}>
          <PropertyAddCard formData={formData} />
        </Col>
        <Col xl={9}>
          <FileUpload title="Agregar Foto de la Propiedad" />
          <PropertyAdd />
        </Col>
      </Row>
    </Container>
  )
}
