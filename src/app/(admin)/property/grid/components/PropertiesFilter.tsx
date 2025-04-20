'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { PropertyFilters } from '@/types/property'
import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row } from 'react-bootstrap'

interface PropertiesFilterProps {
  onFilterChange: (filters: PropertyFilters) => void;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  estado: string;
  copropiedades: string;
  caracteristicas: {
    piscina: boolean;
    garaje: boolean;
    jardin: boolean;
    ascensor: boolean;
  };
}

const PropertiesFilter = ({ onFilterChange }: PropertiesFilterProps) => {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    estado: 'todos',
    copropiedades: '',
    caracteristicas: {
      piscina: false,
      garaje: false,
      jardin: false,
      ascensor: false
    }
  });

  const handleFilterChange = (field: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCaracteristicaChange = (caracteristica: keyof FilterState['caracteristicas'], checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      caracteristicas: {
        ...prev.caracteristicas,
        [caracteristica]: checked
      }
    }));
  };

  const handleSubmit = () => {
    const propertyFilters: PropertyFilters = {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      estado: filters.estado === 'todos' ? undefined : filters.estado,
      copropiedades: filters.copropiedades
    };
    onFilterChange(propertyFilters);
  };

  return (
    <Col xl={3} lg={12}>
      <Card>
        <CardHeader className="border-bottom">
          <div>
            <CardTitle as={'h4'}>Filtrar Propiedades</CardTitle>
            <p className="mb-0">Encuentra tu propiedad ideal</p>
          </div>
        </CardHeader>
        <CardBody className="border-light">
          <div className="mb-4">
            <h6 className="text-dark mb-3">Precio</h6>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Control 
                    type="number" 
                    placeholder="Mín €"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-2">
                  <Form.Control 
                    type="number" 
                    placeholder="Máx €"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="mb-4">
            <h6 className="text-dark mb-3">Estado</h6>
            <div className="d-flex flex-column gap-2">
              <Form.Check
                type="radio"
                id="estado-todos"
                name="estado"
                label="Todos"
                checked={filters.estado === 'todos'}
                onChange={() => handleFilterChange('estado', 'todos')}
              />
              <Form.Check
                type="radio"
                id="estado-disponible"
                name="estado"
                label="Disponible"
                checked={filters.estado === 'disponible'}
                onChange={() => handleFilterChange('estado', 'disponible')}
              />
              <Form.Check
                type="radio"
                id="estado-vendida"
                name="estado"
                label="Vendida"
                checked={filters.estado === 'vendida'}
                onChange={() => handleFilterChange('estado', 'vendida')}
              />
            </div>
          </div>

          <div className="mb-4">
            <h6 className="text-dark mb-3">Copropiedades</h6>
            <Form.Select
              value={filters.copropiedades}
              onChange={(e) => handleFilterChange('copropiedades', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="2">2 copropiedades</option>
              <option value="3">3 copropiedades</option>
              <option value="4">4 copropiedades</option>
            </Form.Select>
          </div>

          <div className="mb-4">
            <h6 className="text-dark mb-3">Características</h6>
            <Row className="g-2">
              <Col lg={6}>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="feat1"
                    checked={filters.caracteristicas.piscina}
                    onChange={(e) => handleCaracteristicaChange('piscina', e.target.checked)}
                    label={
                      <>
                        <IconifyIcon icon="solar:swimming-pool-bold-duotone" className="me-1 text-primary" />
                        Piscina
                      </>
                    }
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="feat2"
                    checked={filters.caracteristicas.garaje}
                    onChange={(e) => handleCaracteristicaChange('garaje', e.target.checked)}
                    label={
                      <>
                        <IconifyIcon icon="solar:garage-bold-duotone" className="me-1 text-primary" />
                        Garaje
                      </>
                    }
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="feat3"
                    checked={filters.caracteristicas.jardin}
                    onChange={(e) => handleCaracteristicaChange('jardin', e.target.checked)}
                    label={
                      <>
                        <IconifyIcon icon="solar:tree-bold-duotone" className="me-1 text-primary" />
                        Jardín
                      </>
                    }
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id="feat4"
                    checked={filters.caracteristicas.ascensor}
                    onChange={(e) => handleCaracteristicaChange('ascensor', e.target.checked)}
                    label={
                      <>
                        <IconifyIcon icon="solar:elevator-bold-duotone" className="me-1 text-primary" />
                        Ascensor
                      </>
                    }
                  />
                </div>
              </Col>
            </Row>
          </div>

          <div className="d-grid">
            <Button variant="primary" onClick={handleSubmit}>
              Aplicar Filtros
            </Button>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default PropertiesFilter
