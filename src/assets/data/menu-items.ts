import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENÚ',
    isTitle: true,
  },
  {
    key: 'property',
    label: 'Copropiedades',
    icon: 'ri:community-line',
    children: [
      {
        key: 'property-grid',
        label: 'Vista en Cuadrícula',
        url: '/property/grid',
        parentKey: 'property',
      },
      {
        key: 'property-list',
        label: 'Vista en Lista',
        url: '/property/list',
        parentKey: 'property',
      },
      {
        key: 'property-details',
        label: 'Detalles de Copropiedad',
        url: '/property/details',
        parentKey: 'property',
      },
      {
        key: 'add-property',
        label: 'Añadir Copropiedad',
        url: '/property/add',
        parentKey: 'property',
      }
    ],
  },
  {
    key: 'owners',
    label: 'Propietarios',
    icon: 'ri:user-star-line',
    children: [
      {
        key: 'owners-list',
        label: 'Lista de Propietarios',
        url: '/owners/list-view',
        parentKey: 'owners',
      },
      {
        key: 'owners-details',
        label: 'Detalles de Propietario',
        url: '/owners/details',
        parentKey: 'owners',
      },
      {
        key: 'add-owner',
        label: 'Añadir Propietario',
        url: '/owners/add',
        parentKey: 'owners',
      },
    ],
  },
  {
    key: 'agents',
    label: 'Agentes',
    isTitle: false,
    icon: 'ri:team-line',
    children: [
      {
        key: 'agents-list',
        label: 'Lista de Agentes',
        url: '/agents/list-view',
        parentKey: 'agents',
      },
      {
        key: 'agents-add',
        label: 'Añadir Agente',
        url: '/agents/add',
        parentKey: 'agents',
      },
      {
        key: 'agents-details',
        label: 'Detalles de Agente',
        url: '/agents/details',
        parentKey: 'agents',
      }
    ],
  },
  {
    key: 'commissions',
    label: 'Comisiones',
    icon: 'ri:money-euro-circle-line',
    url: '/commissions',
  },
  {
    key: 'messages',
    label: 'Mensajes',
    icon: 'ri:discuss-line',
    url: '/messages',
  },
  {
    key: 'invoices',
    label: 'Facturas',
    icon: 'ri:bill-line',
    url: '/invoices',
  },
  {
    key: 'inbox',
    label: 'Bandeja de Entrada',
    icon: 'ri:inbox-line',
    url: '/inbox',
  },
]
