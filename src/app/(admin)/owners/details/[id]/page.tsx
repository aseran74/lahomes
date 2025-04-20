import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import OwnerDetails from '../components/OwnerDetails'

export const metadata: Metadata = {
  title: 'Detalles del Propietario',
}

interface Props {
  params: {
    id: string
  }
}

const OwnerDetailsPage = ({ params }: Props) => {
  return (
    <>
      <PageTitle title="Detalles del Propietario" subName="Copropiedades" />
      <OwnerDetails ownerId={params.id} />
    </>
  )
}

export default OwnerDetailsPage 