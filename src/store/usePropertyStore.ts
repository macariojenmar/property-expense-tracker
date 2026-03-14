import { create } from "zustand";

export interface RecurringExpense {
  name: string;
  amount: number;
  day: number;
}

export interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  funds: number;
  profit: number;
  currentExpense: number;
  estimatedExpense: number;
  estimatedFunds: number;
  estimatedProfit: number;
  recurringExpenses: RecurringExpense[];
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

const mockProperties: Property[] = [
  {
    id: 1,
    name: "The Odd Unit",
    location: "Tuding, Itogon, Benguet",
    price: 5000,
    funds: 25000,
    profit: 8500,
    currentExpense: 1200,
    estimatedExpense: 3000,
    estimatedFunds: 32000,
    estimatedProfit: 12000,
    recurringExpenses: [
      { name: "Rent", amount: 500, day: 1 },
      { name: "Internet", amount: 50, day: 15 },
      { name: "Association Dues", amount: 150, day: 31 },
    ],
  },
  {
    id: 2,
    name: "Unit 05",
    location: "Suello Village, Baguio City, Benguet",
    price: 3500,
    funds: 12000,
    profit: 4200,
    currentExpense: 800,
    estimatedExpense: 1500,
    estimatedFunds: 15500,
    estimatedProfit: 6800,
    recurringExpenses: [
      { name: "Rent", amount: 400, day: 1 },
      { name: "Water", amount: 30, day: 7 },
    ],
  },
];

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: mockProperties,
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
}));
