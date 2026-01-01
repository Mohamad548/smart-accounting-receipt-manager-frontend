'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReceiptRecord, Creditor, Customer } from '@/types';

interface AppContextType {
  records: ReceiptRecord[];
  creditors: Creditor[];
  customers: Customer[];
  addRecord: (record: ReceiptRecord) => void;
  deleteRecord: (id: string) => void;
  setCreditors: React.Dispatch<React.SetStateAction<Creditor[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ReceiptRecord[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const r = localStorage.getItem('acc_records');
    const cr = localStorage.getItem('acc_creditors');
    const cu = localStorage.getItem('acc_customers');
    if (r) setRecords(JSON.parse(r));
    if (cr) setCreditors(JSON.parse(cr));
    if (cu) setCustomers(JSON.parse(cu));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('acc_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('acc_creditors', JSON.stringify(creditors));
  }, [creditors]);

  useEffect(() => {
    localStorage.setItem('acc_customers', JSON.stringify(customers));
  }, [customers]);

  const addRecord = (record: ReceiptRecord) => {
    setRecords(prev => [record, ...prev]);
    // Update customer collected amount
    setCustomers(prev => prev.map(c => 
      c.id === record.customerId 
        ? { ...c, collectedAmount: c.collectedAmount + record.amount }
        : c
    ));
  };

  const deleteRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
      setCustomers(prev => prev.map(c => 
        c.id === record.customerId 
          ? { ...c, collectedAmount: Math.max(0, c.collectedAmount - record.amount) }
          : c
      ));
    }
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        records,
        creditors,
        customers,
        addRecord,
        deleteRecord,
        setCreditors,
        setCustomers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

