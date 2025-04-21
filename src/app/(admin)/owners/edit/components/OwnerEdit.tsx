'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import PropertySelector from '../../add/components/PropertySelector'

interface OwnerFormData {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  dni: string
  direccion: string
  ciudad: string
  codigo_postal: string
  fecha_nacimiento: string
  ocupacion: string
  notas?: string
  property_id?: string | null
  share_number?: number | null
  purchase_price?: number | null
}

interface OwnerEditProps {
  ownerId: string
}

const validationSchema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido"),
  apellidos: yup.string().required("Los apellidos son requeridos"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  telefono: yup.string().required("El teléfono es requerido"),
  dni: yup.string().required("El DNI es requerido"),
  direccion: yup.string().required("La dirección es requerida"),
  ciudad: yup.string().required("La ciudad es requerida"),
  codigo_postal: yup.string().required("El código postal es requerido"),
  fecha_nacimiento: yup.string().required("La fecha de nacimiento es requerida"),
  ocupacion: yup.string().required("La ocupación es requerida"),
  notas: yup.string(),
  property_id: yup.string().nullable(),
  share_number: yup.number().nullable(),
  purchase_price: yup.number().nullable(),
});

const OwnerEdit = ({ ownerId }: OwnerEditProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OwnerFormData>({
    resolver: yupResolver(validationSchema)
  })

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const { data: owner, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', ownerId)
          .single()

        if (error) throw error

        if (owner) {
          // Set form values
          setValue('nombre', owner.nombre)
          setValue('apellidos', owner.apellidos)
          setValue('email', owner.email)
          setValue('telefono', owner.telefono)
          setValue('dni', owner.dni)
          setValue('direccion', owner.direccion)
          setValue('ciudad', owner.ciudad)
          setValue('codigo_postal', owner.codigo_postal)
          setValue('fecha_nacimiento', owner.fecha_nacimiento)
          setValue('ocupacion', owner.ocupacion)
          setValue('notas', owner.notas)
          setValue('property_id', owner.property_id)
          setValue('share_number', owner.share_number)
          setValue('purchase_price', owner.purchase_price)
        }
      } catch (error: any) {
        console.error('Error fetching owner:', error)
        toast.error('Error al cargar los datos del propietario')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchOwnerData()
  }, [ownerId, setValue])

  const onSubmit = async (data: OwnerFormData) => {
    setLoading(true)
    try {
      // Primero verificamos si la participación está disponible (si se está cambiando)
      if (data.property_id && data.share_number) {
        // Verificar si ya existe una asignación para esta participación
        const { data: existingShare, error: shareCheckError } = await supabase
          .from('property_shares_owners')
          .select('*')
          .eq('property_id', data.property_id)
          .eq('share_number', data.share_number)
          .neq('owner_id', ownerId)
          .single();

        if (shareCheckError && shareCheckError.code !== 'PGRST116') { // PGRST116 es el código cuando no se encuentra ningún registro
          throw shareCheckError;
        }

        if (existingShare) {
          toast.error('Esta participación ya está asignada a otro propietario');
          setLoading(false);
          return;
        }
      }

      // Actualizamos la información básica del propietario
      const { error: ownerError } = await supabase
        .from('owners')
        .update({
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          telefono: data.telefono,
          dni: data.dni,
          direccion: data.direccion,
          ciudad: data.ciudad,
          codigo_postal: data.codigo_postal,
          fecha_nacimiento: data.fecha_nacimiento,
          ocupacion: data.ocupacion,
          notas: data.notas
        })
        .eq('id', ownerId);

      if (ownerError) throw ownerError;

      // Manejamos la relación con la propiedad
      if (data.property_id && data.share_number) {
        // Primero obtenemos la relación actual
        const { data: currentRelation } = await supabase
          .from('property_shares_owners')
          .select('*')
          .eq('owner_id', ownerId)
          .single();

        if (currentRelation) {
          // Si ya existe una relación, la actualizamos
          const { error: updateRelationError } = await supabase
            .from('property_shares_owners')
            .update({
              property_id: data.property_id,
              share_number: data.share_number,
              purchase_price: data.purchase_price || 0
            })
            .eq('owner_id', ownerId);

          if (updateRelationError) throw updateRelationError;
        } else {
          // Si no existe una relación, la creamos
          const { error: insertRelationError } = await supabase
            .from('property_shares_owners')
            .insert([{
              owner_id: ownerId,
              property_id: data.property_id,
              share_number: data.share_number,
              purchase_price: data.purchase_price || 0
            }]);

          if (insertRelationError) throw insertRelationError;
        }
      } else {
        // Si no se seleccionó propiedad, eliminamos cualquier relación existente
        const { error: deleteRelationError } = await supabase
          .from('property_shares_owners')
          .delete()
          .eq('owner_id', ownerId);

        if (deleteRelationError) throw deleteRelationError;
      }

      toast.success('Propietario actualizado correctamente');
      router.push('/owners/list-view');
    } catch (error: any) {
      console.error('Error updating owner:', error);
      toast.error(error.message || 'Error al actualizar el propietario');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Cargando datos del propietario...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Información del Propietario</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Información Personal */}
            <Col lg={12}>
              <h5 className="mb-3">Información Personal</h5>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  {...register('nombre')}
                  isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  {...register('apellidos')}
                  isInvalid={!!errors.apellidos}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellidos?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  {...register('email')}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  {...register('telefono')}
                  isInvalid={!!errors.telefono}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.telefono?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  {...register('dni')}
                  isInvalid={!!errors.dni}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dni?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  {...register('fecha_nacimiento')}
                  isInvalid={!!errors.fecha_nacimiento}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha_nacimiento?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Dirección */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Dirección</h5>
            </Col>
            <Col lg={12}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  {...register('direccion')}
                  isInvalid={!!errors.direccion}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.direccion?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  type="text"
                  {...register('ciudad')}
                  isInvalid={!!errors.ciudad}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ciudad?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código Postal</Form.Label>
                <Form.Control
                  type="text"
                  {...register('codigo_postal')}
                  isInvalid={!!errors.codigo_postal}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codigo_postal?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Propiedad */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Propiedad Asociada</h5>
            </Col>
            <Col lg={12}>
              <PropertySelector 
                control={control} 
                setValue={setValue}
                currentOwnerId={ownerId} 
              />
            </Col>

            {/* Información Adicional */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Información Adicional</h5>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ocupación</Form.Label>
                <Form.Control
                  type="text"
                  {...register('ocupacion')}
                  isInvalid={!!errors.ocupacion}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ocupacion?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('notas')}
                  isInvalid={!!errors.notas}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.notas?.message}
                </Form.Control.Feedback>
              </Form.Group>
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

export default OwnerEdit 