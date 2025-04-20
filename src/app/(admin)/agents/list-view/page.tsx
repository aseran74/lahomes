import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AgentList from './components/AgentList'

export const metadata: Metadata = {
  title: 'Lista de Agentes',
}

const AgentListPage = () => {
  return (
    <>
      <PageTitle title="Lista de Agentes" subName="Agentes" />
      <AgentList />
    </>
  )
}

export default AgentListPage 