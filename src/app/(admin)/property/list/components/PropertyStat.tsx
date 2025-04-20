'use client'

import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { supabase } from '@/lib/supabase';

interface PropertyStats {
  totalIncome: number;
  totalProperties: number;
  soldShares: number;
  availableShares: number;
}

const PropertyStat = () => {
  const [stats, setStats] = useState<PropertyStats>({
    totalIncome: 0,
    totalProperties: 0,
    soldShares: 0,
    availableShares: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Obtener total de propiedades
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('total_price');
        
        if (propertiesError) throw propertiesError;

        // Obtener shares vendidas y disponibles
        const { data: shares, error: sharesError } = await supabase
          .from('property_shares')
          .select('estado');

        if (sharesError) throw sharesError;

        const totalIncome = properties?.reduce((sum, prop) => sum + (prop.total_price || 0), 0) || 0;
        const totalProperties = properties?.length || 0;
        const soldShares = shares?.filter(share => share.estado === 'vendida').length || 0;
        const availableShares = shares?.filter(share => share.estado === 'disponible').length || 0;

        setStats({
          totalIncome,
          totalProperties,
          soldShares,
          availableShares
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statData = [
    {
      title: 'Ingresos Totales',
      amount: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats.totalIncome),
      icon: 'solar:wallet-money-bold-duotone',
      change: 0,
      variant: 'success',
    },
    {
      title: 'Total Propiedades',
      amount: `${stats.totalProperties} Unidades`,
      icon: 'solar:home-bold-duotone',
      change: 0,
      variant: 'primary',
    },
    {
      title: 'Copropiedades Vendidas',
      amount: `${stats.soldShares} Unidades`,
      icon: 'solar:check-square-bold-duotone',
      change: 0,
      variant: 'success',
    },
    {
      title: 'Copropiedades Disponibles',
      amount: `${stats.availableShares} Unidades`,
      icon: 'solar:key-minimalistic-square-bold-duotone',
      change: 0,
      variant: 'info',
    },
  ];

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Row className="g-3 mb-4">
      {statData.map((stat, index) => (
        <Col key={index} sm={6} xl={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-start justify-content-between">
                <div className="content">
                  <span className="fw-medium d-block mb-1">{stat.title}</span>
                  <h3 className="mb-2">{stat.amount}</h3>
                  <small className={`text-${stat.variant}`}>
                    <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>{' '}
                    <span>vs mes anterior</span>
                  </small>
                </div>
                <div className={`avatar avatar-stats p-50 bg-light-${stat.variant}`}>
                  <div className="avatar-content">
                    <IconifyIcon icon={stat.icon} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PropertyStat;
