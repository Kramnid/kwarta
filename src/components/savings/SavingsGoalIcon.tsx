import React from 'react';
import {
  PiggyBank,
  Laptop,
  Plane,
  Car,
  Home,
  GraduationCap,
  ShieldCheck,
  Gift,
  Smartphone,
  Heart,
  Target,
  Trophy,
  Briefcase,
  Wallet,
  Sparkles,
} from 'lucide-react-native';

interface SavingsGoalIconProps {
  name?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function SavingsGoalIcon({
  name = '',
  color = '#10B981',
  size = 20,
  strokeWidth = 2,
}: SavingsGoalIconProps) {
  const normalized = (name || '').toLowerCase().replace(/_/g, '-');

  switch (normalized) {
    case 'piggy-bank':
    case 'piggybank':
    case 'savings':
      return <PiggyBank size={size} color={color} strokeWidth={strokeWidth} />;

    case 'laptop':
    case 'tech':
    case 'computer':
      return <Laptop size={size} color={color} strokeWidth={strokeWidth} />;

    case 'plane':
    case 'travel':
    case 'vacation':
    case 'flight':
      return <Plane size={size} color={color} strokeWidth={strokeWidth} />;

    case 'car':
    case 'vehicle':
    case 'automobile':
      return <Car size={size} color={color} strokeWidth={strokeWidth} />;

    case 'home':
    case 'house':
    case 'property':
      return <Home size={size} color={color} strokeWidth={strokeWidth} />;

    case 'graduation-cap':
    case 'graduationcap':
    case 'education':
    case 'school':
    case 'college':
      return <GraduationCap size={size} color={color} strokeWidth={strokeWidth} />;

    case 'shield-check':
    case 'shieldcheck':
    case 'emergency':
    case 'emergency-fund':
    case 'security':
      return <ShieldCheck size={size} color={color} strokeWidth={strokeWidth} />;

    case 'gift':
    case 'celebration':
    case 'birthday':
      return <Gift size={size} color={color} strokeWidth={strokeWidth} />;

    case 'smartphone':
    case 'phone':
    case 'mobile':
      return <Smartphone size={size} color={color} strokeWidth={strokeWidth} />;

    case 'heart':
    case 'health':
    case 'family':
    case 'medical':
      return <Heart size={size} color={color} strokeWidth={strokeWidth} />;

    case 'target':
    case 'milestone':
      return <Target size={size} color={color} strokeWidth={strokeWidth} />;

    case 'trophy':
    case 'achievement':
    case 'award':
      return <Trophy size={size} color={color} strokeWidth={strokeWidth} />;

    case 'briefcase':
    case 'business':
    case 'career':
    case 'work':
      return <Briefcase size={size} color={color} strokeWidth={strokeWidth} />;

    case 'wallet':
    case 'money':
      return <Wallet size={size} color={color} strokeWidth={strokeWidth} />;

    case 'sparkles':
    case 'dream':
    case 'wish':
    default:
      return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;
  }
}

export default SavingsGoalIcon;
