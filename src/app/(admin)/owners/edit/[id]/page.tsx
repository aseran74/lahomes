import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import OwnerEdit from '../components/OwnerEdit'

export const metadata: Metadata = {
  title: 'Editar Propietario',
}

interface EditOwnerPageProps {
  params: {
    id: string
  }
}

const EditOwnerPage = ({ params }: EditOwnerPageProps) => {
  return (
    <>
      <PageTitle title="Editar Propietario" subName="Copropiedades" />
      <OwnerEdit ownerId={params.id} />
    </>
  )
}

export default EditOwnerPage 