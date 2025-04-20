import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import OwnerEdit from '../components/OwnerEdit'

export const metadata: Metadata = {
  title: 'Editar Propietario',
}

interface Props {
  params: {
    id: string
  }
}

const OwnerEditPage = ({ params }: Props) => {
  return (
    <>
      <PageTitle title="Editar Propietario" subName="Copropiedades" />
      <OwnerEdit ownerId={params.id} />
    </>
  )
}

export default OwnerEditPage 