import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AgentDetails from '../components/AgentDetails'

export const metadata: Metadata = {
  title: 'Detalles del Agente',
}

interface Props {
  params: {
    id: string
  }
}

const AgentDetailsPage = ({ params }: Props) => {
  return (
    <>
      <PageTitle title="Detalles del Agente" subName="Agentes" />
      <AgentDetails agentId={params.id} />
    </>
  )
}

export default AgentDetailsPage 