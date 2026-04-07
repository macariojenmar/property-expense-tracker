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
  cumulativeProfit?: number;
}

interface PropertyStore {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  isFetchingDetails?: boolean;
  lastFetchedDetails: Record<string, number>;
  lastFetchedFilters: Record<string, string>;
  setProperties: (properties: Property[] | ((prev: Property[]) => Property[])) => void;
  setSelectedProperty: (property: Property | null | ((prev: Property | null) => Property | null)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsFetchingDetails: (isFetchingDetails: boolean) => void;
  refresh: () => Promise<void>;
  fetchPropertyDetails: (id: string, options?: { force?: boolean; filter?: { start: string; end: string } }) => Promise<void>;
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
  lastFetchedFilters: {},
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
      const currentProperties = get().properties;
      
      const mergedData = data.map((p) => {
        if (currentSelected && p.id === currentSelected.id && currentSelected.expenses) {
           return { ...p, expenses: currentSelected.expenses, payouts: currentSelected.payouts };
        }
        const existing = currentProperties.find((ep) => ep.id === p.id);
        if (existing && existing.expenses && existing.expenses.length > 0) {
           return { ...p, expenses: existing.expenses, payouts: existing.payouts };
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
  fetchPropertyDetails: async (id: string, options?: { force?: boolean; filter?: { start: string; end: string } }) => {
    const { getProperty } = await import("@/lib/actions/property");
    
    const filterKey = options?.filter ? `${options.filter.start}_${options.filter.end}` : "all";
    const lastFilter = get().lastFetchedFilters[id];
    const lastFetchedTime = get().lastFetchedDetails[id] || 0;
    const isSameFilter = filterKey === lastFilter;
    const isFresh = Date.now() - lastFetchedTime < 5 * 60 * 1000;
    const hasExpenses = get().properties.find(p => p.id === id)?.expenses !== undefined;
    
    // Fetch if forced, filter changed, cache expired, or expenses list missing
    const needsFetch = options?.force || !isSameFilter || !isFresh || !hasExpenses;
    
    if (!needsFetch) {
      if (get().selectedProperty?.id !== id) {
        set({ selectedProperty: get().properties.find(p => p.id === id) || null });
      }
      return;
    }

    set({ isFetchingDetails: true });
    try {
      const data = await getProperty(id, options?.filter) as unknown as Property;
      if (data) {
        set((state) => ({
          properties: state.properties.some((p) => p.id === id)
            ? state.properties.map((p) => (p.id === id ? data : p))
            : [...state.properties, data],
          selectedProperty: data,
          lastFetchedDetails: { ...state.lastFetchedDetails, [id]: Date.now() },
          lastFetchedFilters: { ...state.lastFetchedFilters, [id]: filterKey }
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
        const { [id]: _, ...restLogs } = state.lastFetchedDetails;
        const { [id]: __, ...restFilters } = state.lastFetchedFilters;
        return { 
          lastFetchedDetails: restLogs,
          lastFetchedFilters: restFilters
        };
      });
    } else {
      set({ lastFetchedDetails: {}, lastFetchedFilters: {} });
    }
  },
}));
