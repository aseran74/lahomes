import { Row } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
// import { ChatProvider } from '@/context/useChatContext' // Ya no es necesario
import type { Metadata } from 'next'
// import ChatApp from './components/ChatApp' // Ya no es necesario
import SendMessageForm from './components/SendMessageForm' // Importar el nuevo componente

export const metadata: Metadata = { title: 'Messages' }

const MessagesPage = () => { // Renombrar para claridad
  return (
    <>
      <PageTitle title="Messages" subName="Real Estate" />
      <Row>
        {/* <ChatProvider> // Ya no es necesario */}
          {/* <ChatApp /> // Reemplazado */}
          <SendMessageForm /> { /* Renderizar el nuevo componente */ }
        {/* </ChatProvider> // Ya no es necesario */}
      </Row>
    </>
  )
}

export default MessagesPage // Actualizar exportación
