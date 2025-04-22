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

/**
 * Formatea un precio en euros con separadores de miles y sin decimales
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '0 €';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Formatea una fecha en formato localizado
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Trunca un texto a la longitud especificada
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}; 