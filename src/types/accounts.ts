/**
 * Types and Philippine Bank Card Templates for Kwarta Accounts System
 */

export type CardType = 'debit' | 'credit';
export type CardNetwork = 'Visa' | 'Mastercard' | 'JCB';

export interface AccountCard {
  id: string;
  name: string;
  bank: string;
  type: CardType;
  card_number_last4: string;
  balance_centavos: number;
  credit_limit_centavos?: number | null;
  cardholder_name: string;
  expiry_date: string;
  color_primary: string;
  color_secondary: string;
  network: CardNetwork;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountCardInput {
  name: string;
  bank: string;
  type: CardType;
  card_number_last4: string;
  balance_centavos?: number;
  credit_limit_centavos?: number | null;
  cardholder_name: string;
  expiry_date: string;
  color_primary: string;
  color_secondary: string;
  network: CardNetwork;
  is_default?: number;
}

export interface BankCardTemplate {
  id: string;
  bankName: string;
  cardName: string;
  defaultType: CardType;
  primaryColor: string;
  secondaryColor: string;
  network: CardNetwork;
  chipColor: 'gold' | 'silver';
  defaultCreditLimitCentavos?: number;
  badgeText: string;
  description: string;
}

export const PHILIPPINE_CARD_TEMPLATES: BankCardTemplate[] = [
  {
    id: 'bdo-platinum',
    bankName: 'BDO',
    cardName: 'BDO Titanium Mastercard',
    defaultType: 'credit',
    primaryColor: '#0B2F64',
    secondaryColor: '#1E3A8A',
    network: 'Mastercard',
    chipColor: 'gold',
    defaultCreditLimitCentavos: 5000000, // ₱50,000
    badgeText: 'BDO CREDIT',
    description: 'Premier Philippine rewards & travel credit card',
  },
  {
    id: 'bpi-rewards',
    bankName: 'BPI',
    cardName: 'BPI Rewards Card',
    defaultType: 'credit',
    primaryColor: '#8A1538',
    secondaryColor: '#4C0519',
    network: 'Mastercard',
    chipColor: 'gold',
    defaultCreditLimitCentavos: 6000000, // ₱60,000
    badgeText: 'BPI REWARDS',
    description: 'Iconic Burgundy card with point multipliers',
  },
  {
    id: 'unionbank-rewards',
    bankName: 'UnionBank',
    cardName: 'UnionBank Rewards Visa',
    defaultType: 'credit',
    primaryColor: '#EA580C',
    secondaryColor: '#18181B',
    network: 'Visa',
    chipColor: 'gold',
    defaultCreditLimitCentavos: 4500000, // ₱45,000
    badgeText: 'UB REWARDS',
    description: 'High-tech banking with 3x points on dining & shopping',
  },
  {
    id: 'metrobank-world',
    bankName: 'Metrobank',
    cardName: 'Metrobank World Mastercard',
    defaultType: 'credit',
    primaryColor: '#003882',
    secondaryColor: '#0F172A',
    network: 'Mastercard',
    chipColor: 'silver',
    defaultCreditLimitCentavos: 7500000, // ₱75,000
    badgeText: 'METROBANK',
    description: 'Exclusive worldwide privileges & perks',
  },
  {
    id: 'rcbc-flex',
    bankName: 'RCBC',
    cardName: 'RCBC Bankard Flex Visa',
    defaultType: 'credit',
    primaryColor: '#18181B',
    secondaryColor: '#2563EB',
    network: 'Visa',
    chipColor: 'silver',
    defaultCreditLimitCentavos: 5000000, // ₱50,000
    badgeText: 'RCBC FLEX',
    description: 'Flexible 0% installment conversions',
  },
  {
    id: 'secbank-platinum',
    bankName: 'Security Bank',
    cardName: 'Security Bank Platinum',
    defaultType: 'credit',
    primaryColor: '#005A9C',
    secondaryColor: '#15803D',
    network: 'Mastercard',
    chipColor: 'silver',
    defaultCreditLimitCentavos: 6500000, // ₱65,000
    badgeText: 'SECURITY BANK',
    description: 'Dual currency billing & unlimited lounge access',
  },
  {
    id: 'bdo-debit',
    bankName: 'BDO',
    cardName: 'BDO Debit Mastercard',
    defaultType: 'debit',
    primaryColor: '#1E3A8A',
    secondaryColor: '#0369A1',
    network: 'Mastercard',
    chipColor: 'gold',
    badgeText: 'BDO DEBIT',
    description: 'Everyday payroll & savings account debit card',
  },
  {
    id: 'bpi-debit',
    bankName: 'BPI',
    cardName: 'BPI Debit Mastercard',
    defaultType: 'debit',
    primaryColor: '#991B1B',
    secondaryColor: '#1F2937',
    network: 'Mastercard',
    chipColor: 'gold',
    badgeText: 'BPI DEBIT',
    description: 'Fast contactless payments & instant ATM access',
  },
  {
    id: 'maya-card',
    bankName: 'Maya',
    cardName: 'Maya Black Card',
    defaultType: 'debit',
    primaryColor: '#0F172A',
    secondaryColor: '#059669',
    network: 'Visa',
    chipColor: 'silver',
    badgeText: 'MAYA VISA',
    description: 'Digital banking card with high savings interest',
  },
  {
    id: 'gcash-card',
    bankName: 'GCash',
    cardName: 'GCash Visa Card',
    defaultType: 'debit',
    primaryColor: '#0284C7',
    secondaryColor: '#1D4ED8',
    network: 'Visa',
    chipColor: 'silver',
    badgeText: 'GCASH VISA',
    description: 'Direct link to your GCash wallet balance',
  },
  {
    id: 'kwarta-emerald',
    bankName: 'Kwarta',
    cardName: 'Kwarta Signature Debit',
    defaultType: 'debit',
    primaryColor: '#064E3B',
    secondaryColor: '#0F766E',
    network: 'Visa',
    chipColor: 'gold',
    badgeText: 'KWARTA SIGNATURE',
    description: 'Integrated local wallet & offline-first cash card',
  },
];
