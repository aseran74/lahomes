'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'

interface OwnerFormData {
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
}

const OwnerAdd = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const validationSchema = yup.object({
    nombre: yup.string().required('Por favor ingrese el nombre'),
    apellidos: yup.string().required('Por favor ingrese los apellidos'),
    email: yup.string().email('Email inválido').required('Por favor ingrese el email'),
    telefono: yup.string().required('Por favor ingrese el número de teléfono'),
    dni: yup.string().required('Por favor ingrese el documento de identidad'),
    direccion: yup.string(),
    ciudad: yup.string(),
    codigo_postal: yup.string(),
    fecha_nacimiento: yup.string(),
    ocupacion: yup.string(),
    notas: yup.string()
  })

  const { handleSubmit, control } = useForm<OwnerFormData>({
    resolver: yupResolver(validationSchema)
  })

  const onSubmit = async (data: OwnerFormData) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('owners')
        .insert([
          {
            nombre: data.nombre,
            apellidos: data.apellidos,
            email: data.email,
            telefono: data.telefono,
            dni: data.dni,
            direccion: data.direccion || null,
            ciudad: data.ciudad || null,
            codigo_postal: data.codigo_postal || null,
            fecha_nacimiento: data.fecha_nacimiento || null,
            ocupacion: data.ocupacion || null,
            notas: data.notas || null
          }
        ])

      if (error) throw error

      toast.success('Propietario guardado exitosamente')
      router.push('/owners/list-view')
    } catch (error: any) {
      console.error('Error saving owner:', error)
      toast.error(error.message || 'Error al guardar el propietario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Información del Propietario</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Datos Personales */}
            <Col lg={12}>
              <h5 className="mb-3">Datos Personales</h5>
            </Col>
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
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="telefono" placeholder="Número de Teléfono" label="Teléfono" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="fecha_nacimiento" 
                  type="date"
                  label="Fecha de Nacimiento" 
                />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="ocupacion" placeholder="Ocupación o Profesión" label="Ocupación" />
              </div>
            </Col>

            {/* Dirección */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Dirección</h5>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextFormInput control={control} name="direccion" placeholder="Dirección Completa" label="Dirección" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="ciudad" placeholder="Ciudad" label="Ciudad" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="codigo_postal" placeholder="Código Postal" label="Código Postal" />
              </div>
            </Col>

            {/* Información Adicional */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Información Adicional</h5>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput
                  control={control}
                  name="notas"
                  label="Notas"
                  placeholder="Notas o comentarios adicionales"
                  rows={3}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button 
              type="submit" 
              variant="primary" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Col>
          <Col lg={2}>
            <Button 
              variant="danger" 
              className="w-100"
              onClick={() => router.push('/owners/list-view')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default OwnerAdd 