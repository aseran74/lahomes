'use client'

import { Card, CardBody, CardHeader, CardTitle, Col, Row, Table } from 'react-bootstrap'
import Image from 'next/image'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import avatar5 from '@/assets/images/users/avatar-5.jpg'

interface Customer {
  id: number;
  name: string;
  email: string;
  avatar: any;
  properties: number;
  totalValue: number;
  status: 'Activo' | 'Inactivo' | 'Pendiente';
}

const customers: Customer[] = [
  {
    id: 1,
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    avatar: avatar1,
    properties: 3,
    totalValue: 750000,
    status: 'Activo'
  },
  {
    id: 2,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    avatar: avatar2,
    properties: 2,
    totalValue: 450000,
    status: 'Activo'
  },
  {
    id: 3,
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    avatar: avatar3,
    properties: 1,
    totalValue: 320000,
    status: 'Pendiente'
  },
  {
    id: 4,
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    avatar: avatar4,
    properties: 2,
    totalValue: 580000,
    status: 'Activo'
  },
  {
    id: 5,
    name: 'Laura Martínez',
    email: 'laura.martinez@email.com',
    avatar: avatar5,
    properties: 1,
    totalValue: 290000,
    status: 'Inactivo'
  }
];

const getStatusBadgeClass = (status: Customer['status']) => {
  switch (status) {
    case 'Activo':
      return 'bg-success';
    case 'Inactivo':
      return 'bg-danger';
    case 'Pendiente':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

const TopCustomer = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Clientes Principales</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table className="table-centered table-nowrap mb-0">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Propiedades</th>
                <th scope="col">Valor Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <Image
                        src={customer.avatar}
                        alt={customer.name}
                        className="rounded-circle"
                        width={32}
                        height={32}
                      />
                      <div className="ms-2">
                        <h5 className="mb-0 fs-14">{customer.name}</h5>
                        <p className="mb-0 text-muted">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{customer.properties}</td>
                  <td>
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(customer.totalValue)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

export default TopCustomer 