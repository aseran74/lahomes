import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import OwnerAdd from './components/OwnerAdd'

export const metadata: Metadata = {
  title: 'Añadir Propietario',
}

const AddOwnerPage = () => {
  return (
    <>
      <PageTitle title="Añadir Propietario" subName="Copropiedades" />
      <OwnerAdd />
    </>
  )
}

export default AddOwnerPage 