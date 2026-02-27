import React, { createContext, useContext, useState, useEffect } from 'react';

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
  dryQuantityProduced: number;
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
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  description: string;
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
  productDeliveries: ProductDelivery[];
  language: 'en' | 'bn';
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
  productDeliveries: [],
  language: 'en',
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
  addProductDelivery: (d: Omit<ProductDelivery, 'id'>) => void;
  deleteProductDelivery: (id: string) => void;
  resetState: () => void;
  importState: (newState: AppState) => void;
  setLanguage: (lang: 'en' | 'bn') => void;
  wetStock: number;
  dryStock: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          productDeliveries: Array.isArray(parsed.productDeliveries) ? parsed.productDeliveries : [],
          language: parsed.language || 'en',
        };
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('powderbiz_data_v2', JSON.stringify(state));
  }, [state]);

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

  const addProductDelivery = (d: Omit<ProductDelivery, 'id'>) => {
    setState(s => ({ ...s, productDeliveries: [...s.productDeliveries, { ...d, id: generateId() }] }));
  };

  const deleteProductDelivery = (id: string) => {
    setState(s => ({ ...s, productDeliveries: s.productDeliveries.filter(d => d.id !== id) }));
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

  const wetStock = state.purchases.filter(p => p.type === 'wet' || !p.type).reduce((sum, p) => sum + (p.quantity || 0), 0) -
                   state.conversions.reduce((sum, c) => sum + (c.wetQuantityUsed || 0), 0);

  const dryStock = state.conversions.reduce((sum, c) => sum + (c.dryQuantityProduced || 0), 0) +
                   state.purchases.filter(p => p.type === 'dry').reduce((sum, p) => sum + (p.quantity || 0), 0) -
                   state.sales.reduce((sum, s) => sum + (s.quantity || 0), 0);

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
      addProductDelivery,
      deleteProductDelivery,
      resetState,
      importState,
      setLanguage,
      wetStock,
      dryStock
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
