'use client'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import TextAreaFormInput from '@/components/from/TextAreaFormInput'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const AgentDetails = () => {
  const messageSchema = yup.object({
    date: yup.string().required('Por favor ingrese la fecha'),
    time: yup.string().required('Por favor ingrese la hora'),
    name: yup.string().required('Por favor ingrese su nombre'),
    number: yup.string().required('Por favor ingrese su número'),
    email: yup.string().email().required('Por favor ingrese su email'),
    description: yup.string().required('Por favor ingrese su mensaje'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  })
  
  return (
    <>
      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as={'h4'}>Agente Inmobiliario</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center">
            <Image src={avatar1} alt="agente" className="avatar-xl rounded-circle border border-2 border-light mx-auto" />
            <div className="mt-2">
              <Link href="" className="fw-medium text-dark fs-16">
                Carlos Rodríguez
              </Link>
              <p className="text-muted mb-1">Agente Senior</p>
              <p className="mb-0">Especialista en Copropiedades</p>
            </div>
            <div className="mt-3">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:buildings-3-broken" className="fs-16 text-primary me-1" />
                  <span className="text-muted">45 Propiedades</span>
                </div>
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:star-bold" className="fs-16 text-warning me-1" />
                  <span className="text-muted">4.8/5</span>
                </div>
              </div>
              <div className="d-flex justify-content-center mt-2">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:clock-circle-broken" className="fs-16 text-primary me-1" />
                  <span className="text-muted">5 años exp.</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ul className="list-inline justify-content-center d-flex gap-1 mb-0 align-items-center">
                <li className="list-inline-item">
                  <Button variant="light" className="d-flex avatar-sm align-items-center justify-content-center text-primary fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:facebook-fill" />
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="light" className="avatar-sm d-flex align-items-center justify-content-center text-danger fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:instagram-fill" />
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="light" className="avatar-sm d-flex align-items-center justify-content-center text-info fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:linkedin-fill" />
                  </Button>
                </li>
                <li className="list-inline-item">
                  <Button variant="light" className="avatar-sm d-flex align-items-center justify-content-center text-success fs-20">
                    <IconifyIcon width={20} height={20} icon="ri:whatsapp-fill" />
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
        <CardFooter className="bg-light-subtle">
          <Row className="g-2">
            <div className="col-6">
              <Button variant="primary" className="w-100">
                <IconifyIcon icon="solar:phone-calling-bold-duotone" className="align-middle fs-18" /> Llamar
              </Button>
            </div>
            <div className="col-6">
              <Button variant="success" className="w-100">
                <IconifyIcon icon="solar:chat-round-dots-bold-duotone" className="align-middle fs-16" /> WhatsApp
              </Button>
            </div>
          </Row>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="bg-light-subtle">
          <CardTitle as={'h4'}>Agendar Visita</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(() => {})}>
          <CardBody>
            <div className="mb-3">
              <TextFormInput control={control} name="date" type="date" placeholder="dd-mm-yyyy" label="Fecha" />
            </div>
            <div className="mb-3">
              <TextFormInput control={control} name="time" type="time" placeholder="12:00" label="Hora" />
            </div>
            <div className="mb-3">
              <TextFormInput control={control} name="name" placeholder="Nombre Completo" label="Nombre" />
            </div>
            <div className="mb-3">
              <TextFormInput control={control} name="email" type="email" placeholder="Email" label="Correo Electrónico" />
            </div>
            <div className="mb-3">
              <TextFormInput control={control} name="number" type="tel" placeholder="Teléfono" label="Número de Contacto" />
            </div>
            <div>
              <TextAreaFormInput
                control={control}
                name="description"
                className="form-control"
                id="schedule-textarea"
                rows={5}
                placeholder="Mensaje"
                label="Mensaje"
              />
            </div>
          </CardBody>
          <CardFooter className="bg-light-subtle">
            <Button variant="primary" type='submit' className="w-100">
              Enviar Solicitud
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}

export default AgentDetails
