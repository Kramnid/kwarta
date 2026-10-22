/**
 * Financial Accuracy Test Suite for Step 4 Budget Management System
 * Tests isolated calculation scenarios using integer centavos.
 */

const assert = require('assert');

// Pure calculation logic extracted for independent test runner
function getEffectiveAmount(tx) {
  if (typeof tx.amount_centavos === 'number' && !isNaN(tx.amount_centavos)) {
    return Math.max(0, Math.round(tx.amount_centavos));
  }
  return 0;
}

function getEffectiveDate(tx) {
  return (tx.transaction_date || '').split('T')[0];
}

function calculateSpendingForMonth(transactions, month) {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const txDate = getEffectiveDate(tx);
    if (txDate.startsWith(month)) {
      return acc + getEffectiveAmount(tx);
    }
    return acc;
  }, 0);
}

function calculateSpendingForCategoryAndMonth(transactions, categoryId, month) {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const txCatId = String(tx.category_id || '');
    if (txCatId !== categoryId) return acc;
    const txDate = getEffectiveDate(tx);
    if (txDate.startsWith(month)) {
      return acc + getEffectiveAmount(tx);
    }
    return acc;
  }, 0);
}

function calculateBudgetStatus(percentage) {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'warning';
  if (percentage >= 75) return 'caution';
  return 'healthy';
}

function calculateBudgetDetails(budget, transactions) {
  const limit = Math.max(0, budget.amount_centavos);
  const isOverall = !budget.category_id;

  const spent = isOverall
    ? calculateSpendingForMonth(transactions, budget.month)
    : calculateSpendingForCategoryAndMonth(transactions, budget.category_id, budget.month);

  const remaining = limit - spent;
  const isExceeded = spent > limit;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 100) / 100;
  const cappedPercentage = Math.min(100, Math.max(0, percentage));
  const status = calculateBudgetStatus(percentage);

  return {
    budget,
    budgetLimitCentavos: limit,
    spentCentavos: spent,
    remainingCentavos: remaining,
    percentage: roundedPercentage,
    cappedPercentage,
    isExceeded,
    status,
  };
}

function calculateMonthlyOverview(budgets, transactions, month) {
  const monthBudgets = budgets.filter((b) => b.month === month);
  const overallBudget = monthBudgets.find((b) => b.category_id === null) || null;
  const totalSpentCentavos = calculateSpendingForMonth(transactions, month);

  if (overallBudget) {
    const limit = overallBudget.amount_centavos;
    const remaining = limit - totalSpentCentavos;
    const isExceeded = totalSpentCentavos > limit;
    const percentage = limit > 0 ? (totalSpentCentavos / limit) * 100 : 0;
    const roundedPercentage = Math.round(percentage * 100) / 100;
    const cappedPercentage = Math.min(100, Math.max(0, percentage));
    const status = calculateBudgetStatus(percentage);

    return {
      hasOverallBudget: true,
      overallBudget,
      totalBudgetLimitCentavos: limit,
      totalSpentCentavos,
      remainingCentavos: remaining,
      percentage: roundedPercentage,
      cappedPercentage,
      isExceeded,
      status,
    };
  }

  return {
    hasOverallBudget: false,
    overallBudget: null,
    totalBudgetLimitCentavos: 0,
    totalSpentCentavos,
    remainingCentavos: -totalSpentCentavos,
    percentage: 0,
    cappedPercentage: 0,
    isExceeded: false,
    status: 'healthy',
  };
}

function runTests() {
  console.log('=== Running Step 4 Budget Management Financial Accuracy Tests ===\n');

  const testMonth = '2026-10';

  // 1. Setup Isolated Test Dataset
  // Overall monthly budget: ₱10,000 (1,000,000 centavos)
  const overallBudget = {
    id: 'bg_overall',
    category_id: null,
    amount_centavos: 1000000, // ₱10,000
    month: testMonth,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Food & Drinks: ₱3,000 (300,000 centavos)
  const foodBudget = {
    id: 'bg_food',
    category_id: 'cat_food',
    amount_centavos: 300000, // ₱3,000
    month: testMonth,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const budgets = [overallBudget, foodBudget];

  // Transactions:
  // - Food expense: ₱1,500 (150,000 centavos)
  // - Food expense: ₱900 (90,000 centavos)
  // - Transportation expense: ₱1,000 (100,000 centavos)
  // - Income: ₱20,000 (2,000,000 centavos)
  const transactions = [
    {
      id: 'tx_1',
      type: 'expense',
      amount_centavos: 150000,
      category_id: 'cat_food',
      transaction_date: `${testMonth}-05`,
    },
    {
      id: 'tx_2',
      type: 'expense',
      amount_centavos: 90000,
      category_id: 'cat_food',
      transaction_date: `${testMonth}-10`,
    },
    {
      id: 'tx_3',
      type: 'expense',
      amount_centavos: 100000,
      category_id: 'cat_transportation',
      transaction_date: `${testMonth}-12`,
    },
    {
      id: 'tx_4',
      type: 'income',
      amount_centavos: 2000000, // ₱20,000
      category_id: 'cat_salary',
      transaction_date: `${testMonth}-15`,
    },
  ];

  // Test Phase 1: Verify Initial Test Scenario
  console.log('--- Phase 1: Initial Budgets & Spending ---');

  const overview1 = calculateMonthlyOverview(budgets, transactions, testMonth);
  console.log(`Overall Budget Limit: ₱${overview1.totalBudgetLimitCentavos / 100} (expected: ₱10000)`);
  console.log(`Overall Spent: ₱${overview1.totalSpentCentavos / 100} (expected: ₱3400)`);
  console.log(`Overall Remaining: ₱${overview1.remainingCentavos / 100} (expected: ₱6600)`);
  console.log(`Overall Progress: ${overview1.percentage}% (expected: 34%)`);

  assert.strictEqual(overview1.totalBudgetLimitCentavos, 1000000);
  assert.strictEqual(overview1.totalSpentCentavos, 340000);
  assert.strictEqual(overview1.remainingCentavos, 660000);
  assert.strictEqual(overview1.percentage, 34);
  assert.strictEqual(overview1.isExceeded, false);
  assert.strictEqual(overview1.status, 'healthy');

  const foodDetails1 = calculateBudgetDetails(foodBudget, transactions);
  console.log(`\nFood & Drinks Limit: ₱${foodDetails1.budgetLimitCentavos / 100} (expected: ₱3000)`);
  console.log(`Food & Drinks Spent: ₱${foodDetails1.spentCentavos / 100} (expected: ₱2400)`);
  console.log(`Food & Drinks Remaining: ₱${foodDetails1.remainingCentavos / 100} (expected: ₱600)`);
  console.log(`Food & Drinks Progress: ${foodDetails1.percentage}% (expected: 80%)`);
  console.log(`Food & Drinks Status: ${foodDetails1.status} (expected: caution)`);

  assert.strictEqual(foodDetails1.budgetLimitCentavos, 300000);
  assert.strictEqual(foodDetails1.spentCentavos, 240000);
  assert.strictEqual(foodDetails1.remainingCentavos, 60000);
  assert.strictEqual(foodDetails1.percentage, 80);
  assert.strictEqual(foodDetails1.cappedPercentage, 80);
  assert.strictEqual(foodDetails1.isExceeded, false);
  assert.strictEqual(foodDetails1.status, 'caution');

  // Test Phase 2: Add another Food expense of ₱900 (90,000 centavos)
  console.log('\n--- Phase 2: After Adding ₱900 Food Expense ---');

  const updatedTransactions = [
    ...transactions,
    {
      id: 'tx_5',
      type: 'expense',
      amount_centavos: 90000, // ₱900
      category_id: 'cat_food',
      transaction_date: `${testMonth}-20`,
    },
  ];

  const foodDetails2 = calculateBudgetDetails(foodBudget, updatedTransactions);
  console.log(`Food & Drinks Spent: ₱${foodDetails2.spentCentavos / 100} (expected: ₱3300)`);
  console.log(`Food & Drinks Exceeded By: ₱${Math.abs(foodDetails2.remainingCentavos) / 100} (expected: ₱300)`);
  console.log(`Food & Drinks Real Progress: ${foodDetails2.percentage}% (expected: 110%)`);
  console.log(`Food & Drinks Capped Progress Bar: ${foodDetails2.cappedPercentage}% (expected: 100%)`);
  console.log(`Food & Drinks Status: ${foodDetails2.status} (expected: exceeded)`);

  assert.strictEqual(foodDetails2.spentCentavos, 330000);
  assert.strictEqual(foodDetails2.remainingCentavos, -30000); // negative centavos internally
  assert.strictEqual(foodDetails2.isExceeded, true);
  assert.strictEqual(foodDetails2.percentage, 110);
  assert.strictEqual(foodDetails2.cappedPercentage, 100);
  assert.strictEqual(foodDetails2.status, 'exceeded');

  // Verify overall budget also reacted accurately
  const overview2 = calculateMonthlyOverview(budgets, updatedTransactions, testMonth);
  console.log(`\nOverall Spent After Extra Expense: ₱${overview2.totalSpentCentavos / 100} (expected: ₱4300)`);
  console.log(`Overall Remaining: ₱${overview2.remainingCentavos / 100} (expected: ₱5700)`);
  console.log(`Overall Progress: ${overview2.percentage}% (expected: 43%)`);

  assert.strictEqual(overview2.totalSpentCentavos, 430000);
  assert.strictEqual(overview2.remainingCentavos, 570000);
  assert.strictEqual(overview2.percentage, 43);

  // Test Phase 3: Verify Income does NOT contribute to spending
  console.log('\n--- Phase 3: Verify Income Isolation ---');
  const hugeIncomeTx = {
    id: 'tx_huge_income',
    type: 'income',
    amount_centavos: 100000000, // ₱1,000,000
    category_id: 'cat_salary',
    transaction_date: `${testMonth}-22`,
  };
  const txWithIncome = [...updatedTransactions, hugeIncomeTx];
  const overviewWithHugeIncome = calculateMonthlyOverview(budgets, txWithIncome, testMonth);
  assert.strictEqual(overviewWithHugeIncome.totalSpentCentavos, 430000);
  console.log('✓ Verified: Income does not contribute to budget spending calculations.');

  // Test Phase 4: Verify Threshold Statuses
  console.log('\n--- Phase 4: Threshold Status Boundaries ---');
  assert.strictEqual(calculateBudgetStatus(0), 'healthy');
  assert.strictEqual(calculateBudgetStatus(74.9), 'healthy');
  assert.strictEqual(calculateBudgetStatus(75), 'caution');
  assert.strictEqual(calculateBudgetStatus(89.9), 'caution');
  assert.strictEqual(calculateBudgetStatus(90), 'warning');
  assert.strictEqual(calculateBudgetStatus(99.9), 'warning');
  assert.strictEqual(calculateBudgetStatus(100), 'exceeded');
  assert.strictEqual(calculateBudgetStatus(125), 'exceeded');
  console.log('✓ Verified: Healthy (<75%), Caution (75-89%), Warning (90-99%), Exceeded (>=100%).');

  console.log('\n🎉 ALL STEP 4 BUDGET FINANCIAL ACCURACY TESTS PASSED!');
}

runTests();
