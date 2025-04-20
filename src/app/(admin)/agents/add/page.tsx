import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AgentAdd from './components/AgentAdd'

export const metadata: Metadata = {
  title: 'Añadir Agente',
}

const AddAgentPage = () => {
  return (
    <>
      <PageTitle title="Añadir Agente" subName="Agentes" />
      <AgentAdd />
    </>
  )
}

export default AddAgentPage 