import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  Sparkles,
  Ellipsis,
  Briefcase,
  Wallet,
  Laptop,
  Store,
  Gift,
  TrendingUp,
  CircleDollarSign,
  Tag,
} from 'lucide-react-native';

interface CategoryIconProps {
  name?: string;
  color?: string;
  size?: number;
}

export function CategoryIcon({
  name = '',
  color = '#94A3B8',
  size = 18,
}: CategoryIconProps) {
  const normalized = (name || '').toLowerCase().replace(/_/g, '-');

  switch (normalized) {
    // Expense icons
    case 'utensils':
    case 'food':
    case 'food-drinks':
    case 'dining':
      return <Utensils size={size} color={color} />;
    case 'car':
    case 'transportation':
    case 'transit':
      return <Car size={size} color={color} />;
    case 'shopping-bag':
    case 'shopping':
      return <ShoppingBag size={size} color={color} />;
    case 'receipt':
    case 'bills':
    case 'bills-utilities':
    case 'zap':
      return <Receipt size={size} color={color} />;
    case 'gamepad-2':
    case 'gamepad2':
    case 'entertainment':
      return <Gamepad2 size={size} color={color} />;
    case 'heart-pulse':
    case 'health':
    case 'medical':
      return <HeartPulse size={size} color={color} />;
    case 'graduation-cap':
    case 'education':
      return <GraduationCap size={size} color={color} />;
    case 'shopping-cart':
    case 'groceries':
      return <ShoppingCart size={size} color={color} />;
    case 'sparkles':
    case 'personal-care':
      return <Sparkles size={size} color={color} />;
    case 'ellipsis':
    case 'more-horizontal':
    case 'other':
      return <Ellipsis size={size} color={color} />;

    // Income icons
    case 'briefcase':
    case 'salary':
      return <Briefcase size={size} color={color} />;
    case 'wallet':
    case 'allowance':
      return <Wallet size={size} color={color} />;
    case 'laptop':
    case 'freelance':
      return <Laptop size={size} color={color} />;
    case 'store':
    case 'business':
      return <Store size={size} color={color} />;
    case 'gift':
    case 'gifts':
      return <Gift size={size} color={color} />;
    case 'trending-up':
    case 'investments':
      return <TrendingUp size={size} color={color} />;
    case 'circle-dollar-sign':
    case 'plus-circle':
    case 'other-income':
      return <CircleDollarSign size={size} color={color} />;

    default:
      return <Tag size={size} color={color} />;
  }
}

export default CategoryIcon;

