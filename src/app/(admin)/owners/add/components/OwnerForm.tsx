'use client'

import TextFormInput from '@/components/from/TextFormInput'
import { Control } from 'react-hook-form'
import { Col, Row } from 'react-bootstrap'

interface OwnerFormProps {
  control: Control<any>
}

const OwnerForm = ({ control }: OwnerFormProps) => {
  return (
    <Row>
      <Col lg={6}>
        <div className="mb-3">
          <TextFormInput control={control} name="nombre" placeholder="Nombre" label="Nombre" />
        </div>
      </Col>
      <Col lg={6}>
        <div className="mb-3">
          <TextFormInput control={control} name="apellidos" placeholder="Apellidos" label="Apellidos" />
        </div>
      </Col>
      <Col lg={6}>
        <div className="mb-3">
          <TextFormInput control={control} name="email" placeholder="Correo Electrónico" label="Email" />
        </div>
      </Col>
      <Col lg={6}>
        <div className="mb-3">
          <TextFormInput control={control} name="dni" placeholder="DNI/NIE/Pasaporte" label="Documento de Identidad" />
        </div>
      </Col>
      <Col lg={12}>
        <div className="mb-3">
          <TextFormInput control={control} name="telefono" placeholder="Número de Teléfono" label="Teléfono" />
        </div>
      </Col>
    </Row>
  )
}

export default OwnerForm 