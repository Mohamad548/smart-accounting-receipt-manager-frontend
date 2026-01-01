export interface Creditor {
  id: string;
  name: string;
  accountNumber: string;
  shebaNumber: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  expectedAmount: number;
  collectedAmount: number;
  maturityDate: string;
  createdAt: number;
}

export interface ReceiptRecord {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  refNumber: string;
  sender: string;
  receiver: string;
  description: string;
  imageUrl: string;
  createdAt: number;
  dynamicFields: Record<string, string>;
  matchedCreditorId?: string;
}

export interface ExtractedData {
  amount: number;
  date: string;
  refNumber: string;
  sender: string;
  receiver: string;
  description: string;
  dynamicFields: Record<string, string>;
  matchedCreditorId?: string;
}

export type ViewMode = 'dashboard' | 'creditors' | 'customers' | 'upload' | 'list' | 'reports';

