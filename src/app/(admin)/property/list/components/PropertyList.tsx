'use client'

import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import Link from 'next/link';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { supabase, type Property, deleteProperty } from '@/lib/supabase';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const DEFAULT_IMAGE = '/images/real-estate/placeholder.svg';

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'disponible':
      return 'success';
    case 'vendida':
      return 'danger';
    case 'reservada':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images!property_images_property_id_fkey(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProperties(data || []);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(propertyId);
    try {
      const success = await deleteProperty(propertyId);
      if (success) {
        setProperties(properties.filter(p => p.id !== propertyId));
        toast.success('Propiedad eliminada con éxito');
      } else {
        toast.error('Error al eliminar la propiedad');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error al eliminar la propiedad');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="header-title">Lista de Propiedades</h4>
        <Link href="/property/add" passHref>
          <Button variant="primary">
            <IconifyIcon icon="mdi:plus" className="me-1" />
            Añadir Propiedad
          </Button>
        </Link>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table className="table-centered mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const mainImage = property.images?.find(img => img.is_main)?.url || 
                                property.images?.[0]?.url || 
                                DEFAULT_IMAGE;

                return (
                  <tr key={property.id}>
                    <td>{property.id}</td>
                    <td>
                      <Image
                        src={mainImage}
                        alt={property.name}
                        width={80}
                        height={60}
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_IMAGE;
                        }}
                      />
                    </td>
                    <td>{property.name}</td>
                    <td>
                      {property.address}, {property.city}
                    </td>
                    <td>{formatPrice(property.total_price)}</td>
                    <td>
                      <Badge bg={getStatusVariant(property.estado)}>
                        {property.estado}
                      </Badge>
                    </td>
                    <td>
                      <Link 
                        href={`/property/details?id=${property.id}`}
                        className="btn btn-sm btn-info me-2"
                      >
                        <IconifyIcon icon="mdi:eye" className="me-1" />
                        Ver
                      </Link>
                      <Link 
                        href={`/property/details?id=${property.id}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        <IconifyIcon icon="mdi:pencil" className="me-1" />
                        Editar
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        disabled={deleting === property.id}
                      >
                        {deleting === property.id ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Eliminando...</span>
                          </div>
                        ) : (
                          <IconifyIcon icon="mdi:delete" />
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PropertyList;
