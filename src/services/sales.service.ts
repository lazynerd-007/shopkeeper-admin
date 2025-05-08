import api from './api';

// Type definitions
export interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  productId: string;
}

export interface PaymentItem {
  id: string;
  amountPaid: number;
  paymentMethod: string;
  paymentRef: string;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionReference: string;
  totalPriceAfterProductDiscount: number;
  totalPriceBeforeProductDiscount: number;
  amountToPay: number;
  amountPaid: number;
  balance: number;
  isPayLater: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: any;
  cashier: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
  };
  branch: {
    id: string;
    name: string;
    contactEmail: string;
    phoneNumber: string;
    branchNumber: string;
  };
  store: {
    id: string;
    name: string;
    contactEmail: string;
    businessEmail: string;
    phoneNumber: string;
  };
  sales: SaleItem[];
  payments: PaymentItem[];
}

export interface PaginatedTransactionsResponse {
  total: number;
  pages: number;
  page: number;
  limit: number;
  docs: Transaction[];
}

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
}

export interface SalesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  storeId?: string;
  getAllStores?: boolean;
}

/**
 * Service for handling sales-related API operations
 */
export const salesService = {
  /**
   * Fetch sales transactions with optional filtering
   */
  async getTransactions(params: SalesFilterParams = {}, storeId: string = 'all'): Promise<PaginatedTransactionsResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      startDate,
      endDate,
      getAllStores
    } = params;
    
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (search) {
      queryParams.search = search;
    }
    
    if (startDate) {
      queryParams.startDate = startDate;
    }
    
    if (endDate) {
      queryParams.endDate = endDate;
    }
    
    if (storeId === 'all' || getAllStores) {
      queryParams.getAllStores = 'true';
    }
    
    // Create headers with store ID if filtering by specific store
    const headers: Record<string, string> = {};
    if (storeId !== 'all') {
      headers['S-UUID'] = storeId;
    }
    
    const endpoint = '/sales/shops-transactions';
    const response = await api.get<PaginatedTransactionsResponse>(endpoint, queryParams, headers);
    
    return response.data;
  },
  
  /**
   * Get sales summary stats with caching
   */
  async getSalesStats(storeId: string = 'all'): Promise<SalesStats> {
    // Use a smaller sample to get the total count
    const countParams: SalesFilterParams = {
      limit: 1,
      page: 1,
      getAllStores: storeId === 'all'
    };
    
    const headers: Record<string, string> = {};
    if (storeId !== 'all') {
      headers['S-UUID'] = storeId;
    }
    
    const countResponse = await api.get<PaginatedTransactionsResponse>(
      '/sales/shops-transactions', 
      countParams as any, 
      headers
    );
    
    const totalTransactions = countResponse.data.total;
    
    if (totalTransactions === 0) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        averageTransaction: 0
      };
    }
    
    // Get a sample of transactions to calculate averages and totals
    const sampleSize = Math.min(totalTransactions, storeId === 'all' ? 200 : 100);
    const sampleParams: SalesFilterParams = {
      limit: sampleSize,
      page: 1,
      getAllStores: storeId === 'all'
    };
    
    const sampleResponse = await api.get<PaginatedTransactionsResponse>(
      '/sales/shops-transactions', 
      sampleParams as any, 
      headers
    );
    
    // Filter transactions if needed
    const relevantTransactions = storeId !== 'all'
      ? sampleResponse.data.docs.filter(t => t.store.id === storeId)
      : sampleResponse.data.docs;
    
    if (relevantTransactions.length === 0) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        averageTransaction: 0
      };
    }
    
    // Calculate total and average
    const totalPaid = relevantTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
    const averageTransaction = totalPaid / relevantTransactions.length;
    const estimatedTotalSales = averageTransaction * totalTransactions;
    
    return {
      totalSales: estimatedTotalSales,
      totalTransactions,
      averageTransaction
    };
  }
};

export default salesService; 