'use client'

import PageTitle from '@/components/PageTitle'
import { useState } from 'react'
import { Row } from 'react-bootstrap'
import PropertiesData from './components/PropertiesData'
import PropertiesFilter from './components/PropertiesFilter'
import { PropertyFilters } from '@/types/property'

export default function PropertyGridPage() {
  const [filters, setFilters] = useState<PropertyFilters>({});

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <PageTitle title="Cuadrícula de Propiedades" subName="Bienes Raíces" />
      <Row>
        <PropertiesFilter onFilterChange={handleFiltersChange} />
        <PropertiesData filters={filters} />
      </Row>
    </>
  )
}
