import CategoryIcon from '@mui/icons-material/Category'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import FlightIcon from '@mui/icons-material/Flight'
import HomeIcon from '@mui/icons-material/Home'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import NightlifeIcon from '@mui/icons-material/Nightlife'
import PetsIcon from '@mui/icons-material/Pets'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SchoolIcon from '@mui/icons-material/School'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import type { ElementType } from 'react'

export const CATEGORY_ICONS: Record<string, ElementType> = {
  home: HomeIcon,
  nightlife: NightlifeIcon,
  cart: ShoppingCartIcon,
  bag: ShoppingBagIcon,
  games: SportsEsportsIcon,
  restaurant: RestaurantIcon,
  car: DirectionsCarIcon,
  travel: FlightIcon,
  health: LocalHospitalIcon,
  pets: PetsIcon,
  school: SchoolIcon,
  other: CategoryIcon,
}

export const CATEGORY_COLORS = ['#3f6b4f', '#b5651d', '#c9a227', '#7a5c8f', '#b84a4a', '#2f7f86', '#8a8a7a', '#c97a9a']

export function iconFor(key: string): ElementType {
  return CATEGORY_ICONS[key] ?? CategoryIcon
}
