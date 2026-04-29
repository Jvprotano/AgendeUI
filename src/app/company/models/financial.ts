export interface FinancialKpis {
  monthRevenue: number;
  monthRevenueDeltaPercent: number;
  monthExpense: number;
  monthExpenseDeltaPercent: number;
  operationalProfit: number;
  operationalProfitDeltaPercent: number;
  averageTicket: number;
  averageTicketDeltaPercent: number;
}

export interface FinancialMonthlyFlowItem {
  month: string;
  income: number;
  expense: number;
}

export interface FinancialExpenseCategoryItem {
  name: string;
  percent: number;
  amount: number;
}

export type FinancialTransactionType = 'in' | 'out';
export type FinancialTransactionStatus = 'Pago' | 'Pendente' | 'Recebido';

export interface FinancialRecentTransactionItem {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
}

export type FinancialDueItemType = 'receivable' | 'payable';

export interface FinancialDueItem {
  title: string;
  dueDate: string;
  amount: number;
  type: FinancialDueItemType;
}

export interface FinancialProjectionItem {
  label: string;
  balance: number;
  trendPercent: number;
}

export interface FinancialOverviewData {
  periodLabel: string;
  kpis: FinancialKpis;
  monthlyFlow: FinancialMonthlyFlowItem[];
  expenseCategories: FinancialExpenseCategoryItem[];
  recentTransactions: FinancialRecentTransactionItem[];
  dueItems: FinancialDueItem[];
  projection: FinancialProjectionItem[];
}
