'use client'

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PropertyDetailsRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    // Obtener los parámetros actuales
    const id = searchParams.get('id');
    const share = searchParams.get('share');
    
    // Construir la nueva URL con los mismos parámetros
    let newUrl = `/propiedades/detalles?id=${id}`;
    if (share) {
      newUrl += `&share=${share}`;
    }
    
    // Redirigir a la nueva ubicación
    router.replace(newUrl);
  }, [searchParams, router]);
  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <p>Redirigiendo...</p>
    </div>
  );
} 