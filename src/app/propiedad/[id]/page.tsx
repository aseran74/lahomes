'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Container, Row, Col, Button } from 'reactstrap';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import { getPropertyById } from '@/services/propertyService';
import PublicLayout from '@/components/layout/PublicLayout';

interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyId = params.id as string;
        // Aquí deberíamos obtener la propiedad desde el servicio
        // const data = await getPropertyById(propertyId);
        
        // Por ahora usamos datos de ejemplo
        const mockProperty = {
          id: parseInt(propertyId),
          title: 'Apartamento moderno en el centro',
          address: 'Calle Principal 123, Bogotá',
          price: 350000000,
          description: 'Hermoso apartamento con vista panorámica, ubicado en una zona estratégica con acceso a todos los servicios.',
          features: ['Piscina', 'Gimnasio', 'Seguridad 24/7', 'Estacionamiento'],
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8'
          ],
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          status: 'Disponible'
        };
        
        setProperty(mockProperty);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la propiedad:', error);
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return (
      <PublicLayout>
        <Container className="mt-5">
          <div className="text-center">
            <p>Cargando información de la propiedad...</p>
          </div>
        </Container>
      </PublicLayout>
    );
  }

  if (!property) {
    return (
      <PublicLayout>
        <Container className="mt-5">
          <div className="text-center">
            <h2>Propiedad no encontrada</h2>
            <Button color="primary" onClick={() => router.push('/')}>
              Volver al inicio
            </Button>
          </div>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Container className="mt-4 mb-5">
        <Row>
          <Col lg={8}>
            <PropertyImageGallery images={property.images} />
            <Card className="mt-4">
              <CardBody>
                <h2>{property.title}</h2>
                <p className="text-muted">{property.address}</p>
                <h3 className="mt-4">Descripción</h3>
                <p>{property.description}</p>
                <h3 className="mt-4">Características</h3>
                <ul>
                  {property.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <CardBody>
                <h3 className="mb-4 text-primary">${property.price.toLocaleString()}</h3>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center">
                    <p className="mb-0">{property.bedrooms}</p>
                    <small>Habitaciones</small>
                  </div>
                  <div className="text-center">
                    <p className="mb-0">{property.bathrooms}</p>
                    <small>Baños</small>
                  </div>
                  <div className="text-center">
                    <p className="mb-0">{property.area} m²</p>
                    <small>Área</small>
                  </div>
                </div>
                <div className="mt-4">
                  <Button color="success" block>
                    Contactar agente
                  </Button>
                  <Button color="outline-secondary" className="mt-2" block>
                    Agendar visita
                  </Button>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <p className="mb-1">
                    <strong>Estado:</strong> {property.status}
                  </p>
                  <p className="mb-1">
                    <strong>ID de propiedad:</strong> {property.id}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PublicLayout>
  );
} 