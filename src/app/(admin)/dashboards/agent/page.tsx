'use client'

import PageTitle from '@/components/PageTitle'
import { Container, Row, Col } from 'react-bootstrap'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Statistics = dynamic(() => import('./components/Statistics'), { ssr: false })
const Copropiedades = dynamic(() => import('./components/Copropiedades'), { ssr: false })
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

import { estadisticasOptions } from './data'

const AgenteDashboard = () => {
  return (
    <>
      <PageTitle title="Agente Inmobiliario" subName="Dashboard" />
      <Container fluid>
        <Suspense fallback={<div>Cargando estadísticas...</div>}>
          <Statistics />
        </Suspense>

        <Row className="mt-4">
          <Col xl={12}>
            <Suspense fallback={<div>Cargando copropiedades...</div>}>
              <Copropiedades />
            </Suspense>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xl={12}>
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Estadísticas de Ventas</h4>
              </div>
              <div className="card-body">
                <div dir="ltr">
                  <Suspense fallback={<div>Cargando gráfico...</div>}>
                    <ReactApexChart
                      className="apex-charts"
                      options={estadisticasOptions}
                      series={estadisticasOptions.series}
                      type="line"
                      height={330}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default AgenteDashboard
