'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>LA Homes</h5>
            <p>Encuentra tu hogar ideal con nosotros. Ofrecemos las mejores propiedades en ubicaciones privilegiadas.</p>
          </Col>
          <Col md={2}>
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/propiedades">Propiedades</Link></li>
              <li><Link href="/nosotros">Nosotros</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contacto</h5>
            <ul className="list-unstyled">
              <li>Dirección: Calle Principal 123</li>
              <li>Teléfono: (123) 456-7890</li>
              <li>Email: info@lahomes.com</li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Síguenos</h5>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="me-3">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="text-center">
            <p className="mb-0">© {new Date().getFullYear()} LA Homes. Todos los derechos reservados.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
