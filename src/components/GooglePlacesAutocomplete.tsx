'use client'

import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, city?: string, state?: string, zipCode?: string) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GooglePlacesAutocomplete = ({
  value,
  onChange,
  placeholder = 'Introduce una dirección',
  className = ''
}: GooglePlacesAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps JavaScript API no está cargada');
      return;
    }

    if (!inputRef.current) return;

    // Inicializar el autocompletado
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ES' }, // Restringir a España
      types: ['address'],
      fields: ['address_components', 'formatted_address']
    });

    // Manejar la selección de una dirección
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.address_components) {
        console.error('No se encontraron detalles de la dirección');
        return;
      }

      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zipCode = '';

      // Extraer los componentes de la dirección
      place.address_components.forEach((component: any) => {
        const types = component.types;

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      // Construir la dirección completa
      const address = `${route} ${streetNumber}`.trim();

      // Llamar al callback con todos los datos
      onChange(address, city, state, zipCode);
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <Form.Control
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
};

export default GooglePlacesAutocomplete; 