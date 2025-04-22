'use client'

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Formateador de precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

interface PropertyDetails {
  id: string;
  name: string;
  description: string;
  total_price: number;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  features: string[];
  amenities: string[];
  images: {
    id: string;
    url: string;
    is_main: boolean;
  }[];
  agent: {
    id: string;
    name: string;
    email: string;
  } | null;
  share1_status: string;
  share2_status: string;
  share3_status: string;
  share4_status: string;
  share1_price: number;
  share2_price: number;
  share3_price: number;
  share4_price: number;
  total_shares: number;
}

const PropertyDetailsPage = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) {
        setError('ID de propiedad no proporcionado');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch property details
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images!property_images_property_id_fkey(*),
            agent:agents (
              id, 
              name, 
              email
            )
          `)
          .eq('id', propertyId)
          .single();
          
        if (error) throw error;
        
        setProperty(data);
        console.log('Property details:', data);
      } catch (err: any) {
        console.error('Error fetching property details:', err);
        setError(err.message || 'Error al cargar los detalles de la propiedad');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [propertyId]);
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="my-5">
        <Card className="p-4 text-center">
          <Card.Body>
            <h3>Error</h3>
            <p>{error}</p>
            <Link href="/">
              <Button variant="primary">Volver al inicio</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  if (!property) {
    return (
      <Container className="my-5">
        <Card className="p-4 text-center">
          <Card.Body>
            <h3>Propiedad no encontrada</h3>
            <p>No se ha podido encontrar la propiedad solicitada.</p>
            <Link href="/">
              <Button variant="primary">Volver al inicio</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Función para obtener la variante del estado
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

  // Obtener las shares
  const shares = [
    { share_number: 1, estado: property.share1_status, price: property.share1_price },
    { share_number: 2, estado: property.share2_status, price: property.share2_price },
    { share_number: 3, estado: property.share3_status, price: property.share3_price },
    { share_number: 4, estado: property.share4_status, price: property.share4_price }
  ];
  
  // Implementación simple de galería de imágenes
  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <Container className="my-5">
      <Row>
        <Col md="8">
          {property.images && property.images.length > 0 ? (
            <div className="position-relative mb-4">
              <Image 
                src={property.images[activeImageIndex].url}
                alt={property.name}
                width={800}
                height={500}
                className="img-fluid rounded"
                style={{ objectFit: 'cover', width: '100%', height: '500px' }}
              />
              {property.images.length > 1 && (
                <>
                  <Button 
                    variant="light" 
                    className="position-absolute top-50 start-0 translate-middle-y mx-2"
                    onClick={handlePrevImage}
                  >
                    <IconifyIcon icon="ri:arrow-left-s-line" width={24} />
                  </Button>
                  <Button 
                    variant="light" 
                    className="position-absolute top-50 end-0 translate-middle-y mx-2"
                    onClick={handleNextImage}
                  >
                    <IconifyIcon icon="ri:arrow-right-s-line" width={24} />
                  </Button>
                </>
              )}
              <div className="d-flex mt-2 gap-2">
                {property.images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`cursor-pointer ${index === activeImageIndex ? 'border border-primary' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    style={{ width: '80px', height: '60px' }}
                  >
                    <Image 
                      src={image.url}
                      alt={`Miniatura ${index + 1}`}
                      width={80}
                      height={60}
                      className="img-fluid"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-light d-flex justify-content-center align-items-center rounded" style={{ height: '400px' }}>
              <IconifyIcon icon="ri:image-line" width={64} height={64} className="text-muted" />
            </div>
          )}
        </Col>
        
        <Col md="4">
          <Card className="mb-4">
            <Card.Body>
              <h1 className="h3 mb-2">{property.name}</h1>
              <p className="text-muted mb-3">
                <IconifyIcon icon="ri:map-pin-line" width={18} /> 
                <span className="ms-1">{property.address}, {property.city}</span>
              </p>
              
              <h2 className="h4 mb-3">{formatPrice(property.total_price)}</h2>
              
              <div className="d-flex justify-content-between mb-4">
                <div className="text-center">
                  <IconifyIcon icon="ri:hotel-bed-line" width={24} className="mb-1" />
                  <p className="mb-0">{property.bedrooms} hab.</p>
                </div>
                <div className="text-center">
                  <IconifyIcon icon="ri:shower-line" width={24} className="mb-1" />
                  <p className="mb-0">{property.bathrooms} baños</p>
                </div>
                <div className="text-center">
                  <IconifyIcon icon="ri:ruler-2-line" width={24} className="mb-1" />
                  <p className="mb-0">{property.square_feet} m²</p>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">Opciones de Copropiedad</h4>
              <Row className="g-2">
                {shares.map((share) => (
                  <Col xs={6} key={share.share_number}>
                    <div 
                      className={`p-2 rounded border h-100 ${
                        share.estado === 'vendida' ? 'bg-danger bg-opacity-10' :
                        share.estado === 'reservada' ? 'bg-warning bg-opacity-10' :
                        'bg-success bg-opacity-10'
                      }`}
                    >
                      <div className="text-center">
                        <small className="d-block text-muted mb-1">Copropiedad {share.share_number}</small>
                        <span className="fw-semibold d-block mb-1">{formatPrice(share.price)}</span>
                        <small className={`d-block text-${getStatusVariant(share.estado)}`}>
                          {share.estado}
                        </small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              
              <Link href="/auth/sign-in" className="mt-3 btn btn-primary w-100">
                Iniciar sesión para invertir
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md="8">
          <Card>
            <Card.Body>
              <h3 className="mb-3">Descripción</h3>
              <p>{property.description}</p>
            </Card.Body>
          </Card>
          
          {property.features && property.features.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <h3 className="mb-3">Características</h3>
                <Row>
                  {property.features.map((feature, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon="ri:check-line" width={20} className="text-success me-2" />
                        <span>{feature}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
          
          {property.amenities && property.amenities.length > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <h3 className="mb-3">Comodidades</h3>
                <Row>
                  {property.amenities.map((amenity, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon="ri:check-line" width={20} className="text-success me-2" />
                        <span>{amenity}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md="4">
          {property.agent && (
            <Card>
              <Card.Body>
                <h4 className="mb-3">Información del agente</h4>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '50px', height: '50px' }}>
                    <IconifyIcon icon="ri:user-3-line" width={30} />
                  </div>
                  <div>
                    <h5 className="mb-1">{property.agent.name}</h5>
                    <p className="text-muted mb-0">Agente inmobiliario</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="mb-2">
                    <IconifyIcon icon="ri:mail-line" width={18} className="me-2" />
                    <span>{property.agent.email}</span>
                  </p>
                </div>
                
                <Link href="/auth/sign-in" className="btn btn-outline-primary w-100">
                  Contactar al agente
                </Link>
              </Card.Body>
            </Card>
          )}
          
          <Card className="mt-4 bg-light">
            <Card.Body>
              <h4 className="mb-3">¿Cómo funciona la copropiedad?</h4>
              <p>Al invertir en una participación, te conviertes en copropietario del inmueble y obtienes beneficios proporcionales a tu inversión.</p>
              <ul className="mb-0">
                <li className="mb-2">Invierte desde pequeñas cantidades</li>
                <li className="mb-2">Recibe ingresos pasivos mensuales</li>
                <li className="mb-2">Diversifica tu cartera inmobiliaria</li>
                <li>Sin preocupaciones de gestión</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyDetailsPage; 