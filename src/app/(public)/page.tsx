'use client'

import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Property } from '@/types/property'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Añadir estilos para el grid de propiedades
const styles = {
  flexCentered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px'
  }
};

// Componente Hero
const HeroSection = () => {
  const [searchParams, setSearchParams] = useState({
    category: '',
    searchTerm: ''
  });
  const router = useRouter();

  const handleSearchParamChange = (field: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchParams.category && searchParams.category !== 'Todas las categorías') {
      queryParams.append('category', searchParams.category);
    }
    
    if (searchParams.searchTerm) {
      queryParams.append('query', searchParams.searchTerm);
    }
    
    router.push(`/propiedades/listado?${queryParams.toString()}`);
  };

  return (
    <section 
      className="position-relative d-flex align-items-center justify-content-center hero-section" 
      style={{ 
        minHeight: '100vh',
        marginTop: '0',
        overflow: 'hidden'
      }}
    >
      {/* Background con overlay y animación */}
      <div 
        className="hero-background position-absolute w-100 h-100 top-0 left-0" 
        style={{
          background: 'url(/images/real-estate/hero-bg.jpg) no-repeat center center',
          backgroundSize: 'cover',
          animation: 'zoomAnimation 25s infinite alternate',
          zIndex: 0
        }}
      />
      
      {/* Overlay con gradiente */}
      <div 
        className="position-absolute w-100 h-100 top-0 left-0" 
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1
        }}
      />
      
      <style jsx>{`
        @keyframes zoomAnimation {
          0% {
            background-size: 110%;
            background-position: center center;
          }
          50% {
            background-size: 125%;
            background-position: center 45%;
          }
          100% {
            background-size: 110%;
            background-position: center 55%;
          }
        }
        
        .hero-title {
          font-size: 3.5rem;
          margin-top: 80px;
        }
        
        .hero-subtitle {
          font-size: 1.4rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        :global(.hero-section) {
          width: 100%;
          min-height: 100vh;
          padding: 0;
          margin: 0;
          position: relative;
        }
        
        :global(.hero-background) {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
            margin-top: 120px;
            padding-top: 30px;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 30px;
          }
          
          @keyframes zoomAnimationMobile {
            0% {
              background-size: 180%;
              background-position: center center;
            }
            50% {
              background-size: 200%;
              background-position: center center;
            }
            100% {
              background-size: 180%;
              background-position: center center;
            }
          }
          
          :global(.hero-background) {
            background-size: cover !important;
            background-position: center center !important;
            animation: zoomAnimationMobile 25s infinite alternate !important;
          }
          
          :global(.hero-section) {
            height: 100vh;
            width: 100vw;
            max-width: 100%;
            overflow: hidden;
            padding-top: 20px;
          }
          
          :global(.animate__fadeInUp) {
    
            padding-bottom: 100px !important;
          }
        }
      `}</style>
      <Container className="position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <h1 className="hero-title text-white fw-bold mb-4 animate__animated animate__fadeInDown">
              Encuentra Tu Propiedad Ideal en Copropiedad
            </h1>
            <p className="lead text-white mb-5 animate__animated animate__fadeInUp hero-subtitle">
              Invierte en propiedades de lujo por una fracción del coste total.
              La mejor manera de acceder al mercado inmobiliario premium.
            </p>
            
            <div className="animate__animated animate__fadeInUp" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <Card className="bg-white shadow border-0 rounded-lg p-3">
                <div className="p-2">
                  <Form onSubmit={handleSearch}>
                    <Row className="g-3">
                      <Col md={4} xs={12}>
                        <Form.Select 
                          className="border-0 shadow-none form-select-responsive"
                          value={searchParams.category}
                          onChange={(e) => handleSearchParamChange('category', e.target.value)}
                        >
                          <option>Todas las categorías</option>
                          <option>Apartamento</option>
                          <option>Casa</option>
                          <option>Ático</option>
                          <option>Villa</option>
                        </Form.Select>
                      </Col>
                      <Col md={6} xs={12}>
                        <InputGroup className="input-group-responsive">
                          <InputGroup.Text className="bg-transparent border-0">
                            <IconifyIcon icon="ri:search-line" className="icon-responsive" />
                          </InputGroup.Text>
                          <Form.Control
                            placeholder="Buscar propiedades..."
                            className="border-0 shadow-none form-control-responsive"
                            value={searchParams.searchTerm}
                            onChange={(e) => handleSearchParamChange('searchTerm', e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={2} xs={12}>
                        <Button variant="primary" className="w-100 fw-bold btn-responsive" type="submit">
                          Buscar
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
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

// Componente de tarjeta de propiedad al estilo dashboard
const DashboardPropertyCard = ({ 
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
  share4_price
}: Property) => {
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
    <Card className="overflow-hidden h-100">
      <div className="position-relative">
        <Link href={`/propiedades/detalles?id=${id}`} className="property-link">
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
      <Card.Body>
        <div className="d-flex align-items-center gap-2">
          <div className="avatar bg-light rounded" style={styles.flexCentered}>
            <IconifyIcon 
              icon={category === 'Ático' ? 'solar:home-2-bold' : 'solar:home-angle-bold'} 
              width={24} 
              height={24} 
              className="fs-24 text-primary" 
            />
          </div>
          <div>
            <Link href={`/propiedades/detalles?id=${id}`} className="text-dark fw-medium fs-16 property-link">
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
                      href={`/propiedades/detalles?id=${id}&share=${share.share_number}`}
                      className="text-decoration-none property-link"
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
      </Card.Body>
    </Card>
  )
}

// Componente para la sección de categorías
const CategorySection = () => {
  const categories = [
    { name: 'Apartamentos', icon: 'ri:building-4-line', count: 24 },
    { name: 'Casas', icon: 'ri:home-line', count: 18 },
    { name: 'Áticos', icon: 'ri:home-wifi-line', count: 12 },
    { name: 'Villas', icon: 'ri:hotel-line', count: 10 },
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={6} className="text-center">
            <h6 className="text-primary text-uppercase mb-2">Categorías</h6>
            <h2 className="mb-4">Explora por Categoría</h2>
            <p className="text-muted">
              Descubre propiedades de alta calidad organizadas por categorías para facilitar tu búsqueda
            </p>
          </Col>
        </Row>
        
        <Row>
          {categories.map((category, idx) => (
            <Col lg={3} md={6} key={idx}>
              <Card className="border-0 shadow-sm text-center hover-effect mb-4">
                <Card.Body className="p-4">
                  <div className="avatar-md bg-primary-subtle rounded-circle mx-auto mb-4">
                    <IconifyIcon
                      icon={category.icon}
                      width={32}
                      height={32}
                      className="text-primary"
                    />
                  </div>
                  <h5>{category.name}</h5>
                  <p className="text-muted mb-0">{category.count} propiedades</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// Componente para las características
const FeatureSection = () => {
  const features = [
    {
      icon: 'ri:money-dollar-circle-line',
      title: 'Inversión Accesible',
      description: 'Invierte en propiedades de lujo desde sólo una fracción del precio total'
    },
    {
      icon: 'ri:shield-check-line',
      title: 'Inversión Segura',
      description: 'Todas las propiedades verificadas y con protección legal para copropietarios'
    },
    {
      icon: 'ri:funds-line',
      title: 'Alto Rendimiento',
      description: 'Obtén beneficios de la revalorización inmobiliaria y el alquiler'
    },
    {
      icon: 'ri:hand-heart-line',
      title: 'Sin Complicaciones',
      description: 'Nos encargamos de toda la gestión y mantenimiento de la propiedad'
    }
  ];

  return (
    <section className="py-5">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={6} className="text-center">
            <h6 className="text-primary text-uppercase mb-2">Beneficios</h6>
            <h2 className="mb-4">¿Por Qué Elegir la Copropiedad?</h2>
            <p className="text-muted">
              La copropiedad te permite disfrutar de todos los beneficios de poseer una propiedad premium sin asumir todo el coste
            </p>
          </Col>
        </Row>

        <Row>
          {features.map((feature, idx) => (
            <Col lg={3} md={6} key={idx} className="mb-4">
              <div className="text-center p-3">
                <div className="avatar-md bg-primary-subtle rounded-circle mx-auto mb-4">
                  <IconifyIcon
                    icon={feature.icon}
                    width={32}
                    height={32}
                    className="text-primary"
                  />
                </div>
                <h5>{feature.title}</h5>
                <p className="text-muted">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// Componente para CTA (Call to Action)
const CTASection = () => {
  return (
    <section 
      className="py-5 position-relative" 
      style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/real-estate/cta-bg.jpg) no-repeat center center',
        backgroundSize: 'cover'
      }}
    >
      <Container className="position-relative">
        <Row className="align-items-center">
          <Col lg={7} className="text-lg-start text-center">
            <h2 className="text-white mb-3">¿Estás listo para invertir en propiedades premium?</h2>
            <p className="text-white-50 mb-0">
              Nuestros asesores están listos para ayudarte a encontrar la propiedad perfecta para tu inversión
            </p>
          </Col>
          <Col lg={5} className="text-lg-end text-center mt-4 mt-lg-0">
            <Link href="/propiedades/listado">
              <Button variant="white" className="me-2">Ver propiedades</Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="outline-light">Contactar asesor</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// Sección de testimonios con avatares SVG
const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      text: "Nunca pensé que podría ser propietario de un apartamento de lujo. Gracias a la copropiedad, ahora tengo una inversión rentable y segura.",
      name: "Javier Rodríguez",
      position: "Copropietario desde 2023",
      avatar: "/images/users/avatar-1.svg"
    },
    {
      id: 2,
      text: "El proceso fue muy sencillo y transparente. El equipo me asesoró en todo momento y ahora disfruto de mi inversión sin preocupaciones.",
      name: "Laura Cáceres",
      position: "Copropietaria desde 2022",
      avatar: "/images/users/avatar-2.svg"
    },
    {
      id: 3,
      text: "La plataforma hace que todo sea muy fácil. Puedo seguir el rendimiento de mi inversión y la gestión del inmueble desde cualquier lugar.",
      name: "Miguel Sánchez",
      position: "Copropietario desde 2023",
      avatar: "/images/users/avatar-3.svg"
    }
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={6} className="text-center">
            <h6 className="text-primary text-uppercase mb-2">Testimonios</h6>
            <h2 className="mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-muted">
              Descubre las experiencias de quienes ya invirtieron en propiedades en copropiedad con nosotros
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {testimonials.map((testimonial) => (
            <Col lg={4} md={6} key={testimonial.id} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconifyIcon 
                        key={star} 
                        icon="ri:star-fill" 
                        className="text-warning" 
                        width={18} 
                        height={18} 
                      />
                    ))}
                  </div>
                  <p className="text-muted mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="d-flex align-items-center">
                    <Image 
                      src={testimonial.avatar} 
                      width={50} 
                      height={50} 
                      className="rounded-circle me-3"
                      alt={testimonial.name} 
                    />
                    <div>
                      <h6 className="mb-1">{testimonial.name}</h6>
                      <p className="text-muted mb-0 fs-13">{testimonial.position}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// Página principal
export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        
        // Usamos la relación explícita y filtramos por destacada = true
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images!property_images_property_id_fkey(*)
          `)
          .eq('destacada', true)
          .eq('estado', 'disponible')
          .limit(3);

        if (error) {
          console.error('Error fetching properties:', error);
          setLoading(false);
          return;
        }

        // Verificamos que tengamos datos
        console.log('Propiedades destacadas cargadas:', data?.length || 0);
        setFeaturedProperties(data || []);
      } catch (error) {
        console.error('Error al cargar propiedades destacadas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    // Manejamos los enlaces de propiedades para redirigir a la autenticación si es necesario
    const handlePropertyLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const linkElement = target.closest('.property-link') as HTMLAnchorElement;
      
      if (linkElement) {
        e.preventDefault();
        
        let href = linkElement.getAttribute('href') || '/';
        
        // Comprobar si necesitamos cambiar la ruta
        if (href.includes('/property-details')) {
          // Asegurarse que se use la ruta correcta
          href = href.replace('/property-details', '/propiedades/detalles');
        }
        
        // Si el usuario no está autenticado, redirigimos al inicio de sesión
        if (status === 'unauthenticated') {
          router.push(`/auth/sign-in?redirectTo=${href}`);
        } else if (status === 'authenticated') {
          // Si está autenticado, permitimos la navegación
          router.push(href);
        }
      }
    };

    // Agregamos el event listener
    document.addEventListener('click', handlePropertyLinkClick as unknown as EventListener);

    // Limpieza
    return () => {
      document.removeEventListener('click', handlePropertyLinkClick as unknown as EventListener);
    };
  }, [status, router]);

  return (
    <main>
      <HeroSection />
      
      <CategorySection />

      {/* Sección de propiedades destacadas */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={6} className="text-center">
              <h6 className="text-primary text-uppercase mb-2">Destacados</h6>
              <h2 className="mb-4">Propiedades Seleccionadas</h2>
              <p className="text-muted">
                Nuestras mejores propiedades seleccionadas por nuestros expertos para tu inversión en copropiedad
              </p>
            </Col>
          </Row>

          <Row>
            {loading ? (
              <Col className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </Col>
            ) : featuredProperties.length === 0 ? (
              <Col className="text-center py-4">
                <div className="mb-3">
                  <IconifyIcon icon="ri:star-line" width={48} height={48} className="text-muted" />
                </div>
                <h4>No hay propiedades destacadas</h4>
                <p className="text-muted">
                  Estamos preparando nuevas propiedades destacadas. ¡Vuelve pronto!
                </p>
                <Link href="/propiedades/listado">
                  <Button variant="primary" className="mt-2">Ver todas las propiedades</Button>
                </Link>
              </Col>
            ) : (
              featuredProperties.map((property) => (
                <Col lg={4} md={4} sm={12} className="mb-4" key={property.id}>
                  <DashboardPropertyCard {...property} />
                </Col>
              ))
            )}
          </Row>

          <Row className="mt-4">
            <Col className="text-center">
              <Link href="/propiedades/listado">
                <Button variant="primary" size="lg" className="px-4">
                  <IconifyIcon icon="ri:eye-line" width={20} height={20} className="me-2" />
                  Ver todas las propiedades
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      <FeatureSection />
      
      <CTASection />

      {/* Usar el nuevo componente de testimonios */}
      <TestimonialsSection />

      {/* Footer con enlaces a la zona privada */}
      <footer className="py-5 bg-dark text-white">
        <Container>
          <Row className="mb-4">
            <Col lg={4} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-white mb-3">Quincenalia</h5>
              <p className="text-white-50 mb-3">
                Plataforma de gestión de propiedades en régimen de copropiedad. Invierte en propiedades premium con una fracción del coste.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white-50 hover-text-white">
                  <IconifyIcon icon="ri:facebook-fill" width={20} height={20} />
                </a>
                <a href="#" className="text-white-50 hover-text-white">
                  <IconifyIcon icon="ri:twitter-fill" width={20} height={20} />
                </a>
                <a href="#" className="text-white-50 hover-text-white">
                  <IconifyIcon icon="ri:instagram-fill" width={20} height={20} />
                </a>
              </div>
            </Col>
            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-white mb-3">Enlaces rápidos</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/propiedades/listado" className="text-white-50 text-decoration-none">
                    Propiedades
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/about" className="text-white-50 text-decoration-none">
                    Sobre nosotros
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/contact" className="text-white-50 text-decoration-none">
                    Contacto
                  </Link>
                </li>
              </ul>
            </Col>
            <Col lg={2} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-white mb-3">Zona privada</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/auth/sign-in" className="text-white-50 text-decoration-none">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/auth/sign-up" className="text-white-50 text-decoration-none">
                    Registrarse
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/dashboards/analytics" className="text-white-50 text-decoration-none">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </Col>
            <Col lg={4} md={6}>
              <h5 className="text-white mb-3">Suscríbete a nuestro boletín</h5>
              <p className="text-white-50 mb-3">
                Recibe las últimas novedades sobre propiedades y oportunidades de inversión.
              </p>
              <Form className="d-flex">
                <Form.Control
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="me-2"
                />
                <Button variant="primary">Suscribirse</Button>
              </Form>
            </Col>
          </Row>
          <hr className="border-secondary my-4" />
          <Row>
            <Col className="text-center">
              <p className="mb-0 text-white-50">© 2023 Quincenalia - Todos los derechos reservados</p>
            </Col>
          </Row>
        </Container>
      </footer>

      <style global jsx>{`
        .form-select-responsive, .form-control-responsive, .btn-responsive {
          height: 50px;
          font-size: 1.1rem;
        }
        
        .icon-responsive {
          width: 24px;
          height: 24px;
        }
        
        @media (max-width: 768px) {
          .form-select-responsive, .form-control-responsive, .btn-responsive {
            height: 40px;
            font-size: 14px;
          }
          
          .icon-responsive {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </main>
  )
} 