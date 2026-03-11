import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getTodayDate } from './utils/dateUtils';

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface SupplierPayment {
  id: string;
  date: string;
  supplierName: string;
  amount: number;
  remarks?: string;
  notes?: string;
  purchaseId?: string;
}

export interface CustomerPayment {
  id: string;
  date: string;
  customerName: string;
  amount: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierName: string;
  quantity: number; // kg
  pricePerKg: number;
  totalCost: number;
  paidAmount?: number;
  discount?: number;
  type: 'wet' | 'dry';
  totalBags?: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface Conversion {
  id: string;
  date: string;
  wetQuantityUsed: number;
  bagsUsed?: number;
  purchasePrice?: number;
  dryQuantityProduced: number;
  purchaseId?: string;
  remainBags?: number;
  remainQuantity?: number;
}

export interface CompanyAdvance {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  quantity: number; // kg
  pricePerKg: number;
  totalRevenue: number;
  paidAmount?: number;
  discount?: number;
}

export interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface Task {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface LaborRecord {
  id: string;
  date: string;
  workerName: string;
  processName: string;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  notes: string;
}

export interface Loan {
  id: string;
  date: string;
  personName: string;
  amount: number;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface ProductDelivery {
  id: string;
  date: string;
  startDate: string;
  endDate: string;
  totalPurchases: number;
  wetPowderCost?: number;
  dryPowderCost?: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  totalWetUsed?: number;
  totalDryProduced?: number;
  description: string;
}

export interface ProfitWithdrawal {
  id: string;
  date: string;
  amount: number;
  deliveryId: string;
  notes: string;
}

export interface AppState {
  purchases: Purchase[];
  expenses: Expense[];
  conversions: Conversion[];
  sales: Sale[];
  suppliers: Supplier[];
  customers: Customer[];
  expenseCategories: ExpenseCategory[];
  initialCapital: number;
  companyInfo: CompanyInfo;
  supplierPayments: SupplierPayment[];
  customerPayments: CustomerPayment[];
  notes: Note[];
  loans: Loan[];
  companyAdvances: CompanyAdvance[];
  productDeliveries: ProductDelivery[];
  profitWithdrawals: ProfitWithdrawal[];
  tasks: Task[];
  laborRecords: LaborRecord[];
  appPin: string;
  lastBackupTime: string | null;
  language: 'en' | 'bn';
  weatherLocation: string;
  showChatbot: boolean;
}

const initialState: AppState = {
  purchases: [],
  expenses: [],
  conversions: [],
  sales: [],
  suppliers: [],
  customers: [],
  expenseCategories: [
    { id: 'default-1', name: 'Labor (Drying)' },
    { id: 'default-2', name: 'Transport' },
    { id: 'default-3', name: 'Other' }
  ],
  initialCapital: 0,
  companyInfo: { name: 'PowderBiz', address: '', phone: '', email: '' },
  supplierPayments: [],
  customerPayments: [],
  notes: [],
  loans: [],
  companyAdvances: [],
  productDeliveries: [],
  profitWithdrawals: [],
  tasks: [],
  laborRecords: [],
  appPin: '1234',
  lastBackupTime: null,
  language: 'en',
  weatherLocation: 'Jamalpur',
  showChatbot: true,
};

interface AppContextType {
  state: AppState;
  addPurchase: (p: Omit<Purchase, 'id'>) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  addConversion: (c: Omit<Conversion, 'id'>) => void;
  addSale: (s: Omit<Sale, 'id'>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  addExpenseCategory: (c: Omit<ExpenseCategory, 'id'>) => void;
  editPurchase: (id: string, p: Omit<Purchase, 'id'>) => void;
  editExpense: (id: string, e: Omit<Expense, 'id'>) => void;
  editConversion: (id: string, c: Omit<Conversion, 'id'>) => void;
  editSale: (id: string, s: Omit<Sale, 'id'>) => void;
  editSupplier: (id: string, s: Omit<Supplier, 'id'>) => void;
  editCustomer: (id: string, c: Omit<Customer, 'id'>) => void;
  editExpenseCategory: (id: string, c: Omit<ExpenseCategory, 'id'>) => void;
  deletePurchase: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteConversion: (id: string) => void;
  deleteSale: (id: string) => void;
  deleteSupplier: (id: string) => void;
  deleteCustomer: (id: string) => void;
  deleteExpenseCategory: (id: string) => void;
  setInitialCapital: (amount: number) => void;
  setCompanyInfo: (info: CompanyInfo) => void;
  addSupplierPayment: (p: Omit<SupplierPayment, 'id'>) => void;
  editSupplierPayment: (id: string, p: Omit<SupplierPayment, 'id'>) => void;
  deleteSupplierPayment: (id: string) => void;
  addCustomerPayment: (p: Omit<CustomerPayment, 'id'>) => void;
  editCustomerPayment: (id: string, p: Omit<CustomerPayment, 'id'>) => void;
  deleteCustomerPayment: (id: string) => void;
  addNote: (n: Omit<Note, 'id'>) => void;
  editNote: (id: string, n: Omit<Note, 'id'>) => void;
  deleteNote: (id: string) => void;
  addLoan: (l: Omit<Loan, 'id'>) => void;
  editLoan: (id: string, l: Omit<Loan, 'id'>) => void;
  deleteLoan: (id: string) => void;
  addCompanyAdvance: (a: Omit<CompanyAdvance, 'id'>) => void;
  editCompanyAdvance: (id: string, a: Omit<CompanyAdvance, 'id'>) => void;
  deleteCompanyAdvance: (id: string) => void;
  addProductDelivery: (d: Omit<ProductDelivery, 'id'>) => void;
  editProductDelivery: (id: string, d: Omit<ProductDelivery, 'id'>) => void;
  deleteProductDelivery: (id: string) => void;
  addProfitWithdrawal: (p: Omit<ProfitWithdrawal, 'id'>) => void;
  editProfitWithdrawal: (id: string, p: Omit<ProfitWithdrawal, 'id'>) => void;
  deleteProfitWithdrawal: (id: string) => void;
  addTask: (t: Omit<Task, 'id'>) => void;
  editTask: (id: string, t: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addLaborRecord: (l: Omit<LaborRecord, 'id'>) => void;
  editLaborRecord: (id: string, l: Omit<LaborRecord, 'id'>) => void;
  deleteLaborRecord: (id: string) => void;
  setAppPin: (pin: string) => void;
  setLastBackupTime: (time: string) => void;
  resetState: () => void;
  importState: (newState: AppState) => void;
  setLanguage: (lang: 'en' | 'bn') => void;
  setWeatherLocation: (location: string) => void;
  setShowChatbot: (show: boolean) => void;
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingSync: boolean;
  lastSynced: string | null;
  syncData: () => void;
  wetStock: number;
  dryStock: number;
  wetBagsStock: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('powderbiz_last_synced'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingSync, setHasPendingSync] = useState(() => {
    const lastSyncedTime = localStorage.getItem('powderbiz_last_synced');
    const lastDataUpdate = localStorage.getItem('powderbiz_last_update');
    if (!lastSyncedTime || !lastDataUpdate) return false;
    return new Date(lastDataUpdate) > new Date(lastSyncedTime);
  });

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('powderbiz_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
          conversions: Array.isArray(parsed.conversions) ? parsed.conversions : [],
          sales: Array.isArray(parsed.sales) ? parsed.sales : [],
          suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
          customers: Array.isArray(parsed.customers) ? parsed.customers : [],
          expenseCategories: Array.isArray(parsed.expenseCategories) ? parsed.expenseCategories : initialState.expenseCategories,
          initialCapital: parsed.initialCapital || 0,
          companyInfo: parsed.companyInfo || initialState.companyInfo,
          supplierPayments: Array.isArray(parsed.supplierPayments) ? parsed.supplierPayments : [],
          customerPayments: Array.isArray(parsed.customerPayments) ? parsed.customerPayments : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          loans: Array.isArray(parsed.loans) ? parsed.loans : [],
          companyAdvances: Array.isArray(parsed.companyAdvances) ? parsed.companyAdvances : [],
          productDeliveries: Array.isArray(parsed.productDeliveries) ? parsed.productDeliveries : [],
          profitWithdrawals: Array.isArray(parsed.profitWithdrawals) ? parsed.profitWithdrawals : [],
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          laborRecords: Array.isArray(parsed.laborRecords) ? parsed.laborRecords : [],
          appPin: parsed.appPin || '1234',
          lastBackupTime: parsed.lastBackupTime || null,
          language: parsed.language || 'en',
          weatherLocation: parsed.weatherLocation || 'Jamalpur',
          showChatbot: parsed.showChatbot !== undefined ? parsed.showChatbot : true,
        };
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    return initialState;
  });

  const syncData = async (dataToSync: AppState) => {
    if (!navigator.onLine) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastSynced(result.timestamp);
        setHasPendingSync(false);
        localStorage.setItem('powderbiz_last_synced', result.timestamp);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const fetchInitialState = async () => {
      if (!navigator.onLine) return;
      try {
        const response = await fetch('/api/state');
        if (response.ok) {
          const serverState = await response.json();
          // Only update if server state is newer or local is empty
          // For simplicity in this demo, we'll just merge or overwrite
          // In a real app, you'd use timestamps for conflict resolution
          setState(serverState);
        }
      } catch (error) {
        console.error("Failed to fetch initial state:", error);
      }
    };
    fetchInitialState();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncData(state);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state]);

  useEffect(() => {
    localStorage.setItem('powderbiz_data_v2', JSON.stringify(state));
    localStorage.setItem('powderbiz_last_update', new Date().toISOString());
    setHasPendingSync(true);
    
    // Auto-sync on changes if online
    const timeoutId = setTimeout(() => {
      if (isOnline) {
        syncData(state);
      }
    }, 2000); // Debounce sync

    return () => clearTimeout(timeoutId);
  }, [state, isOnline]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPurchase = (p: Omit<Purchase, 'id'>) => {
    setState(s => ({ ...s, purchases: [...s.purchases, { ...p, id: generateId() }] }));
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    setState(s => ({ ...s, expenses: [...s.expenses, { ...e, id: generateId() }] }));
  };

  const addConversion = (c: Omit<Conversion, 'id'>) => {
    setState(s => ({ ...s, conversions: [...s.conversions, { ...c, id: generateId() }] }));
  };

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    setState(s => ({ ...s, sales: [...s.sales, { ...saleData, id: generateId() }] }));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    setState(s => ({ ...s, suppliers: [...s.suppliers, { ...supplierData, id: generateId() }] }));
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    setState(s => ({ ...s, customers: [...s.customers, { ...customerData, id: generateId() }] }));
  };

  const addExpenseCategory = (categoryData: Omit<ExpenseCategory, 'id'>) => {
    setState(s => ({ ...s, expenseCategories: [...s.expenseCategories, { ...categoryData, id: generateId() }] }));
  };

  const editPurchase = (id: string, p: Omit<Purchase, 'id'>) => {
    setState(s => ({ ...s, purchases: s.purchases.map(item => item.id === id ? { ...p, id } : item) }));
  };

  const editExpense = (id: string, e: Omit<Expense, 'id'>) => {
    setState(s => ({ ...s, expenses: s.expenses.map(item => item.id === id ? { ...e, id } : item) }));
  };

  const editConversion = (id: string, c: Omit<Conversion, 'id'>) => {
    setState(s => ({ ...s, conversions: s.conversions.map(item => item.id === id ? { ...c, id } : item) }));
  };

  const editSale = (id: string, saleData: Omit<Sale, 'id'>) => {
    setState(s => ({ ...s, sales: s.sales.map(item => item.id === id ? { ...saleData, id } : item) }));
  };

  const editSupplier = (id: string, supplierData: Omit<Supplier, 'id'>) => {
    setState(s => ({ ...s, suppliers: s.suppliers.map(item => item.id === id ? { ...supplierData, id } : item) }));
  };

  const editCustomer = (id: string, customerData: Omit<Customer, 'id'>) => {
    setState(s => ({ ...s, customers: s.customers.map(item => item.id === id ? { ...customerData, id } : item) }));
  };

  const editExpenseCategory = (id: string, categoryData: Omit<ExpenseCategory, 'id'>) => {
    setState(s => ({ ...s, expenseCategories: s.expenseCategories.map(item => item.id === id ? { ...categoryData, id } : item) }));
  };

  const deletePurchase = (id: string) => {
    setState(s => ({ ...s, purchases: s.purchases.filter(p => p.id !== id) }));
  };

  const deleteExpense = (id: string) => {
    setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== id) }));
  };

  const deleteConversion = (id: string) => {
    setState(s => ({ ...s, conversions: s.conversions.filter(c => c.id !== id) }));
  };

  const deleteSale = (id: string) => {
    setState(s => ({ ...s, sales: s.sales.filter(sale => sale.id !== id) }));
  };

  const deleteSupplier = (id: string) => {
    setState(s => ({ ...s, suppliers: s.suppliers.filter(sup => sup.id !== id) }));
  };

  const deleteCustomer = (id: string) => {
    setState(s => ({ ...s, customers: s.customers.filter(cus => cus.id !== id) }));
  };

  const deleteExpenseCategory = (id: string) => {
    setState(s => ({ ...s, expenseCategories: s.expenseCategories.filter(cat => cat.id !== id) }));
  };

  const setInitialCapital = (amount: number) => {
    setState(s => ({ ...s, initialCapital: amount }));
  };

  const setCompanyInfo = (info: CompanyInfo) => {
    setState(s => ({ ...s, companyInfo: info }));
  };

  const addSupplierPayment = (p: Omit<SupplierPayment, 'id'>) => {
    setState(s => ({ ...s, supplierPayments: [...s.supplierPayments, { ...p, id: generateId() }] }));
  };

  const editSupplierPayment = (id: string, p: Omit<SupplierPayment, 'id'>) => {
    setState(s => ({ ...s, supplierPayments: s.supplierPayments.map(pay => pay.id === id ? { ...p, id } : pay) }));
  };

  const deleteSupplierPayment = (id: string) => {
    setState(s => ({ ...s, supplierPayments: s.supplierPayments.filter(p => p.id !== id) }));
  };

  const addCustomerPayment = (p: Omit<CustomerPayment, 'id'>) => {
    setState(s => ({ ...s, customerPayments: [...s.customerPayments, { ...p, id: generateId() }] }));
  };

  const editCustomerPayment = (id: string, p: Omit<CustomerPayment, 'id'>) => {
    setState(s => ({ ...s, customerPayments: s.customerPayments.map(pay => pay.id === id ? { ...p, id } : pay) }));
  };

  const deleteCustomerPayment = (id: string) => {
    setState(s => ({ ...s, customerPayments: s.customerPayments.filter(p => p.id !== id) }));
  };

  const addNote = (n: Omit<Note, 'id'>) => {
    setState(s => ({ ...s, notes: [...s.notes, { ...n, id: generateId() }] }));
  };

  const editNote = (id: string, n: Omit<Note, 'id'>) => {
    setState(s => ({ ...s, notes: s.notes.map(note => note.id === id ? { ...n, id } : note) }));
  };

  const deleteNote = (id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(note => note.id !== id) }));
  };

  const addLoan = (l: Omit<Loan, 'id'>) => {
    setState(s => ({ ...s, loans: [...s.loans, { ...l, id: generateId() }] }));
  };

  const editLoan = (id: string, l: Omit<Loan, 'id'>) => {
    setState(s => ({ ...s, loans: s.loans.map(loan => loan.id === id ? { ...l, id } : loan) }));
  };

  const deleteLoan = (id: string) => {
    setState(s => ({ ...s, loans: s.loans.filter(l => l.id !== id) }));
  };

  const addCompanyAdvance = (a: Omit<CompanyAdvance, 'id'>) => {
    setState(s => ({ ...s, companyAdvances: [...s.companyAdvances, { ...a, id: generateId() }] }));
  };

  const editCompanyAdvance = (id: string, a: Omit<CompanyAdvance, 'id'>) => {
    setState(s => ({ ...s, companyAdvances: s.companyAdvances.map(adv => adv.id === id ? { ...a, id } : adv) }));
  };

  const deleteCompanyAdvance = (id: string) => {
    setState(s => ({ ...s, companyAdvances: s.companyAdvances.filter(a => a.id !== id) }));
  };

  const addProductDelivery = (d: Omit<ProductDelivery, 'id'>) => {
    setState(s => ({ ...s, productDeliveries: [...s.productDeliveries, { ...d, id: generateId() }] }));
  };

  const editProductDelivery = (id: string, d: Omit<ProductDelivery, 'id'>) => {
    setState(s => ({ ...s, productDeliveries: s.productDeliveries.map(item => item.id === id ? { ...d, id } : item) }));
  };

  const deleteProductDelivery = (id: string) => {
    setState(s => ({ ...s, productDeliveries: s.productDeliveries.filter(d => d.id !== id) }));
  };

  const addProfitWithdrawal = (p: Omit<ProfitWithdrawal, 'id'>) => {
    setState(s => ({ ...s, profitWithdrawals: [...s.profitWithdrawals, { ...p, id: generateId() }] }));
  };

  const editProfitWithdrawal = (id: string, p: Omit<ProfitWithdrawal, 'id'>) => {
    setState(s => ({ ...s, profitWithdrawals: s.profitWithdrawals.map(pw => pw.id === id ? { ...p, id } : pw) }));
  };

  const deleteProfitWithdrawal = (id: string) => {
    setState(s => ({ ...s, profitWithdrawals: s.profitWithdrawals.filter(pw => pw.id !== id) }));
  };

  const addTask = (t: Omit<Task, 'id'>) => {
    setState(s => ({ ...s, tasks: [...s.tasks, { ...t, id: generateId() }] }));
  };

  const editTask = (id: string, t: Omit<Task, 'id'>) => {
    setState(s => ({ ...s, tasks: s.tasks.map(item => item.id === id ? { ...t, id } : item) }));
  };

  const toggleTask = (id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
  };

  const deleteTask = (id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  };

  const addLaborRecord = (l: Omit<LaborRecord, 'id'>) => {
    setState(s => ({ ...s, laborRecords: [...s.laborRecords, { ...l, id: generateId() }] }));
  };

  const editLaborRecord = (id: string, l: Omit<LaborRecord, 'id'>) => {
    setState(s => ({ ...s, laborRecords: s.laborRecords.map(item => item.id === id ? { ...l, id } : item) }));
  };

  const deleteLaborRecord = (id: string) => {
    setState(s => ({ ...s, laborRecords: s.laborRecords.filter(l => l.id !== id) }));
  };

  const setAppPin = (pin: string) => {
    setState(s => ({ ...s, appPin: pin }));
  };

  const setLastBackupTime = (time: string) => {
    setState(s => ({ ...s, lastBackupTime: time }));
  };

  const resetState = () => {
    setState(initialState);
  };

  const importState = (newState: AppState) => {
    setState(newState);
  };

  const setLanguage = (lang: 'en' | 'bn') => {
    setState(s => ({ ...s, language: lang }));
  };

  const setWeatherLocation = (location: string) => {
    setState(s => ({ ...s, weatherLocation: location }));
  };

  const setShowChatbot = (show: boolean) => {
    setState(s => ({ ...s, showChatbot: show }));
  };

  const wetStock = state.purchases.filter(p => p.type === 'wet' || !p.type).reduce((sum, p) => sum + (p.quantity || 0), 0) -
                   state.conversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0);

  const dryStock = state.conversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0) +
                   state.purchases.filter(p => p.type === 'dry').reduce((sum, p) => sum + (p.quantity || 0), 0) -
                   state.sales.reduce((sum, s) => sum + (s.quantity || 0), 0);

  const wetBagsStock = state.purchases.filter(p => p.type === 'wet' || !p.type).reduce((sum, p) => sum + (p.totalBags || 0), 0) -
                       state.conversions.reduce((sum, c) => sum + (c.bagsUsed || 0), 0);

  return (
    <AppContext.Provider value={{
      state,
      addPurchase,
      addExpense,
      addConversion,
      addSale,
      addSupplier,
      addCustomer,
      addExpenseCategory,
      editPurchase,
      editExpense,
      editConversion,
      editSale,
      editSupplier,
      editCustomer,
      editExpenseCategory,
      deletePurchase,
      deleteExpense,
      deleteConversion,
      deleteSale,
      deleteSupplier,
      deleteCustomer,
      deleteExpenseCategory,
      setInitialCapital,
      setCompanyInfo,
      addSupplierPayment,
      editSupplierPayment,
      deleteSupplierPayment,
      addCustomerPayment,
      editCustomerPayment,
      deleteCustomerPayment,
      addNote,
      editNote,
      deleteNote,
      addLoan,
      editLoan,
      deleteLoan,
      addCompanyAdvance,
      editCompanyAdvance,
      deleteCompanyAdvance,
      addProductDelivery,
      editProductDelivery,
      deleteProductDelivery,
      addProfitWithdrawal,
      editProfitWithdrawal,
      deleteProfitWithdrawal,
      addTask,
      editTask,
      toggleTask,
      deleteTask,
      addLaborRecord,
      editLaborRecord,
      deleteLaborRecord,
      setAppPin,
      setLastBackupTime,
      resetState,
      importState,
      setLanguage,
      setWeatherLocation,
      setShowChatbot,
      isOnline,
      isSyncing,
      hasPendingSync,
      lastSynced,
      syncData: () => syncData(state),
      wetStock,
      dryStock,
      wetBagsStock
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
