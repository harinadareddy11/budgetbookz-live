export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}