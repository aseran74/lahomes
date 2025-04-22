'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Container, Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Footer from './Footer';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar color="light" light expand="md" className="mb-3">
        <Container>
          <NavbarBrand href="/">
            <img 
              src="/assets/images/logo.png" 
              alt="LA Homes" 
              height="30" 
              className="d-inline-block align-top mr-2"
            />
            LA Homes
          </NavbarBrand>
          <Nav className="ms-auto" navbar>
            <NavItem>
              <NavLink tag={Link} href="/">
                Inicio
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} href="/propiedades">
                Propiedades
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} href="/nosotros">
                Nosotros
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} href="/contacto">
                Contacto
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} href="/auth/login" className="btn btn-primary text-white">
                Iniciar Sesión
              </NavLink>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>

      <main>{children}</main>

      <Footer />
    </div>
  );
};

export default PublicLayout; 