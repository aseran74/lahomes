'use client'
import { useState, useEffect } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table } from 'react-bootstrap'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import defaultAvatar from '@/assets/images/users/avatar-1.jpg'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

interface Owner {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  dni: string
  direccion?: string
  ciudad?: string
  codigo_postal?: string
  fecha_nacimiento?: string
  ocupacion?: string
  notas?: string
  created_at?: string
  updated_at?: string
  property?: {
    id: string
    name: string
    share_number: number
  }
}

const OwnerList = () => {
  const router = useRouter()
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalOwners, setTotalOwners] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadOwners = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('owners')
        .select(`
          *,
          property:property_shares_owners(
            property:properties(
              id,
              name
            ),
            share_number
          )
        `)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,dni.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      const transformedData = data?.map(owner => ({
        ...owner,
        property: owner.property?.[0] ? {
          id: owner.property[0].property.id,
          name: owner.property[0].property.name,
          share_number: owner.property[0].share_number
        } : undefined
      })) || []

      console.log('Owners cargados:', transformedData)
      setOwners(transformedData)
      if (count !== null) setTotalOwners(count)
    } catch (error: any) {
      console.error('Error loading owners:', error)
      toast.error('Error al cargar los propietarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOwners()
  }, [currentPage, searchTerm])

  const handleDelete = async (ownerId: string, ownerName: string) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar al propietario ${ownerName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })

      if (result.isConfirmed) {
        // Primero verificamos si el propietario tiene propiedades asociadas
        const { data: propertyOwners, error: propertyOwnersError } = await supabase
          .from('property_owners')
          .select('*')
          .eq('owner_id', ownerId)

        if (propertyOwnersError) throw propertyOwnersError

        if (propertyOwners && propertyOwners.length > 0) {
          await Swal.fire({
            title: 'No se puede eliminar',
            text: 'Este propietario tiene propiedades asociadas. Debes eliminar primero las asociaciones.',
            icon: 'error',
            confirmButtonText: 'Entendido'
          })
          return
        }

        const { error } = await supabase
          .from('owners')
          .delete()
          .eq('id', ownerId)

        if (error) throw error

        toast.success('Propietario eliminado exitosamente')
        loadOwners() // Recargamos la lista
      }
    } catch (error: any) {
      console.error('Error deleting owner:', error)
      toast.error('Error al eliminar el propietario')
    }
  }

  const handleEdit = (ownerId: string) => {
    router.push(`/owners/edit/${ownerId}`)
  }

  const totalPages = Math.ceil(totalOwners / itemsPerPage)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <Card>
      <CardBody>
        <Row className="justify-content-between align-items-center mb-3">
          <Col lg={4}>
            <div className="search-box">
              <input
                type="text"
                className="form-control search"
                placeholder="Buscar por nombre, apellidos, DNI o email..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </Col>
          <Col lg={8}>
            <div className="text-lg-end mt-3 mt-lg-0">
              <Link href="/owners/add" passHref>
                <Button variant="success" className="me-1">
                  <IconifyIcon icon="ri-add-line" className="me-1" />
                  Nuevo Propietario
                </Button>
              </Link>
              <Button variant="soft-primary">
                <IconifyIcon icon="ri-file-download-line" className="me-1" />
                Exportar
              </Button>
            </div>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table className="table-centered table-hover table-nowrap mb-0">
            <thead>
              <tr>
                <th scope="col">Propietario</th>
                <th scope="col">Propiedad</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Ciudad</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Cargando propietarios...
                  </td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    No se encontraron propietarios
                  </td>
                </tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Image
                          src={defaultAvatar}
                          alt="Owner"
                          width={32}
                          height={32}
                          className="rounded-circle me-2"
                        />
                        <div>
                          <h5 className="font-size-14 mb-1">
                            <Link href={`/owners/details/${owner.id}`} className="text-dark">
                              {owner.nombre} {owner.apellidos}
                            </Link>
                          </h5>
                          <p className="text-muted mb-0">DNI: {owner.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {owner.property ? (
                        <div>
                          <p className="mb-0">{owner.property.name}</p>
                          <small className="text-muted">Participación #{owner.property.share_number}</small>
                        </div>
                      ) : (
                        <span className="text-muted">Sin propiedad asignada</span>
                      )}
                    </td>
                    <td>{owner.email}</td>
                    <td>{owner.telefono}</td>
                    <td>{owner.ciudad || '-'}</td>
                    <td>
                      <Dropdown>
                        <DropdownToggle as="a" className="btn btn-link text-muted p-1">
                          <IconifyIcon icon="ri:more-2-fill" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem href={`/owners/details/${owner.id}`}>
                            <IconifyIcon icon="ri:eye-line" className="me-2" />
                            Ver Detalles
                          </DropdownItem>
                          <DropdownItem onClick={() => handleEdit(owner.id)}>
                            <IconifyIcon icon="ri:edit-line" className="me-2" />
                            Editar
                          </DropdownItem>
                          <DropdownItem onClick={() => handleDelete(owner.id, `${owner.nombre} ${owner.apellidos}`)}>
                            <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
                            Eliminar
                          </DropdownItem>
                          <DropdownItem href={`mailto:${owner.email}`}>
                            <IconifyIcon icon="ri:mail-send-line" className="me-2" />
                            Enviar Email
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <Row className="align-items-center mt-4">
          <Col>
            <p className="text-muted mb-0">
              Mostrando {owners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
              {Math.min(currentPage * itemsPerPage, totalOwners)} de {totalOwners} registros
            </p>
          </Col>
          <Col>
            <ul className="pagination pagination-rounded justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <Button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </li>
            </ul>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default OwnerList 