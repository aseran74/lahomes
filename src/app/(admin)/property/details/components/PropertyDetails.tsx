'use client'

import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { uploadPropertyImage, deletePropertyImage } from '@/lib/supabase';
import type { Property, PropertyImage, PropertyShare } from '@/types/property';
import { formatPrice, getStatusVariant } from '@/utils/format';
import Image from 'next/image';
import { Property as PropertyType } from '@/types/property';

// Lista de características y comodidades disponibles
const AVAILABLE_FEATURES = [
  'Aire acondicionado',
  'Calefacción',
  'Terraza',
  'Balcón',
  'Jardín',
  'Piscina',
  'Garaje',
  'Trastero'
];

const AVAILABLE_AMENITIES = [
  'Gimnasio',
  'Seguridad 24h',
  'Zona infantil',
  'Zona común',
  'Pista de tenis',
  'Pista de pádel',
  'Sauna',
  'Spa'
];

const PROPERTY_CATEGORIES = [
  'Apartamento',
  'Piso',
  'Ático',
  'Dúplex',
  'Casa',
  'Chalet',
  'Villa'
];

interface ShareInfo {
  number: number;
  status: 'disponible' | 'reservada' | 'vendida';
  price: number;
  period: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

// Extendemos el tipo importado con nuestras propiedades adicionales
interface ExtendedProperty extends PropertyType {
  share1_status: 'disponible' | 'reservada' | 'vendida';
  share2_status: 'disponible' | 'reservada' | 'vendida';
  share3_status: 'disponible' | 'reservada' | 'vendida';
  share4_status: 'disponible' | 'reservada' | 'vendida';
  share1_price: number;
  share2_price: number;
  share3_price: number;
  share4_price: number;
  total_shares: number;
  features: string[];
  amenities: string[];
  destacada: boolean;
  images?: PropertyImage[];
  agent?: Agent;
}

interface PropertyDetailsProps {
  property: PropertyType & {
    images?: PropertyImage[];
    agent?: {
      id: string;
      name: string;
      email: string;
    };
  };
  selectedShare?: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function PropertyDetails({ property, selectedShare, isEditing, onEdit, onSave, onCancel }: PropertyDetailsProps) {
  const [formData, setFormData] = useState<ExtendedProperty>({
    ...property,
    destacada: property.destacada || false
  });
  const [images, setImages] = useState<PropertyImage[]>(property.images || []);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    console.log('PropertyDetails - Propiedad recibida:', property);
    if (property) {
      setFormData({
        ...property,
        destacada: property.destacada || false
      });
      setImages(property.images || []);
    }
  }, [property]);

  useEffect(() => {
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        console.log('Iniciando carga de agentes...');
        const { data: agentsData, error } = await supabase
          .from('agents')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error al cargar agentes:', error);
          throw error;
        }

        console.log('Agentes cargados:', agentsData);
        setAgents(agentsData || []);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast.error('Error al cargar los agentes');
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  useEffect(() => {
    console.log('Configurando suscripciones para la propiedad:', property.id);
    
    // Configurar suscripciones
    const propertySubscription = supabase
      .channel(`property_${property.id}_details`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties',
        filter: `id=eq.${property.id}`
      }, (payload) => {
        console.log('Cambio detectado en properties:', payload);
        loadProperty();
      })
      .subscribe();

    const imagesSubscription = supabase
      .channel(`property_images_${property.id}_details`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_images',
        filter: `property_id=eq.${property.id}`
      }, (payload) => {
        console.log('Cambio detectado en images:', payload);
        loadProperty();
      })
      .subscribe();

    // Cargar datos iniciales
    loadProperty();

    // Limpiar suscripciones
    return () => {
      console.log('Limpiando suscripciones');
      propertySubscription.unsubscribe();
      imagesSubscription.unsubscribe();
    };
  }, [property.id]); // Solo se ejecuta cuando cambia el ID de la propiedad

  const loadProperty = async () => {
    try {
      console.log('Cargando propiedad:', property.id);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images!property_images_property_id_fkey (
            id,
            property_id,
            url,
            is_main
          ),
          agent:agents (
            id,
            name,
            email
          )
        `)
        .eq('id', property.id)
        .single();

      if (error) {
        console.error('Error en la consulta:', error);
        return;
      }

      if (!data) {
        console.log('No se encontraron datos para la propiedad');
        return;
      }

      const propertyData = {
        ...data,
        images: data.images || [],
        agent: data.agent || undefined,
        total_shares: 4 // Por defecto, 4 participaciones
      } as ExtendedProperty;

      setFormData(propertyData);
      setImages(propertyData.images || []);
    } catch (error) {
      console.error('Error técnico al cargar la propiedad:', error);
    }
  };

  // Función auxiliar para actualizar el estado manteniendo los tipos
  const updateFormData = (updates: Partial<ExtendedProperty>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    try {
      const files = Array.from(e.target.files);
      const results = await Promise.all(files.map(file => uploadPropertyImage({ file, propertyId: property.id, isMain: false })));
      
      if (results.some(result => result.error)) {
        throw new Error('Error al subir algunas imágenes');
      }

      // Actualizar el estado local inmediatamente
      if (results.every(result => result.data)) {
        setImages(prevImages => [...prevImages, ...results.map(result => result.data)]);
      }
      
      toast.success('Imágenes subidas exitosamente');
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir las imágenes');
    }
  };

  const handleFeatureChange = (feature: string) => {
    const features = formData.features || [];
    const newFeatures = features.includes(feature)
      ? features.filter(f => f !== feature)
      : [...features, feature];
    updateFormData({ features: newFeatures });
  };

  const handleAmenityChange = (amenity: string) => {
    const amenities = formData.amenities || [];
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    updateFormData({ amenities: newAmenities });
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const success = await deletePropertyImage(imageId);
      if (success) {
        // Actualizar el estado local inmediatamente
        setImages(prevImages => prevImages.filter(img => img.id !== imageId));
        toast.success('Imagen eliminada correctamente');
      } else {
        throw new Error('No se pudo eliminar la imagen');
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculamos el estado general basado en los estados de las participaciones
      const shareStatuses = [
        formData.share1_status,
        formData.share2_status,
        formData.share3_status,
        formData.share4_status
      ];

      const disponibles = shareStatuses.filter(status => status === 'disponible').length;
      const vendidas = shareStatuses.filter(status => status === 'vendida').length;
      const reservadas = shareStatuses.filter(status => status === 'reservada').length;

      let estado;
      if (vendidas === 4) {
        estado = 'vendida';
      } else if (reservadas === 4) {
        estado = 'reservada';
      } else if (disponibles > 0) {
        estado = 'disponible';
      } else {
        estado = 'reservada';
      }

      // Preparamos los datos para actualizar
      const updateData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        toilets: formData.toilets,
        square_feet: formData.square_feet,
        year_built: formData.year_built,
        category: formData.category,
        total_price: formData.total_price,
        features: formData.features,
        amenities: formData.amenities,
        total_shares: formData.total_shares,
        agent_id: formData.agent_id,
        estado: estado,
        commission_percentage: formData.commission_percentage,
        commission_status: formData.commission_status,
        share1_status: formData.share1_status,
        share2_status: formData.share2_status,
        share3_status: formData.share3_status,
        share4_status: formData.share4_status,
        share1_price: formData.share1_price,
        share2_price: formData.share2_price,
        share3_price: formData.share3_price,
        share4_price: formData.share4_price,
        destacada: formData.destacada
      };

      onSave(updateData);
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Error al actualizar la propiedad');
    }
  };

  const getShareInfo = (shareNumber: number): ShareInfo => {
    const key1 = `share${shareNumber}_status` as keyof ExtendedProperty;
    const key2 = `share${shareNumber}_price` as keyof ExtendedProperty;
    
    const status = formData[key1] as 'disponible' | 'reservada' | 'vendida';
    const price = formData[key2] as number;
    
    const periods = {
      1: '1ª quincena de Julio',
      2: '2ª quincena de Julio',
      3: '1ª quincena de Agosto',
      4: '2ª quincena de Agosto'
    };

    return {
      number: shareNumber,
      status,
      price,
      period: periods[shareNumber as keyof typeof periods]
    };
  };

  const handleShareStatusChange = (shareNumber: number, status: 'disponible' | 'reservada' | 'vendida') => {
    const key = `share${shareNumber}_status` as keyof ExtendedProperty;
    updateFormData({ [key]: status } as Partial<ExtendedProperty>);
  };

  const handleSharePriceChange = (shareNumber: number, price: number) => {
    const key = `share${shareNumber}_price` as keyof ExtendedProperty;
    updateFormData({ [key]: price } as Partial<ExtendedProperty>);
  };

  const calculateSharePrice = (totalPrice: number, totalShares: number) => {
    return Math.round(totalPrice / totalShares);
  };

  const updateAllSharePrices = async () => {
    if (!formData.total_price || !formData.total_shares) return;
    
    const sharePrice = calculateSharePrice(formData.total_price, formData.total_shares);
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          share1_price: sharePrice,
          share2_price: sharePrice,
          share3_price: sharePrice,
          share4_price: sharePrice
        })
        .eq('id', property.id);

      if (error) throw error;
      
      updateFormData({
        share1_price: sharePrice,
        share2_price: sharePrice,
        share3_price: sharePrice,
        share4_price: sharePrice
      });
      
      toast.success('Precios de participaciones actualizados');
    } catch (error) {
      console.error('Error updating share prices:', error);
      toast.error('Error al actualizar los precios de las participaciones');
    }
  };

  return (
      <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Información de la Propiedad</h4>
          <Button 
            variant={isEditing ? "success" : "primary"} 
            onClick={isEditing ? handleSubmit : onEdit}
          >
            {isEditing ? "Guardar Cambios" : "Editar Propiedad"}
          </Button>
        </div>

        {/* Imágenes de la propiedad */}
        <div className="mb-4">
          <h5 className="mb-3">Imágenes</h5>
          {isEditing && (
            <Form.Group className="mb-3">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple
              />
              <Form.Text className="text-muted">
                Puedes seleccionar múltiples imágenes. La primera imagen será la principal.
              </Form.Text>
            </Form.Group>
          )}
          <Row className="g-2">
            {images && images.length > 0 ? (
              images.map((image, index) => (
                <Col key={image.id} xs={6} md={4} lg={3}>
          <div className="position-relative">
                    <Image
                      src={image.url}
                      alt={`Imagen ${index + 1}`}
                      width={200}
                      height={150}
                      className="img-fluid rounded"
                      style={{ objectFit: 'cover' }}
                    />
                    {image.is_main && (
                      <Badge 
                        bg="primary" 
                        className="position-absolute top-0 end-0 m-2"
                      >
                        Principal
                      </Badge>
                    )}
                    {isEditing && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 start-0 m-2"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-muted">No hay imágenes disponibles</p>
              </Col>
            )}
          </Row>
        </div>

        {/* Información básica */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                disabled={!isEditing}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={formData.category}
                disabled={!isEditing}
                onChange={(e) => updateFormData({ category: e.target.value })}
              >
                <option value="">Seleccionar categoría...</option>
                {PROPERTY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </Col>
        </Row>

        {isEditing && (
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="destacada"
                  label="Mostrar como propiedad destacada en la página principal"
                  name="destacada"
                  checked={formData.destacada}
                  onChange={(e) => updateFormData({ destacada: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Precio Total</Form.Label>
              <Form.Control
                type="number"
                value={formData.total_price}
                disabled={!isEditing}
                onChange={(e) => updateFormData({ total_price: Number(e.target.value) })}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                type="text"
                value={formData.estado}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Características */}
        <div className="mb-4">
          <h5>Características</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Habitaciones</Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.bedrooms || 0}
                    onChange={(e) => updateFormData({ bedrooms: Number(e.target.value) })}
                  />
                ) : (
                  <div className="mb-3">
                    <p className="mb-0">{formData.bedrooms}</p>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Baños</Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.bathrooms || 0}
                    onChange={(e) => updateFormData({ bathrooms: Number(e.target.value) })}
                  />
                ) : (
                  <div className="mb-3">
                    <p className="mb-0">{formData.bathrooms}</p>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Aseos</Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.toilets || 0}
                    onChange={(e) => updateFormData({ toilets: Number(e.target.value) })}
                  />
                ) : (
                  <div className="mb-3">
                    <p className="mb-0">{formData.toilets}</p>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Superficie (m²)</Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.square_feet || 0}
                    onChange={(e) => updateFormData({ square_feet: Number(e.target.value) })}
                  />
                ) : (
                  <div className="mb-3">
                    <p className="mb-0">{formData.square_feet} m²</p>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Gestión de Participaciones */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Gestión de Participaciones</h5>
            {isEditing && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={updateAllSharePrices}
                disabled={!formData.total_price || !formData.total_shares}
              >
                Actualizar todos los precios
              </Button>
            )}
          </div>
          
          {formData.total_price && formData.total_shares && (
            <p className="text-muted mb-3">
              Precio por participación sugerido: {formatPrice(calculateSharePrice(formData.total_price, formData.total_shares))}
            </p>
          )}

          <Row>
            {[1, 2, 3, 4].map((shareNumber) => {
              const shareInfo = getShareInfo(shareNumber);
              return (
                <Col key={shareNumber} xs={12} md={6} lg={3} className="mb-3">
                  <Card className={selectedShare === shareNumber ? 'border-primary' : ''}>
                    <Card.Body>
                      <h6 className="mb-1">Participación #{shareNumber}</h6>
                      <small className="text-muted d-block mb-3">
                        {shareInfo.period}
                      </small>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        {isEditing ? (
                          <Form.Select
                            value={shareInfo.status}
                            onChange={(e) => handleShareStatusChange(shareNumber, e.target.value as "disponible" | "vendida" | "reservada")}
                            className={`bg-${getStatusVariant(shareInfo.status)} bg-opacity-10`}
                          >
                            <option value="disponible">Disponible</option>
                            <option value="reservada">Reservada</option>
                            <option value="vendida">Vendida</option>
                          </Form.Select>
                        ) : (
                          <div className={`p-2 rounded bg-${getStatusVariant(shareInfo.status)} bg-opacity-10`}>
                            {shareInfo.status}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Precio</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            value={shareInfo.price}
                            onChange={(e) => handleSharePriceChange(shareNumber, Number(e.target.value))}
                          />
                        ) : (
                          <div className="p-2 rounded bg-light">
                            {formatPrice(shareInfo.price)}
                          </div>
                        )}
                      </Form.Group>

                      <Badge 
                        bg={getStatusVariant(shareInfo.status)}
                        className="position-absolute top-0 end-0 m-2"
                      >
                        {shareInfo.status}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Características y Amenities */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Características</h5>
                <div className="border rounded p-3">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <Form.Check
                      key={feature}
                      type="checkbox"
                      id={`feature-${feature}`}
                      label={feature}
                      checked={formData.features?.includes(feature) || false}
                      onChange={() => handleFeatureChange(feature)}
                      disabled={!isEditing}
                      className="mb-2"
                    />
                  ))}
            </div>
                {!isEditing && formData.features && formData.features.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} bg="light" text="dark">
                          {feature}
                        </Badge>
                      ))}
            </div>
          </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Complementos</h5>
                <div className="border rounded p-3">
                  {AVAILABLE_AMENITIES.map((amenity) => (
                    <Form.Check
                      key={amenity}
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      label={amenity}
                      checked={formData.amenities?.includes(amenity) || false}
                      onChange={() => handleAmenityChange(amenity)}
                      disabled={!isEditing}
                      className="mb-2"
                    />
                  ))}
                </div>
                {!isEditing && formData.amenities && formData.amenities.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} bg="light" text="dark">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
            </div>
                )}
              </Card.Body>
            </Card>
              </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Número Total de Participaciones</Form.Label>
          <Form.Control
            type="number"
            name="total_shares"
            value={formData.total_shares || ''}
            onChange={handleInputChange}
          />
        </Form.Group>

        {/* Dirección */}
        <div className="mb-4">
          <h5>Dirección</h5>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                />
              </Form.Group>
              </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.city || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                />
              </Form.Group>
              </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Estado/Provincia</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateFormData({ state: e.target.value })}
                />
              </Form.Group>
              </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Código Postal</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.zip_code || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateFormData({ zip_code: e.target.value })}
                />
              </Form.Group>
              </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>País</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateFormData({ country: e.target.value })}
                />
              </Form.Group>
              </Col>
            </Row>
          </div>

        <Form.Group className="mb-3">
          <Form.Label>Agente Asignado</Form.Label>
          {loadingAgents ? (
            <div className="text-center py-2">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Cargando agentes...
        </div>
          ) : (
            <>
              <Form.Select
                name="agent_id"
                value={formData.agent_id || ''}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar agente...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Form.Select>
              {agents.length === 0 && (
                <div className="text-danger mt-1">
                  No se encontraron agentes disponibles
          </div>
              )}
              <Form.Text className="text-muted">
                Selecciona un agente para asignar esta propiedad
              </Form.Text>
            </>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Porcentaje de Comisión (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={formData.commission_percentage || ''}
            onChange={(e) => updateFormData({ commission_percentage: parseFloat(e.target.value) })}
            disabled={!isEditing}
          />
          <Form.Text className="text-muted">
            El porcentaje debe estar entre 1% y 5%
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estado de la Comisión</Form.Label>
          <Form.Select
            value={formData.commission_status || 'pendiente'}
            onChange={(e) => updateFormData({ commission_status: e.target.value as 'pagada' | 'pendiente' })}
            disabled={!isEditing}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
          </Form.Select>
        </Form.Group>

        {isEditing && (
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar Cambios
            </Button>
          </div>
        )}
      </Card.Body>
      </Card>
  );
}
