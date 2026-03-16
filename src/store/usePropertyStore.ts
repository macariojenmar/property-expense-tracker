import { create } from "zustand";

export interface RecurringExpense {
  id?: string;
  name: string;
  amount: number;
  day: number;
  pendingToId?: string;
  pendingTo?: { name: string };
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  propertyId: string;
  note?: string;
  recurringRef?: string;
  isRecurring?: boolean;
  status: "PENDING" | "SETTLED";
  pendingTo?: { name: string };
}

export interface Payout {
  id: string;
  amount: number;
  date: string;
  propertyId: string;
  refundAmount?: number;
  status?: "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED";
}

export interface WaivedRecurringExpense {
  id: string;
  recurringExpenseId: string;
  monthKey: string;
  propertyId: string;
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
  expenses?: Expense[];
  payouts?: Payout[];
  waivedRecurringExpenses?: WaivedRecurringExpense[];
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) => void;
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  refresh: () => Promise<void>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  selectedProperty: null,
  isLoading: false,
  isSaving: false,
  isInitialized: false,
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) =>
    set((state) => ({
      properties: typeof properties === "function" ? properties(state.properties) : properties,
    })),
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) =>
    set((state) => ({
      selectedProperty: typeof property === "function" ? property(state.selectedProperty) : property,
    })),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  refresh: async () => {
    const { getProperties } = await import("@/lib/actions/property");
    set({ isLoading: true });
    try {
      const data = await getProperties() as Property[];
      const currentSelectedId = get().selectedProperty?.id;
      set({ properties: data });
      if (currentSelectedId) {
        const updatedSelected = data.find((p) => p.id === currentSelectedId);
        if (updatedSelected) {
          set({ selectedProperty: updatedSelected });
        }
      }
    } catch (error) {
      console.error("Failed to refresh properties:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
