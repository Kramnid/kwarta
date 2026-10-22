/**
 * Pure Analytics & Financial Calculation Engine for Kwarta
 *
 * Rules:
 * - Offline-first, deterministic, rule-based observations.
 * - All financial inputs and outputs in integer centavos to prevent floating-point errors.
 * - Strict adherence to local calendar boundaries to prevent UTC day shifts.
 */

import { Transaction, CategorySpending } from '@/types/finance';
import { Budget } from '@/types/budget';
import {
  AnalyticsDateRangeOption,
  DateRange,
  FinancialOverview,
  DailySpendingCalculation,
  IncomeExpenseBucket,
  SpendingTrendPoint,
  FinancialInsight,
  BudgetPerformanceSummary,
} from '@/types/analytics';
import { getEffectiveAmount, getEffectiveDate } from './finance';
import { formatCentavosToPhp } from './currency';
import {
  formatLocalDate,
  parseLocalDate,
  getTodayLocalDate,
} from './date';
import {
  calculateMonthlyOverview,
  calculateBudgetDetails,
  formatMonthDisplay,
  getBudgetStatusColor,
} from './budget';

/**
 * Calculates number of full calendar days between two YYYY-MM-DD date strings (inclusive of endpoints).
 */
export function countDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days) + 1;
}

/**
 * Adds N calendar days to a YYYY-MM-DD date string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Formats a short human readable range label (e.g. "Oct 1 – Oct 31, 2026").
 */
export function formatRangeLabel(startDateStr: string, endDateStr: string): string {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const startMonthStr = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonthStr = end.toLocaleDateString('en-US', { month: 'short' });

  if (startDateStr === endDateStr) {
    return `${startMonthStr} ${start.getDate()}, ${start.getFullYear()}`;
  }

  if (sameMonth) {
    return `${startMonthStr} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${startMonthStr} ${start.getDate()} – ${endMonthStr} ${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${startMonthStr} ${start.getDate()}, ${start.getFullYear()} – ${endMonthStr} ${end.getDate()}, ${end.getFullYear()}`;
}

/**
 * Resolves an AnalyticsDateRangeOption into concrete local calendar start and end dates.
 */
export function resolveDateRange(
  option: AnalyticsDateRangeOption,
  customStart?: string,
  customEnd?: string
): DateRange {
  const todayStr = getTodayLocalDate();
  const today = parseLocalDate(todayStr);

  switch (option) {
    case 'this_week': {
      // Local Monday to Sunday
      const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
      const distToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = formatLocalDate(monday);
      const endDate = formatLocalDate(sunday);

      return {
        option,
        startDate,
        endDate,
        label: `This Week (${formatRangeLabel(startDate, endDate)})`,
        periodType: 'daily',
      };
    }

    case 'this_month': {
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = formatLocalDate(firstDay);
      const endDate = formatLocalDate(lastDay);

      return {
        option,
        startDate,
        endDate,
        label: `This Month (${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`,
        periodType: 'weekly',
      };
    }

    case 'last_month': {
      const year = today.getFullYear();
      const month = today.getMonth() - 1;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = formatLocalDate(firstDay);
      const endDate = formatLocalDate(lastDay);

      return {
        option,
        startDate,
        endDate,
        label: `Last Month (${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`,
        periodType: 'weekly',
      };
    }

    case 'last_3_months': {
      const year = today.getFullYear();
      const month = today.getMonth();
      // First day of 2 months ago (total 3 months including current)
      const firstDay = new Date(year, month - 2, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = formatLocalDate(firstDay);
      const endDate = formatLocalDate(lastDay);

      return {
        option,
        startDate,
        endDate,
        label: `Last 3 Months (${formatRangeLabel(startDate, endDate)})`,
        periodType: 'monthly',
      };
    }

    case 'this_year': {
      const year = today.getFullYear();
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);

      const startDate = formatLocalDate(firstDay);
      const endDate = formatLocalDate(lastDay);

      return {
        option,
        startDate,
        endDate,
        label: `This Year (${year})`,
        periodType: 'monthly',
      };
    }

    case 'custom': {
      let start = customStart || todayStr;
      let end = customEnd || todayStr;

      // Ensure start <= end
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      const totalDays = countDaysBetween(start, end);
      let periodType: 'daily' | 'weekly' | 'monthly' = 'daily';
      if (totalDays > 62) {
        periodType = 'monthly';
      } else if (totalDays > 14) {
        periodType = 'weekly';
      }

      return {
        option: 'custom',
        startDate: start,
        endDate: end,
        label: `Custom (${formatRangeLabel(start, end)})`,
        periodType,
      };
    }
  }
}

/**
 * Returns previous comparable period for trend and period-over-period comparisons.
 */
export function getPreviousComparableRange(range: DateRange): {
  startDate: string;
  endDate: string;
} {
  const daysSpan = countDaysBetween(range.startDate, range.endDate);

  switch (range.option) {
    case 'this_week': {
      const start = addDaysToDateString(range.startDate, -7);
      const end = addDaysToDateString(range.endDate, -7);
      return { startDate: start, endDate: end };
    }

    case 'this_month': {
      const startObj = parseLocalDate(range.startDate);
      const prevMonthFirst = new Date(startObj.getFullYear(), startObj.getMonth() - 1, 1);
      const prevMonthLast = new Date(startObj.getFullYear(), startObj.getMonth(), 0);
      return {
        startDate: formatLocalDate(prevMonthFirst),
        endDate: formatLocalDate(prevMonthLast),
      };
    }

    case 'last_month': {
      const startObj = parseLocalDate(range.startDate);
      const prevMonthFirst = new Date(startObj.getFullYear(), startObj.getMonth() - 1, 1);
      const prevMonthLast = new Date(startObj.getFullYear(), startObj.getMonth(), 0);
      return {
        startDate: formatLocalDate(prevMonthFirst),
        endDate: formatLocalDate(prevMonthLast),
      };
    }

    case 'this_year': {
      const startObj = parseLocalDate(range.startDate);
      const prevYearFirst = new Date(startObj.getFullYear() - 1, 0, 1);
      const prevYearLast = new Date(startObj.getFullYear() - 1, 11, 31);
      return {
        startDate: formatLocalDate(prevYearFirst),
        endDate: formatLocalDate(prevYearLast),
      };
    }

    default: {
      // Shift back by the exact number of days
      const end = addDaysToDateString(range.startDate, -1);
      const start = addDaysToDateString(end, -(daysSpan - 1));
      return { startDate: start, endDate: end };
    }
  }
}

/**
 * Filters a list of transactions to those falling within [startDate, endDate] inclusive.
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((tx) => {
    const txDate = getEffectiveDate(tx);
    return txDate >= startDate && txDate <= endDate;
  });
}

/**
 * Calculates Financial Overview for a selected period.
 */
export function calculatePeriodOverview(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): FinancialOverview {
  const periodTxs = filterTransactionsByDateRange(transactions, startDate, endDate);

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of periodTxs) {
    const amt = getEffectiveAmount(tx);
    if (tx.type === 'income') {
      totalIncome += amt;
    } else if (tx.type === 'expense') {
      totalExpenses += amt;
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const hasIncome = totalIncome > 0;

  let savingsRate: number | null = null;
  if (hasIncome) {
    // Formula: (Net Cash Flow / Total Income) * 100
    const rawRate = (netCashFlow / totalIncome) * 100;
    savingsRate = Math.round(rawRate * 10) / 10;
  }

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    hasIncome,
  };
}

/**
 * Calculates Average Daily Spending according to the strict specification:
 * - Include zero-spending days.
 * - For current ongoing period, calculate through current local date rather than including future days.
 * - For completed historical periods, use the complete selected range.
 * - Future-only periods return isFutureOnly: true and averageDailyCentavos: 0.
 */
export function calculateAverageDailySpending(
  totalExpensesCentavos: number,
  startDate: string,
  endDate: string
): DailySpendingCalculation {
  const todayStr = getTodayLocalDate();
  const totalDaysInRange = countDaysBetween(startDate, endDate);

  // If entire range is in the future
  if (startDate > todayStr) {
    return {
      averageDailyCentavos: 0,
      elapsedDays: 0,
      totalDaysInRange,
      isFutureOnly: true,
    };
  }

  // Determine elapsed days up to today
  let elapsedDays = totalDaysInRange;
  if (todayStr < endDate) {
    // Ongoing period: count only from start up to today
    elapsedDays = countDaysBetween(startDate, todayStr);
  }

  elapsedDays = Math.max(1, elapsedDays);
  const averageDailyCentavos =
    totalExpensesCentavos > 0
      ? Math.round(totalExpensesCentavos / elapsedDays)
      : 0;

  return {
    averageDailyCentavos,
    elapsedDays,
    totalDaysInRange,
    isFutureOnly: false,
  };
}

/**
 * Calculates expense spending breakdown by category for a period.
 * Strictly excludes income transactions and uses stable category IDs.
 */
export function calculatePeriodCategorySpending(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): CategorySpending[] {
  const periodTxs = filterTransactionsByDateRange(transactions, startDate, endDate);
  const expenseTxs = periodTxs.filter((tx) => tx.type === 'expense');

  let totalExpenses = 0;
  const catMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      amount: number;
    }
  >();

  for (const tx of expenseTxs) {
    const amt = getEffectiveAmount(tx);
    totalExpenses += amt;

    const catId = String(tx.category_id || tx.category?.id || 'other');
    const existing = catMap.get(catId);

    const name = tx.category?.name || 'Other';
    const icon = tx.category?.icon || 'ellipsis';
    const color = tx.category?.color || '#94A3B8';

    if (existing) {
      existing.amount += amt;
    } else {
      catMap.set(catId, {
        categoryId: catId,
        categoryName: name,
        categoryIcon: icon,
        categoryColor: color,
        amount: amt,
      });
    }
  }

  if (totalExpenses <= 0 || catMap.size === 0) {
    return [];
  }

  const list: CategorySpending[] = Array.from(catMap.values()).map((item) => {
    const pct = (item.amount / totalExpenses) * 100;
    const rounded = Math.round(pct * 10) / 10;
    return {
      ...item,
      percentage: rounded,
    };
  });

  return list.sort((a, b) => b.amount - a.amount);
}

/**
 * Generates Grouped Bar Chart buckets (Income vs Expense side-by-side).
 */
export function generateIncomeExpenseBuckets(
  transactions: Transaction[],
  range: DateRange
): IncomeExpenseBucket[] {
  const periodTxs = filterTransactionsByDateRange(
    transactions,
    range.startDate,
    range.endDate
  );

  const buckets: IncomeExpenseBucket[] = [];

  if (range.periodType === 'daily') {
    // Generate bucket for every calendar day in the range
    const daysCount = countDaysBetween(range.startDate, range.endDate);
    for (let i = 0; i < daysCount; i++) {
      const dateStr = addDaysToDateString(range.startDate, i);
      const dateObj = parseLocalDate(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = dateObj.getDate();

      const label = daysCount <= 7 ? dayName : String(dayNum);

      buckets.push({
        key: dateStr,
        label,
        fullPeriodLabel: dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        incomeCentavos: 0,
        expenseCentavos: 0,
      });
    }

    // Populate
    for (const tx of periodTxs) {
      const txDate = getEffectiveDate(tx);
      const bucket = buckets.find((b) => b.key === txDate);
      if (bucket) {
        const amt = getEffectiveAmount(tx);
        if (tx.type === 'income') {
          bucket.incomeCentavos += amt;
        } else {
          bucket.expenseCentavos += amt;
        }
      }
    }
    return buckets;
  }

  if (range.periodType === 'weekly') {
    // Generate weekly slices (e.g. Days 1-7, 8-14, 15-21, 22-28, 29-end)
    const weekIntervalDays = 7;
    let currentStart = range.startDate;
    let weekIndex = 1;

    while (currentStart <= range.endDate) {
      const nextEnd = addDaysToDateString(currentStart, weekIntervalDays - 1);
      const actualEnd = nextEnd > range.endDate ? range.endDate : nextEnd;

      const startD = parseLocalDate(currentStart);
      const endD = parseLocalDate(actualEnd);
      const label = `W${weekIndex}`;
      const fullPeriodLabel = `Week ${weekIndex} (${startD.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${endD.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })})`;

      const bucketKey = `${currentStart}_${actualEnd}`;
      buckets.push({
        key: bucketKey,
        label,
        fullPeriodLabel,
        incomeCentavos: 0,
        expenseCentavos: 0,
      });

      // Sum transactions for this week slice
      for (const tx of periodTxs) {
        const txDate = getEffectiveDate(tx);
        if (txDate >= currentStart && txDate <= actualEnd) {
          const amt = getEffectiveAmount(tx);
          const b = buckets[buckets.length - 1];
          if (tx.type === 'income') {
            b.incomeCentavos += amt;
          } else {
            b.expenseCentavos += amt;
          }
        }
      }

      currentStart = addDaysToDateString(actualEnd, 1);
      weekIndex++;
    }

    return buckets;
  }

  // Monthly buckets
  const startObj = parseLocalDate(range.startDate);
  const endObj = parseLocalDate(range.endDate);

  let currentYear = startObj.getFullYear();
  let currentMonth = startObj.getMonth();
  const endYear = endObj.getFullYear();
  const endMonth = endObj.getMonth();

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const monthFirst = new Date(currentYear, currentMonth, 1);

    const monthStartStr = formatLocalDate(monthFirst);
    const monthKey = monthStartStr.substring(0, 7); // YYYY-MM

    const label = monthFirst.toLocaleDateString('en-US', { month: 'short' });
    const fullPeriodLabel = monthFirst.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const bucket: IncomeExpenseBucket = {
      key: monthKey,
      label,
      fullPeriodLabel,
      incomeCentavos: 0,
      expenseCentavos: 0,
    };

    for (const tx of periodTxs) {
      const txDate = getEffectiveDate(tx);
      if (txDate.startsWith(monthKey)) {
        const amt = getEffectiveAmount(tx);
        if (tx.type === 'income') {
          bucket.incomeCentavos += amt;
        } else {
          bucket.expenseCentavos += amt;
        }
      }
    }

    buckets.push(bucket);

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return buckets;
}

/**
 * Generates Spending Trend Points (Expenses over time) matching chart bounds.
 */
export function generateSpendingTrendPoints(
  transactions: Transaction[],
  range: DateRange
): SpendingTrendPoint[] {
  // Reuse the bucket generation logic for consistency
  const buckets = generateIncomeExpenseBuckets(transactions, range);

  return buckets.map((b) => ({
    key: b.key,
    label: b.label,
    fullDate: b.fullPeriodLabel,
    amountCentavos: b.expenseCentavos,
  }));
}

/**
 * Generates deterministic rule-based financial insights.
 */
export function generateFinancialInsights(
  transactions: Transaction[],
  range: DateRange,
  budgets: Budget[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const overview = calculatePeriodOverview(transactions, range.startDate, range.endDate);
  const categories = calculatePeriodCategorySpending(
    transactions,
    range.startDate,
    range.endDate
  );

  // 1. Zero Transactions / Zero Expenses
  if (overview.totalExpenses === 0 && overview.totalIncome === 0) {
    insights.push({
      id: 'ins_no_activity',
      type: 'no_expenses',
      title: 'No Activity Recorded',
      description: 'No transactions were found for the selected period.',
      icon: 'sparkles',
      color: '#94A3B8',
    });
    return insights;
  }

  if (overview.totalExpenses === 0) {
    insights.push({
      id: 'ins_zero_expenses',
      type: 'no_expenses',
      title: 'No Expenses Recorded',
      description: 'You recorded zero expenses during this period.',
      icon: 'check-circle-2',
      color: '#10B981',
      badge: '₱0 Spent',
    });
  }

  // 2. Highest Spending Category
  if (categories.length > 0) {
    const topCat = categories[0];
    insights.push({
      id: 'ins_top_cat',
      type: 'highest_category',
      title: `${topCat.categoryName} is Top Expense`,
      description: `${topCat.categoryName} accounted for ${formatCentavosToPhp(
        topCat.amount
      )} (${topCat.percentage.toFixed(1)}% of your total spending).`,
      icon: 'pie-chart',
      color: topCat.categoryColor || '#10B981',
      badge: `${topCat.percentage.toFixed(0)}% Share`,
    });
  }

  // 3. Period-over-Period Expense Change
  const prevRange = getPreviousComparableRange(range);
  const prevOverview = calculatePeriodOverview(
    transactions,
    prevRange.startDate,
    prevRange.endDate
  );

  if (prevOverview.totalExpenses > 0) {
    const diff = overview.totalExpenses - prevOverview.totalExpenses;
    const pctChange = Math.round((diff / prevOverview.totalExpenses) * 100);

    if (pctChange > 0) {
      insights.push({
        id: 'ins_spending_increase',
        type: 'spending_change',
        title: 'Spending Increased',
        description: `Your spending increased by ${pctChange}% (${formatCentavosToPhp(
          Math.abs(diff)
        )}) compared to the previous period.`,
        icon: 'trending-up',
        color: '#F87171',
        badge: `+${pctChange}%`,
      });
    } else if (pctChange < 0) {
      insights.push({
        id: 'ins_spending_decrease',
        type: 'spending_change',
        title: 'Spending Reduced',
        description: `Your spending decreased by ${Math.abs(
          pctChange
        )}% (${formatCentavosToPhp(
          Math.abs(diff)
        )}) compared to the previous period.`,
        icon: 'trending-down',
        color: '#10B981',
        badge: `${pctChange}%`,
      });
    } else {
      insights.push({
        id: 'ins_spending_equal',
        type: 'spending_change',
        title: 'Steady Spending',
        description:
          'Your total spending matched the previous comparable period exactly.',
        icon: 'minus',
        color: '#60A5FA',
        badge: '0%',
      });
    }
  } else if (overview.totalExpenses > 0) {
    insights.push({
      id: 'ins_spending_new',
      type: 'spending_change',
      title: 'Active Spending Period',
      description: `You spent ${formatCentavosToPhp(
        overview.totalExpenses
      )} this period, with no expenses in the previous period.`,
      icon: 'credit-card',
      color: '#60A5FA',
    });
  }

  // 4. Cash Flow & Savings Rate
  if (overview.hasIncome) {
    if (overview.netCashFlow > 0) {
      insights.push({
        id: 'ins_positive_cash_flow',
        type: 'cash_flow_positive',
        title: 'Positive Cash Flow',
        description: `You earned ${formatCentavosToPhp(
          overview.netCashFlow
        )} more than you spent, keeping a ${overview.savingsRate?.toFixed(
          1
        )}% savings rate.`,
        icon: 'wallet',
        color: '#10B981',
        badge: `+${formatCentavosToPhp(overview.netCashFlow)}`,
      });
    } else if (overview.netCashFlow < 0) {
      insights.push({
        id: 'ins_negative_cash_flow',
        type: 'cash_flow_negative',
        title: 'Expenses Exceeded Income',
        description: `Your expenses exceeded your recorded income by ${formatCentavosToPhp(
          Math.abs(overview.netCashFlow)
        )}.`,
        icon: 'alert-triangle',
        color: '#F87171',
        badge: `-${formatCentavosToPhp(Math.abs(overview.netCashFlow))}`,
      });
    }
  }

  // 5. Budget Warnings (from Step 4 budgets)
  // Check active month(s) from range
  const relevantMonth = range.startDate.substring(0, 7);
  const monthBudgets = budgets.filter((b) => b.month === relevantMonth);

  for (const b of monthBudgets) {
    const details = calculateBudgetDetails(b, transactions);
    if (details.isExceeded) {
      const name = b.category_id ? b.category?.name || 'Category' : 'Overall Monthly';
      insights.push({
        id: `ins_budget_exceeded_${b.id}`,
        type: 'budget_exceeded',
        title: `${name} Budget Exceeded`,
        description: `You have exceeded your ${name} budget by ${formatCentavosToPhp(
          Math.abs(details.remainingCentavos)
        )} (${Math.round(details.percentage)}% used).`,
        icon: 'alert-circle',
        color: '#F87171',
        badge: 'Exceeded',
      });
      break; // keep highest priority one to avoid clutter
    } else if (details.percentage >= 90) {
      const name = b.category_id ? b.category?.name || 'Category' : 'Overall Monthly';
      insights.push({
        id: `ins_budget_warning_${b.id}`,
        type: 'budget_warning',
        title: `${name} Near Limit`,
        description: `You have used ${Math.round(
          details.percentage
        )}% of your ${name} budget limit (${formatCentavosToPhp(
          details.remainingCentavos
        )} remaining).`,
        icon: 'alert-triangle',
        color: '#FB923C',
        badge: `${Math.round(details.percentage)}%`,
      });
      break;
    }
  }

  return insights.slice(0, 5); // Return top 5 most salient insights
}

/**
 * Calculates Budget Performance overview for the period.
 */
export function calculatePeriodBudgetPerformance(
  transactions: Transaction[],
  budgets: Budget[],
  range: DateRange
): BudgetPerformanceSummary {
  // Determine relevant calendar month (default to latest month in range)
  const targetMonth = range.endDate.substring(0, 7);
  const isMultiMonthRange =
    range.startDate.substring(0, 7) !== range.endDate.substring(0, 7);

  const monthBudgets = budgets.filter((b) => b.month === targetMonth);
  const hasBudgets = monthBudgets.length > 0;

  if (!hasBudgets) {
    return {
      hasBudgets: false,
      targetMonth,
      targetMonthLabel: formatMonthDisplay(targetMonth),
      isMultiMonthRange,
      hasOverallBudget: false,
      overallBudget: null,
      totalBudgetLimitCentavos: 0,
      totalSpentCentavos: 0,
      remainingCentavos: 0,
      percentage: 0,
      cappedPercentage: 0,
      isExceeded: false,
      statusColor: '#94A3B8',
      topApproachingCategories: [],
    };
  }

  const overview = calculateMonthlyOverview(budgets, transactions, targetMonth);

  // Calculate category budget details
  const categoryBudgets = monthBudgets.filter((b) => b.category_id !== null);
  const topApproachingCategories = categoryBudgets
    .map((b) => {
      const details = calculateBudgetDetails(b, transactions);
      return {
        categoryName: b.category?.name || 'Category',
        categoryIcon: b.category?.icon || 'tag',
        categoryColor: b.category?.color || '#10B981',
        spentCentavos: details.spentCentavos,
        limitCentavos: details.budgetLimitCentavos,
        percentage: details.percentage,
        isExceeded: details.isExceeded,
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  return {
    hasBudgets: true,
    targetMonth,
    targetMonthLabel: formatMonthDisplay(targetMonth),
    isMultiMonthRange,
    hasOverallBudget: overview.hasOverallBudget,
    overallBudget: overview.overallBudget,
    totalBudgetLimitCentavos: overview.totalBudgetLimitCentavos,
    totalSpentCentavos: overview.totalSpentCentavos,
    remainingCentavos: overview.remainingCentavos,
    percentage: overview.percentage,
    cappedPercentage: overview.cappedPercentage,
    isExceeded: overview.isExceeded,
    statusColor: getBudgetStatusColor(overview.status),
    topApproachingCategories,
  };
}
