'use client'

import { Button, Col, Container, Row } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'

const NotFound = () => {
  return (
    <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5} xxl={4}>
            <div className="text-center">
              <h1 className="text-error">404</h1>
              <h4 className="text-uppercase text-danger mt-3">Página No Encontrada</h4>
              <p className="text-muted mt-3">
                Lo sentimos, no pudimos encontrar la página que estás buscando.
              </p>

              <Link href="/" passHref legacyBehavior>
                <Button variant="primary" className="mt-3">
                  <i className="mdi mdi-reply"></i> Volver al Inicio
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default NotFound 