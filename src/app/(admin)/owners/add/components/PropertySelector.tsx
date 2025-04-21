'use client'

import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { supabase } from '@/lib/supabase'
import { Control, Controller, UseFormSetValue } from 'react-hook-form'

interface Property {
  id: string
  name: string
  share1_status: string
  share2_status: string
  share3_status: string
  share4_status: string
  share1_price: number
  share2_price: number
  share3_price: number
  share4_price: number
}

interface Share {
  number: number
  status: string
  price: number
}

export interface PropertySelectorProps {
  control: Control<any>
  setValue: UseFormSetValue<any>
  currentOwnerId?: string
}

const PropertySelector = ({ control, setValue, currentOwnerId }: PropertySelectorProps) => {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, name, share1_status, share2_status, share3_status, share4_status, share1_price, share2_price, share3_price, share4_price')
          
        if (error) throw error
        
        setProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  useEffect(() => {
    const loadExistingRelation = async () => {
      if (!currentOwnerId) return

      try {
        const { data, error } = await supabase
          .from('property_shares_owners')
          .select('property_id, share_number, purchase_price')
          .eq('owner_id', currentOwnerId)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') { // No data found error
            console.error('Error loading property relation:', error)
          }
          return
        }

        if (data) {
          setValue('property_id', data.property_id)
          setValue('share_number', data.share_number)
          setValue('purchase_price', data.purchase_price)
          
          // Actualizar el estado local
          const property = properties.find(p => p.id === data.property_id)
          if (property) {
            setSelectedProperty(property)
            handleShareChange(data.share_number)
          }
        }
      } catch (error) {
        console.error('Error loading property relation:', error)
      }
    }

    loadExistingRelation()
  }, [currentOwnerId, properties, setValue])

  useEffect(() => {
    if (selectedProperty) {
      const newShares: Share[] = []
      for (let i = 1; i <= 4; i++) {
        const status = selectedProperty[`share${i}_status` as keyof Property] as string
        const price = selectedProperty[`share${i}_price` as keyof Property] as number
        newShares.push({ number: i, status, price })
      }
      setShares(newShares)
    } else {
      setShares([])
    }
  }, [selectedProperty])

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    setSelectedProperty(property || null)
    setValue('share_number', '') // Reset share selection
    setValue('purchase_price', '') // Reset purchase price
  }

  const handleShareChange = (shareNumber: number) => {
    if (selectedProperty) {
      const price = selectedProperty[`share${shareNumber}_price` as keyof Property]
      setValue('purchase_price', price)
    }
  }

  const getShareStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'text-success'
      case 'vendida':
        return 'text-danger'
      case 'reservada':
        return 'text-warning'
      default:
        return ''
    }
  }

  if (loading) return <div>Cargando propiedades...</div>

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Propiedad</Form.Label>
        <Controller
          name="property_id"
          control={control}
          render={({ field }) => (
            <Form.Select
              {...field}
              onChange={(e) => {
                field.onChange(e)
                handlePropertyChange(e.target.value)
              }}
            >
              <option value="">Seleccionar propiedad</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Form.Select>
          )}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Número de Copropiedad</Form.Label>
        <Controller
          name="share_number"
          control={control}
          render={({ field }) => (
            <Form.Select
              {...field}
              onChange={(e) => {
                field.onChange(e)
                handleShareChange(Number(e.target.value))
              }}
              disabled={!selectedProperty}
            >
              <option value="">Seleccionar número de copropiedad</option>
              {shares.map((share) => (
                <option 
                  key={share.number} 
                  value={share.number}
                  className={getShareStatusColor(share.status)}
                  disabled={share.status !== 'vendida'}
                >
                  Copropiedad #{share.number} - {share.price}€ ({share.status})
                </option>
              ))}
            </Form.Select>
          )}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Precio de Compra</Form.Label>
        <Controller
          name="purchase_price"
          control={control}
          render={({ field }) => (
            <Form.Control
              type="number"
              {...field}
              placeholder="Precio de compra"
              readOnly
            />
          )}
        />
      </Form.Group>
    </>
  )
}

export default PropertySelector 