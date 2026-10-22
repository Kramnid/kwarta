/**
 * Analytics & Spending Insights Type Definitions for Kwarta
 *
 * All financial amounts are represented in integer centavos to prevent floating-point errors.
 */

import { CategorySpending } from './finance';
import { Budget } from './budget';

export type AnalyticsDateRangeOption =
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'this_year'
  | 'custom';

export type PeriodGroupingType = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  option: AnalyticsDateRangeOption;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string; // E.g. "This Month", "Oct 1 – Oct 31, 2026"
  periodType: PeriodGroupingType;
}

export interface FinancialOverview {
  totalIncome: number; // in integer centavos
  totalExpenses: number; // in integer centavos
  netCashFlow: number; // in integer centavos (totalIncome - totalExpenses)
  savingsRate: number | null; // percentage e.g. 60.0, or null if totalIncome is 0
  hasIncome: boolean;
}

export interface DailySpendingCalculation {
  averageDailyCentavos: number; // in integer centavos
  elapsedDays: number; // days counted (up to today if current period, or total if historical)
  totalDaysInRange: number; // total calendar days between start and end
  isFutureOnly: boolean; // true if range starts after today
}

export interface IncomeExpenseBucket {
  key: string; // unique key (e.g. '2026-10-22' or 'W3' or '2026-10')
  label: string; // display label on chart (e.g. 'Oct 22', 'W3', 'Oct')
  fullPeriodLabel: string; // full tooltip label (e.g. 'October 22, 2026' or 'Week 3: Oct 15 - Oct 21')
  incomeCentavos: number;
  expenseCentavos: number;
}

export interface SpendingTrendPoint {
  key: string;
  label: string; // short X-axis label (e.g. 'Oct 1', 'W1', 'Jan')
  fullDate: string; // human date (e.g. 'October 1, 2026')
  amountCentavos: number;
}

export type InsightType =
  | 'highest_category'
  | 'spending_change'
  | 'cash_flow_positive'
  | 'cash_flow_negative'
  | 'cash_flow_neutral'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'savings_achievement'
  | 'no_expenses'
  | 'no_income';

export interface FinancialInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  icon: string; // Lucide icon identifier
  color: string; // hex color for icon/border accent
  badge?: string; // optional small badge text (e.g. "+12%", "40% Share")
}

export interface BudgetPerformanceSummary {
  hasBudgets: boolean;
  targetMonth: string; // YYYY-MM
  targetMonthLabel: string; // e.g. "October 2026"
  isMultiMonthRange: boolean;
  hasOverallBudget: boolean;
  overallBudget: Budget | null;
  totalBudgetLimitCentavos: number;
  totalSpentCentavos: number;
  remainingCentavos: number; // can be negative if exceeded
  percentage: number; // e.g. 84.5
  cappedPercentage: number; // 0 to 100 for progress bar
  isExceeded: boolean;
  statusColor: string;
  topApproachingCategories: {
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    spentCentavos: number;
    limitCentavos: number;
    percentage: number;
    isExceeded: boolean;
  }[];
}

export interface AnalyticsData {
  range: DateRange;
  overview: FinancialOverview;
  dailySpending: DailySpendingCalculation;
  incomeExpenseBuckets: IncomeExpenseBucket[];
  categorySpending: CategorySpending[];
  spendingTrendPoints: SpendingTrendPoint[];
  insights: FinancialInsight[];
  budgetPerformance: BudgetPerformanceSummary;
  hasAnyTransactions: boolean;
  hasExpenses: boolean;
  hasIncome: boolean;
}
