import { create } from "zustand";

export interface RecurringExpense {
  name: string;
  amount: number;
  day: number;
}

export interface Payout {
  id: number;
  amount: number;
  date: string;
  propertyId: number;
  refundAmount?: number;
  status?: "paid" | "refunded" | "partially-refunded";
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
  payouts: Payout[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  refundPayout: (payoutId: number, amount: number) => void;
  revertRefund: (payoutId: number) => void;
}

const mockPayouts: Payout[] = [
  { id: 1, amount: 15250, date: "2026-03-08", propertyId: 1 },
  { id: 2, amount: 12100, date: "2026-02-28", propertyId: 2 },
  { id: 3, amount: 18400, date: "2026-03-20", propertyId: 1 },
  { id: 4, amount: 14200, date: "2026-03-25", propertyId: 2 },
  { id: 5, amount: 9800, date: "2026-03-28", propertyId: 1 },
  { id: 6, amount: 16500, date: "2026-03-30", propertyId: 2 },
];

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
  payouts: mockPayouts,
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  refundPayout: (payoutId, amount) =>
    set((state) => ({
      payouts: state.payouts.map((p) => {
        if (p.id === payoutId) {
          const totalRefunded = (p.refundAmount || 0) + amount;
          const status =
            totalRefunded >= p.amount ? "refunded" : "partially-refunded";
          return {
            ...p,
            refundAmount: totalRefunded,
            status,
          };
        }
        return p;
      }),
    })),
  revertRefund: (payoutId) =>
    set((state) => ({
      payouts: state.payouts.map((p) => {
        if (p.id === payoutId) {
          return {
            ...p,
            refundAmount: undefined,
            status: undefined,
          };
        }
        return p;
      }),
    })),
}));
