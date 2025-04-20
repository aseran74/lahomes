export const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'disponible':
      return 'success';
    case 'reservada':
      return 'warning';
    case 'vendida':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}; 