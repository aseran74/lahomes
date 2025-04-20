import { Card, CardBody } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface FormData {
  nombre: string;
  tipo: string;
  precio: number;
  habitaciones: number;
  banos: number;
  area: number;
  direccion: string;
  codigoPostal: string;
  copropiedad: number;
  estado: string;
  pisos: number;
}

interface PropertyAddCardProps {
  formData: FormData;
}

const PropertyAddCard = ({ formData }: PropertyAddCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'bg-success';
      case 'Reservada':
        return 'bg-warning';
      case 'Vendida':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="mb-4">
          <h5 className="card-title mb-0">{formData.nombre || 'Sin nombre'}</h5>
          <p className="text-muted mt-1 mb-0">{formData.tipo}</p>
        </div>

        <div className="d-flex gap-2 mb-3">
          <span className={`badge ${getStatusClass(formData.estado)}`}>
            {formData.estado}
          </span>
          <span className="badge bg-info">
            Copropiedad {formData.copropiedad}
          </span>
        </div>

        <div className="mb-3">
          <h6 className="mb-1">{formatPrice(formData.precio)}</h6>
          <p className="text-muted mb-0">{formData.direccion}</p>
          {formData.codigoPostal && (
            <p className="text-muted mb-0">CP: {formData.codigoPostal}</p>
          )}
        </div>

        <div className="d-flex gap-4 pt-3 border-top">
          <div>
            <IconifyIcon icon="solar:bed-broken" className="fs-22 text-primary" />
            <span className="ms-2">{formData.habitaciones}</span>
          </div>
          <div>
            <IconifyIcon icon="solar:bath-broken" className="fs-22 text-primary" />
            <span className="ms-2">{formData.banos}</span>
          </div>
          <div>
            <IconifyIcon icon="solar:scale-broken" className="fs-22 text-primary" />
            <span className="ms-2">{formData.area} m²</span>
          </div>
          <div>
            <IconifyIcon icon="solar:double-alt-arrow-up-broken" className="fs-22 text-primary" />
            <span className="ms-2">{formData.pisos}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default PropertyAddCard
