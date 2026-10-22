/**
 * Savings Goals Domain Types for Kwarta
 *
 * All monetary amounts are stored as integer centavos to eliminate floating-point precision errors.
 * Savings entries are manual allocations separate from everyday income/expense transactions.
 */

export type SavingsGoalStatus = 'active' | 'completed' | 'archived';
export type SavingsEntryType = 'contribution' | 'withdrawal';

export interface SavingsGoal {
  id: string; // Stable text ID (e.g. 'goal_1729600000_abc')
  name: string; // Goal title (e.g. 'New Laptop', 'Emergency Fund')
  target_centavos: number; // Positive integer centavos
  deadline: string | null; // Calendar date: YYYY-MM-DD or null
  icon: string; // Icon identifier (e.g. 'laptop', 'piggy-bank')
  color: string; // Hex color code (e.g. '#10B981')
  note: string | null; // Optional user notes
  status: SavingsGoalStatus; // 'active' | 'completed' | 'archived'
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
  allocated_centavos: number; // Total contributions minus total withdrawals
}

export interface SavingsEntry {
  id: string; // Stable text ID (e.g. 'entry_1729600000_abc')
  goal_id: string; // Reference to SavingsGoal.id
  type: SavingsEntryType; // 'contribution' | 'withdrawal'
  amount_centavos: number; // Positive integer centavos
  note: string | null; // Optional user note
  entry_date: string; // Calendar date: YYYY-MM-DD
  created_at: string; // ISO 8601 string
}

export interface CreateSavingsGoalInput {
  name: string;
  target_centavos: number;
  deadline?: string | null;
  icon: string;
  color: string;
  note?: string | null;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  target_centavos?: number;
  deadline?: string | null;
  icon?: string;
  color?: string;
  note?: string | null;
  status?: SavingsGoalStatus;
}

export interface CreateSavingsEntryInput {
  goal_id: string;
  type: SavingsEntryType;
  amount_centavos: number;
  note?: string | null;
  entry_date: string;
}

export interface SavingsGoalCalculation {
  goal: SavingsGoal;
  targetCentavos: number;
  allocatedCentavos: number;
  remainingCentavos: number;
  progressPercentage: number; // Real percentage, e.g. 37.14
  cappedPercentage: number; // 0 to 100 for visual progress bars
  isCompleted: boolean;
  totalContributionsCentavos: number;
  totalWithdrawalsCentavos: number;
}

export interface SavingsSummary {
  totalAllocatedCentavos: number;
  totalTargetCentavos: number;
  overallProgressPercentage: number; // Real percentage
  activeGoalsCount: number;
  completedGoalsCount: number;
  archivedGoalsCount: number;
}
