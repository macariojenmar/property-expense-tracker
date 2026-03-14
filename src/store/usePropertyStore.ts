import { create } from "zustand";

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
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

const mockProperties: Property[] = [
  {
    id: 1,
    name: "Seaside Sanctuary",
    location: "Siargao, Philippines",
    price: 5000,
    funds: 25000,
    profit: 8500,
    currentExpense: 1200,
    estimatedExpense: 3000,
    estimatedFunds: 32000,
    estimatedProfit: 12000,
  },
  {
    id: 2,
    name: "Mountain Retreat",
    location: "Bagui, Philippines",
    price: 3500,
    funds: 12000,
    profit: 4200,
    currentExpense: 800,
    estimatedExpense: 1500,
    estimatedFunds: 15500,
    estimatedProfit: 6800,
  },
];

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: mockProperties,
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
}));
