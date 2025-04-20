import { currency } from '@/context/constants'

export type PropertyStatType = {
  title: string
  amount: string
  icon: string
  change: number
  variant: string
}

export const propertyStatData: PropertyStatType[] = [
  {
    title: 'Ingresos Totales',
    amount: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(127812.09),
    icon: 'solar:wallet-money-bold-duotone',
    change: 34.4,
    variant: 'success',
  },
  {
    title: 'Total Propiedades',
    amount: '158 Unidades',
    icon: 'solar:home-bold-duotone',
    change: 8.5,
    variant: 'danger',
  },
  {
    title: 'Copropiedades Vendidas',
    amount: '89 Unidades',
    icon: 'solar:check-square-bold-duotone',
    change: 17,
    variant: 'success',
  },
  {
    title: 'Copropiedades Disponibles',
    amount: '45 Unidades',
    icon: 'solar:key-minimalistic-square-bold-duotone',
    change: 12,
    variant: 'danger',
  },
]
