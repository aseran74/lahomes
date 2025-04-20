'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { copropiedadesActivas, propiedadesCompletadas, CopropiedadType } from '../data'
import { Badge, Card, Col, ProgressBar, Row, Table } from 'react-bootstrap'

const EstadoBadge = ({ estado }: { estado: 'Disponible' | 'Reservada' | 'Vendida' }) => {
  const color = estado === 'Vendida' ? 'success' : estado === 'Reservada' ? 'warning' : 'primary'
  return (
    <Badge bg={`${color}-subtle`} className={`text-${color}`}>
      {estado}
    </Badge>
  )
}

const TablaCopropiedades = ({ copropiedades, titulo }: { copropiedades: CopropiedadType[], titulo: string }) => {
  return (
    <Card>
      <Card.Header className="d-flex align-items-center">
        <h4 className="card-title flex-grow-1 mb-0">
          {titulo}
          <span className="badge bg-primary-subtle text-primary ms-2">{copropiedades.length}</span>
        </h4>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table className="table-centered align-middle table-nowrap mb-0">
            <thead className="text-muted table-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Estado</th>
                <th scope="col">Precio</th>
                <th scope="col">Progreso</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {copropiedades.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>
                    <EstadoBadge estado={item.estado} />
                  </td>
                  <td>{item.precio}</td>
                  <td style={{ width: '15%' }}>
                    <div className="progress-w-percent">
                      <ProgressBar 
                        now={item.progreso} 
                        className="progress-sm" 
                        variant={item.estado === 'Vendida' ? 'success' : item.estado === 'Reservada' ? 'warning' : 'primary'}
                      />
                      <span className="text-muted ms-2">{item.progreso}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-soft-primary">
                        <IconifyIcon icon="solar:eye-bold-duotone" className="fs-16" />
                      </button>
                      <button className="btn btn-sm btn-soft-info">
                        <IconifyIcon icon="solar:pen-bold-duotone" className="fs-16" />
                      </button>
                      <button className="btn btn-sm btn-soft-danger">
                        <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="fs-16" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}

const Copropiedades = () => {
  return (
    <Row>
      <Col xs={12}>
        <TablaCopropiedades copropiedades={copropiedadesActivas} titulo="Copropiedades Activas" />
      </Col>
      <Col xs={12} className="mt-4">
        <TablaCopropiedades copropiedades={propiedadesCompletadas} titulo="Copropiedades Completadas" />
      </Col>
    </Row>
  )
}

export default Copropiedades 