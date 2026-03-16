'use client';

import * as React from 'react';

export type Currency = {
  code: string;
  symbol: string;
  label: string;
};

export const currencies: Currency[] = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number | string) => string;
};

export const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<Currency>(currencies[0]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('app-currency');
    if (saved) {
      const found = currencies.find(c => c.code === saved);
      if (found) setCurrencyState(found);
    }
  }, []);

  const setCurrency = (code: string) => {
    const found = currencies.find(c => c.code === code);
    if (found) {
      setCurrencyState(found);
      localStorage.setItem('app-currency', code);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    if (isNaN(num)) return `${currency.symbol}0.00`;
    return `${currency.symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
