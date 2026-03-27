import { create } from "zustand";

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  day: number;
  propertyId: string;
  pendingToId?: string | null;
  pendingTo?: {
    id: string;
    name: string;
    type?: string | null;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  note?: string | null;
  date: Date | string;
  propertyId: string;
  isRecurring: boolean;
  recurringRef?: string | null;
  status: "PENDING" | "SETTLED";
  pendingToId?: string | null;
  pendingTo?: {
    id: string;
    name: string;
    type?: string | null;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Payout {
  id: string;
  name?: string | null;
  amount: number;
  date: Date | string;
  propertyId: string;
  refundAmount?: number | null;
  status: "PAID" | "REFUNDED" | "PARTIALLY_REFUNDED";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WaivedRecurringExpense {
  id: string;
  monthKey: string;
  recurringExpenseId: string;
  propertyId: string;
  createdAt: Date | string;
}

export interface Property {
  id: string;
  name: string;
  location?: string | null;
  price?: number | null;
  initialFunds: number;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  profit: number;
  funds: number;
  currentExpense: number;
  recurringExpenses: RecurringExpense[];
  expenses: Expense[];
  payouts: Payout[];
  waivedRecurringExpenses: WaivedRecurringExpense[];
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  isFetchingDetails?: boolean;
  lastFetchedDetails: Record<string, number>;
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) => void;
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsFetchingDetails: (isFetchingDetails: boolean) => void;
  refresh: () => Promise<void>;
  fetchPropertyDetails: (id: string, options?: { force?: boolean }) => Promise<void>;
  invalidateCache: (id?: string) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  selectedProperty: null,
  isLoading: false,
  isSaving: false,
  isInitialized: false,
  isFetchingDetails: false,
  lastFetchedDetails: {},
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) =>
    set((state) => ({
      properties: typeof properties === "function" ? properties(state.properties) : properties,
    })),
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) =>
    set((state) => {
      const nextProperty = typeof property === "function" ? property(state.selectedProperty) : property;
      return { selectedProperty: nextProperty };
    }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setIsFetchingDetails: (isFetchingDetails: boolean) => set({ isFetchingDetails }),
  refresh: async () => {
    const { getProperties } = await import("@/lib/actions/property");
    set({ isLoading: true });
    try {
      const data = await getProperties() as unknown as Property[];
      const currentSelected = get().selectedProperty;
      
      const mergedData = data.map((p) => {
        if (currentSelected && p.id === currentSelected.id && currentSelected.expenses) {
           return { ...p, expenses: currentSelected.expenses, payouts: currentSelected.payouts };
        }
        return p;
      });

      set({ properties: mergedData });
      if (currentSelected) {
        const updatedSelected = mergedData.find((p) => p.id === currentSelected.id);
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
  fetchPropertyDetails: async (id: string, options?: { force?: boolean }) => {
    const { getProperty } = await import("@/lib/actions/property");
    
    // Check cache: if we have details and stayed within 5 mins, skip unless forced
    const lastFetched = get().lastFetchedDetails[id];
    const property = get().properties.find(p => p.id === id);
    const hasDetails = property && property.expenses && property.expenses.length > 0 || property?.payouts && property.payouts.length > 0;
    
    // If we have any expenses/payouts or it was fetched recently, we consider it "cached"
    // We use a 5-minute stale-time for auto-refresh if needed, but for now just check if it exists
    if (!options?.force && hasDetails) {
      // Still set selected property if it's not set correctly
      if (get().selectedProperty?.id !== id) {
        set({ selectedProperty: property || null });
      }
      return;
    }

    set({ isFetchingDetails: true });
    try {
      const data = await getProperty(id) as unknown as Property;
      if (data) {
        set((state) => ({
          properties: state.properties.map((p) => (p.id === id ? data : p)),
          selectedProperty: state.selectedProperty?.id === id ? data : state.selectedProperty,
          lastFetchedDetails: { ...state.lastFetchedDetails, [id]: Date.now() }
        }));
      }
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    } finally {
      set({ isFetchingDetails: false });
    }
  },
  invalidateCache: (id?: string) => {
    if (id) {
      set((state) => {
        const { [id]: _, ...rest } = state.lastFetchedDetails;
        return { lastFetchedDetails: rest };
      });
    } else {
      set({ lastFetchedDetails: {} });
    }
  },
}));
