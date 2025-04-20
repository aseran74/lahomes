'use client'
import React from 'react'
import ReactApexChart from 'react-apexcharts'
import { salesChart } from '../data'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'

const SalesChart = () => {
  return (
    <Col xl={8}>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="card-title mb-0">Resumen Financiero</h4>
            <Dropdown>
              <DropdownToggle as="a" className="btn btn-link text-muted p-1">
                <i className="uil uil-ellipsis-v fs-16"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>Mensual</DropdownItem>
                <DropdownItem>Trimestral</DropdownItem>
                <DropdownItem>Anual</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="d-flex align-items-center gap-3 mt-3">
            <div className="d-flex align-items-center gap-2">
              <i className="ri-checkbox-blank-circle-fill fs-11 text-primary"></i>
              <p className="text-muted mb-0">Gastos</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="ri-checkbox-blank-circle-fill fs-11 text-success"></i>
              <p className="text-muted mb-0">Ingresos</p>
            </div>
          </div>
          <ReactApexChart options={salesChart} series={salesChart.series} height={341} type="area" className="apex-charts" />
        </CardBody>
      </Card>
    </Col>
  )
}

export default SalesChart
