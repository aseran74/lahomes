'use client'
import React, { useState, useEffect } from 'react';
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete'
import { toast } from 'react-hot-toast'

interface ShareState {
  estado: string;
  price: number;
}

interface PropertyFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  square_feet: number;
  year_built: number;
  category: string;
  total_price: number;
  features: string[];
  amenities: string[];
  shares: ShareState[];
  agent_id: string | null;
  commission_percentage: number;
  commission_status: 'pagada' | 'pendiente';
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

const FEATURES_OPTIONS = [
  'Aire acondicionado',
  'Calefacción',
  'Ascensor',
  'Terraza',
  'Balcón',
  'Piscina',
  'Jardín',
  'Garaje',
  'Trastero'
];

const AMENITIES_OPTIONS = [
  'Amueblado',
  'Electrodomésticos',
  'Internet',
  'TV por cable',
  'Seguridad 24h',
  'Gimnasio',
  'Zona común',
  'Área de juegos'
];

const initialFormData: PropertyFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  bedrooms: 0,
  bathrooms: 0,
  toilets: 0,
  square_feet: 0,
  year_built: 0,
  category: 'Apartamento',
  total_price: 0,
  features: [],
  amenities: [],
  shares: Array(4).fill({ estado: 'disponible', price: 0 }),
  agent_id: null,
  commission_percentage: 1,
  commission_status: 'pendiente'
};

const PropertyAdd = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Cargar agentes al montar el componente
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoadingAgents(true);
        console.log('Iniciando carga de agentes...');
        
        const { data: agentsData, error } = await supabase
          .from('agents')
          .select('id, name, email')  // Removemos specialization por ahora
          .order('name');

        if (error) {
          console.error('Error en la consulta de agentes:', error);
          throw error;
        }

        if (!agentsData || agentsData.length === 0) {
          console.log('No se encontraron agentes');
          setAgents([]);
          return;
        }

        console.log('Agentes cargados:', agentsData);
        setAgents(agentsData);
      } catch (error) {
        console.error('Error técnico al cargar agentes:', error);
        toast.error('Error al cargar los agentes');
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type: 'features' | 'amenities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const handleShareChange = (index: number, field: keyof ShareState, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      shares: prev.shares.map((share, i) =>
        i === index ? { ...share, [field]: value } : share
      )
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleAddressChange = (address: string, city?: string, state?: string, zipCode?: string) => {
    setFormData(prev => ({
      ...prev,
      address,
      ...(city && { city }),
      ...(state && { state }),
      ...(zipCode && { zip_code: zipCode })
    }));
  };

  const uploadImages = async (propertyId: string) => {
    if (!selectedFiles) return [];
    const uploadedImages = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${propertyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        uploadedImages.push({
          property_id: propertyId,
          url: publicUrl,
          is_main: i === 0 // Primera imagen será la principal
        });
      }
    } catch (error) {
      console.error('Error in uploadImages:', error);
    }

    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (!formData.agent_id) {
        toast.error('Debes seleccionar un agente');
        return;
      }

      // 1. Crear la propiedad
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          toilets: formData.toilets,
          square_feet: formData.square_feet,
          year_built: formData.year_built,
          category: formData.category,
          total_price: formData.total_price,
          features: formData.features,
          amenities: formData.amenities,
          total_shares: 4,
          agent_id: formData.agent_id,
          estado: formData.shares.every(s => s.estado === 'vendida') ? 'vendida' : 
                 formData.shares.some(s => s.estado === 'disponible') ? 'disponible' : 'reservada',
          commission_percentage: formData.commission_percentage,
          commission_status: formData.commission_status
        })
        .select()
        .single();

      if (propertyError) {
        console.error('Error al crear la propiedad:', propertyError);
        throw propertyError;
      }

      // 2. Crear las copropiedades
      const { error: sharesError } = await supabase
        .from('property_shares')
        .insert(
          formData.shares.map((share, index) => ({
            property_id: property.id,
            share_number: index + 1,
            estado: share.estado,
            price: share.price
          }))
        );

      if (sharesError) throw sharesError;

      // 3. Subir imágenes si hay
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadedImages = await uploadImages(property.id);
        
        if (uploadedImages.length > 0) {
          const { error: imagesError } = await supabase
            .from('property_images')
            .insert(uploadedImages);

          if (imagesError) throw imagesError;
        }
      }

      router.push(`/property/details?id=${property.id}`);
    } catch (error) {
      console.error('Error al crear la propiedad:', error);
      toast.error('Error al crear la propiedad');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Información Básica</h4>
              
              <Form.Group className="mb-4">
                <Form.Label>Imágenes de la Propiedad</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Form.Text className="text-muted">
                  Puedes seleccionar múltiples imágenes. La primera imagen será la principal.
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre de la Propiedad</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Apartamento">Apartamento</option>
                      <option value="Ático">Ático</option>
                      <option value="Dúplex">Dúplex</option>
                      <option value="Casa">Casa</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

            <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <GooglePlacesAutocomplete
                      value={formData.address}
                      onChange={handleAddressChange}
                      placeholder="Introduce la dirección de la propiedad"
                    />
                  </Form.Group>
              </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Provincia</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Código Postal</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Habitaciones</Form.Label>
                    <Form.Control
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Baños</Form.Label>
                    <Form.Control
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lavabos</Form.Label>
                    <Form.Control
                      type="number"
                      name="toilets"
                      value={formData.toilets}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Superficie (m²)</Form.Label>
                    <Form.Control
                      type="number"
                      name="square_feet"
                      value={formData.square_feet}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Año Construcción</Form.Label>
                    <Form.Control
                      type="number"
                      name="year_built"
                      value={formData.year_built}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio Total (€)</Form.Label>
                    <Form.Control
                      type="number"
                      name="total_price"
                      value={formData.total_price}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
              </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Agente Asignado <span className="text-danger">*</span></Form.Label>
                {loadingAgents ? (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Cargando agentes...</span>
                    </div>
                    Cargando agentes...
                  </div>
                ) : (
                  <>
                    <Form.Select
                      name="agent_id"
                      value={formData.agent_id || ''}
                      onChange={handleInputChange}
                      isInvalid={!formData.agent_id}
                      required
                    >
                      <option value="">Seleccionar agente...</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} - {agent.email}
                    </option>
                      ))}
                    </Form.Select>
                    {!formData.agent_id && (
                      <Form.Control.Feedback type="invalid">
                        Debes seleccionar un agente
                      </Form.Control.Feedback>
                    )}
                    {agents.length === 0 && (
                      <div className="text-danger mt-1">
                        No hay agentes disponibles. Por favor, añade un agente primero.
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
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                  required
                />
                <Form.Text className="text-muted">
                  El porcentaje debe estar entre 1% y 5%
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado de la Comisión</Form.Label>
                <Form.Select
                  value={formData.commission_status}
                  onChange={(e) => setFormData({ ...formData, commission_status: e.target.value as 'pagada' | 'pendiente' })}
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Características y Complementos</h4>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Características</h5>
                  {FEATURES_OPTIONS.map(feature => (
                    <Form.Check
                      key={feature}
                      type="checkbox"
                      label={feature}
                      checked={formData.features.includes(feature)}
                      onChange={() => handleCheckboxChange('features', feature)}
                      className="mb-2"
                    />
                  ))}
              </Col>
                <Col md={6}>
                  <h5 className="mb-3">Complementos</h5>
                  {AMENITIES_OPTIONS.map(amenity => (
                    <Form.Check
                      key={amenity}
                      type="checkbox"
                      label={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleCheckboxChange('amenities', amenity)}
                      className="mb-2"
                    />
                  ))}
              </Col>
            </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Copropiedades</h4>
              <Row>
                {formData.shares.map((share, index) => (
                  <Col md={6} key={index} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                          <IconifyIcon icon="solar:buildings-3-bold-duotone" className="fs-24 text-primary me-2" />
                          <h5 className="mb-0">Copropiedad {index + 1}</h5>
                        </div>
                        <small className="text-muted d-block mb-3">
                          {index === 0 ? '1ª quincena de Julio' :
                           index === 1 ? '2ª quincena de Julio' :
                           index === 2 ? '1ª quincena de Agosto' :
                           '2ª quincena de Agosto'}
                        </small>

                        <Form.Group className="mb-3">
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={share.estado}
                            onChange={(e) => handleShareChange(index, 'estado', e.target.value)}
                            className={`bg-${share.estado === 'disponible' ? 'success' : share.estado === 'reservada' ? 'warning' : 'danger'} bg-opacity-10`}
                          >
                            <option value="disponible">Disponible</option>
                            <option value="reservada">Reservada</option>
                            <option value="vendida">Vendida</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label>Precio</Form.Label>
                          <Form.Control
                            type="text"
                            value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(share.price)}
                            readOnly
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="mt-3">
                <h5>Precio Total: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(formData.total_price)}</h5>
              </div>
            </Card.Body>
        </Card>

          <div className="d-grid gap-2">
            <Button 
              type="submit" 
              variant="primary"
              disabled={isUploading}
            >
              {isUploading ? 'Creando Propiedad...' : 'Crear Propiedad'}
              </Button>
            <Button variant="light" size="lg">
              Cancelar
              </Button>
          </div>
            </Col>
          </Row>
    </Form>
  )
}

export default PropertyAdd
