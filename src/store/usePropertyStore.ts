import { create } from "zustand";

export interface RecurringExpense {
  id?: string;
  name: string;
  amount: number;
  day: number;
  pendingToId?: string;
  pendingTo?: { name: string };
}

export interface Property {
  id: string;
  name: string;
  location: string;
  price?: number;
  initialFunds: number;
  funds: number;
  profit: number;
  currentExpense: number;
  estimatedExpense?: number;
  estimatedFunds?: number;
  estimatedProfit?: number;
  recurringExpenses: RecurringExpense[];
  expenses?: any[];
  payouts?: any[];
  waivedRecurringExpenses?: any[];
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) => void;
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: [],
  selectedProperty: null,
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) =>
    set((state) => ({
      properties: typeof properties === "function" ? properties(state.properties) : properties,
    })),
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) =>
    set((state) => ({
      selectedProperty: typeof property === "function" ? property(state.selectedProperty) : property,
    })),
}));
