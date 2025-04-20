'use client'

import PageTitle from '@/components/PageTitle'
import PropertyList from './components/PropertyList'
import PropertyStat from './components/PropertyStat'

const PropertyListPage = () => {
  return (
    <>
      <PageTitle title="Lista de Propiedades" subName="Bienes Raíces" />
      <PropertyStat />
      <PropertyList />
    </>
  )
}

export default PropertyListPage
