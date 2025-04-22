'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Badge,
  Row,
  Col,
} from 'react-bootstrap'

// Tipos
interface Recipient {
  id: string
  email: string
  name: string
}

interface Message {
  id: string
  subject: string
  content: string
  recipient_id: string
  created_at: string
  recipient_name?: string
  recipient_email?: string
}

interface Owner {
  id: string
  email: string
  nombre: string
  apellidos: string
}

interface Agent {
  id: string
  email: string
  name: string
}

const SendMessageForm = () => {
  const { data: session } = useSession()
  const [senderId, setSenderId] = useState<string | null>(null)
  
  // Estados para el formulario
  const [recipientType, setRecipientType] = useState<'owners' | 'agents'>('owners')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  
  // Estados para los datos
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Obtener el ID del remitente cuando la sesión esté disponible
  useEffect(() => {
    const getSenderId = async () => {
      if (!session?.user?.email) {
        console.log('No hay email en la sesión');
        return;
      }

      console.log('Buscando usuario con email:', session.user.email);

      try {
        // Si el email es el de admin, le damos acceso directo
        if (session.user.email === 'user@demo.com') {
          console.log('Usuario admin detectado');
          // Intentamos obtener el ID del admin de la tabla users
          const { data: adminData, error: adminError } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();

          if (adminData) {
            console.log('ID de admin encontrado:', adminData.id);
            setSenderId(adminData.id);
            return;
          } else {
            console.log('No se encontró ID de admin, usando ID por defecto');
            setSenderId('00000000-0000-0000-0000-000000000000'); // ID por defecto para admin
            return;
          }
        }

        // Primero intentamos encontrar en la tabla de agentes
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('id, email')
          .eq('email', session.user.email.toLowerCase())
          .single()

        if (agentError && agentError.message !== 'No rows returned') {
          console.log('Error buscando en agents:', agentError.message);
        }

        if (agentData) {
          console.log('Usuario encontrado en agents:', agentData);
          setSenderId(agentData.id)
          return
        }

        // Si no es un agente, buscamos en la tabla de owners
        const { data: ownerData, error: ownerError } = await supabase
          .from('owners')
          .select('id, email')
          .eq('email', session.user.email.toLowerCase())
          .single()

        if (ownerError && ownerError.message !== 'No rows returned') {
          console.log('Error buscando en owners:', ownerError.message);
        }

        if (ownerData) {
          console.log('Usuario encontrado en owners:', ownerData);
          setSenderId(ownerData.id)
          return
        }

        // Si no encontramos el ID en ninguna tabla y no es admin, mostramos un error
        if (!agentData && !ownerData && session.user.email !== 'user@demo.com') {
          console.log('Usuario no encontrado en ninguna tabla');
          setError(`No se encontró usuario con el email ${session.user.email} en ninguna tabla`)
        }
      } catch (err) {
        console.error('Error getting sender ID:', err)
        setError('Error al obtener los permisos de usuario')
      }
    }

    getSenderId()
  }, [session?.user?.email])

  // Cargar destinatarios
  useEffect(() => {
    const loadRecipients = async () => {
      try {
        setLoading(true)
        setError(null)

        if (recipientType === 'owners') {
          const { data: owners, error: ownersError } = await supabase
            .from('owners')
            .select('id, email, nombre, apellidos')

          if (ownersError) throw ownersError

          const formattedOwners = (owners || []).map(owner => ({
            id: owner.id,
            email: owner.email,
            name: `${owner.nombre} ${owner.apellidos}`
          }))

          setRecipients(formattedOwners)
        } else {
          const { data: agents, error: agentsError } = await supabase
            .from('agents')
            .select('id, email, name')

          if (agentsError) throw agentsError

          const formattedAgents = (agents || []).map(agent => ({
            id: agent.id,
            email: agent.email,
            name: agent.name
          }))

          setRecipients(formattedAgents)
        }

        setSelectedRecipients([]) // Resetear selección al cambiar tipo
      } catch (err) {
        setError('Error al cargar destinatarios: ' + (err as Error).message)
        console.error('Error loading recipients:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRecipients()
  }, [recipientType])

  // Cargar historial de mensajes
  useEffect(() => {
    const loadMessages = async () => {
      if (!senderId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', senderId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Obtener información de los destinatarios
        const messagesWithRecipients = await Promise.all(
          data.map(async (message) => {
            let recipientInfo
            if (recipientType === 'owners') {
              const { data: owner } = await supabase
                .from('owners')
                .select('nombre, apellidos, email')
                .eq('id', message.recipient_id)
                .single()
              
              recipientInfo = owner ? {
                name: `${owner.nombre} ${owner.apellidos}`,
                email: owner.email
              } : null
            } else {
              const { data: agent } = await supabase
                .from('agents')
                .select('name, email')
                .eq('id', message.recipient_id)
                .single()
              
              recipientInfo = agent ? {
                name: agent.name,
                email: agent.email
              } : null
            }

            return {
              ...message,
              recipient_name: recipientInfo?.name || 'Destinatario desconocido',
              recipient_email: recipientInfo?.email || 'Email no disponible'
            }
          })
        )

        setMessages(messagesWithRecipients)
      } catch (err) {
        console.error('Error loading messages:', err)
        setError('Error al cargar mensajes: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [senderId, recipientType])

  // Enviar mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senderId || selectedRecipients.length === 0 || !subject || !content) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // ID fijo del usuario administrador creado manualmente
      const ADMIN_USER_ID = 'ade32426-8a6f-46ff-b0c3-54f48ebd418f'; // ID del usuario admin3@test.com
      
      console.log('Verificando ID de administrador:', ADMIN_USER_ID);
      
      // Verificamos directamente si el ID del admin existe en la tabla users
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('*') // Seleccionar todos los campos para ver qué contiene la tabla
        .eq('id', ADMIN_USER_ID);
        
      console.log('Resultado de la consulta:', { data: adminUser, error: adminError });
      
      // Verificar si hay registros en la tabla users
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(10);
        
      console.log('Usuarios en la tabla:', { data: allUsers, error: allUsersError });
      
      // Verificar si la tabla existe
      try {
        const { data: tableInfo } = await supabase
          .from('users')
          .select('count(*)')
          .limit(1)
          .single();
          
        console.log('Información de la tabla users:', tableInfo);
      } catch (tableCheckErr) {
        console.error('Error al verificar la tabla users:', tableCheckErr);
      }
      
      // Buscar en otras tablas posibles
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', ADMIN_USER_ID);
          
        console.log('Búsqueda en tabla profiles:', profilesData);
      } catch (profilesErr) {
        console.log('La tabla profiles no existe o error:', profilesErr);
      }
      
      // Intentar usar directamente el ID del administrador
      let validSenderId = ADMIN_USER_ID;
      console.log('Usando ID de administrador directamente:', validSenderId);
      
      // Crear mensajes para cada destinatario seleccionado
      const messages = selectedRecipients.map(recipientId => ({
        sender_id: validSenderId,
        recipient_id: recipientId,
        subject,
        content,
        recipient_type: selectedRecipients.length > 1 ? 'mass' : 'individual'
      }));

      console.log('Intentando insertar mensajes con sender_id:', validSenderId);
      
      // Intentamos la inserción de mensajes
      const { data: insertedMessages, error: sendError } = await supabase
        .from('messages')
        .insert(messages)
        .select();

      if (sendError) {
        console.error('Error al enviar mensajes:', sendError);
        
        // Verificar las relaciones de clave foránea
        try {
          let fkInfo = null;
          try {
            const { data } = await supabase.rpc('get_foreign_keys_info', { 
              table_name: 'messages' 
            });
            fkInfo = data;
          } catch {
            // Ignorar errores
          }
          
          console.log('Información de claves foráneas:', fkInfo);
        } catch (fkErr) {
          console.log('No se pudo obtener información de claves foráneas');
        }
        
        throw new Error(`Error al insertar mensajes: ${sendError.message}`);
      }

      console.log('Mensajes insertados correctamente:', insertedMessages);
      setSuccess('Mensaje(s) enviado(s) correctamente');
      setSubject('');
      setContent('');
      setSelectedRecipients([]);

      // Recargar mensajes
      const { data: newMessages, error: loadError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', validSenderId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (loadError) throw loadError;
      setMessages(newMessages);

    } catch (err) {
      setError('Error al enviar mensaje: ' + (err as Error).message);
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Enviar Mensaje</h4>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Destinatario</Form.Label>
                <Form.Select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as 'owners' | 'agents')}
                  disabled={loading}
                >
                  <option value="owners">Propietarios</option>
                  <option value="agents">Agentes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Destinatarios</Form.Label>
                <Form.Select
                  multiple
                  value={selectedRecipients}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(option => option.value)
                    setSelectedRecipients(selected)
                  }}
                  disabled={loading}
                  style={{ height: '100px' }}
                >
                  {recipients.map(recipient => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.email})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Mantén presionado Ctrl/Cmd para seleccionar múltiples destinatarios
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Asunto</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <Button 
            type="submit" 
            disabled={loading || selectedRecipients.length === 0 || !senderId}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              `Enviar Mensaje${selectedRecipients.length > 1 ? 's' : ''}`
            )}
          </Button>
        </Form>

        {/* Historial de Mensajes */}
        <div className="mt-4 pt-3 border-top">
          <h5 className="mb-3">Historial de Mensajes</h5>
          {messages.length > 0 ? (
            <ListGroup variant="flush">
              {messages.map(message => (
                <ListGroup.Item key={message.id} className="px-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{message.subject}</strong>
                    <small className="text-muted">
                      {new Date(message.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="mb-1">
                    <Badge bg="info" className="me-2">
                      {message.recipient_name}
                    </Badge>
                    <small className="text-muted">{message.recipient_email}</small>
                  </div>
                  <p className="mb-0 text-muted">{message.content}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">No hay mensajes enviados</p>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

export default SendMessageForm