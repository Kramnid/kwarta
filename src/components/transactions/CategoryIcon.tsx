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
  Coffee,
  Home,
  Plane,
  Tv,
  Fuel,
  Book,
  Music,
  Dumbbell,
  Shirt,
  Wrench,
  Phone,
  Landmark,
  Coins,
  Award,
} from 'lucide-react-native';

export const AVAILABLE_CATEGORY_ICONS = [
  { id: 'utensils', label: 'Food & Dining' },
  { id: 'coffee', label: 'Coffee & Cafes' },
  { id: 'shopping-cart', label: 'Groceries' },
  { id: 'shopping-bag', label: 'Shopping' },
  { id: 'shirt', label: 'Clothing' },
  { id: 'car', label: 'Transportation' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'home', label: 'Housing & Rent' },
  { id: 'receipt', label: 'Bills & Utilities' },
  { id: 'phone', label: 'Mobile & Internet' },
  { id: 'heart-pulse', label: 'Health & Medical' },
  { id: 'dumbbell', label: 'Fitness' },
  { id: 'graduation-cap', label: 'Education' },
  { id: 'book', label: 'Books & Learning' },
  { id: 'gamepad-2', label: 'Entertainment' },
  { id: 'tv', label: 'Streaming & Media' },
  { id: 'music', label: 'Music' },
  { id: 'plane', label: 'Travel & Trips' },
  { id: 'sparkles', label: 'Personal Care' },
  { id: 'wrench', label: 'Maintenance' },
  { id: 'briefcase', label: 'Salary & Job' },
  { id: 'wallet', label: 'Allowance' },
  { id: 'laptop', label: 'Freelance & Tech' },
  { id: 'store', label: 'Business' },
  { id: 'trending-up', label: 'Investments' },
  { id: 'landmark', label: 'Bank & Interest' },
  { id: 'coins', label: 'Passive Income' },
  { id: 'gift', label: 'Gifts' },
  { id: 'award', label: 'Bonus & Awards' },
  { id: 'circle-dollar-sign', label: 'Other Money' },
  { id: 'tag', label: 'General / Tag' },
  { id: 'ellipsis', label: 'Other' },
];

export const AVAILABLE_CATEGORY_COLORS = [
  '#10B981', // Emerald
  '#059669', // Dark Emerald
  '#06B6D4', // Cyan
  '#38BDF8', // Sky
  '#60A5FA', // Blue
  '#818CF8', // Indigo
  '#A78BFA', // Purple
  '#C084FC', // Violet
  '#E879F9', // Fuchsia
  '#F472B6', // Pink
  '#F87171', // Rose
  '#EF4444', // Red
  '#FB923C', // Orange
  '#FBBF24', // Amber
  '#FACC15', // Yellow
  '#34D399', // Mint
  '#94A3B8', // Slate
  '#64748B', // Cool Slate
];

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
    // Food & Groceries
    case 'utensils':
    case 'food':
    case 'food-drinks':
    case 'dining':
      return <Utensils size={size} color={color} />;
    case 'coffee':
    case 'cafe':
      return <Coffee size={size} color={color} />;
    case 'shopping-cart':
    case 'groceries':
      return <ShoppingCart size={size} color={color} />;

    // Shopping & Personal
    case 'shopping-bag':
    case 'shopping':
      return <ShoppingBag size={size} color={color} />;
    case 'shirt':
    case 'clothing':
    case 'apparel':
      return <Shirt size={size} color={color} />;
    case 'sparkles':
    case 'personal-care':
    case 'beauty':
      return <Sparkles size={size} color={color} />;

    // Transport & Travel
    case 'car':
    case 'transportation':
    case 'transit':
      return <Car size={size} color={color} />;
    case 'fuel':
    case 'gas':
      return <Fuel size={size} color={color} />;
    case 'plane':
    case 'travel':
    case 'vacation':
      return <Plane size={size} color={color} />;

    // Bills, Utilities & Living
    case 'receipt':
    case 'bills':
    case 'bills-utilities':
    case 'zap':
      return <Receipt size={size} color={color} />;
    case 'home':
    case 'housing':
    case 'rent':
      return <Home size={size} color={color} />;
    case 'phone':
    case 'mobile':
    case 'telecom':
      return <Phone size={size} color={color} />;
    case 'wrench':
    case 'maintenance':
    case 'repairs':
      return <Wrench size={size} color={color} />;

    // Health, Fitness & Education
    case 'heart-pulse':
    case 'health':
    case 'medical':
      return <HeartPulse size={size} color={color} />;
    case 'dumbbell':
    case 'fitness':
    case 'gym':
      return <Dumbbell size={size} color={color} />;
    case 'graduation-cap':
    case 'education':
      return <GraduationCap size={size} color={color} />;
    case 'book':
    case 'books':
      return <Book size={size} color={color} />;

    // Entertainment & Leisure
    case 'gamepad-2':
    case 'gamepad2':
    case 'entertainment':
      return <Gamepad2 size={size} color={color} />;
    case 'tv':
    case 'streaming':
    case 'movies':
      return <Tv size={size} color={color} />;
    case 'music':
      return <Music size={size} color={color} />;

    // Income Icons
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
    case 'landmark':
    case 'bank':
      return <Landmark size={size} color={color} />;
    case 'coins':
      return <Coins size={size} color={color} />;
    case 'award':
    case 'bonus':
      return <Award size={size} color={color} />;
    case 'circle-dollar-sign':
    case 'plus-circle':
    case 'other-income':
      return <CircleDollarSign size={size} color={color} />;

    case 'ellipsis':
    case 'more-horizontal':
    case 'other':
      return <Ellipsis size={size} color={color} />;

    default:
      return <Tag size={size} color={color} />;
  }
}

export default CategoryIcon;
