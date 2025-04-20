import { currency } from '@/context/constants'
import { ApexOptions } from 'apexcharts'

export type StatType = {
  title: string
  amount: string
  icon: string
  change?: number
  variant: string
}

export type CopropiedadType = {
  id: string
  nombre: string
  estado: 'Disponible' | 'Reservada' | 'Vendida'
  precio: string
  progreso: number
}

export type EstadisticasAgenteType = {
  titulo: string
  cantidad: string | number
  icono: string
  variante: string
  cambio?: number
}

export const estadisticasAgente: EstadisticasAgenteType[] = [
  {
    titulo: 'Copropiedades Gestionadas',
    cantidad: '24',
    icono: 'solar:buildings-3-bold-duotone',
    variante: 'primary',
  },
  {
    titulo: 'Copropiedades Vendidas',
    cantidad: '16',
    icono: 'solar:check-square-bold-duotone',
    cambio: 75,
    variante: 'success',
  },
  {
    titulo: 'Tasa de Conversión',
    cantidad: '66.7%',
    icono: 'solar:chart-2-bold-duotone',
    variante: 'warning',
  },
  {
    titulo: 'Comisiones Totales',
    cantidad: `${currency}145,800`,
    icono: 'solar:wallet-money-bold-duotone',
    variante: 'info',
  },
]

export const copropiedadesActivas: CopropiedadType[] = [
  {
    id: 'CP001',
    nombre: 'Residencial Los Pinos - Unidad 1',
    estado: 'Disponible',
    precio: `${currency}80,000`,
    progreso: 25
  },
  {
    id: 'CP002',
    nombre: 'Residencial Los Pinos - Unidad 2',
    estado: 'Reservada',
    precio: `${currency}80,000`,
    progreso: 50
  },
  {
    id: 'CP003',
    nombre: 'Residencial Los Pinos - Unidad 3',
    estado: 'Vendida',
    precio: `${currency}80,000`,
    progreso: 100
  },
  {
    id: 'CP004',
    nombre: 'Residencial Los Pinos - Unidad 4',
    estado: 'Disponible',
    precio: `${currency}80,000`,
    progreso: 25
  }
]

export const propiedadesCompletadas: CopropiedadType[] = [
  {
    id: 'CP005',
    nombre: 'Residencial El Bosque',
    estado: 'Vendida',
    precio: `${currency}320,000`,
    progreso: 100
  },
  {
    id: 'CP006',
    nombre: 'Residencial La Colina',
    estado: 'Vendida',
    precio: `${currency}280,000`,
    progreso: 100
  }
]

export const salesFunnelOptions: ApexOptions = {
  chart: {
    type: 'area',
    height: 165,
    sparkline: {
      enabled: true,
    },
  },
  series: [
    {
      data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
    },
  ],
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  markers: {
    size: 0,
  },
  colors: ['#604ae3'],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function (seriesName) {
          return ''
        },
      },
    },
    marker: {
      show: false,
    },
  },
}

export const estadisticasOptions: ApexOptions = {
  series: [
    {
      name: 'Copropiedades Vendidas',
      type: 'bar',
      data: [4, 3, 5, 4, 3, 5, 4, 3, 4, 5, 4, 3],
    },
    {
      name: 'Tasa de Conversión',
      type: 'line',
      data: [75, 65, 85, 75, 65, 85, 75, 65, 75, 85, 75, 65],
    },
  ],
  chart: {
    height: 330,
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    curve: 'straight',
    dashArray: [0, 8],
    width: [0, 2],
  },
  fill: {
    opacity: [4, 1],
  },
  markers: {
    size: [0, 0],
    strokeWidth: 2,
    hover: {
      size: 4,
    },
  },
  xaxis: {
    categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  },
  yaxis: [
    {
      title: {
        text: 'Copropiedades Vendidas',
      },
    },
    {
      opposite: true,
      title: {
        text: 'Tasa de Conversión (%)',
      },
    },
  ],
  tooltip: {
    shared: true,
    intersect: false,
  },
  grid: {
    borderColor: '#f1f1f1',
  },
  legend: {
    position: 'bottom',
  },
}
