'use client'

import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Property, PropertyFilters as PropertyFilterType } from '@/types/property'
import Link from 'next/link'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// Componente de filtros para la búsqueda de propiedades
const PropertyFilterComponent = ({ filters, onFilterChange }: { 
  filters: PropertyFilterType, 
  onFilterChange: (filters: PropertyFilterType) => void 
}) => {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-3">Filtrar propiedades</h5>
        <Row className="g-2">
          <Col md={3}>
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select 
                className="form-select" 
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              >
                <option value="">Todas las categorías</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Ático">Ático</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
          </Col>
          <Col md={3}>
            <div className="mb-3">
              <label className="form-label">Estado</label>
              <select 
                className="form-select"
                value={filters.estado || ''}
                onChange={(e) => onFilterChange({ ...filters, estado: e.target.value })}
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="reservada">Reservada</option>
                <option value="vendida">Vendida</option>
              </select>
            </div>
          </Col>
          <Col md={3}>
            <div className="mb-3">
              <label className="form-label">Precio mínimo</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="€" 
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="mb-3">
              <label className="form-label">Precio máximo</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="€" 
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </Col>
        </Row>
        <div className="text-end">
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => onFilterChange({})}
          >
            Limpiar
          </Button>
          <Button 
            variant="primary"
            onClick={() => onFilterChange(filters)}
          >
            Aplicar filtros
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

// Formateador de precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Función para determinar la variante de estado
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

export default function PropertyListPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilterType>({});

  // Cargar filtros iniciales de los parámetros de búsqueda
  useEffect(() => {
    const initialFilters: PropertyFilterType = {};
    
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    if (category) {
      initialFilters.category = category;
    }
    
    if (query) {
      // Si hay un término de búsqueda, lo guardamos para el backend
      initialFilters.searchTerm = query;
    }
    
    setFilters(initialFilters);
  }, [searchParams]);

  // Cargar propiedades cuando cambian los filtros
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('properties')
          .select(`
            *,
            images:property_images!property_images_property_id_fkey(*)
          `)
          .order('created_at', { ascending: false });
          
        // Aplicar filtros
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.estado) {
          query = query.eq('estado', filters.estado);
        }
        
        if (filters.minPrice) {
          query = query.gte('total_price', filters.minPrice);
        }
        
        if (filters.maxPrice) {
          query = query.lte('total_price', filters.maxPrice);
        }
        
        // Si hay un término de búsqueda, buscamos en el nombre y descripción
        if (filters.searchTerm) {
          query = query.or(
            `name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,address.ilike.%${filters.searchTerm}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error al cargar propiedades:', error);
          return;
        }

        setProperties(data || []);
      } catch (error) {
        console.error('Error durante la carga de propiedades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [filters]);

  const handleFilterChange = (newFilters: PropertyFilterType) => {
    setFilters(newFilters);
  };

  return (
    <main>
      {/* Sección de cabecera */}
      <section 
        className="py-5 mb-5 bg-primary text-white" 
        style={{ 
          background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/images/real-estate/hero-bg.png) no-repeat center center',
          backgroundSize: 'cover',
          animation: 'zoomAnimation 20s infinite alternate',
          overflow: 'hidden'
        }}
      >
        <style jsx>{`
          @keyframes zoomAnimation {
            0% {
              background-size: 100%;
            }
            100% {
              background-size: 120%;
            }
          }
        `}</style>
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h1 className="display-4 fw-bold mb-3">Propiedades en Copropiedad</h1>
              <p className="lead">
                Descubre todas nuestras propiedades disponibles para inversión en copropiedad
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Filtros de propiedades */}
        <PropertyFilterComponent filters={filters} onFilterChange={handleFilterChange} />
        
        {/* Listado de propiedades */}
        <Row>
          {loading ? (
            <Col className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </Col>
          ) : properties.length === 0 ? (
            <Col className="text-center py-5">
              <div className="mb-4">
                <IconifyIcon icon="ri:search-line" width={48} height={48} className="text-muted" />
              </div>
              <h4>No se encontraron propiedades</h4>
              <p className="text-muted">
                Intenta ajustar los filtros de búsqueda o explorar otras opciones.
              </p>
            </Col>
          ) : (
            properties.map((property) => (
              <Col lg={4} md={6} className="mb-4" key={property.id}>
                <Card className="hover-effect border-0 shadow-sm rounded-lg overflow-hidden h-100">
                  <style jsx>{`
                    .hover-effect:hover img {
                      transform: scale(1.1);
                    }
                  `}</style>
                  <div className="position-relative">
                    <Link href={`/propiedades/detalles?id=${property.id}`} className="property-link">
                      <div style={{ height: '240px', overflow: 'hidden' }}>
                        <Image 
                          src={property.images?.[0]?.url || '/images/real-estate/placeholder.svg'}
                          alt={property.name}
                          width={500}
                          height={300}
                          className="img-fluid w-100 h-100"
                          style={{ 
                            "objectFit": 'cover', 
                            "transition": 'transform 0.5s ease' 
                          }}
                          priority={true}
                        />
                      </div>
                    </Link>
                    <span className="position-absolute top-0 end-0 p-3">
                      <span className={`badge bg-${getStatusVariant(property.estado)} text-white fs-13 rounded-pill px-3 py-2`}>
                        {property.estado}
                      </span>
                    </span>
                    <div className="position-absolute bottom-0 start-0 p-3">
                      <h3 className="text-white mb-0 fs-22 fw-semibold">{formatPrice(property.total_price)}</h3>
                    </div>
                  </div>
                  <Card.Body className="p-4">
                    <div>
                      <Link href={`/propiedades/detalles?id=${property.id}`} className="text-dark property-link">
                        <h5 className="mb-1 text-truncate">{property.name}</h5>
                      </Link>
                      <p className="text-muted mb-3">
                        <IconifyIcon icon="ri:map-pin-line" width={16} height={16} /> {property.address}
                      </p>
                      <div className="d-flex justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:hotel-bed-line" width={20} height={20} className="text-primary me-1" />
                          <span className="fs-14">{property.bedrooms} Dorm.</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:shower-line" width={20} height={20} className="text-primary me-1" />
                          <span className="fs-14">{property.bathrooms} Baños</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:ruler-2-line" width={20} height={20} className="text-primary me-1" />
                          <span className="fs-14">{property.square_feet} m²</span>
                        </div>
                      </div>
                      
                      <p className="mb-3 fs-13 text-muted">Precio por copropiedad:</p>
                      <Row className="g-2">
                        {[...Array(property.total_shares || 4)].map((_, index) => {
                          const shareNumber = index + 1;
                          const shareStatus = property[`share${shareNumber}_status` as keyof Property] as string;
                          const sharePrice = property[`share${shareNumber}_price` as keyof Property] as number;
                          
                          return (
                            <Col xs={6} key={index}>
                              <Link 
                                href={`/propiedades/detalles?id=${property.id}&share=${shareNumber}`}
                                className="text-decoration-none property-link"
                              >
                                <div 
                                  className={`p-2 rounded border h-100 ${
                                    shareStatus === 'vendida' ? 'bg-danger bg-opacity-10' :
                                    shareStatus === 'reservada' ? 'bg-warning bg-opacity-10' :
                                    'bg-success bg-opacity-10'
                                  }`}
                                >
                                  <div className="text-center">
                                    <small className="d-block text-muted mb-1">Copropiedad {shareNumber}</small>
                                    <span className="fw-semibold d-block mb-1">{formatPrice(sharePrice || 0)}</span>
                                    <small className={`d-block text-${getStatusVariant(shareStatus || 'disponible')}`}>
                                      {shareStatus || 'disponible'}
                                    </small>
                                  </div>
                                </div>
                              </Link>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </main>
  );
} 