/**
 * Savings Goals Utility Functions for Kwarta
 *
 * Implements financial calculations for savings goals, target progress,
 * deadline calculations, input validation, and preset styles.
 * All monetary amounts are handled strictly in integer centavos.
 */

import {
  SavingsGoal,
  SavingsGoalCalculation,
  SavingsSummary,
  CreateSavingsGoalInput,
  SavingsEntryType,
} from '@/types/savings';

/**
 * Curated preset icons for savings goals.
 */
export const SAVINGS_ICONS = [
  { id: 'piggy-bank', label: 'Piggy Bank', icon: 'PiggyBank' },
  { id: 'laptop', label: 'Laptop / Tech', icon: 'Laptop' },
  { id: 'plane', label: 'Travel & Vacation', icon: 'Plane' },
  { id: 'car', label: 'Car / Vehicle', icon: 'Car' },
  { id: 'home', label: 'House / Real Estate', icon: 'Home' },
  { id: 'graduation-cap', label: 'Education / School', icon: 'GraduationCap' },
  { id: 'shield-check', label: 'Emergency Fund', icon: 'ShieldCheck' },
  { id: 'gift', label: 'Gift / Celebration', icon: 'Gift' },
  { id: 'smartphone', label: 'Phone / Gadget', icon: 'Smartphone' },
  { id: 'heart', label: 'Health & Family', icon: 'Heart' },
  { id: 'target', label: 'Personal Milestone', icon: 'Target' },
  { id: 'trophy', label: 'Special Achievement', icon: 'Trophy' },
  { id: 'briefcase', label: 'Business / Career', icon: 'Briefcase' },
  { id: 'wallet', label: 'Rainy Day Fund', icon: 'Wallet' },
  { id: 'sparkles', label: 'Dream Project', icon: 'Sparkles' },
];

/**
 * Curated accessible colors for savings goals.
 */
export const SAVINGS_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#EF4444', // Red
];

/**
 * Calculates progress metrics for a single savings goal.
 */
export function calculateGoalProgress(
  targetCentavos: number,
  allocatedCentavos: number
): {
  remainingCentavos: number;
  progressPercentage: number;
  cappedPercentage: number;
  isCompleted: boolean;
} {
  const target = Math.max(1, targetCentavos);
  const allocated = Math.max(0, allocatedCentavos);
  const remaining = Math.max(0, target - allocated);

  // Raw progress percentage, rounded to 2 decimal places (e.g. 37.14)
  const rawPercentage = (allocated / target) * 100;
  const progressPercentage = Math.round(rawPercentage * 100) / 100;

  // Visual bar cap between 0% and 100%
  const cappedPercentage = Math.min(100, Math.max(0, progressPercentage));

  const isCompleted = allocated >= target;

  return {
    remainingCentavos: remaining,
    progressPercentage,
    cappedPercentage,
    isCompleted,
  };
}

/**
 * Calculates the full calculation object for a savings goal.
 */
export function computeSavingsGoalCalculation(
  goal: SavingsGoal,
  totalContributions = goal.allocated_centavos,
  totalWithdrawals = 0
): SavingsGoalCalculation {
  const progress = calculateGoalProgress(
    goal.target_centavos,
    goal.allocated_centavos
  );

  return {
    goal,
    targetCentavos: goal.target_centavos,
    allocatedCentavos: goal.allocated_centavos,
    remainingCentavos: progress.remainingCentavos,
    progressPercentage: progress.progressPercentage,
    cappedPercentage: progress.cappedPercentage,
    isCompleted: progress.isCompleted,
    totalContributionsCentavos: totalContributions,
    totalWithdrawalsCentavos: totalWithdrawals,
  };
}

/**
 * Calculates overall summary metrics across all goals.
 * Excludes archived goals from active progress calculations.
 */
export function calculateSavingsSummary(goals: SavingsGoal[]): SavingsSummary {
  // Only include active and completed goals in total allocated & target
  const activeAndCompleted = goals.filter((g) => g.status !== 'archived');

  const totalAllocatedCentavos = activeAndCompleted.reduce(
    (sum, g) => sum + Math.max(0, g.allocated_centavos),
    0
  );

  const totalTargetCentavos = activeAndCompleted.reduce(
    (sum, g) => sum + Math.max(0, g.target_centavos),
    0
  );

  let overallProgressPercentage = 0;
  if (totalTargetCentavos > 0) {
    const raw = (totalAllocatedCentavos / totalTargetCentavos) * 100;
    overallProgressPercentage = Math.round(raw * 100) / 100;
  }

  const activeGoalsCount = goals.filter((g) => g.status === 'active').length;
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;
  const archivedGoalsCount = goals.filter((g) => g.status === 'archived').length;

  return {
    totalAllocatedCentavos,
    totalTargetCentavos,
    overallProgressPercentage,
    activeGoalsCount,
    completedGoalsCount,
    archivedGoalsCount,
  };
}

/**
 * Formats a calendar deadline string (YYYY-MM-DD) into readable text.
 * e.g. "December 31, 2026"
 */
export function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;

  try {
    const [year, month, day] = deadline.split('-').map(Number);
    if (!year || !month || !day) return deadline;

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return deadline;
  }
}

/**
 * Computes remaining days until deadline.
 */
export function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) return null;

  try {
    const [year, month, day] = deadline.split('-').map(Number);
    if (!year || !month || !day) return null;

    const targetDate = new Date(year, month - 1, day, 23, 59, 59);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/**
 * Formats days remaining into human friendly badge text.
 */
export function formatDaysRemainingText(deadline: string | null): string | null {
  const days = getDaysRemaining(deadline);
  if (days === null) return null;

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
  }
  if (days === 0) {
    return 'Due today';
  }
  if (days === 1) {
    return 'Due tomorrow';
  }
  return `${days} days left`;
}

/**
 * Validates a goal form input before saving.
 */
export function validateGoalInput(input: Partial<CreateSavingsGoalInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const name = (input.name || '').trim();
  if (!name) {
    errors.name = 'Goal name is required';
  } else if (name.length > 100) {
    errors.name = 'Goal name must be 100 characters or less';
  }

  const target = input.target_centavos ?? 0;
  if (!target || target <= 0) {
    errors.target = 'Target amount must be greater than ₱0.00';
  }

  if (input.deadline) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(input.deadline)) {
      errors.deadline = 'Deadline must use format YYYY-MM-DD';
    }
  }

  if (input.note && input.note.length > 500) {
    errors.note = 'Note must be 500 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a contribution or withdrawal entry input.
 */
export function validateEntryInput({
  amountCentavos,
  type,
  availableAllocatedCentavos = 0,
}: {
  amountCentavos: number;
  type: SavingsEntryType;
  availableAllocatedCentavos?: number;
}): {
  isValid: boolean;
  error?: string;
} {
  if (!amountCentavos || amountCentavos <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than ₱0.00',
    };
  }

  if (type === 'withdrawal' && amountCentavos > availableAllocatedCentavos) {
    return {
      isValid: false,
      error: 'Withdrawal cannot exceed currently allocated savings',
    };
  }

  return { isValid: true };
}
