'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { uploadAgentImage } from '@/lib/supabase'
import Image from 'next/image'

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience_years: number;
  rating: number;
  properties_count: number;
  linkedin_url: string;
  instagram_url: string;
  whatsapp: string;
  description: string;
  city: string;
  postal_code: string;
  photo_url: string;
  created_at?: string;
  updated_at?: string;
}

interface PageProps {
  params: {
    id: string
  }
}

export default function EditAgentPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Agent>({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience_years: 0,
    rating: 0,
    properties_count: 0,
    linkedin_url: '',
    instagram_url: '',
    whatsapp: '',
    description: '',
    city: '',
    postal_code: '',
    photo_url: ''
  })

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const { data: agent, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        setFormData(agent)
      } catch (error) {
        console.error('Error loading agent:', error)
        toast.error('Error al cargar los datos del agente')
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          experience_years: formData.experience_years,
          rating: formData.rating,
          linkedin_url: formData.linkedin_url,
          instagram_url: formData.instagram_url,
          whatsapp: formData.whatsapp,
          description: formData.description,
          city: formData.city,
          postal_code: formData.postal_code,
          photo_url: formData.photo_url
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Agente actualizado exitosamente')
      router.push(`/agents/details/${params.id}`)
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error('Error al actualizar el agente')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      const { data, error } = await uploadAgentImage({ file, agentId: params.id })

      if (error) throw error
      // INSERT_YOUR_REWRITE_HERE
        .update({ photo_url: newPhotoUrl })
        .eq('id', params.id)

      if (updateError) throw updateError

      toast.success('Imagen actualizada exitosamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Editar Agente</h4>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Imagen del agente */}
          <div className="text-center mb-4">
            {formData.photo_url ? (
              <div className="position-relative d-inline-block">
                <Image
                  src={formData.photo_url}
                  alt={formData.name}
                  width={150}
                  height={150}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div 
                className="avatar-lg mx-auto rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ width: '150px', height: '150px', fontSize: '3rem' }}
              >
                {formData.name.charAt(0)}
              </div>
            )}
            <div className="mt-3">
              <Form.Group>
                <Form.Label className="btn btn-outline-primary mb-0">
                  {uploading ? 'Subiendo...' : 'Cambiar Imagen'}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </Form.Label>
              </Form.Group>
            </div>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>WhatsApp</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Especialidad</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Años de Experiencia</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código Postal</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>URL de LinkedIn</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>URL de Instagram</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Calificación</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>URL de la Foto</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => router.push(`/agents/details/${params.id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
} 