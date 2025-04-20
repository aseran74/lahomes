'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { supabase, getProperties } from '@/lib/supabase'
import { Property, PropertyFilters } from '@/types/property'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const getStatusVariant = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'vendida':
      return 'danger';
    case 'disponible':
      return 'success';
    default:
      return 'warning';
  }
};

interface PropertyCardProps extends Property {}

const PropertiesCard = ({ 
  bathrooms, 
  bedrooms, 
  square_feet, 
  category,
  id, 
  address, 
  name, 
  total_price, 
  estado, 
  total_shares,
  images = [],
  share1_status,
  share2_status,
  share3_status,
  share4_status,
  share1_price,
  share2_price,
  share3_price,
  share4_price,
  toilets = 0
}: PropertyCardProps) => {
  const defaultImage = '/images/real-estate/placeholder.svg';
  
  // Función para obtener la URL de la imagen
  const getImageUrl = (url: string) => {
    if (!url) return defaultImage;
    return url;
  };

  const [imgSrc, setImgSrc] = useState(() => {
    const mainImage = images.find(img => img.is_main);
    return mainImage ? getImageUrl(mainImage.url) : 
           images[0]?.url ? getImageUrl(images[0].url) : 
           defaultImage;
  });

  // Crear array de shares basado en los estados y precios individuales
  const shares = [
    { share_number: 1, estado: share1_status, price: share1_price },
    { share_number: 2, estado: share2_status, price: share2_price },
    { share_number: 3, estado: share3_status, price: share3_price },
    { share_number: 4, estado: share4_status, price: share4_price }
  ];
  
  return (
    <Card className="overflow-hidden">
      <div className="position-relative">
        <Link href={`/property/details?id=${id}`}>
          <Image 
            src={imgSrc}
            alt={name}
            className="img-fluid rounded-top" 
            width={500}
            height={300}
            style={{ objectFit: 'cover' }}
            priority={true}
            onError={() => setImgSrc(defaultImage)}
          />
        </Link>
        <span className="position-absolute top-0 end-0 p-1">
          <span className={`badge bg-${getStatusVariant(estado)} text-white fs-13`}>
            {estado}
          </span>
        </span>
      </div>
      <CardBody>
        <div className="d-flex align-items-center gap-2">
          <div className="avatar bg-light rounded flex-centered">
            <IconifyIcon 
              icon={category === 'Ático' ? 'solar:home-2-bold' : 'solar:home-angle-bold'} 
              width={24} 
              height={24} 
              className="fs-24 text-primary" 
            />
          </div>
          <div>
            <Link href={`/property/details?id=${id}`} className="text-dark fw-medium fs-16">
              {name}
            </Link>
            <p className="text-muted mb-0">{address}</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-muted mb-2 fs-13">
            Precio Total: <span className="text-dark fw-medium fs-16">{formatPrice(total_price)}</span>
          </p>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-center">
              <IconifyIcon icon="solar:bed-bold-duotone" className="fs-24 text-primary mb-1" />
              <p className="mb-0 fs-13">{bedrooms || 0} Dorm.</p>
            </div>
            <div className="text-center">
              <IconifyIcon icon="solar:bath-bold-duotone" className="fs-24 text-primary mb-1" />
              <p className="mb-0 fs-13">{bathrooms || 0} Baños</p>
            </div>
            <div className="text-center">
              <IconifyIcon icon="solar:ruler-pen-bold-duotone" className="fs-24 text-primary mb-1" />
              <p className="mb-0 fs-13">{square_feet || 0}m²</p>
            </div>
          </div>
          <div className="border rounded p-2">
            <Row className="g-2">
              {[...Array(total_shares || 4)].map((_, index) => {
                const share = shares[index];
                return (
                  <Col xs={6} key={index}>
                    <Link 
                      href={`/property/details?id=${id}&share=${share.share_number}`}
                      className="text-decoration-none"
                    >
                      <div 
                        className={`p-2 rounded border h-100 ${
                          share.estado === 'vendida' ? 'bg-danger bg-opacity-10' :
                          share.estado === 'reservada' ? 'bg-warning bg-opacity-10' :
                          'bg-success bg-opacity-10'
                        }`}
                      >
                        <div className="text-center">
                          <small className="d-block text-muted mb-1">Copropiedad {share.share_number}</small>
                          <span className="fw-medium d-block mb-1">{formatPrice(share.price || 0)}</span>
                          <small className={`d-block text-${getStatusVariant(share.estado || 'disponible')}`}>
                            {share.estado || 'disponible'}
                          </small>
                        </div>
                      </div>
                    </Link>
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

interface PropertiesDataProps {
  filters: PropertyFilters;
}

export default function PropertiesData({ filters }: PropertiesDataProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('Cargando propiedades con filtros:', filters);
      
      // Primero obtenemos las propiedades
      let query = supabase
        .from('properties')
        .select(`
          *,
          agent:agents (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros si existen
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('estado', filters.status);
      }
      if (filters.minPrice) {
        query = query.gte('total_price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('total_price', filters.maxPrice);
      }

      const { data: propertiesData, error: propertiesError } = await query;

      if (propertiesError) {
        console.error('Error al cargar propiedades:', propertiesError);
        return;
      }

      // Luego obtenemos las imágenes para cada propiedad
      const propertiesWithImages = await Promise.all(propertiesData.map(async (property) => {
        const { data: imagesData } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', property.id);

        return {
          ...property,
          images: imagesData || [],
          total_shares: property.total_shares || 4,
          share1_status: property.share1_status || 'disponible',
          share2_status: property.share2_status || 'disponible',
          share3_status: property.share3_status || 'disponible',
          share4_status: property.share4_status || 'disponible',
          share1_price: property.share1_price || (property.total_price ? property.total_price / 4 : 0),
          share2_price: property.share2_price || (property.total_price ? property.total_price / 4 : 0),
          share3_price: property.share3_price || (property.total_price ? property.total_price / 4 : 0),
          share4_price: property.share4_price || (property.total_price ? property.total_price / 4 : 0),
        };
      }));

      console.log('Propiedades cargadas con imágenes:', propertiesWithImages);
      setProperties(propertiesWithImages);
    } catch (error) {
      console.error('Error técnico al cargar propiedades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();

    // Crear un canal único para este componente
    const channel = supabase.channel('grid-changes');

    // Suscribirse a cambios en propiedades
    channel
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        }, 
        (payload) => {
          console.log('Cambio detectado en propiedades:', payload);
          loadProperties();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_images'
        },
        (payload) => {
          console.log('Cambio detectado en imágenes:', payload);
          loadProperties();
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
      });

    // Limpiar suscripción
    return () => {
      channel.unsubscribe();
    };
  }, [filters]); // Se ejecuta cuando cambian los filtros

  return (
    <Col xl={9} lg={12}>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <Row>
          {properties.map((item) => (
            <Col lg={4} md={6} key={item.id}>
              <PropertiesCard {...item} />
            </Col>
          ))}
          {properties.length === 0 && (
            <Col>
              <div className="text-center py-4">
                <p className="text-muted mb-0">No se encontraron propiedades</p>
              </div>
            </Col>
          )}
        </Row>
      )}
    </Col>
  );
}
