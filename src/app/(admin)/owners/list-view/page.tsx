import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import OwnerList from './components/OwnerList'

export const metadata: Metadata = {
  title: 'Lista de Propietarios',
}

const OwnerListPage = () => {
  return (
    <>
      <PageTitle title="Lista de Propietarios" subName="Copropiedades" />
      <OwnerList />
    </>
  )
}

export default OwnerListPage 