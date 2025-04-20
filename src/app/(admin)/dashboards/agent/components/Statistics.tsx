'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { estadisticasAgente } from '../data'
import { Card, Col, Row } from 'react-bootstrap'

const Statistics = () => {
  return (
    <Row className="g-3">
      {estadisticasAgente.map((stat, idx) => (
        <Col key={idx} xxl={3} lg={6}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className={`avatar-sm bg-${stat.variante}-subtle rounded flex-shrink-0`}>
                  <span className="avatar-title rounded">
                    <IconifyIcon icon={stat.icono} className={`text-${stat.variante} fs-24`} />
                  </span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-uppercase fw-medium text-muted mb-0">{stat.titulo}</p>
                  <div className="d-flex align-items-center">
                    <h4 className="fs-18 mb-0">{stat.cantidad}</h4>
                    {stat.cambio && (
                      <span className="badge bg-success-subtle text-success ms-2">
                        <IconifyIcon icon="solar:arrow-up-broken" className="fs-12 me-1" />
                        {stat.cambio}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default Statistics
