'use client'

import { useEffect, useRef } from 'react'

interface GoogleMapProps {
  address?: string
  lat?: number
  lng?: number
  zoom?: number
  height?: number | string
  className?: string
}

const GoogleMap = ({ 
  address, 
  lat = 40.4167754, 
  lng = -3.7037902, 
  zoom = 15, 
  height = 400,
  className = ''
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Inicializar el mapa
    const mapOptions: google.maps.MapOptions = {
      center: { lat, lng },
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    }

    const map = new google.maps.Map(mapRef.current, mapOptions)
    mapInstanceRef.current = map

    // Si hay una dirección, geocodificarla
    if (address) {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location = results[0].geometry.location
          map.setCenter(location)
          
          // Actualizar o crear el marcador
          if (markerRef.current) {
            markerRef.current.setPosition(location)
          } else {
            markerRef.current = new google.maps.Marker({
              map,
              position: location,
              animation: google.maps.Animation.DROP
            })
          }
        }
      })
    } else {
      // Si no hay dirección, usar lat/lng
      const position = { lat, lng }
      
      // Actualizar o crear el marcador
      if (markerRef.current) {
        markerRef.current.setPosition(position)
      } else {
        markerRef.current = new google.maps.Marker({
          map,
          position,
          animation: google.maps.Animation.DROP
        })
      }
    }

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }
  }, [address, lat, lng, zoom])

  return (
    <div 
      ref={mapRef} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-100 rounded ${className}`}
    />
  )
}

export default GoogleMap 