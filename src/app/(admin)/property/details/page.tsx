'use client'

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyDetails from './components/PropertyDetails';
import AgentDetails from './components/AgentDetails';
import GoogleMap from '@/components/GoogleMap';
import PageTitle from '@/components/PageTitle';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types/property';
import { toast } from 'react-hot-toast';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const selectedShare = searchParams.get('share') ? parseInt(searchParams.get('share')!) : undefined;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProperty = async (id: string) => {
    try {
      console.log('Cargando propiedad con ID:', id);
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:agents!properties_agent_id_fkey(*),
          images:property_images!property_images_property_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error en la consulta:', error);
        console.error('Error detallado al cargar la propiedad:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No se encontraron datos para la propiedad:', id);
        throw new Error('No se encontró la propiedad');
      }

      console.log('Datos de la propiedad cargados:', data);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar la propiedad');
      toast.error('Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialProperty = async () => {
      try {
        if (!propertyId) {
          console.log('No hay ID de propiedad, buscando la última propiedad...');
          const { data: firstProperty, error: firstPropertyError } = await supabase
            .from('properties')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (firstPropertyError) {
            console.error('Error al buscar la primera propiedad:', firstPropertyError);
            throw firstPropertyError;
          }
          
          if (firstProperty) {
            console.log('Redirigiendo a la última propiedad:', firstProperty.id);
            router.push(`/property/details?id=${firstProperty.id}`);
            return;
          }
        } else {
          console.log('Cargando propiedad específica:', propertyId);
          await loadProperty(propertyId);
        }
      } catch (error) {
        console.error('Error in initial load:', error);
        setError('Error al cargar la propiedad');
        toast.error('Error al cargar la propiedad');
      }
    };

    loadInitialProperty();

    // Suscribirse a cambios en la propiedad
    if (propertyId) {
      console.log('Configurando suscripciones para la propiedad:', propertyId);
      
      const propertySubscription = supabase
        .channel(`property_${propertyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${propertyId}`
        }, (payload) => {
          console.log('Cambio detectado en properties:', payload);
          loadProperty(propertyId);
        })
        .subscribe();

      // Suscribirse a cambios en las imágenes
      const imagesSubscription = supabase
        .channel(`property_images_${propertyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'property_images',
          filter: `property_id=eq.${propertyId}`
        }, (payload) => {
          console.log('Cambio detectado en images:', payload);
          loadProperty(propertyId);
        })
        .subscribe();

      // Suscribirse a cambios en las shares
      const sharesSubscription = supabase
        .channel(`property_shares_${propertyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'property_shares',
          filter: `property_id=eq.${propertyId}`
        }, (payload) => {
          console.log('Cambio detectado en shares:', payload);
          loadProperty(propertyId);
        })
        .subscribe();

      return () => {
        console.log('Limpiando suscripciones');
        propertySubscription.unsubscribe();
        imagesSubscription.unsubscribe();
        sharesSubscription.unsubscribe();
      };
    }
  }, [propertyId, router]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (data: any) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', propertyId);

      if (error) throw error;

      toast.success('Propiedad actualizada correctamente');
      setIsEditing(false);
      loadProperty(propertyId!);
    } catch (error) {
      console.error('Error al actualizar la propiedad:', error);
      toast.error('Error al actualizar la propiedad');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (propertyId) {
      loadProperty(propertyId);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container>
        <div className="text-center p-5">
          <p className="text-danger">{error || 'No se encontró la propiedad'}</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <PageTitle title={property.name} subName="Detalles de la Propiedad" />
      <Container>
        <Row>
          <Col xl={8}>
            <PropertyDetails 
              property={property} 
              selectedShare={selectedShare}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
            <Card className="mt-4">
              <Card.Body>
                <h4 className="mb-4">Ubicación</h4>
                <GoogleMap
                  address={`${property.address}, ${property.city}, ${property.state}`}
                  zoom={16}
                  height={400}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4}>
            <AgentDetails propertyId={property.id} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
