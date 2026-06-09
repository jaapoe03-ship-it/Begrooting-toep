export interface Income {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  paid: boolean;
  category?: string;
  priority?: string;
  note?: string;
  photos?: string[];
}

export interface AnderExpense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  priority?: string;
  note?: string;
  photos?: string[];
}

export interface Period {
  start: string;
  end: string;
  label: string;
}

export interface PeriodHistoryRecord {
  start: string;
  end: string;
  label: string;
  incomes: Income[];
  expenses: Expense[];
  anderExpenses: AnderExpense[];
  savedAt: string;
}

export interface FilterState {
  income: string;
  expense: string;
  ander: string;
}

export interface SortState {
  income: 'default' | 'name' | 'amount';
  expense: 'default' | 'name' | 'amount' | 'date';
  ander: 'default' | 'name' | 'amount' | 'date';
}
