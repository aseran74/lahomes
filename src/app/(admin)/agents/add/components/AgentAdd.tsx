'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import TextFormInput from '@/components/from/TextFormInput'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import Image from 'next/image'

interface AgentFormData {
  name: string
  email: string
  phone?: string
  specialty?: string
  experience_years?: number
  rating?: number
  properties_count?: number
  linkedin_url?: string
  instagram_url?: string
  whatsapp?: string
  description?: string
  city?: string
  postal_code?: string
}

const AgentAdd = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validationSchema = yup.object({
    name: yup.string().required('Por favor ingrese el nombre'),
    email: yup.string().email('Email inválido').required('Por favor ingrese el email'),
    phone: yup.string(),
    specialty: yup.string(),
    experience_years: yup.number().positive('Los años de experiencia deben ser positivos'),
    rating: yup.number().min(0, 'La calificación debe ser entre 0 y 5').max(5, 'La calificación debe ser entre 0 y 5'),
    properties_count: yup.number().min(0, 'El número de propiedades debe ser positivo'),
    linkedin_url: yup.string().url('URL de LinkedIn inválida'),
    instagram_url: yup.string().url('URL de Instagram inválida'),
    whatsapp: yup.string(),
    description: yup.string(),
    city: yup.string(),
    postal_code: yup.string()
  })

  const { handleSubmit, control } = useForm<AgentFormData>({
    resolver: yupResolver(validationSchema)
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (agentId: string): Promise<string | null> => {
    if (!selectedFile) return null

    try {
      setUploading(true)
      
      // Generar nombre único para el archivo
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${agentId}-${Date.now()}.${fileExt}`
      
      // Subir archivo al bucket
      const { error: uploadError } = await supabase.storage
        .from('agent-images')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('agent-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error al subir la imagen:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: AgentFormData) => {
    setLoading(true)
    try {
      // Insertar agente primero para obtener el ID
      const { data: newAgent, error: insertError } = await supabase
        .from('agents')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          specialty: data.specialty || null,
          experience_years: data.experience_years || null,
          rating: data.rating || null,
          properties_count: data.properties_count || null,
          linkedin_url: data.linkedin_url || null,
          instagram_url: data.instagram_url || null,
          whatsapp: data.whatsapp || null,
          description: data.description || null,
          city: data.city || null,
          postal_code: data.postal_code || null
        }])
        .select()

      if (insertError) throw insertError

      // Si hay una imagen seleccionada, subirla
      if (selectedFile && newAgent?.[0]?.id) {
        const photoUrl = await uploadImage(newAgent[0].id)
        
        // Actualizar el agente con la URL de la foto
        if (photoUrl) {
          const { error: updateError } = await supabase
            .from('agents')
            .update({ photo_url: photoUrl })
            .eq('id', newAgent[0].id)

          if (updateError) throw updateError
        }
      }

      toast.success('Agente guardado exitosamente')
      router.push('/agents/list-view')
    } catch (error: any) {
      console.error('Error saving agent:', error)
      toast.error(error.message || 'Error al guardar el agente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Información del Agente</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Foto */}
            <Col lg={12}>
              <h5 className="mb-3">Foto del Agente</h5>
              <div className="text-center mb-4">
                {previewImage ? (
                  <div className="position-relative d-inline-block">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      width={150}
                      height={150}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div 
                    className="avatar-lg mx-auto rounded-circle bg-light text-muted d-flex align-items-center justify-content-center"
                    style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                  >
                    <i className="ri-user-add-line"></i>
                  </div>
                )}
                <div className="mt-3">
                  <Form.Group>
                    <Form.Label className="btn btn-outline-primary mb-0">
                      {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                      />
                    </Form.Label>
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* Datos Personales */}
            <Col lg={12}>
              <h5 className="mb-3">Datos Personales</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="name" placeholder="Nombre" label="Nombre" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="email" placeholder="Correo Electrónico" label="Email" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="phone" placeholder="Teléfono" label="Teléfono" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="whatsapp" placeholder="WhatsApp" label="WhatsApp" />
              </div>
            </Col>

            {/* Información Profesional */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Información Profesional</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="specialty" placeholder="Especialidad" label="Especialidad" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="experience_years" 
                  type="number" 
                  placeholder="Años de Experiencia" 
                  label="Años de Experiencia" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="rating" 
                  type="number" 
                  step="0.1"
                  placeholder="Calificación (0-5)" 
                  label="Calificación" 
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput 
                  control={control} 
                  name="properties_count" 
                  type="number" 
                  placeholder="Número de Propiedades" 
                  label="Propiedades" 
                />
              </div>
            </Col>

            {/* Redes Sociales */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Redes Sociales</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="linkedin_url" placeholder="URL de LinkedIn" label="LinkedIn" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="instagram_url" placeholder="URL de Instagram" label="Instagram" />
              </div>
            </Col>

            {/* Ubicación y Descripción */}
            <Col lg={12}>
              <h5 className="mb-3 mt-4">Ubicación y Descripción</h5>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="city" placeholder="Ciudad" label="Ciudad" />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput control={control} name="postal_code" placeholder="Código Postal" label="Código Postal" />
              </div>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput 
                  control={control} 
                  name="description" 
                  placeholder="Descripción del agente" 
                  label="Descripción" 
                />
              </div>
            </Col>
          </Row>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="danger" 
              onClick={() => router.push('/agents/list-view')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading}
            >
              {loading ? 'Guardando...' : 'Guardar Agente'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  )
}

export default AgentAdd 