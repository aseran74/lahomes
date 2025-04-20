'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SelectFormInput from '@/components/from/SelectFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import { Control } from 'react-hook-form'
import { Col, Row } from 'react-bootstrap'
import { toast } from 'react-hot-toast'

interface Property {
  id: string
  name: string
}

interface PropertySelectProps {
  control: Control<any>
}

const PropertySelect = ({ control }: PropertySelectProps) => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name')
          .eq('estado', 'disponible')

        if (error) throw error

        setProperties(data || [])
      } catch (error) {
        console.error('Error loading properties:', error)
        toast.error('Error al cargar las copropiedades')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  return (
    <Row>
      <Col lg={12}>
        <h5 className="mb-3">Información de la Copropiedad</h5>
      </Col>
      <Col lg={8}>
        <div className="mb-3">
          <SelectFormInput
            control={control}
            name="property_id"
            label="Copropiedad"
            options={[
              { value: "", label: "Seleccione copropiedad" },
              ...properties.map(prop => ({
                value: prop.id,
                label: prop.name
              }))
            ]}
            placeholder="Seleccione copropiedad"
            className="form-control"
            isDisabled={loading}
          />
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <TextFormInput 
            control={control} 
            name="porcentaje_propiedad" 
            type="number"
            placeholder="Ej: 25" 
            label="% Participación" 
          />
        </div>
      </Col>
    </Row>
  )
}

export default PropertySelect 