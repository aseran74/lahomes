'use client'

import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import TopCustomer from './components/TopCustomer'

const CustomerDashboard = () => {
  const stats = [
    {
      title: 'Total Clientes',
      value: '2,584',
      icon: 'solar:users-group-rounded-bold',
      trend: 12.5,
      color: 'primary'
    },
    {
      title: 'Clientes Activos',
      value: '1,845',
      icon: 'solar:user-check-rounded-bold',
      trend: 8.2,
      color: 'success'
    },
    {
      title: 'Clientes Nuevos',
      value: '142',
      icon: 'solar:user-plus-rounded-bold',
      trend: 15.3,
      color: 'info'
    },
    {
      title: 'Valor Total Propiedades',
      value: '€12.5M',
      icon: 'solar:buildings-3-bold',
      trend: 5.8,
      color: 'warning'
    }
  ];

  return (
    <>
      <PageTitle title="Panel de Clientes" subName="Dashboard" />
      
      <Row>
        {stats.map((stat, index) => (
          <Col xl={3} md={6} key={index}>
            <Card>
              <CardBody>
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-muted mb-3">{stat.title}</h6>
                    <h4 className="mb-3">{stat.value}</h4>
                    <p className="mb-0 text-muted">
                      <span className={`text-${stat.trend > 0 ? 'success' : 'danger'} me-2`}>
                        <IconifyIcon icon={`solar:arrow-${stat.trend > 0 ? 'up' : 'down'}-bold`} className="fs-13" />
                        {Math.abs(stat.trend)}%
                      </span>
                      vs mes anterior
                    </p>
                  </Col>
                  <Col xs="auto">
                    <div className={`avatar-sm bg-${stat.color}-subtle rounded`}>
                      <span className={`avatar-title bg-${stat.color}-subtle text-${stat.color} rounded`}>
                        <IconifyIcon icon={stat.icon} className="fs-20" />
                      </span>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={8}>
          <TopCustomer />
        </Col>
        <Col xl={4}>
          <Card>
            <CardHeader>
              <CardTitle as="h4">Distribución de Clientes</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                <div>
                  <h5 className="mb-2">Por Estado</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Activos</span>
                        <span>71%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-success" style={{ width: '71%' }}></div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Inactivos</span>
                        <span>18%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-danger" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Pendientes</span>
                        <span>11%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-warning" style={{ width: '11%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2">Por Propiedades</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>1 Propiedad</span>
                        <span>45%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>2-3 Propiedades</span>
                        <span>35%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-info" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span>4+ Propiedades</span>
                        <span>20%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-success" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CustomerDashboard 